const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'driver', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  aadhaarCard: {
    type: String,
    default: ''
  },
  medicalCertificate: {       
    type: String,
    default: ''
  },
  // Driver specific fields
  licenseNumber: {
    type: String,
    default: ''
  },
  vehicleAssigned: {
    type: String,
    default: ''
  },
  availability: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);