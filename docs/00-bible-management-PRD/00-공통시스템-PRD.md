# 📋 00-공통시스템-PRD.md

## 🎯 **문서 개요**

### **문서명**: 공통시스템 설계서 (Design System & Component Library)

### **버전**: v1.0.0

### **작성일**: 2025.07.08

### **최종 수정일**: 2025.07.08

### **의존성**: 00-전체아키텍처-PRD.md

---

## 🎨 **디자인 시스템 철학**

> **"성경 읽기에 최적화된 차분하고 집중적인 사용자 경험"**

### **핵심 디자인 원칙**

1. **Spiritual Focus**: 영적 집중을 방해하지 않는 차분한 인터페이스
2. **Reading Comfort**: 장시간 읽기에 최적화된 타이포그래피와 색상
3. **Accessibility First**: 모든 연령층이 쉽게 사용할 수 있는 접근성
4. **Consistent Interaction**: 직관적이고 일관된 상호작용 패턴
5. **Emotional Warmth**: 기술적 차가움보다는 따뜻한 영성 추구

---

## 🌈 **색상 시스템 (Color Palette)**

### **다크모드 (기본 모드)**

```css
:root {
  /* Primary Background */
  --bg-primary: #0f172a; /* Slate 900 - 메인 배경 */
  --bg-secondary: #1e293b; /* Slate 800 - 카드 배경 */
  --bg-tertiary: #334155; /* Slate 700 - 활성 요소 */
  --bg-card: #334155; /* 카드 컨테이너 */
  --bg-modal: rgba(15, 23, 42, 0.95); /* 모달 배경 */

  /* Text Colors */
  --text-primary: #f1f5f9; /* Slate 100 - 주요 텍스트 */
  --text-secondary: #cbd5e1; /* Slate 300 - 보조 텍스트 */
  --text-muted: #94a3b8; /* Slate 400 - 비활성 텍스트 */
  --text-inverse: #0f172a; /* 역전 텍스트 (라이트 버튼) */

  /* Border & Dividers */
  --border-primary: #475569; /* Slate 600 - 주요 테두리 */
  --border-secondary: #64748b; /* Slate 500 - 보조 테두리 */
  --border-focus: #3b82f6; /* Blue 500 - 포커스 테두리 */

  /* Accent Colors */
  --accent-primary: #3b82f6; /* Blue 500 - 주요 액션 */
  --accent-hover: #2563eb; /* Blue 600 - 호버 상태 */
  --accent-light: rgba(59, 130, 246, 0.1); /* 연한 액센트 */

  /* Semantic Colors */
  --success: #10b981; /* Emerald 500 - 성공 */
  --success-light: rgba(16, 185, 129, 0.1);
  --warning: #f59e0b; /* Amber 500 - 경고 */
  --warning-light: rgba(245, 158, 11, 0.1);
  --error: #ef4444; /* Red 500 - 오류 */
  --error-light: rgba(239, 68, 68, 0.1);
  --info: #06b6d4; /* Cyan 500 - 정보 */
  --info-light: rgba(6, 182, 212, 0.1);

  /* Highlight System */
  --highlight-personal: rgba(59, 130, 246, 0.2); /* 개인 하이라이트 */
  --highlight-community: rgba(34, 197, 94, 0.2); /* 커뮤니티 하이라이트 */
  --highlight-study: rgba(168, 85, 247, 0.2); /* 스터디 하이라이트 */
  --highlight-meditation: rgba(234, 179, 8, 0.2); /* 묵상 하이라이트 */

  /* Interactive States */
  --hover-overlay: rgba(148, 163, 184, 0.1); /* 호버 효과 */
  --active-overlay: rgba(148, 163, 184, 0.2); /* 활성 효과 */
  --focus-ring: rgba(59, 130, 246, 0.3); /* 포커스 링 */
}
```

### **라이트모드**

