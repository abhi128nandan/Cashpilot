import styles from './stats-cards.module.css';
import { formatCurrency } from '@/lib/utils/formatters';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

const cards = [
  {
    key: 'income',
    label: 'Total Income',
    getValue: (s: DashboardStats) => formatCurrency(s.totalIncome),
    getChange: (s: DashboardStats) => s.incomeChange,
    icon: '💰',
    gradient: 'var(--gradient-accent)',
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    getValue: (s: DashboardStats) => formatCurrency(s.totalExpenses),
    getChange: (s: DashboardStats) => s.expenseChange,
    icon: '📉',
    gradient: 'linear-gradient(135deg, hsl(0, 78%, 54%), hsl(340, 75%, 55%))',
  },
  {
    key: 'balance',
    label: 'Net Balance',
    getValue: (s: DashboardStats) => formatCurrency(s.netBalance),
    getChange: () => null,
    icon: '🏦',
    gradient: 'var(--gradient-primary)',
  },
  {
    key: 'savings',
    label: 'Savings Rate',
    getValue: (s: DashboardStats) => `${s.savingsRate}%`,
    getChange: () => null,
    icon: '🎯',
    gradient: 'linear-gradient(135deg, hsl(280, 70%, 55%), hsl(225, 82%, 52%))',
  },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className={styles.grid} id="stats-cards">
      {cards.map((card, i) => {
        card.getChange(stats);
        return (
          <div
            key={card.key}
            className={`${styles.card} animate-fadeInUp stagger-${i + 1}`}
            id={`stat-${card.key}`}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>{card.label}</span>
              <span className={styles.cardIcon}>{card.icon}</span>
            </div>
            <div className={styles.cardValue}>
              {stats.transactionCount === 0 ? (
                <span className={styles.emptyValue}>No data yet</span>
              ) : (
                <>
                  {card.getValue(stats)}
                  {card.getChange(stats) !== null && (
                    <span className={`${styles.trendIndicator} ${card.getChange(stats)! > 0 ? styles.trendUp : styles.trendDown}`}>
                      {card.getChange(stats)! > 0 ? '↑' : '↓'} {Math.abs(card.getChange(stats)!)}% <span className={styles.trendLabel}>vs last month</span>
                    </span>
                  )}
                </>
              )}
            </div>
            {stats.transactionCount === 0 && (
              <div className={styles.emptyHelper}>
                Add a transaction to track
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
