import type { Budget } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import styles from './budget-list.module.css';

interface BudgetListProps {
  budgets: Budget[];
}

export default function BudgetList({ budgets }: BudgetListProps) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);

  return (
    <div className={styles.container} id="budgets-page">
      {/* Overview */}
      <div className={styles.overview}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Budget</span>
          <span className={styles.overviewValue}>{formatCurrency(totalBudget)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Spent</span>
          <span className={styles.overviewValue}>{formatCurrency(totalSpent)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Remaining</span>
          <span className={styles.overviewValueGreen}>{formatCurrency(totalBudget - totalSpent)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Utilization</span>
          <span className={styles.overviewValue}>{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Budget cards */}
      <div className={styles.grid}>
        {budgets.map((budget, i) => {
          const pct = Math.min((budget.spentAmount / budget.limitAmount) * 100, 100);
          const remaining = budget.limitAmount - budget.spentAmount;
          const isWarning = pct >= 60 && pct < 85;
          const isDanger = pct >= 85;

          return (
            <div key={budget.id} className={`${styles.card} animate-fadeInUp stagger-${i + 1}`}>
              <div className={styles.cardHeader}>
                <div className={styles.catInfo}>
                  <span className={styles.catIcon}>{budget.category?.icon || '📁'}</span>
                  <span className={styles.catName}>{budget.category?.name || 'Unknown'}</span>
                </div>
                <span className={styles.periodBadge}>{budget.period}</span>
              </div>

              <div className={styles.amounts}>
                <span className={styles.spent}>{formatCurrency(budget.spentAmount)}</span>
                <span className={styles.limit}>of {formatCurrency(budget.limitAmount)}</span>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${
                    isDanger ? styles.fillDanger : isWarning ? styles.fillWarning : styles.fillGood
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.remaining}>
                  {remaining >= 0
                    ? `${formatCurrency(remaining)} remaining`
                    : `${formatCurrency(Math.abs(remaining))} over budget`}
                </span>
                <span
                  className={`${styles.pctBadge} ${
                    isDanger ? styles.pctDanger : isWarning ? styles.pctWarning : styles.pctGood
                  }`}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}

        {/* Add budget card */}
        <button className={styles.addCard} id="add-budget-btn">
          <div className={styles.addIcon}>+</div>
          <span className={styles.addLabel}>Add Budget</span>
        </button>
      </div>
    </div>
  );
}
