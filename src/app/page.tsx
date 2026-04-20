import Link from 'next/link';
import styles from './page.module.css';

const features = [
  {
    icon: '📊',
    title: 'Real-Time Dashboard',
    desc: 'Track income, expenses, and net savings with beautiful interactive charts and live category breakdowns.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Insights',
    desc: 'Ask questions in natural language. Our RAG pipeline analyzes your actual transaction history for accurate answers.',
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
    desc: 'Predict future expenses and income trends using AI-driven analysis of your historical spending patterns.',
  },
  {
    icon: '🔒',
    title: 'Bank-Grade Security',
    desc: 'End-to-end encryption, CSRF protection, rate limiting, and strict input validation on every request.',
  },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    features: ['50 transactions/month', 'Basic dashboard', '3 budget categories', 'Community support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    features: ['Unlimited transactions', 'AI chat & insights', 'Unlimited budgets', 'Anomaly detection', 'CSV import', 'Priority support'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlighted: false,
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
            <a href="#pricing">Pricing</a>
            <Link href="/login" className={styles.navCta}>Launch App →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Powered by GPT-4o + RAG Pipeline
          </div>
          <h1 className={styles.heroTitle}>
            Your finances,{' '}
            <span className="text-gradient">understood by AI.</span>
          </h1>
          <p className={styles.heroDesc}>
            CashPilot is an AI-powered financial intelligence platform that tracks your spending,
            detects anomalies, forecasts cash flow, and answers your questions in natural language —
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
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>$2.4M+</span>
              <span className={styles.heroStatLabel}>Tracked</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>15K+</span>
              <span className={styles.heroStatLabel}>Transactions</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>99.9%</span>
              <span className={styles.heroStatLabel}>Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to master your money</h2>
          <p className={styles.sectionDesc}>
            Production-grade financial intelligence with AI at its core.
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

      {/* Pricing */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p className={styles.sectionDesc}>Start free. Upgrade when you need more power.</p>
        </div>
        <div className={styles.pricingGrid}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`${styles.pricingCard} ${tier.highlighted ? styles.pricingHighlighted : ''}`}
            >
              {tier.highlighted && <div className={styles.popularBadge}>Most Popular</div>}
              <h3 className={styles.pricingName}>{tier.name}</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>{tier.price}</span>
                <span className={styles.pricingPeriod}>{tier.period}</span>
              </div>
              <ul className={styles.pricingFeatures}>
                {tier.features.map((f) => (
                  <li key={f} className={styles.pricingFeature}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={tier.highlighted ? styles.btnPrimary : styles.btnSecondary} style={{ width: '100%' }}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>CashPilot</span>
            <p className={styles.footerDesc}>AI-powered financial intelligence for everyone.</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">GitHub</a>
          </div>
          <p className={styles.footerCopy}>© 2024 CashPilot. Built with Next.js, Supabase, and OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
