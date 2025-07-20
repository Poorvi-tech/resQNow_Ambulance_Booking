const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookController');
const { getBookingHistory } = require('../controllers/bookController');
const { getUserBookingHistory } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', createBooking);
router.get('/history', authMiddleware, getBookingHistory);
router.get('/user-history', authMiddleware, getUserBookingHistory);

module.exports = router;