'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import type { MonthlyTrend, SpendingByCategory, DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import styles from './analytics-dashboard.module.css';

interface Props {
  trends: MonthlyTrend[];
  spending: SpendingByCategory[];
  stats: DashboardStats;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: p.color }} />
          <span className={styles.tooltipKey}>{p.dataKey}</span>
          <span className={styles.tooltipVal}>${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard({ trends, spending, stats }: Props) {
  const savingsData = trends.map((t) => ({
    month: t.month,
    rate: t.income > 0 ? ((t.net / t.income) * 100) : 0,
  }));

  return (
    <div className={styles.container} id="analytics-page">
      {/* Income vs Expenses Bar Chart */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Income vs Expenses</h3>
          <span className={styles.cardSubtitle}>Last 6 months</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(228, 20%, 30%, 0.2)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 14%, 68%)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 14%, 68%)', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="income" fill="hsl(160, 78%, 42%)" radius={[6, 6, 0, 0]} barSize={28} />
            <Bar dataKey="expenses" fill="hsl(0, 78%, 54%)" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.twoCol}>
        {/* Savings Rate Trend */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Savings Rate Trend</h3>
            <span className={styles.highlight}>{stats.savingsRate}% current</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={savingsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(225, 82%, 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(225, 82%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(228, 20%, 30%, 0.2)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 14%, 68%)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 14%, 68%)', fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Savings Rate']} contentStyle={{ background: 'hsl(228, 20%, 16%)', border: '1px solid hsla(228,20%,40%,0.3)', borderRadius: '12px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="rate" stroke="hsl(225, 82%, 52%)" strokeWidth={2.5} fillOpacity={1} fill="url(#savingsGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Ranking */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Top Spending Categories</h3>
          <div className={styles.rankingList}>
            {spending.slice(0, 6).map((item, i) => (
              <div key={item.categoryName} className={styles.rankRow}>
                <span className={styles.rankNum}>{i + 1}</span>
                <div className={styles.rankBar}>
                  <div className={styles.rankInfo}>
                    <span className={styles.rankName}>{item.categoryName}</span>
                    <span className={styles.rankAmount}>{formatCurrency(item.totalAmount)}</span>
                  </div>
                  <div className={styles.rankTrack}>
                    <div
                      className={styles.rankFill}
                      style={{ width: `${item.percentage}%`, background: item.categoryColor }}
                    />
                  </div>
                </div>
                <span className={styles.rankPct}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className={styles.insights}>
        <h3 className={styles.cardTitle}>💡 AI Insights</h3>
        <div className={styles.insightGrid}>
          <div className={styles.insightCard}>
            <span className={styles.insightIcon}>📈</span>
            <h4 className={styles.insightTitle}>Income Growing</h4>
            <p className={styles.insightDesc}>Your income has grown 12.5% this month compared to last month. Freelance income is the primary driver.</p>
          </div>
          <div className={styles.insightCard}>
            <span className={styles.insightIcon}>🎯</span>
            <h4 className={styles.insightTitle}>Budget On Track</h4>
            <p className={styles.insightDesc}>3 of 4 budget categories are well within limits. Shopping is at 63% — consider slowing down.</p>
          </div>
          <div className={styles.insightCard}>
            <span className={styles.insightIcon}>💰</span>
            <h4 className={styles.insightTitle}>Strong Savings</h4>
            <p className={styles.insightDesc}>66.6% savings rate is exceptional. At this pace, you&apos;ll save over $87K this year.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
