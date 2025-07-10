# 📋 05-페이지디자인레이아웃-PRD.md

## 🎯 **문서 개요**

### **문서명**: 페이지 디자인 및 레이아웃 구현 상세 설계서

### **버전**: v1.0.0

### **작성일**: 2025.07.10

### **최종 수정일**: 2025.07.10

### **의존성**: 00-전체아키텍처-PRD.md, 00-공통시스템-PRD.md

---

## 🎨 **디자인 철학 및 비전**

> **"디지털 성서의 새로운 경험 - 기술과 영성의 조화로운 만남"**

### **핵심 디자인 원칙**

- **Spiritual Minimalism**: 영적 집중을 방해하지 않는 절제된 미니멀리즘
- **Organic Depth**: 자연스러운 깊이감과 레이어드 UI로 몰입감 극대화
- **Tactile Digital**: 실물 성경책을 만지는 듯한 촉각적 인터랙션 디자인
- **Inclusive Accessibility**: 모든 연령층과 시각 능력을 고려한 포용적 설계
- **Premium Craft**: 상업적 프리미엄 앱 수준의 섬세한 마감과 완성도

---

## 🌙 **다크모드 컬러 시스템 심화**

### **계층적 배경 시스템**

```css
/* 다크모드 전용 고급 컬러 팔레트 */
:root[data-theme='dark'] {
  /* Background Layers - 깊이감 표현 */
  --bg-canvas: #0a0f1c; /* 최심층 캔버스 (body) */
  --bg-surface-1: #1a1f2e; /* 1단계 표면 (메인 컨테이너) */
  --bg-surface-2: #252a3a; /* 2단계 표면 (카드, 모달) */
  --bg-surface-3: #2d3448; /* 3단계 표면 (활성 요소) */
  --bg-surface-4: #374151; /* 4단계 표면 (호버 상태) */

  /* Gradient Overlays - 미묘한 그라데이션 */
  --gradient-primary: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(147, 51, 234, 0.05) 100%
  );
  --gradient-surface: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
  --gradient-card: linear-gradient(145deg, var(--bg-surface-2) 0%, rgba(255, 255, 255, 0.02) 100%);

  /* Glass Effects - 글래스모피즘 */
  --glass-light: rgba(255, 255, 255, 0.03);
  --glass-medium: rgba(255, 255, 255, 0.05);
  --glass-heavy: rgba(255, 255, 255, 0.08);

  /* Border System - 섬세한 테두리 */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-emphasis: rgba(255, 255, 255, 0.2);
  --border-focus: rgba(59, 130, 246, 0.4);

  /* Shadow System - 자연스러운 그림자 */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.2);

  /* Text Hierarchy - 가독성 최적화 */
  --text-primary: #f8fafc; /* 최고 대비 (제목, 중요 텍스트) */
  --text-secondary: #e2e8f0; /* 본문 텍스트 */
  --text-tertiary: #cbd5e1; /* 보조 텍스트 */
  --text-quaternary: #94a3b8; /* 비활성 텍스트 */
  --text-accent: #60a5fa; /* 강조 텍스트 */
  --text-inverse: #1e293b; /* 역전 텍스트 (밝은 배경용) */

  /* Semantic Colors - 맥락적 색상 */
  --semantic-success: #10b981;
  --semantic-warning: #f59e0b;
  --semantic-error: #ef4444;
  --semantic-info: #06b6d4;

  /* Interactive States - 상호작용 상태 */
  --state-hover: rgba(255, 255, 255, 0.05);
  --state-active: rgba(255, 255, 255, 0.1);
  --state-pressed: rgba(255, 255, 255, 0.15);
  --state-disabled: rgba(255, 255, 255, 0.03);

  /* Bible-specific - 성경 전용 색상 */
  --bible-old-testament: #8b5cf6; /* 구약 - 보라 계열 */
  --bible-new-testament: #10b981; /* 신약 - 에메랄드 계열 */
  --bible-meditation: #f59e0b; /* 묵상 - 앰버 계열 */
  --bible-highlight: rgba(59, 130, 246, 0.2);
  --bible-verse-number: #6366f1;
}
```

