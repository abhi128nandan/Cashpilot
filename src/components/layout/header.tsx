'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import styles from './header.module.css';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics',
  '/chat': 'AI Chat',
  '/settings': 'Settings',
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = pageTitles[pathname] || 'CashPilot';

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName = fullName?.split(' ')[0] ?? 'there';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className={styles.header} id="dashboard-header">
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {pathname === '/dashboard' && (
          <p className={styles.greeting}>{greeting}, {firstName} 👋</p>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.searchContainer}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search transactions..."
            id="global-search"
          />
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </div>

        <button className={styles.iconButton} id="notifications-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M13.5 6a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 11.25 13.5 6zM10.295 15.75a1.5 1.5 0 01-2.59 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.notifDot} />
        </button>
      </div>
    </header>
  );
}
