const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
  },
  url: {
    type: String,
    required: true
  },
  storagePath: {
    type: String,
  },
  operation: {
    type: String,
    enum: ['upload', 'compress', 'merge', 'split', 'convert', 'password-protect', 'ocr', 'summarize', 'chat', 'translate', 'compare', 'entity-extraction', 'type-detection'],
    default: 'upload'
  },
  chatHistory: [
    {
      question: String,
      answer: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000)
  }
});

module.exports = mongoose.model('Document', documentSchema);