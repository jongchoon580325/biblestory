// 반응형 그리드 레이아웃 예시 컴포넌트
import React from 'react';
import Card from '@/components/ui/card';

type Props = {
  items: React.ReactNode[];
  className?: string;
};

export default function ResponsiveGrid({ items, className = '' }: Props) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((item, idx) => (
        <Card key={idx}>{item}</Card>
      ))}
    </div>
  );
}
