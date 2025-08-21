'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  joinConversation,
  onNewMessage,
  offNewMessage,
  onMessageUpdated,
  offMessageUpdated,
  onMessageDeleted,
  offMessageDeleted,
  onMessageSent,
  offMessageSent,
  onConversationUpdated,
  offConversationUpdated,
  getConnectionStatus,
} from '@/lib/api/services/socket';
import { useAuthStore } from '@/lib/store/authStore';
import fetchConversation, {
  Conversation,
  ConversationMessage,
  GetOrCreateConversationRequest,
} from '@/lib/api/services/fetchConversation';

export function useUserConversations() {
  const queryClient = useQueryClient();
  const joinedRoomsRef = useRef(new Set<number>());

  // Define event handlers with useCallback at the top level
  const handleConversationUpdate = useCallback(() => {
    // Invalidate conversations list to reflect updates
    queryClient.invalidateQueries({ queryKey: ['conversations', 'mine'] });
  }, [queryClient]);

  const handleNewMessage = useCallback(
    (payload: unknown) => {
      // Handle both payload formats - wrapped or direct message
      let incomingMessage: ConversationMessage;
      let messageConversationId: number;

      // Check if payload is wrapped format: { conversationId, message }
      const wrappedPayload = payload as { conversationId?: number; message?: ConversationMessage };
      if (wrappedPayload?.conversationId && wrappedPayload?.message) {
        incomingMessage = wrappedPayload.message;
        messageConversationId = wrappedPayload.conversationId;
      }
      // Check if payload is direct message format
      else {
        const directMessage = payload as ConversationMessage;
        if (directMessage?.id && directMessage?.conversationId && directMessage?.content) {
          incomingMessage = directMessage;
          messageConversationId = directMessage.conversationId;
        } else {
          return;
        }
      }

      // Update conversation preview immediately
      queryClient.setQueryData<Conversation[]>(['conversations', 'mine'], old => {
        if (!old) {
          return old;
        }

        // Check if conversation exists
        let conversationExists = false;
        const updatedConversations = old.map(conv => {
          if (conv.id === messageConversationId) {
            conversationExists = true;

            return {
              ...conv,
              lastMessage: incomingMessage.content,
              lastMessageAt: incomingMessage.createdAt || new Date().toISOString(),
              // Update unread count based on sender type
              ...(incomingMessage.senderType === 'PROVIDER'
                ? { unreadByCustomer: (conv.unreadByCustomer || 0) + 1 }
                : { unreadByProvider: (conv.unreadByProvider || 0) + 1 }),
            };
          }
          return conv;
        });

        // If conversation doesn't exist, we need to refetch the entire list
        if (!conversationExists) {
          queryClient.invalidateQueries({ queryKey: ['conversations', 'mine'] });
          return old;
        }

        // Move updated conversation to top
        const updatedConv = updatedConversations.find(c => c.id === messageConversationId);
        const otherConvs = updatedConversations.filter(c => c.id !== messageConversationId);

        const result = updatedConv ? [updatedConv, ...otherConvs] : updatedConversations;
        return result;
      });

      // Force invalidate specific conversation messages to trigger UI update
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['conversations', messageConversationId, 'messages'],
          exact: true,
        });
      }, 100);
    },
    [queryClient]
  );

  // Enhanced real-time event handling for conversations
  useEffect(() => {
    onConversationUpdated(handleConversationUpdate);
    onNewMessage(handleNewMessage);

    return () => {
      offConversationUpdated(handleConversationUpdate);
      offNewMessage(handleNewMessage);
    };
  }, [handleConversationUpdate, handleNewMessage]);

  return useQuery<Conversation[]>({
    queryKey: ['conversations', 'mine'],
    queryFn: async () => {
      try {
        const conversations = await fetchConversation.getUserConversations();

        // Join conversation rooms for real-time updates
        conversations.forEach(c => {
          if (typeof c.id === 'number' && c.id > 0 && !joinedRoomsRef.current.has(c.id)) {
            joinConversation(c.id);
            joinedRoomsRef.current.add(c.id);
          }
        });

        return conversations;
      } catch (error) {
        console.error('[useConversations] Failed to fetch conversations:', error);
        throw error;
      }
    },
    staleTime: 60_000, // Increase cache time for better performance
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Rely on real-time updates
    refetchOnReconnect: false, // Don't auto-refetch on reconnect
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useConversationMessages(
  conversationId: number | undefined,
  options?: { pageSize?: number }
) {
  const queryClient = useQueryClient();
  const lastMessageTimestampRef = useRef<string | null>(null);
  const optimisticMessagesRef = useRef(new Map<string, ConversationMessage>());

  // Enhanced real-time message handling
  const handleNewMessage = useCallback(
    (payload: unknown) => {
      // Handle both payload formats - wrapped or direct message
      let incomingMessage: ConversationMessage;
      let messageConversationId: number;

      // Check if payload is wrapped format: { conversationId, message }
      const wrappedPayload = payload as { conversationId?: number; message?: ConversationMessage };
      if (wrappedPayload?.conversationId && wrappedPayload?.message) {
        incomingMessage = wrappedPayload.message;
        messageConversationId = wrappedPayload.conversationId;
      }
      // Check if payload is direct message format
      else {
        const directMessage = payload as ConversationMessage;
        if (directMessage?.id && directMessage?.conversationId && directMessage?.content) {
          incomingMessage = directMessage;
          messageConversationId = directMessage.conversationId;
        } else {
          console.log('❌ [MESSAGES] Invalid payload structure:', payload);
          return;
        }
      }

      // Add detailed recipient logging
      console.log('🎯 [RECIPIENT] New message received:', {
        messageId: incomingMessage.id,
        conversationId: messageConversationId,
        targetConversation: conversationId,
        content: incomingMessage.content?.substring(0, 100) + '...',
        senderId: incomingMessage.senderId,
        senderType: incomingMessage.senderType,
        timestamp: new Date().toISOString(),
      });

      // Only handle if it's for the current conversation
      if (messageConversationId !== conversationId) {
        console.log('📝 [RECIPIENT] Message not for current conversation, skipping');
        return;
      }

      console.log('🔄 [RECIPIENT] Processing message for current conversation');

      // Update messages cache immediately for better UX
      queryClient.setQueryData<ConversationMessage[]>(
        ['conversations', conversationId, 'messages'],
        old => {
          console.log('🔄 [RECIPIENT] Updating messages cache - current count:', old?.length || 0);

          if (!old) {
            console.log('✅ [RECIPIENT] No existing messages, adding first message');
            return [{ ...incomingMessage, status: 'delivered' as const }];
          }

          // Simple duplicate detection by ID only for better performance
          const exists = old.some(msg => msg.id === incomingMessage.id);

          if (exists) {
            console.log('🔄 [RECIPIENT] Message already exists, updating...');
            // Update existing message
            return old.map(msg =>
              msg.id === incomingMessage.id ? { ...incomingMessage, status: 'delivered' } : msg
            );
          }

          // Remove any optimistic messages with same content (simple approach)
          const withoutOptimistic = old.filter(
            msg => !(msg.tempId && msg.content === incomingMessage.content)
          );

          // Add new message to the end (messages should be pre-sorted from API)
          const newMessages = [
            ...withoutOptimistic,
            { ...incomingMessage, status: 'delivered' as const },
          ];

          console.log('✅ [RECIPIENT] Added new message - new count:', newMessages.length);
          lastMessageTimestampRef.current = incomingMessage.createdAt;
          return newMessages;
        }
      );

      // Force a component re-render by invalidating the query
      setTimeout(() => {
        console.log('🔄 [RECIPIENT] Force refreshing messages cache');
        queryClient.invalidateQueries({
          queryKey: ['conversations', conversationId, 'messages'],
          exact: true,
          refetchType: 'all',
        });
      }, 50);
    },
    [conversationId, queryClient]
  );

  const handleMessageUpdated = useCallback(
    (payload: unknown) => {
      const updatedMessage = payload as ConversationMessage;
      if (!updatedMessage?.conversationId || updatedMessage.conversationId !== conversationId)
        return;

      console.log('[useConversationMessages] Message updated:', updatedMessage.id);

      queryClient.setQueryData<ConversationMessage[]>(
        ['conversations', conversationId, 'messages'],
        old => old?.map(msg => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg))
      );
    },
    [conversationId, queryClient]
  );

  const handleMessageDeleted = useCallback(
    (payload: unknown) => {
      const p = payload as { id?: number; conversationId?: number } | null;
      if (!p?.id || !p?.conversationId || p.conversationId !== conversationId) return;

      console.log('[useConversationMessages] Message deleted:', p.id);

      queryClient.setQueryData<ConversationMessage[]>(
        ['conversations', conversationId, 'messages'],
        old => old?.filter(msg => msg.id !== p.id)
      );
    },
    [conversationId, queryClient]
  );

  const handleMessageSent = useCallback(
    (payload: unknown) => {
      const sentMessage = payload as ConversationMessage;
      if (!sentMessage?.conversationId || sentMessage.conversationId !== conversationId) return;

      console.log('[useConversationMessages] Message sent acknowledgment:', sentMessage.id);

      // Remove from optimistic messages and update cache
      const tempId = `temp_${sentMessage.content}_${sentMessage.senderId}`;
      optimisticMessagesRef.current.delete(tempId);

      queryClient.setQueryData<ConversationMessage[]>(
        ['conversations', conversationId, 'messages'],
        old => {
          if (!old) return [sentMessage];

          // Replace optimistic message or add if not found
          const withoutOptimistic = old.filter(
            msg =>
              !(
                msg.content === sentMessage.content &&
                msg.senderId === sentMessage.senderId &&
                Math.abs(
                  new Date(msg.createdAt).getTime() - new Date(sentMessage.createdAt).getTime()
                ) < 10000
              )
          );

          // Check if real message already exists
          const realExists = withoutOptimistic.some(msg => msg.id === sentMessage.id);
          if (realExists) return withoutOptimistic;

          return [...withoutOptimistic, sentMessage].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      );
    },
    [conversationId, queryClient]
  );

  // Set up real-time event listeners
  useEffect(() => {
    if (!(typeof conversationId === 'number' && conversationId > 0)) {
      return;
    }

    // Join conversation room for real-time updates
    joinConversation(conversationId);

    onNewMessage(handleNewMessage);
    onMessageUpdated(handleMessageUpdated);
    onMessageDeleted(handleMessageDeleted);
    onMessageSent(handleMessageSent);

    return () => {
      offNewMessage(handleNewMessage);
      offMessageUpdated(handleMessageUpdated);
      offMessageDeleted(handleMessageDeleted);
      offMessageSent(handleMessageSent);
    };
  }, [
    conversationId,
    handleNewMessage,
    handleMessageUpdated,
    handleMessageDeleted,
    handleMessageSent,
  ]);

  return useQuery<ConversationMessage[]>({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: async () => {
      try {
        const messages = await fetchConversation.getMessages(
          conversationId as number,
          options?.pageSize ?? 50
        );

        // Track latest message timestamp for incremental updates
        if (messages.length > 0) {
          lastMessageTimestampRef.current = messages[messages.length - 1].createdAt;
        }

        return messages;
      } catch (error) {
        console.error('[useConversationMessages] Failed to fetch messages:', error);
        throw error;
      }
    },
    enabled: typeof conversationId === 'number' && conversationId > 0,
    staleTime: 30_000, // Increase cache time for better performance
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Rely on real-time updates
    refetchOnReconnect: false, // Don't auto-refetch on reconnect
    retry: 1, // Reduce retries for faster response
    retryDelay: 1000,
  });
}

// Modern infinite messages hook for high-performance UIs (e.g., windowed lists)
export function useInfiniteConversationMessages(
  conversationId: number | undefined,
  options?: { pageSize?: number }
) {
  const pageSize = options?.pageSize ?? 20;

  return useInfiniteQuery({
    queryKey: ['conversations', conversationId, 'messages', 'infinite', { pageSize }],
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const result = await fetchConversation.getMessagesPage({
        conversationId: conversationId as number,
        page,
        limit: pageSize,
      });
      return result;
    },
    enabled: typeof conversationId === 'number' && conversationId > 0,
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const { pagination } = lastPage;
      const hasMore = pagination.page < pagination.totalPages;
      return hasMore ? pagination.page + 1 : undefined;
    },
    staleTime: 10_000,
  });
}

