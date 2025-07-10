// 푸터(하단) 컴포넌트
import React from 'react';

export default function Footer() {
  return (
    <footer
      className={`w-full py-4 border-t border-white/10 text-center text-xs mt-8
        ${typeof window !== 'undefined' && document.documentElement.classList.contains('light-mode') ? 'bg-[var(--header-footer-bg)] text-[var(--header-footer-text)]' : 'bg-[#181c24] text-white/60'}
      `}
      style={{ borderRadius: 'var(--header-footer-radius)' }}
    >
      Smart Bible Study. Built with ❤️ by 나 종 춘 | najongchoon@gmail.com
    </footer>
  );
}
