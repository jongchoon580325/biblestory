// 공통 카드 컴포넌트 (일관된 padding, 반응형, shadow)
import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-bg-card rounded-xl shadow-md p-5 md:p-6 mb-4 ${className}`}>{children}</div>
  );
}
