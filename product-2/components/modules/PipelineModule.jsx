/**
 * 工作流编排模块 (Agent Pipeline)
 * 4 节点流水线：输入采集器 -> 研究员 -> 写手 -> 审稿人
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../lib/store.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import { GlowCard } from '../effects/GlowCard.jsx';
import { AnimatedBeam } from '../effects/AnimatedBeam.jsx';
import { renderMarkdown } from '../../lib/markdown.js';
import { pipelineConfig, nodeDurations, getSimulationOutput } from '../../data/agents.js';
import {
  Play,
  Square,
  RotateCcw,
  FileSearch,
  Search,
  PenLine,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Terminal,
  GripVertical,
  Zap,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';

const NODE_ICONS = {
  'input-collector': FileSearch,
  'researcher': Search,
  'writer': PenLine,
  'reviewer': ClipboardCheck
};

function NodeIcon({ nodeId, className }) {
  const Icon = NODE_ICONS[nodeId] || FileSearch;
  return React.createElement(Icon, { size: 20, className });
}

function PipelineNode({ node, isActive, isDone, isError, progress, onToggleOutput, showOutput }) {
  const statusConfig = {
    idle: { border: 'border-gray-700', glow: 'shadow-gray-900/50', icon: 'text-gray-500', bg: 'bg-gray-800/50' },
    running: { border: 'border-indigo-500/50', glow: 'shadow-indigo-500/20', icon: 'text-indigo-400', bg: 'bg-indigo-600/10' },
    done: { border: 'border-emerald-500/50', glow: 'shadow-emerald-500/20', icon: 'text-emerald-400', bg: 'bg-emerald-600/10' },
    error: { border: 'border-red-500/50', glow: 'shadow-red-500/20', icon: 'text-red-400', bg: 'bg-red-600/10' }
  };

  const status = isError ? 'error' : isDone ? 'done' : isActive ? 'running' : 'idle';
  const config = statusConfig[status];

  return React.createElement(motion.div, {
    layout: true,
    className: 'relative'
  },
    React.createElement(GlowCard, {
      glowColor: isActive ? 'indigo' : isDone ? 'emerald' : 'indigo',
      glowIntensity: isActive ? 'medium' : 'low',
      className: 'cursor-pointer'
    },
      React.createElement('div', {
        className: `p-4 rounded-xl border ${config.border} ${config.bg} transition-all`,
        onClick: () => onToggleOutput?.(node.id)
      },
        // Node header
        React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
          React.createElement('div', {
            className: `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status === 'running' ? 'bg-indigo-600/30 animate-pulse' : status === 'done' ? 'bg-emerald-600/20' : 'bg-gray-800'}`,
          },
            status === 'running'
              ? React.createElement(Loader2, { size: 20, className: 'text-indigo-400 animate-spin' })
              : status === 'done'
                ? React.createElement(CheckCircle2, { size: 20, className: 'text-emerald-400' })
                : React.createElement(NodeIcon, { nodeId: node.id, className: config.icon })
          ),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('h4', { className: 'text-sm font-semibold text-white' }, node.name),
            React.createElement('p', { className: 'text-[10px] text-gray-500 mt-0.5' }, node.description)
          ),
          // Status indicator
          React.createElement('div', {
            className: `flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
              status === 'running' ? 'bg-indigo-500/20 text-indigo-300' :
              status === 'done' ? 'bg-emerald-500/20 text-emerald-300' :
              status === 'error' ? 'bg-red-500/20 text-red-300' :
              'bg-gray-800 text-gray-500'
            }`
          },
            status === 'running' && React.createElement(Loader2, { size: 10, className: 'animate-spin' }),
            status === 'running' ? `${Math.round(progress)}%` :
            status === 'done' ? '完成' :
            status === 'error' ? '错误' : '待命'
          )
        ),

        // Progress bar (running only)
        status === 'running' && React.createElement('div', {
          className: 'h-1 bg-gray-700 rounded-full overflow-hidden mb-2'
        },
          React.createElement(motion.div, {
            className: 'h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full',
            initial: { width: 0 },
            animate: { width: `${progress}%` },
            transition: { duration: 0.3 }
          })
        ),

        // Summary
        React.createElement('p', { className: 'text-xs text-gray-400 line-clamp-2' },
          node.output ? (node.output.length > 100 ? node.output.slice(0, 100) + '...' : node.output) : '等待执行...'
        ),

        // Toggle output
        React.createElement('div', {
          className: 'flex items-center justify-between mt-2 pt-2 border-t border-gray-800'
        },
          React.createElement('span', { className: 'text-[10px] text-gray-600 flex items-center gap-1' },
            React.createElement(Terminal, { size: 10 }),
            React.createElement('span', null, node.output ? `${node.output.length} 字符` : '无输出')
          ),
          React.createElement(Tooltip, { content: showOutput === node.id ? '收起输出' : '展开输出' },
            React.createElement('button', {
              onClick: (e) => { e.stopPropagation(); onToggleOutput?.(node.id); },
              className: 'rounded p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 transition-colors',
              'aria-label': '切换输出显示'
            }, showOutput === node.id ? React.createElement(ChevronUp, { size: 14 }) : React.createElement(ChevronDown, { size: 14 }))
          )
        )
      )
    ),

    // Output panel
    React.createElement(AnimatePresence, null,
      showOutput === node.id && node.output && React.createElement(motion.div, {
        className: 'mt-2 rounded-xl bg-gray-900/80 border border-gray-700/50 overflow-hidden',
        initial: { height: 0, opacity: 0 },
        animate: { height: 'auto', opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: { duration: 0.2 }
      },
        React.createElement('div', {
          className: 'px-4 py-3 border-b border-gray-800 flex items-center justify-between'
        },
          React.createElement('span', { className: 'text-xs font-medium text-gray-400' }, `${node.name} 输出`),
          React.createElement('span', { className: 'text-[10px] text-gray-600' }, '模拟输出')
        ),
        React.createElement('div', {
          className: 'p-4 text-sm text-gray-300 leading-relaxed max-h-60 overflow-y-auto font-mono text-xs'
        }, renderMarkdown(node.output))
      )
    )
  );
}

function EdgeLine({ active = false, done = false }) {
  return React.createElement('div', {
    className: 'flex items-center justify-center py-1'
  },
    React.createElement('div', {
      className: `w-0.5 h-8 rounded-full transition-all ${done ? 'bg-emerald-500' : active ? 'bg-indigo-500 animate-pulse' : 'bg-gray-700'}`
    }),
    React.createElement(ArrowRight, {
      size: 12,
      className: `ml-1 transition-all ${done ? 'text-emerald-400' : active ? 'text-indigo-400' : 'text-gray-600'}`
    })
  );
}

function PipelineInput({ value, onChange, onSubmit, running }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return React.createElement(Card, { className: 'mb-6 border-gray-700/50' },
    CardContent({
      className: 'p-4',
      children: React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', {
          className: 'flex items-center gap-2 text-sm text-gray-300 font-medium'
        },
          React.createElement(Zap, { size: 16, className: 'text-amber-400' }),
          React.createElement('span', null, '输入任务描述')
        ),
        React.createElement('textarea', {
          value,
          onChange: (e) => onChange(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder: '描述你想要完成的任务，例如：\n"调研 AI Agent 在软件开发中的应用现状，生成一份调研报告"',
          rows: 3,
          className: 'w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none resize-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all',
          disabled: running,
          'aria-label': '输入任务描述'
        }),
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('span', { className: 'text-[10px] text-gray-500' },
            running ? '流水线执行中...' : '按 Enter 提交，支持自然语言任务描述'
          ),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement(Tooltip, { content: '重置流水线' },
              React.createElement(Button, {
                variant: 'outline',
                size: 'sm',
                onClick: () => { onChange(''); },
                disabled: running || !value,
                ariaLabel: '重置输入'
              },
                React.createElement(RotateCcw, { size: 14 }),
                '重置'
              )
            ),
            React.createElement(Button, {
              onClick: onSubmit,
              disabled: !value.trim() || running,
              loading: running,
              size: 'sm',
              ariaLabel: '运行流水线'
            },
              running
                ? React.createElement(React.Fragment, null,
                  React.createElement(Loader2, { size: 14, className: 'animate-spin mr-1' }),
                  '执行中...'
                )
                : React.createElement(React.Fragment, null,
                  React.createElement(Play, { size: 14 }),
                  '运行流水线'
                )
            )
          )
        )
      )
    })
  );
}

export default function PipelineModule() {
  const { state, actions } = useApp();
  const [input, setInput] = useState('');
  const [nodes, setNodes] = useState(pipelineConfig.nodes.map(n => ({ ...n })));
  const [running, setRunning] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const abortRef = useRef(false);

  const runPipeline = useCallback(async () => {
    if (!input.trim() || running) return;

    const freshNodes = pipelineConfig.nodes.map(n => ({
      ...n,
      status: 'idle',
      progress: 0,
      output: ''
    }));
    setNodes(freshNodes);
    setRunning(true);
    setCompletedCount(0);
    abortRef.current = false;

    // Update thinking panel
    actions.setThinkingPanel(true);
    const thinkingLogs = [
      { action: '初始化流水线', content: `任务: "${input}"`, timestamp: Date.now() },
      { action: '加载配置', content: `4 节点流水线已就绪: ${freshNodes.map(n => n.name).join(' -> ')}`, timestamp: Date.now() + 50 }
    ];
    actions.setThinkingData({
      prompt: `你是一个 Agent 流水线协调器。\n\n用户任务: ${input}\n\n流水线配置:\n${freshNodes.map((n, i) => `${i + 1}. ${n.name} (${n.type})`).join('\n')}\n\n请依次执行每个节点，并在完成后汇总结果。`,
      tokenCount: 0,
      status: 'thinking',
      logs: thinkingLogs
    });

    for (let i = 0; i < freshNodes.length; i++) {
      if (abortRef.current) break;
      const node = freshNodes[i];

      // Mark as running
      setNodes(prev => prev.map(n =>
        n.id === node.id ? { ...n, status: 'running', progress: 0 } : n
      ));

      const duration = nodeDurations[node.id] || 2000;
      const steps = 20;

      // Simulate progress
      for (let step = 0; step <= steps; step++) {
        if (abortRef.current) break;
        await new Promise(r => setTimeout(r, duration / steps));
        const progress = (step / steps) * 100;
        setNodes(prev => prev.map(n =>
          n.id === node.id ? { ...n, progress } : n
        ));
      }

      if (abortRef.current) break;

      // Set output
      const output = getSimulationOutput(node.id);
      setNodes(prev => prev.map(n =>
        n.id === node.id ? { ...n, status: 'done', progress: 100, output } : n
      ));
      setCompletedCount(prev => prev + 1);

      // Update thinking panel
      thinkingLogs.push({
        action: `${node.name} 完成`,
        content: `${node.name} 节点执行完成，输出 ${output.length} 字符`,
        timestamp: Date.now()
      });
      actions.setThinkingData({
        tokenCount: (i + 1) * 500,
        logs: [...thinkingLogs]
      });
    }

    if (!abortRef.current) {
      actions.setThinkingData({ status: 'done' });
      actions.addToast({ type: 'success', message: '流水线执行完成！' });
    }

    setRunning(false);
  }, [input, running, actions]);

  const resetPipeline = useCallback(() => {
    setNodes(pipelineConfig.nodes.map(n => ({
      ...n,
      status: 'idle',
      progress: 0,
      output: ''
    })));
    setRunning(false);
    setCompletedCount(0);
    setExpandedOutput(null);
    abortRef.current = true;
  }, []);

  const toggleOutput = useCallback((nodeId) => {
    setExpandedOutput(prev => prev === nodeId ? null : nodeId);
  }, []);

  return React.createElement('div', { className: 'space-y-4' },
    // 流水线输入
    React.createElement(PipelineInput, {
      value: input,
      onChange: setInput,
      onSubmit: runPipeline,
      running
    }),

    // 流水线状态
    React.createElement('div', {
      className: 'flex items-center justify-between mb-2'
    },
      React.createElement('div', {
        className: 'flex items-center gap-2 text-sm text-gray-400'
      },
        React.createElement(GripVertical, { size: 16, className: 'text-indigo-400' }),
        React.createElement('span', null, 'Agent 流水线'),
        React.createElement('span', { className: 'text-xs text-gray-600' }, `(${completedCount}/${nodes.length})`)
      ),
      running && React.createElement(Button, {
        variant: 'destructive',
        size: 'sm',
        onClick: resetPipeline,
        ariaLabel: '停止流水线'
      },
        React.createElement(Square, { size: 14 }),
        '停止'
      )
    ),

    // 流水线节点
    React.createElement('div', {
      className: 'space-y-1'
    },
      nodes.map((node, i) => React.createElement(React.Fragment, { key: node.id },
        React.createElement(PipelineNode, {
          node,
          isActive: node.status === 'running',
          isDone: node.status === 'done',
          isError: node.status === 'error',
          progress: node.progress,
          onToggleOutput: toggleOutput,
          showOutput: expandedOutput
        }),
        // Edge between nodes
        i < nodes.length - 1 && React.createElement(EdgeLine, {
          active: nodes[i + 1].status === 'running',
          done: nodes[i + 1].status === 'done'
        })
      ))
    ),

    // 完成状态
    !running && completedCount === nodes.length && React.createElement(motion.div, {
      className: 'p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center',
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 }
    },
      React.createElement(CheckCircle2, { size: 24, className: 'text-emerald-400 mx-auto mb-2' }),
      React.createElement('p', { className: 'text-sm font-medium text-emerald-300' }, '流水线执行完成'),
      React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, '所有节点已完成，可查看各节点输出或前往"成果产出"查看完整报告')
    )
  );
}
