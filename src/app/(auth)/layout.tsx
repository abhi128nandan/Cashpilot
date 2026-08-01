import styles from './layout.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      {/* Left Panel: Hidden on mobile */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brand}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#auth-lg)" />
              <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="auth-lg" x1="0" y1="0" x2="28" y2="28"><stop stopColor="hsl(225, 82%, 52%)" /><stop offset="1" stopColor="hsl(260, 70%, 55%)" /></linearGradient></defs>
            </svg>
            <span>CashPilot</span>
          </div>
          
          <div className={styles.valueProps}>
            <h1>Master your money.</h1>
            <p>Production-grade financial intelligence for modern users.</p>
            
            <ul className={styles.propList}>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Track expenses in one place
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                AI-powered financial insights
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Budget smarter with real-time alerts
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Secure authentication with Supabase
              </li>
            </ul>
          </div>
          
          <div className={styles.footer}>
            © {new Date().getFullYear()} CashPilot Inc.
          </div>
        </div>
      </div>
      
      {/* Right Panel: The auth forms */}
      <div className={styles.rightPanel}>
        {children}
      </div>
    </div>
  );
}
