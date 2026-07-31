import React from 'react';
import styles from './recurring.module.css';
import type { RecurringStatus } from '@/types';

interface RecurringStatusBadgeProps {
  status: RecurringStatus;
}

export function RecurringStatusBadge({ status }: RecurringStatusBadgeProps) {
  let badgeClass = '';
  switch (status) {
    case 'active':
      badgeClass = styles.badgeActive;
      break;
    case 'paused':
      badgeClass = styles.badgePaused;
      break;
    case 'archived':
      badgeClass = styles.badgeArchived;
      break;
  }

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {status}
    </span>
  );
}
