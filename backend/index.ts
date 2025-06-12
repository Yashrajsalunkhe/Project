import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { seedDatabase } from './utils/seedData.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Initialize database with sample data if needed
const initializeData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📊 No users found, seeding database with sample data...');
      await seedDatabase();
    } else {
      console.log(`📊 Found ${userCount} existing users in database`);
    }
  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
};

// Initialize data after a short delay to ensure DB connection
setTimeout(initializeData, 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Express server is running!',
    timestamp: new Date().toISOString()
  });
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const usersWithId = users.map(user => ({
      _id: user._id,
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      age: user.age,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    res.json({ success: true, data: usersWithId });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    if (!name || !email || !age) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and age are required' 
      });
    }
    
    const newUser = new User({
      name,
      email,
      age: parseInt(age)
    });
    
    const savedUser = await newUser.save();
    res.status(201).json({ success: true, data: savedUser });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age: parseInt(age) },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Also delete posts by this user
    await Post.deleteMany({ userId: req.params.id });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Post routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name email age')
      .sort({ createdAt: -1 });
    
    const postsWithUsers = posts.map(post => ({
      _id: post._id,
      id: (post._id as any).toString(),
      title: post.title,
      content: post.content,
      userId: (post.userId as any)._id.toString(),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.userId
    }));
    
    res.json({ success: true, data: postsWithUsers });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'name email age');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const postWithUser = {
      _id: post._id,
      id: (post._id as any).toString(),
      title: post.title,
      content: post.content,
      userId: (post.userId as any)._id.toString(),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.userId
    };
    
    res.json({ success: true, data: postWithUser });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, message: 'Error fetching post' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    
    if (!title || !content || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, content, and userId are required' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid userId' 
      });
    }
    
    const newPost = new Post({
      title,
      content,
      userId
    });
    
    const savedPost = await newPost.save();
    await savedPost.populate('userId', 'name email age');
    
    const postWithUser = {
      _id: savedPost._id,
      id: (savedPost._id as any).toString(),
      title: savedPost.title,
      content: savedPost.content,
      userId: (savedPost.userId as any)._id.toString(),
      createdAt: savedPost.createdAt,
      updatedAt: savedPost.updatedAt,
      user: savedPost.userId
    };
    
    res.status(201).json({ success: true, data: postWithUser });
  } catch (error: any) {
    console.error('Error creating post:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation failed: ${validationErrors.join(', ')}` 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error creating post' });
  }
});

// Delete post endpoint
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    
    if (!deletedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Error deleting post' });
  }
});

// Update post endpoint
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id, 
      { title, content },
      { new: true, runValidators: true }
    ).populate('userId', 'name email age');
    
    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const postWithUser = {
      _id: updatedPost._id,
      id: (updatedPost._id as any).toString(),
      title: updatedPost.title,
      content: updatedPost.content,
      userId: (updatedPost.userId as any)._id.toString(),
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      user: updatedPost.userId
    };
    
    res.json({ success: true, data: postWithUser });
  } catch (error: any) {
    console.error('Error updating post:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation failed: ${validationErrors.join(', ')}` 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error updating post' });
  }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    
    // Calculate average user age
    const users = await User.find({}, 'age');
    const averageUserAge = totalUsers > 0 
      ? users.reduce((sum, user) => sum + user.age, 0) / totalUsers 
      : 0;
    
    // Calculate posts per user
    const posts = await Post.find({}, 'userId');
    const postsPerUser = posts.reduce((acc, post) => {
      const userId = post.userId.toString();
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const analytics = {
      totalUsers,
      totalPosts,
      averageUserAge,
      postsPerUser
    };
    
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

export default app;