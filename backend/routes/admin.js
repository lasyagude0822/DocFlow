const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStats, getUsers, toggleUser, deleteUser } = require('../controllers/adminController');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.get('/stats', auth, adminOnly, getStats);
router.get('/users', auth, adminOnly, getUsers);
router.patch('/users/:id/toggle', auth, adminOnly, toggleUser);
router.delete('/users/:id', auth, adminOnly, deleteUser);

module.exports = router;