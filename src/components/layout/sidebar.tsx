'use client';

import { useState, useRef } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { createClient } from '@/lib/supabase/client';
import styles from './sidebar.module.css';

const mainItems = [
  { href: '#search', label: 'Search', icon: '🔍' },
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/chat', label: 'AI Copilot', icon: '✨', badge: 'New' },
];

const workspaceItems = [
  { href: '/transactions', label: 'Transactions', icon: '💳', hasChevron: true },
  { href: '/budgets', label: 'Budgets', icon: '🎯', hasChevron: true },
  { href: '/recurring', label: 'Recurring', icon: '🔁' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/members', label: 'Team', icon: '👥', badge: '12', hasChevron: true },
];

const devItems = [
  { href: '#api-keys', label: 'API Keys', icon: '>_' },
  { href: '#webhooks', label: 'Webhooks', icon: '🔌' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  
  const fullName = (user?.user_metadata?.full_name as string) ?? 'CashPilot User';
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

  const renderNavLink = (item: any) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <li key={item.label}>
        <Link
          href={item.href}
          className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
          {item.badge && (
            <span className={`${styles.navBadge} ${isActive ? styles.navBadgeActive : ''}`}>
              {item.badge}
            </span>
          )}
          {item.hasChevron && (
            <svg className={styles.navChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`} id="main-sidebar" data-collapsed={isCollapsed ? "true" : "false"}>
      
      <div className={styles.logo} onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className={styles.logoIconBox}>
          <span className={styles.logoIconLetter}>{initials[0] || 'C'}</span>
        </div>
        <div className={styles.logoTextContainer}>
          <span className={styles.logoText}>{fullName}</span>
          <span className={styles.logoSubtext}>Pro Plan</span>
        </div>
        <svg className={styles.logoChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {mainItems.map(renderNavLink)}
        </ul>

        <div className={styles.sectionTitle}>WORKSPACE</div>
        <ul className={styles.navList}>
          {workspaceItems.map(renderNavLink)}
        </ul>

        <div className={styles.sectionTitle}>DEVELOPERS</div>
        <ul className={styles.navList}>
          {devItems.map(renderNavLink)}
        </ul>
      </nav>

      <div className={styles.bottomSection}>
        <div className={styles.separator} />
        
        <Link href="/settings" className={styles.navLink}>
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navLabel}>Settings</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className={styles.navLink}
          id="sign-out-btn"
        >
          <span className={styles.navIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span className={styles.navLabel}>Log out</span>
        </button>
      </div>
    </aside>
  );
}
