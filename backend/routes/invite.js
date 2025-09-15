import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// List invited users for current tenant
router.get('/invited', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  // Only return users with status 'pending' (i.e., actually invited, not accepted)
  const users = await User.find({ tenantId: req.user.tenantId, status: 'pending' }).select('email role status');
  res.json(users);
});

// Invite user (admin only)
router.post('/invite', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { email, role } = req.body;
  if (!email || !role || !['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Invalid email or role' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'User already exists' });
  const password = await bcrypt.hash('password', 10); // Default password
  const user = await User.create({
    email,
    password,
    role,
    tenantId: req.user.tenantId,
    status: 'pending'
  });
  res.json({ success: true, user: { email: user.email, role: user.role, status: user.status } });
});

export default router;
