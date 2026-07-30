import React from 'react';
import styles from './recurring.module.css';
import type { RecurringTransaction } from '@/types';
import { formatCurrency, formatTransactionDateTime } from '@/lib/utils/formatters';
import { RecurringStatusBadge } from './recurring-status-badge';
import { Edit2, Archive } from 'lucide-react';

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onEdit?: (transaction: RecurringTransaction) => void;
  onArchive?: (id: string) => void;
}

export function RecurringTransactionCard({ 
  transaction, 
  onEdit, 
  onArchive 
}: RecurringTransactionCardProps) {
  const isIncome = transaction.type === 'income';
  
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleGroup}>
          <span className={styles.cardMerchant}>
            {transaction.merchant || transaction.description || transaction.category?.name || 'Recurring Transaction'}
          </span>
          <RecurringStatusBadge status={transaction.status} />
        </div>
        
        <span
          className={`${styles.cardAmount} ${
            isIncome
              ? styles.amountIncome
              : transaction.type === 'expense'
              ? styles.amountExpense
              : styles.amountTransfer
          }`}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
      </div>

      <div className={styles.cardDetails}>
        <span className={styles.cardDetailItem}>
          🔄 {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
        </span>
        <span className={styles.cardDetailItem}>
          📅 Next: {formatTransactionDateTime(transaction.nextDate, transaction.nextDate)}
        </span>
        {transaction.endDate && (
          <span className={styles.cardDetailItem}>
            🛑 Ends: {formatTransactionDateTime(transaction.endDate, transaction.endDate)}
          </span>
        )}
      </div>

      <div className={styles.cardActions}>
        {onEdit && (
          <button 
            type="button"
            className={styles.iconBtn} 
            onClick={() => onEdit(transaction)}
            aria-label="Edit recurring transaction"
          >
            <Edit2 size={14} /> Edit
          </button>
        )}
        {onArchive && transaction.status !== 'archived' && (
          <button 
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnArchived}`}
            onClick={() => onArchive(transaction.id)}
            aria-label="Archive recurring transaction"
          >
            <Archive size={14} /> Archive
          </button>
        )}
      </div>
    </article>
  );
}
