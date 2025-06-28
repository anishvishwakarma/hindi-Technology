const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');
const path = require('path');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Auth middleware
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

// Create post
router.post('/', auth, upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
  try {
    const { content, tag } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(400).json({ message: 'User not found.' });
    const image = req.files['image'] ? req.files['image'][0].filename : null;
    const video = req.files['video'] ? req.files['video'][0].filename : null;
    const post = new Post({
      user: user._id,
      anonymousName: user.anonymousName,
      content,
      image,
      video,
      tag
    });
    await post.save();
    res.status(201).json({ message: 'Post created.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get posts (optionally by tag)
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query;
    const filter = tag ? { tag } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Promote a post
router.post('/:id/promote', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { promote: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ promote: post.promote });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Dislike a post
router.post('/:id/dislike', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislike: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ dislike: post.dislike });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 