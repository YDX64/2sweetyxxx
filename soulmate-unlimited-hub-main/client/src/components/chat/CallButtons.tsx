import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Video, PhoneOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import { webrtcService } from '@/services/webrtcService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface CallButtonsProps {
  conversationId: string;
  receiverId: string;
  onCallInitiated: (callId: string, callType: 'voice' | 'video') => void;
}

export const CallButtons = ({
  conversationId,
  receiverId,
  onCallInitiated
}: CallButtonsProps) => {
  const { user } = useAuth();
  const { hasFeature } = useSubscription();
  const { t } = useLanguage();
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<'voice' | 'video' | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Check if user has Silver+ subscription for voice calls, Gold+ for video calls
  const canMakeVoiceCalls = hasFeature('voiceCalls');
  const canMakeVideoCalls = hasFeature('videoCalls');

  const handleVoiceCall = async () => {
    if (!canMakeVoiceCalls) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      // Basit call logging - WebRTC yerine
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Database'e call kaydı ekle
      const { error } = await supabase
        .from('call_sessions')
        .insert({
          caller_id: user?.id || '',
          receiver_id: receiverId,
          conversation_id: conversationId,
          call_type: 'voice',
          status: 'initiated',
          duration_seconds: 0
        });

      if (error) {
        console.error('Call logging error:', error);
        toast.error(t('callError'));
        return;
      }

      setIsCallActive(true);
      setCurrentCallType('voice');
      onCallInitiated(callId, 'voice');
      toast.success(t('voiceCallInitiated') + ' (Simulated)');
      
      // 3 saniye sonra call'ı bitir (demo için)
      setTimeout(() => {
        setIsCallActive(false);
        setCurrentCallType(null);
        toast.success(t('callEnded'));
      }, 3000);
      
    } catch (error) {
      console.error('Voice call error:', error);
      toast.error(t('callError'));
    }
  };

  const handleVideoCall = async () => {
    if (!canMakeVideoCalls) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      const callId = await webrtcService.initiateCall(receiverId, conversationId, 'video');
      if (callId) {
        setIsCallActive(true);
        setCurrentCallType('video');
        onCallInitiated(callId, 'video');
        toast.success(t('videoCallInitiated'));
      } else {
        toast.error(t('callInitiationFailed'));
      }
    } catch (error) {
      console.error('Video call error:', error);
      toast.error(t('callError'));
    }
  };

  const handleEndCall = async () => {
    try {
      await webrtcService.endCall();
      setIsCallActive(false);
      setCurrentCallType(null);
      toast.success(t('callEnded'));
    } catch (error) {
      console.error('End call error:', error);
      toast.error(t('endCallError'));
    }
  };

  const getButtonStyles = (isActive: boolean) => {
    return isActive
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "hover:bg-gray-50/70 dark:hover:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200";
  };

  return (
    <>
      <div className="flex space-x-1">
        {/* Voice Call Button */}
        <Button
          variant={isCallActive && currentCallType === 'voice' ? "default" : "outline"}
          size="sm"
          onClick={isCallActive && currentCallType === 'voice' ? handleEndCall : handleVoiceCall}
          className={getButtonStyles(isCallActive && currentCallType === 'voice')}
          title={canMakeVoiceCalls ? t('voiceCall') : t('upgradeForVoiceCalls')}
          disabled={isCallActive && currentCallType === 'video'}
        >
          {isCallActive && currentCallType === 'voice' ? (
            <PhoneOff className="w-4 h-4" />
          ) : (
            <Phone className="w-4 h-4" />
          )}
        </Button>

        {/* Video Call Button */}
        <Button
          variant={isCallActive && currentCallType === 'video' ? "default" : "outline"}
          size="sm"
          onClick={isCallActive && currentCallType === 'video' ? handleEndCall : handleVideoCall}
          className={getButtonStyles(isCallActive && currentCallType === 'video')}
          title={canMakeVideoCalls ? t('videoCall') : t('upgradeForVideoCalls')}
          disabled={isCallActive && currentCallType === 'voice'}
        >
          {isCallActive && currentCallType === 'video' ? (
            <PhoneOff className="w-4 h-4" />
          ) : (
            <Video className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="dark:bg-gray-800/95 dark:border-gray-600/50">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              {t('upgradeRequired')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              {t('voiceVideoCallsRequireGold')}
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowUpgradeDialog(false)}
                variant="outline"
                className="dark:border-gray-600/50 dark:text-gray-200"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  setShowUpgradeDialog(false);
                  // Navigate to upgrade page
                  window.location.href = '/upgrades';
                }}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white"
              >
                {t('upgradeToGold')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
