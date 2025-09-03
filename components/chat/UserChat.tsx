'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useConversationMessages,
  useUserConversations,
  useSendMessage,
  useSocketConnectionStatus,
} from '@/hooks/useConversation';
import { Conversation, ConversationMessage } from '@/lib/api/services/fetchConversation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  Send,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

// Enhanced message with local state
interface EnhancedMessage extends ConversationMessage {
  tempId?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  retryCount?: number;
}

// Utility functions for better performance
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins}p`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate unique temp ID for optimistic updates
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Avatar component using Shadcn
const Avatar = ({
  src,
  name,
  size = 'md',
  className = '',
}: {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const initials =
    name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  return (
    <UIAvatar className={`${sizeClasses[size]} flex-shrink-0 ${className}`}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
    </UIAvatar>
  );
};

// Connection status
const ConnectionStatus = ({
  isConnected,
  isConnecting,
}: {
  isConnected: boolean;
  isConnecting: boolean;
}) => {
  if (isConnected) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang kết nối...</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Mất kết nối</span>
          </>
        )}
      </div>
    </div>
  );
};

export function UserChat() {
  const { data: conversations, isLoading: isLoadingConversations } = useUserConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [showConversationList, setShowConversationList] = useState(true); // Mobile state
  const { data: serverMessages, isLoading: isLoadingMessages } = useConversationMessages(
    typeof selectedConversationId === 'number' ? selectedConversationId : undefined
  );

  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const searchParams = useSearchParams();
  const connectionStatus = useSocketConnectionStatus();

  // Current user ID from auth store
  const userIdStr = useAuthStore(state => state.user?.id);
  const currentUserId = useMemo(() => {
    const idNum = userIdStr ? Number(userIdStr) : NaN;
    return Number.isFinite(idNum) ? idNum : null;
  }, [userIdStr]);

  // Use the enhanced send message hook
  const sendMessageMutation = useSendMessage(selectedConversationId || undefined);

  // Enhanced messages with optimistic updates handled by the hook
  const allMessages = useMemo<EnhancedMessage[]>(() => {
    if (!serverMessages) return [];

    return serverMessages
      .map(msg => ({
        ...msg,
        status: (msg as EnhancedMessage).status || ('delivered' as const),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [serverMessages]);

  // Read conversationId from query and select
  useEffect(() => {
    const idFromQuery = searchParams?.get('conversationId');
    const cid = idFromQuery ? Number(idFromQuery) : NaN;
    if (!Number.isNaN(cid) && cid > 0) {
      setSelectedConversationId(cid);
    }
  }, [searchParams]);

  // Select first conversation by default when loaded (if none specified)
  useEffect(() => {
    if (!isLoadingConversations && conversations && conversations.length > 0) {
      const idFromQuery = searchParams?.get('conversationId');
      if (selectedConversationId == null && !idFromQuery) {
        setSelectedConversationId(conversations[0].id);
      }
    }
  }, [isLoadingConversations, conversations, selectedConversationId, searchParams]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [allMessages]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text, adjustTextareaHeight]);

  const selectedConversation = useMemo<Conversation | null>(() => {
    if (!conversations || selectedConversationId == null) return null;
    return conversations.find(c => c.id === selectedConversationId) ?? null;
  }, [conversations, selectedConversationId]);

  const partner = useMemo(() => {
    // For user chat, we want to show the ServiceProvider as the partner
    return selectedConversation?.ServiceProvider?.user;
  }, [selectedConversation]);

  // Get current user info from auth store
  const currentUser = useAuthStore(state => state.user);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendMessageMutation.isPending && text.trim()) {
          const tempId = generateTempId();
          sendMessageMutation.mutate({ content: text, tempId });
          setText('');
        }
      }
    },
    [sendMessageMutation, text]
  );

  const handleSend = useCallback(() => {
    if (!sendMessageMutation.isPending && text.trim()) {
      const tempId = generateTempId();
      sendMessageMutation.mutate({ content: text, tempId });
      setText('');
    }
  }, [sendMessageMutation, text]);

  const handleConversationSelect = useCallback((conversationId: number) => {
    setSelectedConversationId(conversationId);
    setShowConversationList(false); // Hide conversation list on mobile when selecting
  }, []);

  const handleBackToConversations = useCallback(() => {
    setShowConversationList(true);
  }, []);

  return (
    <div className="h-fit bg-gray-50 flex">
      <ConnectionStatus
        isConnected={connectionStatus.isConnected}
        isConnecting={connectionStatus.isConnecting}
      />

      {/* Conversations Sidebar - Desktop */}
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200">
        <div className="flex flex-col overflow-hidden h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Tin nhắn</h1>
            <p className="text-sm text-gray-500">{conversations?.length || 0} cuộc trò chuyện</p>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {isLoadingConversations ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện</p>
                </div>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map(conversation => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Conversations List */}
      {showConversationList && (
        <div className="lg:hidden w-full bg-white flex flex-col overflow-hidden h-[calc(100vh-120px)]">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Tin nhắn</h1>
            <p className="text-sm text-gray-500">{conversations?.length || 0} cuộc trò chuyện</p>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {isLoadingConversations ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện</p>
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map(conversation => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Chat Area */}
      <div
        className={`${showConversationList ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-white h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)]`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                {/* Back button for mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToConversations}
                  className="lg:hidden flex-shrink-0 w-8 h-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <Avatar
                  src={partner?.avatar}
                  name={partner?.name}
                  size="md"
                  className="flex-shrink-0"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                    {partner?.name || 'Đối tác'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Nhà cung cấp dịch vụ</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-2 sm:px-3 lg:px-4 min-h-0">
              <div className="max-w-4xl mx-auto">
                {isLoadingMessages ? (
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
                        <Skeleton className={`h-12 w-48 lg:w-64 rounded-2xl`} />
                        {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                ) : allMessages && allMessages.length > 0 ? (
                  <div className="space-y-3 py-4">
                    {allMessages.map((message, index) => {
                      const isOwn = currentUserId != null && message.senderId === currentUserId;

                      return (
                        <EnhancedMessageItem
                          key={message.tempId || `${message.id}-${message.createdAt}`}
                          message={message}
                          isOwn={isOwn}
                          partnerName={partner?.name}
                          partnerAvatar={partner?.avatar}
                          currentUser={currentUser}
                          isLast={index === allMessages.length - 1}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageCircle className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Bắt đầu cuộc trò chuyện
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm">
                        Gửi tin nhắn đầu tiên để bắt đầu trò chuyện với {partner?.name}
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
                <div className="flex-1 min-w-0 max-w-2xl">
                  <Textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="resize-none text-sm max-h-32 min-h-[44px] sm:min-h-[48px] rounded-2xl border-gray-200 focus-visible:border-gray-300"
                    rows={1}
                    disabled={!selectedConversationId || !connectionStatus.isConnected}
                    maxLength={1000}
                  />
                </div>

                <Button
                  onClick={handleSend}
                  disabled={
                    !selectedConversationId ||
                    sendMessageMutation.isPending ||
                    !text.trim() ||
                    !connectionStatus.isConnected
                  }
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Tin nhắn của bạn</h2>
              <p className="text-gray-500 text-sm max-w-md">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation item
const ConversationItem = React.memo(
  ({
    conversation,
    isSelected,
    onClick,
  }: {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    // For user chat, we want to show the ServiceProvider as the partner
    const partner = conversation.ServiceProvider?.user;
    const hasUnread = (conversation.unreadByCustomer || 0) > 0;

    return (
      <Button
        type="button"
        onClick={onClick}
        variant="ghost"
        className={`w-full p-3 lg:p-3 h-auto min-h-[72px] lg:min-h-[64px] rounded-lg hover:bg-gray-50 transition-colors text-left justify-start ${
          isSelected ? 'bg-gray-100' : ''
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-shrink-0">
            <Avatar
              src={partner?.avatar}
              name={partner?.name}
              size="sm"
              className="sm:w-12 sm:h-12"
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between mb-1 gap-1 sm:gap-2">
              <h3
                className={`text-sm sm:text-base font-medium truncate flex-1 min-w-0 ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}
              >
                {partner?.name || 'Đối tác'}
              </h3>
              {conversation.lastMessageAt && (
                <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                  {formatTime(conversation.lastMessageAt)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-1 sm:gap-2">
              <p
                className={`text-xs sm:text-sm truncate flex-1 min-w-0 ${hasUnread ? 'text-gray-600 font-medium' : 'text-gray-500'}`}
              >
                {conversation.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
              </p>

              {/* {hasUnread && (
                <div className="ml-2 w-5 h-5 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                  {conversation.unreadByCustomer}
                </div>
              )} */}
            </div>
          </div>
        </div>
      </Button>
    );
  }
);

ConversationItem.displayName = 'ConversationItem';

// Message component
const EnhancedMessageItem = React.memo(
  ({
    message,
    isOwn,
    partnerName,
    partnerAvatar,
    currentUser,
  }: {
    message: EnhancedMessage;
    isOwn: boolean;
    partnerName?: string;
    partnerAvatar?: string | null;
    currentUser?: { name?: string; avatar?: string | null } | null;
    isLast?: boolean;
  }) => {
    const getStatusIcon = () => {
      switch (message.status) {
        case 'sending':
          return <Loader2 className="w-3 h-3 animate-spin text-gray-400" />;
        case 'sent':
          return <Check className="w-4 h-4 text-gray-400" />;
        case 'delivered':
          return <CheckCheck className="w-4 h-4 text-gray-400" />;
        case 'read':
          return <CheckCheck className="w-4 h-4 text-gray-600" />;
        case 'failed':
          return <AlertCircle className="w-3 h-3 text-gray-500" />;
        default:
          return null;
      }
    };

    return (
      <div className={`flex items-start gap-3 ${isOwn ? 'justify-end' : 'justify-start'} group`}>
        {/* Partner avatar */}
        {!isOwn && <Avatar src={partnerAvatar} name={partnerName} size="sm" />}

        {/* Message content */}
        <div
          className={`flex flex-col max-w-[240px] sm:max-w-[280px] md:max-w-xs lg:max-w-lg xl:max-w-xl ${isOwn ? 'items-end' : 'items-start'}`}
        >
          <Card
            className={`
          p-3 border-0 shadow-sm transition-colors
          ${isOwn ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
          ${message.status === 'failed' ? 'bg-gray-400 text-white' : ''}
        `}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </Card>

          {/* Message time and status */}
          <div
            className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isOwn ? 'flex-row-reverse' : 'flex-row'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            <span>{formatMessageTime(message.createdAt)}</span>
            {isOwn && getStatusIcon()}
          </div>
        </div>

        {/* Own avatar */}
        {isOwn && (
          <Avatar src={currentUser?.avatar || undefined} name={currentUser?.name} size="sm" />
        )}
      </div>
    );
  }
);

EnhancedMessageItem.displayName = 'EnhancedMessageItem';

export default UserChat;
