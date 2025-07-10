'use client';

import React from 'react';

interface SimpleBarChartProps {
  labels: string[];
  values: number[];
  max?: number;
  barColor?: string;
  className?: string;
}

/**
 * SimpleBarChart - 간단한 막대 차트 컴포넌트
 * - labels: x축 라벨
 * - values: y축 값
 * - max: 최대값(생략 시 자동 계산)
 * - barColor: 막대 색상(Tailwind)
 */
const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  labels,
  values,
  max,
  barColor = 'bg-accent-primary',
  className = '',
}) => {
  const chartMax = max ?? Math.max(...values, 1);
  return (
    <div className={`flex items-end gap-2 h-32 w-full ${className}`} role="img" aria-label="막대 차트">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex flex-col items-center w-8">
          <div
            className={`${barColor} w-6 rounded-t transition-all`}
            style={{ height: `${(v / chartMax) * 100}%`, minHeight: 4 }}
            aria-label={`${labels[i]}: ${v}`}
          />
          <span className="text-xs mt-1 text-neutral-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

export default SimpleBarChart; 