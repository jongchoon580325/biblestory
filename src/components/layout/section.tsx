// 공통 섹션 컴포넌트 (일관된 spacing, 내부 컨테이너)
import React from 'react';
import Container from './container';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Section({ children, className = '' }: Props) {
  return (
    <section className={`py-8 md:py-12 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}
