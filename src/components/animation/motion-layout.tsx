// 페이지 전환용 MotionLayout (Framer Motion)
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface Props {
  children: React.ReactNode;
  keyId: string;
}

export default function MotionLayout({ children, keyId }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
