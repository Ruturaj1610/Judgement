import React from 'react';
import { PlayerPublicInfo } from '@judgement/shared';
import { useGame } from '../context/GameContext';
import './OpponentDisplay.css';

interface OpponentDisplayProps {
  player: PlayerPublicInfo;
  positionClass: string;
}

export const OpponentDisplay: React.FC<OpponentDisplayProps> = ({ player, positionClass }) => {
  const { gameState } = useGame();

  const isCurrentTurn = gameState?.currentTurnPlayerId === player.id;
  const isDealer = gameState?.dealerPlayerId === player.id;

  // Render miniature card backs matching player.cardCount (NEVER real cards!)
  const cardBacks = Array.from({ length: Math.min(player.cardCount, 8) });

  return (
    <div className={`opponent-pod ${positionClass} ${isCurrentTurn ? 'is-turn' : ''}`}>
      <div className="opponent-card-backs">
        {cardBacks.map((_, i) => (
          <div key={i} className="opponent-mini-card" />
        ))}
      </div>

      <div className="opponent-info-box">
        <div className="opponent-name-row">
          <span className={`conn-dot ${player.isConnected ? 'connected' : 'disconnected'}`} />
          <span>{player.name}</span>
          {isDealer && <span className="badge-tag">DEALER</span>}
          {player.isHost && <span className="badge-tag">HOST</span>}
        </div>

        <div className="opponent-stats-row">
          <span>
            J: <strong>{player.judgement !== null ? player.judgement : player.hasJudged ? '✓' : '—'}</strong>
          </span>
          <span>
            T: <strong>{player.tricksWon}</strong>
          </span>
          <span>
            Pts: <strong>{player.totalScore}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
