/**
 * 成果产出模块 (Deliverables)
 * 三类产出物：调研报告 / 公众号推文 / 周报摘要
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../lib/store.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs.jsx';
import { Spotlight } from '../effects/Spotlight.jsx';
import { GlowCard } from '../effects/GlowCard.jsx';
import { renderMarkdown } from '../../lib/markdown.js';
import { deliverables, getAllDeliverables, getDeliverablesByType, outputTypeConfig } from '../../data/outputs.js';
import {
  FileText,
  Newspaper,
  Calendar,
  Copy,
  Download,
  Eye,
  Check,
  Clock,
  Tag,
  CheckCircle2,
  Edit3,
  Archive,
  AlertCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';

const TYPE_CONFIG = {
  research: { icon: FileText, label: '调研报告', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  article: { icon: Newspaper, label: '公众号推文', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  weekly: { icon: Calendar, label: '周报摘要', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
};

function StatusBadge({ status }) {
  const config = {
    final: { label: '终稿', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    draft: { label: '草稿', icon: Edit3, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    published: { label: '已发布', icon: CheckCircle2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
  };

  const c = config[status] || config.draft;
  return React.createElement('span', {
    className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${c.color}`
  },
    React.createElement(c.icon, { size: 10 }),
    c.label
  );
}

function OutputCard({ item, onView, onCopy, onDownload }) {
  const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.research;
  const Icon = typeCfg.icon;

  return React.createElement(motion.div, {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring', damping: 20 }
  },
    React.createElement(GlowCard, { glowColor: item.type === 'research' ? 'indigo' : item.type === 'article' ? 'pink' : 'emerald', glowIntensity: 'low' },
      React.createElement(Card, { className: 'border-0 bg-transparent' },
        CardHeader({
          className: 'pb-3',
          children: [
            React.createElement('div', {
              key: 'header',
              className: 'flex items-start justify-between gap-3'
            },
              React.createElement('div', {
                className: 'flex items-center gap-3 min-w-0'
              },
                React.createElement('div', {
                  className: `w-10 h-10 rounded-xl ${typeCfg.bg} border ${typeCfg.border} flex items-center justify-center flex-shrink-0`
                }, React.createElement(Icon, { size: 20, className: typeCfg.color })),
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement(CardTitle, { className: 'text-sm mb-1 truncate' }, item.title),
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: `text-[10px] font-medium ${typeCfg.color}` }, typeCfg.label),
                    React.createElement(StatusBadge, { status: item.status })
                  )
                )
              ),
              React.createElement('div', { className: 'flex items-center gap-1 flex-shrink-0' },
                React.createElement(Tooltip, { content: '查看详情' },
                  React.createElement('button', {
                    onClick: () => onView(item),
                    className: 'rounded-lg p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors',
                    'aria-label': '查看详情'
                  }, React.createElement(Eye, { size: 14 }))
                ),
                React.createElement(Tooltip, { content: '复制内容' },
                  React.createElement('button', {
                    onClick: () => onCopy(item),
                    className: 'rounded-lg p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 transition-colors',
                    'aria-label': '复制内容'
                  }, React.createElement(Copy, { size: 14 }))
                ),
                React.createElement(Tooltip, { content: '下载文档' },
                  React.createElement('button', {
                    onClick: () => onDownload(item),
                    className: 'rounded-lg p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors',
                    'aria-label': '下载文档'
                  }, React.createElement(Download, { size: 14 }))
                )
              )
            ),
            // Summary
            React.createElement('p', {
              key: 'summary',
              className: 'text-xs text-gray-400 leading-relaxed mt-2 line-clamp-2'
            }, item.summary)
          ]
        }),
        CardFooter({
          className: 'pt-3 border-t border-gray-800/50',
          children: React.createElement('div', { className: 'flex items-center justify-between w-full' },
            React.createElement('div', { className: 'flex items-center gap-3' },
              React.createElement('div', { className: 'flex items-center gap-1 text-[10px] text-gray-500' },
                React.createElement(Clock, { size: 10 }),
                React.createElement('span', null, new Date(item.createdAt).toLocaleDateString('zh-CN'))
              ),
              React.createElement('div', { className: 'flex items-center gap-1 text-[10px] text-gray-500' },
                React.createElement(BookOpen, { size: 10 }),
                React.createElement('span', null, `${item.wordCount} 字`)
              )
            ),
            React.createElement('div', { className: 'flex flex-wrap gap-1' },
              item.tags?.map(t => React.createElement('span', {
                key: t,
                className: 'text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500'
              }, t))
            )
          )
        })
      )
    )
  );
}

function OutputPreview({ item, onClose }) {
  const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.research;
  const Icon = typeCfg.icon;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(item.content).then(() => {
      // Could add toast here
    });
  }, [item.content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [item.content, item.title]);

  return React.createElement(Dialog, {
    open: !!item,
    onClose,
    title: item.title,
    size: 'xl'
  },
    React.createElement('div', { className: 'space-y-4' },
      // Meta info
      React.createElement('div', {
        className: 'flex items-center flex-wrap gap-3 pb-4 border-b border-gray-800'
      },
        React.createElement('div', {
          className: `flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeCfg.bg} ${typeCfg.color} border ${typeCfg.border}`
        },
          React.createElement(Icon, { size: 12 }),
          typeCfg.label
        ),
        React.createElement(StatusBadge, { status: item.status }),
        React.createElement('span', { className: 'text-xs text-gray-500' },
          `${item.wordCount} 字 | ${new Date(item.createdAt).toLocaleDateString('zh-CN')}`
        ),
        item.tags?.map(t => React.createElement('span', {
          key: t,
          className: 'text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500'
        }, t))
      ),

      // Content (rendered markdown)
      React.createElement('div', {
        className: 'prose prose-invert prose-sm max-w-none max-h-[50vh] overflow-y-auto leading-relaxed'
      }, renderMarkdown(item.content)),

      // Actions
      React.createElement('div', {
        className: 'flex items-center justify-end gap-2 pt-4 border-t border-gray-800'
      },
        React.createElement(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: handleCopy,
          ariaLabel: '复制内容'
        },
          React.createElement(Copy, { size: 14 }),
          '复制全文'
        ),
        React.createElement(Button, {
          variant: 'default',
          size: 'sm',
          onClick: handleDownload,
          ariaLabel: '下载文档'
        },
          React.createElement(Download, { size: 14 }),
          '下载 Markdown'
        )
      )
    )
  );
}

export default function OutputModule() {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState('research');
  const [viewingItem, setViewingItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const items = getDeliverablesByType(activeTab);

  const handleView = useCallback((item) => {
    setViewingItem(item);
  }, []);

  const handleCopy = useCallback((item) => {
    navigator.clipboard.writeText(item.content).then(() => {
      setCopiedId(item.id);
      actions.addToast({ type: 'success', message: '内容已复制到剪贴板' });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [actions]);

  const handleDownload = useCallback((item) => {
    const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    actions.addToast({ type: 'success', message: '文件已下载' });
  }, [actions]);

  const allItems = [
    ...deliverables.research,
    ...deliverables.article,
    ...deliverables.weekly
  ];

  return React.createElement('div', { className: 'space-y-4' },
    // Tabs for output types
    React.createElement(Tabs, {
      defaultValue: 'research',
      value: activeTab,
      onValueChange: setActiveTab,
      className: 'w-full'
    },
      React.createElement(TabsList, { className: 'mb-6' },
        React.createElement(TabsTrigger, { value: 'research' },
          React.createElement(FileText, { size: 14 }),
          React.createElement('span', { className: 'ml-1.5' }, '调研报告'),
          React.createElement('span', { className: 'ml-1.5 text-[10px] text-gray-500' }, `(${deliverables.research.length})`)
        ),
        React.createElement(TabsTrigger, { value: 'article' },
          React.createElement(Newspaper, { size: 14 }),
          React.createElement('span', { className: 'ml-1.5' }, '公众号推文'),
          React.createElement('span', { className: 'ml-1.5 text-[10px] text-gray-500' }, `(${deliverables.article.length})`)
        ),
        React.createElement(TabsTrigger, { value: 'weekly' },
          React.createElement(Calendar, { size: 14 }),
          React.createElement('span', { className: 'ml-1.5' }, '周报摘要'),
          React.createElement('span', { className: 'ml-1.5 text-[10px] text-gray-500' }, `(${deliverables.weekly.length})`)
        )
      ),

      React.createElement(TabsContent, { value: 'research' },
        items.length === 0
          ? React.createElement('div', { className: 'text-center py-16 text-gray-500' },
            React.createElement(FileText, { size: 40, className: 'mx-auto mb-3 opacity-30' }),
            React.createElement('p', { className: 'text-sm' }, '暂无调研报告'),
            React.createElement('p', { className: 'text-xs mt-1 text-gray-600' }, '运行 Agent 流水线生成调研报告')
          )
          : React.createElement('div', {
            className: 'space-y-3'
          }, items.map((item, i) =>
            React.createElement(OutputCard, {
              key: item.id,
              item,
              index: i,
              onView: handleView,
              onCopy: handleCopy,
              onDownload: handleDownload
            })
          ))
      ),

      React.createElement(TabsContent, { value: 'article' },
        items.length === 0
          ? React.createElement('div', { className: 'text-center py-16 text-gray-500' },
            React.createElement(Newspaper, { size: 40, className: 'mx-auto mb-3 opacity-30' }),
            React.createElement('p', { className: 'text-sm' }, '暂无公众号推文'),
            React.createElement('p', { className: 'text-xs mt-1 text-gray-600' }, '运行 Agent 流水线生成推文')
          )
          : React.createElement('div', {
            className: 'space-y-3'
          }, items.map((item, i) =>
            React.createElement(OutputCard, {
              key: item.id,
              item,
              index: i,
              onView: handleView,
              onCopy: handleCopy,
              onDownload: handleDownload
            })
          ))
      ),

      React.createElement(TabsContent, { value: 'weekly' },
        items.length === 0
          ? React.createElement('div', { className: 'text-center py-16 text-gray-500' },
            React.createElement(Calendar, { size: 40, className: 'mx-auto mb-3 opacity-30' }),
            React.createElement('p', { className: 'text-sm' }, '暂无周报摘要'),
            React.createElement('p', { className: 'text-xs mt-1 text-gray-600' }, '运行 Agent 流水线生成周报')
          )
          : React.createElement('div', {
            className: 'space-y-3'
          }, items.map((item, i) =>
            React.createElement(OutputCard, {
              key: item.id,
              item,
              index: i,
              onView: handleView,
              onCopy: handleCopy,
              onDownload: handleDownload
            })
          ))
      )
    ),

    // Preview Dialog
    React.createElement(OutputPreview, {
      item: viewingItem,
      onClose: () => setViewingItem(null)
    })
  );
}
