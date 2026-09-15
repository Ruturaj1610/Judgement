import { MAX_PLAYERS, MIN_PLAYERS } from '@judgement/shared';
import { InternalPlayer, InternalRoomState } from './types';
import { generateRoomCode } from './utils';

export class RoomManager {
  private rooms: Map<string, InternalRoomState> = new Map();

  public getRoom(code: string): InternalRoomState | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public createRoom(
    hostName: string,
    socketId: string
  ): { room: InternalRoomState; playerId: string } {
    let code: string;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);

    const hostPlayer: InternalPlayer = {
      id: playerId,
      socketId,
      name: hostName.trim(),
      seatIndex: 0,
      isConnected: true,
      hand: [],
      judgement: null,
      tricksWon: 0,
      currentRoundScore: 0,
      totalScore: 0,
      roundScores: [],
    };

    const room: InternalRoomState = {
      code,
      hostPlayerId: playerId,
      phase: 'LOBBY',
      players: [hostPlayer],
      currentRound: 0,
      roundConfig: null,
      dealerPlayerId: null,
      firstPlayerId: null,
      currentTurnPlayerId: null,
      currentTrick: null,
      lastTrickWinner: null,
      roundScoresBreakdown: null,
      completeScoreTable: null,
      winner: null,
      statusMessage: 'Waiting for players to join...',
    };

    this.rooms.set(code, room);
    return { room, playerId };
  }

  public joinRoom(
    code: string,
    playerName: string,
    socketId: string,
    reconnectPlayerId?: string
  ): { success: boolean; room?: InternalRoomState; playerId?: string; error?: string } {
    const formattedCode = code.trim().toUpperCase();
    const room = this.rooms.get(formattedCode);

    if (!room) {
      return { success: false, error: 'Room not found. Check the code and try again.' };
    }

    // Reconnection check
    if (reconnectPlayerId) {
      const existingPlayer = room.players.find((p) => p.id === reconnectPlayerId);
      if (existingPlayer) {
        existingPlayer.socketId = socketId;
        existingPlayer.isConnected = true;
        return { success: true, room, playerId: existingPlayer.id };
      }
    }

    // New player joining
    if (room.phase !== 'LOBBY') {
      return { success: false, error: 'Game has already started in this room.' };
    }

    if (room.players.length >= MAX_PLAYERS) {
      return { success: false, error: `Room is full (Maximum ${MAX_PLAYERS} players).` };
    }

    const trimmedName = playerName.trim();
    if (!trimmedName) {
      return { success: false, error: 'Player name cannot be blank.' };
    }

    const nameExists = room.players.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (nameExists) {
      return { success: false, error: 'A player with this name already exists in the room.' };
    }

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const newPlayer: InternalPlayer = {
      id: playerId,
      socketId,
      name: trimmedName,
      seatIndex: room.players.length,
      isConnected: true,
      hand: [],
      judgement: null,
      tricksWon: 0,
      currentRoundScore: 0,
      totalScore: 0,
      roundScores: [],
    };

    room.players.push(newPlayer);
    return { success: true, room, playerId };
  }

  public handleDisconnect(socketId: string): {
    room?: InternalRoomState;
    player?: InternalPlayer;
    hostTransferred: boolean;
    isEmpty: boolean;
  } {
    for (const [code, room] of this.rooms.entries()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) {
        player.isConnected = false;

        let hostTransferred = false;
        // Check if room is completely empty (all disconnected or left)
        const connectedPlayers = room.players.filter((p) => p.isConnected);

        if (connectedPlayers.length === 0) {
          // If in lobby and everyone left, clean up immediately
          if (room.phase === 'LOBBY') {
            this.rooms.delete(code);
            return { room, player, hostTransferred: false, isEmpty: true };
          }
          // If in active game, keep room alive for reconnection
          return { room, player, hostTransferred: false, isEmpty: false };
        }

        // If disconnected player was host, transfer host
        if (player.id === room.hostPlayerId) {
          room.hostPlayerId = connectedPlayers[0].id;
          hostTransferred = true;
        }

        return { room, player, hostTransferred, isEmpty: false };
      }
    }
    return { hostTransferred: false, isEmpty: false };
  }

  public deleteRoom(code: string): void {
    this.rooms.delete(code.toUpperCase());
  }
}
