import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ClientToServerEvents, ServerToClientEvents } from '@judgement/shared';
import { RoomManager } from './roomManager';
import { setupSocketHandlers } from './socketHandlers';

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_URL = process.env.CLIENT_URL || '*';

const app = express();
app.use(
  cors({
    origin: CLIENT_URL === '*' ? '*' : CLIENT_URL,
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', game: 'JUDGEMENT 🎴' });
});

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: CLIENT_URL === '*' ? '*' : CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();
setupSocketHandlers(io, roomManager);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[JUDGEMENT 🎴] Server listening on 0.0.0.0:${PORT}`);
});
