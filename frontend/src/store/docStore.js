import { create } from 'zustand';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const useDocStore = create((set) => ({
  documents: [],
  loading: false,
  uploading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API}/documents`);
      set({ documents: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch', loading: false });
    }
  },

  uploadDocument: async (file, onProgress) => {
    set({ uploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      set((state) => ({ documents: [res.data, ...state.documents], uploading: false }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Upload failed', uploading: false });
      return null;
    }
  },

  deleteDocument: async (id) => {
    try {
      await axios.delete(`${API}/documents/${id}`);
      set((state) => ({ documents: state.documents.filter((d) => d._id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Delete failed' });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDocStore;