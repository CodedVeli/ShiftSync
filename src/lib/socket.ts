import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.close();
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  socket = io(apiUrl, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const closeSocket = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
