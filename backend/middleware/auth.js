import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

export default async function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant) return res.status(401).json({ error: 'Tenant not found' });
    req.user = user;
    req.tenant = tenant;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
