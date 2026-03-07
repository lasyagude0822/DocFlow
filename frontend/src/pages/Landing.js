import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4">
        <h1 className="text-white text-2xl font-bold">DocFlow</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-white border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-blue-900 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="text-5xl font-bold text-white mb-6">
          Your AI Powered<br />Document Intelligence Platform
        </h2>
        <p className="text-blue-200 text-xl mb-10 max-w-2xl">
          Upload, compress, merge, split, and chat with your documents using AI.
          All in one place. Completely free.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="bg-white text-blue-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-100 transition"
        >
          Start for Free
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-16 max-w-6xl mx-auto">
        {[
          { title: 'PDF Operations', desc: 'Compress, merge, split, convert and password protect your PDFs instantly', icon: '📄' },
          { title: 'AI Summarizer', desc: 'Get instant summaries, extract entities, and detect document types with AI', icon: '🤖' },
          { title: 'Chat with Docs', desc: 'Ask questions about your documents and get instant intelligent answers', icon: '💬' },
          { title: 'OCR Support', desc: 'Extract text from scanned PDFs and images automatically', icon: '🔍' },
          { title: 'Translation', desc: 'Translate your documents to any language instantly', icon: '🌍' },
          { title: 'Compare Docs', desc: 'Compare two documents and highlight key differences automatically', icon: '⚖️' },
        ].map((feature, i) => (
          <div key={i} className="bg-white bg-opacity-10 rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-blue-200">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;