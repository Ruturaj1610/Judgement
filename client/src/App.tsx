import React, { useState, useEffect, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { TutorialProvider, useTutorial } from './context/TutorialContext';
import { HowToPlay } from './components/HowToPlay';
import { HomeScreen } from './components/HomeScreen';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import './App.css';

const MainView: React.FC = () => {
  const { gameState, isConnected } = useGame();
  const { isTutorialOpen, closeTutorial, initialSection } = useTutorial();

  // Track whether we have ever successfully connected this session.
  // This lets us show the right banner message (connecting vs reconnecting)
  // and prevents a brief flash on fast connections by delaying banner display.
  const [showBanner, setShowBanner] = useState(false);
  const hasEverConnected = useRef(false);

  useEffect(() => {
    if (isConnected) {
      hasEverConnected.current = true;
      setShowBanner(false);
      return;
    }

    // Not connected — delay showing the banner by 600ms to avoid a
    // brief flash when the socket connects almost immediately on page load.
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [isConnected]);

  const bannerMessage = hasEverConnected.current
    ? '⚠️ Connection lost. Reconnecting to JUDGEMENT server...'
    : '⚠️ Connecting to JUDGEMENT game server...';

  return (
    <div className="app-root">
      {showBanner && (
        <div className="connection-banner">
          {bannerMessage}
        </div>
      )}

      {!gameState ? (
        <HomeScreen />
      ) : gameState.phase === 'LOBBY' ? (
        <Lobby />
      ) : (
        <GameBoard />
      )}

      {isTutorialOpen && (
        <HowToPlay onClose={closeTutorial} startSection={initialSection} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <TutorialProvider>
        <MainView />
      </TutorialProvider>
    </GameProvider>
  );
};

export default App;
