import express from 'express';
import Note from '../models/Note.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create note
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  const tenant = req.tenant;
  if (tenant.plan === 'free') {
    const count = await Note.countDocuments({ tenantId: tenant._id });
    if (count >= 3) return res.status(403).json({ error: 'Free plan limit reached' });
  }
  const note = await Note.create({ title, content, tenantId: tenant._id, userId: req.user._id });
  res.json(note);
});

// List notes
router.get('/', auth, async (req, res) => {
  const notes = await Note.find({ tenantId: req.tenant._id });
  res.json(notes);
});

// Get note by id
router.get('/:id', auth, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

// Update note
router.put('/:id', auth, async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant._id },
    { $set: req.body, updatedAt: new Date() },
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant._id });
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;
