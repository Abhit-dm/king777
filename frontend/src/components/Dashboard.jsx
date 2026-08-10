import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateUser from './CreateUser';
import DownlineList from './DownlineList';
import TransferPoints from './TransferPoints';

export default function Dashboard() {
  const navigate = useNavigate();
  // Retrieve the user data we will save during login
  const user = JSON.parse(localStorage.getItem('king777_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('king777_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 px-8 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-black text-amber-500 tracking-widest">
          KING<span className="text-white">777</span> <span className="text-sm text-slate-500 ml-2 font-normal">| PORTAL</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold">{user.username}</p>
            <p className="text-xs text-amber-500 uppercase tracking-wider">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <p className="text-slate-400 text-sm font-medium mb-1">Available Balance</p>
            <p className="text-3xl font-black text-white">
              {Number(user.available_balance || 0).toFixed(2)} <span className="text-amber-500 text-lg">PTS</span>
            </p>
          </div>
          
          {/* Quick Stats Cards (Placeholders for next steps) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
             <p className="text-slate-400 text-sm font-medium mb-1">Active Downlines</p>
             <p className="text-3xl font-black text-white">0</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
             <p className="text-slate-400 text-sm font-medium mb-1">Total Exposure</p>
             <p className="text-3xl font-black text-white">0.00</p>
          </div>
        </div>
        {/* Management Section: Side-by-Side Grid */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
       <div className="lg:col-span-1">
         <CreateUser />
         <TransferPoints />
       </div>
       <div className="lg:col-span-2">
         <DownlineList />
       </div>
     </div>
   </main>
    </div>
  );
}