'use client';

import dynamic from 'next/dynamic';
import styles from './page.module.css';

import {
  demoDashboardStats,
  demoTransactions,
  demoMonthlyTrends,
  demoSpendingByCategory,
  demoAnomalies,
} from '@/lib/demo-workspace';
import type { AIMessage } from '@/types';

const StatsCards = dynamic(() => import('@/components/features/dashboard/stats-cards'), { ssr: false, loading: () => <div className={styles.loadingBox}>Loading Stats...</div> });
const SpendingChart = dynamic(() => import('@/components/features/dashboard/spending-chart'), { ssr: false, loading: () => <div className={styles.loadingBox}>Loading Chart...</div> });
const RecentTransactions = dynamic(() => import('@/components/features/dashboard/recent-transactions'), { ssr: false, loading: () => <div className={styles.loadingBox}>Loading Transactions...</div> });
const CategoryBreakdown = dynamic(() => import('@/components/features/dashboard/category-breakdown'), { ssr: false, loading: () => <div className={styles.loadingBox}>Loading Categories...</div> });
const AnomalyAlerts = dynamic(() => import('@/components/features/dashboard/anomaly-alerts'), { ssr: false, loading: () => <div className={styles.loadingBox}>Loading Alerts...</div> });
const AICopilotPresenter = dynamic(() => import('@/components/features/dashboard/ai-copilot-presenter').then(mod => mod.AICopilotPresenter), { ssr: false, loading: () => <div className={styles.loadingBox}>Loading AI...</div> });

export function ProductTour() {
  // A predefined compelling conversation story for the landing page
  const demoStoryMessages: AIMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Can you analyze my expenses this month? Why is it higher than usual?',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      role: 'assistant',
      content: '### Summary\nYour spending increased 12% compared to last month.\n\n### Main Drivers\n- Dining (Up ₹1,200)\n- AWS Cloud (New recurring charge)\n- GitHub Copilot (Subscription renewed)\n\n### Recommendation\n**Pause AWS Cloud to save ₹8,500/month**\nWould you like me to flag the AWS charge as a subscription and set up an alert?',
      createdAt: new Date().toISOString(),
    }
  ];

  return (
    <div className={styles.tourContainer}>
      <div className={styles.tourWindow}>
        <div className={styles.windowHeader}>
          <div className={styles.windowControls}>
            <span className={styles.windowControlClose} />
            <span className={styles.windowControlMin} />
            <span className={styles.windowControlMax} />
          </div>
          <div className={styles.windowTitle}>cashpilot.app</div>
        </div>
        
        <div className={styles.windowContent}>
          {/* We reuse the actual dashboard layout structure here */}
          <div className={styles.dashboardPreviewWrapper}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <StatsCards stats={demoDashboardStats} />
            </div>

            <div className={styles.previewGrid}>
              <div className={styles.previewCol8}>
                <SpendingChart data={demoMonthlyTrends} />
              </div>
              <div className={styles.previewCol4}>
                {/* For the landing page, we can force the Expanded state by customizing the component or just letting it default to collapsed and relying on the user to click it. Wait, the prompt says "Replace the generic browser mockup with a real application preview... Make the hero tell a story... Show believable financial insights". 
                Let's use a specialized wrapper or just pass in a prop? 
                Actually, we can use the regular AICopilotPresenter. But we want it to be expanded by default for the story to show! 
                I'll wrap it in a custom un-collapsible preview, or just pass `defaultExpanded={true}` to AICopilotPresenter.
                Since I don't want to modify the real component too much, I will modify AICopilotPresenter to accept `defaultExpanded`. */}
                <AICopilotPresenter
                  context={{
                    page: 'dashboard',
                    stats: demoDashboardStats,
                    recentTransactions: demoTransactions,
                    alerts: demoAnomalies,
                  }}
                  defaultExpanded={true}
                  messages={demoStoryMessages}
                  isLoading={false}
                  error={null}
                  onSendMessage={() => {}}
                  suggestedPrompts={[
                    'Predict next month\'s expenses.',
                    'How much can I safely invest?'
                  ]}
                  insights={[
                    'AWS Cloud charge is 40% higher than last month.',
                    'Dining out is approaching your budget limit.'
                  ]}
                  userName="Visitor"
                />
              </div>

              <div className={styles.previewCol6}>
                <CategoryBreakdown data={demoSpendingByCategory} />
              </div>
              <div className={styles.previewCol6}>
                <AnomalyAlerts anomalies={demoAnomalies} />
              </div>

              <div className={styles.previewCol12}>
                <RecentTransactions transactions={demoTransactions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
