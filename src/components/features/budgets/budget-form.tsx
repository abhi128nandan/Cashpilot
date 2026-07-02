import { useState } from 'react';
import { useBudgets } from '@/hooks/use-budgets';
import type { Category } from '@/types';
import styles from '../transactions/transaction-form.module.css';

interface BudgetFormProps {
  categories: Category[];
  onClose: () => void;
}

export default function BudgetForm({ categories, onClose }: BudgetFormProps) {
  const { addBudget, isAdding } = useBudgets();
  const [limitAmount, setLimitAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount || isNaN(Number(limitAmount)) || Number(limitAmount) <= 0 || !categoryId) return;
    
    try {
      await addBudget({
        limitAmount: Number(limitAmount),
        period,
        categoryId,
      });
      onClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Add Budget</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              className={styles.input}
              required
            >
              <option value="">Select Category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Limit Amount (₹)</label>
            <input 
              type="number" 
              step="1" 
              min="1"
              value={limitAmount} 
              onChange={e => setLimitAmount(e.target.value)} 
              required
              className={styles.input}
              placeholder="e.g. 5000"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Period</label>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value as 'weekly' | 'monthly' | 'yearly')}
              className={styles.input}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isAdding} className={styles.submitBtn}>
              {isAdding ? 'Adding...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
