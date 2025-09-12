import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Tenant from './models/Tenant.js';
import User from './models/User.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas-notes');

  await Tenant.deleteMany({});
  await User.deleteMany({});

  const tenants = await Tenant.insertMany([
    { name: 'Acme', slug: 'acme', plan: 'free' },
    { name: 'Globex', slug: 'globex', plan: 'free' },
  ]);

  const acme = tenants.find(t => t.slug === 'acme');
  const globex = tenants.find(t => t.slug === 'globex');

  const password = await bcrypt.hash('password', 10);

  await User.insertMany([
    { email: 'admin@acme.test', password, role: 'admin', tenantId: acme._id },
    { email: 'user@acme.test', password, role: 'member', tenantId: acme._id },
    { email: 'admin@globex.test', password, role: 'admin', tenantId: globex._id },
    { email: 'user@globex.test', password, role: 'member', tenantId: globex._id },
  ]);

  console.log('Seeded tenants and users.');
  process.exit();
}

seed();
