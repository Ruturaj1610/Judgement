export type Suit = 'S' | 'H' | 'C' | 'D';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // e.g. "S-A", "H-10"
}

export type GamePhase =
  | 'LOBBY'
  | 'ROUND_START'
  | 'DEALING'
  | 'JUDGEMENT'
  | 'JUDGEMENT_REVEAL'
  | 'PLAYING_TRICK'
  | 'TRICK_RESULT'
  | 'ROUND_RESULT'
  | 'LEADERBOARD'
  | 'FINAL_RESULT';

export interface RoundConfig {
  roundNumber: number; // 1 to 8
  cardsPerPlayer: number; // 8 down to 1
  hukum: Suit;
}

export interface PlayerPublicInfo {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  seatIndex: number;
  cardCount: number;
  judgement: number | null; // null if not yet judged or not revealed
  hasJudged: boolean; // whether they submitted judgement
  tricksWon: number;
  currentRoundScore: number;
  totalScore: number;
  roundScores: number[]; // Scores for rounds 1..8 completed so far
}

export interface PlayedCard {
  playerId: string;
  playerName: string;
  card: Card;
  seatIndex: number;
}

export interface TrickState {
  trickNumber: number; // 1 to cardsPerPlayer
  leadSuit: Suit | null;
  leadPlayerId: string | null;
  cards: PlayedCard[];
  winnerPlayerId: string | null;
  winnerPlayerName: string | null;
  winningCard: Card | null;
}

export interface RoundScoreBreakdown {
  playerId: string;
  playerName: string;
  judgement: number;
  actualTricks: number;
  roundScore: number;
  totalScore: number;
  rank: number;
}

export interface ClientGameState {
  roomCode: string;
  phase: GamePhase;
  currentRound: number; // 1 to 8
  roundConfig: RoundConfig | null;
  dealerPlayerId: string | null;
  firstPlayerId: string | null;
  currentTurnPlayerId: string | null;
  players: PlayerPublicInfo[];
  myCards: Card[]; // Only this player's cards!
  currentTrick: TrickState | null;
  lastTrickWinner: { playerId: string; playerName: string; card: Card } | null;
  roundScores: RoundScoreBreakdown[] | null;
  leaderboard: { playerId: string; playerName: string; totalScore: number; rank: number }[];
  completeScoreTable: {
    rounds: {
      roundNumber: number;
      cards: number;
      hukum: Suit;
      scores: Record<string, number>; // playerId -> score
    }[];
    totalScores: Record<string, number>;
  } | null;
  winner: {
    playerId: string;
    playerName: string;
    totalScore: number;
  } | null;
  message?: string;
}

// Socket Events
export interface ClientToServerEvents {
  'create-room': (data: { playerName: string }, callback: (res: { success: boolean; roomCode?: string; playerId?: string; error?: string }) => void) => void;
  'join-room': (data: { roomCode: string; playerName: string; reconnectPlayerId?: string }, callback: (res: { success: boolean; roomCode?: string; playerId?: string; error?: string }) => void) => void;
  'start-game': (callback: (res: { success: boolean; error?: string }) => void) => void;
  'submit-judgement': (data: { judgement: number }, callback: (res: { success: boolean; error?: string }) => void) => void;
  'play-card': (data: { card: Card }, callback: (res: { success: boolean; error?: string }) => void) => void;
  'next-round-ready': () => void;
  'play-again': (callback: (res: { success: boolean; error?: string }) => void) => void;
}

export interface ServerToClientEvents {
  'game-state': (state: ClientGameState) => void;
  'player-joined': (data: { playerName: string }) => void;
  'player-left': (data: { playerName: string; isHostTransferred: boolean }) => void;
  'card-played': (data: { playerId: string; playerName: string; card: Card }) => void;
  'trick-won': (data: { winnerId: string; winnerName: string; winningCard: Card }) => void;
  'judgement-submitted': (data: { playerId: string; playerName: string }) => void;
  'error-notification': (data: { message: string }) => void;
}
