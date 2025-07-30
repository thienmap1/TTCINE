const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/users/:id', requireAuth, requireAdmin, getUserById);
router.put('/users/:id', requireAuth, requireAdmin, updateUser);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);


module.exports = router;
