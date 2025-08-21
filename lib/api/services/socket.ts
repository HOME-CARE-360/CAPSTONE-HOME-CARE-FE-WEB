import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/authStore';

let socket: Socket | null = null;
let isConnected = false;
let isConnecting = false;
const roomsToJoin = new Set<number>();
type SocketEventHandler = (...args: unknown[]) => void;
const eventHandlers = new Map<string, Set<SocketEventHandler>>();
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let connectionPromise: Promise<Socket> | null = null;

function getBaseSocketUrl(): string {
  const fromApi = process.env.NEXT_PUBLIC_API_URL_BACKEND;
  const url = (fromApi || '').replace(/\/$/, '');
  return url;
}

export function connectSocket(): Socket | null {
  const baseUrl = getBaseSocketUrl();
  if (!baseUrl) {
    console.warn('[Socket] No base URL configured');
    return null;
  }

  // Return existing socket if already connected or connecting
  if (socket && (isConnected || isConnecting)) {
    return socket;
  }

  // Return the connection promise if already attempting to connect
  if (connectionPromise) {
    return socket;
  }

  const token = useAuthStore.getState().token || null;
  if (!token) {
    console.warn('[Socket] No auth token available');
    return null;
  }

  isConnecting = true;

  connectionPromise = new Promise((resolve, reject) => {
    try {
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      socket = io(baseUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        withCredentials: true,
        auth: { token },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        forceNew: true,
      });

      socket.on('connect', () => {
        isConnected = true;
        isConnecting = false;
        reconnectAttempts = 0;

        // Re-register all event handlers after connection
        reregisterEventHandlers();

        // Re-join all conversation rooms
        roomsToJoin.forEach(conversationId => {
          try {
            socket?.emit('chat:joinConversation', { conversationId });
          } catch (error) {
            console.error(`❌ [SOCKET] Failed to rejoin conversation ${conversationId}:`, error);
          }
        });

        resolve(socket!);
      });

      socket.on('disconnect', reason => {
        isConnected = false;
        isConnecting = false;

        // Don't try to reconnect if it was a manual disconnect
        if (reason === 'io client disconnect') {
          connectionPromise = null;
        }
      });

      socket.on('connect_error', error => {
        console.error('[Socket] Connection error:', error);
        isConnected = false;
        isConnecting = false;
        reconnectAttempts++;

        if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('[Socket] Max reconnection attempts reached');
          connectionPromise = null;
          reject(error);
        }
      });

      socket.on('reconnect', () => {
        reconnectAttempts = 0;
      });

      socket.on('reconnect_error', error => {
        console.error('[Socket] Reconnection error:', error);
      });

      socket.on('chat:error', error => {
        console.error('[Socket] Chat error:', error);
      });

      // Set up a connection timeout
      setTimeout(() => {
        if (!isConnected && isConnecting) {
          console.error('[Socket] Connection timeout');
          isConnecting = false;
          connectionPromise = null;
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    } catch (error) {
      console.error('[Socket] Failed to create socket:', error);
      isConnecting = false;
      connectionPromise = null;
      reject(error);
    }
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    console.log('[Socket] Manually disconnecting');
    socket.disconnect();
    socket = null;
    isConnected = false;
    isConnecting = false;
    connectionPromise = null;
    roomsToJoin.clear();
    eventHandlers.clear();
  }
}

export function isSocketConnected(): boolean {
  return isConnected && socket?.connected === true;
}

export function getConnectionStatus(): {
  isConnected: boolean;
  isConnecting: boolean;
  socket: Socket | null;
} {
  return {
    isConnected: isConnected && socket?.connected === true,
    isConnecting,
    socket,
  };
}

// Debug function to test if socket events are working
export function testSocketConnection() {
  const s = getSocket();
  if (!s) {
    return;
  }

  // Test emit
  try {
    s.emit('ping', 'test');
  } catch (error) {
    console.error('❌ [TEST] Failed to send ping:', error);
  }
}

export function joinConversation(conversationId: number): void {
  if (typeof conversationId !== 'number' || conversationId <= 0) {
    console.warn('[Socket] Invalid conversation ID:', conversationId);
    return;
  }

  // Always remember the room for auto-rejoin after reconnect
  roomsToJoin.add(conversationId);

  const s = connectSocket();
  if (!s) {
    console.warn('[Socket] No socket available for joining conversation', conversationId);
    return;
  }

  try {
    // Always emit join, even if not connected - socket.io will queue it
    s.emit('chat:joinConversation', { conversationId });
  } catch (error) {
    console.error(`[Socket] Failed to join conversation ${conversationId}:`, error);
  }
}

export function leaveConversation(conversationId: number): void {
  if (typeof conversationId !== 'number' || conversationId <= 0) {
    return;
  }

  roomsToJoin.delete(conversationId);

  const s = getSocket();
  if (s && isConnected) {
    try {
      s.emit('chat:leaveConversation', { conversationId });
    } catch (error) {
      console.error(`[Socket] Failed to leave conversation ${conversationId}:`, error);
    }
  }
}

export type SendMessagePayload = {
  conversationId: number;
  content: string;
  tempId?: string;
};

export function sendChatMessage(payload: SendMessagePayload): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = connectSocket();
    if (!s) {
      reject(new Error('No socket connection available'));
      return;
    }

    // Validate payload
    if (!payload.conversationId || !payload.content?.trim()) {
      reject(new Error('Invalid message payload'));
      return;
    }

    let isResolved = false;
    const timeoutDuration = 3000; // Reduced to 3 seconds for better UX

    try {
      // Send message immediately without waiting for acknowledgment
      s.emit('chat:sendMessage', payload);

      // Resolve immediately for better UX
      if (!isResolved) {
        isResolved = true;
        resolve();
      }

      // Fallback timeout - resolve optimistically if no acknowledgment
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve(); // Resolve instead of reject for better UX
        }
      }, timeoutDuration);
    } catch (error) {
      if (!isResolved) {
        isResolved = true;
        console.error('[Socket] Failed to send message:', error);
        reject(error);
      }
    }
  });
}

