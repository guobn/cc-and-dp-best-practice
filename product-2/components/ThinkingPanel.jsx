/**
 * AI 思考过程侧栏
 * 暴露模拟 Prompt、Token 计数、模型名、思考日志
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../lib/store.js';
import {
  X,
  Brain,
  Cpu,
  FileText,
  Activity,
  Clock,
  ChevronRight,
  Zap,
  Bot
} from 'lucide-react';

function StatusDot({ status }) {
  const statusColors = {
    idle: 'bg-gray-500',
    thinking: 'bg-yellow-400 animate-pulse',
    done: 'bg-emerald-400',
    error: 'bg-red-400'
  };

  return React.createElement('span', {
    className: `inline-block w-2 h-2 rounded-full ${statusColors[status] || statusColors.idle}`
  });
}

function LogEntry({ log, index }) {
  const timeStr = log.timestamp
    ? new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return React.createElement(motion.div, {
    className: 'flex gap-3 px-4 py-2.5 border-b border-gray-800/50 last:border-0',
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: index * 0.05 }
  },
    React.createElement('div', {
      className: 'flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center'
    }, React.createElement(Bot, { size: 14, className: 'text-indigo-400' })),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('div', {
        className: 'flex items-center gap-2 mb-1'
      },
        React.createElement('span', { className: 'text-xs font-medium text-indigo-400' }, log.action || '思考'),
        timeStr && React.createElement('span', { className: 'text-xs text-gray-500' }, timeStr)
      ),
      React.createElement('p', { className: 'text-xs text-gray-300 leading-relaxed' }, log.content)
    )
  );
}

export function ThinkingPanel() {
  const { state, actions } = useApp();
  const { thinkingPanelOpen, thinkingData } = state;
  const logsEndRef = useRef(null);
  const [expandedSections, setExpandedSections] = React.useState({
    prompt: false,
    logs: true,
    metrics: true
  });

  // 自动滚动到底部
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thinkingData.logs.length]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const metrics = [
    { icon: Cpu, label: '模型', value: thinkingData.model || 'deepseek-v4-pro[1m]', color: 'text-indigo-400' },
    { icon: FileText, label: 'Tokens', value: `${(thinkingData.tokenCount || 0).toLocaleString()}`, color: 'text-emerald-400' },
    { icon: Activity, label: '状态', value: thinkingData.status === 'thinking' ? '思考中...' : thinkingData.status === 'done' ? '完成' : '就绪', color: thinkingData.status === 'thinking' ? 'text-yellow-400' : thinkingData.status === 'done' ? 'text-emerald-400' : 'text-gray-400' },
    { icon: Zap, label: '温度', value: '0.7', color: 'text-purple-400' },
    { icon: Clock, label: '延迟', value: thinkingData.status === 'thinking' ? '模拟中...' : '~2.3s', color: 'text-gray-400' }
  ];

  return React.createElement(AnimatePresence, null,
    thinkingPanelOpen && React.createElement(motion.div, {
      className: 'fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-40 flex flex-col shadow-2xl shadow-black/30',
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
      // 头部
      React.createElement('div', {
        className: 'flex items-center justify-between px-4 py-3 border-b border-gray-800'
      },
        React.createElement('div', {
          className: 'flex items-center gap-2'
        },
          React.createElement(Brain, { size: 18, className: 'text-indigo-400' }),
          React.createElement('span', { className: 'text-sm font-semibold text-white' }, 'AI 思考过程'),
          React.createElement(StatusDot, { status: thinkingData.status })
        ),
        React.createElement('button', {
          onClick: () => actions.setThinkingPanel(false),
          className: 'rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors',
          'aria-label': '关闭思考面板'
        }, React.createElement(X, { size: 16 }))
      ),

      // 内容区域
      React.createElement('div', { className: 'flex-1 overflow-y-auto' },
        // 指标区
        React.createElement('div', {
          className: 'border-b border-gray-800'
        },
          React.createElement('button', {
            className: 'flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors',
            onClick: () => toggleSection('metrics'),
            'aria-label': '切换指标显示'
          },
            React.createElement('span', null, '运行指标'),
            React.createElement(ChevronRight, {
              size: 14,
              className: `transition-transform duration-200 ${expandedSections.metrics ? 'rotate-90' : ''}`
            })
          ),
          expandedSections.metrics && React.createElement('div', {
            className: 'grid grid-cols-2 gap-2 px-4 pb-3'
          },
            metrics.map((m, i) => React.createElement('div', {
              key: i,
              className: 'bg-gray-800/60 rounded-lg px-3 py-2'
            },
              React.createElement('div', { className: 'flex items-center gap-1.5 mb-1' },
                React.createElement(m.icon, { size: 12, className: m.color }),
                React.createElement('span', { className: 'text-[10px] text-gray-500' }, m.label)
              ),
              React.createElement('span', { className: `text-xs font-mono font-medium ${m.color}` }, m.value)
            ))
          )
        ),

        // Prompt 区
        React.createElement('div', {
          className: 'border-b border-gray-800'
        },
          React.createElement('button', {
            className: 'flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors',
            onClick: () => toggleSection('prompt'),
            'aria-label': '切换 Prompt 显示'
          },
            React.createElement('span', null, '系统 Prompt'),
            React.createElement(ChevronRight, {
              size: 14,
              className: `transition-transform duration-200 ${expandedSections.prompt ? 'rotate-90' : ''}`
            })
          ),
          expandedSections.prompt && React.createElement('div', {
            className: 'px-4 pb-3'
          },
            React.createElement('pre', {
              className: 'text-[11px] font-mono text-gray-300 bg-gray-800/60 rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap'
            }, thinkingData.prompt || '你是一个 AI 助手。请根据知识库内容回答用户问题。')
          )
        ),

        // 日志区
        React.createElement('div', null,
          React.createElement('button', {
            className: 'flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors',
            onClick: () => toggleSection('logs'),
            'aria-label': '切换思考日志显示'
          },
            React.createElement('span', null, '思考日志'),
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'text-[10px] text-gray-500' }, `${thinkingData.logs.length} 条`),
              React.createElement(ChevronRight, {
                size: 14,
                className: `transition-transform duration-200 ${expandedSections.logs ? 'rotate-90' : ''}`
              })
            )
          ),
          expandedSections.logs && React.createElement('div', { className: 'divide-y divide-gray-800/50' },
            thinkingData.logs.length === 0
              ? React.createElement('div', {
                className: 'px-4 py-8 text-center text-xs text-gray-500'
              }, '暂无思考日志，开始对话或运行流水线后将在此显示')
              : thinkingData.logs.map((log, i) => React.createElement(LogEntry, { key: i, log, index: i })),
            React.createElement('div', { ref: logsEndRef })
          )
        )
      ),

      // 底部信息
      React.createElement('div', {
        className: 'px-4 py-2.5 border-t border-gray-800 bg-gray-900/80'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between text-[10px] text-gray-500'
        },
          React.createElement('span', null, '推理引擎 v2.4.0'),
          React.createElement('span', null, `思考深度: ${thinkingData.logs.length > 5 ? '深度' : '标准'}`)
        )
      )
    )
  );
}

export default ThinkingPanel;
