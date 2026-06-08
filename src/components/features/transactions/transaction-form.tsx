import { useState } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import type { Category } from '@/types';
import styles from './transaction-form.module.css';

interface TransactionFormProps {
  categories: Category[];
  onClose: () => void;
}

export default function TransactionForm({ categories, onClose }: TransactionFormProps) {
  const { addTransaction, isAdding } = useTransactions();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    try {
      await addTransaction({
        amount: Number(amount),
        type,
        merchant,
        description: description || undefined,
        categoryId: type === 'expense' ? (categoryId || undefined) : undefined,
        transactionDate: date,
      });
      onClose();
    } catch (err) {
      // Error handled by hook's toast
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Add Transaction</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Type</label>
            <div className={styles.typeSelector}>
              <button 
                type="button"
                className={`${styles.typeBtn} ${type === 'expense' ? styles.activeExpense : ''}`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button 
                type="button"
                className={`${styles.typeBtn} ${type === 'income' ? styles.activeIncome : ''}`}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Amount (₹)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0.01"
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required
              className={styles.input}
              placeholder="0.00"
            />
          </div>

          {type === 'income' ? (
            <div className={styles.formGroup}>
              <label>Income Source</label>
              <input 
                type="text" 
                value={merchant} 
                onChange={e => setMerchant(e.target.value)} 
                required
                className={styles.input}
                placeholder="e.g. Salary, Freelance, Bonus"
              />
            </div>
          ) : (
            <>
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
                <label>Title / Merchant (Optional)</label>
                <input 
                  type="text" 
                  value={merchant} 
                  onChange={e => setMerchant(e.target.value)} 
                  className={styles.input}
                  placeholder="e.g. Amazon, Zomato, Uber"
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label>Notes (Optional)</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className={styles.input}
              placeholder="Additional details..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required
              className={styles.input}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isAdding} className={styles.submitBtn}>
              {isAdding ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
