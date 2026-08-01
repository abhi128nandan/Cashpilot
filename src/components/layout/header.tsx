'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { useEffect, useState, useRef } from 'react';
import { Search, Bell } from 'lucide-react';
import styles from './header.module.css';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchValue, setSearchValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if query param changes externally
  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  // Shortcut key to focus search input (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    
    // Push or replace depending on whether we are already on transactions page
    if (pathname === '/transactions') {
      router.replace(`/transactions?${params.toString()}`, { scroll: false });
    } else {
      router.push(`/transactions?${params.toString()}`);
    }
  };

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
          <Search size={16} strokeWidth={2} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search transactions..."
            id="global-search"
            value={searchValue}
            onChange={handleSearchChange}
          />
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </div>

        <button className={styles.iconButton} id="notifications-btn" aria-label="Notifications">
          <Bell size={18} strokeWidth={2} />
          <span className={styles.notifDot} />
        </button>
      </div>
    </header>
  );
}
