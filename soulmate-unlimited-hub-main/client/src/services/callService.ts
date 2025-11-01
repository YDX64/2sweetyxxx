
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type CallLog = Tables<'call_logs'>;

// Modern Context7 pattern: Type-safe call status update data
interface CallStatusUpdateData {
  status: 'answered' | 'rejected' | 'ended' | 'missed';
  started_at?: string;
  ended_at?: string;
}

class CallService {
  async initiateCall(
    conversationId: string,
    receiverId: string,
    callType: 'voice' | 'video'
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('call_logs')
        .insert({
          conversation_id: conversationId,
          caller_id: user.id,
          receiver_id: receiverId,
          call_type: callType,
          status: 'initiated'
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error initiating call:', error);
      return null;
    }
  }

  async updateCallStatus(
    callId: string,
    status: 'answered' | 'rejected' | 'ended' | 'missed'
  ): Promise<boolean> {
    try {
      const updateData: CallStatusUpdateData = { status };
      
      if (status === 'answered') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'ended') {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('call_logs')
        .update(updateData)
        .eq('id', callId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating call status:', error);
      return false;
    }
  }

  async getCallHistory(conversationId: string): Promise<CallLog[]> {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting call history:', error);
      return [];
    }
  }

  subscribeToCallEvents(conversationId: string, callback: (call: CallLog) => void) {
    return supabase
      .channel(`calls:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_logs',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as CallLog);
        }
      )
      .subscribe();
  }
}

export const callService = new CallService();
