'use client';
import React, { useMemo, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useBibleStore } from '@/stores/bibleStore';

export const ChapterContent = () => {
  const { selectedBook, selectedChapter, chapterContent, contentLoading, contentError } = useBibleStore();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // HTML 콘텐츠 보안 처리 및 최적화
  const sanitizedContent = useMemo(() => {
    if (!chapterContent?.html_content) return '';
    
    // 기본적인 XSS 방지 (실제 프로덕션에서는 DOMPurify 같은 라이브러리 사용 권장)
    let content = chapterContent.html_content;
    
    // 스크립트 태그 제거
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // 이벤트 핸들러 제거
    content = content.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // javascript: 프로토콜 제거
    content = content.replace(/javascript:/gi, '');
    
    return content;
  }, [chapterContent?.html_content]);

  // iframe에 콘텐츠 로드
  useEffect(() => {
    if (iframeRef.current && sanitizedContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(sanitizedContent);
        doc.close();
        
        // iframe 높이 자동 조정
        const resizeIframe = () => {
          if (iframe.contentWindow?.document.body) {
            const height = iframe.contentWindow.document.body.scrollHeight;
            iframe.style.height = `${height}px`;
          }
        };
        
        // 콘텐츠 로드 완료 후 높이 조정
        iframe.onload = resizeIframe;
        
        // 약간의 지연 후 다시 높이 조정 (이미지 등이 로드된 후)
        setTimeout(resizeIframe, 100);
      }
    }
  }, [sanitizedContent]);

  // 책과 장이 선택되지 않은 경우
  if (!selectedBook || !selectedChapter) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-300">성경을 선택해 주세요</h3>
              <p className="text-sm text-slate-500">왼쪽에서 구약/신약과 책, 장을 선택하세요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 콘텐츠 로딩 중
  if (contentLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-slate-400">성경 본문을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 콘텐츠 에러
  if (contentError) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl text-red-400">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-300">콘텐츠를 불러올 수 없습니다</h3>
              <p className="text-sm text-slate-500">{contentError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 콘텐츠가 없는 경우
  if (!chapterContent) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center">
              <span className="text-2xl text-slate-400">📖</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-300">콘텐츠가 준비되지 않았습니다</h3>
              <p className="text-sm text-slate-500">해당 장의 성경 본문이 아직 업로드되지 않았습니다</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iframe으로 HTML 콘텐츠 렌더링
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
        <iframe
          ref={iframeRef}
          className="w-full min-h-[400px] border-0"
          sandbox="allow-same-origin allow-scripts"
          title={`${selectedBook.name} ${selectedChapter}장`}
        />
      </div>
    </div>
  );
}; 