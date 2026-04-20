'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <span style={{ fontSize: '3rem' }}>⚠️</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h2>
      <p style={{ color: 'hsl(220, 14%, 68%)', maxWidth: '420px', lineHeight: 1.6 }}>
        An unexpected error occurred. Our team has been notified.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          background: 'linear-gradient(135deg, hsl(225, 82%, 52%), hsl(225, 87%, 62%))',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
