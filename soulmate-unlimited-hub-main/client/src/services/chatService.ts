import { supabase } from '@/integrations/supabase/client';

// Database response types (snake_case)
interface DbConversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  translation_enabled_by_user1: boolean | null;
  translation_enabled_by_user2: boolean | null;
  user1_language: string | null;
  user2_language: string | null;
  created_at: string;
  updated_at: string;
}

interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface DbProfile {
  id: string;
  name: string | null;
  email: string | null;
  age: number | null;
  bio: string | null;
  gender: string | null;
  photo: string | null;
  // Add other fields as needed
}

interface ConversationWithProfiles extends DbConversation {
  participant1: DbProfile;
  participant2: DbProfile;
}

export const chatService = {
  async getConversations(userId: string): Promise<ConversationWithProfiles[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey(*),
        participant2:profiles!conversations_participant2_id_fkey(*)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return (data || []) as unknown as ConversationWithProfiles[];
  },

  async getMessages(conversationId: string): Promise<DbMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  },

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<boolean> {
    try {
      // Insert the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content
        });

      if (messageError) throw messageError;

      // Update conversation timestamp
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  },

  async createConversation(participant1Id: string, participant2Id: string): Promise<string | null> {
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
        .maybeSingle();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: participant1Id,
          participant2_id: participant2Id
        })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  },

  async getOrCreateConversation(userId: string, otherUserId: string): Promise<DbConversation | null> {
    try {
      // Mevcut konuşmayı bul
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant1_id.eq.${userId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${userId})`)
        .maybeSingle();

      if (existingConversation) {
        return existingConversation;
      }

      // Yeni konuşma oluştur
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: userId,
          participant2_id: otherUserId
        })
        .select('*')
        .single();

      if (error) throw error;

      return newConversation;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      return null;
    }
  },

  subscribeToMessages(conversationId: string, callback: (message: DbMessage) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as DbMessage);
        }
      )
      .subscribe();
  }
};
