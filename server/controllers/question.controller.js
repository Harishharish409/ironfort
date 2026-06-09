const Question = require('../models/Question');

// @desc    Ask a question
// @route   POST /api/questions
// @access  Member/Trainer
const askQuestion = async (req, res) => {
  try {
    const { question, category } = req.body;

    const newQuestion = await Question.create({
      askedBy: req.user._id,
      question,
      category: category || 'general',
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all questions (admin/trainer)
// @route   GET /api/questions
// @access  Admin/Trainer
const getAllQuestions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const questions = await Question.find(query)
      .populate('askedBy', 'username role')
      .populate('answeredBy', 'username')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my questions
// @route   GET /api/questions/me
// @access  Member/Trainer
const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ askedBy: req.user._id })
      .populate('answeredBy', 'username')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Answer a question
// @route   PATCH /api/questions/:id/answer
// @access  Admin/Trainer
const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        answer,
        answeredBy: req.user._id,
        answeredAt: new Date(),
        status: 'answered',
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  askQuestion,
  getAllQuestions,
  getMyQuestions,
  answerQuestion,
};
