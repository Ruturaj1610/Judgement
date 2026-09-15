import React, { useState } from 'react';
import { SUIT_NAMES, SUIT_SYMBOLS } from '@judgement/shared';
import { useGame } from '../context/GameContext';
import { useTutorial } from '../context/TutorialContext';
import './GameInfo.css';

export const GameInfo: React.FC = () => {
  const { gameState, soundEnabled, toggleSound } = useGame();
  const { openTutorial } = useTutorial();
  const [copied, setCopied] = useState(false);

  if (!gameState) return null;

  const config = gameState.roundConfig;
  const isHukumRed = config ? config.hukum === 'H' || config.hukum === 'D' : false;

  const copyCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="game-info-bar">
      <div className="info-left-group">
        <div className="room-code-tag" onClick={copyCode} title="Click to copy room code">
          <span>CODE:</span>
          <strong>{gameState.roomCode}</strong>
          <span>{copied ? '✓' : '📋'}</span>
        </div>

        {config && (
          <div className="hukum-display-badge">
            <span className={`hukum-symbol ${isHukumRed ? 'red' : 'black'}`}>
              {SUIT_SYMBOLS[config.hukum]}
            </span>
            <span className="hukum-label">
              HUKUM: {SUIT_NAMES[config.hukum].toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="info-center-status">
        {gameState.message || 'JUDGEMENT 🎴'}
      </div>

      <div className="info-right-group">
        <div className="round-counter-pill">
          Round <strong>{gameState.currentRound}</strong> / 8
        </div>
        <button
          className="htp-bar-help-btn"
          onClick={() => openTutorial()}
          title="How to Play & Rules (Esc to close)"
        >
          ?
        </button>
        <button
          className="sound-btn"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
};
