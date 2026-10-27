import './config/mongooseInit.js';
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

// Load .env from server directory (works in local dev; on Render env vars are set in dashboard)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// CORS — allow the deployed Vercel frontend, Vercel preview domains, and localhost.
// Set CLIENT_URL in Render's dashboard to your Vercel domain, e.g.:
//   https://pawpair-ewc6.vercel.app
// ---------------------------------------------------------------------------
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const allowedOrigins = new Set([
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  // Vercel preview URLs for the pawpair-ewc6 project
  'https://pawpair-ewc6.vercel.app',
]);

const originFn = (origin, callback) => {
  // Allow server-to-server requests (no origin header) and all whitelisted origins.
  // Also allow any Vercel preview deploy of the same project.
  if (
    !origin ||
    allowedOrigins.has(origin) ||
    /^https:\/\/pawpair-ewc6-[a-z0-9]+-aarsheya-jasrotia\.vercel\.app$/.test(origin)
  ) {
    callback(null, true);
  } else {
    console.warn(`CORS: blocked origin: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  }
};

const corsOptions = { origin: originFn, credentials: true };

// Socket.IO — clients connect directly to this Render URL (Vercel does not relay WebSocket upgrades)
const io = new Server(server, {
  cors: corsOptions,
  transports: ['polling', 'websocket'],
});

initSocket(io);

// Core Middlewares
app.use(cors(corsOptions));
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

// ---------------------------------------------------------------------------
// Server startup
// Connect to MongoDB ONCE at startup before accepting requests.
// Render provides PORT automatically; fall back to 5001 for local dev.
// Bind to 0.0.0.0 so Render's router can reach the process.
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '5001', 10);

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      server.listen(PORT, '0.0.0.0', () => {
        console.log(
          `🚀 PawPair Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
        );
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to MongoDB — server will not start:', err.message);
      process.exit(1);
    });
}

export { app, server };
export default app;
