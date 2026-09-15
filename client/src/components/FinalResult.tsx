import React from 'react';
import { SUIT_SYMBOLS } from '@judgement/shared';
import { useGame } from '../context/GameContext';
import './FinalResult.css';

export const FinalResult: React.FC = () => {
  const { gameState, myPlayerId, playAgain, leaveRoom } = useGame();

  if (!gameState || gameState.phase !== 'FINAL_RESULT') return null;

  const winner = gameState.winner;
  const isMeWinner = winner?.playerId === myPlayerId;
  const matrix = gameState.completeScoreTable;

  return (
    <div className="final-result-overlay">
      <div className="glass-panel final-result-box">
        <div className="trophy-icon">🏆</div>
        <h1 className="winner-headline">JUDGEMENT CHAMPION</h1>
        <p className="winner-subtitle">
          {winner?.playerName} {isMeWinner ? '(You!)' : ''} wins with{' '}
          <strong>{winner?.totalScore}</strong> points!
        </p>

        <div className="final-leaderboard-list">
          {gameState.leaderboard.map((item) => (
            <div
              key={item.playerId}
              className={`final-leaderboard-row ${item.rank === 1 ? 'rank-1' : ''}`}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 800 }}>#{item.rank}</span>
                <span style={{ fontWeight: 700 }}>
                  {item.playerName} {item.playerId === myPlayerId ? '(You)' : ''}
                </span>
              </div>
              <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>
                {item.totalScore} pts
              </span>
            </div>
          ))}
        </div>

        {matrix && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Complete 8-Round Match Summary
            </h3>
            <table className="full-matrix-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Cards</th>
                  <th>Hukum</th>
                  {gameState.players.map((p) => (
                    <th key={p.id}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rounds.map((r) => (
                  <tr key={r.roundNumber}>
                    <td>R{r.roundNumber}</td>
                    <td>{r.cards}</td>
                    <td>{SUIT_SYMBOLS[r.hukum]}</td>
                    {gameState.players.map((p) => (
                      <td key={p.id}>{r.scores[p.id] ?? 0}</td>
                    ))}
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={3}>TOTAL</td>
                  {gameState.players.map((p) => (
                    <td key={p.id}>{matrix.totalScores[p.id] ?? 0}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="final-actions-row">
          <button className="btn btn-primary" onClick={() => playAgain()}>
            Play Again 🔄
          </button>
          <button className="btn btn-secondary" onClick={leaveRoom}>
            Exit to Home 🚪
          </button>
        </div>
      </div>
    </div>
  );
};
