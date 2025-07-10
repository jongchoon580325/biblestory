# 📋 02-성경읽기-PRD.md

## 🎯 **문서 개요**

### **문서명**: 성경읽기 페이지 상세 설계서

### **버전**: v1.0.0

### **작성일**: 2025.07.08

### **최종 수정일**: 2025.07.08

### **의존성**: 00-전체아키텍처-PRD.md, 05-공통시스템-PRD.md

---

## 📚 **기능 개요**

> **"몰입형 성경 읽기 경험을 제공하는 차세대 디지털 성경 플랫폼의 핵심 MVP"**

### **핵심 가치 제안**

- **Progressive Reading**: 구약→책→장 단계별 선택으로 자연스러운 읽기 흐름
- **Multi-Modal Experience**: 읽기와 듣기를 완벽하게 통합한 멀티모달 경험
- **Personal Progress**: 개인화된 읽기 진도 추적과 완료 체크 시스템
- **Flexible Display**: 3가지 읽기 모드로 개인 선호에 맞춘 최적화
- **Smart Highlights**: 개인/커뮤니티 하이라이트로 풍부한 묵상 지원

---

## 🏗️ **페이지 아키텍처**

### **전체 레이아웃 구조**

```
┌─────────────────────────────────────────────────────────┐
│  📊 Progress Bar (읽기 진행률 표시)                      │
├─────────────────┬───────────────────────────────────────┤
│                 │  🔗 Breadcrumb (구약 > 창세기 > 1장)    │
│  📋 Navigation  │  📖 Chapter Title & Meta Info          │
│  Sidebar        ├───────────────────────────────────────┤
│                 │  🎵 Audio Player Controls              │
│  📖 Books       ├───────────────────────────────────────┤
│  📊 Chapters    │  ⚙️ Reading Mode Controls              │
│  📈 Progress    ├───────────────────────────────────────┤
│                 │                                       │
│                 │  📜 Bible Content                     │
│                 │  (Main Reading Area)                  │
│                 │                                       │
│                 │  ✅ Verse Interactions                │
│                 │  (Highlights, Notes)                  │
└─────────────────┴───────────────────────────────────────┘
```

### **반응형 레이아웃 전략**

```css
/* Desktop (1024px+) */
.bible-reading-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Tablet (768px - 1023px) */
@media (max-width: 1023px) {
  .bible-reading-layout {
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .bible-reading-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .navigation-sidebar {
    order: 2; /* 모바일에서는 하단으로 이동 */
    position: sticky;
    bottom: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-primary);
  }
}
```

---

## 🎮 **1. 네비게이션 시스템**

### **좌측 사이드바 구성**

#### **1-1. 신/구약 토글 스위치**

```typescript
interface TestamentToggleProps {
  activeTestament: 'old' | 'new';
  onToggle: (testament: 'old' | 'new') => void;
}

const TestamentToggle: React.FC<TestamentToggleProps> = ({
  activeTestament,
  onToggle
}) => {
  return (
    <div className="testament-toggle">
      <button
        className={`toggle-btn ${activeTestament === 'old' ? 'active' : ''}`}
        onClick={() => onToggle('old')}
        aria-label="구약 성경 선택"
      >
        구약 (39권)
      </button>
      <button
        className={`toggle-btn ${activeTestament === 'new' ? 'active' : ''}`}
        onClick={() => onToggle('new')}
        aria-label="신약 성경 선택"
      >
        신약 (27권)
      </button>
    </div>
  );
};
```

#### **1-2. 성경 책 선택 시스템**

```typescript
interface BibleBook {
  id: string;
  name: string;
  nameEnglish: string;
  abbreviation: string;
  totalChapters: number;
  category: 'old-testament' | 'new-testament';
  completedChapters: number;
  currentChapter?: number;
}

interface BookSelectorProps {
  testament: 'old' | 'new';
  books: BibleBook[];
  selectedBook?: BibleBook;
  onBookSelect: (book: BibleBook) => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({
  testament,
  books,
  selectedBook,
  onBookSelect
}) => {
  const filteredBooks = books.filter(book =>
    book.category === `${testament}-testament`
  );

  return (
    <div className="book-selector">
      <h3 className="section-title">
        {testament === 'old' ? '구약 성경' : '신약 성경'}
      </h3>

      <div className="book-grid">
        {filteredBooks.map(book => {
          const completionRate = (book.completedChapters / book.totalChapters) * 100;

          return (
            <button
              key={book.id}
              className={`book-card ${selectedBook?.id === book.id ? 'selected' : ''}`}
              onClick={() => onBookSelect(book)}
              aria-label={`${book.name} ${book.totalChapters}장`}
            >
              <div className="book-name">{book.name}</div>
              <div className="book-meta">{book.totalChapters}장</div>
              <div className="book-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="completion-badge">
                {book.completedChapters}/{book.totalChapters}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

#### **1-3. 장(Chapter) 선택 네비게이션**

```typescript
interface ChapterNavigatorProps {
  selectedBook: BibleBook;
  currentChapter: number;
  readingProgress: Record<number, {
    readingCompleted: boolean;
    listeningCompleted: boolean;
    completionPercentage: number;
  }>;
  onChapterSelect: (chapterNumber: number) => void;
}

