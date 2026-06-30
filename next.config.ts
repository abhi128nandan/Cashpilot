import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * Why each header matters for a financial SaaS:
 *  - X-DNS-Prefetch-Control: Prevents leaking URLs via DNS prefetch.
 *  - X-Frame-Options: Prevents clickjacking attacks.
 *  - X-Content-Type-Options: Prevents MIME-type sniffing (XSS vector).
 *  - Referrer-Policy: Ensures full URL is not sent to third-party origins.
 *  - Permissions-Policy: Disables browser APIs not needed by CashPilot.
 *  - Strict-Transport-Security: Forces HTTPS for 2 years (production only).
 */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Only activate HSTS in production. localhost does not support HTTPS.
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
