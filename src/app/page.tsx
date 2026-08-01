import Link from 'next/link';
import { ProductTour } from './product-tour';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
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
            <a href="#security">Security</a>
            <Link href="/login" className={styles.navCta}>Launch App →</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroLayout}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}></span>
              Introducing CashPilot AI
            </div>
            <h1 className={styles.heroTitle}>
              Your AI Financial Analyst.
            </h1>
            <p className={styles.heroDesc}>
              CashPilot analyzes your spending, detects anomalies, predicts future cash flow, and answers financial questions instantly. Stop tracking, start understanding.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/login" className={styles.btnPrimary}>Start Free</Link>
              <a href="#dashboard-preview" className={styles.btnSecondary}>View Demo</a>
            </div>
            <div className={styles.trustBadges}>
              <span>✓ Powered by AI</span>
              <span>✓ Bank-grade Security</span>
              <span>✓ Privacy First</span>
            </div>
          </div>
          
          <div className={styles.heroPreview} id="dashboard-preview">
            <div className={styles.heroPreviewGlow}></div>
            <ProductTour />
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className={styles.benefitsSection} id="features">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Stop guessing. Start knowing.</h2>
          <p className={styles.sectionDesc}>
            CashPilot connects to your accounts and uses advanced AI to make sense of your money automatically.
          </p>
        </div>
        
        <div className={styles.bentoGrid}>
          <div className={styles.bentoCard}>
            <div className={styles.bentoContent}>
              <h3>Instant Answers</h3>
              <p>Ask complex questions about your money. Our AI processes thousands of transactions in milliseconds.</p>
              <div className={styles.bentoMetric}>{'<'} 2 seconds average response</div>
            </div>
          </div>
          
          <div className={styles.bentoCard}>
            <div className={styles.bentoContent}>
              <h3>Proactive Anomalies</h3>
              <p>Get notified before bad things happen. CashPilot detects unusual spending, duplicate charges, and hidden subscriptions.</p>
              <div className={styles.bentoMetric}>99% detection rate</div>
            </div>
          </div>

          <div className={styles.bentoCard}>
            <div className={styles.bentoContent}>
              <h3>Intelligent Budgets</h3>
              <p>Set limits and let AI do the rest. It learns your habits and adjusts recommendations dynamically.</p>
              <div className={styles.bentoMetric}>Auto-syncs daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className={styles.securitySection} id="security">
        <div className={styles.securityContent}>
          <div className={styles.securityIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Bank-Level Security</h2>
          <ul className={styles.securityList}>
            <li><span>✓</span> AES-256 Encryption</li>
            <li><span>✓</span> Read-only Connections</li>
            <li><span>✓</span> Secure Authentication</li>
            <li><span>✓</span> Your data is never sold</li>
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <h2>Ready to master your finances?</h2>
        <p>Join thousands of users who trust CashPilot AI to guide their financial decisions.</p>
        <Link href="/login" className={styles.btnPrimaryLg}>Get Started for Free</Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>CashPilot</span>
            <p className={styles.footerDesc}>Modern financial intelligence.</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Twitter</a>
          </div>
          <p className={styles.footerCopy}>© 2026 CashPilot Inc.</p>
        </div>
      </footer>
    </div>
  );
}
