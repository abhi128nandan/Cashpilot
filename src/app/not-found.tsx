import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        gap: '16px',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <span style={{ fontSize: '4rem' }}>🧭</span>
      <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>404 — Page Not Found</h2>
      <p style={{ color: 'hsl(220, 14%, 68%)', maxWidth: '400px', lineHeight: 1.6 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          background: 'linear-gradient(135deg, hsl(225, 82%, 52%), hsl(225, 87%, 62%))',
          color: 'white',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
