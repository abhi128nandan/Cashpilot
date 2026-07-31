import React from 'react';
import styles from './recurring.module.css';
import type { RecurringFrequency } from '@/types';

interface RecurringFrequencySelectorProps {
  value: RecurringFrequency;
  onChange: (freq: RecurringFrequency) => void;
  disabled?: boolean;
}

const frequencies: { label: string; value: RecurringFrequency }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export function RecurringFrequencySelector({ value, onChange, disabled }: RecurringFrequencySelectorProps) {
  return (
    <div 
      className={styles.frequencySelector} 
      role="group" 
      aria-label="Recurring Frequency"
    >
      {frequencies.map((freq) => (
        <button
          key={freq.value}
          type="button"
          onClick={() => onChange(freq.value)}
          disabled={disabled}
          aria-pressed={value === freq.value}
          className={`${styles.freqBtn} ${value === freq.value ? styles.activeFreq : ''}`}
        >
          {freq.label}
        </button>
      ))}
    </div>
  );
}
