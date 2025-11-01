
import { useEffect, useState } from 'react';

interface MatchCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const MatchCelebration = ({ isVisible, onComplete }: MatchCelebrationProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    emoji: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        emoji: ['💕', '❤️', '💖', '✨', '⭐', '🌟'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 2
      }));
      
      setParticles(newParticles);

      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-bounce"
          style={{
            left: particle.x,
            top: particle.y,
            animationDelay: `${particle.delay}s`,
            animationDuration: '2s'
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Center explosion */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-8xl animate-pulse">
          💕
        </div>
      </div>

      {/* Radial hearts */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotate(${i * 45}deg)`,
            animation: 'spin 2s linear infinite'
          }}
        >
          <div 
            className="text-4xl absolute"
            style={{
              top: '20%',
              animation: 'fade-in 0.5s ease-out forwards'
            }}
          >
            ❤️
          </div>
        </div>
      ))}
    </div>
  );
};
