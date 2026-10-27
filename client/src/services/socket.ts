import { io, Socket } from 'socket.io-client';

// In production, VITE_SOCKET_URL is set to https://pawpair-wgz8.onrender.com (Render backend).
// In local dev, it is not set — Socket.IO connects to the same origin, and the Vite proxy
// forwards /socket.io/* to http://localhost:5001 with WebSocket support.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? undefined;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // In production, connect directly to Render (supports WebSocket + polling).
      // No Vercel proxy is involved for Socket.IO — Vercel does not support WebSocket upgrades.
      transports: SOCKET_URL ? ['polling', 'websocket'] : ['polling', 'websocket'],
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket.IO connection error:', err.message);
    });
  }
  return socket;
};

export const joinRooms = (userId?: string, shelterId?: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join', { userId, shelterId });
  } else {
    s.once('connect', () => {
      s.emit('join', { userId, shelterId });
    });
  }
};
