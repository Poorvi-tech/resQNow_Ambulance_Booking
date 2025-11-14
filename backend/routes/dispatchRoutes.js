const express = require('express');
const router = express.Router();
const { autoAssignDriver, getDispatchStats, predictDemand, optimizeAmbulancePositioning } = require('../controllers/dispatchController');
const authenticateToken = require('../middleware/authMiddleware');

// Auto-assign driver to booking
router.post('/assign-driver/:bookingId', authenticateToken, autoAssignDriver);

// Get dispatch statistics
router.get('/stats', authenticateToken, getDispatchStats);

// Predict demand
router.get('/predict-demand', authenticateToken, predictDemand);

// Optimize ambulance positioning
router.get('/optimize-positioning', authenticateToken, optimizeAmbulancePositioning);

module.exports = router;