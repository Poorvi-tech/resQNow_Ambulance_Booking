const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const authenticateToken = require('../middleware/authMiddleware');  // ✅ Import middleware
const { 
  uploadProfilePhoto, 
  uploadAadhaar, 
  uploadMedical 
} = require('../controllers/uploadController');

// Helper to create folder if it doesn't exist
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest;
    if (file.fieldname === 'photo') {
      dest = 'uploads/photos/';
    } else if (file.fieldname === 'aadhaar') {
      dest = 'uploads/aadhaar/';
    } else if (file.fieldname === 'medicalCertificate') {
      dest = 'uploads/medical/';
    } else {
      dest = 'uploads/';
    }
    ensureDirExists(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 📌 Routes (All Protected with Token):

// Profile Photo Upload → Pass Authorization Bearer Token
router.post('/photo', authenticateToken, upload.single('photo'), uploadProfilePhoto);

// Aadhaar Upload → Pass Authorization Bearer Token
router.post('/aadhaar', authenticateToken, upload.single('aadhaar'), uploadAadhaar);

// Medical Certificate Upload → Pass Authorization Bearer Token
router.post('/medical', authenticateToken, upload.single('medicalCertificate'), uploadMedical);

module.exports = router;
