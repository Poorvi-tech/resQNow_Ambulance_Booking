const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  const {
    userId,
    patientName,
    pickupLocation,
    dropLocation,
    contactNumber,
    bookingDate,
    emergency
  } = req.body;

  try {
    const booking = new Booking({
      userId,
      patientName,
      pickupLocation,
      dropLocation,
      contactNumber,
      bookingDate,
      emergency
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