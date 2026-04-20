'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validators/auth';
import styles from './page.module.css';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const raw = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Client-side validation
    const parsed = registerSchema.safeParse(raw);
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

    // Supabase sign up — password hashing is handled by Supabase
    try {
      console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      const { data, error: authError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.name,
          },
        },
      });
      console.log("DATA:", data);
      console.log("ERROR:", authError);

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("FETCH FAILED:", err);
      setError("An unexpected error occurred during signup");
      setLoading(false);
      return;
    }

    // If email confirmation is enabled, show success message.
    // Otherwise, redirect to dashboard.
    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  if (success) {
    return (
      <div className={styles.card} id="register-page">
        <div className={styles.logoSection}>
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#reg-logo)" />
            <path
              d="M8 14L12 18L20 10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="reg-logo" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="hsl(225, 82%, 52%)" />
                <stop offset="1" stopColor="hsl(260, 70%, 55%)" />
              </linearGradient>
            </defs>
          </svg>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>
            We&apos;ve sent you a confirmation link. Please check your email to verify your account.
          </p>
        </div>
        <p className={styles.footer}>
          Already verified?{' '}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card} id="register-page">
      <div className={styles.logoSection}>
        <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="url(#reg-logo)" />
          <path
            d="M8 14L12 18L20 10"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="reg-logo" x1="0" y1="0" x2="28" y2="28">
              <stop stopColor="hsl(225, 82%, 52%)" />
              <stop offset="1" stopColor="hsl(260, 70%, 55%)" />
            </linearGradient>
          </defs>
        </svg>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start your financial intelligence journey</p>
      </div>

      <button
        type="button"
        className={styles.oauthBtn}
        id="google-register-btn"
        onClick={handleGoogleLogin}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <form onSubmit={handleRegister} className={styles.form}>
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Alex Morgan"
            className={styles.input}
          />
          {fieldErrors.name && (
            <span className={styles.fieldError}>{fieldErrors.name[0]}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
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
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className={styles.input}
          />
          {fieldErrors.password && (
            <span className={styles.fieldError}>{fieldErrors.password[0]}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className={styles.input}
          />
          {fieldErrors.confirmPassword && (
            <span className={styles.fieldError}>{fieldErrors.confirmPassword[0]}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitBtn}
          id="register-submit"
        >
          {loading ? <span className={styles.spinner} /> : 'Create Account'}
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
