// Create web server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Comment = require('./models/comment'); // Import the Comment model
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'commentsDB'; // Replace with your database name
const port = 3000;
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Connect to MongoDB
client.connect((err) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }
  console.log('Connected to MongoDB');
  const db = client.db(dbName);
  // Initialize the Comment model with the database connection
  Comment.init(db);
});
// Define the Comment model
const commentSchema = new mongoose.Schema({
  name: String,
  email: String,
  comment: String,
  date: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', commentSchema);
// Define the API endpoints
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});
app.post('/comments', async (req, res) => {
  const { name, email, comment } = req.body;
  const newComment = new Comment({ name, email, comment });
  try {
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'Error saving comment' });
  }
});
app.put('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, comment } = req.body;
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { name, email, comment },
      { new: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: 'Error updating comment' });
  }
});
app.delete('/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting comment' });
  }
});