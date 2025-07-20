const User = require('../models/User');

// Profile Photo Upload (With token user ID)
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: req.file.path },
      { new: true }
    );

    res.json({ msg: 'Profile photo uploaded', photo: user.profilePhoto });
  } catch (err) {
    res.status(500).json({ msg: 'Upload error', error: err.message });
  }
};

// Aadhaar Upload (With token user ID)
exports.uploadAadhaar = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const user = await User.findByIdAndUpdate(
      userId,
      { aadhaarCard: req.file.path },
      { new: true }
    );

    res.json({ msg: 'Aadhaar card uploaded', aadhaar: user.aadhaarCard });
  } catch (err) {
    res.status(500).json({ msg: 'Upload error', error: err.message });
  }
};

// Medical Upload (With token user ID)
exports.uploadMedical = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    console.log('Medical File Received:', file);

    if (!file) return res.status(400).json({ msg: "No file uploaded." });

    await User.findByIdAndUpdate(userId, { medicalCertificate: file.path });

    res.json({ msg: "Medical certificate uploaded successfully." });
  } catch (err) {
      console.error(err);
    res.status(500).json({ msg: "Server error." });
  }
};
