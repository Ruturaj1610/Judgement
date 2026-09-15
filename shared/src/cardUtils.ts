import { Card, PlayedCard, Rank, Suit } from './types';
import { RANK_VALUES, RANKS, SUITS } from './constants';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      });
    }
  }
  return deck;
}

export function getCardRankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

/**
 * Validates whether a specific card is legal to play given the player's hand and current trick's lead suit.
 * Follow-suit rule:
 * - If leading (leadSuit is null): any card in hand is valid.
 * - If leadSuit is set:
 *    - If player has cards matching leadSuit: MUST play a card of leadSuit.
 *    - If player has NO cards of leadSuit: OPTIONAL HUKUM!
 *      Can play Hukum card OR any other suit. Any card in hand is legal.
 */
export function canPlayCard(card: Card, hand: Card[], leadSuit: Suit | null): boolean {
  // Player must actually possess the card
  const ownsCard = hand.some((c) => c.suit === card.suit && c.rank === card.rank);
  if (!ownsCard) return false;

  // Leading: any card in hand is valid
  if (!leadSuit) return true;

  // Check if player has any cards matching leadSuit
  const hasLeadSuit = hand.some((c) => c.suit === leadSuit);

  if (hasLeadSuit) {
    // Must follow suit!
    return card.suit === leadSuit;
  }

  // Does not have lead suit -> Can play ANY card (Hukum or any discard)
  return true;
}

/**
 * Returns all legally playable cards from a player's hand.
 */
export function getPlayableCards(hand: Card[], leadSuit: Suit | null): Card[] {
  if (!leadSuit) return [...hand];
  const hasLeadSuit = hand.some((c) => c.suit === leadSuit);
  if (hasLeadSuit) {
    return hand.filter((c) => c.suit === leadSuit);
  }
  return [...hand];
}

/**
 * Determines the winning card and player of a trick according to Judgement rules:
 * Case 1: If 1 or more Hukum cards were played -> highest Hukum card wins.
 * Case 2: If no Hukum cards were played -> highest lead-suit card wins.
 */
export function determineTrickWinner(
  playedCards: PlayedCard[],
  leadSuit: Suit,
  hukum: Suit
): PlayedCard {
  if (playedCards.length === 0) {
    throw new Error('Cannot determine winner of an empty trick');
  }

  const hukumCards = playedCards.filter((p) => p.card.suit === hukum);

  if (hukumCards.length > 0) {
    // Case 1: Highest Hukum card wins
    return hukumCards.reduce((highest, current) => {
      return getCardRankValue(current.card.rank) > getCardRankValue(highest.card.rank)
        ? current
        : highest;
    });
  }

  // Case 2: No Hukum card played -> Highest lead suit card wins
  const leadCards = playedCards.filter((p) => p.card.suit === leadSuit);
  if (leadCards.length === 0) {
    // Fallback: first card played
    return playedCards[0];
  }

  return leadCards.reduce((highest, current) => {
    return getCardRankValue(current.card.rank) > getCardRankValue(highest.card.rank)
      ? current
      : highest;
  });
}

/**
 * Sorts cards for display in a player's hand:
 * Groups by suit, then by rank descending (A -> K -> ... -> 2).
 * Optional: highlight hukum suit first.
 */
export function sortHand(cards: Card[], hukum?: Suit): Card[] {
  const suitOrder: Suit[] = hukum
    ? [hukum, ...SUITS.filter((s) => s !== hukum)]
    : ['S', 'H', 'C', 'D'];

  return [...cards].sort((a, b) => {
    const suitAIdx = suitOrder.indexOf(a.suit);
    const suitBIdx = suitOrder.indexOf(b.suit);
    if (suitAIdx !== suitBIdx) {
      return suitAIdx - suitBIdx;
    }
    return getCardRankValue(b.rank) - getCardRankValue(a.rank);
  });
}
