import React, { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, Lock } from "lucide-react";

interface HtmlPreviewModalProps {
  open: boolean;
  initialHtml: string;
  fileName: string;
  onClose: () => void;
}

const TEXT_COLOR = '#313233';

function isFullHtmlDocument(html: string) {
  return /<html[\s>]/i.test(html) && /<body[\s>]/i.test(html);
}

// 위로가기 버튼 (전체화면에서만)
function ScrollToTopButton({ iframeRef, isEditMode }: { iframeRef: React.RefObject<HTMLIFrameElement | null>, isEditMode: boolean }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (isEditMode) {
        // 편집 모드에서는 메인 페이지 스크롤 감지
        setVisible(window.scrollY > 200);
      } else {
        // 일반 모드에서는 iframe 내부 스크롤 감지
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            setVisible(iframeDoc.documentElement.scrollTop > 200 || iframeDoc.body.scrollTop > 200);
          }
        }
      }
    };

    if (isEditMode) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      // iframe 로드 완료 후 스크롤 이벤트 리스너 추가
      const iframe = iframeRef.current;
      if (iframe) {
        const handleIframeLoad = () => {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.addEventListener('scroll', handleScroll);
            return () => iframeDoc.removeEventListener('scroll', handleScroll);
          }
        };
        
        iframe.addEventListener('load', handleIframeLoad);
        return () => iframe.removeEventListener('load', handleIframeLoad);
      }
    }
  }, [iframeRef, isEditMode]);

  const handleScrollToTop = () => {
    if (isEditMode) {
      // 편집 모드에서는 메인 페이지 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 일반 모드에서는 iframe 내부 스크롤
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
          iframeDoc.body.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  if (!visible) return null;
  
  return (
    <button
      className="fixed bottom-8 right-8 z-[100] bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
      onClick={handleScrollToTop}
      title="위로가기"
    >
      ↑
    </button>
  );
}

const HtmlPreviewModal: React.FC<HtmlPreviewModalProps> = ({ open, initialHtml, fileName, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [html, setHtml] = useState(initialHtml);
  const [draft, setDraft] = useState(initialHtml);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 비밀번호 인증 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword] = useState('1111'); // DATA 페이지와 동일한 비밀번호

  useEffect(() => {
    setHtml(initialHtml);
    setDraft(initialHtml);
  }, [initialHtml]);

  useEffect(() => {
    if (!editMode && open && isFullHtmlDocument(html) && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html, open, editMode]);

  if (!open) return null;

  // 비밀번호 인증 처리
  const handlePasswordAuth = () => {
    if (password === currentPassword) {
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      // 인증 성공 시 편집 모드 활성화
      setDraft(html);
      setEditMode(true);
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  const handleEdit = () => {
    setShowPasswordModal(true);
  };
  
  const handleSave = () => {
    setHtml(draft);
    setEditMode(false);
  };
  
  const handleCancel = () => {
    setEditMode(false);
  };

  const isFullDoc = isFullHtmlDocument(html);
  const isFullDocDraft = isFullHtmlDocument(draft);

  return (
    <div className="fixed inset-0 z-[99] w-screen h-screen bg-black/70" style={{ minHeight: '100vh', minWidth: '100vw', color: TEXT_COLOR }}>
      {/* 상단 컨트롤 바 */}
      <div className="fixed top-0 left-0 w-full flex items-center justify-between px-8 py-4 bg-slate-900/95 z-[100] border-b border-slate-700" style={{ color: TEXT_COLOR }}>
        <div className="flex items-center min-w-[60px]">
          {!editMode && (
            <button
              onClick={handleEdit}
              className="text-blue-400 hover:text-blue-200 p-2 rounded-full focus:outline-none"
              title="편집"
            >
              <Pencil className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="flex-1 text-center font-bold text-lg truncate" style={{ color: '#b3b1b1' }}>
          {fileName}
        </div>
        <div className="flex items-center min-w-[60px] justify-end gap-2">
          {editMode && (
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-700 p-2 rounded-full focus:outline-none"
              title="저장"
            >
              <Check className="w-6 h-6" />
            </button>
          )}
          {editMode && (
            <button
              onClick={handleCancel}
              className="text-red-400 hover:text-red-600 p-2 rounded-full focus:outline-none"
              title="취소"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-200 px-4 py-2 rounded-lg focus:outline-none transition-colors"
            title="테이블 리스트로 복귀"
          >
            리스트 보기
          </button>
        </div>
      </div>
      {/* 본문 전체화면 랜더링 */}
      <div className="pt-24 px-0 w-full h-screen flex flex-col" style={{ color: TEXT_COLOR, minHeight: '100vh' }}>
        {!editMode ? (
          isFullDoc ? (
            <iframe
              ref={iframeRef}
              title="HTML 미리보기"
              className="w-full h-full bg-white"
              style={{ border: 'none', height: 'calc(100vh - 96px)', width: '100vw', maxWidth: '100vw' }}
            />
          ) : (
            <div className="w-full h-full bg-white prose px-8 py-12" style={{ color: TEXT_COLOR, height: 'calc(100vh - 96px)', overflowY: 'auto' }}>
              <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: TEXT_COLOR }} />
            </div>
          )
        ) : (
          <div className="w-full flex flex-row h-full html-edit-split" style={{ color: TEXT_COLOR, maxWidth: '100vw', height: 'calc(100vh - 96px)' }}>
            {/* 소스 에디터 */}
            <div className="w-1/2 p-8 border-r border-slate-300 bg-slate-50 flex flex-col" style={{ color: TEXT_COLOR }}>
              <textarea
                className="w-full h-full bg-slate-100 text-black rounded-lg p-4 border border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none flex-1"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                spellCheck={false}
                style={{ color: TEXT_COLOR, backgroundColor: '#f8f9fa' }}
              />
            </div>
            {/* 미리보기 */}
            <div className="w-1/2 p-8 bg-white flex flex-col prose" style={{ color: TEXT_COLOR }}>
              {isFullDocDraft ? (
                <iframe
                  title="HTML 미리보기"
                  className="w-full h-full bg-white"
                  style={{ height: '100%', border: 'none', width: '100%' }}
                  srcDoc={draft}
                />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: draft }} style={{ height: '100%', color: TEXT_COLOR }} />
              )}
            </div>
          </div>
        )}
      </div>
      <ScrollToTopButton iframeRef={iframeRef} isEditMode={editMode} />

      {/* 비밀번호 인증 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[101]">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
            <div className="text-white text-lg font-bold mb-2 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-400" />
              관리자 인증
            </div>
            <div className="text-slate-300 mb-4">
              HTML 편집을 수행하려면 관리자 비밀번호를 입력하세요.
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordAuth()}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {passwordError && <div className="text-red-400 text-sm">{passwordError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
              >
                취소
              </button>
              <button
                className="px-4 py-2 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition"
                onClick={handlePasswordAuth}
              >
                인증
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 반응형 미디어 쿼리 */}
      <style jsx global>{`
        .html-edit-split { max-width: 100vw; }
        @media (max-width: 1024px) {
          .html-edit-split { flex-direction: column !important; }
          .html-edit-split > div { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default HtmlPreviewModal; 