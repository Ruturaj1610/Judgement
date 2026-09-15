import {
  Card,
  MIN_PLAYERS,
  ROUND_CONFIGS,
  TOTAL_ROUNDS,
} from '@judgement/shared';
import { createAndShuffleDeck, dealCards } from './deckEngine';
import { areAllJudgementsSubmitted, getJudgementTurnOrder, validateJudgement } from './judgementEngine';
import {
  buildCompleteScoreTable,
  computeRoundResults,
  determineGameWinner,
} from './scoringEngine';
import { determineTrickWinner, getNextClockwisePlayerId, validatePlayerPlay } from './trickEngine';
import { InternalPlayer, InternalRoomState } from './types';

export class GameEngine {
  private onStateChange: (room: InternalRoomState) => void;

  constructor(onStateChange: (room: InternalRoomState) => void) {
    this.onStateChange = onStateChange;
  }

  public startGame(room: InternalRoomState): { success: boolean; error?: string } {
    if (room.players.length < MIN_PLAYERS) {
      return { success: false, error: `At least ${MIN_PLAYERS} players are required to start.` };
    }

    // Reset all scores
    for (const p of room.players) {
      p.totalScore = 0;
      p.roundScores = [];
      p.currentRoundScore = 0;
    }

    room.currentRound = 1;
    // Random dealer for round 1
    const randomDealerIdx = Math.floor(Math.random() * room.players.length);
    room.dealerPlayerId = room.players[randomDealerIdx].id;

    this.startRound(room);
    return { success: true };
  }

  public startRound(room: InternalRoomState): void {
    const roundIdx = room.currentRound - 1;
    const config = ROUND_CONFIGS[roundIdx];
    room.roundConfig = config;

    // Handle dealer and first player
    // First player is immediately clockwise (right) of dealer
    const numPlayers = room.players.length;
    let dealerIdx = room.players.findIndex((p) => p.id === room.dealerPlayerId);
    if (dealerIdx === -1) dealerIdx = 0;

    if (room.currentRound > 1) {
      // Rotate dealer 1 position clockwise for subsequent rounds
      dealerIdx = (dealerIdx + 1) % numPlayers;
      room.dealerPlayerId = room.players[dealerIdx].id;
    }

    // First player is immediately clockwise from dealer
    const firstPlayerIdx = (dealerIdx + 1) % numPlayers;
    room.firstPlayerId = room.players[firstPlayerIdx].id;

    // Reset per-round states
    for (const p of room.players) {
      p.hand = [];
      p.judgement = null;
      p.tricksWon = 0;
      p.currentRoundScore = 0;
    }

    room.currentTrick = null;
    room.lastTrickWinner = null;
    room.roundScoresBreakdown = null;
    room.phase = 'DEALING';
    room.statusMessage = `Dealing cards for Round ${room.currentRound} (${config.cardsPerPlayer} cards, Hukum: ${config.hukum})...`;
    this.onStateChange(room);

    // Deal cards
    const deck = createAndShuffleDeck();
    const playerIds = room.players.map((p) => p.id);
    const { hands } = dealCards(deck, playerIds, config.cardsPerPlayer);

    for (const p of room.players) {
      p.hand = hands.get(p.id) ?? [];
    }

    // Transition to JUDGEMENT after dealing animation
    setTimeout(() => {
      room.phase = 'JUDGEMENT';
      room.currentTurnPlayerId = room.firstPlayerId;
      const firstJudge = room.players.find((p) => p.id === room.firstPlayerId);
      room.statusMessage = `${firstJudge?.name ?? 'First player'} is making a judgement...`;
      this.onStateChange(room);
    }, 1200);
  }

