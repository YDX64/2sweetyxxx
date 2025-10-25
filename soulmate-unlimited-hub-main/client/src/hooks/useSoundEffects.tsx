
import { useCallback, useRef } from 'react';

interface SoundEffectsHook {
  playMatchSound: () => void;
  playSwipeSound: () => void;
  playSuperLikeSound: () => void;
  playNotificationSound: () => void;
}

// Modern Context7 pattern: Type-safe WebKit audio context support
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const useSoundEffects = (): SoundEffectsHook => {
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContext.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContext.current = new AudioContextClass();
      }
    }
    return audioContext.current;
  }, []);

  // Create oscillator tone
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Sound playback not available:', error);
    }
  }, [getAudioContext]);

  // Play celebration sound for matches
  const playMatchSound = useCallback(() => {
    try {
      // Play a happy melody
      playTone(523.25, 0.2); // C5
      setTimeout(() => playTone(659.25, 0.2), 100); // E5
      setTimeout(() => playTone(783.99, 0.3), 200); // G5
    } catch (error) {
      console.log('Match sound failed:', error);
    }
  }, [playTone]);

  // Play subtle swipe sound
  const playSwipeSound = useCallback(() => {
    try {
      playTone(440, 0.1, 'triangle');
    } catch (error) {
      console.log('Swipe sound failed:', error);
    }
  }, [playTone]);

  // Play special sound for super likes
  const playSuperLikeSound = useCallback(() => {
    try {
      // Play a sparkly sound
      playTone(880, 0.15);
      setTimeout(() => playTone(1108.73, 0.15), 50);
      setTimeout(() => playTone(1318.51, 0.2), 100);
    } catch (error) {
      console.log('Super like sound failed:', error);
    }
  }, [playTone]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      playTone(800, 0.2);
      setTimeout(() => playTone(600, 0.2), 100);
    } catch (error) {
      console.log('Notification sound failed:', error);
    }
  }, [playTone]);

  return {
    playMatchSound,
    playSwipeSound,
    playSuperLikeSound,
    playNotificationSound
  };
};
