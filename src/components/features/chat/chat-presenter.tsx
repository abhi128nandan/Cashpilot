'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './chat-interface.module.css';
import type { AIMessage } from '@/types';

export interface ChatPresenterProps {
  messages: AIMessage[];
  isLoading: boolean;
  error: unknown;
  onSendMessage: (message: string) => void;
  suggestedPrompts?: string[];
}

const defaultSuggestedPrompts = [
  'How much did I spend on dining this month?',
  'What are my top 3 expense categories?',
  'Am I on track with my budget?',
  'Predict my expenses for next month',
  'Find any unusual transactions',
  'How can I save more this month?',
];

export function ChatPresenter({
  messages,
  isLoading,
  error,
  onSendMessage,
  suggestedPrompts = defaultSuggestedPrompts,
}: ChatPresenterProps) {
  const [localInput, setLocalInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (localInput?.trim() && !isLoading) {
        onSendMessage(localInput);
        setLocalInput('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput?.trim() && !isLoading) {
      onSendMessage(localInput);
      setLocalInput('');
    }
  };

  return (
    <div className={styles.container} id="chat-page">
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🤖</div>
          <h2 className={styles.emptyTitle}>CashPilot AI</h2>
          <p className={styles.emptyDesc}>
            Ask me anything about your finances. I can analyze spending patterns,
            track budgets, detect anomalies, and forecast cash flow.
          </p>
          <div className={styles.promptGrid}>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                className={styles.promptChip}
                onClick={() => {
                  onSendMessage(prompt);
                  setLocalInput('');
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.role === 'user' ? styles.messageUser : styles.messageAssistant
              }`}
            >
              <div className={styles.messageAvatar}>
                {msg.role === 'user' ? 'AM' : '🤖'}
              </div>
              <div className={styles.messageBubble}>
                <div className={styles.messageContent}>
                  {msg.content.split('\n').map((line: string, i: number) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className={`${styles.message} ${styles.messageAssistant}`}>
              <div className={styles.messageAvatar}>🤖</div>
              <div className={styles.messageBubble}>
                <div className={styles.typingDots}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
          {error !== null && (
            <div className={`${styles.message} ${styles.messageAssistant}`}>
              <div className={styles.messageAvatar}>⚠️</div>
              <div className={styles.messageBubble}>
                <div className={styles.messageContent}>
                  <p style={{ color: 'var(--color-danger-400)' }}>
                    AI insights temporarily unavailable. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={inputRef}
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            className={styles.textInput}
            rows={1}
            id="chat-input"
          />
          <button
            type="submit"
            disabled={!localInput?.trim() || isLoading}
            className={styles.sendBtn}
            id="chat-send"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M16.5 1.5L8.25 9.75M16.5 1.5L11.25 16.5L8.25 9.75M16.5 1.5L1.5 6.75L8.25 9.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>
          CashPilot AI provides insights based on your data. Always verify financial decisions independently.
        </p>
      </form>
    </div>
  );
}
