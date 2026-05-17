/**
 * shadcn/ui 风格 Tooltip 组件
 * 基于 Framer Motion 的 hover 浮层
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Tooltip({ children, content, side = 'top', delay = 400, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  };

  return React.createElement('div', {
    className: `relative inline-flex ${className}`,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    ref: triggerRef
  },
    children,
    React.createElement(AnimatePresence, null,
      isVisible && React.createElement(motion.div, {
        className: `absolute z-50 ${sideClasses[side] || sideClasses.top} pointer-events-none`,
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { duration: 0.15 }
      },
        React.createElement('div', {
          className: 'relative'
        },
          React.createElement('div', {
            className: 'bg-gray-800 text-gray-100 text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-gray-700'
          }, content),
          React.createElement('div', {
            className: `absolute w-0 h-0 border-4 ${arrowClasses[side] || arrowClasses.top}`
          })
        )
      )
    )
  );
}

export default Tooltip;
