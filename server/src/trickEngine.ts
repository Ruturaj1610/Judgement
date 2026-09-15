import { Card, canPlayCard, determineTrickWinner, PlayedCard, Suit } from '@judgement/shared';
import { InternalPlayer, InternalRoomState } from './types';

export interface CardPlayValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePlayerPlay(
  room: InternalRoomState,
  playerId: string,
  card: Card
): CardPlayValidationResult {
  if (room.phase !== 'PLAYING_TRICK') {
    return { valid: false, error: 'Not in trick playing phase' };
  }

  if (room.currentTurnPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn to play' };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { valid: false, error: 'Player not found in room' };
  }

  // Check if player owns this card
  const cardInHand = player.hand.find((c) => c.suit === card.suit && c.rank === card.rank);
  if (!cardInHand) {
    return { valid: false, error: 'Card not in your hand' };
  }

  const leadSuit = room.currentTrick?.leadSuit ?? null;

  // Validate follow-suit and optional hukum logic
  if (!canPlayCard(card, player.hand, leadSuit)) {
    return { valid: false, error: `You must follow the lead suit (${leadSuit}) if you have it!` };
  }

  return { valid: true };
}

/**
 * Returns the next player in clockwise seating order.
 */
export function getNextClockwisePlayerId(players: InternalPlayer[], currentPlayerId: string): string {
  const currentIdx = players.findIndex((p) => p.id === currentPlayerId);
  if (currentIdx === -1) return players[0].id;
  const nextIdx = (currentIdx + 1) % players.length;
  return players[nextIdx].id;
}

export { determineTrickWinner };
