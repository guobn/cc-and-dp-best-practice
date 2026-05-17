/**
 * 智能采集模块 (Smart Capture)
 * URL/主题输入 -> 模拟抓取 -> 摘要卡 -> 入知识库
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../lib/store.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import { GlowCard } from '../effects/GlowCard.jsx';
import { AnimatedBeam } from '../effects/AnimatedBeam.jsx';
import { knowledgeCards } from '../../data/knowledge.js';
import {
  Globe,
  Search,
  FileText,
  Tag,
  Clock,
  Link,
  CheckCircle,
  Loader2,
  Plus,
  Sparkles,
  Bookmark,
  ExternalLink,
  Trash2,
  Filter,
  BrainCircuit
} from 'lucide-react';

// 模拟采集动画阶段
const CAPTURE_STAGES = [
  { label: '解析输入...', duration: 400 },
  { label: '抓取网页内容...', duration: 600 },
  { label: '提取关键信息...', duration: 500 },
  { label: '生成摘要...', duration: 500 },
  { label: '完成!', duration: 300 }
];

// 随机颜色用于标签
const TAG_COLORS = [
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
];

function TagBadge({ tag, index }) {
  const colorClass = TAG_COLORS[index % TAG_COLORS.length];
  return React.createElement('span', {
    className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${colorClass}`
  },
    React.createElement(Tag, { size: 10 }),
    tag
  );
}

function SourceBadge({ sourceType }) {
  const typeStyles = {
    '学术论文': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    '技术博客': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '产品博客': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    '技术报告': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    '技术文档': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    '白皮书': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  };

  return React.createElement('span', {
    className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${typeStyles[sourceType] || 'bg-gray-500/20 text-gray-300'}`
  },
    React.createElement(FileText, { size: 10 }),
    sourceType
  );
}

function KnowledgeCard({ card, index, onRemove }) {
  return React.createElement(motion.div, {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -10 },
    transition: { delay: index * 0.08, type: 'spring', damping: 20 }
  },
    React.createElement(GlowCard, { glowColor: 'indigo', glowIntensity: 'low' },
      React.createElement(Card, { className: 'border-0 bg-transparent' },
        CardHeader({ children: [
          React.createElement('div', {
            key: 'header-top',
            className: 'flex items-start justify-between gap-4'
          },
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement(CardTitle, { className: 'text-base mb-1.5' }, card.title)
            ),
            React.createElement(Tooltip, { content: '从知识库移除', side: 'left' },
              React.createElement('button', {
                onClick: () => onRemove?.(card.id),
                className: 'flex-shrink-0 rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors',
                'aria-label': '移除知识卡'
              }, React.createElement(Trash2, { size: 14 }))
            )
          ),
          React.createElement('div', {
            key: 'meta',
            className: 'flex items-center flex-wrap gap-2 mt-2'
          },
            React.createElement(SourceBadge, { sourceType: card.sourceType }),
            React.createElement('div', { className: 'flex items-center gap-1 text-[10px] text-gray-500' },
              React.createElement(Clock, { size: 10 }),
              React.createElement('span', null, new Date(card.collectedAt).toLocaleDateString('zh-CN'))
            ),
            React.createElement('div', { className: 'flex items-center gap-1 text-[10px] text-gray-500' },
              React.createElement(BrainCircuit, { size: 10 }),
              React.createElement('span', null, `${card.tokenCount} tokens`)
            ),
            React.createElement('div', {
              className: `flex items-center gap-1 text-[10px] font-medium ${card.relevance > 0.9 ? 'text-emerald-400' : 'text-gray-400'}`
            },
              React.createElement(CheckCircle, { size: 10 }),
              React.createElement('span', null, `${Math.round(card.relevance * 100)}% 相关度`)
            )
          )
        ]}),
        CardContent({
          children: React.createElement('div', { className: 'space-y-3' },
            // 摘要
            React.createElement('p', {
              className: 'text-sm text-gray-300 leading-relaxed line-clamp-3'
            }, card.summary),
            // 标签
            React.createElement('div', {
              className: 'flex flex-wrap gap-1.5'
            }, card.tags.map((tag, i) => React.createElement(TagBadge, { key: tag, tag, index: i }))),
            // 原文链接
            React.createElement('a', {
              href: card.source,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors'
            },
              React.createElement(Link, { size: 12 }),
              React.createElement('span', { className: 'truncate max-w-[300px]' }, card.source),
              React.createElement(ExternalLink, { size: 10 })
            )
          )
        })
      )
    )
  );
}

function CaptureForm({ onSubmit, loading }) {
  const [inputType, setInputType] = useState('url'); // url | topic
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!inputValue.trim() || loading) return;
    onSubmit(inputType, inputValue.trim());
    if (inputType === 'topic') setInputValue('');
  }, [inputType, inputValue, loading, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit();
    }
  }, [handleSubmit]);

  return React.createElement(Card, { className: 'mb-6 border-gray-700/50' },
    CardContent({
      className: 'p-5',
      children: React.createElement('form', {
        onSubmit: handleSubmit,
        className: 'space-y-4'
      },
        // 输入类型切换
        React.createElement('div', {
          className: 'flex items-center gap-2 bg-gray-800/60 rounded-lg p-1 w-fit border border-gray-700/50'
        },
          React.createElement('button', {
            type: 'button',
            className: `px-3 py-1.5 rounded-md text-xs font-medium transition-all ${inputType === 'url' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`,
            onClick: () => setInputType('url'),
            'aria-label': 'URL 采集模式'
          },
            React.createElement('div', { className: 'flex items-center gap-1.5' },
              React.createElement(Globe, { size: 12 }),
              React.createElement('span', null, 'URL 采集')
            )
          ),
          React.createElement('button', {
            type: 'button',
            className: `px-3 py-1.5 rounded-md text-xs font-medium transition-all ${inputType === 'topic' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`,
            onClick: () => setInputType('topic'),
            'aria-label': '主题采集模式'
          },
            React.createElement('div', { className: 'flex items-center gap-1.5' },
              React.createElement(Search, { size: 12 }),
              React.createElement('span', null, '主题采集')
            )
          )
        ),

        // 输入框
        React.createElement('div', {
          className: 'relative'
        },
          inputType === 'url'
            ? React.createElement('div', {
              className: 'flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all'
            },
              React.createElement(Link, { size: 16, className: 'text-gray-500 flex-shrink-0' }),
              React.createElement('input', {
                type: 'url',
                placeholder: '输入 URL 链接...',
                value: inputValue,
                onChange: (e) => setInputValue(e.target.value),
                onKeyDown: handleKeyDown,
                className: 'flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none',
                disabled: loading,
                'aria-label': '输入要采集的 URL'
              })
            )
            : React.createElement('div', {
              className: 'flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all'
            },
              React.createElement(Search, { size: 16, className: 'text-gray-500 flex-shrink-0' }),
              React.createElement('input', {
                type: 'text',
                placeholder: '输入研究主题...',
                value: inputValue,
                onChange: (e) => setInputValue(e.target.value),
                onKeyDown: handleKeyDown,
                className: 'flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none',
                disabled: loading,
                'aria-label': '输入要采集的主题'
              })
            )
        ),

        // 提交按钮
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('p', { className: 'text-[10px] text-gray-500' },
            loading ? 'AI 正在采集并分析内容...' : '按 Enter 提交，支持 URL 或自然语言主题'
          ),
          React.createElement(Button, {
            type: 'submit',
            disabled: !inputValue.trim() || loading,
            loading,
            size: 'sm',
            ariaLabel: '开始采集'
          },
            loading ? '采集中...' : React.createElement('span', { className: 'flex items-center gap-1.5' },
              React.createElement(Sparkles, { size: 14 }),
              '开始采集'
            )
          )
        )
      )
    })
  );
}

function CaptureProgress({ stage }) {
  return React.createElement('div', {
    className: 'mb-6 p-4 rounded-xl bg-gray-800/60 border border-indigo-500/20'
  },
    React.createElement('div', {
      className: 'flex items-center gap-3'
    },
      React.createElement(Loader2, { size: 20, className: 'text-indigo-400 animate-spin' }),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex items-center justify-between mb-1.5' },
          React.createElement('span', { className: 'text-sm text-gray-200 font-medium' }, CAPTURE_STAGES[stage]?.label || '处理中...'),
          React.createElement('span', { className: 'text-xs text-gray-500' }, `${stage + 1} / ${CAPTURE_STAGES.length}`)
        ),
        React.createElement('div', {
          className: 'h-1.5 bg-gray-700 rounded-full overflow-hidden'
        },
          React.createElement(motion.div, {
            className: 'h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full',
            initial: { width: 0 },
            animate: { width: `${((stage + 1) / CAPTURE_STAGES.length) * 100}%` },
            transition: { duration: 0.5 }
          })
        )
      )
    )
  );
}

export default function CaptureModule() {
  const { state, actions } = useApp();
  const [capturing, setCapturing] = useState(false);
  const [captureStage, setCaptureStage] = useState(0);
  const [capturedCards, setCapturedCards] = useState(knowledgeCards);
  const [filterText, setFilterText] = useState('');
  const abortRef = useRef(false);

  // Start capture simulation
  const startCapture = useCallback(async (type, value) => {
    setCapturing(true);
    setCaptureStage(0);
    abortRef.current = false;

    // 更新思考面板
    actions.setThinkingData({
      prompt: `你是一个智能内容采集器。\n\n输入类型: ${type === 'url' ? 'URL' : '主题'}\n输入内容: ${value}\n\n任务:\n1. 解析输入内容\n2. 识别关键主题\n3. 生成结构化摘要\n4. 提取标签和元数据`,
      tokenCount: 128,
      status: 'thinking',
      logs: [
        { action: '初始化采集', content: `开始处理${type === 'url' ? ' URL' : ' 主题'}输入: ${value}`, timestamp: Date.now() }
      ]
    });

    // 模拟各阶段
    for (let i = 0; i < CAPTURE_STAGES.length; i++) {
      if (abortRef.current) break;
      await new Promise(r => setTimeout(r, CAPTURE_STAGES[i].duration));
      setCaptureStage(i);

      const stageLogs = [
        { action: '解析', content: '正在解析输入内容，提取关键信息...' },
        { action: '抓取', content: '模拟抓取网页内容，共获取 2450 个文本块...' },
        { action: '提取', content: 'NER 实体提取完成，识别到 12 个关键实体...' },
        { action: '生成摘要', content: '使用 LLM 生成结构化摘要，Token 消耗: 892...' },
        { action: '完成', content: '采集完成，知识卡已生成并存入知识库。' }
      ];

      actions.setThinkingData({
        tokenCount: 128 + (i + 1) * 256,
        logs: [
          ...(i === 0 ? [] : state.thinkingData.logs),
          { ...stageLogs[i], timestamp: Date.now() }
        ]
      });
    }

    // 生成新卡片
    const newCard = {
      id: `kc-${Date.now()}`,
      title: type === 'url'
        ? `关于 ${new URL(value).hostname} 的采集报告`
        : `${value} - 主题研究报告`,
      source: value,
      sourceType: type === 'url' ? '技术博客' : '技术报告',
      summary: `基于对 "${value}" 的深入分析，本报告涵盖了核心概念、关键技术选型以及最佳实践建议。研究发现该领域正经历快速迭代，建议持续关注最新进展。`,
      tags: type === 'url' ? ['网页采集', value.split('.').slice(-2, -1)[0] || 'web'] : [value, '主题研究', 'AI分析'],
      collectedAt: new Date().toISOString(),
      relevance: Math.round((0.8 + Math.random() * 0.15) * 100) / 100,
      tokenCount: Math.round(800 + Math.random() * 1200),
      wordCount: Math.round(600 + Math.random() * 900)
    };

    setCapturedCards(prev => [newCard, ...prev]);

    actions.setThinkingData({
      status: 'done',
      tokenCount: 128 + CAPTURE_STAGES.length * 256,
    });

    actions.addToast({ type: 'success', message: '采集完成，新知识卡已加入知识库' });
    setCapturing(false);
  }, [actions, state.thinkingData.logs]);

  const removeCard = useCallback((id) => {
    setCapturedCards(prev => prev.filter(c => c.id !== id));
    actions.addToast({ type: 'info', message: '知识卡已移除' });
  }, [actions]);

  const filteredCards = capturedCards.filter(c =>
    !filterText || c.title.toLowerCase().includes(filterText.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(filterText.toLowerCase()))
  );

  return React.createElement('div', { className: 'space-y-4' },
    // 采集表单
    React.createElement(CaptureForm, { onSubmit: startCapture, loading: capturing }),

    // 采集进度
    capturing && React.createElement(CaptureProgress, { stage: captureStage }),

    // 知识库统计头
    React.createElement('div', {
      className: 'flex items-center justify-between mb-3'
    },
      React.createElement('div', {
        className: 'flex items-center gap-2 text-sm text-gray-400'
      },
        React.createElement(Bookmark, { size: 16, className: 'text-indigo-400' }),
        React.createElement('span', null, `知识库 (${filteredCards.length})`)
      ),
      React.createElement('div', {
        className: 'flex items-center gap-2'
      },
        React.createElement('div', {
          className: 'relative'
        },
          React.createElement(Search, { size: 14, className: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500' }),
          React.createElement('input', {
            type: 'text',
            placeholder: '过滤知识卡...',
            value: filterText,
            onChange: (e) => setFilterText(e.target.value),
            className: 'bg-gray-800/60 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-indigo-500/50 w-40',
            'aria-label': '筛选知识卡'
          })
        )
      )
    ),

    // 知识卡网格
    React.createElement(AnimatePresence, null,
      filteredCards.length === 0
        ? React.createElement('div', {
          key: 'empty',
          className: 'text-center py-16 text-gray-500'
        },
          React.createElement(FileText, { size: 40, className: 'mx-auto mb-3 opacity-30' }),
          React.createElement('p', { className: 'text-sm' }, captureStage ? '采集中...' : '暂无知识卡'),
          React.createElement('p', { className: 'text-xs mt-1 text-gray-600' }, '输入 URL 或主题开始采集')
        )
        : React.createElement('div', {
          className: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
        },
          filteredCards.map((card, i) =>
            React.createElement(KnowledgeCard, { key: card.id, card, index: i, onRemove: removeCard })
          )
        )
    )
  );
}
