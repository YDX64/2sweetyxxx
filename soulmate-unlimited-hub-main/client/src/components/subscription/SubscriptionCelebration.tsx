import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface SubscriptionCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const SubscriptionCelebration = ({ isVisible, onComplete }: SubscriptionCelebrationProps) => {
  const { t } = useLanguage();
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
      // Generate heart-shaped confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 200, // Start above the screen
        emoji: ['💕', '❤️', '💖', '💝', '💗', '💓'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 2,
        size: ['text-2xl', 'text-3xl', 'text-4xl'][Math.floor(Math.random() * 3)]
      }));
      
      setParticles(newParticles);

      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Falling heart confetti */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${particle.size} animate-fall`}
          style={{
            left: particle.x,
            top: particle.y,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--tw-animate-fall-x': `${(Math.random() - 0.5) * 200}px`
          } as React.CSSProperties}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md mx-4 transform scale-0 animate-scale-in">
          {/* Large heart animation */}
          <div className="text-8xl text-center mb-4 animate-pulse">
            💕
          </div>
          
          {/* Congratulations text */}
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            {t('subscriptionCongratulations') || 'Congratulations!'}
          </h2>
          
          {/* Subtitle */}
          <p className="text-xl text-center text-pink-600 dark:text-pink-400 font-medium">
            {t('loveIsCloser') || 'Love is closer now!'}
          </p>
        </div>
      </div>

      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 animate-fade-in" />

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) translateX(var(--tw-animate-fall-x)) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fall {
          animation: fall linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};