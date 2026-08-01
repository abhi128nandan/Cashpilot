'use client';

import { useAnalytics } from '@/hooks/use-analytics';
import { AICopilotContainer } from '@/components/features/dashboard/ai-copilot-container';
import styles from './page.module.css';

export default function ChatClient({ userName }: { userName: string }) {
  const { data } = useAnalytics();

  const context = {
    page: 'chat' as const,
    stats: data?.stats,
    recentTransactions: data?.recentTransactions,
    alerts: data?.anomalies,
  };

  return (
    <div className={styles.page}>
      <div className={styles.copilotWrapper}>
        <AICopilotContainer 
          context={context} 
          userName={userName}
        />
      </div>
    </div>
  );
}
