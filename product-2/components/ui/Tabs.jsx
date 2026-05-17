/**
 * shadcn/ui 风格 Tabs 组件
 * 支持键盘导航（左右方向键切换）
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const activeValue = value !== undefined ? value : internalValue;

  const handleChange = useCallback((newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  }, [onValueChange]);

  // 将 children 处理为 tabsList 和 panels
  const tabsList = [];
  const panels = [];

  React.Children.forEach(children, child => {
    if (child?.type === TabsList) {
      // Inject activeValue and onChange into TabsList
      tabsList.push(React.cloneElement(child, {
        activeValue,
        onChange: handleChange,
        key: 'tabs-list'
      }));
    } else if (child?.type === TabsContent) {
      panels.push(React.cloneElement(child, {
        activeValue,
        key: child.props.value
      }));
    }
  });

  return React.createElement('div', { className, 'data-orientation': 'horizontal' },
    ...tabsList,
    ...panels
  );
}

export function TabsList({ children, activeValue, onChange, className = '' }) {
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = React.Children.toArray(children);

  // Find active index
  useEffect(() => {
    const idx = items.findIndex(child => child.props.value === activeValue);
    if (idx >= 0) setActiveIndex(idx);
  }, [activeValue, items]);

  const handleKeyDown = useCallback((e) => {
    let newIndex = activeIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (activeIndex + 1) % items.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (activeIndex - 1 + items.length) % items.length;
    } else {
      return;
    }
    e.preventDefault();
    const newValue = items[newIndex]?.props?.value;
    if (newValue) onChange?.(newValue);
  }, [activeIndex, items, onChange]);

  return React.createElement('div', {
    ref: listRef,
    role: 'tablist',
    className: `inline-flex items-center gap-1 bg-gray-800/80 rounded-xl p-1 border border-gray-700/50 ${className}`,
    onKeyDown: handleKeyDown,
    'aria-orientation': 'horizontal'
  },
    items.map((child, idx) =>
      React.cloneElement(child, {
        key: child.props.value || idx,
        active: child.props.value === activeValue,
        onClick: () => onChange?.(child.props.value),
        tabIndex: child.props.value === activeValue ? 0 : -1,
        role: 'tab',
        'aria-selected': child.props.value === activeValue
      })
    )
  );
}

export function TabsTrigger({ children, value, active, onClick, className = '', ...props }) {
  return React.createElement('button', {
    className: `relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${active ? 'text-white' : 'text-gray-400 hover:text-gray-200'} ${className}`,
    onClick,
    ...props
  },
    active && React.createElement(motion.span, {
      layoutId: 'active-tab',
      className: 'absolute inset-0 rounded-lg bg-gray-700',
      transition: { type: 'spring', stiffness: 380, damping: 30 }
    }),
    React.createElement('span', { className: 'relative z-10' }, children)
  );
}

export function TabsContent({ children, value, activeValue, className = '' }) {
  if (value !== activeValue) return null;

  return React.createElement(motion.div, {
    role: 'tabpanel',
    className,
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  }, children);
}

export default Tabs;
