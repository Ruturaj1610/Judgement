import { describe, it, expect } from 'vitest';
import {
  canPlayCard,
  Card,
  createDeck,
  determineTrickWinner,
  getPlayableCards,
  ROUND_CONFIGS,
  TOTAL_ROUNDS,
  Rank,
  Suit,
} from '@judgement/shared';
import { calculateRoundScore } from '../src/scoringEngine';
import { validateJudgement } from '../src/judgementEngine';

describe('JUDGEMENT Game Logic Tests', () => {
  describe('Deck and Round Config', () => {
    it('creates a standard 52-card deck', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
      const uniqueIds = new Set(deck.map((c) => c.id));
      expect(uniqueIds.size).toBe(52);
    });

    it('has exactly 8 rounds with correct card counts and Hukum suits', () => {
      expect(ROUND_CONFIGS).toHaveLength(8);
      expect(ROUND_CONFIGS[0]).toEqual({ roundNumber: 1, cardsPerPlayer: 8, hukum: 'S' });
      expect(ROUND_CONFIGS[1]).toEqual({ roundNumber: 2, cardsPerPlayer: 7, hukum: 'H' });
      expect(ROUND_CONFIGS[2]).toEqual({ roundNumber: 3, cardsPerPlayer: 6, hukum: 'C' });
      expect(ROUND_CONFIGS[3]).toEqual({ roundNumber: 4, cardsPerPlayer: 5, hukum: 'D' });
      expect(ROUND_CONFIGS[4]).toEqual({ roundNumber: 5, cardsPerPlayer: 4, hukum: 'S' });
      expect(ROUND_CONFIGS[5]).toEqual({ roundNumber: 6, cardsPerPlayer: 3, hukum: 'H' });
      expect(ROUND_CONFIGS[6]).toEqual({ roundNumber: 7, cardsPerPlayer: 2, hukum: 'C' });
      expect(ROUND_CONFIGS[7]).toEqual({ roundNumber: 8, cardsPerPlayer: 1, hukum: 'D' });
    });
  });

  describe('Follow-Suit and Optional Hukum Rules', () => {
    const hand: Card[] = [
      { suit: 'C', rank: '2', id: 'C-2' },
      { suit: 'C', rank: '7', id: 'C-7' },
      { suit: 'H', rank: 'A', id: 'H-A' },
      { suit: 'S', rank: 'K', id: 'S-K' },
    ];

    it('Rule 12: Must follow lead suit if player has cards matching lead suit', () => {
      // Lead suit is C. Player has C-2 and C-7.
      expect(canPlayCard({ suit: 'C', rank: '2', id: 'C-2' }, hand, 'C')).toBe(true);
      expect(canPlayCard({ suit: 'C', rank: '7', id: 'C-7' }, hand, 'C')).toBe(true);
      // Cannot play H-A or S-K
      expect(canPlayCard({ suit: 'H', rank: 'A', id: 'H-A' }, hand, 'C')).toBe(false);
      expect(canPlayCard({ suit: 'S', rank: 'K', id: 'S-K' }, hand, 'C')).toBe(false);

      const playable = getPlayableCards(hand, 'C');
      expect(playable.map((c) => c.id)).toEqual(['C-2', 'C-7']);
    });

    it('Rule 13 & 14 & 35: OPTIONAL HUKUM when player does NOT have lead suit', () => {
      const handWithoutClubs: Card[] = [
        { suit: 'H', rank: 'A', id: 'H-A' },
        { suit: 'S', rank: '7', id: 'S-7' },
        { suit: 'D', rank: '4', id: 'D-4' },
      ];
      // Lead card is 10 of Clubs. Hukum is Hearts (H).
      // Player does not have Clubs. Player has H-A (Hukum), S-7, D-4.
      // Choice 1: Player can play Hukum (H-A) to attempt to win the trick
      expect(canPlayCard({ suit: 'H', rank: 'A', id: 'H-A' }, handWithoutClubs, 'C')).toBe(true);
      // Choice 2: Player can discard normal card (S-7 or D-4) to intentionally avoid winning!
      expect(canPlayCard({ suit: 'S', rank: '7', id: 'S-7' }, handWithoutClubs, 'C')).toBe(true);
      expect(canPlayCard({ suit: 'D', rank: '4', id: 'D-4' }, handWithoutClubs, 'C')).toBe(true);

      const playable = getPlayableCards(handWithoutClubs, 'C');
      expect(playable).toHaveLength(3);
    });

    it('Leading card: any card from hand is legal', () => {
      expect(canPlayCard({ suit: 'H', rank: 'A', id: 'H-A' }, hand, null)).toBe(true);
      expect(canPlayCard({ suit: 'C', rank: '2', id: 'C-2' }, hand, null)).toBe(true);
    });
  });

  describe('Trick Winner Determination', () => {
    it('Case 1: Highest Hukum card wins when Hukum is played', () => {
      // Hukum = H. Lead = C.
      // Player A: C-K, Player B: H-4, Player C: H-Q, Player D: C-A
      const played = [
        { playerId: 'p1', playerName: 'A', card: { suit: 'C' as Suit, rank: 'K' as Rank, id: 'C-K' }, seatIndex: 0 },
        { playerId: 'p2', playerName: 'B', card: { suit: 'H' as Suit, rank: '4' as Rank, id: 'H-4' }, seatIndex: 1 },
        { playerId: 'p3', playerName: 'C', card: { suit: 'H' as Suit, rank: 'Q' as Rank, id: 'H-Q' }, seatIndex: 2 },
        { playerId: 'p4', playerName: 'D', card: { suit: 'C' as Suit, rank: 'A' as Rank, id: 'C-A' }, seatIndex: 3 },
      ];

      const winner = determineTrickWinner(played, 'C', 'H');
      expect(winner.playerId).toBe('p3'); // Player C with H-Q
    });

    it('Case 2: Highest lead-suit card wins when no Hukum is played', () => {
      // Lead suit = C. Hukum = S. Cards: C-10, C-K, C-3, C-A
      const played = [
        { playerId: 'p1', playerName: 'A', card: { suit: 'C' as Suit, rank: '10' as Rank, id: 'C-10' }, seatIndex: 0 },
        { playerId: 'p2', playerName: 'B', card: { suit: 'C' as Suit, rank: 'K' as Rank, id: 'C-K' }, seatIndex: 1 },
        { playerId: 'p3', playerName: 'C', card: { suit: 'C' as Suit, rank: '3' as Rank, id: 'C-3' }, seatIndex: 2 },
        { playerId: 'p4', playerName: 'D', card: { suit: 'C' as Suit, rank: 'A' as Rank, id: 'C-A' }, seatIndex: 3 },
      ];

      const winner = determineTrickWinner(played, 'C', 'S');
      expect(winner.playerId).toBe('p4'); // Player D with C-A
    });

    it('Rule 16: Hukumachi Utri (lead card itself is Hukum)', () => {
      // Hukum = H. Lead = H. First card: H-7.
      const played = [
        { playerId: 'p1', playerName: 'A', card: { suit: 'H' as Suit, rank: '7' as Rank, id: 'H-7' }, seatIndex: 0 },
        { playerId: 'p2', playerName: 'B', card: { suit: 'H' as Suit, rank: 'J' as Rank, id: 'H-J' }, seatIndex: 1 },
        { playerId: 'p3', playerName: 'C', card: { suit: 'H' as Suit, rank: 'A' as Rank, id: 'H-A' }, seatIndex: 2 },
      ];

      const winner = determineTrickWinner(played, 'H', 'H');
      expect(winner.playerId).toBe('p3'); // Player C with H-A
    });

    it('Discarding off-suit without Hukum cannot win against lead suit', () => {
      // Lead = D. Hukum = S. Player B discards H-A (off-suit, non-hukum).
      const played = [
        { playerId: 'p1', playerName: 'A', card: { suit: 'D' as Suit, rank: '3' as Rank, id: 'D-3' }, seatIndex: 0 },
        { playerId: 'p2', playerName: 'B', card: { suit: 'H' as Suit, rank: 'A' as Rank, id: 'H-A' }, seatIndex: 1 },
      ];

      const winner = determineTrickWinner(played, 'D', 'S');
      expect(winner.playerId).toBe('p1'); // D-3 beats off-suit H-A
    });
  });

  describe('Scoring System (Exact Judgement)', () => {
    it('awards 10 + judgement if actual == judgement', () => {
      expect(calculateRoundScore(0, 0)).toBe(10);
      expect(calculateRoundScore(1, 1)).toBe(11);
      expect(calculateRoundScore(2, 2)).toBe(12);
      expect(calculateRoundScore(3, 3)).toBe(13);
      expect(calculateRoundScore(8, 8)).toBe(18);
    });

    it('awards 0 points if actual != judgement (no negative score)', () => {
      expect(calculateRoundScore(0, 1)).toBe(0);
      expect(calculateRoundScore(3, 2)).toBe(0);
      expect(calculateRoundScore(3, 4)).toBe(0);
      expect(calculateRoundScore(5, 0)).toBe(0);
    });
  });

  describe('Judgement Validation', () => {
    it('allows 0 through cardsPerPlayer', () => {
      expect(validateJudgement(0, 8)).toBe(true);
      expect(validateJudgement(5, 8)).toBe(true);
      expect(validateJudgement(8, 8)).toBe(true);
      expect(validateJudgement(-1, 8)).toBe(false);
      expect(validateJudgement(9, 8)).toBe(false);
      expect(validateJudgement(1.5, 8)).toBe(false);
    });
  });
});
