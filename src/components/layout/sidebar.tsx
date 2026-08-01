'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { createClient } from '@/lib/supabase/client';
import { 
  Home, 
  Sparkles, 
  CreditCard, 
  Target, 
  Repeat, 
  BarChart2, 
  Terminal, 
  Webhook, 
  Settings, 
  LogOut, 
  ChevronRight,
  LucideIcon
} from 'lucide-react';
import styles from './sidebar.module.css';

const mainItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/chat', label: 'AI Copilot', icon: Sparkles, badge: 'New' },
];

const workspaceItems = [
  { href: '/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

const devItems = [
  { href: '/settings/api-keys', label: 'API Keys', icon: Terminal },
  { href: '/settings/webhooks', label: 'Webhooks', icon: Webhook },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
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

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
    const savedState = localStorage.getItem('cashpilot:sidebar:collapsed');
    if (savedState) {
      // eslint-disable-next-line
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('cashpilot:sidebar:collapsed', String(newState));
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const renderNavLink = (item: { href: string; label: string; icon: LucideIcon; badge?: string; hasChevron?: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    return (
      <li key={item.label}>
        <Link
          href={item.href}
          className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
          aria-label={item.label}
          title={isCollapsed ? undefined : item.label}
        >
          <span className={styles.navIcon} aria-hidden="true"><Icon size={20} strokeWidth={2} /></span>
          <span className={styles.navLabel}>{item.label}</span>
          {item.badge && (
            <span className={`${styles.navBadge} ${isActive ? styles.navBadgeActive : ''}`}>
              {item.badge}
            </span>
          )}
          <div className={styles.tooltip} role="tooltip">{item.label}</div>
        </Link>
      </li>
    );
  };

  // Prevent hydration mismatch on the sidebar collapse state by defaulting to uncollapsed markup on first render
  // but we can apply a tiny css trick or just let it snap once mounted.
  const collapsedClass = (isMounted ? isCollapsed : false) ? styles.sidebarCollapsed : '';

  const showDevItems = process.env.NEXT_PUBLIC_FEATURE_DEVELOPER_TOOLS === 'true';

  return (
    <aside 
      className={`${styles.sidebar} ${collapsedClass}`} 
      id="main-sidebar" 
      data-collapsed={isCollapsed ? "true" : "false"}
      aria-label="Main Navigation"
    >
      
      <button 
        className={styles.logo} 
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
      >
        <div className={styles.logoIconBox}>
          <span className={styles.logoIconLetter}>{initials[0] || 'C'}</span>
        </div>
        <div className={styles.logoTextContainer}>
          <span className={styles.logoText}>{fullName}</span>
          <span className={styles.logoSubtext}>Pro Plan</span>
        </div>
        <div className={styles.logoChevron}>
          <ChevronRight size={16} className={styles.collapseIcon} />
        </div>
      </button>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {mainItems.map(renderNavLink)}
        </ul>

        <div className={styles.sectionTitle}>WORKSPACE</div>
        <ul className={styles.navList}>
          {workspaceItems.map(renderNavLink)}
        </ul>

        {showDevItems && (
          <>
            <div className={styles.sectionTitle}>DEVELOPERS</div>
            <ul className={styles.navList}>
              {devItems.map(renderNavLink)}
            </ul>
          </>
        )}
      </nav>

      <div className={styles.bottomSection}>
        <div className={styles.separator} />
        
        <Link 
          href="/settings" 
          className={`${styles.navLink} ${pathname.startsWith('/settings') ? styles.navLinkActive : ''}`}
          aria-label="Settings"
        >
          <span className={styles.navIcon} aria-hidden="true"><Settings size={20} /></span>
          <span className={styles.navLabel}>Settings</span>
          <div className={styles.tooltip} role="tooltip">Settings</div>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className={styles.navLink}
          id="sign-out-btn"
          aria-label="Log out"
        >
          <span className={styles.navIcon} aria-hidden="true"><LogOut size={20} /></span>
          <span className={styles.navLabel}>Log out</span>
          <div className={styles.tooltip} role="tooltip">Log out</div>
        </button>
      </div>
    </aside>
  );
}
