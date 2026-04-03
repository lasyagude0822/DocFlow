const Document = require('../models/Document');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `${req.userId}_${Date.now()}_${file.originalname}`;

    // Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(file.path);
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
      });

    if (error) {
      fs.unlinkSync(file.path); // clean up temp file even on error
      return res.status(500).json({ message: 'Supabase upload failed', error: error.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Save metadata to MongoDB
    const document = new Document({
      userId: req.userId,
      originalName: file.originalname,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: urlData.publicUrl,
      storagePath: fileName,
    });

    await document.save();

    // Delete temp file
    fs.unlinkSync(file.path);

    res.status(201).json({
      message: 'File uploaded successfully',
      document,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all documents for user
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ FIX: Delete from Supabase storage too, not just MongoDB
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from Supabase storage
    if (document.storagePath) {
      const { error } = await supabase.storage
        .from('documents')
        .remove([document.storagePath]);
      if (error) console.error('Supabase delete error:', error.message);
    }

    // Delete from MongoDB
    await document.deleteOne();

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};