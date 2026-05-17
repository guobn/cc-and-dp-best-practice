/**
 * shadcn/ui 风格 Switch 开关组件
 * 暗/亮模式切换等场景使用
 */
import React from 'react';
import { motion } from 'framer-motion';

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  ariaLabel = '切换开关',
  size = 'default', // default | sm
  className = ''
}) {
  const sizes = {
    default: { width: 'w-11', height: 'h-6', thumb: 'h-5 w-5', translateX: 'translate-x-5' },
    sm: { width: 'w-9', height: 'h-5', thumb: 'h-4 w-4', translateX: 'translate-x-4' }
  };

  const s = sizes[size] || sizes.default;

  const handleClick = () => {
    if (!disabled) onCheckedChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return React.createElement('button', {
    role: 'switch',
    'aria-checked': checked,
    'aria-label': ariaLabel,
    disabled,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    className: [
      'relative inline-flex shrink-0 cursor-pointer items-center rounded-full',
      'transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
      checked ? 'bg-indigo-600' : 'bg-gray-700',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      s.width,
      s.height,
      className
    ].filter(Boolean).join(' ')
  },
    React.createElement(motion.span, {
      className: `block rounded-full bg-white shadow-sm ${s.thumb}`,
      animate: checked ? { x: size === 'sm' ? 16 : 20 } : { x: 2 },
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    })
  );
}

export default Switch;
