'use client';
import React, { useEffect, useState } from 'react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 5000,
  action,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);
  const typeConfig = {
    success: { bg: 'bg-success', text: 'text-white' },
    error: { bg: 'bg-error', text: 'text-white' },
    warning: { bg: 'bg-warning', text: 'text-white' },
    info: { bg: 'bg-info', text: 'text-white' },
  };
  const config = typeConfig[type];
  if (!isVisible) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-50 ${config.bg} ${config.text} rounded-lg shadow-lg p-4 max-w-sm w-full transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="w-5 h-5">●</span>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
          {action && (
            <button onClick={action.onClick} className="text-sm underline mt-2 hover:no-underline">
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="opacity-70 hover:opacity-100"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
