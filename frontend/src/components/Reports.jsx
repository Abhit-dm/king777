import React, { useState, useEffect } from 'react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem('king777_token');
    
    // Construct query parameters for the custom date/type filters
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);

    try {
      const response = await fetch(`https://api.king777.uk/api/transactions/reports?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setReports(data);
      } else {
        console.error(data.error || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch the latest ledger data when the dashboard loads
  useEffect(() => {
    fetchReports();
  }, []);

  const downloadCSV = () => {
    if (reports.length === 0) return;
    
    // 1. Define CSV Headers
    const headers = ['Transaction ID', 'Date', 'Type', 'Sender', 'Receiver', 'Amount (PTS)'];
    
    // 2. Map the secure JSON data into rows
    const rows = reports.map(r => [
      r.id,
      new Date(r.created_at).toLocaleString(),
      r.type,
      r.sender || 'SYSTEM',
      r.receiver || 'SYSTEM',
      r.amount
    ]);

    // 3. Build the CSV string safely with quotes to prevent comma injection
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n');

    // 4. Trigger the browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `King777_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); // Required for Firefox compatibility
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-amber-500 uppercase tracking-wide">Audit Ledger</h2>
        
        {/* Filtering Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
          />
          <span className="text-slate-500">to</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
          />
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">All Types</option>
            <option value="GENERATE">Tokens Generated</option>
            <option value="TRANSFER">Transfers</option>
          </select>
          
          <button 
            onClick={fetchReports}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded text-sm transition-colors"
          >
            Filter
          </button>
          
          <button 
            onClick={downloadCSV}
            disabled={reports.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm transition-colors font-medium ml-auto"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">ID</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Routing</th>
              <th className="px-4 py-3 text-right rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-amber-500">Loading ledger data...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No transactions found for this period.</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-400">#{r.id}</td>
                  <td className="px-4 py-4">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${r.type === 'GENERATE' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {r.type === 'GENERATE' ? `SYSTEM → ${r.receiver}` : `${r.sender} → ${r.receiver}`}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-white">
                    {Number(r.amount).toFixed(2)}
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