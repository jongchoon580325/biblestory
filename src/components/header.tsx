'use client';
// 헤더(상단) 컴포넌트
import React, { useEffect, useState } from 'react';
import useFirework from './useFirework';
import Link from 'next/link';

const MENUS = [
  { label: 'HOME', href: '/' },
  { label: '성경읽기', href: '/bible' },
  { label: '성경자료실', href: '/library' },
  { label: '데이터관리', href: '/data' },
];

export default function Header() {
  // fireworkRefs 제거, fireFns만 사용
  const fireFns = [useFirework(), useFirework(), useFirework(), useFirework()];

  // 다크/라이트 모드 토글 상태
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // 초기: prefers-color-scheme 또는 기존 클래스 반영
    const root = document.documentElement;
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (root.classList.contains('light-mode')) setIsLight(true);
    else if (root.classList.contains('dark')) setIsLight(false);
    else setIsLight(!prefersLight ? false : true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
  }, [isLight]);

  return (
    <header
      className={`w-full py-4 border-b border-white/10 flex items-center justify-between
        ${isLight ? 'bg-[var(--header-bg)] text-[var(--header-footer-text)]' : 'bg-[#181c24] text-white'}
      `}
      style={{ borderRadius: 'var(--header-footer-radius)' }}
    >
      <div className="flex items-center min-w-0">
        <Link
          href="/"
          className={`font-bold text-xl tracking-tight pl-2 select-none whitespace-nowrap ${isLight ? 'text-[var(--header-footer-text)]' : 'text-white'}`}
          aria-label="홈으로 이동"
        >
          Smart Bible Study
        </Link>
      </div>
      <nav className="flex justify-center min-w-0 w-auto">
        <ul className="flex flex-nowrap gap-4 items-center overflow-x-auto whitespace-nowrap mx-auto max-w-fit">
          {MENUS.map((menu, idx) => {
            const { fireworkRef, fire } = fireFns[idx];
            return (
              <li key={menu.label}>
                <Link
                  href={menu.href}
                  className={`text-base font-medium px-2 py-1 transition-colors duration-150 ${isLight ? 'text-[var(--header-footer-text)] hover:text-blue-600' : 'text-white/80 hover:text-blue-400'}`}
                >
                  <span ref={fireworkRef} onMouseEnter={fire} className="relative inline-block">
                    {menu.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={`min-w-0 flex items-center pr-2`}>
        <button
          aria-label={isLight ? '다크 모드로 전환' : '라이트 모드로 전환'}
          onClick={() => setIsLight((v) => !v)}
          className={`rounded-full p-2 bg-bg-tertiary hover:bg-accent-primary transition-colors border border-border-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 ${isLight ? 'text-[#059669]' : ''}`}
          type="button"
        >
          {isLight ? (
            // 달(다크모드) 아이콘, 라이트모드시 녹색
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // 태양(라이트모드) 아이콘
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414m12.728 0l-1.414-1.414M6.343 6.343L4.929 4.929"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
