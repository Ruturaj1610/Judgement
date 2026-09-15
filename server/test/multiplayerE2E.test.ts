import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import {
  ClientGameState,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@judgement/shared';
import { RoomManager } from '../src/roomManager';
import { setupSocketHandlers } from '../src/socketHandlers';

function waitForGameState(
  socket: ClientSocket<ServerToClientEvents, ClientToServerEvents>,
  predicate: (state: ClientGameState) => boolean,
  timeoutMs = 15000
): Promise<ClientGameState> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off('game-state', handler);
      reject(new Error(`Timed out waiting for game-state matching predicate`));
    }, timeoutMs);

    const handler = (state: ClientGameState) => {
      if (predicate(state)) {
        clearTimeout(timer);
        socket.off('game-state', handler);
        resolve(state);
      }
    };

    socket.on('game-state', handler);
  });
}

describe('Multiplayer Real-Time End-to-End Simulation', () => {
  let httpServer: http.Server;
  let ioServer: Server;
  let port: number;
  let clientA: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let clientB: ClientSocket<ServerToClientEvents, ClientToServerEvents>;

  beforeAll(async () => {
    const app = express();
    httpServer = http.createServer(app);
    ioServer = new Server(httpServer, { cors: { origin: '*' } });
    const roomManager = new RoomManager();
    setupSocketHandlers(ioServer, roomManager);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address();
        if (addr && typeof addr === 'object') {
          port = addr.port;
        }
        resolve();
      });
    });
  });

  afterAll(() => {
    if (clientA) clientA.disconnect();
    if (clientB) clientB.disconnect();
    ioServer.close();
    httpServer.close();
  });

  it(
    'Flow: Create Room -> Join Room -> Start Game -> Fair Play -> Judgement -> Play Trick',
    async () => {
      // 1. Connect Client A
      clientA = Client(`http://localhost:${port}`);
      await new Promise((res) => clientA.on('connect', res));

      // 2. Client A creates room
      let roomCode = '';
      let playerAId = '';
      await new Promise<void>((resolve) => {
        clientA.emit('create-room', { playerName: 'Ruturaj' }, (res) => {
          expect(res.success).toBe(true);
          expect(res.roomCode).toBeDefined();
          roomCode = res.roomCode!;
          playerAId = res.playerId!;
          resolve();
        });
      });

      // 3. Connect Client B
      clientB = Client(`http://localhost:${port}`);
      await new Promise((res) => clientB.on('connect', res));

      // Listen for lobby with 2 players BEFORE joining
      const lobbyStateA = waitForGameState(clientA, (s) => s.players.length === 2);
      const lobbyStateB = waitForGameState(clientB, (s) => s.players.length === 2);

      let playerBId = '';
      await new Promise<void>((resolve) => {
        clientB.emit('join-room', { roomCode, playerName: 'Arya' }, (res) => {
          expect(res.success).toBe(true);
          playerBId = res.playerId!;
          resolve();
        });
      });

      const [sA, sB] = await Promise.all([lobbyStateA, lobbyStateB]);
      expect(sA.players).toHaveLength(2);
      expect(sA.players[0].name).toBe('Ruturaj');
      expect(sA.players[0].isHost).toBe(true);
      expect(sA.players[1].name).toBe('Arya');
      expect(sA.phase).toBe('LOBBY');
      expect(sB.players).toHaveLength(2);

      // 4. Client B (non-host) cannot start the game
      await new Promise<void>((resolve) => {
        clientB.emit('start-game', (res) => {
          expect(res.success).toBe(false);
          expect(res.error).toMatch(/Only the host/);
          resolve();
        });
      });

      // 5. Host starts game: Listen for JUDGEMENT phase (after dealing animation)
      const judgeStateA = waitForGameState(clientA, (s) => s.phase === 'JUDGEMENT');
      const judgeStateB = waitForGameState(clientB, (s) => s.phase === 'JUDGEMENT');

      await new Promise<void>((resolve) => {
        clientA.emit('start-game', (res) => {
          expect(res.success).toBe(true);
          resolve();
        });
      });

      const [activeA, activeB] = await Promise.all([judgeStateA, judgeStateB]);

      // 6. FAIR PLAY / SECURITY:
      // Client A must see ONLY their 8 cards in myCards. Opponents must have only cardCount = 8.
      expect(activeA.myCards).toHaveLength(8);
      const oppInStateA = activeA.players.find((p) => p.id === playerBId);
      expect(oppInStateA?.cardCount).toBe(8);

      // Client B must see ONLY their 8 cards in myCards.
      expect(activeB.myCards).toHaveLength(8);
      const oppInStateB = activeB.players.find((p) => p.id === playerAId);
      expect(oppInStateB?.cardCount).toBe(8);

      // Round 1 config check: 8 cards, Hukum = ♠ Spades
      expect(activeA.roundConfig?.cardsPerPlayer).toBe(8);
      expect(activeA.roundConfig?.hukum).toBe('S');

      // 7. Judgement submission
      const firstJudgeId = activeA.currentTurnPlayerId!;
      const secondJudgeId = firstJudgeId === playerAId ? playerBId : playerAId;

      const firstClient = firstJudgeId === playerAId ? clientA : clientB;
      const secondClient = secondJudgeId === playerAId ? clientA : clientB;

      // First player submits judgement
      await new Promise<void>((resolve) => {
        firstClient.emit('submit-judgement', { judgement: 2 }, (res) => {
          expect(res.success).toBe(true);
          resolve();
        });
      });

      // Prepare listener for PLAYING_TRICK
      const trick1A = waitForGameState(
        clientA,
        (s) => s.phase === 'PLAYING_TRICK' && s.currentTrick?.trickNumber === 1
      );

      // Second player submits judgement
      await new Promise<void>((resolve) => {
        secondClient.emit('submit-judgement', { judgement: 1 }, (res) => {
          expect(res.success).toBe(true);
          resolve();
        });
      });

      // Wait for reveal delay (2.5s) to finish and trick 1 to start
      const t1State = await trick1A;
      expect(t1State.phase).toBe('PLAYING_TRICK');
      expect(t1State.currentTrick?.trickNumber).toBe(1);

      // 8. Play Trick 1
      const leadPlayerId = t1State.currentTurnPlayerId!;
      const followPlayerId = leadPlayerId === playerAId ? playerBId : playerAId;
      const leadClient = leadPlayerId === playerAId ? clientA : clientB;
      const followClient = followPlayerId === playerAId ? clientA : clientB;

      const leadHand = leadPlayerId === playerAId ? activeA.myCards : activeB.myCards;
      const leadCard = leadHand[0];

      // Prepare listener for lead card played
      const leadPlayedStatePromise = waitForGameState(
        followClient,
        (s) => (s.currentTrick?.cards.length ?? 0) === 1
      );

      await new Promise<void>((resolve) => {
        leadClient.emit('play-card', { card: leadCard }, (res) => {
          expect(res.success).toBe(true);
          resolve();
        });
      });

      const afterLeadState = await leadPlayedStatePromise;
      expect(afterLeadState.currentTrick?.leadSuit).toBe(leadCard.suit);

      // Follow player plays legal card
      const followHand = afterLeadState.myCards;
      const matchingLead = followHand.filter((c) => c.suit === leadCard.suit);
      const followCard = matchingLead.length > 0 ? matchingLead[0] : followHand[0];

      // Prepare listener for trick result
      const trickResultPromise = waitForGameState(
        clientA,
        (s) => s.phase === 'TRICK_RESULT'
      );

      await new Promise<void>((resolve) => {
        followClient.emit('play-card', { card: followCard }, (res) => {
          expect(res.success).toBe(true);
          resolve();
        });
      });

      const resultState = await trickResultPromise;
      expect(resultState.currentTrick?.winnerPlayerId).toBeDefined();
      expect(resultState.lastTrickWinner).toBeDefined();

      // 9. Test Reconnection
      clientB.disconnect();
      const clientBReconnected = Client(`http://localhost:${port}`);
      await new Promise((res) => clientBReconnected.on('connect', res));

      await new Promise<void>((resolve) => {
        clientBReconnected.emit(
          'join-room',
          { roomCode, playerName: 'Arya', reconnectPlayerId: playerBId },
          (res) => {
            expect(res.success).toBe(true);
            expect(res.playerId).toBe(playerBId);
            resolve();
          }
        );
      });

      clientBReconnected.disconnect();
    },
    25000
  );
});
