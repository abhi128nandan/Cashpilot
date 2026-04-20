import type { Metadata } from 'next';
import ChatInterface from '@/components/features/chat/chat-interface';

export const metadata: Metadata = {
  title: 'AI Chat',
  description: 'Ask questions about your finances using natural language powered by AI.',
};

export default function ChatPage() {
  return <ChatInterface />;
}
