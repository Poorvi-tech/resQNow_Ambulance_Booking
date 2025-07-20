const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  dropLocation: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  emergency: {
  type: String,
  required: true
},
vehicleType: {
  type: String
},
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);