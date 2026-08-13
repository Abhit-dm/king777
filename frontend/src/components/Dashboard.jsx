import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateUser from './CreateUser';
import DownlineList from './DownlineList';
import TransferPoints from './TransferPoints';
import GenerateTokens from './GenerateTokens';
import Reports from './Reports';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('king777_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('king777_user');
    localStorage.removeItem('king777_token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <h1 className="text-2xl font-black text-amber-500 tracking-widest">
          KING<span className="text-white">777</span> <span className="text-sm text-slate-500 ml-2 font-normal hidden md:inline">| SECURE PORTAL</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{user.username}</p>
            <p className="text-xs text-amber-500 uppercase tracking-wider font-bold">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Main Content Dashboard */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto mt-2">
        
        {/* Row 1: Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <p className="text-slate-400 text-sm font-medium mb-1">Available Master Balance</p>
            <p className="text-3xl font-black text-white">
              {Number(user.available_balance || 0).toFixed(2)} <span className="text-amber-500 text-lg">PTS</span>
            </p>
          </div>
        </div>

        {/* Row 2: Management Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column: Financial Actions */}
          <div className="lg:col-span-1 space-y-6">
            <GenerateTokens />
            <TransferPoints />
          </div>
          
          {/* Right Column: User Management */}
          <div className="lg:col-span-2 space-y-6">
            <CreateUser />
            <DownlineList />
          </div>
        </div>

        {/* Row 3: Audit Ledger */}
        <div className="mt-6">
          <Reports />
        </div>

      </main>
    </div>
  );
}