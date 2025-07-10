# 📋 01-HOME-PRD.md

## 🎯 **문서 개요**

### **문서명**: HOME 대시보드 페이지 상세 설계서

### **버전**: v1.0.0

### **작성일**: 2025.07.08

### **최종 수정일**: 2025.07.08

### **의존성**: 00-전체아키텍처-PRD.md, 00-공통시스템-PRD.md, 02-성경읽기-PRD.md, 03-성경자료실-PRD.md, 04-데이터관리-PRD.md

---

## 🏠 **기능 개요**

> **"개인화된 성경학 여정의 중심 허브 - 통찰부터 행동까지"**

### **핵심 가치 제안**

- **Personalized Dashboard**: 개인의 성경 읽기 패턴과 선호도를 반영한 맞춤형 대시보드
- **Actionable Insights**: 단순 통계를 넘어 실제 영적 성장으로 이어지는 인사이트 제공
- **Community Connection**: 개인 여정과 커뮤니티 활동을 자연스럽게 연결
- **Smart Recommendations**: AI 기반 개인화 추천으로 다음 읽을 말씀과 자료 제안
- **Motivation Engine**: 게임화 요소와 성취 시스템으로 지속적인 동기부여

---

## 🏗️ **페이지 아키텍처**

### **그리드 기반 위젯 시스템**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 개인화 헤더 (환영 메시지 + 오늘의 말씀 + 날씨/시간)              │
├─────────────────────┬───────────────────┬───────────────────────┤
│  📊 읽기 진도        │  🔥 연속 기록     │  🎯 오늘의 목표        │
│  (원형 차트)         │  (스트릭 표시)    │  (진행률 바)           │
├─────────────────────┼───────────────────┴───────────────────────┤
│  📈 주간 통계        │  📚 추천 자료                              │
│  (막대 차트)         │  (카드 슬라이더)                           │
├─────────────────────┴─────────────────┬───────────────────────┤
│  🗓️ 성경 읽기 캘린더                    │  💬 최근 커뮤니티      │
│  (월간 뷰 + 완료 표시)                   │  (댓글/하이라이트)     │
├─────────────────────────────────────────┼───────────────────────┤
│  📱 빠른 액션                           │  🏆 성취 및 뱃지       │
│  (읽기 시작, 자료 업로드, 설정 등)        │  (레벨, 뱃지, 순위)    │
└─────────────────────────────────────────┴───────────────────────┘
```

### **반응형 레이아웃 전략**

```css
/* Desktop (1200px+) */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto auto auto;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  grid-column: 1 / -1;
}

/* Tablet (768px - 1199px) */
@media (max-width: 1199px) {
  .dashboard-layout {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1.5rem;
  }

  .header-section {
    grid-column: 1 / -1;
  }

  .full-width-widget {
    grid-column: 1 / -1;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }

  .widget {
    min-height: auto;
  }

  .widget-header {
    padding: 0.75rem;
  }
}
```

---

## 🎯 **1. 개인화 헤더 시스템**

### **1-1. 동적 환영 메시지**

```typescript
interface PersonalizedHeaderProps {
  user: {
    name?: string;
    lastVisit: Date;
    currentStreak: number;
    totalDaysRead: number;
    favoriteBook?: string;
  };
  todaysVerse: {
    reference: string;
    text: string;
    reflection?: string;
  };
  weather?: {
    location: string;
    condition: string;
    temperature: number;
  };
}

