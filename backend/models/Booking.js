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
    enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  // Real-time tracking fields
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  estimatedArrivalTime: Date,
  // Rating system
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);