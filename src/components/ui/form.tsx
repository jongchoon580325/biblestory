import React from 'react';
import { useForm, FormProvider, UseFormProps, SubmitHandler, FieldValues } from 'react-hook-form';

interface FormProps<T extends FieldValues> extends UseFormProps<T> {
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  className?: string;
}

/**
 * Form - react-hook-form 기반 공통 폼 컴포넌트
 * - useForm, FormProvider, useFormContext 등 활용
 * - children 렌더링, submit 핸들러, 타입, 주석 포함
 */
export function Form<T extends FieldValues = FieldValues>({
  onSubmit,
  children,
  className = '',
  ...formProps
}: FormProps<T>) {
  const methods = useForm<T>(formProps);
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
} 