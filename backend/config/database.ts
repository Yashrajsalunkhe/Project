import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/management_dashboard';
    
    await mongoose.connect(mongoURI);
    
    console.log('🟢 MongoDB connected successfully');
  } catch (error) {
    console.error('🔴 MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
