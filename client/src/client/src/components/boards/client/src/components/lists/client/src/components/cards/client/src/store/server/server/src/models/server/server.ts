import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import boardRoutes from './routes/boardRoutes';
import cardRoutes from './routes/cardRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);

// Error handler
app.use(errorHandler);

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-board', (boardId) => {
    socket.join(boardId);
    console.log(`Client joined board: ${boardId}`);
  });

  socket.on('leave-board', (boardId) => {
    socket.leave(boardId);
    console.log(`Client left board: ${boardId}`);
  });

  socket.on('card-updated', (data) => {
    socket.to(data.boardId).emit('card-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
