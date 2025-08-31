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
import { Check, CheckCheck, Loader2, AlertCircle, Send, MessageCircle } from 'lucide-react';
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

// Utility functions
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

export default function ProviderChat() {
  const { data: conversations, isLoading: isLoadingConversations } = useUserConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const { data: serverMessages, isLoading: isLoadingMessages } = useConversationMessages(
    typeof selectedConversationId === 'number' ? selectedConversationId : undefined
  );

  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const searchParams = useSearchParams();
  const connectionStatus = useSocketConnectionStatus();

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

  useEffect(() => {
    const idFromQuery = searchParams?.get('conversationId');
    const cid = idFromQuery ? Number(idFromQuery) : NaN;
    if (!Number.isNaN(cid) && cid > 0) setSelectedConversationId(cid);
  }, [searchParams]);

  useEffect(() => {
    if (!isLoadingConversations && conversations && conversations.length > 0) {
      const idFromQuery = searchParams?.get('conversationId');
      if (selectedConversationId == null && !idFromQuery)
        setSelectedConversationId(conversations[0].id);
    }
  }, [isLoadingConversations, conversations, selectedConversationId, searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () =>
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        }),
      100
    );
    return () => clearTimeout(timeoutId);
  }, [allMessages]);

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
    // Provider view: partner is the Customer
    return (
      selectedConversation?.CustomerProfile?.user || selectedConversation?.ServiceProvider?.user
    );
  }, [selectedConversation]);

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
    <>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <ConnectionStatus
          isConnected={connectionStatus.isConnected}
          isConnecting={connectionStatus.isConnecting}
        />

        {/* Conversations Sidebar - Hidden on mobile when chat is open */}
        <div
          className={`${showConversationList ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white border-r border-gray-200 flex-col overflow-hidden`}
        >
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
              Khách hàng
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {conversations?.length || 0} cuộc trò chuyện
            </p>
          </div>

          <ScrollArea className="flex-1">
            {isLoadingConversations ? (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                      <Skeleton className="h-3 w-32 sm:h-3 sm:w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Chưa có cuộc trò chuyện</p>
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

        {/* Chat Area - Full width on mobile when conversation is selected */}
        <div
          className={`${showConversationList ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-white h-[calc(100vh-120px)] lg:h-screen`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToConversations}
                    className="lg:hidden flex-shrink-0 w-8 h-8"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </Button>
                  <Avatar
                    src={partner?.avatar}
                    name={partner?.name}
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                      {partner?.name || 'Khách hàng'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Khách hàng</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 px-2 sm:px-4 py-2 h-full">
                {isLoadingMessages ? (
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 sm:gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        {i % 2 !== 0 && (
                          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                        )}
                        <Skeleton className={`h-10 w-48 sm:h-12 sm:w-64 rounded-2xl`} />
                        {i % 2 === 0 && (
                          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : allMessages && allMessages.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 py-3 sm:py-4">
                    {allMessages.map((message, index) => {
                      const isOwn = currentUserId != null && message.senderId === currentUserId;

                      return (
                        <EnhancedMessageItem
                          key={message.tempId || `${message.id}-${message.createdAt}`}
                          message={message}
                          isOwn={isOwn}
                          partnerName={partner?.name}
                          partnerAvatar={partner?.avatar}
                          isLast={index === allMessages.length - 1}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-6 sm:p-8">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        Bắt đầu cuộc trò chuyện
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm max-w-sm">
                        Gửi tin nhắn đầu tiên để bắt đầu trò chuyện với {partner?.name}
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Message Input */}
              <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-end gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
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
              <div className="text-center p-6 sm:p-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  Tin nhắn khách hàng
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm max-w-md">
                  <span className="hidden sm:inline">
                    Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
                  </span>
                  <span className="sm:hidden">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
    const partner = conversation.CustomerProfile?.user || conversation.ServiceProvider?.user;
    const hasUnread = (conversation.unreadByProvider || 0) > 0;
    return (
      <Button
        variant="ghost"
        onClick={onClick}
        className={`w-full p-2 sm:p-3 h-auto rounded-lg hover:bg-gray-50 transition-colors text-left justify-start ${
          isSelected ? 'bg-gray-100' : ''
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar
            src={partner?.avatar}
            name={partner?.name}
            size="sm"
            className="sm:w-10 sm:h-10"
          />
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between mb-1 gap-1 sm:gap-2">
              <h3
                className={`text-sm sm:text-base font-medium truncate flex-1 min-w-0 ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}
              >
                {partner?.name || 'Khách hàng'}
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
  }: {
    message: EnhancedMessage;
    isOwn: boolean;
    partnerName?: string;
    partnerAvatar?: string | null;
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
      <div
        className={`flex items-start gap-2 sm:gap-3 ${isOwn ? 'justify-end' : 'justify-start'} group`}
      >
        {/* Partner avatar */}
        {!isOwn && (
          <Avatar src={partnerAvatar} name={partnerName} size="sm" className="sm:w-8 sm:h-8" />
        )}

        {/* Message content */}
        <div
          className={`flex flex-col max-w-[240px] sm:max-w-[280px] md:max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}
        >
          <Card
            className={`
          p-2 sm:p-3 border-0 shadow-sm transition-colors
          ${isOwn ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
          ${message.status === 'failed' ? 'bg-gray-400 text-white' : ''}
        `}
          >
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
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
          <Avatar
            src={useAuthStore.getState().user?.avatar}
            name={useAuthStore.getState().user?.name}
            size="sm"
            className="sm:w-8 sm:h-8"
          />
        )}
      </div>
    );
  }
);

EnhancedMessageItem.displayName = 'EnhancedMessageItem';