export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, GetOrCreateConversationRequest>({
    mutationFn: async payload => {
      try {
        const conversation = await fetchConversation.getOrCreateConversation(payload);

        // Join the new/existing conversation room immediately
        if (conversation.id) {
          joinConversation(conversation.id);
        }

        return conversation;
      } catch (error) {
        console.error('[useGetOrCreateConversation] Failed:', error);
        throw error;
      }
    },
    onSuccess: newConversation => {
      // Update conversations cache immediately
      queryClient.setQueryData<Conversation[]>(['conversations', 'mine'], old => {
        if (!old) return [newConversation];

        // Check if conversation already exists
        const exists = old.some(conv => conv.id === newConversation.id);
        if (exists) return old;

        // Add new conversation to the top
        return [newConversation, ...old];
      });

      // Also invalidate to ensure server sync
      queryClient.invalidateQueries({ queryKey: ['conversations', 'mine'] });
    },
    onError: error => {
      console.error('[useGetOrCreateConversation] Error:', error);
    },
  });
}

// Enhanced hook for sending messages with optimistic updates
export function useSendMessage(conversationId: number | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ content, tempId }: { content: string; tempId: string }) => {
      if (!conversationId || !content.trim()) {
        throw new Error('Invalid message parameters');
      }

      try {
        // Use the enhanced socket method that returns a promise
        const { sendChatMessage } = await import('@/lib/api/services/socket');
        await sendChatMessage({
          conversationId,
          content: content.trim(),
          tempId,
        });

        return { tempId, conversationId, content: content.trim() };
      } catch (error) {
        console.error('[useSendMessage] Socket send failed:', error);
        // Don't throw here - let optimistic update stand
        return { tempId, conversationId, content: content.trim() };
      }
    },
    onMutate: async ({ content, tempId }) => {
      if (!conversationId || !user?.id) return;

      // Determine sender type based on user role or URL
      const isProvider = window.location.pathname.includes('/provider/');
      const senderType = isProvider ? 'PROVIDER' : 'CUSTOMER';

      // Create optimistic message
      const optimisticMessage: ConversationMessage = {
        id: Date.now(), // Temporary ID that will be unique
        conversationId,
        senderId: Number(user.id),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        senderType,
        tempId, // Add tempId for tracking
      };

      // Add optimistic message to cache - append to end for better performance
      queryClient.setQueryData<ConversationMessage[]>(
        ['conversations', conversationId, 'messages'],
        old => {
          if (!old) return [optimisticMessage];

          // Simply append to end - messages should be in order
          return [...old, optimisticMessage];
        }
      );

      // Update conversation preview optimistically
      queryClient.setQueryData<Conversation[]>(['conversations', 'mine'], old => {
        if (!old) return old;

        const updatedConversations = old.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: content.trim(),
              lastMessageAt: new Date().toISOString(),
            };
          }
          return conv;
        });

        // Move conversation to top
        const updatedConv = updatedConversations.find(c => c.id === conversationId);
        const otherConvs = updatedConversations.filter(c => c.id !== conversationId);

        return updatedConv ? [updatedConv, ...otherConvs] : updatedConversations;
      });

      return { optimisticMessage, tempId };
    },
    onSuccess: ({ tempId, conversationId: cid }) => {
      // Message sent successfully - mark as sent

      // Update optimistic message status immediately
      queryClient.setQueryData<ConversationMessage[]>(['conversations', cid, 'messages'], old =>
        old?.map(msg => (msg.tempId === tempId ? { ...msg, status: 'sent' } : msg))
      );

      // Minimal invalidation - only invalidate conversations list after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations', 'mine'] });
      }, 500);
    },
    onError: (error, { tempId, content }) => {
      console.error('[useSendMessage] Failed to send message:', error);

      if (!conversationId) return;

      // Mark optimistic message as failed instead of removing it
      queryClient.setQueryData<ConversationMessage[]>(
        ['conversations', conversationId, 'messages'],
        old =>
          old?.map(msg =>
            msg.tempId === tempId
              ? {
                  ...msg,
                  status: 'failed',
                  content: content, // Ensure content is preserved
                }
              : msg
          )
      );
    },
  });
}

// Hook for connection status monitoring
export function useSocketConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState(() => getConnectionStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      const status = getConnectionStatus();
      setConnectionStatus(prevStatus => {
        if (
          prevStatus.isConnected !== status.isConnected ||
          prevStatus.isConnecting !== status.isConnecting
        ) {
          return status;
        }
        return prevStatus;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return connectionStatus;
}
