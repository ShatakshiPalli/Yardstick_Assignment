
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import tenantsRoutes from './routes/tenants.js';
import inviteRoutes from './routes/invite.js';

dotenv.config();
const app = express();
app.use(cors({
  origin: "https://yardstick-assignment-teal.vercel.app",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/tenants', tenantsRoutes);
app.use('/invite', inviteRoutes);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI ;

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error('MongoDB connection error:', err));
