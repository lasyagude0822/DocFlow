import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import useDocStore from '../store/docStore';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [results, setResults] = useState({});
  const { uploadDocument, uploading, error, clearError } = useDocStore();
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    clearError();
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, [clearError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
  });

  const handleUpload = async () => {
    console.log('Upload clicked, files:', files);
    console.log('Token:', localStorage.getItem('token'));

    if (files.length === 0) return;

    for (const file of files) {
      if (results[file.name]?.success) continue;
      setResults((r) => ({ ...r, [file.name]: { success: false, uploading: true } }));
      const doc = await uploadDocument(file, (pct) => {
        setProgress((p) => ({ ...p, [file.name]: pct }));
      });
      setResults((r) => ({
        ...r,
        [file.name]: { success: !!doc, uploading: false, error: !doc },
      }));
    }
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setProgress((p) => { const n = { ...p }; delete n[name]; return n; });
    setResults((r) => { const n = { ...r }; delete n[name]; return n; });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const allDone = files.length > 0 && files.every((f) => results[f.name]?.success);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Upload Documents</h1>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* ✅ Global error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-600 text-lg">✕</button>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">📂</div>
          {isDragActive ? (
            <p className="text-blue-600 text-lg font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-gray-700 text-lg font-medium">Drag & drop files here</p>
              <p className="text-gray-400 mt-1">or click to browse</p>
              <p className="text-gray-400 text-sm mt-3">Supports PDF, DOCX, PNG, JPG</p>
            </>
          )}
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
            <h2 className="font-semibold text-gray-700">Files ({files.length})</h2>
            {files.map((file) => (
              <div key={file.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>

                  {/* Progress bar */}
                  {progress[file.name] !== undefined && progress[file.name] < 100 && (
                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${progress[file.name]}%` }}
                      />
                    </div>
                  )}

                  {/* Status */}
                  {results[file.name]?.success && (
                    <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                  )}
                  {results[file.name]?.error && (
                    <span className="text-xs text-red-500 font-medium">✕ Failed — check console</span>
                  )}
                </div>

                {/* Remove button (only if not yet uploaded) */}
                {!results[file.name]?.success && (
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none"
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpload}
                disabled={uploading || allDone}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {uploading ? 'Uploading...' : allDone ? 'All Uploaded ✓' : 'Upload All'}
              </button>
              {Object.values(results).some((r) => r.success) && (
                <button
                  onClick={() => navigate('/documents')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  View Documents →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}