export type NewMessageHandler = (message: unknown) => void;
export type GenericHandler = (payload: unknown) => void;

// Improved event handler management with automatic cleanup and reconnection
function addEventHandler(event: string, handler: SocketEventHandler): void {
  if (!eventHandlers.has(event)) {
    eventHandlers.set(event, new Set());
  }

  const handlers = eventHandlers.get(event)!;

  // Don't add duplicate handlers
  if (handlers.has(handler)) {
    console.log(`🔄 [SOCKET] Handler already registered for ${event}`);
    return;
  }

  handlers.add(handler);
  console.log(`✅ [SOCKET] Added handler for ${event}, total: ${handlers.size}`);

  const s = connectSocket();
  if (s) {
    s.on(event, handler as SocketEventHandler);
  }
}

function removeEventHandler(event: string, handler: SocketEventHandler): void {
  const handlers = eventHandlers.get(event);
  if (handlers) {
    handlers.delete(handler);
    console.log(`🗑️ [SOCKET] Removed handler for ${event}, remaining: ${handlers.size}`);
    if (handlers.size === 0) {
      eventHandlers.delete(event);
    }
  }

  const s = getSocket();
  if (s) {
    s.off(event, handler as SocketEventHandler);
  }
}

// Re-register all event handlers after reconnection
function reregisterEventHandlers(): void {
  const s = getSocket();
  if (!s) return;

  console.log('[Socket] Re-registering event handlers...');
  eventHandlers.forEach((handlers, event) => {
    handlers.forEach(handler => {
      s.on(event, handler as SocketEventHandler);
      console.log(`[Socket] Re-registered handler for ${event}`);
    });
  });
}

export function onNewMessage(handler: NewMessageHandler): void {
  console.log('🔧 [SOCKET] Registering new message handler');
  addEventHandler('chat:newMessage', handler);
}

export function offNewMessage(handler: NewMessageHandler): void {
  removeEventHandler('chat:newMessage', handler);
}

export function onMessageUpdated(handler: GenericHandler): void {
  addEventHandler('chat:messageUpdated', handler);
}

export function offMessageUpdated(handler: GenericHandler): void {
  removeEventHandler('chat:messageUpdated', handler);
}

export function onMessageDeleted(handler: GenericHandler): void {
  addEventHandler('chat:messageDeleted', handler);
}

export function offMessageDeleted(handler: GenericHandler): void {
  removeEventHandler('chat:messageDeleted', handler);
}

export function onMessageSent(handler: GenericHandler): void {
  addEventHandler('chat:messageSent', handler);
}

export function offMessageSent(handler: GenericHandler): void {
  removeEventHandler('chat:messageSent', handler);
}

export function onTypingStart(handler: GenericHandler): void {
  addEventHandler('chat:typingStart', handler);
}

export function offTypingStart(handler: GenericHandler): void {
  removeEventHandler('chat:typingStart', handler);
}

export function onTypingStop(handler: GenericHandler): void {
  addEventHandler('chat:typingStop', handler);
}

export function offTypingStop(handler: GenericHandler): void {
  removeEventHandler('chat:typingStop', handler);
}

export function onConversationUpdated(handler: GenericHandler): void {
  addEventHandler('chat:conversationUpdated', handler);
}

export function offConversationUpdated(handler: GenericHandler): void {
  removeEventHandler('chat:conversationUpdated', handler);
}

// Utility functions for connection management
export function forceReconnect(): void {
  if (socket) {
    console.log('[Socket] Forcing reconnection...');
    socket.disconnect();
    connectionPromise = null;
    setTimeout(() => {
      connectSocket();
    }, 1000);
  }
}

export function clearAllEventHandlers(): void {
  eventHandlers.clear();
  if (socket) {
    socket.removeAllListeners();
  }
}
