import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextData {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextData>({ socket: null, connected: false });

export const SocketProvider: React.FC<{ username: string | null; children: React.ReactNode }> = ({ username, children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!username) return;

    // Connect to backend
    const socketInstance = io('http://localhost:5000');

    socketInstance.on('connect', () => {
      setConnected(true);
      // Register this socket to the current username
      socketInstance.emit('register', username);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [username]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
