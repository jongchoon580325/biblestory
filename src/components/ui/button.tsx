'use client';
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
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
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses: Record<string, string> = {
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
    `,
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button
      type={type}
      className={[baseClasses, variantClasses[variant], sizeClasses[size]].concat(className).join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
