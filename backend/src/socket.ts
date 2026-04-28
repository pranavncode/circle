import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

// Map to keep track of connected users: username -> socketId
const userSockets = new Map<string, string>();

export const attachSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    // console.log(`User connected: ${socket.id}`);

    // When the frontend established its identity
    socket.on('register', (username: string) => {
      userSockets.set(username, socket.id);
      // console.log(`Registered user ${username} to socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Find and remove the socket from map
      for (const [username, id] of userSockets.entries()) {
        if (id === socket.id) {
          userSockets.delete(username);
          break;
        }
      }
    });
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

// Utility function to get a user's active socket
export const getUserSocketId = (username: string): string | undefined => {
  return userSockets.get(username);
};
