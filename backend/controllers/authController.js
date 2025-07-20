const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// SMTP transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register (Step 1: save user, send OTP)
exports.register = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      name, email, mobile,
      password: hashed,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60000) // 10 mins
    });

    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Ambulance Booking App',
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 10 minutes only.</p>`
    });

    res.status(201).json({ msg: 'User registered. OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
  const existing = await User.findOne({ email });

if (existing) {
  if (!existing.isVerified) {
    // Allow user to re-register: update old user
    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    existing.name = name;
    existing.mobile = mobile;
    existing.password = hashed;
    existing.otp = otp;
    existing.otpExpires = new Date(Date.now() + 10 * 60000);
    await existing.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Ambulance Booking App',
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 10 minutes only.</p>`
    });

    return res.status(200).json({ msg: 'User already exists but not verified. OTP re-sent.' });
  } else {
    return res.status(400).json({ msg: 'User already exists' });
  }
}

};

// Verify OTP (Step 2: mark verified)
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ msg: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'OTP verification error', error: err.message });
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

    if (!user.isVerified) return res.status(403).json({ msg: 'Email not verified. Please verify OTP.' });

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
// Forgot Password – Send OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 mins
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password OTP',
      html: `<p>Your OTP to reset your password is <strong>${otp}</strong>. Valid for 10 minutes.</p>`
    });

    res.json({ msg: 'OTP sent to your email for password reset.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error in forgot password', error: err.message });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;

    await user.save();
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Reset password error', error: err.message });
  }
};
// Resend OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOTP;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New OTP - Ambulance Booking",
      html: `<h2>Your new OTP is: ${newOTP}</h2><p>Valid for 10 minutes only.</p>`
    });

    res.status(200).json({ msg: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error resending OTP", error: err.message });
  }
};

// update profile

exports.updateProfile = async (req, res) => {
  try {
    const { name, profilePhoto, aadhaarCard, medicalCertificate } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (profilePhoto) updates.profilePhoto = profilePhoto;
    if (aadhaarCard) updates.aadhaarCard = aadhaarCard;
    if (medicalCertificate) updates.medicalCertificate = medicalCertificate;

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

