import React, { useState } from 'react';
import type { Category, TransactionType, RecurringFrequency, RecurringStatus } from '@/types';
import type { CreateRecurringInput, UpdateRecurringInput } from '@/lib/validators/recurring';
import { createRecurringSchema, updateRecurringSchema } from '@/lib/validators/recurring';
import { RecurringFrequencySelector } from './recurring-frequency-selector';
import styles from './recurring.module.css';

interface RecurringTransactionFormProps {
  initialData?: Partial<CreateRecurringInput> & { id?: string; status?: RecurringStatus };
  categories: Category[];
  onSubmit: (data: CreateRecurringInput | UpdateRecurringInput) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
}

export function RecurringTransactionForm({
  initialData,
  categories,
  onSubmit,
  isPending,
  onCancel
}: RecurringTransactionFormProps) {
  const isEdit = !!initialData?.id;

  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [merchant, setMerchant] = useState(initialData?.merchant || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(initialData?.frequency || 'monthly');
  
  // Format dates for input[type="date"]
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(formatDate(initialData?.startDate) || formatDate(new Date()));
  const [nextDate, setNextDate] = useState(formatDate(initialData?.nextDate) || formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(initialData?.endDate) || '');

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      type,
      amount,
      merchant: merchant || undefined,
      description: description || undefined,
      categoryId: categoryId || undefined,
      frequency,
      startDate,
      nextDate,
      endDate: endDate || undefined,
      currency: initialData?.currency || 'INR',
    };

    const schema = isEdit ? updateRecurringSchema : createRecurringSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.formGroup}>
        <label>Type</label>
        <div className={styles.typeSelector} role="group" aria-label="Transaction Type">
          <button 
            type="button"
            className={`${styles.typeBtn} ${type === 'expense' ? styles.activeExpense : ''}`}
            onClick={() => setType('expense')}
            disabled={isPending}
            aria-pressed={type === 'expense'}
          >
            Expense
          </button>
          <button 
            type="button"
            className={`${styles.typeBtn} ${type === 'income' ? styles.activeIncome : ''}`}
            onClick={() => setType('income')}
            disabled={isPending}
            aria-pressed={type === 'income'}
          >
            Income
          </button>
          <button 
            type="button"
            className={`${styles.typeBtn} ${type === 'transfer' ? styles.activeTransfer : ''}`}
            onClick={() => setType('transfer')}
            disabled={isPending}
            aria-pressed={type === 'transfer'}
          >
            Transfer
          </button>
        </div>
        {errors.type && <span className={styles.errorText}>{errors.type[0]}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="amount">Amount (₹)</label>
        <input 
          id="amount"
          type="number" 
          step="0.01" 
          min="0.01"
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          disabled={isPending}
          className={styles.input}
          placeholder="0.00"
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
        {errors.amount && <span id="amount-error" className={styles.errorText}>{errors.amount[0]}</span>}
      </div>

      {type === 'income' && (
        <div className={styles.formGroup}>
          <label htmlFor="merchant">Income Source</label>
          <input 
            id="merchant"
            type="text" 
            value={merchant} 
            onChange={e => setMerchant(e.target.value)} 
            disabled={isPending}
            className={styles.input}
            placeholder="e.g. Salary, Freelance, Rental"
            aria-invalid={!!errors.merchant}
          />
          {errors.merchant && <span className={styles.errorText}>{errors.merchant[0]}</span>}
        </div>
      )}

      {type === 'transfer' && (
        <div className={styles.formGroup}>
          <label htmlFor="merchant">Destination</label>
          <input 
            id="merchant"
            type="text" 
            value={merchant} 
            onChange={e => setMerchant(e.target.value)} 
            disabled={isPending}
            className={styles.input}
            placeholder="e.g. Transfer to Savings"
            aria-invalid={!!errors.merchant}
          />
          {errors.merchant && <span className={styles.errorText}>{errors.merchant[0]}</span>}
        </div>
      )}

      {type === 'expense' && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="categoryId">Category</label>
            <select 
              id="categoryId"
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              disabled={isPending}
              className={styles.input}
              aria-invalid={!!errors.categoryId}
            >
              <option value="">Select Category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className={styles.errorText}>{errors.categoryId[0]}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="merchant">Merchant (Optional)</label>
            <input 
              id="merchant"
              type="text" 
              value={merchant} 
              onChange={e => setMerchant(e.target.value)} 
              disabled={isPending}
              className={styles.input}
              placeholder="e.g. Netflix, Spotify, Gym"
              aria-invalid={!!errors.merchant}
            />
            {errors.merchant && <span className={styles.errorText}>{errors.merchant[0]}</span>}
          </div>
        </>
      )}

      <div className={styles.formGroup}>
        <label>Frequency</label>
        <RecurringFrequencySelector 
          value={frequency}
          onChange={setFrequency}
          disabled={isPending}
        />
        {errors.frequency && <span className={styles.errorText}>{errors.frequency[0]}</span>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="startDate">Start Date</label>
          <input 
            id="startDate"
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            disabled={isPending}
            className={styles.input}
            aria-invalid={!!errors.startDate}
          />
          {errors.startDate && <span className={styles.errorText}>{errors.startDate[0]}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="nextDate">Next Occurrence</label>
          <input 
            id="nextDate"
            type="date" 
            value={nextDate} 
            onChange={e => setNextDate(e.target.value)} 
            disabled={isPending}
            className={styles.input}
            aria-invalid={!!errors.nextDate}
          />
          {errors.nextDate && <span className={styles.errorText}>{errors.nextDate[0]}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="endDate">End Date (Optional)</label>
        <input 
          id="endDate"
          type="date" 
          value={endDate} 
          onChange={e => setEndDate(e.target.value)} 
          disabled={isPending}
          className={styles.input}
          aria-invalid={!!errors.endDate}
        />
        {errors.endDate && <span className={styles.errorText}>{errors.endDate[0]}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Notes (Optional)</label>
        <input 
          id="description"
          type="text" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          disabled={isPending}
          className={styles.input}
          placeholder="Additional details..."
          aria-invalid={!!errors.description}
        />
        {errors.description && <span className={styles.errorText}>{errors.description[0]}</span>}
      </div>

      <div className={styles.footer}>
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isPending} 
          className={styles.cancelBtn}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isPending} 
          className={styles.submitBtn}
        >
          {isPending ? 'Saving...' : isEdit ? 'Update Rule' : 'Create Rule'}
        </button>
      </div>
    </form>
  );
}
