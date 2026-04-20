'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './chat-interface.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  'How much did I spend on dining this month?',
  'What are my top 3 expense categories?',
  'Am I on track with my budget?',
  'Predict my expenses for next month',
  'Find any unusual transactions',
  'How can I save more this month?',
];

const mockResponses: Record<string, string> = {
  default: `Based on your transaction history, here's what I can see:

**This Month's Summary:**
- 💰 Total Income: $10,900.00
- 📉 Total Expenses: $3,638.09
- 📊 Net Savings: $7,261.91 (66.6% savings rate)

Your top spending categories are Housing ($2,200), Investments ($500), and Travel ($350). 

Your savings rate of 66.6% is excellent — well above the recommended 20%. Would you like me to analyze any specific category in more detail?`,

  dining: `Here's your **Food & Dining** breakdown for this month:

| Merchant | Amount | Date |
|----------|--------|------|
| Whole Foods Market | $67.50 | Mar 2 |
| Olive Garden | $42.80 | Mar 6 |
| Starbucks | $12.50 | Mar 12 |

**Total: $122.80** across 3 transactions.

📊 This is **18% under** your $400 monthly dining budget. You're on track! At this pace, you'll end the month around $245 — saving approximately $155 from your dining budget.`,

  budget: `Let me check your budget status:

| Category | Budget | Spent | Remaining | Status |
|----------|--------|-------|-----------|--------|
| 🍕 Food & Dining | $400 | $122.80 | $277.20 | ✅ On track |
| 🎬 Entertainment | $150 | $32.00 | $118.00 | ✅ On track |
| 🛍️ Shopping | $300 | $189.99 | $110.01 | ⚠️ Watch it |
| 🚗 Transportation | $200 | $45.00 | $155.00 | ✅ On track |

**Shopping** is at 63% with 17 days left — you might want to slow down there. All other categories look healthy!`,

  unusual: `I detected **2 potential anomalies** in your recent transactions:

1. ⚠️ **Amazon — $189.99** (Mar 7)
   This is 3x higher than your average shopping transaction ($63.33). It was for "Noise-cancelling headphones."

2. ℹ️ **United Airlines — $350.00** (Mar 13)
   First-time merchant detected. This appears to be a travel booking.

Neither seems fraudulent, but the Amazon purchase pushed your Shopping category to 63% of its monthly budget. Want me to adjust your budget recommendations?`,
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('dining') || q.includes('food') || q.includes('restaurant')) return mockResponses.dining;
    if (q.includes('budget') || q.includes('track')) return mockResponses.budget;
    if (q.includes('unusual') || q.includes('anomal') || q.includes('suspicious')) return mockResponses.unusual;
    return mockResponses.default;
  };

  const handleSend = async (content?: string) => {
    const text = content || input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI streaming delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const assistantMsg: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: getResponse(text),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
                onClick={() => handleSend(prompt)}
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
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
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
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            className={styles.textInput}
            rows={1}
            id="chat-input"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
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
      </div>
    </div>
  );
}
