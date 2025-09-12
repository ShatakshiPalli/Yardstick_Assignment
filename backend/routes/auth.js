import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const tenant = await Tenant.findById(user.tenantId);
  const token = jwt.sign({ userId: user._id, tenantId: tenant._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, role: user.role, tenant: tenant.slug });
});

export default router;
