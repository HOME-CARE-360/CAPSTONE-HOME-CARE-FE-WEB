// components/ButtonChatbot.tsx
'use client';

// import Spline from '@splinetool/react-spline';
import { Bot } from 'lucide-react';

export default function ButtonChatbot() {
  return (
    <button
      onClick={() => console.log('Open chatbot')}
      className="fixed bottom-20 right-6 z-50 w-16 h-16 rounded-full overflow-hidden hover:scale-105 transition-transform duration-200"
    >
      {/* <Spline
        scene="https://prod.spline.design/8FCwasFUig7pjige/scene.splinecode"
        style={{
          position: 'absolute',
          top: '5%',
          left: '20%',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }} */}
      {/* /> */}
      <Bot className="h-14 w-14 text-green-500" />
    </button>
  );
}
