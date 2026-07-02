import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account, preferences, and subscription.',
};

export default async function SettingsPage() {
  // requireAuth() calls supabase.auth.getUser() server-side.
  // Middleware already guarantees a session exists here, but requireAuth()
  // is explicit and type-safe — throws UnauthorizedError if somehow absent.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect('/login');
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) || 'User';
  const email = user.email || '';

  const words = fullName.trim().split(/\s+/);
  let initials = '';
  if (words.length === 1) {
    initials = words[0][0]?.toUpperCase() || 'U';
  } else if (words.length >= 2) {
    initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else {
    initials = 'U';
  }

  return (
    <div className={styles.container} id="settings-page">
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.card}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>{fullName}</h3>
              <p className={styles.profileEmail}>{email}</p>
            </div>
            <button className={styles.editBtn}>Edit Profile</button>
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
            <select className={styles.select} defaultValue="INR">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className={styles.divider} />
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>Email Notifications</span>
              <span className={styles.settingDesc}>
                Receive weekly spending summaries and budget alerts
              </span>
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
              <span className={styles.settingDesc}>Alerts for unusual transactions</span>
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
              <span className={styles.settingDesc}>
                Download your transactions and reports as CSV
              </span>
            </div>
            <button className={styles.btnOutline}>Export CSV</button>
          </div>
          <div className={styles.divider} />
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>Delete Account</span>
              <span className={styles.settingDescDanger}>
                Permanently delete your account and all data
              </span>
            </div>
            <button className={styles.btnDanger}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
