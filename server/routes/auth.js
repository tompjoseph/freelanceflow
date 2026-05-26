const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user._id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk && mimeOk);
  },
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email }],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, username, displayName } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username;
    if (displayName !== undefined) updates.displayName = displayName;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const profilePic = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { profilePic }, { new: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
