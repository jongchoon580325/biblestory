// 본문 하이라이트 애니메이션 컴포넌트
'use client';
import { motion } from 'framer-motion';
import React from 'react';

type Props = {
  color?: string;
  duration?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function HighlightAnimate({
  color = '#ffe066',
  duration = 0.7,
  height = 24,
  className = '',
  style = {},
}: Props) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{ duration, ease: 'easeInOut' }}
      style={{ background: color, height, borderRadius: 6, ...style }}
      className={className}
    />
  );
}
