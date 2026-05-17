/**
 * shadcn/ui 风格卡片组件
 * 包含 Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */
import React from 'react';

export function Card({ children, className = '', glow = false, glowColor = 'indigo', ...props }) {
  const glowStyles = {
    indigo: 'shadow-indigo-500/10',
    purple: 'shadow-purple-500/10',
    emerald: 'shadow-emerald-500/10',
    pink: 'shadow-pink-500/10'
  };

  const classes = [
    'rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-lg',
    'transition-all duration-300 hover:border-gray-700',
    glow ? `shadow-lg ${glowStyles[glowColor] || glowStyles.indigo}` : '',
    className
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: classes, ...props }, children);
}

export function CardHeader({ children, className = '' }) {
  return React.createElement('div', {
    className: `flex flex-col space-y-1.5 p-6 pb-0 ${className}`
  }, children);
}

export function CardTitle({ children, className = '' }) {
  return React.createElement('h3', {
    className: `text-lg font-semibold leading-none tracking-tight text-white ${className}`
  }, children);
}

export function CardDescription({ children, className = '' }) {
  return React.createElement('p', {
    className: `text-sm text-gray-400 ${className}`
  }, children);
}

export function CardContent({ children, className = '' }) {
  return React.createElement('div', {
    className: `p-6 pt-4 ${className}`
  }, children);
}

export function CardFooter({ children, className = '' }) {
  return React.createElement('div', {
    className: `flex items-center p-6 pt-0 ${className}`
  }, children);
}

export default Card;
