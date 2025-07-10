'use client';
import React from 'react';

import { Controller, Control, FieldValues, RegisterOptions, Path } from 'react-hook-form';

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
  className?: string;
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
  onChange,
  className = '',
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
    <div className={`space-y-1 ${className}`}>
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
      {error && <p className="text-sm text-error">{error}</p>}
      {helpText && !error && <p className="text-sm text-text-muted">{helpText}</p>}
    </div>
  );
};

interface RHFInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}

/**
 * RHFInput - react-hook-form Controller 기반 인풋 컴포넌트
 * - name, control, rules, label, placeholder, type 등 지원
 * - 기존 Input 컴포넌트와 통합 사용 가능
 */
export function RHFInput<T extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  label,
  placeholder,
  type = 'text',
  className = '',
}: RHFInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className={className}>
          {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-primary ${fieldState.error ? 'border-error' : 'border-border-primary'}`}
          />
          {fieldState.error && (
            <span className="text-error text-xs mt-1 block">{fieldState.error.message}</span>
          )}
        </div>
      )}
    />
  );
}

export default Input;
