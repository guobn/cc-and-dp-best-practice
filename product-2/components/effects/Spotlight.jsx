/**
 * Spotlight - Magic UI / Aceternity UI 风格聚光灯效果
 * 鼠标跟随的光斑照射
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * 聚光灯效果组件
 * 在容器内跟随鼠标移动产生光斑
 */
export function Spotlight({ children, className = '', size = 400, color = 'indigo', opacity = 0.15 }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });

  const colors = {
    indigo: '99,102,241',
    purple: '139,92,246',
    emerald: '16,185,129',
    pink: '236,72,153',
    white: '255,255,255'
  };

  const rgb = colors[color] || colors.indigo;

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Smooth animation loop for spotlight
  useEffect(() => {
    let animationId;

    function animate() {
      setPosition(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.08,
        y: prev.y + (targetRef.current.y - prev.y) * 0.08
      }));
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return React.createElement('div', {
    ref: containerRef,
    className: `relative overflow-hidden ${className}`,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  },
    // 聚光灯渐变
    React.createElement('div', {
      className: 'pointer-events-none absolute inset-0 transition-opacity duration-500',
      style={{
        opacity: isVisible ? opacity : 0,
        background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, rgba(${rgb}, 0.15), transparent 60%)`
      }}
    }),
    // 第二层光晕
    React.createElement('div', {
      className: 'pointer-events-none absolute inset-0 transition-opacity duration-700',
      style={{
        opacity: isVisible ? opacity * 0.5 : 0,
        background: `radial-gradient(${size * 0.5}px circle at ${position.x}px ${position.y}px, rgba(${rgb}, 0.08), transparent 50%)`
      }}
    }),
    // 内容
    React.createElement('div', { className: 'relative z-10' }, children)
  );
}

/**
 * 静态光晕效果 - 用于卡片/标题的背景装饰
 */
export function GlowEffect({ className = '', color = 'indigo', size = 300 }) {
  const colors = {
    indigo: 'rgba(99,102,241,0.08)',
    purple: 'rgba(139,92,246,0.08)',
    emerald: 'rgba(16,185,129,0.08)',
    pink: 'rgba(236,72,153,0.08)'
  };

  return React.createElement('div', {
    className: `pointer-events-none absolute ${className}`,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${colors[color] || colors.indigo}, transparent 70%)`,
      filter: 'blur(40px)'
    }
  });
}

export default Spotlight;
