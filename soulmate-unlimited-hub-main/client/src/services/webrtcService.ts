import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { CallRecord } from '@/types/common';

export interface CallSession {
  id: string;
  caller_id: string;
  receiver_id: string;
  conversation_id: string;
  call_type: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'answered' | 'rejected' | 'ended' | 'missed' | 'failed';
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export type WebRTCSignalData = 
  | RTCSessionDescriptionInit  // for 'offer' and 'answer'
  | RTCIceCandidateInit       // for 'ice-candidate'
  | Record<string, never>     // for 'hangup' (empty object)
  | unknown;                  // fallback for unknown signal types

export interface CallSignal {
  id: string;
  call_session_id: string;
  from_user_id: string;
  to_user_id: string;
  signal_type: 'offer' | 'answer' | 'ice-candidate' | 'hangup';
  signal_data: WebRTCSignalData;
  created_at: string;
}

export interface CallSessionUpdate {
  status?: CallSession['status'];
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  updated_at?: string;
}

class WebRTCService {
  private peer: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private currentCallSession: CallSession | null = null;
  private signalChannel: RealtimeChannel | null = null;

  // WebRTC Configuration with free STUN servers
  private peerConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  // Initialize a call session
  async initiateCall(
    receiverId: string, 
    conversationId: string, 
    callType: 'voice' | 'video'
  ): Promise<string | null> {
    try {
      console.log('🔵 WebRTC: Starting call initiation...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔴 WebRTC: User not authenticated');
        throw new Error('User not authenticated');
      }
      console.log('🔵 WebRTC: User authenticated:', user.id);

      // Create call session in database
      console.log('🔵 WebRTC: Creating call session in database...');
      const { data, error } = await supabase
        .from('call_sessions')
        .insert({
          caller_id: user.id,
          receiver_id: receiverId,
          conversation_id: conversationId,
          call_type: callType,
          status: 'initiated'
        })
        .select()
        .single();

      if (error) {
        console.log('🔴 WebRTC: Database error:', error);
        throw error;
      }
      console.log('🔵 WebRTC: Call session created:', data.id);

      this.currentCallSession = data as CallSession;
      
      // Get user media (camera/microphone)
      console.log('🔵 WebRTC: Requesting user media...');
      await this.getUserMedia(callType === 'video');
      console.log('🔵 WebRTC: User media obtained');
      
      // Create peer connection as initiator
      console.log('🔵 WebRTC: Creating peer connection...');
      this.createPeerConnection(true, data.id);
      console.log('🔵 WebRTC: Peer connection created');
      
      // Setup signaling channel
      console.log('🔵 WebRTC: Setting up signaling channel...');
      this.setupSignalingChannel(data.id);
      console.log('🔵 WebRTC: Signaling channel setup complete');

      console.log('🟢 WebRTC: Call initiation successful!');
      return data.id;
    } catch (error) {
      console.error('🔴 WebRTC: Error initiating call:', error);
      return null;
    }
  }

  // Answer an incoming call
  async answerCall(callSessionId: string): Promise<boolean> {
    try {
      const { data: callSession, error } = await supabase
        .from('call_sessions')
        .select()
        .eq('id', callSessionId)
        .single();

      if (error) throw error;

      this.currentCallSession = callSession as CallSession;

      // Update call status to answered
      await this.updateCallStatus(callSessionId, 'answered');

      // Get user media
      await this.getUserMedia(callSession.call_type === 'video');

      // Create peer connection as receiver
      this.createPeerConnection(false, callSessionId);

      // Setup signaling channel
      this.setupSignalingChannel(callSessionId);

      return true;
    } catch (error) {
      console.error('Error answering call:', error);
      return false;
    }
  }

  // Reject a call
  async rejectCall(callSessionId: string): Promise<boolean> {
    try {
      await this.updateCallStatus(callSessionId, 'rejected');
      await this.sendSignal(callSessionId, 'hangup', {});
      return true;
    } catch (error) {
      console.error('Error rejecting call:', error);
      return false;
    }
  }

  // End current call
  async endCall(): Promise<boolean> {
    try {
      if (!this.currentCallSession) return false;

      await this.updateCallStatus(this.currentCallSession.id, 'ended');
      await this.sendSignal(this.currentCallSession.id, 'hangup', {});
      
      // Log the completed call
      await this.logCall(this.currentCallSession);
      
      this.cleanup();
      return true;
    } catch (error) {
      console.error('Error ending call:', error);
      return false;
    }
  }

  // Get user media (camera/microphone)
  private async getUserMedia(includeVideo: boolean): Promise<MediaStream> {
    try {
      const constraints = {
        audio: true,
        video: includeVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  // Create WebRTC peer connection using native WebRTC API
  private createPeerConnection(initiator: boolean, callSessionId: string) {
    try {
      console.log('🔵 WebRTC: Creating native peer connection...');
      
      this.peer = new RTCPeerConnection(this.peerConfig);
      
      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peer!.addTrack(track, this.localStream!);
        });
      }

      // Handle remote stream
      this.peer.ontrack = (event) => {
        console.log('🔵 WebRTC: Remote stream received');
        const remoteStream = event.streams[0];
        this.onRemoteStream?.(remoteStream);
      };

      // Handle ICE candidates
      this.peer.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal(callSessionId, 'ice-candidate', event.candidate);
        }
      };

