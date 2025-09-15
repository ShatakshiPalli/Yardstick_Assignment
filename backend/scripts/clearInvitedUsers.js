import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas-notes';

async function clearInvited() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // Delete all users with status 'pending' (invited users)
  const result = await User.deleteMany({ status: 'pending' });
  console.log(`Cleared ${result.deletedCount} invited users.`);
  await mongoose.disconnect();
}

clearInvited();
