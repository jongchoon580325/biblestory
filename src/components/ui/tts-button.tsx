'use client';

import React, { useState } from 'react';

interface TTSButtonProps {
  text: string;
  className?: string;
}

/**
 * TTSButton - Web Speech API 기반 텍스트 음성 변환 버튼
 * - text: 읽을 텍스트
 * - 재생/정지 토글, 상태 표시
 */
const TTSButton: React.FC<TTSButtonProps> = ({ text, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  let utter: SpeechSynthesisUtterance | null = null;

  const handlePlay = () => {
    if (!synth) return;
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }
    utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.onend = () => setIsPlaying(false);
    synth.speak(utter);
    setIsPlaying(true);
  };

  return (
    <button
      type="button"
      className={`px-3 py-1 rounded bg-accent-primary text-white hover:bg-accent-hover transition ${className}`}
      onClick={handlePlay}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? '음성 정지' : '음성 재생'}
    >
      {isPlaying ? '🔊 정지' : '🔈 듣기'}
    </button>
  );
};

export default TTSButton; 