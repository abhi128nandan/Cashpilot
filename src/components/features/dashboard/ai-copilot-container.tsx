'use client';

import { useState, useRef } from 'react';
import type { AIMessage, AIContext } from '@/types';
import { AICopilotPresenter } from './ai-copilot-presenter';

export interface AICopilotContainerProps {
  context: AIContext;
  userName?: string;
}

export function AICopilotContainer({ context, userName }: AICopilotContainerProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const retryLastMessage = () => {
    const lastUserMsg = messages.slice().reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      // Remove any trailing error assistant message if it exists
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant' && error) {
          newMsgs.pop();
        }
        return newMsgs;
      });
      sendMessage(lastUserMsg.content, true);
    }
  };
  
  const sendMessage = async (message: string, isRetry = false) => {
    if (!message.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    if (!isRetry) {
      setMessages((prev) => [...prev, userMessage]);
    }
    
    setIsLoading(true);
    setError(null);

    const updatedMessages = isRetry ? messages : [...messages, userMessage];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: updatedMessages,
          // Passing context to the backend (for future integration)
          context, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => null);

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: errorData || 'Something went wrong while generating response.',
            createdAt: new Date().toISOString(),
          },
        ]);

        setError(new Error(errorData || 'API Error'));
        setIsLoading(false);
        return;
      }

      if (!response.body) throw new Error('No body in response');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessageId = `msg-${Date.now() + 1}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ]);

      let fullContent = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        fullContent += chunk;
        setMessages((prev) => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullContent }
            : msg
        ));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request cancelled intentionally
        return;
      }
      console.error(err);
      setError(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Something went wrong while generating response.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  // Generate dynamic insights based on context
  let insights = [
    "You're on track for your savings goal.",
    "Food spending is stable.",
  ];
  
  if (context.page === 'dashboard' && context.stats) {
    insights = [
      `Your net balance is ₹${context.stats.netBalance.toLocaleString()}`,
      `Your savings rate is ${context.stats.savingsRate}%`,
      `Your top category is ${context.stats.topCategory}`,
    ];
  }

  // Generate context-aware suggestions
  let suggestedPrompts = [
    'Why did I spend more this month?',
    'Can I afford a ₹1.4L MacBook?',
    'Predict next month expenses.',
    'Explain this chart.',
  ];

  if (context.page === 'transactions') {
    suggestedPrompts = [
      'Show unusual transactions.',
      'Categorize my recent spending.',
      'Find my subscriptions.',
    ];
  } else if (context.page === 'budgets') {
    suggestedPrompts = [
      'Which budgets am I overspending on?',
      'How much should I save?',
      'Recommend new budget limits.',
    ];
  }

  return (
    <AICopilotPresenter
      context={context}
      messages={messages}
      isLoading={isLoading}
      error={error}
      onSendMessage={sendMessage}
      onCancel={cancelGeneration}
      onRetry={retryLastMessage}
      suggestedPrompts={suggestedPrompts}
      insights={insights}
      userName={userName}
      defaultExpanded={context.page === 'chat'}
    />
  );
}
