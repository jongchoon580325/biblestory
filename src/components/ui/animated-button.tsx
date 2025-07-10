// 마이크로인터랙션 버튼 (Framer Motion)
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import React from 'react';

type Props = HTMLMotionProps<'button'> & {
  children: React.ReactNode;
};

export default function AnimatedButton({ children, ...rest }: Props) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.button
      whileHover={shouldReduceMotion ? {} : { scale: 1.06, boxShadow: '0 2px 8px #3b82f633' }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent-primary text-white font-medium shadow-md focus:outline-none"
      {...rest}
    >
      {children}
    </motion.button>
  );
}
