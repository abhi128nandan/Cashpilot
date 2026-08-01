'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ai-copilot.module.css';
import type { AIMessage, AIContext } from '@/types';

export interface AICopilotPresenterProps {
  context: AIContext;
  messages: AIMessage[];
  isLoading: boolean;
  error: unknown;
  onSendMessage: (message: string) => void;
  suggestedPrompts: string[];
  insights: string[];
  userName?: string;
  defaultExpanded?: boolean;
}

export function AICopilotPresenter({
  messages,
  isLoading,
  error,
  onSendMessage,
  suggestedPrompts,
  insights,
  userName = 'Abhinandan',
  defaultExpanded = false,
}: AICopilotPresenterProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [localInput, setLocalInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (localInput?.trim() && !isLoading) {
        onSendMessage(localInput);
        setLocalInput('');
        if (!isExpanded) setIsExpanded(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput?.trim() && !isLoading) {
      onSendMessage(localInput);
      setLocalInput('');
      if (!isExpanded) setIsExpanded(true);
    }
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
    if (!isExpanded) setIsExpanded(true);
  };

  return (
    <div className={styles.container} id="ai-copilot">
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}>✨</span> CashPilot AI
        </div>
        {isExpanded && (
          <button 
            className={styles.closeBtn}
            onClick={() => setIsExpanded(false)}
            title="Collapse"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        )}
      </div>

      {!isExpanded ? (
        <div className={styles.collapsedBody}>
          <div>
            <h3 className={styles.greeting}>Good evening, {userName} 👋</h3>
            <p className={styles.greetingSub}>I&apos;ve analyzed today&apos;s activity.</p>
          </div>
          
          <ul className={styles.insightsList}>
            {insights.map((insight, idx) => (
              <li key={idx} className={styles.insightItem}>
                <span className={styles.insightBullet}>•</span>
                {insight}
              </li>
            ))}
          </ul>

          <div className={styles.suggestedPrompts}>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                className={styles.promptChip}
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <button 
            className={styles.expandBtn}
            onClick={() => setIsExpanded(true)}
          >
            Ask AI
          </button>
        </div>
      ) : (
        <div className={styles.expandedBody}>
          <div className={styles.messageList}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)' }}>
                How can I help you today?
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${
                  msg.role === 'user' ? styles.messageUser : styles.messageAssistant
                }`}
              >
                <div className={styles.messageAvatar}>
                  {msg.role === 'user' ? 'AM' : '✨'}
                </div>
                <div className={styles.messageBubble}>
                  {msg.content.split('\n').map((line: string, i: number) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={i} className={styles.msgSectionHeader}>{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                      return <li key={i} className={styles.msgListItem}>{line.replace(/^[•-]\s*/, '')}</li>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <div key={i} className={styles.msgHighlightCard}>{line.replace(/\*\*/g, '')}</div>;
                    }
                    return line.trim() ? <p key={i}>{line}</p> : <div key={i} className={styles.msgSpacer} />;
                  })}
                </div>
              </div>
            ))}
            
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className={`${styles.message} ${styles.messageAssistant}`}>
                <div className={styles.messageAvatar}>✨</div>
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
                  <p style={{ color: 'var(--color-danger-400)' }}>
                    AI insights temporarily unavailable.
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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
                id="copilot-input"
              />
              <button
                type="submit"
                disabled={!localInput?.trim() || isLoading}
                className={styles.sendBtn}
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
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
          </form>
        </div>
      )}
    </div>
  );
}
