const Booking = require('../models/Booking');
const User = require('../models/User');

// Find nearest available driver
exports.findNearestDriver = async (pickupLocation) => {
  try {
    // In a real implementation, this would use geospatial queries
    // For now, we'll simulate finding the nearest driver
    
    const availableDrivers = await User.find({ 
      role: 'driver', 
      availability: true 
    }).select('-password -otp -otpExpires');
    
    if (availableDrivers.length === 0) {
      return null;
    }
    
    // Simulate distance calculation - in real app, use actual geospatial distance
    const nearestDriver = availableDrivers[0];
    return nearestDriver;
  } catch (error) {
    console.error('Error finding nearest driver:', error);
    return null;
  }
};

// Assign driver to booking
exports.assignDriverToBooking = async (bookingId, driverId) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        driverId,
        status: 'Assigned',
        estimatedArrivalTime: new Date(Date.now() + 10 * 60000) // 10 minutes from now
      },
      { new: true }
    );
    
    // Update driver availability
    await User.findByIdAndUpdate(driverId, { availability: false });
    
    return booking;
  } catch (error) {
    console.error('Error assigning driver to booking:', error);
    return null;
  }
};

// Auto-assign nearest driver to new bookings
exports.autoAssignDriver = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    
    // Skip if already assigned
    if (booking.driverId) {
      return res.json({ msg: 'Driver already assigned', booking });
    }
    
    // Find nearest available driver
    const nearestDriver = await exports.findNearestDriver(booking.pickupLocation);
    if (!nearestDriver) {
      return res.status(404).json({ msg: 'No available drivers found' });
    }
    
    // Assign driver to booking
    const updatedBooking = await exports.assignDriverToBooking(bookingId, nearestDriver._id);
    
    res.json({ 
      msg: 'Driver assigned successfully', 
      booking: updatedBooking,
      driver: {
        id: nearestDriver._id,
        name: nearestDriver.name,
        mobile: nearestDriver.mobile
      }
    });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to assign driver', error: error.message });
  }
};

// Get dispatch statistics
exports.getDispatchStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const assignedBookings = await Booking.countDocuments({ status: 'Assigned' });
    const inProgressBookings = await Booking.countDocuments({ status: 'In Progress' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const availableDrivers = await User.countDocuments({ role: 'driver', availability: true });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    
    // Calculate average response time (simulated)
    const avgResponseTime = 12.4; // minutes
    
    res.json({
      success: true,
      stats: {
        totalBookings,
        assignedBookings,
        inProgressBookings,
        completedBookings,
        availableDrivers,
        totalDrivers,
        avgResponseTime
      }
    });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch dispatch stats', error: error.message });
  }
};

// Predict demand based on historical data
exports.predictDemand = async (req, res) => {
  try {
    // In a real implementation, this would use ML models
    // For now, we'll simulate predictions
    
    const predictions = {
      nextHour: 5,
      next3Hours: 12,
      next6Hours: 18,
      next12Hours: 25,
      next24Hours: 35
    };
    
    res.json({
      success: true,
      predictions
    });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to predict demand', error: error.message });
  }
};

// Optimize ambulance positioning
exports.optimizeAmbulancePositioning = async (req, res) => {
  try {
    // In a real implementation, this would use clustering algorithms
    // For now, we'll simulate optimization suggestions
    
    const suggestions = [
      {
        zone: 'Zone A',
        currentAmbulances: 3,
        suggestedAmbulances: 4,
        reason: 'High demand area during peak hours'
      },
      {
        zone: 'Zone B',
        currentAmbulances: 2,
        suggestedAmbulances: 1,
        reason: 'Low demand, can reduce vehicles'
      },
      {
        zone: 'Zone C',
        currentAmbulances: 1,
        suggestedAmbulances: 3,
        reason: 'Expected event causing increased demand'
      }
    ];
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to optimize positioning', error: error.message });
  }
};