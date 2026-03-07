import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const AI_FEATURES = [
  { id: 'summarize', label: 'Summarize', icon: '📝', desc: 'Get a concise summary' },
  { id: 'entities', label: 'Extract Entities', icon: '🔍', desc: 'Find names, dates, orgs' },
  { id: 'detect-type', label: 'Detect Type', icon: '🏷️', desc: 'Identify document category' },
  { id: 'translate', label: 'Translate', icon: '🌐', desc: 'Translate to another language' },
  { id: 'chat', label: 'Chat with Doc', icon: '💬', desc: 'Ask questions about your doc' },
];

export default function AIFeatures() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDoc, setSelectedDoc] = useState(location.state?.doc || null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [translateLang, setTranslateLang] = useState('Spanish');

  const runFeature = async (featureId) => {
    if (!selectedDoc) { setError('Please select a document first'); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res;
      if (featureId === 'chat') {
        res = await axios.post(`${API}/documents/${selectedDoc._id}/chat`, { question: chatInput });
      } else if (featureId === 'translate') {
        res = await axios.post(`${API}/documents/${selectedDoc._id}/translate`, { targetLanguage: translateLang });
      } else {
        res = await axios.post(`${API}/documents/${selectedDoc._id}/${featureId}`);
      }
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI feature failed. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
        <h1 className="text-xl font-semibold text-gray-900">AI Features ✨</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {!selectedDoc ? (
          <div className="bg-white rounded-2xl border p-6 text-center">
            <p className="text-gray-500 mb-3">No document selected.</p>
            <button onClick={() => navigate('/documents')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Select from Documents
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{selectedDoc.originalName || selectedDoc.filename}</p>
              <p className="text-xs text-gray-400">Selected document</p>
            </div>
            <button onClick={() => navigate('/documents')} className="text-blue-600 text-sm hover:underline">Change</button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AI_FEATURES.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-800">{f.label}</h3>
              <p className="text-xs text-gray-400 mt-1 mb-3">{f.desc}</p>

              {f.id === 'translate' && (
                <select
                  value={translateLang}
                  onChange={(e) => setTranslateLang(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm mb-2 outline-none"
                >
                  {['Spanish','French','German','Hindi','Japanese','Chinese','Arabic','Portuguese'].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              )}

              {f.id === 'chat' && (
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full border rounded-lg px-2 py-1.5 text-sm mb-2 outline-none"
                />
              )}

              <button
                onClick={() => { setActiveFeature(f.id); runFeature(f.id); }}
                disabled={loading && activeFeature === f.id}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium py-1.5 rounded-lg transition"
              >
                {loading && activeFeature === f.id ? 'Processing...' : `Run ${f.label}`}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        )}

        {result && (
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Result</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}