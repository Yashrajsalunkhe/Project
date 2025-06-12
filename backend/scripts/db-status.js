#!/usr/bin/env node
import mongoose from 'mongoose';

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/management_dashboard';

// Define User schema inline for this script
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true }
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database connection...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection successful');

    // Check users
    const userCount = await User.countDocuments();
    console.log(`👥 Total users: ${userCount}`);

    // Check posts
    const postCount = await Post.countDocuments();
    console.log(`📝 Total posts: ${postCount}`);

    // Sample users
    console.log('\n📋 Sample users:');
    const sampleUsers = await User.find().limit(5).select('name email age');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Age: ${user.age}`);
    });

    // Sample posts
    console.log('\n📄 Sample posts:');
    const samplePosts = await Post.find().populate('userId', 'name').limit(3).select('title userId');
    samplePosts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}" by ${post.userId.name}`);
    });

    console.log('\n🎉 Database status check completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Database connection closed');
  }
}

checkDatabaseStatus();
