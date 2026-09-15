import React from 'react';
import { useGame } from '../context/GameContext';
import { GameInfo } from './GameInfo';
import { OpponentDisplay } from './OpponentDisplay';
import { PlayArea } from './PlayArea';
import { PlayerHand } from './PlayerHand';
import { JudgementPanel } from './JudgementPanel';
import { ScoreBoard } from './ScoreBoard';
import { FinalResult } from './FinalResult';
import './GameBoard.css';

export const GameBoard: React.FC = () => {
  const { gameState, myPlayerId } = useGame();

  if (!gameState) return null;

  // Filter opponents (all players except me)
  const myPlayerIndex = gameState.players.findIndex((p) => p.id === myPlayerId);
  const totalPlayers = gameState.players.length;

  // Order opponents clockwise relative to me
  const opponents = [];
  if (myPlayerIndex !== -1) {
    for (let i = 1; i < totalPlayers; i++) {
      const idx = (myPlayerIndex + i) % totalPlayers;
      opponents.push(gameState.players[idx]);
    }
  }

  // Get layout positions based on opponent count
  const getPositionClass = (index: number, count: number): string => {
    if (count === 1) return 'pos-top';
    if (count === 2) {
      return index === 0 ? 'pos-top-left' : 'pos-top-right';
    }
    if (count === 3) {
      const positions = ['pos-left', 'pos-top', 'pos-right'];
      return positions[index] || 'pos-top';
    }
    if (count === 4) {
      const positions = ['pos-left', 'pos-top-left', 'pos-top-right', 'pos-right'];
      return positions[index] || 'pos-top';
    }
    // 5 opponents (6 players)
    const positions = ['pos-left', 'pos-top-left', 'pos-top', 'pos-top-right', 'pos-right'];
    return positions[index] || 'pos-top';
  };

  return (
    <div className="game-board-viewport">
      <div className="table-felt-surface">
        <div className="table-felt-inner-ring" />

        {/* Top Game Info Bar */}
        <GameInfo />

        {/* Opponents positioned around table */}
        {opponents.map((opp, idx) => (
          <OpponentDisplay
            key={opp.id}
            player={opp}
            positionClass={getPositionClass(idx, opponents.length)}
          />
        ))}

        {/* Center Trick Playing Area */}
        <PlayArea />

        {/* Player's Own Hand at bottom */}
        <PlayerHand />

        {/* Interactive Overlays */}
        <JudgementPanel />
        <ScoreBoard />
        <FinalResult />
      </div>
    </div>
  );
};
