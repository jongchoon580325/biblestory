  // 위로가기(ScrollToTop) 플로팅 버튼 컴포넌트
  // - 200px 이상 스크롤 시 우측 하단에 노출
  // - 클릭 시 부드럽게 최상단 이동
  // - ArrowUp 아이콘 사용, 접근성/애니메이션/다크모드 대응
  // - 모바일/PC 모두 자연스러운 위치
  // - Tailwind CSS 스타일 적용
  import React, { useEffect, useState } from 'react';
  import { ArrowUp } from 'lucide-react';

  /**
    * ScrollToTopButton
    * - 200px 이상 스크롤 시 우측 하단에 노출
    * - 클릭 시 window.scrollTo({top:0, behavior:'smooth'})
    * - 접근성: aria-label, 키보드 포커스, outline
    * - 애니메이션: fade-in/out, hover scale/shadow
    */
  const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const onScroll = () => {
        setVisible(window.scrollY > 200);
      };
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleClick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <button
        type="button"
        aria-label="위로가기"
        onClick={handleClick}
        tabIndex={0}
        className={`fixed bottom-8 right-8 z-[60] p-3 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-200
          hover:bg-blue-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300
          ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        style={{ boxShadow: '0 4px 24px 0 rgba(59,130,246,0.15)' }}
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    );
  };

  export default ScrollToTopButton; 