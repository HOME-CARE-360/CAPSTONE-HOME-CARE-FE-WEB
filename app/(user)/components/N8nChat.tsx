'use client';

import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export default function N8nChat() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const n8nChatUrl = 'https://n8n.homecare.io.vn/webhook/4f24cea2-47b5-45cc-a36e-0165132382b5/chat';

  console.log(n8nChatUrl);

  useEffect(() => {
    if (n8nChatUrl && chatContainerRef.current) {
      try {
        createChat({
          webhookUrl: n8nChatUrl,
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderRadius: '12px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          initialMessages: ['Xin chào! 👋', 'Tôi là HomeCare. Tôi có thể giúp gì cho bạn hôm nay?'],
          i18n: {
            en: {
              title: 'Xin chào! 👋',
              subtitle: 'Bắt đầu trò chuyện. Chúng tôi sẽ giúp bạn 24/7.',
              footer: '',
              getStarted: 'Trò chuyện mới',
              inputPlaceholder: 'Nhập câu hỏi của bạn..',
              closeButtonTooltip: 'Đóng trò chuyện',
            },
          },
        });
      } catch (error) {
        console.error('Error initializing n8n chat:', error);
      }
    }
  }, [n8nChatUrl]);

  return (
    <div
      ref={chatContainerRef}
      className="min-h-[600px] w-full"
      style={
        {
          '--chat--color-primary': '#e74266',
          '--chat--color-primary-shade-50': '#db4061',
          '--chat--color-primary-shade-100': '#cf3c5c',
          '--chat--color-secondary': '#20b69e',
          '--chat--color-secondary-shade-50': '#1ca08a',
          '--chat--color-white': '#ffffff',
          '--chat--color-light': '#f2f4f8',
          '--chat--color-light-shade-50': '#e6e9f1',
          '--chat--color-light-shade-100': '#c2c5cc',
          '--chat--color-medium': '#d2d4d9',
          '--chat--color-dark': '#101330',
          '--chat--color-disabled': '#777980',
          '--chat--color-typing': '#404040',

          '--chat--spacing': '1rem',
          '--chat--border-radius': '0.25rem',
          '--chat--transition-duration': '0.15s',

          '--chat--window--width': '400px',
          '--chat--window--height': '600px',

          '--chat--header-height': 'auto',
          '--chat--header--padding': 'var(--chat--spacing)',
          '--chat--header--background': 'var(--chat--color-dark)',
          '--chat--header--color': 'var(--chat--color-light)',
          '--chat--header--border-top': 'none',
          '--chat--header--border-bottom': 'none',
          '--chat--heading--font-size': '2em',
          '--chat--subtitle--font-size': 'inherit',
          '--chat--subtitle--line-height': '1.8',

          '--chat--textarea--height': '50px',

          '--chat--message--font-size': '1rem',
          '--chat--message--padding': 'var(--chat--spacing)',
          '--chat--message--border-radius': 'var(--chat--border-radius)',
          '--chat--message-line-height': '1.8',
          '--chat--message--bot--background': 'var(--chat--color-white)',
          '--chat--message--bot--color': 'var(--chat--color-dark)',
          '--chat--message--bot--border': 'none',
          '--chat--message--user--background': 'var(--chat--color-secondary)',
          '--chat--message--user--color': 'var(--chat--color-white)',
          '--chat--message--user--border': 'none',
          '--chat--message--pre--background': 'rgba(0, 0, 0, 0.05)',

          '--chat--toggle--background': 'var(--chat--color-primary)',
          '--chat--toggle--hover--background': 'var(--chat--color-primary-shade-50)',
          '--chat--toggle--active--background': 'var(--chat--color-primary-shade-100)',
          '--chat--toggle--color': 'var(--chat--color-white)',
          '--chat--toggle--size': '64px',
        } as React.CSSProperties
      }
    />
  );
}
