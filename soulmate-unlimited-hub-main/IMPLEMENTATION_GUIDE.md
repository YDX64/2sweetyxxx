# IMPLEMENTATION_GUIDE.md - Feature Development Patterns

## Quick Reference

### Feature Checklist
- [ ] Service layer function
- [ ] TypeScript types
- [ ] React component with hooks
- [ ] Translations (17 languages)
- [ ] RLS policies (if database)
- [ ] Feature gate (if premium)
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsive

## Common Feature Patterns

### 1. Adding a New User Feature

#### Example: "Super Like" Feature

**Step 1: Database Schema**
```sql
-- Add to migration file
ALTER TABLE swipes ADD COLUMN is_super_like BOOLEAN DEFAULT FALSE;

-- Add daily limit tracking
ALTER TABLE daily_usage ADD COLUMN super_likes_used INTEGER DEFAULT 0;

-- RLS policy
CREATE POLICY "Users can create super likes"
  ON swipes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) IN ('gold', 'platinum')
  );
```

**Step 2: Service Layer**
```typescript
// client/src/services/swipeService.ts
export const createSuperLike = async (targetUserId: string) => {
  // Check daily limit
  const limits = await checkDailyLimits();
  if (limits.superLikesRemaining <= 0) {
    throw new Error('Daily super like limit reached');
  }

  const { data, error } = await supabase
    .from('swipes')
    .insert({
      user_id: user?.id,
      target_user_id: targetUserId,
      direction: 'right',
      is_super_like: true
    })
    .select()
    .single();

  if (error) throw error;
  
  // Update usage tracking
  await updateDailyUsage('super_likes_used', 1);
  
  return data;
};
```

**Step 3: React Hook**
```typescript
// client/src/hooks/useSuperLike.tsx
export const useSuperLike = () => {
  const queryClient = useQueryClient();
  const { checkFeatureGate } = useFeatureGate();

  const superLikeMutation = useMutation({
    mutationFn: createSuperLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-limits'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success(t('superLike.success'));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const canSuperLike = checkFeatureGate('super_likes');

  return {
    superLike: superLikeMutation.mutate,
    canSuperLike,
    isLoading: superLikeMutation.isPending
  };
};
```

**Step 4: UI Component**
```typescript
// client/src/components/swipe/SuperLikeButton.tsx
export const SuperLikeButton = ({ targetUserId }: Props) => {
  const { t } = useTranslation();
  const { superLike, canSuperLike, isLoading } = useSuperLike();
  
  if (!canSuperLike) {
    return (
      <Button variant="premium" onClick={() => navigate('/upgrades')}>
        <Star className="w-4 h-4 mr-2" />
        {t('superLike.upgradeRequired')}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => superLike(targetUserId)}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className="w-4 h-4 fill-white" />
      )}
    </Button>
  );
};
```

**Step 5: Translations**
```json
// client/src/i18n/locales/en.json
{
  "superLike": {
    "button": "Super Like",
    "success": "Super Like sent!",
    "upgradeRequired": "Upgrade for Super Likes",
    "dailyLimitReached": "Daily Super Like limit reached"
  }
}
```

### 2. Adding Admin Features

#### Example: User Ban System

**Step 1: Database**
```sql
-- Add to profiles
ALTER TABLE profiles ADD COLUMN 
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  banned_by UUID REFERENCES profiles(id);

-- Admin-only policy
CREATE POLICY "Admins can ban users"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );
```

**Step 2: Admin Service**
```typescript
// client/src/services/adminService.ts
export const banUser = async (userId: string, reason: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_banned: true,
      ban_reason: reason,
      banned_at: new Date().toISOString(),
      banned_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Log admin action
  await logAdminAction('user_banned', { userId, reason });

  return data;
};
```

**Step 3: Admin UI**
```typescript
// client/src/components/admin/UserActions.tsx
export const UserActions = ({ user }: { user: Profile }) => {
  const [banReason, setBanReason] = useState('');
  const [showBanDialog, setShowBanDialog] = useState(false);

  const banMutation = useMutation({
    mutationFn: () => banUser(user.id, banReason),
    onSuccess: () => {
      toast.success('User banned successfully');
      setShowBanDialog(false);
    }
  });

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowBanDialog(true)}
      >
        Ban User
      </Button>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User: {user.name}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for ban..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => banMutation.mutate()}
              disabled={!banReason || banMutation.isPending}
            >
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
```

