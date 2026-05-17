/**
 * shadcn/ui 风格按钮组件
 * 支持 variant: default / destructive / outline / secondary / ghost / link
 * 支持 size: default / sm / lg / icon
 */
import React from 'react';

const variants = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 focus-visible:ring-indigo-500',
  destructive: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-500',
  outline: 'border border-gray-600 bg-transparent text-gray-200 hover:bg-gray-800 active:bg-gray-700 focus-visible:ring-gray-500',
  secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-800 focus-visible:ring-gray-500',
  ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700 focus-visible:ring-gray-500',
  link: 'text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300 focus-visible:ring-indigo-500'
};

const sizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 py-1 text-xs',
  lg: 'h-12 px-6 py-3 text-base',
  icon: 'h-10 w-10 p-2'
};

export default function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ariaLabel,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50 select-none';

  return React.createElement('button', {
    type,
    className: `${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`,
    disabled: disabled || loading,
    onClick,
    'aria-label': ariaLabel,
    ...props
  },
    loading && React.createElement('span', {
      className: 'mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white inline-block'
    }),
    children
  );
}