const PersonalizedHeader: React.FC<PersonalizedHeaderProps> = ({
  user,
  todaysVerse,
  weather
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 6) setGreeting('새벽');
    else if (hour < 12) setGreeting('아침');
    else if (hour < 18) setGreeting('오후');
    else setGreeting('저녁');
  }, [currentTime]);

  const getPersonalizedMessage = () => {
    const messages = [
      `${greeting} 시간이에요! 오늘도 말씀과 함께 시작해보세요`,
      `${user.currentStreak}일째 꾸준히 말씀을 읽고 계시네요! 👏`,
      `${user.favoriteBook || '성경'}에서 새로운 은혜를 발견해보세요`,
      `총 ${user.totalDaysRead}일 동안 하나님과 동행하셨어요`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="personalized-header">
      {/* Time & Weather Strip */}
      <div className="info-strip">
        <div className="time-section">
          <span className="current-time">
            {currentTime.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <span className="current-date">
            {currentTime.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </span>
        </div>

        {weather && (
          <div className="weather-section">
            <Icon name="cloud" size="sm" />
            <span>{weather.location}</span>
            <span>{weather.temperature}°C</span>
            <span>{weather.condition}</span>
          </div>
        )}
      </div>

      {/* Main Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            {user.name ? `${user.name}님, ` : ''}좋은 {greeting}입니다! 🌅
          </h1>
          <p className="welcome-message">{getPersonalizedMessage()}</p>
        </div>

        <div className="quick-stats">
          <div className="stat-pill">
            <Icon name="flame" size="sm" />
            <span>{user.currentStreak}일 연속</span>
          </div>
          <div className="stat-pill">
            <Icon name="calendar" size="sm" />
            <span>총 {user.totalDaysRead}일</span>
          </div>
        </div>
      </div>

      {/* Today's Verse */}
      <div className="todays-verse">
        <div className="verse-header">
          <Icon name="star" size="sm" />
          <h3>오늘의 말씀</h3>
        </div>
        <blockquote className="verse-content">
          <p>"{todaysVerse.text}"</p>
          <cite>- {todaysVerse.reference}</cite>
        </blockquote>
        {todaysVerse.reflection && (
          <div className="verse-reflection">
            <Icon name="lightBulb" size="sm" />
            <p>{todaysVerse.reflection}</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **1-2. 스마트 알림 시스템**

```typescript
interface SmartNotificationProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onDismiss: (notificationId: string) => void;
}

interface Notification {
  id: string;
  type: 'reading_reminder' | 'achievement' | 'community' | 'recommendation';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  expiresAt?: Date;
}

const SmartNotificationSystem: React.FC<SmartNotificationProps> = ({
  notifications,
  onNotificationClick,
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeNotifications = notifications.filter(n =>
    !n.expiresAt || n.expiresAt > new Date()
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reading_reminder': return 'clock';
      case 'achievement': return 'trophy';
      case 'community': return 'users';
      case 'recommendation': return 'lightBulb';
      default: return 'bell';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-info';
      default: return 'text-secondary';
    }
  };

  if (activeNotifications.length === 0) return null;

  return (
    <div className="smart-notifications">
      <button
        className="notification-trigger"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon name="bell" size="sm" />
        {activeNotifications.length > 0 && (
          <span className="notification-badge">
            {Math.min(activeNotifications.length, 9)}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notification-header">
              <h4>알림</h4>
              <span className="notification-count">
                {activeNotifications.length}개
              </span>
            </div>

            <div className="notification-list">
              {activeNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${getPriorityColor(notification.priority)}`}
                  onClick={() => onNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    <Icon name={getNotificationIcon(notification.type)} size="sm" />
                  </div>

                  <div className="notification-content">
                    <h5 className="notification-title">
                      {notification.title}
                    </h5>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </span>
                  </div>

                  {notification.actionText && (
                    <button className="notification-action">
                      {notification.actionText}
                    </button>
                  )}

                  <button
                    className="notification-dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                  >
                    <Icon name="x" size="xs" />
                  </button>
                </div>
              ))}
            </div>

            <div className="notification-footer">
              <button className="clear-all-btn">
                모든 알림 지우기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

---

## 📊 **2. 진도 및 통계 위젯**

### **2-1. 읽기 진도 원형 차트**

```typescript
interface ReadingProgressWidgetProps {
  progressData: {
    totalBooks: number;
    completedBooks: number;
    totalChapters: number;
    completedChapters: number;
    currentBook: string;
    currentChapter: number;
    todayGoal: number;
    todayProgress: number;
  };
  onProgressClick: () => void;
}

const ReadingProgressWidget: React.FC<ReadingProgressWidgetProps> = ({
  progressData,
  onProgressClick
}) => {
  const overallProgress = (progressData.completedChapters / progressData.totalChapters) * 100;
  const todayProgress = (progressData.todayProgress / progressData.todayGoal) * 100;

  return (
    <Card className="reading-progress-widget" padding="lg" hover clickable onClick={onProgressClick}>
      <div className="widget-header">
        <h3>📊 읽기 진도</h3>
        <span className="progress-percentage">{Math.round(overallProgress)}%</span>
      </div>

      <div className="progress-charts">
        {/* Overall Progress Circle */}
        <div className="main-progress">
          <svg className="progress-circle" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="var(--border-primary)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="var(--accent-primary)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${overallProgress * 3.14} 314`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="progress-stroke"
            />
            <text
              x="60"
              y="60"
              textAnchor="middle"
              dy="0.3em"
              className="progress-text"
              fontSize="16"
              fontWeight="600"
            >
              {progressData.completedBooks}/{progressData.totalBooks}
            </text>
            <text
              x="60"
              y="75"
              textAnchor="middle"
              className="progress-label"
              fontSize="10"
              fill="var(--text-muted)"
            >
              권 완료
            </text>
          </svg>
        </div>

        {/* Today's Progress Mini Circle */}
        <div className="today-progress">
          <svg className="mini-circle" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="25"
              stroke="var(--border-primary)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="30"
              cy="30"
              r="25"
              stroke="var(--success)"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${todayProgress * 1.57} 157`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
              className="today-stroke"
            />
            <text
              x="30"
              y="30"
              textAnchor="middle"
              dy="0.3em"
              className="today-text"
              fontSize="10"
              fontWeight="600"
            >
              {Math.round(todayProgress)}%
            </text>
          </svg>
          <span className="today-label">오늘</span>
        </div>
      </div>

      <div className="progress-details">
        <div className="current-reading">
          <Icon name="bookmark" size="sm" />
          <span>현재: {progressData.currentBook} {progressData.currentChapter}장</span>
        </div>

        <div className="progress-stats">
          <div className="stat">
            <span className="value">{progressData.completedChapters}</span>
            <span className="label">완료 장</span>
          </div>
          <div className="stat">
            <span className="value">{progressData.totalChapters - progressData.completedChapters}</span>
            <span className="label">남은 장</span>
          </div>
        </div>
      </div>

      <div className="progress-actions">
        <Button variant="primary" size="sm" fullWidth>
          <Icon name="play" size="sm" />
          읽기 계속하기
        </Button>
      </div>
    </Card>
  );
};
```

### **2-2. 연속 기록 위젯**

```typescript
interface StreakWidgetProps {
  streakData: {
    currentStreak: number;
    longestStreak: number;
    streakType: 'reading' | 'listening' | 'both';
    weeklyPattern: boolean[]; // 최근 7일
    monthlyPattern: boolean[]; // 최근 30일
    streakGoal: number;
  };
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ streakData }) => {
  const streakPercentage = (streakData.currentStreak / streakData.streakGoal) * 100;
  const isOnFire = streakData.currentStreak >= 7;
  const isStreakLegend = streakData.currentStreak >= 30;

  return (
    <Card className="streak-widget" padding="lg">
      <div className="widget-header">
        <div className="header-content">
          <h3>🔥 연속 기록</h3>
          {isStreakLegend && <span className="legend-badge">전설</span>}
          {isOnFire && !isStreakLegend && <span className="fire-badge">열정</span>}
        </div>
      </div>

      <div className="streak-main">
        <div className="streak-number">
          <span className="current-streak">{streakData.currentStreak}</span>
          <span className="streak-unit">일 연속</span>
        </div>

        <div className="streak-visual">
          <div className="flame-animation">
            {Array.from({length: Math.min(5, Math.floor(streakData.currentStreak / 7))}).map((_, i) => (
              <div key={i} className={`flame flame-${i + 1}`}>🔥</div>
            ))}
          </div>
        </div>
      </div>

      <div className="streak-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(streakPercentage, 100)}%` }}
          />
        </div>
        <div className="progress-text">
          {streakData.streakGoal - streakData.currentStreak > 0 ? (
            <span>목표까지 {streakData.streakGoal - streakData.currentStreak}일</span>
          ) : (
            <span>목표 달성! 🎉</span>
          )}
        </div>
      </div>

      <div className="streak-pattern">
        <h5>최근 7일</h5>
        <div className="pattern-grid">
          {streakData.weeklyPattern.map((completed, index) => (
            <div
              key={index}
              className={`pattern-day ${completed ? 'completed' : 'missed'}`}
              title={`${7 - index}일 전`}
            >
              {completed ? '✅' : '⭕'}
            </div>
          ))}
        </div>
      </div>

      <div className="streak-stats">
        <div className="stat-row">
          <span className="stat-label">최고 기록:</span>
          <span className="stat-value">{streakData.longestStreak}일</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">이번 달:</span>
          <span className="stat-value">
            {streakData.monthlyPattern.filter(Boolean).length}/30일
          </span>
        </div>
      </div>

      {streakData.currentStreak === 0 && (
        <div className="streak-encouragement">
          <Icon name="target" size="sm" />
          <span>오늘부터 새로운 연속 기록을 시작해보세요!</span>
        </div>
      )}
    </Card>
  );
};
```

### **2-3. 주간 통계 차트**

```typescript
interface WeeklyStatsWidgetProps {
  statsData: {
    weeklyReadingTime: number[]; // 7일간 분 단위
    weeklyChapters: number[]; // 7일간 완료 장 수
    weeklyListeningTime: number[]; // 7일간 듣기 시간
    averageSessionTime: number;
    totalWeeklyTime: number;
    improvement: number; // 전주 대비 증감률
  };
}

