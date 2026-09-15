import { Card, GamePhase, RoundConfig, RoundScoreBreakdown, Suit, TrickState } from '@judgement/shared';

export interface InternalPlayer {
  id: string;
  socketId: string;
  name: string;
  seatIndex: number;
  isConnected: boolean;
  hand: Card[]; // Secret actual cards stored server-side only
  judgement: number | null;
  tricksWon: number;
  currentRoundScore: number;
  totalScore: number;
  roundScores: number[]; // Scores for rounds 1..8
}

export interface InternalRoomState {
  code: string;
  hostPlayerId: string;
  phase: GamePhase;
  players: InternalPlayer[];
  currentRound: number; // 1 to 8
  roundConfig: RoundConfig | null;
  dealerPlayerId: string | null;
  firstPlayerId: string | null;
  currentTurnPlayerId: string | null;
  currentTrick: TrickState | null;
  lastTrickWinner: { playerId: string; playerName: string; card: Card } | null;
  roundScoresBreakdown: RoundScoreBreakdown[] | null;
  completeScoreTable: {
    rounds: {
      roundNumber: number;
      cards: number;
      hukum: Suit;
      scores: Record<string, number>;
    }[];
    totalScores: Record<string, number>;
  } | null;
  winner: {
    playerId: string;
    playerName: string;
    totalScore: number;
  } | null;
  statusMessage?: string;
  roundCountdownTimer?: NodeJS.Timeout;
}