```css
.light-mode {
  /* Primary Background */
  --bg-primary: #ffffff; /* 순백 배경 */
  --bg-secondary: #f8fafc; /* Slate 50 - 카드 배경 */
  --bg-tertiary: #f1f5f9; /* Slate 100 - 활성 요소 */
  --bg-card: #f1f5f9; /* 카드 컨테이너 */
  --bg-modal: rgba(255, 255, 255, 0.95); /* 모달 배경 */

  /* Text Colors */
  --text-primary: #0f172a; /* Slate 900 - 주요 텍스트 */
  --text-secondary: #334155; /* Slate 700 - 보조 텍스트 */
  --text-muted: #64748b; /* Slate 500 - 비활성 텍스트 */
  --text-inverse: #ffffff; /* 역전 텍스트 (다크 버튼) */

  /* Border & Dividers */
  --border-primary: #e2e8f0; /* Slate 200 - 주요 테두리 */
  --border-secondary: #cbd5e1; /* Slate 300 - 보조 테두리 */
  --border-focus: #3b82f6; /* Blue 500 - 포커스 테두리 */

  /* Interactive States */
  --hover-overlay: rgba(15, 23, 42, 0.05); /* 호버 효과 */
  --active-overlay: rgba(15, 23, 42, 0.1); /* 활성 효과 */
  --focus-ring: rgba(59, 130, 246, 0.3); /* 포커스 링 */

  /* 나머지 색상은 다크모드와 동일 */
}
```

### **성경 테마 색상**

```css
/* 구약 테마 */
.old-testament-theme {
  --theme-primary: #7c3aed; /* Violet 600 - 깊이와 역사 */
  --theme-secondary: #a855f7; /* Purple 500 - 신비로움 */
  --theme-light: rgba(124, 58, 237, 0.1);
}

/* 신약 테마 */
.new-testament-theme {
  --theme-primary: #059669; /* Emerald 600 - 희망과 생명 */
  --theme-secondary: #10b981; /* Emerald 500 - 새로운 시작 */
  --theme-light: rgba(5, 150, 105, 0.1);
}

/* 묵상/기도 테마 */
.meditation-theme {
  --theme-primary: #dc2626; /* Red 600 - 사랑과 열정 */
  --theme-secondary: #ef4444; /* Red 500 - 따뜻함 */
  --theme-light: rgba(220, 38, 38, 0.1);
}
```

---

## 🔤 **타이포그래피 시스템**

### **폰트 패밀리**

```css
/* 기본 폰트 스택 - 가독성 최우선 */
.font-main {
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    'Noto Sans KR',
    sans-serif;
}

/* 성경 본문 전용 폰트 - 읽기 최적화 */
.font-bible {
  font-family: 'Noto Serif KR', 'Times New Roman', 'Georgia', serif;
  font-feature-settings:
    'kern' 1,
    'liga' 1;
}

/* 모노스페이스 - 코드/데이터 */
.font-mono {
  font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
}
```

### **타이포그래피 스케일**

```css
/* Heading Hierarchy */
.text-h1 {
  font-size: 2rem; /* 32px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.text-h2 {
  font-size: 1.75rem; /* 28px */
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.text-h3 {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

.text-h4 {
  font-size: 1.25rem; /* 20px */
  font-weight: 500;
  line-height: 1.4;
}

.text-h5 {
  font-size: 1.125rem; /* 18px */
  font-weight: 500;
  line-height: 1.5;
}

.text-h6 {
  font-size: 1rem; /* 16px */
  font-weight: 500;
  line-height: 1.5;
}

/* Body Text */
.text-body-lg {
  font-size: 1.125rem; /* 18px */
  line-height: 1.7;
}

.text-body {
  font-size: 1rem; /* 16px */
  line-height: 1.6;
}

.text-body-sm {
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
}

/* Bible-specific Typography */
.text-bible-lg {
  font-size: 1.25rem; /* 20px */
  line-height: 1.8;
  font-weight: 400;
}

.text-bible {
  font-size: 1.125rem; /* 18px */
  line-height: 1.8;
  font-weight: 400;
}

.text-bible-sm {
  font-size: 1rem; /* 16px */
  line-height: 1.7;
  font-weight: 400;
}

/* Caption & Labels */
.text-caption {
  font-size: 0.75rem; /* 12px */
  line-height: 1.4;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.text-overline {
  font-size: 0.75rem; /* 12px */
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

### **반응형 타이포그래피**

```css
/* Mobile Optimizations */
@media (max-width: 768px) {
  .text-h1 {
    font-size: 1.75rem;
  } /* 28px */
  .text-h2 {
    font-size: 1.5rem;
  } /* 24px */
  .text-h3 {
    font-size: 1.25rem;
  } /* 20px */
  .text-bible-lg {
    font-size: 1.125rem;
  } /* 18px */
  .text-bible {
    font-size: 1rem;
  } /* 16px */
}

