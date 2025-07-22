'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, Minimize2 } from 'lucide-react';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
}

export const FullscreenModal = ({ isOpen, onClose, content, title }: FullscreenModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // HTML 콘텐츠 크기 감지
  const detectContentSize = useCallback(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    
    // iframe 로드 완료 후 크기 측정
    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // HTML body의 실제 크기 측정
        const body = iframeDoc.body;
        const html = iframeDoc.documentElement;
        
        // 스크롤바를 제외한 실제 콘텐츠 크기 계산
        const contentWidth = Math.max(
          body.scrollWidth,
          body.offsetWidth,
          html.clientWidth,
          html.scrollWidth,
          html.offsetWidth
        );
        
        const contentHeight = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );

        // 최소/최대 크기 제한
        const minWidth = 400;
        const maxWidth = window.innerWidth * 0.95;
        const minHeight = 300;
        const maxHeight = window.innerHeight * 0.95;

        const adjustedWidth = Math.max(minWidth, Math.min(contentWidth + 40, maxWidth));
        const adjustedHeight = Math.max(minHeight, Math.min(contentHeight + 80, maxHeight));

        setModalSize({
          width: adjustedWidth,
          height: adjustedHeight
        });
      } catch (error) {
        console.warn('HTML 콘텐츠 크기 측정 실패:', error);
        // 기본 크기로 설정
        setModalSize({ width: 800, height: 600 });
      }
    };

    iframe.addEventListener('load', handleLoad);
    
    // 이미 로드된 경우 즉시 실행
    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    }

    return () => iframe.removeEventListener('load', handleLoad);
  }, []);

  // 모달 내부 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 모달 종료
  const handleClose = useCallback(() => {
    setIsFullscreen(false);
    onClose();
  }, [onClose]);

  // ESC 키 이벤트 처리
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          handleClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
      
      // 모달이 열릴 때 콘텐츠 크기 감지
      setTimeout(detectContentSize, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, handleClose, detectContentSize]);

  if (!isOpen) return null;

  return (
    // 페이지 전체를 덮는 새로운 모달
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className={`transition-all duration-300 flex flex-col ${
          isFullscreen 
            ? 'w-full h-full bg-black' 
            : 'bg-slate-900 rounded-xl border border-slate-700 shadow-2xl'
        }`}
        style={!isFullscreen ? {
          width: `${modalSize.width}px`,
          height: `${modalSize.height}px`,
          maxWidth: '95vw',
          maxHeight: '95vh'
        } : {}}
      >
        {/* 헤더 영역 - 전체화면일 때 숨김 */}
        {!isFullscreen && (
          <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-700 rounded-t-xl">
            <div className="flex items-center space-x-4">
              <h2 className="text-white text-xl font-bold">{title}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 종료 버튼 */}
              <button 
                onClick={handleClose}
                className="p-2 text-white hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                title="종료"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
        
        {/* iframe 콘텐츠 영역 */}
        <div className={`w-full transition-all duration-300 ${
          isFullscreen ? 'h-full' : 'flex-1'
        }`}>
          <iframe 
            ref={iframeRef}
            srcDoc={content}
            className="w-full h-full border-0 rounded-b-xl"
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>

        {/* 전체화면일 때 플로팅 컨트롤 */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <span className="text-white text-sm font-medium px-2">
              {title}
            </span>
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors"
              title="전체화면 종료"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleClose}
              className="p-2 text-white hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
              title="종료"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 