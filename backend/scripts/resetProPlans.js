import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas-notes';

async function resetPro() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await Tenant.updateMany({}, { $set: { plan: 'free' } });
  console.log(`Pro plans reset for ${result.modifiedCount} tenants.`);
  await mongoose.disconnect();
}

resetPro();