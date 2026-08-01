'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validators/auth';
import styles from './page.module.css';

export default function RegisterPage() {

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Stable ref — createBrowserClient is a singleton, but this makes the
  // instantiation explicit and consistent with use-auth.ts.
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

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
      const { data, error: authError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // If email confirmation is disabled in Supabase, a session is returned
      // immediately. Hard navigation ensures middleware picks up the new
      // session cookies (same pattern as login page).
      if (data.session) {
        window.location.href = '/dashboard';
        return;
      }
    } catch (err) {
      console.error('[register] signUp failed:', err);
      setError('An unexpected error occurred during signup');
      setLoading(false);
      return;
    }

    // Email confirmation is enabled — show the "check your email" screen.
    setSuccess(true);
    setLoading(false);
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
          <div className={styles.inputWrapper}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className={styles.input}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && (
            <span className={styles.fieldError}>{fieldErrors.password[0]}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className={styles.input}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
