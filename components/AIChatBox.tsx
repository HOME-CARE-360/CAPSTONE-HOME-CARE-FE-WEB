'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  X,
  Send,
  User,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useChat, useUserProfile } from '@/hooks/useUser';
import { ChatMessage, ChatService, ChatProvider } from '@/lib/api/services/fetchUser';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AIChatBoxProps {
  className?: string;
}
interface ChatMessageWithData extends ChatMessage {
  data?: {
    services?: ChatService[];
    service?: ChatService;
    providers?: ChatProvider[];
  };
}

export function AIChatBox({ className }: AIChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageWithData[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingContent, setTypingContent] = useState('');
  const [chatData, setChatData] = useState<{
    content: string;
    service?: ChatService;
    services: ChatService[];
    providers: ChatProvider[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mutate: sendMessage, isPending } = useChat();
  const router = useRouter();
  const { data: userProfile } = useUserProfile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingContent]);

  // Typing animation effect
  useEffect(() => {
    if (isTyping && chatData) {
      // Just show the actual response content from API, no hardcoded text
      const content = chatData.content || 'Đang xử lý yêu cầu của bạn...';

      // Show text immediately for faster response
      setTypingContent(content);

      // Add a small delay for visual effect, then complete
      const timeoutId = setTimeout(() => {
        const aiMessage: ChatMessageWithData = {
          role: 'assistant',
          content: content,
          data: {
            services: chatData.services,
            providers: chatData.providers,
            service: chatData.service,
          },
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        setTypingContent('');
        setChatData(null); // Clear chat data after adding to message
      }, 5); // Reduced delay for faster completion

      return () => clearTimeout(timeoutId);
    }
  }, [isTyping, chatData]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isPending) return;

    const userMessage: ChatMessageWithData = {
      role: 'user',
      content: inputMessage.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Send to API
    sendMessage(
      {
        message: userMessage.content,
        history: messages,
      },
      {
        onSuccess: response => {
          setChatData({
            content: response.content,
            services: response.data?.services || [],
            providers: response.data?.providers || [],
            service: response.data?.service,
          });
          setIsTyping(true);
          setTypingContent('');
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setChatData(null);
    setTypingContent('');
    setIsTyping(false);
  };

  const navigateToService = (serviceId: number) => {
    router.push(`/service/${serviceId}`);
    setIsOpen(false);
  };

  const navigateToProvider = (providerId: number) => {
    router.push(`/service-provider/${providerId}`);
    setIsOpen(false);
  };

  const ServiceCard = ({ service }: { service: ChatService }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => navigateToService(service.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
              {service.name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4 text-green-500" />
              <span>{service.durationMinutes} phút</span>
              <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                {service.Category?.name || 'N/A'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(service.basePrice)}
            </div>
            {service.virtualPrice && service.virtualPrice !== service.basePrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(service.virtualPrice)}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="truncate">{service.provider?.user?.name || 'N/A'}</span>
        </div>
      </CardContent>
    </Card>
  );

  const ProviderCard = ({ provider }: { provider: ChatProvider }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => navigateToProvider(provider.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-green-600 transition-colors">
              {provider.user?.name || 'N/A'}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="truncate">{provider.address || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-green-500" />
                <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] text-xs">
                  {provider.user?.phone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-hidden">
                <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] text-xs">
                  {provider.user?.email || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {provider.services && provider.services.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Dịch vụ:</p>
            <div className="flex flex-wrap gap-1">
              {provider.services.slice(0, 3).map(service => (
                <Badge
                  key={service.id}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {service.name}
                </Badge>
              ))}
              {provider.services.length > 3 && (
                <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                  +{provider.services.length - 3} dịch vụ khác
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageContent = (content: string) => {
    if (!content) return null;

    // Split content by lines and process each line
    const lines = content.split('\n');
    const processedLines: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip table lines completely for faster response
      if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
        continue;
      }

      // Handle headers
      if (trimmedLine.startsWith('### ')) {
        processedLines.push(
          <h3 key={i} className="text-lg font-bold text-gray-900 mb-2 mt-3 first:mt-0">
            {trimmedLine.replace('### ', '')}
          </h3>
        );
        continue;
      }

      if (trimmedLine.startsWith('## ')) {
        processedLines.push(
          <h2 key={i} className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0">
            {trimmedLine.replace('## ', '')}
          </h2>
        );
        continue;
      }

      if (trimmedLine.startsWith('# ')) {
        processedLines.push(
          <h1 key={i} className="text-2xl font-bold text-gray-900 mb-3 mt-4 first:mt-0">
            {trimmedLine.replace('# ', '')}
          </h1>
        );
        continue;
      }

      // Handle bullet points
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const content = trimmedLine.replace(/^[-*]\s*/, '');

        // Check if the content has bold text
        if (content.includes('**')) {
          const boldRegex = /\*\*(.*?)\*\*/g;
          let lastIndex = 0;
          const elements = [];
          let match;

          while ((match = boldRegex.exec(content)) !== null) {
            // Add text before the bold part
            if (match.index > lastIndex) {
              elements.push(
                <span key={`text-${match.index}`}>{content.slice(lastIndex, match.index)}</span>
              );
            }

            // Add the bold text
            elements.push(
              <strong key={`bold-${match.index}`} className="font-semibold text-gray-900">
                {match[1]}
              </strong>
            );

            lastIndex = match.index + match[0].length;
          }

          // Add remaining text after the last bold part
          if (lastIndex < content.length) {
            elements.push(<span key={`text-end`}>{content.slice(lastIndex)}</span>);
          }

          processedLines.push(
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-700">{elements}</span>
            </div>
          );
          continue;
        }

        // Regular bullet point without bold text
        processedLines.push(
          <div key={i} className="flex items-start gap-2 mb-1">
            <span className="text-gray-500 mt-1">•</span>
            <span className="text-sm text-gray-700">{content}</span>
          </div>
        );
        continue;
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        processedLines.push(
          <div key={i} className="flex items-start gap-2 mb-1">
            <span className="text-gray-500 text-sm font-medium min-w-[20px]">
              {trimmedLine.match(/^\d+\./)?.[0]}
            </span>
            <span className="text-sm text-gray-700">{trimmedLine.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
        continue;
      }

      // Handle bold text (**text**) - process all lines for inline bold text
      if (trimmedLine.includes('**')) {
        // Use a more robust regex to find all **text** patterns
        const boldRegex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        const elements = [];
        let match;

        while ((match = boldRegex.exec(trimmedLine)) !== null) {
          // Add text before the bold part
          if (match.index > lastIndex) {
            elements.push(
              <span key={`text-${match.index}`}>{trimmedLine.slice(lastIndex, match.index)}</span>
            );
          }

          // Add the bold text
          elements.push(
            <strong key={`bold-${match.index}`} className="font-semibold text-gray-900">
              {match[1]}
            </strong>
          );

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text after the last bold part
        if (lastIndex < trimmedLine.length) {
          elements.push(<span key={`text-end`}>{trimmedLine.slice(lastIndex)}</span>);
        }

        processedLines.push(
          <p key={i} className="text-sm text-gray-800 mb-2">
            {elements}
          </p>
        );
        continue;
      }

      // Handle empty lines
      if (trimmedLine === '') {
        processedLines.push(<div key={i} className="h-2" />);
        continue;
      }

      // Regular text
      processedLines.push(
        <p key={i} className="text-sm text-gray-800 mb-2">
          {trimmedLine}
        </p>
      );
    }

    return processedLines;
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-12 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50',
          'bg-green-500 hover:bg-green-600 text-white',
          className
        )}
        aria-label="Mở chat AI"
      >
        {userProfile?.data?.user?.avatar ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={userProfile.data.user.avatar} alt="User avatar" />
            <AvatarFallback className="text-xs bg-green-500 text-white">
              <MessageSquare className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4 overflow-y-auto">
          <Card className="w-full max-w-lg h-[700px] flex flex-col shadow-2xl">
            <CardHeader className="flex-shrink-0 bg-green-500 text-white rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src="/images/logo.png" alt="Homecare AI" width={32} height={32} />
                  <CardTitle className="text-lg">Homecare AI</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetChat}
                      className="h-8 px-2 text-white hover:text-white hover:bg-white/20 text-xs"
                      title="Bắt đầu cuộc trò chuyện mới"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Mới
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 items-center justify-between overflow-y-auto px-4 py-4 space-y-4 max-h-[550px]">
                {messages.length === 0 && !isTyping && (
                  <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center">
                    <Image src="/images/logo.png" alt="Homecare AI" width={120} height={120} />
                    <p className="text-sm">Xin chào! Tôi có thể giúp bạn tìm dịch vụ phù hợp.</p>
                    <p className="text-xs mt-1">Hãy hỏi tôi bất cứ điều gì về dịch vụ!</p>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-2',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-white text-white border">
                          <Image src="/images/logo.png" alt="Homecare AI" width={32} height={32} />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn('max-w-[85%]', message.role === 'user' ? 'order-2' : 'order-1')}
                    >
                      <div
                        className={cn(
                          'px-4 py-3 rounded-2xl shadow-sm border',
                          message.role === 'user'
                            ? 'bg-gray-50 text-gray-800 rounded-br-none'
                            : 'bg-gray-50 text-gray-800 rounded-bl-none'
                        )}
                      >
                        <div className="mb-2">{formatMessageContent(message.content)}</div>

                        {/* Show Service Cards if available */}
                        {message.data && (
                          <>
                            {/* Multiple services */}
                            {message.data.services && message.data.services.length > 0 && (
                              <div className="space-y-2 mb-2">
                                <h5 className="text-sm font-semibold text-gray-700">
                                  Dịch vụ phù hợp:
                                </h5>
                                {message.data.services.map(service => (
                                  <ServiceCard key={service.id} service={service} />
                                ))}
                              </div>
                            )}

                            {/* Single service */}
                            {message.data.service && (
                              <div className="space-y-2 mb-2">
                                <h5 className="text-sm font-semibold text-gray-700">
                                  Dịch vụ phù hợp:
                                </h5>
                                <ServiceCard
                                  key={message.data.service.id}
                                  service={message.data.service}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Show Provider Cards if available */}
                        {message.data &&
                          message.data.providers &&
                          message.data.providers.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold text-gray-700">Nhà cung cấp:</h5>
                              {message.data.providers.map(provider => (
                                <ProviderCard key={provider.id} provider={provider} />
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Time stamp */}
                      <div
                        className={cn(
                          'text-xs text-gray-500 mt-1',
                          message.role === 'user' ? 'text-right' : 'text-left'
                        )}
                      >
                        {formatTime(new Date())}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                        {userProfile?.data?.user?.avatar ? (
                          <AvatarImage src={userProfile.data.user.avatar} alt="User avatar" />
                        ) : null}
                        <AvatarFallback className="text-xs bg-green-500 text-white">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* AI Typing Animation */}
                {isTyping && (
                  <div className="flex justify-start gap-2">
                    <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-green-600 text-white">
                        <Image src="/images/logo.png" alt="Homecare AI" width={32} height={32} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[85%]">
                      <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border">
                        <div className="text-sm text-gray-800">
                          {formatMessageContent(typingContent)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isPending && (
                  <div className="flex justify-start gap-2">
                    <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-green-600 text-white">
                        <Image src="/images/logo.png" alt="Homecare AI" width={32} height={32} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[85%]">
                      <div className="px-4 py-3 rounded-2xl rounded-bl-none">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex-shrink-0 p-4 border-t bg-gray-50 rounded-md z-10">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn của bạn..."
                    disabled={isPending || isTyping}
                    className="flex-1 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isPending || isTyping}
                    size="sm"
                    className="px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
