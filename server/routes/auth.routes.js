const express = require('express');
const router = express.Router();
const { login, logout, refresh, changePassword } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.patch('/change-password', protect, changePassword);

module.exports = router;
