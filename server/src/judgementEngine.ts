import { InternalPlayer, InternalRoomState } from './types';

export function validateJudgement(judgement: number, cardsPerPlayer: number): boolean {
  if (!Number.isInteger(judgement)) return false;
  return judgement >= 0 && judgement <= cardsPerPlayer;
}

/**
 * Returns the player IDs in clockwise order starting immediately to the dealer's right.
 */
export function getJudgementTurnOrder(players: InternalPlayer[], dealerPlayerId: string): string[] {
  const numPlayers = players.length;
  const dealerIdx = players.findIndex((p) => p.id === dealerPlayerId);
  if (dealerIdx === -1) return players.map((p) => p.id);

  const order: string[] = [];
  for (let i = 1; i <= numPlayers; i++) {
    const nextIdx = (dealerIdx + i) % numPlayers;
    order.push(players[nextIdx].id);
  }
  return order;
}

export function areAllJudgementsSubmitted(players: InternalPlayer[]): boolean {
  return players.every((p) => p.judgement !== null);
}
