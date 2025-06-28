const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  anonymousName: { type: String, required: true },
  content: { type: String },
  image: { type: String },
  video: { type: String },
  tag: { type: String, enum: ['Random', 'Corruption', 'News', 'Trending', 'Storytelling'], required: true },
  promote: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema); 