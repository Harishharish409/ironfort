const express = require('express');
const router = express.Router();
const {
  getChatUsers,
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  markChatAsRead,
} = require('../controllers/chat.controller');
const protect = require('../middleware/auth.middleware');

router.get('/users', protect, getChatUsers);
router.post('/', protect, getOrCreateChat);
router.get('/', protect, getUserChats);
router.get('/:chatId/messages', protect, getChatMessages);
router.patch('/:chatId/read', protect, markChatAsRead);

module.exports = router;