### **다이나믹 테마 전환 시스템**

```css
/* 부드러운 테마 전환 애니메이션 */
* {
  transition:
    background-color 0.3s ease-out,
    color 0.3s ease-out,
    border-color 0.3s ease-out,
    box-shadow 0.3s ease-out;
}

/* 테마 전환 시 깜빡임 방지 */
.theme-transition {
  transition: none !important;
}

/* CSS Custom Properties 기반 즉시 전환 */
[data-theme-transition='true'] * {
  transition-duration: 0s !important;
}
```

---

## 📐 **고급 레이아웃 시스템**

### **CSS Grid 기반 마스터 레이아웃**

```css
/* 메인 애플리케이션 그리드 */
.app-layout {
  display: grid;
  grid-template-areas:
    'header header'
    'sidebar main'
    'sidebar footer';
  grid-template-columns: minmax(280px, 320px) 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  background: var(--bg-canvas);
}

/* Container Queries 지원 */
@container (max-width: 768px) {
  .app-layout {
    grid-template-areas:
      'header'
      'main'
      'footer';
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .sidebar {
    display: none;
  }
}

/* 페이지별 전용 그리드 */
.bible-reading-layout {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 400px);
  gap: clamp(1rem, 3vw, 2.5rem);
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2rem);
}

.dashboard-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
  padding: clamp(1rem, 3vw, 2rem);
}

/* 자율적 그리드 - 컨텐츠 기반 자동 배치 */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: clamp(0.75rem, 2vw, 1.5rem);
}
```

### **유체형 타이포그래피 시스템**

```css
/* Fluid Typography - 화면 크기에 따른 자동 조절 */
.text-h1 {
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text-h2 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.text-bible {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  line-height: 1.8;
  font-weight: 400;
  font-family: var(--font-bible);
}

/* 읽기 모드별 최적화 */
.reading-mode-verse .text-bible {
  font-size: clamp(1rem, 2.2vw, 1.125rem);
  line-height: 1.7;
}

.reading-mode-meditation .text-bible {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  line-height: 2;
  text-align: center;
}

/* 동적 여백 시스템 */
.spacing-section {
  margin-bottom: clamp(2rem, 5vw, 4rem);
}
.spacing-component {
  margin-bottom: clamp(1rem, 3vw, 2rem);
}
.spacing-element {
  margin-bottom: clamp(0.5rem, 1.5vw, 1rem);
}
```

---

## ✨ **마이크로인터랙션 디자인**

### **성경 페이지 전환 효과**

```css
/* 페이지 넘김 애니메이션 */
@keyframes pageFlip {
  0% {
    transform: perspective(1200px) rotateY(0deg);
  }
  50% {
    transform: perspective(1200px) rotateY(-85deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }
  100% {
    transform: perspective(1200px) rotateY(0deg);
  }
}

.page-transition {
  animation: pageFlip 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: left center;
}

/* 구절 하이라이트 애니메이션 */
@keyframes verseHighlight {
  0% {
    background: transparent;
    transform: scale(1);
  }
  50% {
    background: var(--bible-highlight);
    transform: scale(1.02);
  }
  100% {
    background: var(--bible-highlight);
    transform: scale(1);
  }
}

.verse-highlight-animation {
  animation: verseHighlight 0.6s ease-out;
}

/* 진도 표시 애니메이션 */
@keyframes progressGrow {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.progress-bar-fill {
  animation: progressGrow 1s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}
```

### **카드 호버 인터랙션**

```css
/* 3D 카드 효과 */
.card-3d {
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-3d:hover {
  transform: translateY(-8px) rotateX(5deg) rotateY(5deg) scale(1.02);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--border-emphasis),
    inset 0 1px 0 var(--glass-medium);
}

/* 글래스모피즘 카드 */
.card-glass {
  background: var(--gradient-card);
  backdrop-filter: blur(10px) saturate(150%);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-md);
}

.card-glass:hover {
  background: var(--glass-medium);
  border-color: var(--border-default);
  box-shadow: var(--shadow-lg);
}
```

