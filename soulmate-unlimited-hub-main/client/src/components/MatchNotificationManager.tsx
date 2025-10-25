
import { useState, useEffect } from 'react';
import { MatchNotification } from './MatchNotification';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface Match {
  user: Profile;
  timestamp: number;
}

interface MatchNotificationManagerProps {
  newMatches: Profile[];
  onMatchSeen: (userId: string) => void;
}

export const MatchNotificationManager = ({ newMatches, onMatchSeen }: MatchNotificationManagerProps) => {
  const [visibleMatches, setVisibleMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (newMatches.length > 0) {
      const matchesWithTimestamp = newMatches.map(user => ({
        user,
        timestamp: Date.now()
      }));
      
      setVisibleMatches(prev => [...prev, ...matchesWithTimestamp]);
    }
  }, [newMatches]);

  const handleMatchClose = (userId: string) => {
    setVisibleMatches(prev => prev.filter(match => match.user.id !== userId));
    onMatchSeen(userId);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleMatches.slice(0, 3).map((match, index) => (
        <div
          key={match.user.id}
          style={{ 
            transform: `translateY(${index * 10}px) scale(${1 - index * 0.05})`,
            zIndex: 50 - index
          }}
        >
          <MatchNotification
            user={match.user}
            onClose={() => handleMatchClose(match.user.id)}
            onViewMatch={() => {
              // Navigate to messages - could be implemented later
              console.log('Navigate to messages with', match.user.name);
              handleMatchClose(match.user.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};
