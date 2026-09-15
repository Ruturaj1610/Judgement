import React from 'react';
import { SUIT_NAMES, SUIT_SYMBOLS } from '@judgement/shared';
import { useGame } from '../context/GameContext';
import { Card } from './Card';
import './PlayArea.css';

export const PlayArea: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState) return null;

  const currentTrick = gameState.currentTrick;
  const isTrickResult = gameState.phase === 'TRICK_RESULT';

  return (
    <div className="play-area-container">
      {currentTrick && currentTrick.leadSuit && (
        <div className="trick-info-banner">
          <span>Trick #{currentTrick.trickNumber}</span>
          <span>•</span>
          <span className="lead-suit-badge">
            Lead: {SUIT_SYMBOLS[currentTrick.leadSuit]} {SUIT_NAMES[currentTrick.leadSuit]}
          </span>
        </div>
      )}

      {currentTrick && currentTrick.cards.length > 0 ? (
        <div className="played-cards-grid">
          {currentTrick.cards.map((played) => {
            const isWinner =
              isTrickResult && currentTrick.winnerPlayerId === played.playerId;

            return (
              <div
                key={`${played.playerId}-${played.card.suit}-${played.card.rank}`}
                className={`played-card-slot ${isWinner ? 'is-winner' : ''}`}
              >
                <Card card={played.card} />
                <span className="played-by-name">
                  {isWinner ? `👑 ${played.playerName}` : played.playerName}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        gameState.phase === 'PLAYING_TRICK' && (
          <div className="empty-trick-placeholder">
            <span>🎴 Play a card to lead the trick</span>
          </div>
        )
      )}

      {isTrickResult && currentTrick?.winnerPlayerName && (
        <div className="trick-winner-announcement">
          🏆 {currentTrick.winnerPlayerName} won the trick!
        </div>
      )}
    </div>
  );
};
