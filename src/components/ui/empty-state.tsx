import React from 'react';
import styles from './empty-state.module.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      {icon && (
        <div className={styles.iconWrapper}>
          {icon}
        </div>
      )}
      <h3 className={styles.title}>
        {title}
      </h3>
      {description && (
        <p className={styles.description}>
          {description}
        </p>
      )}
      {action && (
        <div className={styles.actionWrapper}>
          {action}
        </div>
      )}
    </div>
  );
}
