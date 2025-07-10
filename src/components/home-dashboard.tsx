'use client';

import React from 'react';
import Card from './ui/card';
import Button from './ui/button';
import Icon from './ui/icon';

/**
 * HomeDashboard - HOME(분석) 대시보드 컴포넌트
 * - 개인화 헤더, 진도/통계/스트릭/추천/캘린더/성취/커뮤니티/빠른 액션 등 위젯 구조
 * - 그리드 기반 반응형 레이아웃, Tailwind CSS, 접근성, 확장성 고려
 */
const HomeDashboard: React.FC = () => {
  // TODO: 상태, 데이터, 핸들러 등 구현 예정

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-2 md:px-8">
      {/* 개인화 헤더 */}
      <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 header-section">
        <div className="flex items-center gap-3">
          <Icon name="home" size="md" />
          <h1 className="text-2xl font-bold">홈 대시보드</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">설정</Button>
        </div>
      </section>

      {/* 대시보드 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 dashboard-layout">
        {/* 진도 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">📊 읽기 진도</h3>
          <div className="text-xs text-neutral-500">진도 차트/통계</div>
        </Card>
        {/* 스트릭 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">🔥 연속 기록</h3>
          <div className="text-xs text-neutral-500">스트릭/연속 달성</div>
        </Card>
        {/* 오늘의 목표 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">🎯 오늘의 목표</h3>
          <div className="text-xs text-neutral-500">목표 진행률</div>
        </Card>
        {/* 주간 통계 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">📈 주간 통계</h3>
          <div className="text-xs text-neutral-500">막대 차트/통계</div>
        </Card>
        {/* 추천 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">🤖 맞춤 추천</h3>
          <div className="text-xs text-neutral-500">AI 추천/자료</div>
        </Card>
        {/* 캘린더 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">🗓️ 성경 읽기 캘린더</h3>
          <div className="text-xs text-neutral-500">월간 뷰/완료 표시</div>
        </Card>
        {/* 성취/뱃지 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">🏆 성취 & 뱃지</h3>
          <div className="text-xs text-neutral-500">레벨/뱃지/순위</div>
        </Card>
        {/* 커뮤니티 피드 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">💬 커뮤니티 피드</h3>
          <div className="text-xs text-neutral-500">댓글/하이라이트</div>
        </Card>
        {/* 빠른 액션 위젯 */}
        <Card className="widget">
          <h3 className="font-semibold mb-2 flex items-center gap-2">⚡ 빠른 액션</h3>
          <div className="text-xs text-neutral-500">읽기 시작/업로드/설정</div>
        </Card>
      </div>
    </div>
  );
};

export default HomeDashboard; 