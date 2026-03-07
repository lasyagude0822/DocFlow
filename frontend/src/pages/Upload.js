import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import useDocStore from '../store/docStore';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [results, setResults] = useState({});
  const { uploadDocument, uploading } = useDocStore();
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const handleUpload = async () => {
    for (const file of files) {
      if (results[file.name]?.success) continue;
      const doc = await uploadDocument(file, (pct) => {
        setProgress((p) => ({ ...p, [file.name]: pct }));
      });
      setResults((r) => ({ ...r, [file.name]: { success: !!doc } }));
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
        <h1 className="text-xl font-semibold text-gray-900">Upload Documents</h1>
      </div>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
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
                  {progress[file.name] !== undefined && progress[file.name] < 100 && (
                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress[file.name]}%` }} />
                    </div>
                  )}
                  {results[file.name]?.success && <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>}
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </button>
              {Object.values(results).some((r) => r.success) && (
                <button onClick={() => navigate('/documents')} className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-lg">
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