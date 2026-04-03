import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hi Admin! I can help you understand your platform analytics. Ask me anything about users, uploads, or activity!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleToggleUser = async (id) => {
    await axios.patch(`${API}/admin/users/${id}/toggle`);
    fetchUsers();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`${API}/admin/users/${id}`);
    fetchUsers();
    fetchStats();
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatInput('');
    setChatHistory(h => [...h, { role: 'user', text: question }]);
    setChatLoading(true);

    // Build context from stats
    const context = stats ? `
      Platform Stats:
      - Total Users: ${stats.totalUsers}
      - Total Documents: ${stats.totalDocs}
      - New Users Today: ${stats.newUsersToday}
      - Uploads Today: ${stats.uploadsToday}
      - New Users This Week: ${stats.newUsersThisWeek}
      - Most Active Users: ${stats.mostActiveUsers?.map(u => `${u.name} (${u.docCount} docs)`).join(', ')}
    ` : 'No stats available yet.';

    try {
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: `You are an AI assistant for DocFlow admin panel. Here is the current platform data:\n${context}\n\nAdmin question: ${question}\n\nGive a concise, helpful answer.` }]
      }, { headers: { 'Content-Type': 'application/json' } });
      const answer = res.data?.content?.[0]?.text || 'I could not process that.';
      setChatHistory(h => [...h, { role: 'assistant', text: answer }]);
    } catch {
      // Fallback smart responses based on keywords
      let answer = "I don't have enough data to answer that yet.";
      const q = question.toLowerCase();
      if (q.includes('user') && q.includes('total')) answer = `You have ${stats?.totalUsers || 0} total users on the platform.`;
      else if (q.includes('upload') || q.includes('document')) answer = `There are ${stats?.totalDocs || 0} total documents uploaded. Today's uploads: ${stats?.uploadsToday || 0}.`;
      else if (q.includes('active')) answer = `Most active users: ${stats?.mostActiveUsers?.map(u => `${u.name} (${u.docCount} docs)`).join(', ') || 'No data yet'}.`;
      else if (q.includes('today')) answer = `Today: ${stats?.newUsersToday || 0} new users and ${stats?.uploadsToday || 0} document uploads.`;
      else if (q.includes('week')) answer = `This week: ${stats?.newUsersThisWeek || 0} new users joined the platform.`;
      setChatHistory(h => [...h, { role: 'assistant', text: answer }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-600', change: `+${stats.newUsersThisWeek} this week` },
    { label: 'Total Documents', value: stats.totalDocs, icon: '📄', color: 'bg-purple-50 text-purple-600', change: `+${stats.uploadsToday} today` },
    { label: 'New Today', value: stats.newUsersToday, icon: '✨', color: 'bg-green-50 text-green-600', change: 'new signups' },
    { label: 'Uploads Today', value: stats.uploadsToday, icon: '📤', color: 'bg-orange-50 text-orange-600', change: 'documents' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">D</div>
            <div>
              <h1 className="font-bold text-gray-900">DocFlow</h1>
              <p className="text-xs text-blue-600 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'assistant', label: 'AI Assistant', icon: '🤖' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition font-medium ${
                activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">A</div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl text-sm font-medium transition">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
                <p className="text-gray-500 mt-1">Monitor your DocFlow platform activity</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {statCards.map(card => (
                  <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border">
                    <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-xl mb-3`}>
                      {card.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                    <div className="text-sm font-medium text-gray-600 mt-1">{card.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{card.change}</div>
                  </div>
                ))}
              </div>

              {/* Upload Activity Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">Upload Activity (Last 7 Days)</h3>
                {stats?.uploadActivity?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stats.uploadActivity}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#grad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10 text-gray-400">No upload activity yet</div>
                )}
              </div>

              {/* Most Active Users */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">Most Active Users</h3>
                {stats?.mostActiveUsers?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.mostActiveUsers.map((u, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          {u.docCount} docs
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">No activity yet</div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                  <p className="text-gray-500 mt-1">{users.length} registered users</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleToggleUser(u._id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${u.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                              {u.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => handleDeleteUser(u._id)}
                              className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-400">No users yet</div>
                )}
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'assistant' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
                <p className="text-gray-500 mt-1">Ask anything about your platform analytics</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col" style={{ height: '60vh' }}>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChat} className="border-t p-4 flex gap-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about users, uploads, activity..."
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
                  />
                  <button type="submit" disabled={chatLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50">
                    Send
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['How many users signed up today?', 'Who are the most active users?', 'How many documents were uploaded this week?', 'What is the total storage usage?'].map(q => (
                  <button key={q} onClick={() => setChatInput(q)}
                    className="text-left bg-white border hover:border-blue-300 rounded-xl px-4 py-3 text-sm text-gray-600 hover:text-blue-600 transition">
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}