### **버튼 인터랙션 시스템**

```css
/* 프리미엄 버튼 디자인 */
.btn-primary {
  position: relative;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  transition: left 0.5s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 20px rgba(59, 130, 246, 0.3),
    0 6px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow:
    0 5px 10px rgba(59, 130, 246, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 로딩 상태 애니메이션 */
.btn-loading {
  position: relative;
  pointer-events: none;
}

.btn-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 🎭 **컴포넌트 디자인 시스템**

### **네비게이션 디자인**

```css
/* 메인 네비게이션 */
.main-nav {
  background: var(--bg-surface-1);
  border-right: 1px solid var(--border-subtle);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-lg);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 8px;
  border-radius: 10px;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--state-hover);
  color: var(--text-secondary);
  transform: translateX(4px);
}

.nav-item.active {
  background: var(--gradient-primary);
  color: var(--text-primary);
  box-shadow: var(--shadow-glow);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--text-accent);
  border-radius: 2px;
}

/* 브레드크럼 네비게이션 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-tertiary);
}

.breadcrumb-item {
  position: relative;
  transition: color 0.2s ease;
}

.breadcrumb-item:hover {
  color: var(--text-accent);
}

.breadcrumb-separator {
  opacity: 0.5;
  transform: rotate(-90deg);
}
```

### **카드 컴포넌트 시스템**

```css
/* 기본 카드 디자인 */
.card {
  background: var(--gradient-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 카드 변형들 */
.card-elevated {
  box-shadow: var(--shadow-lg);
  border: none;
}

.card-outlined {
  background: transparent;
  border: 1px solid var(--border-default);
}

.card-glass {
  background: var(--glass-medium);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid var(--glass-light);
}

/* 성경책 카드 특별 디자인 */
.bible-book-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.bible-book-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--bible-old-testament) 0%,
    var(--bible-new-testament) 100%
  );
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.bible-book-card:hover::before {
  transform: scaleX(1);
}

.bible-book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

### **모달 및 오버레이**

```css
/* 모달 시스템 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) translateY(0);
  }
}

/* 토스트 알림 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-surface-3);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: var(--shadow-lg);
  z-index: 1100;
  animation: toastSlideIn 0.3s ease;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## 📱 **고급 반응형 디자인**

### **Container Queries 활용**

```css
/* 컨테이너 기반 반응형 디자인 */
.responsive-container {
  container-type: inline-size;
  container-name: main;
}

/* 컨테이너 크기에 따른 레이아웃 변경 */
@container main (max-width: 600px) {
  .bible-verse {
    font-size: 1rem;
    line-height: 1.6;
  }

  .verse-actions {
    flex-direction: column;
    gap: 8px;
  }
}

@container main (min-width: 800px) {
  .bible-content {
    column-count: 2;
    column-gap: 2rem;
  }
}

/* 동적 그리드 시스템 */
.dynamic-grid {
  display: grid;
  gap: 1rem;
}

@container (max-width: 400px) {
  .dynamic-grid {
    grid-template-columns: 1fr;
  }
}

