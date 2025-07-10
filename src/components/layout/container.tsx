// 공통 컨테이너 컴포넌트 (1024px, 중앙정렬, 반응형)
import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = '' }: Props) {
  return (
    <div className={`w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
