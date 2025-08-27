'use client';

import { LandingPage } from '@/components/landing/LandingPage';
import Header from '@/components/Header';
import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export default function RootPage() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const n8nChatUrl = process.env.NEXT_PUBLIC_N8N_CHAT;

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
        });
      } catch (error) {
        console.error('Error initializing n8n chat:', error);
      }
    }
  }, [n8nChatUrl]);

  return (
    <>
      <Header />
      <LandingPage />
      <div
        ref={chatContainerRef}
        className="min-h-[600px] w-full"
        style={
          {
            '--n8n-chat-primary-color': '#3b82f6',
            '--n8n-chat-secondary-color': '#8b5cf6',
            '--n8n-chat-background-color': '#ffffff',
            '--n8n-chat-text-color': '#1f2937',
            '--n8n-chat-border-radius': '12px',
          } as React.CSSProperties
        }
      />
    </>
  );
}
