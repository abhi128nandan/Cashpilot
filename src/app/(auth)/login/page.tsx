'use client';

import { useRef, useState } from 'react';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validators/auth';
import styles from './page.module.css';

export default function LoginPage() {
  
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  // Stable ref — prevents createClient() being called on every render.
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Client-side validation
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString() ?? '_';
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    // Supabase sign in
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Hard navigation to ensure middleware picks up the new session cookies
    window.location.href = '/dashboard';
  }

  return (
    <div className={styles.card} id="login-page">
      {/* Logo */}
      <div className={styles.logoSection}>
        <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="url(#auth-logo)" />
          <path
            d="M8 14L12 18L20 10"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="auth-logo" x1="0" y1="0" x2="28" y2="28">
              <stop stopColor="hsl(225, 82%, 52%)" />
              <stop offset="1" stopColor="hsl(260, 70%, 55%)" />
            </linearGradient>
          </defs>
        </svg>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your CashPilot account</p>
      </div>

      {/* Credentials form */}
      <form onSubmit={handleLogin} className={styles.form}>
        {error && (
          <div className={styles.error} id="login-error">
            {error}
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={styles.input}
          />
          {fieldErrors.email && (
            <span className={styles.fieldError}>{fieldErrors.email[0]}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={styles.input}
          />
          {fieldErrors.password && (
            <span className={styles.fieldError}>{fieldErrors.password[0]}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitBtn}
          id="login-submit"
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className={styles.link}>
          Create one
        </Link>
      </p>
    </div>
  );
}
