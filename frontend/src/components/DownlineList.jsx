import React, { useState, useEffect } from 'react';

export default function DownlineList() {
  const [downlines, setDownlines] = useState([]);
  const [error, setError] = useState('');

  const fetchDownlines = async () => {
    const token = localStorage.getItem('king777_token');
    try {
      const response = await fetch('https://api.king777.uk/api/users/downline', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to load downlines');
      setDownlines(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch data when the component loads
  useEffect(() => {
    fetchDownlines();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-amber-500 uppercase tracking-wide">Active Downlines</h2>
        <button 
          onClick={fetchDownlines}
          className="text-slate-400 hover:text-amber-500 transition-colors text-sm font-medium"
        >
          ↻ Refresh List
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">ID</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right rounded-tr-lg">Balance</th>
            </tr>
          </thead>
          <tbody>
            {downlines.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No downlines found. Create one to get started.</td>
              </tr>
            ) : (
              downlines.map((user) => (
                <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 font-medium">#{user.id}</td>
                  <td className="px-4 py-4 text-white font-bold">{user.username}</td>
                  <td className="px-4 py-4">
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded text-xs tracking-wider">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-white">
                    {Number(user.available_balance).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}