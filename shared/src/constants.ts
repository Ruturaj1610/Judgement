import { Rank, RoundConfig, Suit } from './types';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const TOTAL_ROUNDS = 8;

export const SUITS: Suit[] = ['S', 'H', 'C', 'D'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  C: '♣',
  D: '♦',
};

export const SUIT_NAMES: Record<Suit, string> = {
  S: 'Spades',
  H: 'Hearts',
  C: 'Clubs',
  D: 'Diamonds',
};

export const SUIT_COLORS: Record<Suit, string> = {
  S: '#1a1a24', // deep obsidian
  H: '#e63946', // vibrant crimson
  C: '#2a9d8f', // deep emerald/teal-dark
  D: '#e76f51', // coral gold-red
};

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export const ROUND_CONFIGS: RoundConfig[] = [
  { roundNumber: 1, cardsPerPlayer: 8, hukum: 'S' },
  { roundNumber: 2, cardsPerPlayer: 7, hukum: 'H' },
  { roundNumber: 3, cardsPerPlayer: 6, hukum: 'C' },
  { roundNumber: 4, cardsPerPlayer: 5, hukum: 'D' },
  { roundNumber: 5, cardsPerPlayer: 4, hukum: 'S' },
  { roundNumber: 6, cardsPerPlayer: 3, hukum: 'H' },
  { roundNumber: 7, cardsPerPlayer: 2, hukum: 'C' },
  { roundNumber: 8, cardsPerPlayer: 1, hukum: 'D' },
];

export const PHASE_DURATIONS = {
  DEALING_ANIMATION: 1500, // ms
  JUDGEMENT_REVEAL: 2500,  // ms
  TRICK_RESULT: 2000,      // ms pause to see trick winner
  ROUND_RESULT_COUNTDOWN: 5000, // ms before next round or button click
};
