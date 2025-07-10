// 메인 콘텐츠(중앙) 컴포넌트
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function MainContents({ children }: Props) {
  return (
    <section className="w-full flex-1 min-h-[calc(100vh-80px)] py-8 px-2 text-left flex flex-col">
      {children}
    </section>
  );
}
