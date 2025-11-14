const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, updateProfile, getProfile, makeAdmin, makeDriver, makeUser, deleteAccount, getDrivers, updateDriverAvailability } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// Update profile
router.put('/profile', authenticateToken, updateProfile);

// Get profile
router.get('/profile', authenticateToken, getProfile);

// Make admin
router.put('/make-admin/:email', authenticateToken, makeAdmin);

// Make driver
router.put('/make-driver', authenticateToken, makeDriver);

// Make user
router.put('/make-user/:email', authenticateToken, makeUser);

// Delete account
router.delete('/delete-account', authenticateToken, deleteAccount);

// Get all drivers
router.get('/drivers', authenticateToken, getDrivers);

// Update driver availability
router.put('/driver/availability', authenticateToken, updateDriverAvailability);

module.exports = router;