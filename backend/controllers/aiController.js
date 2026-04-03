const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');
const axios = require('axios');
const pdf = require('pdf-parse'); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to fetch and extract text
async function fetchDocumentText(doc) {
  try {
    const response = await axios.get(doc.url, { responseType: 'arraybuffer', timeout: 15000 });
    const buffer = Buffer.from(response.data);

    if (doc.mimeType === 'application/pdf') {
      const data = await pdf(buffer); // Fixed: calling pdf-parse correctly
      return data.text.substring(0, 10000); 
    }
    return buffer.toString('utf-8').substring(0, 10000);
  } catch (err) {
    console.error('fetchDocumentText error:', err.message);
    return '';
  }
}

// Helper to run Gemini
async function runGemini(prompt) {
  try {
    // Standardizing model name to avoid 404
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    throw new Error(err.message);
  }
}

exports.summarize = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const text = await fetchDocumentText(doc);
    const summary = await runGemini(`Summarize this in 5 bullet points:\n\n${text}`);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: 'Summarization failed', error: err.message });
  }
};

exports.extractEntities = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    const text = await fetchDocumentText(doc);
    const result = await runGemini(`Extract PERSON, ORGANIZATION, LOCATION from this text. Return JSON:\n\n${text}`);
    const cleanJson = result.replace(/```json|```/g, '').trim();
    res.json({ entities: JSON.parse(cleanJson) });
  } catch (err) {
    res.status(500).json({ message: 'Extraction failed', error: err.message });
  }
};

exports.detectType = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    const text = await fetchDocumentText(doc);
    const result = await runGemini(`Identify if this is an Invoice, Resume, Contract, or Report:\n\n${text}`);
    res.json({ detection: result });
  } catch (err) {
    res.status(500).json({ message: 'Detection failed', error: err.message });
  }
};

exports.translate = async (req, res) => {
  try {
    const { targetLanguage = 'Spanish' } = req.body;
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    const text = await fetchDocumentText(doc);
    const result = await runGemini(`Translate this to ${targetLanguage}:\n\n${text}`);
    res.json({ translation: result, targetLanguage });
  } catch (err) {
    res.status(500).json({ message: 'Translation failed', error: err.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { question } = req.body;
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    const text = await fetchDocumentText(doc);
    const answer = await runGemini(`Context: ${text}\n\nQuestion: ${question}`);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: 'Chat failed', error: err.message });
  }
};

exports.detectFraud = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    const text = await fetchDocumentText(doc);
    const result = await runGemini(`Analyze this for fraud or tampering:\n\n${text}`);
    res.json({ fraudAnalysis: result });
  } catch (err) {
    res.status(500).json({ message: 'Fraud check failed', error: err.message });
  }
};