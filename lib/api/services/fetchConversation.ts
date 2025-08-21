import apiService from '../core';

export interface ConversationUserMeta {
  name: string;
  avatar: string | null;
}

export interface ConversationServiceProviderMeta {
  id: number;
  user: ConversationUserMeta;
}

export interface ConversationCustomerProfileMeta {
  id: number;
  user: ConversationUserMeta;
}

export interface Conversation {
  id: number;
  customerId: number;
  providerId: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadByCustomer: number;
  unreadByProvider: number;
  createdAt: string;
  updatedAt: string;
  ServiceProvider?: ConversationServiceProviderMeta;
  CustomerProfile?: ConversationCustomerProfileMeta;
}

export type SenderType = 'CUSTOMER' | 'PROVIDER';

// Raw message shape from the API
export interface ConversationMessageApi {
  id: number;
  conversationId: number;
  senderType: SenderType;
  senderId: number;
  content: string;
  imageUrl: string | null;
  isRead: boolean;
  sentAt: string;
}

// UI-friendly message shape used throughout the app
// createdAt is ensured for UI by mapping from sentAt
export interface ConversationMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  senderType?: SenderType;
  imageUrl?: string | null;
  isRead?: boolean;
  sentAt?: string;
  [key: string]: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface MessagesPageResponse {
  data: ConversationMessageApi[];
  pagination: PaginationMeta;
}

// Some endpoints wrap the response as { data: ... }
type MaybeWrapped<T> = T | { data: T };

export interface GetOrCreateConversationRequest {
  receiverId: number; // providerId for customer → provider
}

export const fetchConversation = {
  getOrCreateConversation: async (
    payload: GetOrCreateConversationRequest
  ): Promise<Conversation> => {
    try {
      if (!payload.receiverId || payload.receiverId <= 0) {
        throw new Error('Invalid receiver ID');
      }

      const response = await apiService.post<
        MaybeWrapped<Conversation>,
        GetOrCreateConversationRequest
      >('/bookings/get-or-create-conversation', payload);

      const raw = response.data as MaybeWrapped<Conversation>;
      const conversation = (raw as { data: Conversation }).data || (raw as Conversation);

      if (!conversation || !conversation.id) {
        throw new Error('Invalid conversation response from server');
      }

      return conversation;
    } catch (error) {
      console.error('[fetchConversation] getOrCreateConversation failed:', error);
      throw error;
    }
  },

  getUserConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await apiService.get<MaybeWrapped<Conversation[]>>(
        '/bookings/get-user-conversation'
      );

      const raw = response.data as MaybeWrapped<Conversation[]>;
      const conversations = (raw as { data: Conversation[] }).data || (raw as Conversation[]);

      // Validate and sort conversations
      const validConversations = Array.isArray(conversations)
        ? conversations.filter(conv => conv && typeof conv.id === 'number' && conv.id > 0)
        : [];

      // Sort by last message time (most recent first)
      validConversations.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });

      return validConversations;
    } catch (error) {
      console.error('[fetchConversation] getUserConversations failed:', error);
      throw error;
    }
  },

  // Enhanced paginated messages API with better error handling
  getMessagesPage: async (params: {
    conversationId: number;
    page?: number;
    limit?: number;
  }): Promise<MessagesPageResponse> => {
    try {
      if (!params.conversationId || params.conversationId <= 0) {
        throw new Error('Invalid conversation ID');
      }

      const page = Math.max(1, params.page ?? 1);
      const limit = Math.min(100, Math.max(1, params.limit ?? 20));

      const response = await apiService.get<MessagesPageResponse>(`/bookings/get-messages`, {
        conversationId: params.conversationId,
        page,
        limit,
      });

      const result = response.data;

      if (!result || !Array.isArray(result.data)) {
        throw new Error('Invalid messages response format');
      }

      return result;
    } catch (error) {
      console.error('[fetchConversation] getMessagesPage failed:', error);
      throw error;
    }
  },

  // Enhanced convenience helper with better error handling and validation
  getMessages: async (conversationId: number, limit = 100): Promise<ConversationMessage[]> => {
    try {
      if (!conversationId || conversationId <= 0) {
        throw new Error('Invalid conversation ID');
      }

      const page = await fetchConversation.getMessagesPage({
        conversationId,
        page: 1,
        limit: Math.min(100, Math.max(1, limit)),
      });

      // Enhanced mapping with validation and error handling
      const messages = page.data
        .filter(m => m && typeof m.id === 'number' && m.content) // Filter out invalid messages
        .map(m => {
          try {
            return {
              id: m.id,
              conversationId: m.conversationId,
              senderId: m.senderId,
              content: m.content,
              createdAt: m.sentAt || new Date().toISOString(),
              senderType: m.senderType,
              imageUrl: m.imageUrl,
              isRead: m.isRead,
              sentAt: m.sentAt,
            } as ConversationMessage;
          } catch (error) {
            console.warn('[fetchConversation] Skipping invalid message:', m, error);
            return null;
          }
        })
        .filter((m): m is ConversationMessage => m !== null);

      // Sort messages by creation time
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return messages;
    } catch (error) {
      console.error('[fetchConversation] getMessages failed:', error);
      throw error;
    }
  },

  // New method for incremental message fetching
  getMessagesSince: async (
    conversationId: number,
    since: string,
    limit = 20
  ): Promise<ConversationMessage[]> => {
    try {
      if (!conversationId || conversationId <= 0) {
        throw new Error('Invalid conversation ID');
      }

      const response = await apiService.get<MaybeWrapped<ConversationMessageApi[]>>(
        `/bookings/get-messages-since`,
        {
          conversationId,
          since,
          limit: Math.min(100, Math.max(1, limit)),
        }
      );

      const raw = response.data as MaybeWrapped<ConversationMessageApi[]>;
      const apiMessages =
        (raw as { data: ConversationMessageApi[] }).data || (raw as ConversationMessageApi[]);

      if (!Array.isArray(apiMessages)) {
        throw new Error('Invalid messages response format');
      }

      const messages = apiMessages
        .filter(m => m && typeof m.id === 'number' && m.content)
        .map(
          m =>
            ({
              id: m.id,
              conversationId: m.conversationId,
              senderId: m.senderId,
              content: m.content,
              createdAt: m.sentAt || new Date().toISOString(),
              senderType: m.senderType,
              imageUrl: m.imageUrl,
              isRead: m.isRead,
              sentAt: m.sentAt,
            }) as ConversationMessage
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return messages;
    } catch (error) {
      console.error('[fetchConversation] getMessagesSince failed:', error);
      throw error;
    }
  },

  // Method to mark messages as read
  markMessagesAsRead: async (conversationId: number): Promise<void> => {
    try {
      if (!conversationId || conversationId <= 0) {
        throw new Error('Invalid conversation ID');
      }

      await apiService.post('/bookings/mark-messages-read', { conversationId });
    } catch (error) {
      console.error('[fetchConversation] markMessagesAsRead failed:', error);
      throw error;
    }
  },
};

export default fetchConversation;
