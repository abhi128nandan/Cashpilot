'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SpendingByCategory } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import styles from './category-breakdown.module.css';

interface CategoryBreakdownProps {
  data: SpendingByCategory[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SpendingByCategory }> }) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipName}>{item.categoryName}</p>
      <p className={styles.tooltipAmount}>{formatCurrency(item.totalAmount)}</p>
      <p className={styles.tooltipPct}>{item.percentage}% of total</p>
    </div>
  );
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className={styles.card} id="category-breakdown">
      <h3 className={styles.cardTitle}>Spending by Category</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="totalAmount"
              nameKey="categoryName"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.categoryColor} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legendList}>
        {data.slice(0, 5).map((item) => (
          <div key={item.categoryName} className={styles.legendRow}>
            <span
              className={styles.legendDot}
              style={{ background: item.categoryColor }}
            />
            <span className={styles.legendName}>{item.categoryName}</span>
            <span className={styles.legendAmount}>
              {formatCurrency(item.totalAmount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
