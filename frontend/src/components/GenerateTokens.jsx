import React, { useState } from 'react';

export default function GenerateTokens() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Check role to ensure only SUPER_ADMIN sees this component
  const user = JSON.parse(localStorage.getItem('king777_user') || '{}');
  if (user.role !== 'SUPER_ADMIN') return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    const token = localStorage.getItem('king777_token');

    try {
      const response = await fetch('https://api.king777.uk/api/transactions/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tokens');
      }

      setMessage({ type: 'success', text: data.message });
      setAmount('');
      
      // Refresh to update dashboard balances instantly across the UI
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mt-6">
      <h2 className="text-xl font-bold text-amber-500 mb-4 uppercase tracking-wide">Mint New Tokens</h2>
      
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4 max-w-md">
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">Amount to Generate (PTS)</label>
          <input 
            type="number" 
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            placeholder="e.g. 10000"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-6 rounded-lg transition-colors uppercase text-sm tracking-wide disabled:opacity-50"
        >
          {loading ? 'Minting...' : 'Generate Tokens'}
        </button>
      </form>
    </div>
  );
}