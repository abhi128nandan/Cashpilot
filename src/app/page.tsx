import Link from 'next/link';
import styles from './page.module.css';

const features = [
  {
    icon: '📊',
    title: 'Real-Time Dashboard',
    desc: 'Track income, expenses, and net savings with beautiful interactive charts and live category breakdowns.',
  },
  {
    icon: '⚠️',
    title: 'Anomaly Detection',
    desc: 'Automatically flag unusual transactions, subscription creep, and potential fraud with intelligent pattern analysis.',
  },
  {
    icon: '🎯',
    title: 'Smart Budgets',
    desc: 'Set category-based spending limits with real-time progress tracking and proactive alerts before you overspend.',
  },
  {
    icon: '📈',
    title: 'Cash Flow Forecast',
    desc: 'Predict future expenses and income trends using historical spending patterns.',
  },
  {
    icon: '🔒',
    title: 'Bank-Grade Security',
    desc: 'End-to-end encryption, CSRF protection, rate limiting, and strict input validation on every request.',
  },
];



export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav} id="landing-nav">
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#lg)" />
              <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="lg" x1="0" y1="0" x2="28" y2="28"><stop stopColor="hsl(225, 82%, 52%)" /><stop offset="1" stopColor="hsl(260, 70%, 55%)" /></linearGradient></defs>
            </svg>
            <span>CashPilot</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <Link href="/login" className={styles.navCta}>Launch App →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Your finances,{' '}
            <span className="text-gradient">simplified.</span>
          </h1>
          <p className={styles.heroDesc}>
            CashPilot is a modern financial intelligence platform that tracks your spending,
            detects anomalies, forecasts cash flow, and helps you master your money —
            all grounded in your real transaction data.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/login" className={styles.btnPrimary} id="hero-cta">
              Get Started
            </Link>
            <a href="#features" className={styles.btnSecondary}>
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to master your money</h2>
          <p className={styles.sectionDesc}>
            Production-grade financial intelligence.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={f.title} className={`${styles.featureCard} animate-fadeInUp stagger-${i + 1}`}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>CashPilot</span>
            <p className={styles.footerDesc}>Modern financial intelligence for everyone.</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">GitHub</a>
          </div>
          <p className={styles.footerCopy}>© 2025 CashPilot. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
