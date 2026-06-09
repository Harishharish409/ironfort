const express = require('express');
const router = express.Router();
const {
  askQuestion,
  getAllQuestions,
  getMyQuestions,
  answerQuestion,
} = require('../controllers/question.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('member', 'trainer'), askQuestion);
router.get('/', protect, authorize('admin', 'trainer'), getAllQuestions);
router.get('/me', protect, authorize('member', 'trainer'), getMyQuestions);
router.patch('/:id/answer', protect, authorize('admin', 'trainer'), answerQuestion);

module.exports = router;
