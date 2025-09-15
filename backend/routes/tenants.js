import express from 'express';
import Tenant from '../models/Tenant.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Upgrade endpoint (Admin only)
router.post('/:slug/upgrade', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const tenant = await Tenant.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: { plan: 'pro' } },
    { new: true }
  );
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ success: true, plan: tenant.plan });
});

// Downgrade endpoint (Admin only)
router.post('/:slug/downgrade', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const tenant = await Tenant.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: { plan: 'free' } },
    { new: true }
  );
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ success: true, plan: tenant.plan });
});


// Get tenant plan/status
router.get('/:slug', auth, async (req, res) => {
  const tenant = await Tenant.findOne({ slug: req.params.slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ plan: tenant.plan });
});

export default router;
