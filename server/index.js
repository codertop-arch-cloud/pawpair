import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import dogRoutes from './routes/dogRoutes.js';
import shelterRoutes from './routes/shelterRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import savedDogRoutes from './routes/savedDogRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev
      }
    },
    credentials: true,
  },
});

initSocket(io);

// Core Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev origins
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'PawPair API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/saved-dogs', savedDogRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/upload', uploadRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start server
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      server.listen(PORT, () => {
        console.log(`🚀 PawPair Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
    });
}

export { app, server };
export default app;
