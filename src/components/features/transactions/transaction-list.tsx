'use client';

import { useState, useMemo } from 'react';
import type { Transaction, Category, TransactionType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useTransactions } from '@/hooks/use-transactions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import TransactionForm from './transaction-form';
import DeleteTransactionModal from './delete-transaction-modal';
import styles from './transaction-list.module.css';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function TransactionList({
  transactions,
  categories,
}: TransactionListProps) {
  const { deleteTransaction, isDeleting } = useTransactions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setDeletingId(null);
    } catch (error) {
      toast.error('Failed to delete transaction. Please try again.');
    }
  };

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.merchant?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortOrder]);

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={styles.container} id="transactions-page">
      {/* Summary strip */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Income</span>
          <span className={styles.summaryValueGreen}>
            {formatCurrency(totalIncome)}
          </span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Expenses</span>
          <span className={styles.summaryValueRed}>
            {formatCurrency(totalExpenses)}
          </span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Net</span>
          <span className={styles.summaryValue}>
            {formatCurrency(totalIncome - totalExpenses)}
          </span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Count</span>
          <span className={styles.summaryValue}>{filtered.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by merchant or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            id="transaction-search"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
          className={styles.filterSelect}
          id="type-filter"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.filterSelect}
          id="category-filter"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
          className={styles.sortBtn}
          id="sort-toggle"
        >
          {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
        </button>

        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'var(--gradient-accent)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 500, cursor: 'pointer', marginLeft: 'auto' }}
        >
          + Add Transaction
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Merchant</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Type</th>
              <th className={`${styles.th} ${styles.thRight}`}>Amount</th>
              <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((txn, i) => (
              <tr
                key={txn.id}
                className={`${styles.tr} animate-fadeInUp stagger-${Math.min(i + 1, 6)}`}
              >
                <td className={styles.td}>
                  <div className={styles.merchantCell}>
                    <span
                      className={styles.catDot}
                      style={{
                        background: txn.type === 'income' 
                          ? 'hsl(160, 78%, 52%)' 
                          : (txn.category?.color || 'var(--color-text-tertiary)'),
                      }}
                    />
                    <div>
                      <span className={styles.merchantName}>
                        {txn.merchant || txn.description || txn.category?.name || 'Transaction'}
                      </span>
                      {txn.description && (
                        <span className={styles.txnDesc}>{txn.description}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={styles.categoryBadge}>
                    {txn.type === 'income' ? '💰 Income' : (txn.category?.icon ? `${txn.category.icon} ${txn.category.name}` : 'Uncategorized')}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={styles.dateText}>{formatDate(txn.transactionDate)}</span>
                </td>
                <td className={styles.td}>
                  <span
                    className={`${styles.typeBadge} ${
                      txn.type === 'income'
                        ? styles.typeIncome
                        : txn.type === 'expense'
                        ? styles.typeExpense
                        : styles.typeTransfer
                    }`}
                  >
                    {txn.type}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <span
                    className={
                      txn.type === 'income'
                        ? styles.amountIncome
                        : styles.amountExpense
                    }
                  >
                    {txn.type === 'income' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.actionCell}`}>
                  <button 
                    onClick={() => setDeletingId(txn.id)}
                    className={styles.deleteBtn} 
                    title="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <p>No transactions found matching your filters.</p>
          </div>
        )}
      </div>
      
      {showForm && (
        <TransactionForm 
          categories={categories} 
          onClose={() => setShowForm(false)} 
        />
      )}

      {deletingId && (
        <DeleteTransactionModal 
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
