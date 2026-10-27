let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join specific room for user updates
    socket.on('join', ({ userId, shelterId }) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
      if (shelterId) {
        socket.join(`shelter:${shelterId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean up
    });
  });

  return io;
};

export const getIO = () => {
  return ioInstance;
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToShelter = (shelterId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`shelter:${shelterId}`).emit(event, data);
  }
};

export const emitBroadcast = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};
