import { Trash2 } from 'lucide-react';
import styles from './transaction-form.module.css';

interface DeleteTransactionModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteTransactionModal({ onConfirm, onCancel, isDeleting }: DeleteTransactionModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: '400px' }}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'hsla(0, 78%, 54%, 0.15)', color: 'hsl(0, 78%, 54%)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Trash2 size={20} />
            </div>
            <h2>Delete Transaction?</h2>
          </div>
          <button onClick={onCancel} className={styles.closeBtn} disabled={isDeleting}>×</button>
        </div>
        
        <div style={{ padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '15px' }}>
          This action cannot be undone. The transaction will be permanently removed from your ledger and your analytics will be recalculated.
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={isDeleting}>
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            disabled={isDeleting} 
            className={styles.submitBtn}
            style={{ background: 'var(--color-danger-400)' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
