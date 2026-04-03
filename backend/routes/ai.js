const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// Ensure these names match the "exports.name" in your controller
const {
  summarize,
  extractEntities,
  detectType,
  translate,
  chat,
  detectFraud
} = require('../controllers/aiController');

router.post('/:id/summarize', auth, summarize);
router.post('/:id/entities', auth, extractEntities);
router.post('/:id/detect-type', auth, detectType);
router.post('/:id/translate', auth, translate);
router.post('/:id/chat', auth, chat);
router.post('/:id/fraud', auth, detectFraud);

module.exports = router;