### 3. Real-time Features

#### Example: Typing Indicators

**Step 1: WebSocket Events**
```typescript
// server/index.ts - Add to WebSocket handler
case 'typing':
  const { matchId, isTyping } = data;
  // Broadcast to other user in match
  wss.clients.forEach((client) => {
    if (client.userId === getOtherUserId(matchId, ws.userId)) {
      client.send(JSON.stringify({
        type: 'user_typing',
        matchId,
        userId: ws.userId,
        isTyping
      }));
    }
  });
  break;
```

**Step 2: React Hook**
```typescript
// client/src/hooks/useTypingIndicator.tsx
export const useTypingIndicator = (matchId: string) => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const ws = useWebSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const sendTyping = useCallback((isTyping: boolean) => {
    ws?.send(JSON.stringify({
      type: 'typing',
      matchId,
      isTyping
    }));
  }, [ws, matchId]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'user_typing' && data.matchId === matchId) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(data.userId);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, matchId]);

  // Auto stop typing after 3 seconds
  const setTyping = useCallback((isTyping: boolean) => {
    sendTyping(isTyping);
    
    if (isTyping) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 3000);
    }
  }, [sendTyping]);

  return {
    typingUsers: Array.from(typingUsers),
    setTyping
  };
};
```

### 4. Performance-Critical Features

#### Example: Virtual Scrolling for Matches

```typescript
// client/src/components/matches/VirtualMatchList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualMatchList = ({ matches }: { matches: Match[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each match item
    overscan: 5 // Render 5 items outside visible area
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const match = matches[virtualItem.index];
          return (
            <div
              key={match.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <MatchItem match={match} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

## Best Practices

### 1. Service Layer Rules
- One service file per domain (profiles, chat, subscription)
- Always handle errors with try/catch or .catch()
- Return typed data using TypeScript interfaces
- Use Supabase client from the singleton

### 2. Component Guidelines
- Keep components under 200 lines
- Extract complex logic to custom hooks
- Use React.memo for expensive renders
- Implement error boundaries for critical sections

### 3. State Management
- Server state: TanStack Query (no Redux needed)
- Form state: React Hook Form + Zod
- UI state: useState or useReducer
- Global state: Context API (auth, theme, language)

### 4. Performance Tips
- Use React.lazy for route-based splitting
- Implement intersection observer for lazy loading
- Debounce search inputs (300ms)
- Memoize expensive calculations

### 5. Security Practices
- Never trust client-side validation alone
- Always check permissions server-side
- Sanitize user input before display
- Use prepared statements for SQL

## Testing New Features

### Manual Testing Checklist
1. Test as different subscription tiers
2. Test with poor network (Chrome DevTools)
3. Test on mobile viewport
4. Test with different languages
5. Test error states (offline, server error)
6. Test loading states
7. Test empty states

### Database Testing
```sql
-- Create test user with specific tier
INSERT INTO profiles (id, name, email, subscription_tier)
VALUES (gen_random_uuid(), 'Test User', 'test@example.com', 'gold');

-- Test RLS policies
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-id-here';
SELECT * FROM your_table; -- Should respect RLS
```

### Performance Testing
```javascript
// Measure component render time
console.time('ComponentRender');
// ... component code
console.timeEnd('ComponentRender');

// Check React DevTools Profiler
// Look for components rendering > 16ms
```

## Common Patterns Library

### Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateProfile,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['profile'] });
    const previousData = queryClient.getQueryData(['profile']);
    queryClient.setQueryData(['profile'], newData);
    return { previousData };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['profile'], context.previousData);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  }
});
```

### Infinite Scrolling
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['profiles'],
  queryFn: ({ pageParam = 0 }) => fetchProfiles({ offset: pageParam }),
  getNextPageParam: (lastPage, pages) => {
    return lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined;
  }
});
```

### Debounced Search
```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const { data } = useQuery({
  queryKey: ['search', debouncedSearch],
  queryFn: () => searchProfiles(debouncedSearch),
  enabled: debouncedSearch.length > 2
});
```