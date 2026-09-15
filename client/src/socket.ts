import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@judgement/shared';

// Connect to backend server
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
