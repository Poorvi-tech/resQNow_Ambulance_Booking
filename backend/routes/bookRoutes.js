const express = require('express');
const router = express.Router();
const { createBooking, getBookingHistory, getUserBookingHistory, updateBookingStatus, getBookingById, addRating, getAllBookings } = require('../controllers/bookController');
const authenticateToken = require('../middleware/authMiddleware');

// Create a new booking
router.post('/create', authenticateToken, createBooking);

// Get user's booking history
router.get('/history', authenticateToken, getBookingHistory);

// Get user's booking history (alternative endpoint)
router.get('/user/history', authenticateToken, getUserBookingHistory);

// Update booking status and tracking info (admin/driver)
router.put('/:bookingId/status', authenticateToken, updateBookingStatus);

// Get booking by ID with tracking info
router.get('/:bookingId', authenticateToken, getBookingById);

// Add rating and review to booking
router.post('/:bookingId/rating', authenticateToken, addRating);

// Get all bookings for admin dashboard
router.get('/', authenticateToken, getAllBookings);

module.exports = router;