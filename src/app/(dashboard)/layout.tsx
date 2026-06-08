import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import styles from './layout.module.css';
import { requireAuth } from '@/lib/auth/guard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar />
      <div className={styles.mainArea}>
        <Header />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
