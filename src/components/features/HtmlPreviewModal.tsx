import React, { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

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
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  if (!visible) return null;
  return (
    <button
      className="fixed bottom-8 right-8 z-[100] bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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

  const handleEdit = () => {
    setDraft(html);
    setEditMode(true);
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
      <ScrollToTopButton />
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