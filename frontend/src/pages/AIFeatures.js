import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useDocStore from '../store/docStore';

// Note: Ensure your server.js uses app.use('/api/ai', aiRoutes)
const API = 'http://localhost:5000/api/ai'; 

const FEATURES = [
  { id: 'summarize', label: 'Summarize', icon: '📝', desc: 'Get key points instantly', color: 'blue' },
  { id: 'entities', label: 'Extract Entities', icon: '🔍', desc: 'Find names, dates, orgs', color: 'purple' },
  { id: 'detect-type', label: 'Detect Type', icon: '🏷️', desc: 'Identify document category', color: 'green' },
  { id: 'translate', label: 'Translate', icon: '🌐', desc: 'Convert to any language', color: 'yellow' },
  { id: 'chat', label: 'Chat with Doc', icon: '💬', desc: 'Ask anything about it', color: 'indigo' },
  { id: 'fraud', label: 'Fraud Detection', icon: '🛡️', desc: 'Check for tampering', color: 'red' },
];

const COLORS = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  red: 'bg-red-50 text-red-700 border-red-200',
};

export default function AIFeatures() {
  const navigate = useNavigate();
  const location = useLocation();
  const { documents, fetchDocuments } = useDocStore();
  const [selectedDoc, setSelectedDoc] = useState(location.state?.doc || null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [translateLang, setTranslateLang] = useState('Spanish');
  const [showDocPicker, setShowDocPicker] = useState(false);

  useEffect(() => { fetchDocuments(); }, []);

  const runFeature = async (featureId) => {
    if (!selectedDoc) { setError('Please select a document first'); return; }
    
    // Check for chat input before starting
    if (featureId === 'chat' && !chatInput.trim()) return;

    setActiveFeature(featureId);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      // Headers for authentication
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };

      if (featureId === 'chat') {
        res = await axios.post(`${API}/${selectedDoc._id}/chat`, { question: chatInput }, config);
        setChatHistory(h => [...h, { q: chatInput, a: res.data.answer }]);
        setChatInput('');
      } else if (featureId === 'translate') {
        res = await axios.post(`${API}/${selectedDoc._id}/translate`, { targetLanguage: translateLang }, config);
        setResult(res.data);
      } else if (featureId === 'fraud') {
        // Match the route name in your ai.js
        res = await axios.post(`${API}/${selectedDoc._id}/fraud`, {}, config);
        setResult(res.data);
      } else if (featureId === 'detect-type') {
        res = await axios.post(`${API}/${selectedDoc._id}/detect-type`, {}, config);
        setResult(res.data);
      } else {
        // summarize and entities
        res = await axios.post(`${API}/${selectedDoc._id}/${featureId}`, {}, config);
        setResult(res.data);
      }
    } catch (err) {
      console.error("Feature Error:", err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'AI Feature failed. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const formatResult = (data) => {
    if (!data) return '';
    if (data.summary) return data.summary;
    if (data.translation) return `Translated to ${data.targetLanguage}:\n\n${data.translation}`;
    if (data.detection) return data.detection;
    if (data.fraudAnalysis) return data.fraudAnalysis;
    if (data.entities) return typeof data.entities === 'string' ? data.entities : JSON.stringify(data.entities, null, 2);
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 transition">← Back</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Features</h1>
            <p className="text-xs text-gray-400">Powered by Google Gemini</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Document Selector */}
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedDoc ? (
                <>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">📄</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedDoc.originalName || selectedDoc.filename}</p>
                    <p className="text-xs text-gray-400">Selected document</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">📂</div>
                  <div>
                    <p className="font-semibold text-gray-600 text-sm">No document selected</p>
                    <p className="text-xs text-gray-400">Pick a document to use AI features</p>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setShowDocPicker(!showDocPicker)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              {selectedDoc ? 'Change' : 'Select Document'}
            </button>
          </div>

          {showDocPicker && (
            <div className="mt-4 border-t pt-4 space-y-2 max-h-48 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No documents yet. <button onClick={() => navigate('/upload')} className="text-blue-600 hover:underline">Upload one</button>
                </div>
              ) : (
                documents.map(doc => (
                  <button key={doc._id} onClick={() => { setSelectedDoc(doc); setShowDocPicker(false); setResult(null); setChatHistory([]); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition hover:bg-gray-50 ${selectedDoc?._id === doc._id ? 'bg-blue-50 border border-blue-200' : ''}`}>
                    <span className="text-lg">📄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{doc.originalName || doc.filename}</p>
                      <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.id} className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition ${activeFeature === f.id ? 'border-blue-400 shadow-md' : 'border-gray-100'}`}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-gray-800 text-sm">{f.label}</h3>
              <p className="text-xs text-gray-400 mt-1 mb-3">{f.desc}</p>

              {f.id === 'translate' && (
                <select value={translateLang} onChange={(e) => setTranslateLang(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-xs mb-2 outline-none focus:ring-1 focus:ring-blue-500">
                  {['Spanish','French','German','Hindi','Japanese','Chinese','Arabic','Portuguese','Italian','Korean'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              )}

              {f.id === 'chat' && (
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runFeature('chat')}
                  placeholder="Type your question..."
                  className="w-full border rounded-lg px-2 py-1.5 text-xs mb-2 outline-none focus:ring-1 focus:ring-blue-500" />
              )}

              <button onClick={() => runFeature(f.id)}
                disabled={loading}
                className={`w-full py-2 rounded-xl text-xs font-bold transition border ${COLORS[f.color]} hover:opacity-80 disabled:opacity-40`}>
                {loading && activeFeature === f.id ? '⏳ Processing...' : `Run ${f.label}`}
              </button>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="font-bold text-lg">×</button>
          </div>
        )}

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-800">💬 Chat History</h2>
              <button onClick={() => setChatHistory([])} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
            </div>
            <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
              {chatHistory.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-sm text-sm max-w-md">{item.q}</div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm text-sm max-w-md">{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">✨ Result</h2>
              <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
            </div>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 font-sans">
              {formatResult(result)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}