import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './JudgementPanel.css';

export const JudgementPanel: React.FC = () => {
  const { gameState, myPlayerId, submitJudgement } = useGame();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!gameState || !myPlayerId) return null;

  const isJudgementPhase = gameState.phase === 'JUDGEMENT';
  const isRevealPhase = gameState.phase === 'JUDGEMENT_REVEAL';

  if (!isJudgementPhase && !isRevealPhase) return null;

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const isMyTurnToJudge =
    isJudgementPhase && gameState.currentTurnPlayerId === myPlayerId;
  const cardsPerPlayer = gameState.roundConfig?.cardsPerPlayer ?? 8;

  const currentJudgePlayer = gameState.players.find(
    (p) => p.id === gameState.currentTurnPlayerId
  );

  const handleSubmit = async () => {
    if (selectedNumber === null) return;
    setIsSubmitting(true);
    await submitJudgement(selectedNumber);
    setIsSubmitting(false);
  };

  // If in Reveal phase: Show table with everyone's revealed judgement!
  if (isRevealPhase) {
    return (
      <div className="judgement-overlay">
        <div className="glass-panel judgement-box">
          <h2 className="judgement-title">⚖️ Judgements Revealed</h2>
          <p className="judgement-subtitle">Tricks predicted for this round</p>

          <table className="reveal-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Judgement</th>
                <th>Score So Far</th>
              </tr>
            </thead>
            <tbody>
              {gameState.players.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.name} {p.id === myPlayerId ? '(You)' : ''}
                  </td>
                  <td className="number-cell">{p.judgement ?? 0}</td>
                  <td>{p.totalScore} pts</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="judgement-subtitle" style={{ marginTop: '12px' }}>
            Get ready — trick play starting soon!
          </p>
        </div>
      </div>
    );
  }

  // If it's my turn to judge and I haven't submitted yet
  if (isMyTurnToJudge && myPlayer?.judgement === null) {
    const options = Array.from({ length: cardsPerPlayer + 1 }, (_, i) => i);

    return (
      <div className="judgement-overlay">
        <div className="glass-panel judgement-box">
          <h2 className="judgement-title">Make Your Judgement</h2>
          <p className="judgement-subtitle">
            How many tricks will you win out of {cardsPerPlayer}?
          </p>

          <div className="judgement-grid">
            {options.map((num) => (
              <button
                key={num}
                className={`judgement-btn ${selectedNumber === num ? 'selected' : ''}`}
                onClick={() => setSelectedNumber(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            disabled={selectedNumber === null || isSubmitting}
            onClick={handleSubmit}
            style={{ width: '100%', maxWidth: '240px' }}
          >
            {isSubmitting ? 'Submitting...' : 'Lock Judgement'}
          </button>
        </div>
      </div>
    );
  }

  // If waiting for another player or already judged
  return (
    <div className="judgement-overlay">
      <div className="glass-panel judgement-box">
        <h2 className="judgement-title">Judgement Phase</h2>
        {myPlayer?.judgement !== null ? (
          <div className="judgement-waiting-badge">
            <span>✓ You predicted <strong>{myPlayer?.judgement}</strong> trick(s)</span>
          </div>
        ) : null}

        <p className="judgement-subtitle">
          Waiting for <strong>{currentJudgePlayer?.name ?? 'player'}</strong> to judge...
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {gameState.players.map((p) => (
            <span
              key={p.id}
              style={{
                fontSize: '0.8rem',
                padding: '3px 8px',
                borderRadius: '8px',
                background: p.hasJudged ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: p.hasJudged ? 'var(--accent-emerald)' : 'var(--text-muted)',
                border: `1px solid ${p.hasJudged ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`,
              }}
            >
              {p.hasJudged ? '✓ ' : '⏳ '}
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
