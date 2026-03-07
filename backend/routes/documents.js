const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const {
  uploadDocument,
  getDocuments,
  deleteDocument
} = require('../controllers/documentController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', auth, upload.single('file'), uploadDocument);
router.get('/', auth, getDocuments);
router.delete('/:id', auth, deleteDocument);

module.exports = router;