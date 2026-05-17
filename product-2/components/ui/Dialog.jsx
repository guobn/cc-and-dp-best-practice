/**
 * shadcn/ui 风格对话框组件
 * 支持键盘交互：Esc 关闭
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Dialog({
  open = false,
  onClose,
  children,
  title = '',
  className = '',
  size = 'md' // sm | md | lg | xl | full
}) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Esc 关闭
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // 背景点击关闭
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return React.createElement(AnimatePresence, null,
    open && React.createElement(motion.div, {
      key: 'dialog-overlay',
      ref: overlayRef,
      className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm',
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      onClick: handleOverlayClick
    },
      React.createElement(motion.div, {
        ref: dialogRef,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': title,
        className: `relative w-full ${sizes[size] || sizes.md} bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/50 mx-4 max-h-[85vh] flex flex-col`,
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { type: 'spring', damping: 25, stiffness: 300 }
      },
        title && React.createElement('div', {
          className: 'flex items-center justify-between px-6 py-4 border-b border-gray-800'
        },
          React.createElement('h2', { className: 'text-lg font-semibold text-white' }, title),
          React.createElement('button', {
            onClick: onClose,
            className: 'rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors',
            'aria-label': '关闭对话框'
          }, React.createElement(X, { size: 18 }))
        ),
        React.createElement('div', {
          className: `overflow-y-auto p-6 ${className}`
        }, children)
      )
    )
  );
}

export function DialogTrigger({ children, onClick }) {
  return React.createElement('div', { onClick }, children);
}

export default Dialog;
