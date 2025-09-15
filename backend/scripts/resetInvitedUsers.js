import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas-notes';

async function resetInvited() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // Only keep users with status 'accepted' (i.e., real users), delete all 'pending' invited users
  const result = await User.deleteMany({ status: 'pending' });
  console.log(`Deleted ${result.deletedCount} invited users (status: pending).`);
  await mongoose.disconnect();
}

resetInvited();