@container (min-width: 401px) and (max-width: 800px) {
  .dynamic-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 801px) {
  .dynamic-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### **터치 최적화**

```css
/* 터치 친화적 인터페이스 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 스와이프 제스처 지원 */
.swipeable {
  touch-action: pan-x;
  user-select: none;
}

/* 모바일 전용 스타일 */
@media (hover: none) and (pointer: coarse) {
  .hover-effect:hover {
    transform: none !important;
  }

  .card:hover {
    transform: none !important;
  }

  .touch-feedback:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}
```

---

## 🎬 **성능 최적화 애니메이션**

### **GPU 가속 애니메이션**

```css
/* GPU 가속을 위한 will-change 속성 */
.animated-element {
  will-change: transform, opacity;
}

/* 하드웨어 가속 강제 */
.gpu-accelerated {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 60fps 보장 애니메이션 */
@keyframes smoothSlide {
  from {
    transform: translate3d(-100%, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

.smooth-animation {
  animation: smoothSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 메모리 효율적인 애니메이션 */
.memory-efficient {
  animation-fill-mode: forwards;
  animation-iteration-count: 1;
}

.memory-efficient.complete {
  animation: none;
  will-change: auto;
}
```

### **인터섹션 옵저버 기반 지연 애니메이션**

```css
/* 스크롤 기반 등장 애니메이션 */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-in-up.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* 순차적 등장 애니메이션 */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stagger-item:nth-child(1) {
  transition-delay: 0.1s;
}
.stagger-item:nth-child(2) {
  transition-delay: 0.2s;
}
.stagger-item:nth-child(3) {
  transition-delay: 0.3s;
}
.stagger-item:nth-child(4) {
  transition-delay: 0.4s;
}

.stagger-item.in-view {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 🌟 **특별 효과 및 고급 기법**

### **성경 읽기 전용 효과**

```css
/* 성경 구절 강조 효과 */
.verse-glow {
  position: relative;
  padding: 16px;
  border-radius: 8px;
  background: var(--gradient-surface);
}

.verse-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    45deg,
    var(--bible-highlight) 0%,
    transparent 50%,
    var(--bible-highlight) 100%
  );
  border-radius: 10px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.verse-glow:hover::before {
  opacity: 1;
}

/* 읽기 진행 표시 효과 */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--bg-surface-1);
  z-index: 100;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--bible-old-testament) 0%,
    var(--bible-new-testament) 100%
  );
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

/* 오디오 재생 시각화 */
.audio-visualizer {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 20px;
}

.audio-bar {
  width: 3px;
  background: var(--text-accent);
  border-radius: 2px;
  animation: audioWave 1s ease-in-out infinite alternate;
}

.audio-bar:nth-child(1) {
  animation-delay: 0s;
}
.audio-bar:nth-child(2) {
  animation-delay: 0.1s;
}
.audio-bar:nth-child(3) {
  animation-delay: 0.2s;
}
.audio-bar:nth-child(4) {
  animation-delay: 0.3s;
}

@keyframes audioWave {
  from {
    height: 4px;
  }
  to {
    height: 16px;
  }
}
```

### **커뮤니티 상호작용 효과**

```css
/* 좋아요 애니메이션 */
@keyframes likeHeart {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
    filter: hue-rotate(10deg);
  }
  100% {
    transform: scale(1);
  }
}

.like-button.liked {
  animation: likeHeart 0.4s ease;
  color: #ef4444;
}

/* 댓글 등장 애니메이션 */
@keyframes commentSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateX(0);
    max-height: 200px;
  }
}

.comment-new {
  animation: commentSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 하이라이트 공유 효과 */
.highlight-share {
  position: relative;
  overflow: hidden;
}

.highlight-share::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s ease-in-out;
}

