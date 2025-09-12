import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
