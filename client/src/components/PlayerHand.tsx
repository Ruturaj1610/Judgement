import React, { useMemo } from 'react';
import { canPlayCard, Card as CardType, sortHand } from '@judgement/shared';
import { useGame } from '../context/GameContext';
import { Card } from './Card';
import './PlayerHand.css';

export const PlayerHand: React.FC = () => {
  const { gameState, myPlayerId, playCard } = useGame();

  if (!gameState || !myPlayerId) return null;

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const isMyTurn =
    gameState.phase === 'PLAYING_TRICK' && gameState.currentTurnPlayerId === myPlayerId;
  const leadSuit = gameState.currentTrick?.leadSuit ?? null;
  const hukum = gameState.roundConfig?.hukum;

  // Sort hand logically (hukum first, then grouped by suit and rank descending)
  const sortedCards = useMemo(() => {
    return sortHand(gameState.myCards, hukum);
  }, [gameState.myCards, hukum]);

  const handleCardClick = (card: CardType) => {
    if (!isMyTurn) return;
    playCard(card);
  };

  return (
    <div className="player-hand-container">
      <div className={`hand-turn-banner ${isMyTurn ? 'is-my-turn' : ''}`}>
        {isMyTurn ? '✨ YOUR TURN TO PLAY' : gameState.phase === 'PLAYING_TRICK' ? 'WAITING FOR TURN...' : ''}
      </div>

      <div className="hand-cards-row">
        {sortedCards.map((card, index) => {
          const isLegal = isMyTurn ? canPlayCard(card, gameState.myCards, leadSuit) : false;
          const isDisabled = isMyTurn && !isLegal;

          return (
            <div
              key={card.id || `${card.suit}-${card.rank}-${index}`}
              className="hand-card-wrapper"
              style={{
                animation: `dealIn 0.3s ease forwards ${index * 0.04}s`,
              }}
            >
              <Card
                card={card}
                isPlayable={isMyTurn && isLegal}
                isDisabled={isDisabled}
                onClick={() => handleCardClick(card)}
              />
            </div>
          );
        })}
      </div>

      {myPlayer && (
        <div className="hand-stats-bar">
          <div className="stat-pill">
            Judged: <strong>{myPlayer.judgement !== null ? myPlayer.judgement : '—'}</strong>
          </div>
          <div className="stat-pill">
            Tricks Won: <strong>{myPlayer.tricksWon}</strong>
          </div>
          <div className="stat-pill">
            Total Score: <strong>{myPlayer.totalScore}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
