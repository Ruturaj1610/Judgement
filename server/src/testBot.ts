import { io } from 'socket.io-client';

const roomCode = process.argv[2];
const botName = process.argv[3] || 'Alex (Bot)';

if (!roomCode) {
  console.error('Usage: tsx src/testBot.ts <ROOM_CODE> [BOT_NAME]');
  process.exit(1);
}

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log(`[Bot] Connected as ${socket.id}, joining room ${roomCode}...`);
  socket.emit('join-room', { roomCode, playerName: botName }, (res) => {
    console.log('[Bot] Join response:', res);
  });
});

socket.on('game-state', (state) => {
  console.log(`[Bot] State phase: ${state.phase}, turn: ${state.currentTurnPlayerId}`);

  // Auto-judge if it's bot's turn
  const me = state.players.find((p) => p.name === botName);
  if (!me) return;

  if (state.phase === 'JUDGEMENT' && state.currentTurnPlayerId === me.id && me.judgement === null) {
    const cardsPerPlayer = state.roundConfig?.cardsPerPlayer ?? 8;
    const guess = Math.floor(Math.random() * (cardsPerPlayer + 1));
    console.log(`[Bot] Submitting judgement: ${guess}`);
    socket.emit('submit-judgement', { judgement: guess }, (res) => {
      console.log('[Bot] Judgement res:', res);
    });
  }

  // Auto-play card if it's bot's turn
  if (state.phase === 'PLAYING_TRICK' && state.currentTurnPlayerId === me.id) {
    setTimeout(() => {
      const leadSuit = state.currentTrick?.leadSuit;
      const myCards = state.myCards;
      const matching = leadSuit ? myCards.filter((c) => c.suit === leadSuit) : [];
      const cardToPlay = matching.length > 0 ? matching[0] : myCards[0];
      if (cardToPlay) {
        console.log(`[Bot] Playing card: ${cardToPlay.suit}${cardToPlay.rank}`);
        socket.emit('play-card', { card: cardToPlay }, (res) => {
          console.log('[Bot] Play card res:', res);
        });
      }
    }, 800);
  }
});
