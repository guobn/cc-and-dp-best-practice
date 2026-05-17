/**
 * GlowCard - Magic UI / Aceternity UI 风格发光边框卡片
 * 带动态霓虹光晕和噪点纹理叠加
 */
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * 发光边框卡片 - 带渐变流光边框
 */
export function GlowCard({
  children,
  className = '',
  glowColor = 'indigo',
  glowIntensity = 'medium',
  animate = true,
  noise = true
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    indigo: ['#6366f1', '#8b5cf6', '#a855f7'],
    purple: ['#8b5cf6', '#a855f7', '#d946ef'],
    emerald: ['#10b981', '#34d399', '#6ee7b7'],
    pink: ['#ec4899', '#f472b6', '#f9a8d4'],
    gradient: ['#6366f1', '#ec4899', '#10b981']
  };

  const intensities = {
    low: { opacity: '0.3', blur: '20px', spread: '5px' },
    medium: { opacity: '0.5', blur: '40px', spread: '10px' },
    high: { opacity: '0.7', blur: '60px', spread: '15px' }
  };

  const c = colors[glowColor] || colors.indigo;
  const ins = intensities[glowIntensity] || intensities.medium;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return React.createElement('div', {
    ref: cardRef,
    className: `relative group ${className}`,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: { perspective: '1000px' }
  },
    // 动态发光效果
    React.createElement(motion.div, {
      className: 'absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
      style: {
        background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, ${c[0]}22, transparent 40%)`,
        filter: `blur(${ins.blur})`,
        transition: 'background 0.3s ease'
      }
    }),
    // 外发光
    React.createElement('div', {
      className: `absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none`,
      style: {
        background: `linear-gradient(135deg, ${c[0]}15, ${c[1]}15, ${c[2]}15)`,
        filter: `blur(${ins.blur})`
      }
    }),
    // 边框流光
    React.createElement(motion.div, {
      className: 'absolute inset-0 rounded-xl pointer-events-none overflow-hidden',
      style: { opacity: 0.6 }
    },
      React.createElement(motion.div, {
        className: 'absolute inset-0 rounded-xl',
        style: {
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        },
        animate: animate ? {
          background: [
            `linear-gradient(90deg, ${c[0]}44, ${c[1]}44, ${c[2]}44, ${c[0]}44)`,
            `linear-gradient(90deg, ${c[2]}44, ${c[0]}44, ${c[1]}44, ${c[2]}44)`,
            `linear-gradient(90deg, ${c[0]}44, ${c[1]}44, ${c[2]}44, ${c[0]}44)`
          ]
        } : {},
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'linear'
        }
      })
    ),
    // 噪点纹理叠加
    noise && React.createElement('div', {
      className: 'absolute inset-0 rounded-xl pointer-events-none opacity-[0.03] mix-blend-overlay',
      style: {
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }
    }),
    // 卡片内容
    React.createElement('div', {
      className: 'relative z-10 rounded-xl bg-gray-900/90 backdrop-blur-sm border border-gray-800/80 h-full'
    }, children)
  );
}

/**
 * 3D 倾斜卡片 - 鼠标跟随 3D 倾斜效果
 */
export function TiltCard({ children, className = '', tiltDegree = 10 }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setTilt({ x: -deltaY * tiltDegree, y: deltaX * tiltDegree });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return React.createElement(motion.div, {
    ref: cardRef,
    className: className,
    style: { perspective: '1000px' },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    animate: {
      rotateX: tilt.x,
      rotateY: tilt.y
    },
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
    React.createElement('div', {
      style: { transformStyle: 'preserve-3d' }
    }, children)
  );
}

export default GlowCard;
