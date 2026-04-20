'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { createClient } from '@/lib/supabase/client';
import styles from './sidebar.module.css';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/transactions', label: 'Transactions', icon: '💳' },
  { href: '/budgets', label: 'Budgets', icon: '🎯' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/chat', label: 'AI Chat', icon: '🤖' },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  // Derive initials from user metadata
  const fullName = (user?.user_metadata?.full_name as string) ?? 'User';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <aside className={styles.sidebar} id="main-sidebar">
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#logo-gradient)" />
            <path
              d="M8 14L12 18L20 10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="hsl(225, 82%, 52%)" />
                <stop offset="1" stopColor="hsl(260, 70%, 55%)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className={styles.logoText}>CashPilot</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isActive && <div className={styles.activeIndicator} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.bottomSection}>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}

        {/* Sign out button */}
        <button
          type="button"
          onClick={handleSignOut}
          className={styles.navLink}
          id="sign-out-btn"
        >
          <span className={styles.navIcon}>🚪</span>
          <span className={styles.navLabel}>Sign Out</span>
        </button>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{fullName}</span>
            <span className={styles.userPlan}>Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
