import styles from './stats-cards.module.css';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
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
        const change = card.getChange(stats);
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
            <div className={styles.cardValue}>{card.getValue(stats)}</div>
            {change !== null && (
              <div
                className={`${styles.cardChange} ${
                  change >= 0 ? styles.changePositive : styles.changeNegative
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d={change >= 0 ? 'M6 2L10 7H2L6 2Z' : 'M6 10L2 5H10L6 10Z'}
                    fill="currentColor"
                  />
                </svg>
                {formatPercent(Math.abs(change))} vs last month
              </div>
            )}
            <div
              className={styles.cardGlow}
              style={{ background: card.gradient }}
            />
          </div>
        );
      })}
    </div>
  );
}
