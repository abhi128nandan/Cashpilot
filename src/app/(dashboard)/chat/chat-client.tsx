'use client';

import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/use-analytics';
import Skeleton from '@/components/ui/skeleton';
import styles from './page.module.css';

const AICopilotContainer = dynamic(
  () => import('@/components/features/dashboard/ai-copilot-container').then(m => m.AICopilotContainer),
  {
    ssr: false,
    loading: () => (
      <Skeleton style={{ height: '500px', width: '100%', borderRadius: '16px' }} />
    ),
  }
);

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
