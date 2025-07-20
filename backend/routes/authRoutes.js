const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')
const authenticateToken = require('../middleware/authMiddleware');
const { deleteAccount } = require('../controllers/authController');


router.put('/update-profile', authenticateToken, authController.updateProfile);
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOTP);
router.get('/profile', authenticateToken, authController.getProfile);
router.delete('/delete', authenticateToken, authController.deleteAccount);

router.get('/make-admin/:email', authController.makeAdmin);

router.get('/make-user/:email', authController.makeUser);


module.exports = router;