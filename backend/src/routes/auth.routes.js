// Authentication Routes
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
    refreshToken
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
