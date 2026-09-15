import React from 'react';
import { useGame } from '../context/GameContext';
import './ScoreBoard.css';

export const ScoreBoard: React.FC = () => {
  const { gameState, myPlayerId, nextRoundReady } = useGame();

  if (!gameState || gameState.phase !== 'ROUND_RESULT') return null;

  const breakdowns = gameState.roundScores || [];
  const currentRound = gameState.currentRound;

  return (
    <div className="scoreboard-overlay">
      <div className="glass-panel scoreboard-box">
        <h2 className="scoreboard-title">Round {currentRound} Complete</h2>

        <table className="scoreboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Judged</th>
              <th>Won</th>
              <th>Round</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {breakdowns.map((b) => {
              const isMe = b.playerId === myPlayerId;
              const isCorrect = b.judgement === b.actualTricks;

              return (
                <tr key={b.playerId} className={isMe ? 'my-row' : ''}>
                  <td>#{b.rank}</td>
                  <td style={{ fontWeight: 700 }}>
                    {b.playerName} {isMe ? '(You)' : ''}
                  </td>
                  <td>{b.judgement}</td>
                  <td>{b.actualTricks}</td>
                  <td className={isCorrect ? 'score-success' : 'score-fail'}>
                    {isCorrect ? `+${b.roundScore}` : '+0'}
                  </td>
                  <td className="total-score-badge">{b.totalScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="next-round-btn-row">
          <button className="btn btn-primary" onClick={nextRoundReady}>
            {currentRound < 8 ? `Start Round ${currentRound + 1} ➔` : 'View Final Results 🏆'}
          </button>
        </div>
      </div>
    </div>
  );
};