@keyframes shimmer {
  to {
    left: 100%;
  }
}
```

---

## 🔧 **Next.js 특화 구현**

### **app 라우터 기반 레이아웃**

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark">
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

// components/layout/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { MainNavigation } from './MainNavigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="app-layout" data-admin={isAdminPage}>
      <Header />
      <MainNavigation />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### **서버 컴포넌트 최적화**

```typescript
// app/bible/[book]/[chapter]/page.tsx
import { Suspense } from 'react';
import { BibleContent } from '@/components/bible/BibleContent';
import { BibleNavigationSidebar } from '@/components/bible/BibleNavigationSidebar';
import { ProgressTracker } from '@/components/bible/ProgressTracker';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default async function BibleChapterPage({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  // 서버에서 데이터 pre-fetch
  const [chapterData, navigationData] = await Promise.all([
    fetchBibleChapter(params.book, parseInt(params.chapter)),
    fetchNavigationData(params.book),
  ]);

  return (
    <div className="bible-reading-layout">
      <Suspense fallback={<LoadingSpinner />}>
        <BibleNavigationSidebar
          data={navigationData}
          currentBook={params.book}
          currentChapter={parseInt(params.chapter)}
        />
      </Suspense>

      <div className="bible-content-section">
        <Suspense fallback={<div className="content-skeleton" />}>
          <BibleContent data={chapterData} />
        </Suspense>

        <ProgressTracker
          bookId={params.book}
          chapterNumber={parseInt(params.chapter)}
        />
      </div>
    </div>
  );
}
```

### **클라이언트 컴포넌트 최적화**

```typescript
// components/ui/AnimatedCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({
  children,
  delay = 0,
  className = ''
}: AnimatedCardProps) {
  const [ref, isInView] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`card-3d ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

---

## 🎨 **다크모드 전환 시스템**

### **테마 컨텍스트 및 훅**

```typescript
// components/theme/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');

      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);

    // 부드러운 전환을 위한 클래스 추가
    document.documentElement.classList.add('theme-transitioning');

    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timeout);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### **테마 전환 버튼 컴포넌트**

```typescript
// components/theme/ThemeToggle.tsx
'use client';

import { useTheme } from './ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: '라이트 모드' },
    { value: 'dark', icon: Moon, label: '다크 모드' },
    { value: 'system', icon: Monitor, label: '시스템 설정' },
  ] as const;

  return (
    <div className="theme-toggle">
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={`theme-option ${theme === value ? 'active' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={label}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Icon size={20} />
            </motion.div>
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
}
```

---

## ✅ **구현 체크리스트**

### **기본 레이아웃 시스템**

- [ ] CSS Grid 기반 마스터 레이아웃 구현
- [ ] Container Queries 반응형 시스템
- [ ] 유체형 타이포그래피 적용
- [ ] 다크모드 컬러 시스템 구축

### **컴포넌트 디자인**

- [ ] 카드 3D 효과 및 글래스모피즘
- [ ] 버튼 마이크로인터랙션
- [ ] 네비게이션 애니메이션
- [ ] 모달 및 오버레이 시스템

### **성경 전용 효과**

- [ ] 페이지 넘김 애니메이션
- [ ] 구절 하이라이트 효과
- [ ] 읽기 진도 시각화
- [ ] 오디오 재생 표시

### **성능 최적화**

- [ ] GPU 가속 애니메이션
- [ ] 인터섹션 옵저버 지연 로딩
- [ ] Next.js 서버 컴포넌트 활용
- [ ] 이미지 및 폰트 최적화

### **고급 인터랙션**

- [ ] 터치 제스처 지원
- [ ] 키보드 네비게이션
- [ ] 접근성 스크린 리더 지원
- [ ] 커뮤니티 상호작용 효과

### **테마 및 개인화**

- [ ] 다크/라이트 모드 전환
- [ ] 시스템 설정 감지
- [ ] 사용자 설정 저장
- [ ] 부드러운 테마 전환

---

## 🎯 **최종 완성도**

이 페이지 디자인 및 레이아웃 PRD를 통해 성경자료실은:

- **프리미엄 앱 수준의 시각적 완성도**
- **영적 집중을 돕는 차분한 다크모드 기본 설정**
- **모든 디바이스에서 최적화된 반응형 경험**
- **성경 읽기에 특화된 독창적 인터랙션**

을 제공하는 **차세대 디지털 성경학 플랫폼**으로 완성됩니다.

---

**📋 문서 상태**: ✅ **완료** - 페이지 디자인 및 레이아웃 구현 설계 확정  
**🎨 디자인 완성도**: 상업적 프리미엄 앱 수준의 시각적 품질  
**💻 기술 활용**: Next.js 14 + 최신 CSS 기법 완전 활용  
**🌙 다크모드**: 영적 집중을 위한 최적화된 기본 테마