  public submitJudgement(
    room: InternalRoomState,
    playerId: string,
    judgement: number
  ): { success: boolean; error?: string } {
    if (room.phase !== 'JUDGEMENT') {
      return { success: false, error: 'Not in judgement phase' };
    }

    if (room.currentTurnPlayerId !== playerId) {
      return { success: false, error: 'Not your turn to judge' };
    }

    const cardsPerPlayer = room.roundConfig?.cardsPerPlayer ?? 8;
    if (!validateJudgement(judgement, cardsPerPlayer)) {
      return { success: false, error: `Judgement must be an integer between 0 and ${cardsPerPlayer}` };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.judgement = judgement;

    // Check if everyone has judged
    if (areAllJudgementsSubmitted(room.players)) {
      // Transition to JUDGEMENT_REVEAL
      room.phase = 'JUDGEMENT_REVEAL';
      room.currentTurnPlayerId = null;
      room.statusMessage = 'All judgements submitted! Revealing judgements...';
      this.onStateChange(room);

      // Pause for reveal, then start trick play
      setTimeout(() => {
        this.startFirstTrick(room);
      }, 2500);
    } else {
      // Find next player in turn order
      const order = getJudgementTurnOrder(room.players, room.dealerPlayerId!);
      const nextJudgeId = order.find((id) => {
        const p = room.players.find((pl) => pl.id === id);
        return p && p.judgement === null;
      });

      if (nextJudgeId) {
        room.currentTurnPlayerId = nextJudgeId;
        const nextPlayer = room.players.find((p) => p.id === nextJudgeId);
        room.statusMessage = `${nextPlayer?.name ?? 'Player'} is making a judgement...`;
      }
      this.onStateChange(room);
    }

    return { success: true };
  }

  private startFirstTrick(room: InternalRoomState): void {
    room.phase = 'PLAYING_TRICK';
    room.currentTurnPlayerId = room.firstPlayerId;
    room.currentTrick = {
      trickNumber: 1,
      leadSuit: null,
      leadPlayerId: room.firstPlayerId,
      cards: [],
      winnerPlayerId: null,
      winnerPlayerName: null,
      winningCard: null,
    };

    const leadPlayer = room.players.find((p) => p.id === room.firstPlayerId);
    room.statusMessage = `${leadPlayer?.name ?? 'First player'}'s turn to lead Trick 1.`;
    this.onStateChange(room);
  }

  public playCard(
    room: InternalRoomState,
    playerId: string,
    card: Card
  ): { success: boolean; error?: string } {
    const validation = validatePlayerPlay(room, playerId, card);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const player = room.players.find((p) => p.id === playerId)!;
    // Remove card from player hand
    const cardIndex = player.hand.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
    if (cardIndex !== -1) {
      player.hand.splice(cardIndex, 1);
    }

    if (!room.currentTrick) {
      return { success: false, error: 'No active trick' };
    }

    // If first card in this trick, set lead suit
    if (room.currentTrick.cards.length === 0) {
      room.currentTrick.leadSuit = card.suit;
      room.currentTrick.leadPlayerId = playerId;
    }

    room.currentTrick.cards.push({
      playerId,
      playerName: player.name,
      card,
      seatIndex: player.seatIndex,
    });

    // Check if everyone has played for this trick
    if (room.currentTrick.cards.length === room.players.length) {
      // Trick is complete
      this.resolveTrick(room);
    } else {
      // Pass turn to next clockwise player
      const nextPlayerId = getNextClockwisePlayerId(room.players, playerId);
      room.currentTurnPlayerId = nextPlayerId;
      const nextPlayer = room.players.find((p) => p.id === nextPlayerId);
      room.statusMessage = `${nextPlayer?.name}'s turn to play.`;
      this.onStateChange(room);
    }

    return { success: true };
  }

  private resolveTrick(room: InternalRoomState): void {
    if (!room.currentTrick || !room.roundConfig) return;

    room.phase = 'TRICK_RESULT';
    const winningPlayedCard = determineTrickWinner(
      room.currentTrick.cards,
      room.currentTrick.leadSuit!,
      room.roundConfig.hukum
    );

    const winner = room.players.find((p) => p.id === winningPlayedCard.playerId);
    if (winner) {
      winner.tricksWon += 1;
    }

    room.currentTrick.winnerPlayerId = winningPlayedCard.playerId;
    room.currentTrick.winnerPlayerName = winningPlayedCard.playerName;
    room.currentTrick.winningCard = winningPlayedCard.card;

    room.lastTrickWinner = {
      playerId: winningPlayedCard.playerId,
      playerName: winningPlayedCard.playerName,
      card: winningPlayedCard.card,
    };

    room.statusMessage = `${winningPlayedCard.playerName} wins the trick with ${winningPlayedCard.card.suit}${winningPlayedCard.card.rank}!`;
    this.onStateChange(room);

    // Pause briefly to show trick winner
    setTimeout(() => {
      // Check if round is over (no cards left in hand)
      const cardsRemaining = room.players[0].hand.length;
      if (cardsRemaining === 0) {
        this.endRound(room);
      } else {
        // Next trick: winner leads!
        const nextTrickNumber = room.currentTrick!.trickNumber + 1;
        room.phase = 'PLAYING_TRICK';
        room.currentTurnPlayerId = winningPlayedCard.playerId;
        room.currentTrick = {
          trickNumber: nextTrickNumber,
          leadSuit: null,
          leadPlayerId: winningPlayedCard.playerId,
          cards: [],
          winnerPlayerId: null,
          winnerPlayerName: null,
          winningCard: null,
        };
        room.statusMessage = `${winningPlayedCard.playerName}'s turn to lead Trick ${nextTrickNumber}.`;
        this.onStateChange(room);
      }
    }, 2200);
  }

  private endRound(room: InternalRoomState): void {
    room.phase = 'ROUND_RESULT';
    const breakdowns = computeRoundResults(room.players);
    room.roundScoresBreakdown = breakdowns;

    // Apply scores to players
    for (const b of breakdowns) {
      const p = room.players.find((pl) => pl.id === b.playerId);
      if (p) {
        p.currentRoundScore = b.roundScore;
        p.totalScore = b.totalScore;
        p.roundScores.push(b.roundScore);
      }
    }

    room.completeScoreTable = buildCompleteScoreTable(room);

    if (room.currentRound >= TOTAL_ROUNDS) {
      // Final result!
      room.phase = 'FINAL_RESULT';
      room.winner = determineGameWinner(room.players);
      room.statusMessage = `🏆 Game Over! ${room.winner.playerName} is the JUDGEMENT Champion!`;
      this.onStateChange(room);
    } else {
      room.statusMessage = `Round ${room.currentRound} Complete!`;
      this.onStateChange(room);
    }
  }

  public nextRoundReady(room: InternalRoomState): void {
    if (room.phase !== 'ROUND_RESULT') return;
    if (room.currentRound >= TOTAL_ROUNDS) return;

    room.currentRound += 1;
    this.startRound(room);
  }

  public playAgain(room: InternalRoomState): { success: boolean; error?: string } {
    if (room.phase !== 'FINAL_RESULT') {
      return { success: false, error: 'Game is not finished' };
    }

    // Reset everything back to lobby or start a new game
    for (const p of room.players) {
      p.hand = [];
      p.judgement = null;
      p.tricksWon = 0;
      p.currentRoundScore = 0;
      p.totalScore = 0;
      p.roundScores = [];
    }
    room.phase = 'LOBBY';
    room.currentRound = 0;
    room.roundConfig = null;
    room.dealerPlayerId = null;
    room.firstPlayerId = null;
    room.currentTurnPlayerId = null;
    room.currentTrick = null;
    room.lastTrickWinner = null;
    room.roundScoresBreakdown = null;
    room.completeScoreTable = null;
    room.winner = null;
    room.statusMessage = 'Waiting in lobby for host to start a new game...';
    this.onStateChange(room);
    return { success: true };
  }
}
