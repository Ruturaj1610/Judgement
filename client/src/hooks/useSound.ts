import { useCallback, useEffect, useState } from 'react';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('judgement_sound');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('judgement_sound', String(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const playCardDeal = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }, [soundEnabled]);

  const playCardPlay = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }, [soundEnabled]);

  const playTrickWin = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    // Pleasant ascending chime
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.36);
    });
  }, [soundEnabled]);

  const playJudgementSubmit = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, [soundEnabled]);

  const playVictory = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    // Victory fanfare notes
    const fanfare = [
      { freq: 523.25, time: 0, dur: 0.15 },
      { freq: 659.25, time: 0.15, dur: 0.15 },
      { freq: 783.99, time: 0.3, dur: 0.15 },
      { freq: 1046.5, time: 0.45, dur: 0.5 },
    ];
    fanfare.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.time);
      osc.stop(ctx.currentTime + n.time + n.dur + 0.05);
    });
  }, [soundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    playCardDeal,
    playCardPlay,
    playTrickWin,
    playJudgementSubmit,
    playVictory,
  };
}
