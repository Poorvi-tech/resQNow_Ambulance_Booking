const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register (Step 1: save user, auto-verify)
exports.register = async (req, res) => {
  const { name, email, mobile, password, role = 'user' } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name, email, mobile,
      password: hashed,
      role, // Allow specifying role during registration
      isVerified: true // Auto-verify user upon registration
    });

    await user.save();

    res.status(201).json({ msg: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: 'Wrong password' });

    // Removed verification check - users can login without email verification

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profilePhoto: user.profilePhoto,
        aadhaarCard: user.aadhaarCard,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Forgot Password – Generate and return OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 mins
    await user.save();

    // Return OTP directly instead of sending email
    res.json({ msg: 'OTP generated for password reset.', otp: otp });
  } catch (err) {
    res.status(500).json({ msg: 'Error in forgot password', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await user.save();
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Reset password error', error: err.message });
  }
};

// update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, profilePhoto, aadhaarCard, medicalCertificate, licenseNumber, vehicleAssigned } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (profilePhoto) updates.profilePhoto = profilePhoto;
    if (aadhaarCard) updates.aadhaarCard = aadhaarCard;
    if (medicalCertificate) updates.medicalCertificate = medicalCertificate;
    if (licenseNumber) updates.licenseNumber = licenseNumber;
    if (vehicleAssigned) updates.vehicleAssigned = vehicleAssigned;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found." });
    }

    res.json({ msg: "Profile updated successfully.", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error." });
  }
};

// profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to load profile', error: err.message });
  }
};

// Make Admin by Email
exports.makeAdmin = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'User role updated to admin', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Make Driver by Email
exports.makeDriver = async (req, res) => {
  try {
    const { email, licenseNumber, vehicleAssigned } = req.body;

    const updates = { 
      role: 'driver',
      availability: true
    };
    
    if (licenseNumber) updates.licenseNumber = licenseNumber;
    if (vehicleAssigned) updates.vehicleAssigned = vehicleAssigned;

    const user = await User.findOneAndUpdate(
      { email },
      updates,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'User role updated to driver', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Make User by Email
exports.makeUser = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'user' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'User role updated to user', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ msg: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password -otp -otpExpires');

    res.json({ success: true, drivers });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update driver availability
exports.updateDriverAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { availability },
      { new: true }
    ).select('-password -otp -otpExpires');

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ msg: 'Availability updated successfully.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};