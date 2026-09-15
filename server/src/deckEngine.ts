import { Card, createDeck } from '@judgement/shared';

export function createAndShuffleDeck(): Card[] {
  const deck = createDeck();
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function dealCards(
  deck: Card[],
  playerIds: string[],
  cardsPerPlayer: number
): { hands: Map<string, Card[]>; remainingDeck: Card[] } {
  const hands = new Map<string, Card[]>();
  playerIds.forEach((id) => hands.set(id, []));

  let deckIndex = 0;
  // Deal round-robin one card at a time for authenticity
  for (let round = 0; round < cardsPerPlayer; round++) {
    for (const id of playerIds) {
      if (deckIndex < deck.length) {
        hands.get(id)!.push(deck[deckIndex]);
        deckIndex++;
      }
    }
  }

  const remainingDeck = deck.slice(deckIndex);
  return { hands, remainingDeck };
}
