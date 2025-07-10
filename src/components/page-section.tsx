import React from 'react';

type Props = {
  title: string;
  children?: React.ReactNode;
};

export default function PageSection({ title, children }: Props) {
  return (
    <section className="w-full">
      <h1 className="text-lg font-bold text-left mb-2">{title}</h1>
      <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-8 w-full mx-auto" />
      {children}
    </section>
  );
}
