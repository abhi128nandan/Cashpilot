import React, { useEffect, useRef } from 'react';
import styles from './recurring.module.css';

interface RecurringTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function RecurringTransactionDialog({ isOpen, onClose, title, children }: RecurringTransactionDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div 
        className={styles.modal} 
        ref={modalRef} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="dialog-title">{title}</h2>
          <button 
            onClick={onClose} 
            className={styles.closeBtn}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
