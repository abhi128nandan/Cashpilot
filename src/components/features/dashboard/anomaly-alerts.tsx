import type { Anomaly } from '@/types';
import { formatRelativeTime } from '@/lib/utils/formatters';
import styles from './anomaly-alerts.module.css';

interface AnomalyAlertsProps {
  anomalies: Anomaly[];
}

const severityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'severityLow' },
  medium: { label: 'Medium', className: 'severityMedium' },
  high: { label: 'High', className: 'severityHigh' },
  critical: { label: 'Critical', className: 'severityCritical' },
};

export default function AnomalyAlerts({ anomalies }: AnomalyAlertsProps) {
  if (anomalies.length === 0) return null;

  return (
    <div className={styles.card} id="anomaly-alerts">
      <div className={styles.cardHeader}>
        <div className={styles.titleGroup}>
          <h3 className={styles.cardTitle}>⚠️ Anomaly Alerts</h3>
          <span className={styles.badge}>{anomalies.length}</span>
        </div>
      </div>
      <div className={styles.alertList}>
        {anomalies.map((anomaly) => {
          const config = severityConfig[anomaly.severity];
          return (
            <div key={anomaly.id} className={styles.alert}>
              <div className={styles.alertTop}>
                <span className={`${styles.severityBadge} ${styles[config.className]}`}>
                  {config.label}
                </span>
                <span className={styles.alertTime}>
                  {formatRelativeTime(anomaly.detectedAt)}
                </span>
              </div>
              <p className={styles.alertDescription}>{anomaly.description}</p>
              <button className={styles.resolveBtn}>Mark as resolved</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
