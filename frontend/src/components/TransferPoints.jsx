import React, { useState, useEffect } from 'react';

export default function TransferPoints() {
  const [downlines, setDownlines] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch downlines to populate the dropdown
    const fetchDownlines = async () => {
      const token = localStorage.getItem('king777_token');
      try {
        const response = await fetch('https://api.king777.uk/api/users/downline', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDownlines(data);
          if (data.length > 0) setTargetUserId(data[0].id);
        }
      } catch (err) {
        console.error("Could not load downlines for transfer");
      }
    };
    fetchDownlines();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    const token = localStorage.getItem('king777_token');

    try {
      const response = await fetch('https://api.king777.uk/api/users/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, amount, transactionPassword })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Transfer failed');

      setMessage({ type: 'success', text: `Successfully transferred ${amount} PTS!` });
      setAmount('');
      setTransactionPassword('');
      
      // Force page reload to instantly update all balances across the dashboard
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mt-6">
      <h2 className="text-xl font-bold text-amber-500 mb-4 uppercase tracking-wide">Transfer Points</h2>
      
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleTransfer} className="space-y-4 max-w-md">
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">Select Agent</label>
          <select 
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            required
          >
            {downlines.length === 0 ? <option value="">No agents available</option> : null}
            {downlines.map(user => (
              <option key={user.id} value={user.id}>{user.username} (Bal: {user.available_balance})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">Amount (PTS)</label>
          <input 
            type="number" 
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">Transaction Password</label>
          <input 
            type="password" 
            value={transactionPassword}
            onChange={(e) => setTransactionPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || downlines.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg transition-colors uppercase text-sm tracking-wide disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Send Points'}
        </button>
      </form>
    </div>
  );
}