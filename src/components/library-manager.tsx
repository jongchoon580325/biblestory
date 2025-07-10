'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient';
import Button from './ui/button';
import Card from './ui/card';
import Modal from './ui/modal';
import Icon from './ui/icon';

// 자료(리소스) 타입 정의
interface BibleResource {
  id: string;
  title: string;
  subtitle?: string;
  chapterNumber?: number;
  verseRange?: string;
  status: 'draft' | 'published' | 'archived';
  wordCount: number;
  estimatedReadingTime: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  sortOrder: number;
  totalChapters: number;
}

// LibraryManager 컴포넌트
export default function LibraryManager() {
  // 상태: 카테고리, 책, 자료, 업로드, 모달 등
  const [category, setCategory] = useState<'old-testament' | 'new-testament'>('old-testament');
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [resources, setResources] = useState<BibleResource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewResource, setPreviewResource] = useState<BibleResource | null>(null);
  const [editResource, setEditResource] = useState<BibleResource | null>(null);
  const [deleteResource, setDeleteResource] = useState<BibleResource | null>(null);

  // 책 목록 불러오기
  useEffect(() => {
    supabase
      .from('b_bible_books')
      .select('*')
      .eq('category_id', category)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError('성경 책 목록을 불러오지 못했습니다.');
          setBooks([]);
        } else {
          setBooks(data || []);
          setSelectedBook(data && data.length > 0 ? data[0] : null);
        }
      });
  }, [category]);

  // 자료 목록 불러오기
  useEffect(() => {
    if (!selectedBook) return;
    supabase
      .from('b_bible_contents')
      .select('*')
      .eq('bible_book_id', selectedBook.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError('자료 목록을 불러오지 못했습니다.');
          setResources([]);
        } else {
          setResources(data || []);
        }
      });
  }, [selectedBook]);

  // 파일 드래그&드롭/선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'text/html' || file.name.endsWith('.html')
    );
    setUploadQueue(files);
  };

  // 파일 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedBook || uploadQueue.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      for (let i = 0; i < uploadQueue.length; i++) {
        const file = uploadQueue[i];
        const fileId = crypto.randomUUID();
        const filePath = `bible-resources/${selectedBook.id}/${fileId}.html`;
        // Supabase Storage 업로드
        const { error: storageError } = await supabase.storage
          .from('biblefiles')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });
        if (storageError) throw storageError;
        // HTML 파싱 및 DB 저장
        const htmlContent = await file.text();
        // 예시: 제목/장/구절 등 메타데이터 추출(실제 파싱 로직 필요)
        const title = file.name.replace('.html', '');
        await supabase.from('b_bible_contents').insert({
          title,
          bible_book_id: selectedBook.id,
          chapter_number: 1, // TODO: 파싱 필요
          html_content: htmlContent,
          status: 'draft',
        });
        setUploadProgress(Math.round(((i + 1) / uploadQueue.length) * 100));
      }
      setUploadQueue([]);
      // 업로드 후 자료 목록 새로고침
      supabase
        .from('b_bible_contents')
        .select('*')
        .eq('bible_book_id', selectedBook.id)
        .order('updated_at', { ascending: false })
        .then(({ data }) => setResources(data || []));
    } catch {
      setError('업로드 중 오류가 발생했습니다.');
    }
    setUploading(false);
  };

  // 자료 삭제 핸들러
  const handleDelete = async (resource: BibleResource) => {
    if (!resource) return;
    await supabase.from('b_bible_contents').delete().eq('id', resource.id);
    setResources((prev) => prev.filter((r) => r.id !== resource.id));
    setDeleteResource(null);
  };

  // 자료 상태 변경 핸들러
  const handleStatusChange = async (resource: BibleResource, status: 'draft' | 'published' | 'archived') => {
    await supabase.from('b_bible_contents').update({ status }).eq('id', resource.id);
    setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, status } : r)));
  };

  // 자료 미리보기/편집 핸들러(예시)
  const handlePreview = (resource: BibleResource) => setPreviewResource(resource);
  const handleEdit = (resource: BibleResource) => setEditResource(resource);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white dark:bg-black rounded-lg shadow-md">
      {/* 카테고리 토글 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={category === 'old-testament' ? 'primary' : 'ghost'}
          onClick={() => setCategory('old-testament')}
        >
          구약
        </Button>
        <Button
          variant={category === 'new-testament' ? 'primary' : 'ghost'}
          onClick={() => setCategory('new-testament')}
        >
          신약
        </Button>
      </div>
      {/* 책 선택 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {books.map((book) => (
          <Button
            key={book.id}
            variant={selectedBook?.id === book.id ? 'primary' : 'ghost'}
            onClick={() => setSelectedBook(book)}
          >
            {book.name}
          </Button>
        ))}
      </div>
      {/* 파일 업로드 */}
      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".html"
            multiple
            onChange={handleFileChange}
            className="block"
            aria-label="HTML 파일 업로드"
            disabled={uploading}
          />
          <Button onClick={handleUpload} disabled={uploadQueue.length === 0 || uploading} loading={uploading}>
            <Icon name="upload" size="sm" /> 업로드
          </Button>
          {uploading && (
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
        {uploadQueue.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">{uploadQueue.length}개 파일 대기 중</div>
        )}
      </Card>
      {/* 자료 목록 테이블 */}
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>제목</th>
              <th>장</th>
              <th>상태</th>
              <th>수정일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.title}</td>
                <td>{resource.chapterNumber || '-'}</td>
                <td>
                  <select
                    value={resource.status}
                    onChange={(e) => handleStatusChange(resource, e.target.value as 'draft' | 'published' | 'archived')}
                    className="bg-transparent border rounded px-2 py-1"
                  >
                    <option value="draft">초안</option>
                    <option value="published">발행됨</option>
                    <option value="archived">보관됨</option>
                  </select>
                </td>
                <td>{resource.updatedAt?.slice(0, 10) || '-'}</td>
                <td>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handlePreview(resource)}>
                      <Icon name="view" size="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(resource)}>
                      <Icon name="edit" size="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteResource(resource)}>
                      <Icon name="delete" size="sm" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {resources.length === 0 && (
          <div className="text-center text-gray-400 py-8">자료가 없습니다.</div>
        )}
      </Card>
      {/* 미리보기/편집/삭제 모달(예시) */}
      <Modal isOpen={!!previewResource} onClose={() => setPreviewResource(null)}>
        <div className="p-4">
          <h2 className="font-bold mb-2">자료 미리보기</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewResource?.subtitle || '' }} />
          <Button onClick={() => setPreviewResource(null)}>닫기</Button>
        </div>
      </Modal>
      <Modal isOpen={!!editResource} onClose={() => setEditResource(null)}>
        <div className="p-4">
          <h2 className="font-bold mb-2">자료 편집(예시)</h2>
          <div className="text-gray-500">(추후 Monaco Editor 등 통합)</div>
          <Button onClick={() => setEditResource(null)}>닫기</Button>
        </div>
      </Modal>
      <Modal isOpen={!!deleteResource} onClose={() => setDeleteResource(null)}>
        <div className="p-4">
          <h2 className="font-bold mb-2">자료 삭제 확인</h2>
          <div className="mb-4">정말 삭제하시겠습니까?</div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => handleDelete(deleteResource!)}>삭제</Button>
            <Button onClick={() => setDeleteResource(null)}>취소</Button>
          </div>
        </div>
      </Modal>
      {/* 에러 메시지 */}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
} 