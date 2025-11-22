const express = require('express');
const { getUsers, getMessages, deleteMessage, deleteConversation } = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/users', authMiddleware, getUsers);
router.get('/messages/:id', authMiddleware, getMessages);

// New Delete Routes
router.delete('/message/:messageId', authMiddleware, deleteMessage);
router.delete('/conversation/:id', authMiddleware, deleteConversation);

module.exports = router;