/* Large Screens */
@media (min-width: 1200px) {
  .text-h1 {
    font-size: 2.25rem;
  } /* 36px */
  .text-h2 {
    font-size: 2rem;
  } /* 32px */
  .text-bible-lg {
    font-size: 1.375rem;
  } /* 22px */
}
```

---

## 🧩 **컴포넌트 시스템**

### **기본 버튼 컴포넌트**

```typescript
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-accent-primary text-text-inverse
      hover:bg-accent-hover
      focus:ring-accent-primary/50
    `,
    secondary: `
      bg-bg-tertiary text-text-primary
      hover:bg-bg-card
      focus:ring-border-focus/50
    `,
    ghost: `
      bg-transparent text-text-secondary
      hover:bg-hover-overlay
      focus:ring-border-focus/50
    `,
    outline: `
      bg-transparent border border-border-primary text-text-primary
      hover:bg-hover-overlay
      focus:ring-border-focus/50
    `,
    danger: `
      bg-error text-text-inverse
      hover:bg-red-600
      focus:ring-error/50
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};
```

### **입력 컴포넌트**

```typescript
// Input.tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error,
  label,
  helpText,
  leftIcon,
  rightIcon,
  onChange
}) => {
  const baseClasses = `
    w-full px-3 py-2
    bg-bg-secondary border border-border-primary
    text-text-primary placeholder-text-muted
    rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-error focus:border-error focus:ring-error/50' : ''}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          className={baseClasses}
          onChange={(e) => onChange?.(e.target.value)}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      {helpText && !error && (
        <p className="text-sm text-text-muted">{helpText}</p>
      )}
    </div>
  );
};
```

### **카드 컴포넌트**

```typescript
// Card.tsx
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  children,
  className = '',
  onClick
}) => {
  const baseClasses = `
    rounded-lg transition-all duration-200
    ${clickable ? 'cursor-pointer' : ''}
  `;

  const variantClasses = {
    default: 'bg-bg-secondary border border-border-primary',
    outlined: 'bg-transparent border border-border-primary',
    elevated: 'bg-bg-secondary shadow-lg shadow-black/10',
    ghost: 'bg-transparent'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const hoverClasses = hover || clickable ? `
    hover:shadow-lg hover:shadow-black/20
    hover:scale-[1.02] hover:-translate-y-1
  ` : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${className}
      `}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </div>
  );
};
```

### **모달 컴포넌트**

```typescript
// Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  closeOnOverlay = true,
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-modal backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className={`
        relative w-full ${sizeClasses[size]}
        bg-bg-secondary border border-border-primary
        rounded-lg shadow-xl
        transform transition-all duration-200
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border-primary">
            {title && (
              <h3 className="text-lg font-semibold text-text-primary">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-hover-overlay transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### **토스트 알림 시스템**

```typescript
// Toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 5000,
  action
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const typeConfig = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-success',
      textColor: 'text-white'
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      bgColor: 'bg-error',
      textColor: 'text-white'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-warning',
      textColor: 'text-white'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-info',
      textColor: 'text-white'
    }
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50
      ${config.bgColor} ${config.textColor}
      rounded-lg shadow-lg p-4 max-w-sm w-full
      transform transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {message && (
            <p className="text-sm opacity-90 mt-1">{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm underline mt-2 hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

---

## 🎬 **애니메이션 시스템**

### **전환 애니메이션**

```css
/* Page Transitions */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-out;
}

.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.2s ease-in;
}

/* Modal Animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}

/* Loading Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

/* Hover Effects */
.hover-lift {
  transition: all 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.hover-scale {
  transition: transform 0.2s ease-out;
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* Microinteractions */
.button-press {
  transition: all 0.1s ease-out;
}

.button-press:active {
  transform: scale(0.98);
}

/* Scripture-specific animations */
@keyframes verseHighlight {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: var(--highlight-meditation);
  }
  100% {
    background-color: transparent;
  }
}

.verse-animate-highlight {
  animation: verseHighlight 1s ease-in-out;
}

/* Progress Animations */
@keyframes progressFill {
  from {
    width: 0%;
  }
  to {
    width: var(--progress-width);
  }
}

.progress-animated {
  animation: progressFill 0.5s ease-out;
}
```

### **Framer Motion 프리셋**

```typescript
// animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const childVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
```

---

## 📐 **레이아웃 시스템**

### **그리드 시스템**

```css
/* Container Sizes */
.container-sm {
  max-width: 640px;
}
.container-md {
  max-width: 768px;
}
.container-lg {
  max-width: 1024px;
}
.container-xl {
  max-width: 1280px;
}
.container-2xl {
  max-width: 1536px;
}

/* Grid System */
.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}
.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}
.grid-5 {
  grid-template-columns: repeat(5, 1fr);
}

/* Responsive Grid */
.grid-responsive {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

@media (max-width: 640px) {
  .grid-responsive {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Flexbox Utilities */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.flex-end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
```

### **스페이싱 시스템**

```css
/* Consistent Spacing Scale */
.space-xs {
  gap: 0.25rem;
} /* 4px */
.space-sm {
  gap: 0.5rem;
} /* 8px */
.space-md {
  gap: 1rem;
} /* 16px */
.space-lg {
  gap: 1.5rem;
} /* 24px */
.space-xl {
  gap: 2rem;
} /* 32px */
.space-2xl {
  gap: 3rem;
} /* 48px */
.space-3xl {
  gap: 4rem;
} /* 64px */

/* Margin/Padding Utilities */
.m-auto {
  margin: auto;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.my-auto {
  margin-top: auto;
  margin-bottom: auto;
}

/* Content-specific spacing */
.bible-spacing {
  line-height: 1.8;
  margin-bottom: 1rem;
}
.section-spacing {
  margin-bottom: 2rem;
}
.page-spacing {
  padding: 2rem 1rem;
}

@media (max-width: 768px) {
  .page-spacing {
    padding: 1rem 0.5rem;
  }
}
```

---

## 🎯 **아이콘 시스템**

### **Lucide React 아이콘 매핑**

```typescript
// icons.ts
import {
  Book, BookOpen, Heart, Star, Settings,
  Search, Play, Pause, Volume2, VolumeX,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Plus, Minus, X, Check, AlertCircle,
  Home, User, Calendar, FileText, Download,
  Eye, Edit, Trash2, Save, Upload
} from 'lucide-react';

export const Icons = {
  // Navigation
  home: Home,
  book: Book,
  bookOpen: BookOpen,
  user: User,
  settings: Settings,

  // Actions
  search: Search,
  play: Play,
  pause: Pause,
  volume: Volume2,
  volumeOff: VolumeX,

  // Arrows
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,

  // Symbols
  plus: Plus,
  minus: Minus,
  close: X,
  check: Check,
  alert: AlertCircle,

  // Content
  heart: Heart,
  star: Star,
  calendar: Calendar,
  fileText: FileText,
  download: Download,

  // CRUD
  view: Eye,
  edit: Edit,
  delete: Trash2,
  save: Save,
  upload: Upload
} as const;

// Icon component with consistent sizing
interface IconProps {
  name: keyof typeof Icons;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = ''
}) => {
  const IconComponent = Icons[name];

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <IconComponent
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};
```

---

## 📱 **반응형 디자인**

### **브레이크포인트 시스템**

```css
/* Tailwind-based breakpoints */
/* sm: 640px and up */
@media (min-width: 640px) {
  /* Small tablets */
}

/* md: 768px and up */
@media (min-width: 768px) {
  /* Large tablets */
}

/* lg: 1024px and up */
@media (min-width: 1024px) {
  /* Laptops */
}

/* xl: 1280px and up */
@media (min-width: 1280px) {
  /* Desktops */
}

/* 2xl: 1536px and up */
@media (min-width: 1536px) {
  /* Large desktops */
}
```

### **모바일 최적화**

```css
/* Touch-friendly sizing */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Mobile typography adjustments */
@media (max-width: 768px) {
  /* Slightly larger text for mobile reading */
  .text-bible {
    font-size: 1.125rem;
    line-height: 1.8;
  }
  .text-bible-lg {
    font-size: 1.25rem;
    line-height: 1.9;
  }

  /* Optimized spacing */
  .mobile-padding {
    padding: 1rem;
  }
  .mobile-margin {
    margin: 0.5rem 0;
  }

  /* Stack layouts */
  .mobile-stack {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1024px) {
  .tablet-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tablet-sidebar {
    width: 250px;
  }
}
```

---

## ♿ **접근성 가이드라인**

### **색상 접근성**

```css
/* WCAG AA 준수 색상 대비비 */
/* Normal text: 4.5:1 minimum */
/* Large text: 3:1 minimum */

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #ffffff;
    --bg-primary: #000000;
    --border-primary: #ffffff;
    --accent-primary: #ffffff;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **키보드 네비게이션**

```css
/* Focus indicators */
.focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--accent-primary);
  color: white;
  padding: 8px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 🔧 **컴포넌트 사용 가이드**

### **일관된 컴포넌트 사용법**

```typescript
// ✅ Good: Consistent prop naming
<Button
  variant="primary"
  size="md"
  leftIcon={<Plus />}
  onClick={handleSubmit}
>
  성경 추가
</Button>

// ✅ Good: Semantic HTML with proper ARIA
<Card
  hover
  clickable
  onClick={handleCardClick}
  role="button"
  aria-label="창세기 1장 읽기"
>
  <h3>창세기 1장</h3>
  <p>하나님의 천지창조</p>
</Card>

// ✅ Good: Form accessibility
<Input
  label="검색어 입력"
  placeholder="성경 구절이나 키워드를 입력하세요"
  leftIcon={<Search />}
  aria-describedby="search-help"
  onChange={handleSearch}
/>
<p id="search-help" className="text-caption text-text-muted">
  예: 창세기 1:1, 사랑, 희망 등
</p>
```

---

## ✅ **구현 체크리스트**

### **디자인 토큰 설정**

- [ ] CSS 커스텀 프로퍼티 정의
- [ ] Tailwind CSS 커스텀 테마 설정
- [ ] 다크/라이트 모드 토글 구현
- [ ] 색상 접근성 검증 (WCAG AA)

### **컴포넌트 라이브러리**

- [ ] Button 컴포넌트 구현 및 테스트
- [ ] Input/Form 컴포넌트 구현
- [ ] Card 컴포넌트 구현
- [ ] Modal 컴포넌트 구현
- [ ] Toast 알림 시스템 구현
- [ ] Icon 시스템 설정

### **타이포그래피 & 레이아웃**

- [ ] 웹폰트 로딩 최적화
- [ ] 반응형 타이포그래피 테스트
- [ ] 그리드 시스템 검증
- [ ] 모바일 최적화 확인

### **애니메이션 & 인터랙션**

- [ ] 페이지 전환 애니메이션
- [ ] 마이크로인터랙션 구현
- [ ] 로딩 상태 애니메이션
- [ ] 성능 최적화 (60fps 유지)

### **접근성 검증**

- [ ] 키보드 네비게이션 테스트
- [ ] 스크린 리더 호환성 확인
- [ ] 색상 대비비 검증
- [ ] 모션 감소 모드 지원

---

## 🎯 **다음 단계**

공통시스템 구축이 완료되면 다음 순서로 진행:

1. **02-성경읽기-PRD.md** - 핵심 읽기 기능 상세 설계
2. **04-데이터관리-PRD.md** - 관리자 도구 및 콘텐츠 관리
3. **03-성경자료실-PRD.md** - HTML 편집기 및 고급 기능
4. **01-HOME-PRD.md** - 통합 대시보드 완성

---

**📋 문서 상태**: ✅ **완료** - 공통시스템 설계 확정  
**🎨 디자인 시스템**: 완전 구축 가능한 수준  
**🧩 컴포넌트**: 재사용 가능한 모듈화 완성  
**📅 다음 리뷰**: 성경읽기 페이지 PRD 작성 후