const ChapterNavigator: React.FC<ChapterNavigatorProps> = ({
  selectedBook,
  currentChapter,
  readingProgress,
  onChapterSelect
}) => {
  const chapters = Array.from(
    { length: selectedBook.totalChapters },
    (_, i) => i + 1
  );

  return (
    <div className="chapter-navigator">
      <h4 className="navigator-title">
        📖 {selectedBook.name}
      </h4>

      <div className="chapter-grid">
        {chapters.map(chapterNum => {
          const progress = readingProgress[chapterNum];
          const isCompleted = progress?.readingCompleted || progress?.listeningCompleted;
          const isCurrent = chapterNum === currentChapter;

          return (
            <button
              key={chapterNum}
              className={`
                chapter-btn
                ${isCurrent ? 'current' : ''}
                ${isCompleted ? 'completed' : ''}
              `}
              onClick={() => onChapterSelect(chapterNum)}
              aria-label={`${chapterNum}장 ${isCompleted ? '완료' : '미완료'}`}
            >
              <span className="chapter-number">{chapterNum}</span>
              {isCompleted && (
                <div className="completion-indicator">
                  {progress.readingCompleted && <Icon name="book" size="xs" />}
                  {progress.listeningCompleted && <Icon name="volume" size="xs" />}
                </div>
              )}
              {progress?.completionPercentage && (
                <div
                  className="progress-ring"
                  style={{
                    background: `conic-gradient(
                      var(--accent-primary) ${progress.completionPercentage * 3.6}deg,
                      var(--border-primary) 0deg
                    )`
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Jump Controls */}
      <div className="quick-jump">
        <button
          className="nav-btn"
          onClick={() => onChapterSelect(Math.max(1, currentChapter - 1))}
          disabled={currentChapter <= 1}
          aria-label="이전 장"
        >
          <Icon name="chevronLeft" /> 이전
        </button>
        <button
          className="nav-btn"
          onClick={() => onChapterSelect(Math.min(selectedBook.totalChapters, currentChapter + 1))}
          disabled={currentChapter >= selectedBook.totalChapters}
          aria-label="다음 장"
        >
          다음 <Icon name="chevronRight" />
        </button>
      </div>
    </div>
  );
};
```

#### **1-4. 개인 진도 대시보드**

```typescript
interface ProgressDashboardProps {
  dailyGoal: {
    readingMinutes: number;
    listeningMinutes: number;
  };
  todayProgress: {
    readingMinutes: number;
    listeningMinutes: number;
    chaptersCompleted: number;
    streak: number;
  };
  weeklyStats: {
    totalChapters: number;
    averageTime: number;
    favoriteBooks: string[];
  };
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  dailyGoal,
  todayProgress,
  weeklyStats
}) => {
  const readingProgress = (todayProgress.readingMinutes / dailyGoal.readingMinutes) * 100;
  const listeningProgress = (todayProgress.listeningMinutes / dailyGoal.listeningMinutes) * 100;

  return (
    <div className="progress-dashboard">
      <h4 className="dashboard-title">📊 오늘의 진도</h4>

      {/* Daily Goals */}
      <div className="daily-goals">
        <div className="goal-item">
          <div className="goal-header">
            <Icon name="bookOpen" size="sm" />
            <span>읽기</span>
          </div>
          <div className="goal-progress">
            <div className="progress-bar">
              <div
                className="progress-fill reading"
                style={{ width: `${Math.min(readingProgress, 100)}%` }}
              />
            </div>
            <span className="progress-text">
              {todayProgress.readingMinutes}분 / {dailyGoal.readingMinutes}분
            </span>
          </div>
        </div>

        <div className="goal-item">
          <div className="goal-header">
            <Icon name="volume" size="sm" />
            <span>듣기</span>
          </div>
          <div className="goal-progress">
            <div className="progress-bar">
              <div
                className="progress-fill listening"
                style={{ width: `${Math.min(listeningProgress, 100)}%` }}
              />
            </div>
            <span className="progress-text">
              {todayProgress.listeningMinutes}분 / {dailyGoal.listeningMinutes}분
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{todayProgress.chaptersCompleted}</div>
          <div className="stat-label">완독 장</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">🔥 {todayProgress.streak}</div>
          <div className="stat-label">연속일</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{weeklyStats.totalChapters}</div>
          <div className="stat-label">주간 완독</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements">
        <h5>🏆 이번 주 성과</h5>
        <div className="achievement-list">
          {weeklyStats.favoriteBooks.map(book => (
            <div key={book} className="achievement-badge">
              📖 {book} 마스터
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 🎵 **2. 오디오 시스템 (TTS 통합)**

### **2-1. 오디오 플레이어 컴포넌트**

```typescript
interface AudioPlayerState {
  isPlaying: boolean;
  currentVerse: number;
  totalVerses: number;
  currentTime: number;
  totalTime: number;
  playbackRate: number;
  volume: number;
  isLoading: boolean;
}

interface AudioPlayerProps {
  verses: BibleVerse[];
  initialSettings: {
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
  };
  onVerseChange: (verseIndex: number) => void;
  onProgressUpdate: (progress: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  verses,
  initialSettings,
  onVerseChange,
  onProgressUpdate
}) => {
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentVerse: 0,
    totalVerses: verses.length,
    currentTime: 0,
    totalTime: 0,
    playbackRate: initialSettings.rate,
    volume: initialSettings.volume,
    isLoading: false
  });

  const { speak, stop, pause, resume, supported } = useSpeechSynthesis();

  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } else {
      const currentVerse = verses[playerState.currentVerse];
      speak({
        text: `${currentVerse.number}절. ${currentVerse.text}`,
        voice: speechSynthesis.getVoices().find(v => v.name === initialSettings.voice),
        rate: playerState.playbackRate,
        pitch: initialSettings.pitch,
        volume: playerState.volume
      });
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleNext = () => {
    const nextVerse = Math.min(playerState.currentVerse + 1, verses.length - 1);
    setPlayerState(prev => ({ ...prev, currentVerse: nextVerse }));
    onVerseChange(nextVerse);
  };

  const handlePrevious = () => {
    const prevVerse = Math.max(playerState.currentVerse - 1, 0);
    setPlayerState(prev => ({ ...prev, currentVerse: prevVerse }));
    onVerseChange(prevVerse);
  };

  return (
    <div className="audio-player">
      {/* Main Controls */}
      <div className="player-controls">
        <button
          className="control-btn"
          onClick={handlePrevious}
          disabled={playerState.currentVerse === 0}
          aria-label="이전 구절"
        >
          <Icon name="chevronLeft" />
        </button>

        <button
          className="play-btn"
          onClick={handlePlayPause}
          disabled={!supported || playerState.isLoading}
          aria-label={playerState.isPlaying ? "일시정지" : "재생"}
        >
          {playerState.isLoading ? (
            <div className="loading-spinner" />
          ) : playerState.isPlaying ? (
            <Icon name="pause" />
          ) : (
            <Icon name="play" />
          )}
        </button>

        <button
          className="control-btn"
          onClick={handleNext}
          disabled={playerState.currentVerse === verses.length - 1}
          aria-label="다음 구절"
        >
          <Icon name="chevronRight" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar" role="progressbar">
          <div
            className="progress-fill"
            style={{
              width: `${(playerState.currentVerse / verses.length) * 100}%`
            }}
          />
        </div>
        <div className="progress-text">
          {playerState.currentVerse + 1} / {verses.length} 구절
        </div>
      </div>

      {/* Current Verse Indicator */}
      <div className="current-verse-info">
        <Icon name="volume" size="sm" />
        <span className="verse-text">
          {verses[playerState.currentVerse]?.number}절:
          {verses[playerState.currentVerse]?.text.substring(0, 30)}...
        </span>
      </div>

      {/* Advanced Controls */}
      <div className="advanced-controls">
        <div className="control-group">
          <label htmlFor="playback-rate">재생 속도</label>
          <select
            id="playback-rate"
            value={playerState.playbackRate}
            onChange={(e) => setPlayerState(prev => ({
              ...prev,
              playbackRate: parseFloat(e.target.value)
            }))}
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="volume">음량</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={playerState.volume}
            onChange={(e) => setPlayerState(prev => ({
              ...prev,
              volume: parseFloat(e.target.value)
            }))}
          />
        </div>

        <button className="timer-btn">
          <Icon name="clock" size="sm" />
          취침 타이머
        </button>
      </div>
    </div>
  );
};
```

### **2-2. TTS 설정 및 음성 선택**

```typescript
interface TTSSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  autoAdvance: boolean;
  pauseBetweenVerses: number; // milliseconds
}

const TTSSettingsPanel: React.FC<{
  settings: TTSSettings;
  onChange: (settings: TTSSettings) => void;
}> = ({ settings, onChange }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const koreanVoices = availableVoices.filter(voice =>
        voice.lang.startsWith('ko') ||
        voice.name.includes('Korean') ||
        voice.name.includes('한국')
      );
      setVoices(koreanVoices.length > 0 ? koreanVoices : availableVoices.slice(0, 5));
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  return (
    <div className="tts-settings-panel">
      <h4>🎵 음성 설정</h4>

      <div className="setting-group">
        <label htmlFor="voice-select">음성 선택</label>
        <select
          id="voice-select"
          value={settings.voice?.name || ''}
          onChange={(e) => {
            const selectedVoice = voices.find(v => v.name === e.target.value);
            onChange({ ...settings, voice: selectedVoice || null });
          }}
        >
          <option value="">기본 음성</option>
          {voices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="rate-slider">
          말하기 속도: {settings.rate.toFixed(1)}x
        </label>
        <input
          id="rate-slider"
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.rate}
          onChange={(e) => onChange({
            ...settings,
            rate: parseFloat(e.target.value)
          })}
        />
      </div>

      <div className="setting-group">
        <label htmlFor="pitch-slider">
          음조: {settings.pitch.toFixed(1)}
        </label>
        <input
          id="pitch-slider"
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.pitch}
          onChange={(e) => onChange({
            ...settings,
            pitch: parseFloat(e.target.value)
          })}
        />
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => onChange({
              ...settings,
              autoAdvance: e.target.checked
            })}
          />
          자동으로 다음 구절 재생
        </label>
      </div>

      {settings.autoAdvance && (
        <div className="setting-group">
          <label htmlFor="pause-duration">
            구절 간 멈춤: {settings.pauseBetweenVerses / 1000}초
          </label>
          <input
            id="pause-duration"
            type="range"
            min="500"
            max="5000"
            step="500"
            value={settings.pauseBetweenVerses}
            onChange={(e) => onChange({
              ...settings,
              pauseBetweenVerses: parseInt(e.target.value)
            })}
          />
        </div>
      )}
    </div>
  );
};
```

---

## 📖 **3. 본문 표시 시스템**

### **3-1. 읽기 모드 전환 컨트롤**

```typescript
type ReadingMode = 'verse' | 'paragraph' | 'meditation';

interface ReadingModeControlsProps {
  currentMode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  onFontSizeChange: (size: 'small' | 'medium' | 'large' | 'xl') => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

const ReadingModeControls: React.FC<ReadingModeControlsProps> = ({
  currentMode,
  onModeChange,
  fontSize,
  onFontSizeChange,
  theme,
  onThemeToggle
}) => {
  const modeOptions = [
    { value: 'verse', label: '구절별', icon: 'list', description: '각 구절을 독립적으로 표시' },
    { value: 'paragraph', label: '문단형', icon: 'fileText', description: '자연스러운 문단 흐름' },
    { value: 'meditation', label: '묵상모드', icon: 'heart', description: '집중적인 읽기를 위한 레이아웃' }
  ] as const;

  const fontSizeOptions = [
    { value: 'small', label: '작게' },
    { value: 'medium', label: '보통' },
    { value: 'large', label: '크게' },
    { value: 'xl', label: '매우크게' }
  ] as const;

  return (
    <div className="reading-mode-controls">
      {/* Reading Mode Selection */}
      <div className="control-group">
        <h4 className="control-label">읽기 모드</h4>
        <div className="mode-selector">
          {modeOptions.map(option => (
            <button
              key={option.value}
              className={`mode-btn ${currentMode === option.value ? 'active' : ''}`}
              onClick={() => onModeChange(option.value as ReadingMode)}
              title={option.description}
              aria-label={`${option.label} 모드로 변경`}
            >
              <Icon name={option.icon} size="sm" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Control */}
      <div className="control-group">
        <h4 className="control-label">글자 크기</h4>
        <div className="font-size-selector">
          {fontSizeOptions.map(option => (
            <button
              key={option.value}
              className={`font-btn ${fontSize === option.value ? 'active' : ''}`}
              onClick={() => onFontSizeChange(option.value)}
              aria-label={`글자 크기 ${option.label}로 변경`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Controls */}
      <div className="control-group">
        <h4 className="control-label">화면 설정</h4>
        <div className="additional-controls">
          <button
            className="control-btn"
            onClick={onThemeToggle}
            aria-label={`${theme === 'dark' ? '라이트' : '다크'} 모드로 변경`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
            {theme === 'dark' ? '라이트모드' : '다크모드'}
          </button>

          <button className="control-btn">
            <Icon name="maximize" size="sm" />
            전체화면
          </button>

          <button className="control-btn">
            <Icon name="bookmark" size="sm" />
            책갈피
          </button>
        </div>
      </div>
    </div>
  );
};
```

### **3-2. 성경 본문 렌더링 컴포넌트**

```typescript
interface BibleVerse {
  number: number;
  text: string;
  reference: string; // e.g., "창 1:1"
  isHighlighted?: boolean;
  highlightType?: 'personal' | 'community' | 'study';
  notes?: string[];
}

interface BibleContentProps {
  verses: BibleVerse[];
  readingMode: ReadingMode;
  fontSize: string;
  currentAudioVerse?: number;
  highlightMode: boolean;
  onVerseClick: (verseNumber: number) => void;
  onVerseHighlight: (verseNumber: number, type: 'personal' | 'community' | 'study') => void;
}

const BibleContent: React.FC<BibleContentProps> = ({
  verses,
  readingMode,
  fontSize,
  currentAudioVerse,
  highlightMode,
  onVerseClick,
  onVerseHighlight
}) => {
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const handleVerseInteraction = (verseNumber: number) => {
    if (highlightMode) {
      onVerseHighlight(verseNumber, 'personal');
    } else {
      setSelectedVerse(verseNumber === selectedVerse ? null : verseNumber);
      onVerseClick(verseNumber);
    }
  };

  const renderVerse = (verse: BibleVerse, index: number) => {
    const isCurrentAudio = currentAudioVerse === verse.number;
    const isSelected = selectedVerse === verse.number;

    const verseClasses = `
      verse
      ${readingMode}-mode
      ${verse.isHighlighted ? `highlighted-${verse.highlightType}` : ''}
      ${isCurrentAudio ? 'current-audio' : ''}
      ${isSelected ? 'selected' : ''}
      ${fontSize}
    `;

    return (
      <div
        key={verse.number}
        className={verseClasses}
        data-verse={verse.number}
        onClick={() => handleVerseInteraction(verse.number)}
        role="button"
        tabIndex={0}
        aria-label={`${verse.number}절: ${verse.text.substring(0, 50)}...`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleVerseInteraction(verse.number);
          }
        }}
      >
        {/* Verse Number */}
        <span className="verse-number" aria-label={`${verse.number}절`}>
          {verse.number}
        </span>

        {/* Verse Text */}
        <span className="verse-text">
          {verse.text}
        </span>

        {/* Audio Playing Indicator */}
        {isCurrentAudio && (
          <div className="audio-indicator" aria-label="현재 재생 중">
            <div className="audio-waves">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* Highlight Indicator */}
        {verse.isHighlighted && (
          <div className={`highlight-indicator ${verse.highlightType}`}>
            <Icon
              name={verse.highlightType === 'personal' ? 'heart' :
                    verse.highlightType === 'community' ? 'users' : 'star'}
              size="xs"
            />
          </div>
        )}

        {/* Notes Indicator */}
        {verse.notes && verse.notes.length > 0 && (
          <div className="notes-indicator">
            <Icon name="messageCircle" size="xs" />
            <span className="notes-count">{verse.notes.length}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bible-content ${readingMode}-layout`}>
      {/* Chapter Header */}
      <div className="chapter-header">
        <h1 className="chapter-title">
          {verses[0]?.reference.split(':')[0]} {/* e.g., "창세기 1장" */}
        </h1>
        <div className="chapter-meta">
          <span className="verse-count">{verses.length}개 구절</span>
          <span className="reading-time">예상 읽기 시간 {Math.ceil(verses.length / 3)}분</span>
        </div>
      </div>

      {/* Verses Container */}
      <div className="verses-container">
        {readingMode === 'meditation' ? (
          // Meditation Mode: One verse at a time
          <div className="meditation-container">
            {verses.map((verse, index) => (
              <div key={verse.number} className="meditation-verse-wrapper">
                {renderVerse(verse, index)}
                {index < verses.length - 1 && (
                  <div className="verse-divider">⬥</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Normal and Paragraph Modes
          <div className="normal-verses-container">
            {verses.map((verse, index) => renderVerse(verse, index))}
          </div>
        )}
      </div>

      {/* Reading Progress Indicator */}
      <div className="reading-progress-indicator">
        <div className="progress-line">
          <div
            className="progress-fill"
            style={{
              width: `${selectedVerse ? (selectedVerse / verses.length) * 100 : 0}%`
            }}
          />
        </div>
        <span className="progress-text">
          {selectedVerse ? `${selectedVerse}/${verses.length} 구절` : '읽기 시작'}
        </span>
      </div>
    </div>
  );
};
```

### **3-3. 읽기 모드별 스타일링**

```css
/* Base Verse Styling */
.verse {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.verse:hover {
  background: var(--hover-overlay);
  border-left-color: var(--accent-primary);
}

.verse-number {
  font-weight: 600;
  color: var(--accent-primary);
  font-size: 0.9em;
  min-width: 2rem;
  flex-shrink: 0;
}

.verse-text {
  flex: 1;
  line-height: 1.7;
}

/* Reading Mode Variations */

/* 1. Verse Mode (Default) */
.verse.verse-mode {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
}

/* 2. Paragraph Mode */
.paragraph-layout .verse {
  display: inline;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
}

.paragraph-layout .verse-number {
  font-size: 0.75em;
  vertical-align: super;
  margin-right: 0.25rem;
}

.paragraph-layout .verse-text {
  display: inline;
}

/* 3. Meditation Mode */
.meditation-verse-wrapper {
  margin: 3rem 0;
  text-align: center;
}

.verse.meditation-mode {
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.meditation-mode .verse-text {
  font-size: 1.25em;
  line-height: 2;
  text-align: center;
  font-weight: 400;
}

.verse-divider {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-muted);
  margin: 2rem 0;
}

/* Font Size Variations */
.verse.small .verse-text {
  font-size: 0.875rem;
}
.verse.medium .verse-text {
  font-size: 1rem;
}
.verse.large .verse-text {
  font-size: 1.125rem;
}
.verse.xl .verse-text {
  font-size: 1.25rem;
}

/* Highlight Styles */
.verse.highlighted-personal {
  background: var(--highlight-personal);
  border-left-color: var(--accent-primary);
}

.verse.highlighted-community {
  background: var(--highlight-community);
  border-left-color: var(--success);
}

.verse.highlighted-study {
  background: var(--highlight-study);
  border-left-color: #a855f7;
}

/* Current Audio Verse */
.verse.current-audio {
  background: var(--highlight-meditation);
  border-left-color: #eab308;
  box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.3);
}

/* Audio Playing Animation */
.audio-indicator {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.audio-waves {
  display: flex;
  gap: 2px;
  align-items: end;
}

.audio-waves span {
  width: 2px;
  background: #eab308;
  animation: audioWave 1s ease-in-out infinite alternate;
}

.audio-waves span:nth-child(2) {
  animation-delay: 0.1s;
}
.audio-waves span:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes audioWave {
  from {
    height: 4px;
  }
  to {
    height: 12px;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .verse {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .meditation-mode {
    padding: 1.5rem;
    margin: 1rem;
  }

  .verse-divider {
    margin: 1rem 0;
  }
}
```

---

## ✨ **4. 하이라이트 시스템**

### **4-1. 하이라이트 관리 컴포넌트**

```typescript
interface Highlight {
  id: string;
  verseNumber: number;
  type: 'personal' | 'community' | 'study';
  color?: string;
  note?: string;
  createdAt: Date;
  userId?: string;
}

interface HighlightManagerProps {
  highlights: Highlight[];
  onAdd: (verseNumber: number, type: Highlight['type'], note?: string) => void;
  onRemove: (highlightId: string) => void;
  onUpdate: (highlightId: string, updates: Partial<Highlight>) => void;
}

const HighlightManager: React.FC<HighlightManagerProps> = ({
  highlights,
  onAdd,
  onRemove,
  onUpdate
}) => {
  const [activeMode, setActiveMode] = useState<Highlight['type'] | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState<number | null>(null);

  const highlightTypes = [
    {
      type: 'personal',
      label: '개인 하이라이트',
      icon: 'heart',
      color: '#3b82f6',
      description: '개인적인 묵상과 깨달음'
    },
    {
      type: 'community',
      label: '커뮤니티 하이라이트',
      icon: 'users',
      color: '#10b981',
      description: '많은 사용자가 선택한 구절'
    },
    {
      type: 'study',
      label: '연구 하이라이트',
      icon: 'star',
      color: '#a855f7',
      description: '학습과 연구를 위한 표시'
    }
  ] as const;

  const getHighlightStats = () => {
    return highlightTypes.map(type => ({
      ...type,
      count: highlights.filter(h => h.type === type.type).length
    }));
  };

  return (
    <div className="highlight-manager">
      <div className="highlight-controls">
        <h4 className="controls-title">✨ 하이라이트 도구</h4>

        {/* Mode Selector */}
        <div className="highlight-mode-selector">
          {highlightTypes.map(type => (
            <button
              key={type.type}
              className={`highlight-mode-btn ${activeMode === type.type ? 'active' : ''}`}
              onClick={() => setActiveMode(activeMode === type.type ? null : type.type)}
              style={{ '--highlight-color': type.color } as React.CSSProperties}
              title={type.description}
            >
              <Icon name={type.icon} size="sm" />
              <span>{type.label}</span>
              <span className="highlight-count">
                {highlights.filter(h => h.type === type.type).length}
              </span>
            </button>
          ))}
        </div>

        {/* Active Mode Indicator */}
        {activeMode && (
          <div className="active-mode-indicator">
            <Icon name="info" size="sm" />
            <span>
              {highlightTypes.find(t => t.type === activeMode)?.description}
            </span>
            <button
              className="deactivate-btn"
              onClick={() => setActiveMode(null)}
            >
              해제
            </button>
          </div>
        )}
      </div>

      {/* Highlight Statistics */}
      <div className="highlight-stats">
        <h5>📊 하이라이트 현황</h5>
        <div className="stats-grid">
          {getHighlightStats().map(stat => (
            <div key={stat.type} className="stat-card">
              <div className="stat-icon" style={{ color: stat.color }}>
                <Icon name={stat.icon} size="sm" />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stat.count}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="recent-highlights">
        <h5>📝 최근 하이라이트</h5>
        <div className="highlights-list">
          {highlights
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map(highlight => (
              <div key={highlight.id} className="highlight-item">
                <div className="highlight-info">
                  <span className="verse-ref">{highlight.verseNumber}절</span>
                  <span className={`highlight-type ${highlight.type}`}>
                    <Icon
                      name={highlightTypes.find(t => t.type === highlight.type)?.icon || 'star'}
                      size="xs"
                    />
                  </span>
                </div>
                {highlight.note && (
                  <p className="highlight-note">{highlight.note}</p>
                )}
                <div className="highlight-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => setShowNoteDialog(highlight.verseNumber)}
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => onRemove(highlight.id)}
                  >
                    <Icon name="trash2" size="xs" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Note Dialog */}
      {showNoteDialog && (
        <NoteDialog
          verseNumber={showNoteDialog}
          existingNote={highlights.find(h => h.verseNumber === showNoteDialog)?.note}
          onSave={(note) => {
            const existingHighlight = highlights.find(h => h.verseNumber === showNoteDialog);
            if (existingHighlight) {
              onUpdate(existingHighlight.id, { note });
            }
            setShowNoteDialog(null);
          }}
          onCancel={() => setShowNoteDialog(null)}
        />
      )}
    </div>
  );
};
```

### **4-2. 노트 작성 다이얼로그**

```typescript
interface NoteDialogProps {
  verseNumber: number;
  existingNote?: string;
  onSave: (note: string) => void;
  onCancel: () => void;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
  verseNumber,
  existingNote = '',
  onSave,
  onCancel
}) => {
  const [note, setNote] = useState(existingNote);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (note.trim()) {
      setIsSaving(true);
      try {
        await onSave(note.trim());
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={`${verseNumber}절 묵상 노트`}
      size="md"
    >
      <div className="note-dialog">
        <div className="note-input-section">
          <label htmlFor="note-textarea" className="sr-only">
            묵상 노트 작성
          </label>
          <textarea
            id="note-textarea"
            className="note-textarea"
            placeholder="이 구절을 통해 받은 은혜나 깨달음을 기록해보세요..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            maxLength={500}
            autoFocus
          />
          <div className="character-count">
            {note.length}/500
          </div>
        </div>

        <div className="note-suggestions">
          <h6>💡 묵상 가이드</h6>
          <div className="suggestion-tags">
            <button
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n🎯 적용점: `)}
            >
              적용점
            </button>
            <button
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n🙏 기도제목: `)}
            >
              기도제목
            </button>
            <button
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n❤️ 감사: `)}
            >
              감사
            </button>
            <button
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n🤔 질문: `)}
            >
              질문
            </button>
          </div>
        </div>

        <div className="dialog-actions">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            disabled={!note.trim()}
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

---

## 📊 **5. 진도 추적 시스템**

### **5-1. 읽기 진도 추적 로직**

```typescript
interface ReadingSession {
  id: string;
  bookId: string;
  chapterNumber: number;
  startTime: Date;
  endTime?: Date;
  readingDuration: number; // seconds
  listeningDuration: number; // seconds
  completionPercentage: number; // 0-100
  scrollProgress: number; // 0-100
  versesRead: number[];
  mode: ReadingMode;
  completed: boolean;
}

const useReadingProgress = (bookId: string, chapterNumber: number) => {
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Initialize session when component mounts
  useEffect(() => {
    const newSession: ReadingSession = {
      id: crypto.randomUUID(),
      bookId,
      chapterNumber,
      startTime: new Date(),
      readingDuration: 0,
      listeningDuration: 0,
      completionPercentage: 0,
      scrollProgress: 0,
      versesRead: [],
      mode: 'verse',
      completed: false,
    };

    setSession(newSession);
    setIsTracking(true);
  }, [bookId, chapterNumber]);

  // Track scroll progress
  const updateScrollProgress = useCallback(
    (scrollPercentage: number) => {
      if (session && isTracking) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                scrollProgress: Math.max(prev.scrollProgress, scrollPercentage),
                completionPercentage: Math.max(prev.completionPercentage, scrollPercentage * 0.8), // 80% weight for scroll
              }
            : null
        );
      }
    },
    [session, isTracking]
  );

  // Track verse interaction
  const markVerseRead = useCallback(
    (verseNumber: number) => {
      if (session && isTracking) {
        setSession((prev) => {
          if (!prev) return null;

          const newVersesRead = prev.versesRead.includes(verseNumber)
            ? prev.versesRead
            : [...prev.versesRead, verseNumber];

          const readPercentage = (newVersesRead.length / totalVerses) * 100;

          return {
            ...prev,
            versesRead: newVersesRead,
            completionPercentage: Math.max(prev.completionPercentage, readPercentage),
          };
        });
      }
    },
    [session, isTracking]
  );

  // Track reading time
  useEffect(() => {
    if (!isTracking || !session) return;

    const interval = setInterval(() => {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              readingDuration: prev.readingDuration + 1,
            }
          : null
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, session]);

  // Save session when unmounting or completing
  const completeSession = useCallback(async () => {
    if (session) {
      const completedSession = {
        ...session,
        endTime: new Date(),
        completed: session.completionPercentage >= 90, // 90% threshold for completion
      };

      // Save to Supabase
      await saveReadingSession(completedSession);
      setIsTracking(false);
    }
  }, [session]);

  return {
    session,
    updateScrollProgress,
    markVerseRead,
    completeSession,
    isTracking,
  };
};
```

### **5-2. 실시간 진도 표시 컴포넌트**

```typescript
interface ProgressIndicatorProps {
  session: ReadingSession | null;
  totalVerses: number;
  currentVerse?: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  session,
  totalVerses,
  currentVerse
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!session) return null;

  const readingProgress = (session.versesRead.length / totalVerses) * 100;
  const timeProgress = Math.min((session.readingDuration / 600) * 100, 100); // 10분 기준
  const overallProgress = session.completionPercentage;

  return (
    <div className={`progress-indicator ${isVisible ? 'visible' : 'hidden'}`}>
      {/* Top Progress Bar */}
      <div className="top-progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Detailed Progress Panel */}
      <div className="progress-panel">
        <button
          className="toggle-btn"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={isVisible ? "진도 패널 숨기기" : "진도 패널 보기"}
        >
          <Icon name={isVisible ? "chevronUp" : "chevronDown"} size="sm" />
        </button>

        {isVisible && (
          <div className="progress-details">
            {/* Reading Stats */}
            <div className="progress-stat">
              <div className="stat-icon">📖</div>
              <div className="stat-content">
                <div className="stat-label">읽은 구절</div>
                <div className="stat-value">
                  {session.versesRead.length} / {totalVerses}
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-fill reading"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Time Stats */}
            <div className="progress-stat">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-label">읽기 시간</div>
                <div className="stat-value">
                  {Math.floor(session.readingDuration / 60)}분 {session.readingDuration % 60}초
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-fill time"
                    style={{ width: `${timeProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Audio Stats */}
            {session.listeningDuration > 0 && (
              <div className="progress-stat">
                <div className="stat-icon">🎵</div>
                <div className="stat-content">
                  <div className="stat-label">듣기 시간</div>
                  <div className="stat-value">
                    {Math.floor(session.listeningDuration / 60)}분 {session.listeningDuration % 60}초
                  </div>
                </div>
              </div>
            )}

            {/* Completion Prediction */}
            <div className="completion-prediction">
              {overallProgress >= 90 ? (
                <div className="completion-ready">
                  🎉 완독 달성!
                  <button className="mark-complete-btn">
                    완료 표시
                  </button>
                </div>
              ) : (
                <div className="completion-progress">
                  완독까지 {100 - Math.round(overallProgress)}% 남음
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **5-3. 스크롤 기반 진도 추적**

```typescript
const useScrollProgress = (onProgressUpdate: (progress: number) => void) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = throttle(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 0) {
        setProgress(100);
        onProgressUpdate(100);
        return;
      }

      const scrollProgress = (scrollTop / maxScroll) * 100;
      const clampedProgress = Math.min(Math.max(scrollProgress, 0), 100);

      setProgress(clampedProgress);
      onProgressUpdate(clampedProgress);
    }, 100);

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [onProgressUpdate]);

  return { containerRef, progress };
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          func(...args);
          lastExecTime = Date.now();
        },
        delay - (currentTime - lastExecTime)
      );
    }
  };
}
```

---

## 📱 **6. 반응형 최적화**

### **6-1. 모바일 네비게이션**

```typescript
const MobileNavigation: React.FC<{
  selectedBook: BibleBook;
  currentChapter: number;
  onBookChange: (book: BibleBook) => void;
  onChapterChange: (chapter: number) => void;
}> = ({ selectedBook, currentChapter, onBookChange, onChapterChange }) => {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);

  return (
    <div className="mobile-navigation">
      {/* Bottom Tab Bar */}
      <div className="mobile-tab-bar">
        <button
          className="tab-btn"
          onClick={() => setShowBookSelector(true)}
        >
          <Icon name="book" size="sm" />
          <span>책 선택</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => setShowChapterSelector(true)}
        >
          <Icon name="list" size="sm" />
          <span>장 선택</span>
        </button>

        <button className="tab-btn">
          <Icon name="bookmark" size="sm" />
          <span>책갈피</span>
        </button>

        <button className="tab-btn">
          <Icon name="heart" size="sm" />
          <span>하이라이트</span>
        </button>
      </div>

      {/* Book Selector Modal */}
      <Modal
        isOpen={showBookSelector}
        onClose={() => setShowBookSelector(false)}
        title="성경 선택"
        size="full"
      >
        <MobileBookSelector
          onSelect={(book) => {
            onBookChange(book);
            setShowBookSelector(false);
          }}
        />
      </Modal>

      {/* Chapter Selector Modal */}
      <Modal
        isOpen={showChapterSelector}
        onClose={() => setShowChapterSelector(false)}
        title={`${selectedBook.name} 장 선택`}
        size="lg"
      >
        <MobileChapterSelector
          book={selectedBook}
          currentChapter={currentChapter}
          onSelect={(chapter) => {
            onChapterChange(chapter);
            setShowChapterSelector(false);
          }}
        />
      </Modal>
    </div>
  );
};
```

### **6-2. 터치 제스처 지원**

```typescript
const useTouchGestures = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onDoubleTap: () => void
) => {
  const [touchStart, setTouchStart] = useState<TouchEvent['touches'][0] | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0]);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0];
    const deltaX = touchStart.clientX - touchEnd.clientX;
    const deltaY = touchStart.clientY - touchEnd.clientY;

    // Swipe detection (minimum 50px horizontal movement, less than 100px vertical)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
      if (deltaX > 0) {
        onSwipeLeft(); // Next chapter
      } else {
        onSwipeRight(); // Previous chapter
      }
    }

    // Double tap detection
    const now = Date.now();
    if (now - lastTap < 300) {
      onDoubleTap();
    }
    setLastTap(now);

    setTouchStart(null);
  };

  return { handleTouchStart, handleTouchEnd };
};
```

---

## 💾 **7. 데이터 관리 및 API**

### **7-1. Supabase 쿼리 함수들**

```typescript
// api/bible.ts
export interface BibleChapterData {
  id: string;
  book_id: string;
  chapter_number: number;
  verses: BibleVerse[];
  metadata: {
    title: string;
    subtitle: string;
    estimated_reading_time: number;
    word_count: number;
  };
}

export const fetchBibleChapter = async (
  bookId: string,
  chapterNumber: number
): Promise<BibleChapterData> => {
  const { data, error } = await supabase
    .from('b_bible_contents')
    .select(
      `
      *,
      bible_book:b_bible_books(*)
    `
    )
    .eq('bible_book_id', bookId)
    .eq('chapter_number', chapterNumber)
    .eq('status', 'published')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    book_id: data.bible_book_id,
    chapter_number: data.chapter_number,
    verses: parseVersesFromContent(data.html_content),
    metadata: {
      title: data.title,
      subtitle: data.subtitle || '',
      estimated_reading_time: data.estimated_reading_time || 0,
      word_count: data.word_count || 0,
    },
  };
};

export const saveReadingProgress = async (session: ReadingSession) => {
  const { error } = await supabase.from('b_reading_progress').upsert({
    user_session: getUserSession(),
    bible_book_id: session.bookId,
    chapter_number: session.chapterNumber,
    reading_completed: session.completed,
    reading_duration: session.readingDuration,
    listening_duration: session.listeningDuration,
    reading_percentage: session.completionPercentage,
    completion_date: session.completed ? session.endTime : null,
    highlights: session.versesRead,
  });

  if (error) throw error;
};

export const fetchReadingProgress = async (bookId: string): Promise<Record<number, any>> => {
  const { data, error } = await supabase
    .from('b_reading_progress')
    .select('*')
    .eq('user_session', getUserSession())
    .eq('bible_book_id', bookId);

  if (error) throw error;

  return data.reduce((acc, item) => {
    acc[item.chapter_number] = {
      readingCompleted: item.reading_completed,
      listeningCompleted: item.listening_completed,
      completionPercentage: item.reading_percentage,
    };
    return acc;
  }, {});
};
```

### **7-2. 실시간 데이터 동기화**

```typescript
// hooks/useRealtimeProgress.ts
export const useRealtimeProgress = (bookId: string) => {
  const [progress, setProgress] = useState<Record<number, any>>({});

  useEffect(() => {
    // Initial data fetch
    fetchReadingProgress(bookId).then(setProgress);

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`progress:${bookId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'b_reading_progress',
          filter: `bible_book_id=eq.${bookId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setProgress((prev) => ({
              ...prev,
              [payload.new.chapter_number]: {
                readingCompleted: payload.new.reading_completed,
                listeningCompleted: payload.new.listening_completed,
                completionPercentage: payload.new.reading_percentage,
              },
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookId]);

  return progress;
};
```

---

## ✅ **구현 체크리스트**

### **네비게이션 시스템**

- [ ] 신/구약 토글 스위치 구현
- [ ] 성경 책 카드 그리드 레이아웃
- [ ] 장별 네비게이션 (완료 상태 표시)
- [ ] 개인 진도 대시보드 구현
- [ ] 모바일 네비게이션 적응

### **오디오 시스템**

- [ ] TTS 엔진 통합 (Web Speech API)
- [ ] 오디오 플레이어 컨트롤
- [ ] 음성 설정 패널 구현
- [ ] 구절별 자동 재생 기능
- [ ] 취침 타이머 기능

### **본문 표시 시스템**

- [ ] 3가지 읽기 모드 구현
- [ ] 반응형 폰트 크기 조절
- [ ] 구절별 상호작용 기능
- [ ] 하이라이트 시스템 구현
- [ ] 노트 작성 다이얼로그

### **진도 추적 시스템**

- [ ] 스크롤 기반 진도 추적
- [ ] 읽기 시간 측정
- [ ] 완료 체크 로직 구현
- [ ] 실시간 진도 표시
- [ ] Supabase 데이터 동기화

### **반응형 최적화**

- [ ] 모바일 터치 제스처 지원
- [ ] 태블릿 레이아웃 최적화
- [ ] 접근성 키보드 네비게이션
- [ ] 성능 최적화 (lazy loading)

### **데이터 관리**

- [ ] Supabase 쿼리 함수 구현
- [ ] 실시간 데이터 동기화
- [ ] 로컬 스토리지 백업
- [ ] 오프라인 모드 지원

---

## 🎯 **다음 단계**

성경읽기 페이지 설계 완료 후 다음 순서로 진행:

1. **04-데이터관리-PRD.md** - 관리자 도구 및 콘텐츠 관리 시스템
2. **03-성경자료실-PRD.md** - HTML 편집기 및 자료 관리 기능
3. **01-HOME-PRD.md** - 통합 대시보드 및 분석 기능

---

**📋 문서 상태**: ✅ **완료** - 성경읽기 페이지 상세 설계 확정  
**🎯 핵심 기능**: 읽기/듣기/진도추적 통합 완성  
**📱 사용자 경험**: 몰입형 성경 읽기 환경 구축  
**📅 다음 리뷰**: 데이터관리 페이지 PRD 작성 후
