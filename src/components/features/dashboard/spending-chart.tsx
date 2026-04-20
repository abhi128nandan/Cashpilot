'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlyTrend } from '@/types';
import styles from './spending-chart.module.css';

interface SpendingChartProps {
  data: MonthlyTrend[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className={styles.tooltipRow}>
          <span
            className={styles.tooltipDot}
            style={{ background: entry.color }}
          />
          <span className={styles.tooltipKey}>
            {entry.dataKey === 'income' ? 'Income' : entry.dataKey === 'expenses' ? 'Expenses' : 'Net'}
          </span>
          <span className={styles.tooltipValue}>
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SpendingChart({ data }: SpendingChartProps) {
  return (
    <div className={styles.card} id="spending-chart">
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Cash Flow Overview</h3>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'hsl(160, 78%, 42%)' }} />
            Income
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'hsl(0, 78%, 54%)' }} />
            Expenses
          </span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 78%, 42%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 78%, 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 78%, 54%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 78%, 54%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsla(228, 20%, 30%, 0.2)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 14%, 68%)', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 14%, 68%)', fontSize: 12 }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              dx={-4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(160, 78%, 42%)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorIncome)"
              dot={false}
              activeDot={{ r: 5, stroke: 'hsl(160, 78%, 42%)', strokeWidth: 2, fill: 'hsl(228, 24%, 8%)' }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(0, 78%, 54%)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              dot={false}
              activeDot={{ r: 5, stroke: 'hsl(0, 78%, 54%)', strokeWidth: 2, fill: 'hsl(228, 24%, 8%)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
