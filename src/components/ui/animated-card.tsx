// 마이크로인터랙션 카드 (Framer Motion)
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function AnimatedCard({ children, className = '' }: Props) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale: 1.03, boxShadow: '0 4px 16px #3b82f644' }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      className={`bg-bg-card rounded-xl shadow-md p-5 md:p-6 mb-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}
