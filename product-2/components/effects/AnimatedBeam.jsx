/**
 * AnimatedBeam - Magic UI 风格动画光束效果
 * 模拟数据流动的光束线条
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 单条光束粒子
 */
function BeamParticle({ index, total, from, to, duration = 3, delay = 0 }) {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;

  return React.createElement(motion.div, {
    className: 'absolute w-2 h-2 rounded-full',
    style: {
      background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)',
      filter: 'blur(1px)',
      width: Math.random() * 4 + 2 + 'px',
      height: Math.random() * 4 + 2 + 'px'
    },
    initial: {
      x: startX,
      y: startY,
      opacity: 0
    },
    animate: {
      x: [startX, (startX + endX) / 2, endX],
      y: [startY, (startY + endY) / 2 - 20, endY],
      opacity: [0, 1, 0]
    },
    transition: {
      duration,
      delay: delay + index * 0.3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  });
}

/**
 * AnimatedBeam 容器
 * 在两个元素之间绘制动态光束
 */
export function AnimatedBeam({ children, className = '', beamCount = 5, duration = 3, color = 'indigo' }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const colorMap = {
    indigo: 'rgba(99,102,241,0.6)',
    purple: 'rgba(139,92,246,0.6)',
    emerald: 'rgba(16,185,129,0.6)',
    pink: 'rgba(236,72,153,0.6)'
  };

  const beamColor = colorMap[color] || colorMap.indigo;

  return React.createElement('div', {
    ref: containerRef,
    className: `relative overflow-hidden ${className}`,
    style: { minHeight: '40px' }
  },
    // 光束背景线条
    React.createElement('div', {
      className: 'absolute inset-0 pointer-events-none',
      style: {
        background: `radial-gradient(ellipse at 50% 50%, ${beamColor} 0%, transparent 70%)`,
        opacity: 0.15
      }
    }),
    // 粒子光束
    dimensions.width > 0 && Array.from({ length: beamCount }, (_, i) =>
      React.createElement(BeamParticle, {
        key: i,
        index: i,
        total: beamCount,
        from: { x: 0, y: dimensions.height / 2 },
        to: { x: dimensions.width, y: dimensions.height / 2 },
        duration,
        delay: Math.random() * 2
      })
    ),
    // 内容
    React.createElement('div', { className: 'relative z-10' }, children)
  );
}

/**
 * 行间流动光束 - 用于连接两个模块
 */
export function FlowBeam({ from, to, active = false, className = '' }) {
  if (!active) return null;

  return React.createElement('div', {
    className: `relative h-0.5 ${className}`,
    style: {
      background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)'
    }
  },
    React.createElement(motion.div, {
      className: 'absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400',
      animate: {
        left: ['0%', '100%']
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    })
  );
}

export default AnimatedBeam;