const WeeklyStatsWidget: React.FC<WeeklyStatsWidgetProps> = ({ statsData }) => {
  const [activeMetric, setActiveMetric] = useState<'reading' | 'chapters' | 'listening'>('reading');

  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const maxValue = Math.max(...(
    activeMetric === 'reading' ? statsData.weeklyReadingTime :
    activeMetric === 'chapters' ? statsData.weeklyChapters :
    statsData.weeklyListeningTime
  ));

  const getCurrentData = () => {
    switch (activeMetric) {
      case 'reading': return statsData.weeklyReadingTime;
      case 'chapters': return statsData.weeklyChapters;
      case 'listening': return statsData.weeklyListeningTime;
    }
  };

  const getUnit = () => {
    switch (activeMetric) {
      case 'reading': return '분';
      case 'chapters': return '장';
      case 'listening': return '분';
    }
  };

  return (
    <Card className="weekly-stats-widget" padding="lg">
      <div className="widget-header">
        <h3>📈 주간 통계</h3>
        <div className="improvement-indicator">
          {statsData.improvement > 0 ? (
            <span className="improvement positive">
              <Icon name="trendingUp" size="sm" />
              +{statsData.improvement}%
            </span>
          ) : statsData.improvement < 0 ? (
            <span className="improvement negative">
              <Icon name="trendingDown" size="sm" />
              {statsData.improvement}%
            </span>
          ) : (
            <span className="improvement neutral">
              <Icon name="minus" size="sm" />
              0%
            </span>
          )}
        </div>
      </div>

      <div className="metric-selector">
        <button
          className={`metric-btn ${activeMetric === 'reading' ? 'active' : ''}`}
          onClick={() => setActiveMetric('reading')}
        >
          <Icon name="book" size="sm" />
          읽기
        </button>
        <button
          className={`metric-btn ${activeMetric === 'chapters' ? 'active' : ''}`}
          onClick={() => setActiveMetric('chapters')}
        >
          <Icon name="bookmark" size="sm" />
          장 완료
        </button>
        <button
          className={`metric-btn ${activeMetric === 'listening' ? 'active' : ''}`}
          onClick={() => setActiveMetric('listening')}
        >
          <Icon name="headphones" size="sm" />
          듣기
        </button>
      </div>

      <div className="chart-container">
        <div className="chart">
          {getCurrentData().map((value, index) => (
            <div key={index} className="chart-bar-container">
              <div
                className="chart-bar"
                style={{
                  height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                  backgroundColor: value > 0 ? 'var(--accent-primary)' : 'var(--border-primary)'
                }}
              >
                <div className="bar-value">{value}</div>
              </div>
              <div className="bar-label">{weekDays[index]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-value">
              {Math.round(statsData.totalWeeklyTime / 60)}시간
            </span>
            <span className="summary-label">주간 총시간</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">
              {Math.round(statsData.averageSessionTime)}분
            </span>
            <span className="summary-label">평균 세션</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">
              {getCurrentData().filter(v => v > 0).length}/7
            </span>
            <span className="summary-label">활동일</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

---

## 📚 **3. 추천 및 콘텐츠 위젯**

### **3-1. AI 기반 개인화 추천**

```typescript
interface RecommendationWidgetProps {
  recommendations: {
    nextReading: {
      book: string;
      chapter: number;
      reason: string;
      estimatedTime: number;
    };
    resources: {
      id: string;
      title: string;
      author: string;
      thumbnail?: string;
      matchScore: number;
      reason: string;
    }[];
    reflectionPrompts: string[];
  };
  onRecommendationClick: (type: string, id?: string) => void;
}

const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  recommendations,
  onRecommendationClick
}) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'resources' | 'reflection'>('reading');

  return (
    <Card className="recommendation-widget" padding="lg">
      <div className="widget-header">
        <h3>🤖 맞춤 추천</h3>
        <div className="ai-indicator">
          <Icon name="sparkles" size="sm" />
          <span>AI 추천</span>
        </div>
      </div>

      <div className="recommendation-tabs">
        <button
          className={`tab-btn ${activeTab === 'reading' ? 'active' : ''}`}
          onClick={() => setActiveTab('reading')}
        >
          다음 읽기
        </button>
        <button
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          추천 자료
        </button>
        <button
          className={`tab-btn ${activeTab === 'reflection' ? 'active' : ''}`}
          onClick={() => setActiveTab('reflection')}
        >
          묵상 주제
        </button>
      </div>

      <div className="recommendation-content">
        {activeTab === 'reading' && (
          <div className="next-reading">
            <div className="reading-card">
              <div className="reading-info">
                <h4>{recommendations.nextReading.book} {recommendations.nextReading.chapter}장</h4>
                <p className="reading-reason">{recommendations.nextReading.reason}</p>
                <div className="reading-meta">
                  <Icon name="clock" size="sm" />
                  <span>약 {recommendations.nextReading.estimatedTime}분</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRecommendationClick('reading')}
              >
                <Icon name="play" size="sm" />
                읽기 시작
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="recommended-resources">
            {recommendations.resources.slice(0, 3).map(resource => (
              <div
                key={resource.id}
                className="resource-card"
                onClick={() => onRecommendationClick('resource', resource.id)}
              >
                {resource.thumbnail && (
                  <div className="resource-thumbnail">
                    <img src={resource.thumbnail} alt={resource.title} />
                  </div>
                )}
                <div className="resource-info">
                  <h5>{resource.title}</h5>
                  <p className="resource-author">{resource.author}</p>
                  <p className="resource-reason">{resource.reason}</p>
                  <div className="match-score">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${resource.matchScore}%` }}
                      />
                    </div>
                    <span className="score-text">{resource.matchScore}% 매치</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reflection' && (
          <div className="reflection-prompts">
            {recommendations.reflectionPrompts.map((prompt, index) => (
              <div key={index} className="prompt-card">
                <div className="prompt-icon">💭</div>
                <p className="prompt-text">{prompt}</p>
                <button
                  className="prompt-action"
                  onClick={() => onRecommendationClick('reflection', index.toString())}
                >
                  묵상하기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recommendation-footer">
        <button className="refresh-btn">
          <Icon name="refreshCw" size="sm" />
          새로고침
        </button>
        <button className="feedback-btn">
          <Icon name="thumbsUp" size="sm" />
          도움됨
        </button>
      </div>
    </Card>
  );
};
```

### **3-2. 인기 콘텐츠 슬라이더**

```typescript
interface PopularContentWidgetProps {
  popularContent: {
    trending: {
      id: string;
      title: string;
      author: string;
      viewCount: number;
      likeCount: number;
      category: string;
      thumbnail?: string;
      trendingRank: number;
    }[];
    mostLiked: {
      id: string;
      title: string;
      author: string;
      likeCount: number;
      category: string;
      thumbnail?: string;
    }[];
    recentlyAdded: {
      id: string;
      title: string;
      author: string;
      createdAt: Date;
      category: string;
      thumbnail?: string;
    }[];
  };
  onContentClick: (contentId: string) => void;
}

const PopularContentWidget: React.FC<PopularContentWidgetProps> = ({
  popularContent,
  onContentClick
}) => {
  const [activeCategory, setActiveCategory] = useState<'trending' | 'mostLiked' | 'recentlyAdded'>('trending');
  const [currentSlide, setCurrentSlide] = useState(0);

  const getCurrentContent = () => {
    return popularContent[activeCategory];
  };

  const nextSlide = () => {
    const content = getCurrentContent();
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(content.length / 2));
  };

  const prevSlide = () => {
    const content = getCurrentContent();
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(content.length / 2)) % Math.ceil(content.length / 2));
  };

  return (
    <Card className="popular-content-widget full-width-widget" padding="lg">
      <div className="widget-header">
        <h3>🔥 인기 자료</h3>
        <div className="category-selector">
          <button
            className={`category-btn ${activeCategory === 'trending' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('trending');
              setCurrentSlide(0);
            }}
          >
            🔥 트렌딩
          </button>
          <button
            className={`category-btn ${activeCategory === 'mostLiked' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('mostLiked');
              setCurrentSlide(0);
            }}
          >
            ❤️ 인기
          </button>
          <button
            className={`category-btn ${activeCategory === 'recentlyAdded' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('recentlyAdded');
              setCurrentSlide(0);
            }}
          >
            ✨ 최신
          </button>
        </div>
      </div>

      <div className="content-slider">
        <div className="slider-controls">
          <button className="slider-btn prev" onClick={prevSlide}>
            <Icon name="chevronLeft" size="sm" />
          </button>
          <button className="slider-btn next" onClick={nextSlide}>
            <Icon name="chevronRight" size="sm" />
          </button>
        </div>

        <div className="slider-container">
          <div
            className="slider-track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`
            }}
          >
            {Array.from(
              { length: Math.ceil(getCurrentContent().length / 2) },
              (_, slideIndex) => (
                <div key={slideIndex} className="slide">
                  {getCurrentContent()
                    .slice(slideIndex * 2, slideIndex * 2 + 2)
                    .map((item: any) => (
                      <div
                        key={item.id}
                        className="content-card"
                        onClick={() => onContentClick(item.id)}
                      >
                        {item.thumbnail && (
                          <div className="content-thumbnail">
                            <img src={item.thumbnail} alt={item.title} />
                            {activeCategory === 'trending' && item.trendingRank && (
                              <div className="trending-badge">
                                #{item.trendingRank}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="content-info">
                          <h4 className="content-title">{item.title}</h4>
                          <p className="content-author">{item.author}</p>
                          <span className="content-category">{item.category}</span>

                          <div className="content-stats">
                            {activeCategory === 'trending' && (
                              <>
                                <div className="stat">
                                  <Icon name="eye" size="xs" />
                                  <span>{item.viewCount.toLocaleString()}</span>
                                </div>
                                <div className="stat">
                                  <Icon name="heart" size="xs" />
                                  <span>{item.likeCount}</span>
                                </div>
                              </>
                            )}

                            {activeCategory === 'mostLiked' && (
                              <div className="stat">
                                <Icon name="heart" size="xs" />
                                <span>{item.likeCount} 좋아요</span>
                              </div>
                            )}

                            {activeCategory === 'recentlyAdded' && (
                              <div className="stat">
                                <Icon name="clock" size="xs" />
                                <span>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            )}
          </div>
        </div>

        <div className="slider-indicators">
          {Array.from(
            { length: Math.ceil(getCurrentContent().length / 2) },
            (_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            )
          )}
        </div>
      </div>
    </Card>
  );
};
```

---

## 🗓️ **4. 성경 읽기 캘린더**

### **4-1. 월간 캘린더 위젯**

```typescript
interface BibleCalendarWidgetProps {
  calendarData: {
    currentMonth: Date;
    completedDays: Date[];
    readingPlan: {
      [key: string]: {
        book: string;
        chapters: number[];
        completed: boolean;
      };
    };
    streakDays: Date[];
    goals: {
      monthlyTarget: number;
      currentProgress: number;
    };
  };
  onDateClick: (date: Date) => void;
  onPlanChange: (newPlan: any) => void;
}

const BibleCalendarWidget: React.FC<BibleCalendarWidgetProps> = ({
  calendarData,
  onDateClick,
  onPlanChange
}) => {
  const [currentMonth, setCurrentMonth] = useState(calendarData.currentMonth);
  const [viewMode, setViewMode] = useState<'month' | 'plan'>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isCompleted = calendarData.completedDays.some(
      d => d.toISOString().split('T')[0] === dateStr
    );
    const isStreak = calendarData.streakDays.some(
      d => d.toISOString().split('T')[0] === dateStr
    );
    const hasReading = calendarData.readingPlan[dateStr];
    const isToday = new Date().toDateString() === date.toDateString();
    const isFuture = date > new Date();

    return {
      isCompleted,
      isStreak,
      hasReading,
      isToday,
      isFuture
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Card className="bible-calendar-widget full-width-widget" padding="lg">
      <div className="widget-header">
        <div className="header-left">
          <h3>🗓️ 성경 읽기 캘린더</h3>
          <div className="progress-info">
            <span>{calendarData.goals.currentProgress}/{calendarData.goals.monthlyTarget}일 완료</span>
          </div>
        </div>

        <div className="header-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              달력
            </button>
            <button
              className={`toggle-btn ${viewMode === 'plan' ? 'active' : ''}`}
              onClick={() => setViewMode('plan')}
            >
              계획
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' && (
        <div className="calendar-view">
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={() => navigateMonth('prev')}>
              <Icon name="chevronLeft" size="sm" />
            </button>
            <h4 className="current-month">
              {currentMonth.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long'
              })}
            </h4>
            <button className="nav-btn" onClick={() => navigateMonth('next')}>
              <Icon name="chevronRight" size="sm" />
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="days-grid">
              {days.map((day, index) => {
                const status = getDayStatus(day.date);
                return (
                  <button
                    key={index}
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''}
                      ${status.isToday ? 'today' : ''}
                      ${status.isCompleted ? 'completed' : ''}
                      ${status.isStreak ? 'streak' : ''}
                      ${status.isFuture ? 'future' : ''}
                    `}
                    onClick={() => onDateClick(day.date)}
                    disabled={status.isFuture}
                  >
                    <span className="day-number">{day.date.getDate()}</span>
                    {status.hasReading && (
                      <div className="reading-indicator">
                        <Icon name="book" size="xs" />
                      </div>
                    )}
                    {status.isCompleted && (
                      <div className="completion-badge">✓</div>
                    )}
                    {status.isStreak && (
                      <div className="streak-indicator">🔥</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color completed"></div>
              <span>완료</span>
            </div>
            <div className="legend-item">
              <div className="legend-color streak"></div>
              <span>연속</span>
            </div>
            <div className="legend-item">
              <div className="legend-color today"></div>
              <span>오늘</span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'plan' && (
        <div className="plan-view">
          <div className="plan-header">
            <h4>이번 달 읽기 계획</h4>
            <button className="edit-plan-btn">
              <Icon name="edit" size="sm" />
              계획 수정
            </button>
          </div>

          <div className="plan-list">
            {Object.entries(calendarData.readingPlan)
              .filter(([date]) => {
                const planDate = new Date(date);
                return planDate.getMonth() === currentMonth.getMonth() &&
                       planDate.getFullYear() === currentMonth.getFullYear();
              })
              .map(([date, plan]) => (
                <div key={date} className={`plan-item ${plan.completed ? 'completed' : ''}`}>
                  <div className="plan-date">
                    {new Date(date).getDate()}일
                  </div>
                  <div className="plan-content">
                    <span className="plan-book">{plan.book}</span>
                    <span className="plan-chapters">
                      {plan.chapters.join(', ')}장
                    </span>
                  </div>
                  <div className="plan-status">
                    {plan.completed ? (
                      <Icon name="checkCircle" size="sm" className="completed-icon" />
                    ) : (
                      <Icon name="circle" size="sm" className="pending-icon" />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
};
```

---

## 🏆 **5. 성취 및 동기부여 시스템**

### **5-1. 성취 뱃지 위젯**

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'reading' | 'streak' | 'community' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  reward?: {
    type: 'badge' | 'title' | 'feature';
    value: string;
  };
}

interface AchievementWidgetProps {
  achievements: Achievement[];
  userLevel: {
    current: number;
    experience: number;
    nextLevelExp: number;
    title: string;
  };
  leaderboard: {
    rank: number;
    totalUsers: number;
    topUsers: {
      name: string;
      level: number;
      score: number;
    }[];
  };
}

const AchievementWidget: React.FC<AchievementWidgetProps> = ({
  achievements,
  userLevel,
  leaderboard
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'level' | 'leaderboard'>('achievements');

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const inProgressAchievements = achievements
    .filter(a => !a.unlockedAt && a.progress > 0)
    .sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress));

  const levelProgress = (userLevel.experience / userLevel.nextLevelExp) * 100;

  return (
    <Card className="achievement-widget" padding="lg">
      <div className="widget-header">
        <h3>🏆 성취 & 레벨</h3>
        <div className="user-level-badge">
          <Icon name="star" size="sm" />
          <span>Lv.{userLevel.current} {userLevel.title}</span>
        </div>
      </div>

      <div className="achievement-tabs">
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          뱃지
        </button>
        <button
          className={`tab-btn ${activeTab === 'level' ? 'active' : ''}`}
          onClick={() => setActiveTab('level')}
        >
          레벨
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          순위
        </button>
      </div>

      <div className="achievement-content">
        {activeTab === 'achievements' && (
          <div className="achievements-view">
            <div className="achievement-stats">
              <div className="stat">
                <span className="value">{unlockedAchievements.length}</span>
                <span className="label">획득</span>
              </div>
              <div className="stat">
                <span className="value">{inProgressAchievements.length}</span>
                <span className="label">진행중</span>
              </div>
              <div className="stat">
                <span className="value">{achievements.length}</span>
                <span className="label">전체</span>
              </div>
            </div>

            <div className="achievement-sections">
              {unlockedAchievements.length > 0 && (
                <div className="achievement-section">
                  <h5>🎉 획득한 뱃지</h5>
                  <div className="achievement-grid">
                    {unlockedAchievements.slice(0, 6).map(achievement => (
                      <div key={achievement.id} className={`achievement-item unlocked ${achievement.difficulty}`}>
                        <div className="achievement-icon">{achievement.icon}</div>
                        <div className="achievement-info">
                          <h6>{achievement.title}</h6>
                          <p>{achievement.description}</p>
                          <span className="unlock-date">
                            {achievement.unlockedAt && formatDistanceToNow(achievement.unlockedAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inProgressAchievements.length > 0 && (
                <div className="achievement-section">
                  <h5>⏳ 진행중인 목표</h5>
                  <div className="achievement-list">
                    {inProgressAchievements.slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="achievement-progress-item">
                        <div className="achievement-icon">{achievement.icon}</div>
                        <div className="achievement-details">
                          <h6>{achievement.title}</h6>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                            <span className="progress-text">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'level' && (
          <div className="level-view">
            <div className="level-display">
              <div className="level-circle">
                <svg viewBox="0 0 100 100" className="level-progress-ring">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="var(--border-primary)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="var(--accent-primary)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${levelProgress * 2.83} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="level-info">
                  <span className="level-number">{userLevel.current}</span>
                  <span className="level-title">{userLevel.title}</span>
                </div>
              </div>
            </div>

            <div className="level-details">
              <div className="exp-info">
                <span>경험치: {userLevel.experience.toLocaleString()} / {userLevel.nextLevelExp.toLocaleString()}</span>
                <span>다음 레벨까지: {(userLevel.nextLevelExp - userLevel.experience).toLocaleString()} EXP</span>
              </div>

              <div className="level-benefits">
                <h6>현재 레벨 혜택</h6>
                <ul>
                  <li>📚 모든 성경 자료 접근</li>
                  <li>💬 댓글 작성 권한</li>
                  <li>🎯 개인화 추천 기능</li>
                  {userLevel.current >= 5 && <li>⭐ 특별 뱃지 표시</li>}
                  {userLevel.current >= 10 && <li>🏆 리더보드 순위 표시</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-view">
            <div className="user-rank">
              <div className="rank-display">
                <span className="rank-number">#{leaderboard.rank}</span>
                <span className="rank-total">/ {leaderboard.totalUsers.toLocaleString()}</span>
              </div>
              <span className="rank-label">나의 순위</span>
            </div>

            <div className="top-users">
              <h6>상위 사용자</h6>
              {leaderboard.topUsers.map((user, index) => (
                <div key={index} className="user-row">
                  <div className="user-rank">
                    <span className={`rank-badge ${index < 3 ? 'top-three' : ''}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-level">Lv.{user.level}</span>
                  </div>
                  <div className="user-score">
                    {user.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
```

---

## 📱 **6. 빠른 액션 위젯**

### **6-1. 원클릭 액션 버튼**

```typescript
interface QuickActionWidgetProps {
  actions: {
    continueReading?: {
      book: string;
      chapter: number;
      progress: number;
    };
    todayPlan?: {
      books: string[];
      totalChapters: number;
      completed: number;
    };
    recentResources?: {
      id: string;
      title: string;
      lastAccessed: Date;
    }[];
  };
  onActionClick: (action: string, data?: any) => void;
}

const QuickActionWidget: React.FC<QuickActionWidgetProps> = ({
  actions,
  onActionClick
}) => {
  return (
    <Card className="quick-action-widget" padding="lg">
      <div className="widget-header">
        <h3>⚡ 빠른 시작</h3>
      </div>

      <div className="action-grid">
        {/* Continue Reading */}
        {actions.continueReading && (
          <button
            className="action-card primary"
            onClick={() => onActionClick('continueReading', actions.continueReading)}
          >
            <div className="action-icon">
              <Icon name="play" size="lg" />
            </div>
            <div className="action-content">
              <h4>읽기 계속하기</h4>
              <p>{actions.continueReading.book} {actions.continueReading.chapter}장</p>
              <div className="action-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${actions.continueReading.progress}%` }}
                  />
                </div>
                <span>{actions.continueReading.progress}% 완료</span>
              </div>
            </div>
          </button>
        )}

        {/* Today's Plan */}
        {actions.todayPlan && (
          <button
            className="action-card secondary"
            onClick={() => onActionClick('todayPlan', actions.todayPlan)}
          >
            <div className="action-icon">
              <Icon name="target" size="lg" />
            </div>
            <div className="action-content">
              <h4>오늘의 계획</h4>
              <p>{actions.todayPlan.books.join(', ')}</p>
              <div className="action-stats">
                <span>{actions.todayPlan.completed}/{actions.todayPlan.totalChapters} 장 완료</span>
              </div>
            </div>
          </button>
        )}

        {/* Random Verse */}
        <button
          className="action-card accent"
          onClick={() => onActionClick('randomVerse')}
        >
          <div className="action-icon">
            <Icon name="shuffle" size="lg" />
          </div>
          <div className="action-content">
            <h4>오늘의 말씀</h4>
            <p>랜덤 구절 보기</p>
          </div>
        </button>

        {/* Upload Resource */}
        <button
          className="action-card info"
          onClick={() => onActionClick('uploadResource')}
        >
          <div className="action-icon">
            <Icon name="upload" size="lg" />
          </div>
          <div className="action-content">
            <h4>자료 업로드</h4>
            <p>새 자료 등록</p>
          </div>
        </button>

        {/* Community */}
        <button
          className="action-card community"
          onClick={() => onActionClick('community')}
        >
          <div className="action-icon">
            <Icon name="users" size="lg" />
          </div>
          <div className="action-content">
            <h4>커뮤니티</h4>
            <p>최근 댓글 보기</p>
          </div>
        </button>

        {/* Settings */}
        <button
          className="action-card settings"
          onClick={() => onActionClick('settings')}
        >
          <div className="action-icon">
            <Icon name="settings" size="lg" />
          </div>
          <div className="action-content">
            <h4>설정</h4>
            <p>환경 설정</p>
          </div>
        </button>
      </div>

      {/* Recent Resources */}
      {actions.recentResources && actions.recentResources.length > 0 && (
        <div className="recent-section">
          <h5>📚 최근 본 자료</h5>
          <div className="recent-list">
            {actions.recentResources.slice(0, 3).map(resource => (
              <button
                key={resource.id}
                className="recent-item"
                onClick={() => onActionClick('openResource', resource)}
              >
                <Icon name="fileText" size="sm" />
                <div className="recent-info">
                  <span className="recent-title">{resource.title}</span>
                  <span className="recent-time">
                    {formatDistanceToNow(resource.lastAccessed, { addSuffix: true })}
                  </span>
                </div>
                <Icon name="chevronRight" size="sm" />
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
```

---

## 💬 **7. 커뮤니티 활동 피드**

### **7-1. 실시간 활동 피드**

```typescript
interface CommunityFeedWidgetProps {
  activities: {
    id: string;
    type: 'comment' | 'highlight' | 'achievement' | 'reading_complete';
    user: {
      name: string;
      avatar?: string;
      level: number;
    };
    content: {
      title: string;
      excerpt?: string;
      resourceId?: string;
      resourceTitle?: string;
    };
    timestamp: Date;
    interactions: {
      likes: number;
      replies: number;
    };
  }[];
  onActivityClick: (activityId: string) => void;
  onUserClick: (userId: string) => void;
}

const CommunityFeedWidget: React.FC<CommunityFeedWidgetProps> = ({
  activities,
  onActivityClick,
  onUserClick
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return 'messageCircle';
      case 'highlight': return 'star';
      case 'achievement': return 'trophy';
      case 'reading_complete': return 'bookOpen';
      default: return 'activity';
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'comment':
        return `${activity.content.resourceTitle}에 댓글을 남겼습니다`;
      case 'highlight':
        return `새로운 구절을 하이라이트했습니다`;
      case 'achievement':
        return `새로운 뱃지를 획득했습니다: ${activity.content.title}`;
      case 'reading_complete':
        return `${activity.content.title}을 완독했습니다`;
      default:
        return activity.content.title;
    }
  };

  return (
    <Card className="community-feed-widget" padding="lg">
      <div className="widget-header">
        <h3>💬 커뮤니티 활동</h3>
        <button className="refresh-btn">
          <Icon name="refreshCw" size="sm" />
        </button>
      </div>

      <div className="activity-feed">
        {activities.length === 0 ? (
          <div className="empty-feed">
            <Icon name="users" size="xl" />
            <h4>아직 활동이 없습니다</h4>
            <p>첫 번째로 활동을 시작해보세요!</p>
          </div>
        ) : (
          activities.map(activity => (
            <div
              key={activity.id}
              className="activity-item"
              onClick={() => onActivityClick(activity.id)}
            >
              <div className="activity-avatar">
                {activity.user.avatar ? (
                  <img src={activity.user.avatar} alt={activity.user.name} />
                ) : (
                  <div className="default-avatar">
                    {activity.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="user-level-badge">
                  {activity.user.level}
                </div>
              </div>

              <div className="activity-content">
                <div className="activity-header">
                  <button
                    className="user-name"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserClick(activity.user.name);
                    }}
                  >
                    {activity.user.name}
                  </button>
                  <div className="activity-type">
                    <Icon name={getActivityIcon(activity.type)} size="sm" />
                  </div>
                  <span className="activity-time">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>

                <div className="activity-text">
                  {getActivityText(activity)}
                </div>

                {activity.content.excerpt && (
                  <div className="activity-excerpt">
                    "{activity.content.excerpt}"
                  </div>
                )}

                <div className="activity-interactions">
                  <div className="interaction">
                    <Icon name="heart" size="sm" />
                    <span>{activity.interactions.likes}</span>
                  </div>
                  {activity.interactions.replies > 0 && (
                    <div className="interaction">
                      <Icon name="messageCircle" size="sm" />
                      <span>{activity.interactions.replies}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="feed-footer">
          <Button variant="ghost" size="sm" fullWidth>
            더 많은 활동 보기
          </Button>
        </div>
      )}
    </Card>
  );
};
```

---

## 📱 **8. 반응형 및 모바일 최적화**

### **8-1. 모바일 대시보드 레이아웃**

```typescript
const MobileDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState([
    'header',
    'quickActions',
    'readingProgress',
    'streak',
    'recommendations',
    'calendar',
    'achievements',
    'community'
  ]);

  const [isCustomizing, setIsCustomizing] = useState(false);

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, removed);
    setWidgets(newWidgets);
  };

  return (
    <div className="mobile-dashboard">
      <div className="mobile-header">
        <h1>📱 홈</h1>
        <button
          className="customize-btn"
          onClick={() => setIsCustomizing(!isCustomizing)}
        >
          <Icon name="settings" size="sm" />
        </button>
      </div>

      {isCustomizing && (
        <div className="customization-panel">
          <h4>위젯 순서 변경</h4>
          <p>드래그하여 순서를 변경하세요</p>
        </div>
      )}

      <div className="mobile-widgets">
        {widgets.map((widgetType, index) => (
          <div
            key={widgetType}
            className={`mobile-widget ${widgetType} ${isCustomizing ? 'customizable' : ''}`}
          >
            {isCustomizing && (
              <div className="widget-controls">
                <button className="drag-handle">
                  <Icon name="gripVertical" size="sm" />
                </button>
                <button className="remove-widget">
                  <Icon name="x" size="sm" />
                </button>
              </div>
            )}

            {/* Widget content based on type */}
            {widgetType === 'header' && <PersonalizedHeader {...headerProps} />}
            {widgetType === 'quickActions' && <QuickActionWidget {...quickActionProps} />}
            {widgetType === 'readingProgress' && <ReadingProgressWidget {...progressProps} />}
            {/* ... other widgets */}
          </div>
        ))}
      </div>

      {/* Add Widget Button */}
      {isCustomizing && (
        <button className="add-widget-btn">
          <Icon name="plus" size="sm" />
          위젯 추가
        </button>
      )}
    </div>
  );
};
```

### **8-2. 반응형 CSS**

```css
/* Mobile Dashboard Styles */
@media (max-width: 768px) {
  .dashboard-layout {
    display: block;
    padding: 0;
  }

  .mobile-dashboard {
    padding: 1rem 0.5rem;
    gap: 0.75rem;
  }

  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0.5rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .mobile-widget {
    margin-bottom: 0.75rem;
    position: relative;
  }

  .mobile-widget.customizable {
    border: 2px dashed var(--border-primary);
    border-radius: 8px;
  }

  .widget-controls {
    position: absolute;
    top: -10px;
    right: -10px;
    display: flex;
    gap: 0.25rem;
    z-index: 10;
  }

  .drag-handle,
  .remove-widget {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent-primary);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  /* Widget-specific mobile styles */
  .personalized-header {
    padding: 1rem;
  }

  .info-strip {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
  }

  .quick-stats {
    justify-content: center;
    margin-top: 1rem;
  }

  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .action-card {
    padding: 1rem 0.75rem;
    text-align: center;
  }

  .action-content h4 {
    font-size: 0.875rem;
  }

  .calendar-grid {
    font-size: 0.875rem;
  }

  .calendar-day {
    min-height: 36px;
  }

  .achievement-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .activity-item {
    padding: 0.75rem;
  }

  .activity-avatar {
    width: 32px;
    height: 32px;
  }

  /* Touch-friendly sizing */
  .action-card,
  .calendar-day,
  .tab-btn,
  .metric-btn {
    min-height: 44px;
    min-width: 44px;
  }

  /* Simplified charts for mobile */
  .chart-container {
    height: 150px;
  }

  .progress-circle {
    max-width: 80px;
    max-height: 80px;
  }
}

/* Progressive Enhancement */
@media (max-width: 480px) {
  .mobile-dashboard {
    padding: 0.5rem 0.25rem;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .calendar-grid {
    font-size: 0.75rem;
  }

  .calendar-day {
    min-height: 32px;
  }
}
```

---

## ✅ **구현 체크리스트**

### **개인화 헤더**

- [ ] 동적 환영 메시지 시스템
- [ ] 실시간 시간/날씨 정보
- [ ] 오늘의 말씀 표시
- [ ] 스마트 알림 시스템
- [ ] 사용자 맞춤 통계

### **진도 및 통계 위젯**

- [ ] 원형 진도 차트 (SVG)
- [ ] 연속 기록 시각화
- [ ] 주간 통계 막대 차트
- [ ] 오늘의 목표 진행률
- [ ] 애니메이션 효과

### **추천 시스템**

- [ ] AI 기반 개인화 추천
- [ ] 인기 콘텐츠 슬라이더
- [ ] 카테고리별 필터링
- [ ] 매치 스코어 표시
- [ ] 새로고침 기능

### **캘린더 위젯**

- [ ] 월간 캘린더 뷰
- [ ] 완료 상태 시각화
- [ ] 읽기 계획 표시
- [ ] 연속 기록 표시
- [ ] 반응형 그리드

### **성취 시스템**

- [ ] 뱃지 시스템
- [ ] 레벨 및 경험치
- [ ] 리더보드
- [ ] 진행률 추적
- [ ] 보상 시스템

### **커뮤니티 피드**

- [ ] 실시간 활동 피드
- [ ] 사용자 프로필 연동
- [ ] 상호작용 통계
- [ ] 댓글/하이라이트 표시
- [ ] 자동 새로고침

### **빠른 액션**

- [ ] 원클릭 읽기 시작
- [ ] 최근 자료 접근
- [ ] 업로드 바로가기
- [ ] 설정 바로가기
- [ ] 커뮤니티 바로가기

### **반응형 최적화**

- [ ] 모바일 위젯 재배열
- [ ] 터치 친화적 인터페이스
- [ ] 위젯 커스터마이징
- [ ] 스와이프 제스처
- [ ] 점진적 향상

---

## 🎯 **최종 완성**

홈 대시보드 페이지 설계가 완료되면, **성경자료실 플랫폼의 5개 핵심 페이지 설계**가 모두 완성됩니다:

1. ✅ **00-전체아키텍처-PRD.md** - 기술 기반 구축
2. ✅ **05-공통시스템-PRD.md** - 디자인 시스템 & 컴포넌트
3. ✅ **02-성경읽기-PRD.md** - 핵심 MVP 기능
4. ✅ **04-데이터관리-PRD.md** - 관리자 도구
5. ✅ **03-성경자료실-PRD.md** - 콘텐츠 제작 허브
6. ✅ **01-HOME-PRD.md** - 통합 대시보드 (현재)

---

**📋 문서 상태**: ✅ **완료** - HOME 대시보드 페이지 상세 설계 확정  
**🏠 핵심 기능**: 개인화 대시보드 + AI 추천 + 성취 시스템  
**📊 사용자 경험**: 데이터 기반 인사이트 + 동기부여 플랫폼  
**🎉 프로젝트 상태**: **전체 PRD 설계 100% 완성!**
