import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import useDocStore from '../store/docStore';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'];

export default function History() {
  const { documents, fetchDocuments, loading } = useDocStore();
  const navigate = useNavigate();

  useEffect(() => { fetchDocuments(); }, []);

  const uploadsByDay = useMemo(() => {
    const map = {};
    documents.forEach((doc) => {
      const day = new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count })).slice(-14);
  }, [documents]);

  const byType = useMemo(() => {
    const map = {};
    documents.forEach((doc) => {
      const name = doc.originalName || doc.filename || '';
      const ext = name.split('.').pop()?.toUpperCase() || 'OTHER';
      map[ext] = (map[ext] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [documents]);

  const totalSize = useMemo(() => {
    const bytes = documents.reduce((sum, d) => sum + (d.size || 0), 0);
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [documents]);

  const stats = [
    { label: 'Total Documents', value: documents.length, icon: '📄' },
    { label: 'Storage Used', value: totalSize, icon: '💾' },
    { label: 'This Week', value: documents.filter((d) => new Date(d.createdAt) > new Date(Date.now() - 7 * 86400000)).length, icon: '📅' },
    { label: 'File Types', value: byType.length, icon: '🗂️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
        <h1 className="text-xl font-semibold text-gray-900">History & Analytics</h1>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border p-5">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Upload Activity (Last 14 Days)</h2>
          {uploadsByDay.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No data yet — upload some documents!</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={uploadsByDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">File Type Breakdown</h2>
          {byType.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-700">Recent Uploads</h2>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500">File</th>
                  <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.slice(0, 10).map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700">{doc.originalName || doc.filename || 'Untitled'}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}