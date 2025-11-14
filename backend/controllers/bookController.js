const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  const {
    userId,
    patientName,
    pickupLocation,
    dropLocation,
    contactNumber,
    bookingDate,
    emergency,
    vehicleType
  } = req.body;

  try {
    const booking = new Booking({
      userId,
      patientName,
      pickupLocation,
      dropLocation,
      contactNumber,
      bookingDate,
      emergency,
      vehicleType
    });

    await booking.save();
    res.status(201).json({ msg: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ msg: 'Booking failed', error: err.message });
  }
};

/// GET /api/book/history
exports.getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;  // Comes from authenticateToken
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch booking history', error: err.message });
  }
};

// In user book history
exports.getUserBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const userBookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings: userBookings });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Failed to fetch user booking history' });
  }
};

// Update booking status and tracking info
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, driverId, currentLocation, estimatedArrivalTime } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, driverId, currentLocation, estimatedArrivalTime },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json({ msg: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to update booking', error: error.message });
  }
};

// Get booking by ID with tracking info
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('userId', 'name mobile');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch booking', error: error.message });
  }
};

// Add rating and review to booking
exports.addRating = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { rating, review },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json({ msg: 'Rating added successfully', booking });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to add rating', error: error.message });
  }
};

// Get all bookings for admin dashboard
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId', 'name mobile').sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch bookings', error: error.message });
  }
};