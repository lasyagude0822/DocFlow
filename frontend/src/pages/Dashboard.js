import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Upload', icon: '📤', path: '/upload' },
    { label: 'My Documents', icon: '📁', path: '/documents' },
    { label: 'AI Features', icon: '🤖', path: '/ai' },
    { label: 'History', icon: '📊', path: '/history' },
  ];

  const cards = [
    { title: 'Upload Document', desc: 'Upload a new PDF or document', icon: '📤', color: 'bg-blue-500', path: '/upload' },
    { title: 'My Documents', desc: 'View and manage your files', icon: '📁', color: 'bg-indigo-500', path: '/documents' },
    { title: 'AI Summarize', desc: 'Get AI summary of your document', icon: '🤖', color: 'bg-purple-500', path: '/ai' },
    { title: 'Chat with Doc', desc: 'Ask questions about your document', icon: '💬', color: 'bg-green-500', path: '/ai' },
    { title: 'Translate', desc: 'Translate document to any language', icon: '🌍', color: 'bg-yellow-500', path: '/ai' },
    { title: 'History', desc: 'View your analytics dashboard', icon: '📊', color: 'bg-red-500', path: '/history' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-2xl font-bold">DocFlow</h1>
          <p className="text-blue-300 text-sm mt-1">{user?.name || user?.email || 'User'}</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition text-left"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h2>
        <p className="text-gray-500 mb-8">What would you like to do today?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{card.title}</h3>
              <p className="text-gray-500 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}