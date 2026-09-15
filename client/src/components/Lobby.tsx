import React, { useState } from 'react';
import { MAX_PLAYERS, MIN_PLAYERS } from '@judgement/shared';
import { useGame } from '../context/GameContext';
import { useTutorial } from '../context/TutorialContext';
import './Lobby.css';

export const Lobby: React.FC = () => {
  const { gameState, myPlayerId, startGame, leaveRoom } = useGame();
  const { openTutorial } = useTutorial();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  if (!gameState) return null;

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;
  const playerCount = gameState.players.length;
  const canStart = isHost && playerCount >= MIN_PLAYERS;

  const copyCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    setStarting(true);
    await startGame();
    setStarting(false);
  };

  return (
    <div className="lobby-container">
      <div className="glass-panel lobby-card">
        <div className="lobby-header">
          <h2 className="lobby-title">ROOM LOBBY</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Share the code below with your friends to join
          </p>
        </div>

        <div className="room-code-display" onClick={copyCode} title="Click to copy code">
          <span className="room-code-text">{gameState.roomCode}</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </span>
        </div>

        <div className="player-count-badge">
          Connected Players: <strong>{playerCount}</strong> / {MAX_PLAYERS}
        </div>

        <div className="lobby-players-list">
          {gameState.players.map((p, idx) => (
            <div
              key={p.id}
              className={`lobby-player-row ${p.id === myPlayerId ? 'is-me' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{idx + 1}</span>
                <span style={{ fontWeight: 700 }}>
                  {p.name} {p.id === myPlayerId ? '(You)' : ''}
                </span>
              </div>
              <div>
                {p.isHost && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(245, 197, 66, 0.2)',
                      color: 'var(--accent-gold)',
                      border: '1px solid rgba(245, 197, 66, 0.4)',
                    }}
                  >
                    👑 HOST
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lobby-actions">
          {isHost ? (
            <button
              className="btn btn-primary"
              disabled={!canStart || starting}
              onClick={handleStart}
              style={{ width: '100%' }}
            >
              {starting
                ? 'Starting Game...'
                : playerCount < MIN_PLAYERS
                ? `Need at least ${MIN_PLAYERS} players to start`
                : 'Start Game Now ➔'}
            </button>
          ) : (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                padding: '10px',
                fontSize: '0.9rem',
              }}
            >
              ⏳ Waiting for host to start the game...
            </div>
          )}

          <button
            type="button"
            className="htp-lobby-help-btn"
            onClick={() => openTutorial()}
          >
            <span>📖</span> How to Play & Rules
          </button>

          <button className="btn btn-secondary" onClick={leaveRoom} style={{ width: '100%' }}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};
