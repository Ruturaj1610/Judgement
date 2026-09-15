import { ROUND_CONFIGS, RoundScoreBreakdown, Suit } from '@judgement/shared';
import { InternalPlayer, InternalRoomState } from './types';

/**
 * Calculates score for a single round according to Judgement rules:
 * - If actualTricks == judgement: score = 10 + judgement
 * - If actualTricks != judgement: score = 0 (No penalty below zero)
 */
export function calculateRoundScore(judgement: number, actualTricks: number): number {
  if (judgement === actualTricks) {
    return 10 + judgement;
  }
  return 0;
}

export function computeRoundResults(players: InternalPlayer[]): RoundScoreBreakdown[] {
  const breakdowns: RoundScoreBreakdown[] = players.map((p) => {
    const judgement = p.judgement ?? 0;
    const actualTricks = p.tricksWon;
    const roundScore = calculateRoundScore(judgement, actualTricks);
    const newTotal = p.totalScore + roundScore;

    return {
      playerId: p.id,
      playerName: p.name,
      judgement,
      actualTricks,
      roundScore,
      totalScore: newTotal,
      rank: 1, // Will assign rank below
    };
  });

  // Sort descending by totalScore to calculate ranks
  breakdowns.sort((a, b) => b.totalScore - a.totalScore);
  breakdowns.forEach((item, index) => {
    item.rank = index + 1;
  });

  return breakdowns;
}

export function buildCompleteScoreTable(room: InternalRoomState): {
  rounds: {
    roundNumber: number;
    cards: number;
    hukum: Suit;
    scores: Record<string, number>;
  }[];
  totalScores: Record<string, number>;
} {
  const rounds = ROUND_CONFIGS.map((config) => {
    const scores: Record<string, number> = {};
    const roundIdx = config.roundNumber - 1;

    for (const player of room.players) {
      scores[player.id] = player.roundScores[roundIdx] ?? 0;
    }

    return {
      roundNumber: config.roundNumber,
      cards: config.cardsPerPlayer,
      hukum: config.hukum,
      scores,
    };
  });

  const totalScores: Record<string, number> = {};
  for (const player of room.players) {
    totalScores[player.id] = player.totalScore;
  }

  return { rounds, totalScores };
}

export function determineGameWinner(players: InternalPlayer[]): {
  playerId: string;
  playerName: string;
  totalScore: number;
} {
  if (players.length === 0) {
    throw new Error('No players to determine winner');
  }

  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  return {
    playerId: sorted[0].id,
    playerName: sorted[0].name,
    totalScore: sorted[0].totalScore,
  };
}
