import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import Providers from '@/components/providers/query-provider';
import './globals.css';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CashPilot — AI-Powered Financial Intelligence',
    template: '%s | CashPilot',
  },
  description:
    'AI-powered financial intelligence platform. Track spending, get personalized insights, detect anomalies, and forecast cash flow with natural language chat.',
  keywords: ['finance', 'AI', 'budgeting', 'fintech', 'spending tracker', 'cash flow'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        
        
        
      </head>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
