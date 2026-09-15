import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@judgement/shared';
import { GameEngine } from './gameEngine';
import { RoomManager } from './roomManager';
import { sanitizeGameState } from './utils';
import { InternalRoomState } from './types';

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
) {
  // Broadcast sanitized state to each connected player in room individually
  const broadcastGameState = (room: InternalRoomState) => {
    for (const player of room.players) {
      if (player.isConnected && player.socketId) {
        const sanitized = sanitizeGameState(room, player.id);
        io.to(player.socketId).emit('game-state', sanitized);
      }
    }
  };

  const gameEngine = new GameEngine(broadcastGameState);

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    socket.on('create-room', ({ playerName }, callback) => {
      try {
        if (!playerName || !playerName.trim()) {
          return callback({ success: false, error: 'Please enter a valid player name' });
        }

        const { room, playerId } = roomManager.createRoom(playerName, socket.id);
        currentRoomCode = room.code;
        currentPlayerId = playerId;

        socket.join(room.code);
        callback({ success: true, roomCode: room.code, playerId });
        broadcastGameState(room);
      } catch (err: any) {
        callback({ success: false, error: err.message || 'Error creating room' });
      }
    });

    socket.on('join-room', ({ roomCode, playerName, reconnectPlayerId }, callback) => {
      try {
        const result = roomManager.joinRoom(roomCode, playerName, socket.id, reconnectPlayerId);
        if (!result.success || !result.room || !result.playerId) {
          return callback({ success: false, error: result.error });
        }

        currentRoomCode = result.room.code;
        currentPlayerId = result.playerId;

        socket.join(result.room.code);
        callback({ success: true, roomCode: result.room.code, playerId: result.playerId });

        // Notify room
        const joiningPlayer = result.room.players.find((p) => p.id === result.playerId);
        if (joiningPlayer) {
          io.to(result.room.code).emit('player-joined', { playerName: joiningPlayer.name });
        }

        broadcastGameState(result.room);
      } catch (err: any) {
        callback({ success: false, error: err.message || 'Error joining room' });
      }
    });

    socket.on('start-game', (callback) => {
      try {
        if (!currentRoomCode || !currentPlayerId) {
          return callback({ success: false, error: 'Not in a room' });
        }

        const room = roomManager.getRoom(currentRoomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        if (room.hostPlayerId !== currentPlayerId) {
          return callback({ success: false, error: 'Only the host can start the game' });
        }

        const startResult = gameEngine.startGame(room);
        if (!startResult.success) {
          return callback({ success: false, error: startResult.error });
        }

        callback({ success: true });
        broadcastGameState(room);
      } catch (err: any) {
        callback({ success: false, error: err.message || 'Error starting game' });
      }
    });

    socket.on('submit-judgement', ({ judgement }, callback) => {
      try {
        if (!currentRoomCode || !currentPlayerId) {
          return callback({ success: false, error: 'Not in a room' });
        }

        const room = roomManager.getRoom(currentRoomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const result = gameEngine.submitJudgement(room, currentPlayerId, judgement);
        if (!result.success) {
          return callback({ success: false, error: result.error });
        }

        callback({ success: true });

        const player = room.players.find((p) => p.id === currentPlayerId);
        if (player) {
          io.to(room.code).emit('judgement-submitted', {
            playerId: player.id,
            playerName: player.name,
          });
        }

        broadcastGameState(room);
      } catch (err: any) {
        callback({ success: false, error: err.message || 'Error submitting judgement' });
      }
    });

    socket.on('play-card', ({ card }, callback) => {
      try {
        if (!currentRoomCode || !currentPlayerId) {
          return callback({ success: false, error: 'Not in a room' });
        }

        const room = roomManager.getRoom(currentRoomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const player = room.players.find((p) => p.id === currentPlayerId);
        const result = gameEngine.playCard(room, currentPlayerId, card);
        if (!result.success) {
          return callback({ success: false, error: result.error });
        }

        callback({ success: true });

        if (player) {
          io.to(room.code).emit('card-played', {
            playerId: player.id,
            playerName: player.name,
            card,
          });
        }

        broadcastGameState(room);
      } catch (err: any) {
        callback({ success: false, error: err.message || 'Error playing card' });
      }
    });

    socket.on('next-round-ready', () => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;
      gameEngine.nextRoundReady(room);
    });

    socket.on('play-again', (callback) => {
      if (!currentRoomCode) {
        return callback({ success: false, error: 'Not in a room' });
      }
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }
      const result = gameEngine.playAgain(room);
      callback(result);
    });

    socket.on('disconnect', () => {
      const { room, player, hostTransferred } = roomManager.handleDisconnect(socket.id);
      if (room && player) {
        io.to(room.code).emit('player-left', {
          playerName: player.name,
          isHostTransferred: hostTransferred,
        });
        broadcastGameState(room);
      }
    });
  });
}
