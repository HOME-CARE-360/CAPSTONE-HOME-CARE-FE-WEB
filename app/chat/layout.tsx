import { TooltipProvider } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'OpenAI and AI SDK Chatbot',
  description: 'A simple chatbot built using the OpenAI API.',
};

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}