      // Handle connection state changes
      this.peer.onconnectionstatechange = () => {
        console.log('🔵 WebRTC: Connection state:', this.peer!.connectionState);
        
        switch (this.peer!.connectionState) {
          case 'connected':
            console.log('🟢 WebRTC: Peer connected successfully');
            break;
          case 'disconnected':
          case 'failed':
            console.log('🔴 WebRTC: Connection failed');
            this.updateCallStatus(callSessionId, 'failed');
            this.cleanup();
            break;
          case 'closed':
            console.log('🔴 WebRTC: Connection closed');
            this.cleanup();
            break;
        }
      };

      // If initiator, create offer
      if (initiator) {
        this.createOffer(callSessionId);
      }

    } catch (error) {
      console.error('🔴 WebRTC: Failed to create peer connection:', error);
      this.updateCallStatus(callSessionId, 'failed');
    }
  }

  // Create offer for call initiation
  private async createOffer(callSessionId: string) {
    try {
      console.log('🔵 WebRTC: Creating offer...');
      
      const offer = await this.peer!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peer!.setLocalDescription(offer);
      await this.sendSignal(callSessionId, 'offer', offer);
      
      console.log('🟢 WebRTC: Offer created and sent');
    } catch (error) {
      console.error('🔴 WebRTC: Failed to create offer:', error);
    }
  }

  // Handle received offer and create answer
  private async handleOffer(callSessionId: string, offer: RTCSessionDescriptionInit) {
    try {
      console.log('🔵 WebRTC: Handling offer...');
      
      await this.peer!.setRemoteDescription(offer);
      
      const answer = await this.peer!.createAnswer();
      await this.peer!.setLocalDescription(answer);
      
      await this.sendSignal(callSessionId, 'answer', answer);
      
      console.log('🟢 WebRTC: Answer created and sent');
    } catch (error) {
      console.error('🔴 WebRTC: Failed to handle offer:', error);
    }
  }

  // Handle received answer
  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      console.log('🔵 WebRTC: Handling answer...');
      await this.peer!.setRemoteDescription(answer);
      console.log('🟢 WebRTC: Answer processed');
    } catch (error) {
      console.error('🔴 WebRTC: Failed to handle answer:', error);
    }
  }

  // Handle received ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peer!.addIceCandidate(candidate);
      console.log('🔵 WebRTC: ICE candidate added');
    } catch (error) {
      console.error('🔴 WebRTC: Failed to add ICE candidate:', error);
    }
  }

  // Setup real-time signaling channel via Supabase
  private setupSignalingChannel(callSessionId: string) {
    this.signalChannel = supabase
      .channel(`call_signals:${callSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signaling',
          filter: `call_session_id=eq.${callSessionId}`
        },
        (payload) => {
          this.handleSignal(payload.new as CallSignal);
        }
      )
      .subscribe();
  }

  // Handle incoming signals
  private async handleSignal(signal: CallSignal) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Ignore signals from self
    if (signal.from_user_id === user?.id) return;

    switch (signal.signal_type) {
      case 'offer':
        await this.handleOffer(signal.call_session_id, signal.signal_data as RTCSessionDescriptionInit);
        break;
      case 'answer':
        await this.handleAnswer(signal.signal_data as RTCSessionDescriptionInit);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(signal.signal_data as RTCIceCandidateInit);
        break;
      case 'hangup':
        this.cleanup();
        this.onCallEnded?.();
        break;
    }
  }

  // Send signal via Supabase
  private async sendSignal(
    callSessionId: string,
    signalType: 'offer' | 'answer' | 'ice-candidate' | 'hangup',
    signalData: WebRTCSignalData
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !this.currentCallSession) return;

      const toUserId = user.id === this.currentCallSession.caller_id 
        ? this.currentCallSession.receiver_id 
        : this.currentCallSession.caller_id;

      await supabase
        .from('call_signaling')
        .insert({
          call_session_id: callSessionId,
          from_user_id: user.id,
          to_user_id: toUserId,
          signal_type: signalType,
          signal_data: signalData as never
        });
    } catch (error) {
      console.error('Error sending signal:', error);
    }
  }

  // Update call status
  private async updateCallStatus(
    callSessionId: string,
    status: CallSession['status']
  ) {
    const updateData: CallSessionUpdate = { status };
    
    if (status === 'answered') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'ended') {
      updateData.ended_at = new Date().toISOString();
      
      // Calculate duration if call was answered
      if (this.currentCallSession?.started_at) {
        const startTime = new Date(this.currentCallSession.started_at).getTime();
        const endTime = new Date().getTime();
        updateData.duration_seconds = Math.floor((endTime - startTime) / 1000);
      }
    }

    await supabase
      .from('call_sessions')
      .update(updateData)
      .eq('id', callSessionId);
  }

  // Cleanup resources
  private cleanup() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.signalChannel) {
      this.signalChannel.unsubscribe();
      this.signalChannel = null;
    }

    this.currentCallSession = null;
  }

  // Toggle audio/video
  toggleAudio(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  // Getters
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getCurrentCallSession(): CallSession | null {
    return this.currentCallSession;
  }

  // Event handlers (to be set by UI components)
  onRemoteStream?: (stream: MediaStream) => void;
  onCallEnded?: () => void;
  onCallStatusChanged?: (status: CallSession['status']) => void;

  // Log completed call to call_logs table
  private async logCall(callSession: CallSession): Promise<void> {
    try {
      const { error } = await supabase
        .from('call_logs')
        .insert({
          caller_id: callSession.caller_id,
          receiver_id: callSession.receiver_id,
          conversation_id: callSession.conversation_id,
          call_type: callSession.call_type,
          status: callSession.status,
          started_at: callSession.started_at,
          ended_at: callSession.ended_at,
          duration_seconds: callSession.duration_seconds
        });

      if (error) {
        console.error('Error saving call log:', error);
      }

      // Track feature usage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await this.trackCallUsage(user.id, callSession.call_type);
      }
    } catch (error) {
      console.error('Call logging failed:', error);
    }
  }

  // Track call usage for analytics
  private async trackCallUsage(userId: string, callType: 'voice' | 'video'): Promise<void> {
    try {
      const featureName = callType === 'video' ? 'video_call' : 'voice_call';
      
      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: userId,
        p_feature_name: featureName
      });

      if (error) {
        console.error('Error tracking call usage:', error);
      }
    } catch (error) {
      console.error('Call usage tracking failed:', error);
    }
  }

  // Get call history for user
  async getCallHistory(userId: string, limit: number = 20): Promise<CallRecord[]> {
    try {
      const { data: calls, error } = await supabase
        .from('call_logs')
        .select(`
          *,
          caller_profile:profiles!call_logs_caller_id_fkey(id, name, photos),
          receiver_profile:profiles!call_logs_receiver_id_fkey(id, name, photos)
        `)
        .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching call history:', error);
        return [];
      }

      // Transform database result to match CallRecord interface
      const transformedCalls = calls?.map(call => ({
        id: call.id,
        caller_id: call.caller_id,
        callee_id: call.receiver_id, // Map receiver_id to callee_id
        call_type: call.call_type as 'video' | 'voice',
        started_at: call.started_at || '',
        ended_at: call.ended_at,
        duration: call.duration_seconds, // Map duration_seconds to duration
        caller: (call.caller_profile && typeof call.caller_profile === 'object' && 'id' in call.caller_profile) ? {
          id: (call.caller_profile as any).id,
          name: (call.caller_profile as any).name || '',
          age: 0, // Default values for required fields
          photos: (call.caller_profile as any).photos || [],
          bio: '',
          location: '',
          subscription_tier: '',
          created_at: '',
          updated_at: ''
        } : undefined,
        callee: (call.receiver_profile && typeof call.receiver_profile === 'object' && 'id' in call.receiver_profile) ? {
          id: (call.receiver_profile as any).id,
          name: (call.receiver_profile as any).name || '',
          age: 0, // Default values for required fields
          photos: (call.receiver_profile as any).photos || [],
          bio: '',
          location: '',
          subscription_tier: '',
          created_at: '',
          updated_at: ''
        } : undefined
      })) || [];
      
      return transformedCalls;
    } catch (error) {
      console.error('Call history fetch failed:', error);
      return [];
    }
  }

  // Get call statistics
  async getCallStats(userId: string) {
    try {
      const { data: stats, error } = await supabase
        .from('call_logs')
        .select('call_type, duration_seconds, status')
        .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching call statistics:', error);
        return null;
      }

      const totalCalls = stats?.length || 0;
      const voiceCalls = stats?.filter(s => s.call_type === 'voice').length || 0;
      const videoCalls = stats?.filter(s => s.call_type === 'video').length || 0;
      const answeredCalls = stats?.filter(s => s.status === 'answered').length || 0;
      const totalDuration = stats?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;

      return {
        totalCalls,
        voiceCalls,
        videoCalls,
        answeredCalls,
        missedCalls: totalCalls - answeredCalls,
        totalDuration,
        averageDuration: answeredCalls > 0 ? totalDuration / answeredCalls : 0
      };
    } catch (error) {
      console.error('Call statistics fetch failed:', error);
      return null;
    }
  }

  // Subscribe to incoming calls
  subscribeToIncomingCalls(userId: string, callback: (callSession: CallSession) => void) {
    return supabase
      .channel(`incoming_calls:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as CallSession);
        }
      )
      .subscribe();
  }
}

export const webrtcService = new WebRTCService();
