import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTutorial } from '../context/TutorialContext';
import './HomeScreen.css';

export const HomeScreen: React.FC = () => {
  const { createRoom, joinRoom, error, clearError } = useGame();
  const { openTutorial } = useTutorial();

  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState(() => sessionStorage.getItem('judgement_playerName') || '');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('judgement_has_seen_tutorial');
  });

  const handleOnboardingHowToPlay = () => {
    localStorage.setItem('judgement_has_seen_tutorial', 'true');
    setShowOnboarding(false);
    openTutorial();
  };

  const handleOnboardingDismiss = () => {
    localStorage.setItem('judgement_has_seen_tutorial', 'true');
    setShowOnboarding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setLoading(true);
    clearError();

    if (mode === 'create') {
      await createRoom(playerName.trim());
    } else {
      if (!roomCode.trim()) {
        setLoading(false);
        return;
      }
      await joinRoom(roomCode.trim(), playerName.trim());
    }
    setLoading(false);
  };

  return (
    <div className="home-container">
      <div className="home-decorations" />

      <div className="glass-panel home-content-card">
        <div className="logo-container">
          <h1 className="game-title">JUDGEMENT</h1>
          <span style={{ fontSize: '2.5rem' }}>🎴</span>
          <p className="game-subtitle">Real-Time Multiplayer Card Strategy</p>
        </div>

        <div className="home-mode-switch">
          <button
            type="button"
            className={`mode-tab ${mode === 'create' ? 'active' : ''}`}
            onClick={() => {
              setMode('create');
              clearError();
            }}
          >
            Create Room
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === 'join' ? 'active' : ''}`}
            onClick={() => {
              setMode('join');
              clearError();
            }}
          >
            Join with Code
          </button>
        </div>

        {showOnboarding && (
          <div className="htp-onboarding-banner">
            <span className="htp-onboarding-title">NEW TO JUDGEMENT? 🎴</span>
            <span className="htp-onboarding-subtitle">
              Learn the rules, secret bidding, and trick strategy in 2 minutes.
            </span>
            <div className="htp-onboarding-buttons">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOnboardingHowToPlay}
              >
                HOW TO PLAY
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleOnboardingDismiss}
              >
                I'LL FIGURE IT OUT
              </button>
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <form className="home-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="player-name-input">
              Your Name
            </label>
            <input
              id="player-name-input"
              type="text"
              className="text-input"
              placeholder="e.g. Ruturaj"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              required
            />
          </div>

          {mode === 'join' && (
            <div className="input-group">
              <label className="input-label" htmlFor="room-code-input">
                Room Code
              </label>
              <input
                id="room-code-input"
                type="text"
                className="text-input"
                placeholder="6-character code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !playerName.trim() || (mode === 'join' && !roomCode.trim())}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Connecting...' : mode === 'create' ? 'Create New Room ➔' : 'Join Room ➔'}
          </button>
        </form>

        <button
          type="button"
          className="htp-home-help-btn"
          onClick={() => openTutorial()}
        >
          <span>📖</span> HOW TO PLAY & RULES
        </button>

        <div className="rules-preview">
          ♠ 8 Rounds • 2 to 6 Players • Predict Your Hands • Optional Hukum
        </div>
      </div>
    </div>
  );
};
