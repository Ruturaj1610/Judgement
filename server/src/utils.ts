import { ClientGameState, GamePhase, RoundConfig, Suit, Card } from '@judgement/shared';
import { InternalRoomState } from './types';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid 0/O, 1/I

export function generateRoomCode(): string {
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    result += ROOM_CODE_CHARS[randomIndex];
  }
  return result;
}

/**
 * CRITICAL FAIR-PLAY SANITIZATION:
 * Produces the ClientGameState tailored specifically for `forPlayerId`.
 * MUST NEVER INCLUDE opponents' actual cards!
 * Opponents' cards are replaced only with their cardCount.
 */
export function sanitizeGameState(room: InternalRoomState, forPlayerId: string): ClientGameState {
  const myPlayer = room.players.find((p) => p.id === forPlayerId);
  const myCards = myPlayer ? [...myPlayer.hand] : [];

  // Public player info
  const publicPlayers = room.players.map((p) => {
    // Reveal judgement only if in JUDGEMENT_REVEAL, PLAYING_TRICK, TRICK_RESULT, ROUND_RESULT, LEADERBOARD, FINAL_RESULT
    // Or if it's the player themselves who submitted
    const showJudgement =
      room.phase !== 'LOBBY' &&
      room.phase !== 'ROUND_START' &&
      room.phase !== 'DEALING' &&
      room.phase !== 'JUDGEMENT';

    return {
      id: p.id,
      name: p.name,
      isHost: p.id === room.hostPlayerId,
      isConnected: p.isConnected,
      seatIndex: p.seatIndex,
      cardCount: p.hand.length,
      judgement: showJudgement ? p.judgement : p.id === forPlayerId ? p.judgement : null,
      hasJudged: p.judgement !== null,
      tricksWon: p.tricksWon,
      currentRoundScore: p.currentRoundScore,
      totalScore: p.totalScore,
      roundScores: [...p.roundScores],
    };
  });

  // Leaderboard: sorted by total score descending
  const leaderboard = [...publicPlayers]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((p, idx) => ({
      playerId: p.id,
      playerName: p.name,
      totalScore: p.totalScore,
      rank: idx + 1,
    }));

  return {
    roomCode: room.code,
    phase: room.phase,
    currentRound: room.currentRound,
    roundConfig: room.roundConfig,
    dealerPlayerId: room.dealerPlayerId,
    firstPlayerId: room.firstPlayerId,
    currentTurnPlayerId: room.currentTurnPlayerId,
    players: publicPlayers,
    myCards: myCards, // ONLY this player's cards
    currentTrick: room.currentTrick,
    lastTrickWinner: room.lastTrickWinner,
    roundScores: room.roundScoresBreakdown,
    leaderboard,
    completeScoreTable: room.completeScoreTable,
    winner: room.winner,
    message: room.statusMessage,
  };
}
