import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const role = await login(email, password);
    if (role === 'admin') navigate('/admin');
    else if (role === 'user') navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: Math.random()*80+20, height: Math.random()*80+20, top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, opacity: Math.random()*0.5 }} />
          ))}
        </div>
        <div className="relative text-white text-center">
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-4xl font-bold mb-4">DocFlow</h2>
          <p className="text-blue-100 text-lg max-w-sm">AI-powered document intelligence. Upload, analyze, and chat with your documents.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {['📄 Smart Upload', '🤖 AI Summary', '💬 Doc Chat', '🌍 Translate'].map(f => (
              <div key={f} className="bg-white bg-opacity-20 rounded-xl px-4 py-3 backdrop-blur">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">Sign in to continue to DocFlow</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="font-bold">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl transition text-lg shadow-lg shadow-blue-200">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Create one free</Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
            Admin? Use your admin credentials to access the admin panel.
          </div>
        </div>
      </div>
    </div>
  );
}