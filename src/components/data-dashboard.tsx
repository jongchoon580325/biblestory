'use client';

import React from 'react';
import Card from './ui/card';
import Button from './ui/button';
import Icon from './ui/icon';

/**
 * DataDashboard - 데이터관리 대시보드 컴포넌트
 * - 좌측: 카테고리 관리(어코디언, CRUD)
 * - 우측: 데이터 내보내기/가져오기/초기화/모니터링 카드
 * - 관리자 헤더, 시스템 현황, 활동 로그 등 포함
 * - Tailwind CSS, 접근성, 확장성 고려
 */
const DataDashboard: React.FC = () => {
  // TODO: 상태, 데이터, 핸들러 등 구현 예정

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-2 md:px-8">
      {/* 관리자 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="settings" size="md" />
          <h1 className="text-2xl font-bold">데이터 관리</h1>
          <span className="ml-2 px-2 py-1 rounded bg-green-100 text-green-700 text-xs">운영 환경</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">로그아웃</Button>
        </div>
      </div>

      {/* 5:5 분할 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 data-management-layout">
        {/* 좌측: 카테고리 관리 */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 flex flex-col min-h-[500px]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="book" size="sm" /> 카테고리 관리
          </h2>
          {/* TODO: 어코디언, 카테고리 목록, CRUD 버튼 등 구현 */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 mb-2">카테고리/책 목록 (어코디언)</div>
            <div className="flex gap-2">
              <Button size="sm">추가</Button>
              <Button size="sm" variant="outline">편집</Button>
              <Button size="sm" variant="danger">삭제</Button>
            </div>
          </div>
        </section>

        {/* 우측: 데이터 관리/모니터링 */}
        <section className="flex flex-col gap-4">
          {/* 데이터 내보내기/가져오기 카드 */}
          <Card className="mb-2">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="upload" size="sm" /> 데이터 내보내기/가져오기
            </h3>
            <div className="flex gap-2 mb-2">
              <Button size="sm">내보내기</Button>
              <Button size="sm" variant="outline">가져오기</Button>
            </div>
            <div className="text-xs text-neutral-500">ZIP 파일로 백업/복원 지원</div>
          </Card>

          {/* 데이터 초기화 카드 */}
          <Card className="mb-2">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="settings" size="sm" /> 데이터/카테고리 초기화
            </h3>
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="danger">데이터 초기화</Button>
              <Button size="sm" variant="danger">카테고리 초기화</Button>
            </div>
            <div className="text-xs text-neutral-500">초기화 전 자동 백업, 복구 옵션 제공</div>
          </Card>

          {/* 시스템 현황/모니터링 카드 */}
          <Card className="mb-2">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="star" size="sm" /> 시스템 현황
            </h3>
            {/* TODO: 시스템 통계, 활동 로그 등 표시 */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
                <span className="text-lg font-bold">0</span>
                <span className="text-xs">총 콘텐츠</span>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
                <span className="text-lg font-bold">0</span>
                <span className="text-xs">카테고리</span>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
                <span className="text-lg font-bold">0</span>
                <span className="text-xs">성경책</span>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
                <span className="text-lg font-bold">0</span>
                <span className="text-xs">활성 사용자</span>
              </div>
            </div>
            <div className="text-xs text-neutral-500">최근 활동 로그, 실시간 통계 등 표시 예정</div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DataDashboard; 