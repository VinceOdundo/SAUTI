const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Post = require('../models/Post');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('Users:', users);

    const organizations = await Organization.find({});
    console.log('Organizations:', organizations);

    const posts = await Post.find({});
    console.log('Posts:', posts);

    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkDb();
