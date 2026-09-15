import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Card, ClientGameState } from '@judgement/shared';
import { socket } from '../socket';
import { useSound } from '../hooks/useSound';

interface GameContextType {
  gameState: ClientGameState | null;
  myPlayerId: string | null;
  myPlayerName: string;
  isConnected: boolean;
  error: string | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  createRoom: (name: string) => Promise<boolean>;
  joinRoom: (code: string, name: string) => Promise<boolean>;
  startGame: () => Promise<boolean>;
  submitJudgement: (value: number) => Promise<boolean>;
  playCard: (card: Card) => Promise<boolean>;
  nextRoundReady: () => void;
  playAgain: () => Promise<boolean>;
  leaveRoom: () => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(() => sessionStorage.getItem('judgement_playerId'));
  const [myPlayerName, setMyPlayerName] = useState<string>(() => sessionStorage.getItem('judgement_playerName') || '');
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [error, setError] = useState<string | null>(null);

  const {
    soundEnabled,
    toggleSound,
    playCardDeal,
    playCardPlay,
    playTrickWin,
    playJudgementSubmit,
    playVictory,
  } = useSound();

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    // Sync immediately in case socket already connected before this effect ran.
    // This resolves the race condition where autoConnect fires before React mounts.
    setIsConnected(socket.connected);

    const handleConnect = () => {
      setIsConnected(true);
      // Attempt auto-reconnect if session exists
      const savedCode = sessionStorage.getItem('judgement_roomCode');
      const savedId = sessionStorage.getItem('judgement_playerId');
      const savedName = sessionStorage.getItem('judgement_playerName');
      if (savedCode && savedId && savedName) {
        socket.emit(
          'join-room',
          { roomCode: savedCode, playerName: savedName, reconnectPlayerId: savedId },
          (res) => {
            if (!res.success) {
              sessionStorage.removeItem('judgement_roomCode');
              sessionStorage.removeItem('judgement_playerId');
            }
          }
        );
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleGameState = (state: ClientGameState) => {
      setGameState((prevState) => {
        // Trigger sound effects based on phase transitions
        if (state.phase === 'DEALING' && prevState?.phase !== 'DEALING') {
          playCardDeal();
        } else if (state.phase === 'FINAL_RESULT' && prevState?.phase !== 'FINAL_RESULT') {
          playVictory();
        }
        return state;
      });
    };

    const handleCardPlayed = () => {
      playCardPlay();
    };

    const handleTrickWon = () => {
      playTrickWin();
    };

    const handleJudgementSubmitted = () => {
      playJudgementSubmit();
    };

    const handleErrorNotification = ({ message }: { message: string }) => {
      setError(message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('game-state', handleGameState);
    socket.on('card-played', handleCardPlayed);
    socket.on('trick-won', handleTrickWon);
    socket.on('judgement-submitted', handleJudgementSubmitted);
    socket.on('error-notification', handleErrorNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('game-state', handleGameState);
      socket.off('card-played', handleCardPlayed);
      socket.off('trick-won', handleTrickWon);
      socket.off('judgement-submitted', handleJudgementSubmitted);
      socket.off('error-notification', handleErrorNotification);
    };
  }, [playCardDeal, playCardPlay, playTrickWin, playJudgementSubmit, playVictory]);

  const createRoom = useCallback(async (name: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setError(null);
      socket.emit('create-room', { playerName: name }, (res) => {
        if (res.success && res.roomCode && res.playerId) {
          setMyPlayerId(res.playerId);
          setMyPlayerName(name);
          sessionStorage.setItem('judgement_playerId', res.playerId);
          sessionStorage.setItem('judgement_playerName', name);
          sessionStorage.setItem('judgement_roomCode', res.roomCode);
          resolve(true);
        } else {
          setError(res.error || 'Failed to create room');
          resolve(false);
        }
      });
    });
  }, []);

  const joinRoom = useCallback(async (code: string, name: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setError(null);
      socket.emit('join-room', { roomCode: code, playerName: name }, (res) => {
        if (res.success && res.roomCode && res.playerId) {
          setMyPlayerId(res.playerId);
          setMyPlayerName(name);
          sessionStorage.setItem('judgement_playerId', res.playerId);
          sessionStorage.setItem('judgement_playerName', name);
          sessionStorage.setItem('judgement_roomCode', res.roomCode);
          resolve(true);
        } else {
          setError(res.error || 'Failed to join room');
          resolve(false);
        }
      });
    });
  }, []);

  const startGame = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setError(null);
      socket.emit('start-game', (res) => {
        if (res.success) {
          resolve(true);
        } else {
          setError(res.error || 'Failed to start game');
          resolve(false);
        }
      });
    });
  }, []);

  const submitJudgement = useCallback(async (value: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setError(null);
      socket.emit('submit-judgement', { judgement: value }, (res) => {
        if (res.success) {
          resolve(true);
        } else {
          setError(res.error || 'Failed to submit judgement');
          resolve(false);
        }
      });
    });
  }, []);

  const playCard = useCallback(async (card: Card): Promise<boolean> => {
    return new Promise((resolve) => {
      setError(null);
      socket.emit('play-card', { card }, (res) => {
        if (res.success) {
          resolve(true);
        } else {
          setError(res.error || 'Illegal move');
          resolve(false);
        }
      });
    });
  }, []);

  const nextRoundReady = useCallback(() => {
    socket.emit('next-round-ready');
  }, []);

  const playAgain = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      socket.emit('play-again', (res) => {
        if (res.success) {
          resolve(true);
        } else {
          setError(res.error || 'Could not restart game');
          resolve(false);
        }
      });
    });
  }, []);

  const leaveRoom = useCallback(() => {
    sessionStorage.removeItem('judgement_playerId');
    sessionStorage.removeItem('judgement_roomCode');
    setGameState(null);
    setMyPlayerId(null);
    window.location.reload();
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        myPlayerId,
        myPlayerName,
        isConnected,
        error,
        soundEnabled,
        toggleSound,
        createRoom,
        joinRoom,
        startGame,
        submitJudgement,
        playCard,
        nextRoundReady,
        playAgain,
        leaveRoom,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
