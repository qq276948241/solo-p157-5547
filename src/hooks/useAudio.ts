import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '@/store/useAudioStore';

let globalAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioContext) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    globalAudioContext = new AC();
  }
  return globalAudioContext;
}

export function useAudio() {
  const sfxEnabled = useAudioStore((s) => s.sfxEnabled);
  const bgmEnabled = useAudioStore((s) => s.bgmEnabled);

  const bgmOscRef = useRef<OscillatorNode | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);
  const bgmIntervalRef = useRef<number | null>(null);
  const bgmStepRef = useRef(0);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.15) => {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = frequency;

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
      } catch (e) {
        /* ignore */
      }
    },
    [sfxEnabled]
  );

  const playMergeSound = useCallback(
    (level: number) => {
      if (!sfxEnabled) return;
      const baseFreq = 440 * Math.pow(1.1, Math.min(level - 1, 10));
      playTone(baseFreq, 0.08, 'square', 0.12);
      setTimeout(() => playTone(baseFreq * 1.5, 0.1, 'triangle', 0.1), 40);
    },
    [sfxEnabled, playTone]
  );

  const playMoveSound = useCallback(() => {
    if (!sfxEnabled) return;
    playTone(220, 0.03, 'square', 0.05);
  }, [sfxEnabled, playTone]);

  const playUnlockSound = useCallback(() => {
    if (!sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'triangle', 0.15), i * 80);
    });
  }, [sfxEnabled, playTone]);

  const playLevelUpSound = useCallback(() => {
    if (!sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'square', 0.18), i * 100);
    });
  }, [sfxEnabled, playTone]);

  const playGameOverSound = useCallback(() => {
    if (!sfxEnabled) return;
    const notes = [523.25, 392, 349.23, 261.63];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sawtooth', 0.1), i * 150);
    });
  }, [sfxEnabled, playTone]);

  const startBGM = useCallback(() => {
    if (!bgmEnabled) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      stopBGMInternal();

      const melody = [
        523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 783.99, 698.46,
        659.25, 587.33, 523.25, 493.88, 523.25, 587.33, 659.25, 587.33,
      ];

      bgmGainRef.current = ctx.createGain();
      bgmGainRef.current.gain.value = 0.04;
      bgmGainRef.current.connect(ctx.destination);

      const playNote = () => {
        if (!bgmGainRef.current) return;
        const note = melody[bgmStepRef.current % melody.length];
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = note;

        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.035, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(noteGain);
        noteGain.connect(bgmGainRef.current);
        osc.start(now);
        osc.stop(now + 0.32);

        bgmStepRef.current++;
      };

      playNote();
      bgmIntervalRef.current = window.setInterval(playNote, 300);
    } catch (e) {
      /* ignore */
    }
  }, [bgmEnabled]);

  const stopBGMInternal = () => {
    if (bgmIntervalRef.current !== null) {
      clearInterval(bgmIntervalRef.current);
      bgmIntervalRef.current = null;
    }
    if (bgmGainRef.current) {
      try {
        bgmGainRef.current.disconnect();
      } catch {
        /* ignore */
      }
      bgmGainRef.current = null;
    }
    bgmOscRef.current = null;
  };

  const stopBGM = useCallback(() => {
    stopBGMInternal();
  }, []);

  useEffect(() => {
    return () => {
      stopBGMInternal();
    };
  }, []);

  useEffect(() => {
    if (bgmEnabled) {
      const ctx = getAudioContext();
      if (ctx.state === 'running') {
        startBGM();
      }
    } else {
      stopBGMInternal();
    }
  }, [bgmEnabled, startBGM]);

  const ensureAudio = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      if (bgmEnabled && !bgmIntervalRef.current) {
        startBGM();
      }
    } catch {
      /* ignore */
    }
  }, [bgmEnabled, startBGM]);

  return {
    playMergeSound,
    playMoveSound,
    playUnlockSound,
    playLevelUpSound,
    playGameOverSound,
    startBGM,
    stopBGM,
    ensureAudio,
  };
}
