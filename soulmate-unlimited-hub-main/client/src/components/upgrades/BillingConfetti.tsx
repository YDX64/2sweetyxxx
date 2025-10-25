import { useEffect, useState } from 'react';

interface BillingConfettiProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const BillingConfetti = ({ isVisible, onComplete }: BillingConfettiProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    emoji: string;
    delay: number;
    duration: number;
    size: string;
  }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate money/discount-themed confetti particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 100,
        emoji: ['💰', '💸', '🎉', '✨', '⭐', '🌟'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1,
        size: ['text-xl', 'text-2xl', 'text-3xl'][Math.floor(Math.random() * 3)]
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
      {/* Falling confetti */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${particle.size} animate-fall-quick`}
          style={{
            left: particle.x,
            top: particle.y,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--tw-animate-fall-x': `${(Math.random() - 0.5) * 150}px`
          } as React.CSSProperties}
        >
          {particle.emoji}
        </div>
      ))}

      <style>{`
        @keyframes fall-quick {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(60vh + 50px)) translateX(var(--tw-animate-fall-x)) rotate(180deg);
            opacity: 0;
          }
        }

        .animate-fall-quick {
          animation: fall-quick linear forwards;
        }
      `}</style>
    </div>
  );
};