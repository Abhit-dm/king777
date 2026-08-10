import React, { useState } from 'react';

export default function CreateUser() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Default to creating an ADMIN since the Super Admin is logged in
  const [role, setRole] = useState('ADMIN'); 
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('king777_token');

    try {
      const response = await fetch('https://api.king777.uk/api/users/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Passing the JWT token securely
        },
        body: JSON.stringify({ username, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setMessage({ type: 'success', text: `Successfully created ${role}: ${username}` });
      setUsername('');
      setPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mt-6">
      <h2 className="text-xl font-bold text-amber-500 mb-4 uppercase tracking-wide">Create Downline Account</h2>
      
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-4 max-w-md">
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="ADMIN">ADMIN</option>
            {/* Later, we will dynamically show options based on who is logged in */}
          </select>
        </div>

        <button 
          type="submit" 
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-6 rounded-lg transition-colors uppercase text-sm tracking-wide"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}