import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocStore from '../store/docStore';

export default function Documents() {
  const { documents, fetchDocuments, deleteDocument, loading } = useDocStore();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchDocuments(); }, []);

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-xl font-semibold text-gray-900">My Documents</h1>
        </div>
        <button onClick={() => navigate('/upload')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Upload New
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No documents yet</p>
            <button onClick={() => navigate('/upload')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Uploaded</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <p className="text-sm font-medium text-gray-800">{doc.originalName || doc.filename || 'Untitled'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatSize(doc.size)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(doc.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</a>
                        )}
                        <button onClick={() => navigate('/ai', { state: { doc } })} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                          AI ✨
                        </button>
                        {deleteConfirm === doc._id ? (
                          <div className="flex gap-2">
                            <button onClick={() => { deleteDocument(doc._id); setDeleteConfirm(null); }} className="text-red-600 text-sm font-medium">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 text-sm">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(doc._id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}