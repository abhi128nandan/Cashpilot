import Link from 'next/link';
import type { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import styles from './recent-transactions.module.css';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className={styles.card} id="recent-transactions">
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Recent Transactions</h3>
        <Link href="/transactions" className={styles.viewAll}>
          View all →
        </Link>
      </div>
      <div className={styles.list}>
        {transactions.map((txn, i) => (
          <div
            key={txn.id}
            className={`${styles.row} animate-fadeInUp stagger-${i + 1}`}
          >
            <div className={styles.rowLeft}>
              <div
                className={styles.categoryIcon}
                style={{
                  background: txn.category?.color
                    ? `${txn.category.color.replace(')', ', 0.15)')}`
                    : 'var(--color-bg-hover)',
                  color: txn.category?.color || 'var(--color-text-secondary)',
                }}
              >
                {txn.category?.icon || '💳'}
              </div>
              <div className={styles.rowInfo}>
                <span className={styles.merchant}>
                  {txn.merchant || 'Unknown'}
                </span>
                <span className={styles.meta}>
                  {txn.category?.name || 'Uncategorized'} · {formatDate(txn.transactionDate)}
                </span>
              </div>
            </div>
            <div
              className={`${styles.amount} ${
                txn.type === 'income' ? styles.amountIncome : styles.amountExpense
              }`}
            >
              {txn.type === 'income' ? '+' : '-'}
              {formatCurrency(txn.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
