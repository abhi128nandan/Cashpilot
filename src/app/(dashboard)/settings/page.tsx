import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account, preferences, and subscription.',
};

export default function SettingsPage() {
  return (
    <div className={styles.container} id="settings-page">
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.card}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>AM</div>
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>Alex Morgan</h3>
              <p className={styles.profileEmail}>alex@cashpilot.io</p>
            </div>
            <button className={styles.editBtn}>Edit Profile</button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Subscription</h2>
        <div className={styles.card}>
          <div className={styles.planRow}>
            <div>
              <div className={styles.planBadge}>Pro Plan</div>
              <p className={styles.planDesc}>Access to AI insights, unlimited transactions, and advanced analytics.</p>
            </div>
            <div className={styles.planPrice}>
              <span className={styles.priceAmount}>$12</span>
              <span className={styles.pricePeriod}>/month</span>
            </div>
          </div>
          <div className={styles.planActions}>
            <button className={styles.btnOutline}>Manage Subscription</button>
            <button className={styles.btnGhost}>View Invoice History</button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>Default Currency</span>
              <span className={styles.settingDesc}>Used for new transactions and reports</span>
            </div>
            <select className={styles.select} defaultValue="USD">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div className={styles.divider} />
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>Email Notifications</span>
              <span className={styles.settingDesc}>Receive weekly spending summaries and budget alerts</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" defaultChecked />
              <span className={styles.toggleSlider} />
            </label>
          </div>
          <div className={styles.divider} />
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>Anomaly Detection</span>
              <span className={styles.settingDesc}>AI-powered alerts for unusual transactions</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" defaultChecked />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>Export All Data</span>
              <span className={styles.settingDesc}>Download your transactions and reports as CSV</span>
            </div>
            <button className={styles.btnOutline}>Export CSV</button>
          </div>
          <div className={styles.divider} />
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>Delete Account</span>
              <span className={styles.settingDescDanger}>Permanently delete your account and all data</span>
            </div>
            <button className={styles.btnDanger}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
