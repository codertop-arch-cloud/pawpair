import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
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
