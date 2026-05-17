/**
 * 知识对话模块 (RAG Chat)
 * 基于知识卡的流式对话 + 引用回链
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../lib/store.js';
import { Card, CardContent } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import { GlowCard } from '../effects/GlowCard.jsx';
import { renderMarkdown } from '../../lib/markdown.js';
import { chatHistory, suggestedQuestions, getSimulatedResponse, defaultResponse } from '../../data/chat.js';
import { knowledgeCards } from '../../data/knowledge.js';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Quote,
  BookOpen,
  Loader2,
  Clipboard,
  Check,
  Lightbulb,
  Plus
} from 'lucide-react';

function CitationBadge({ id, label }) {
  return React.createElement('a', {
    href: `#citation-${id}`,
    className: 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 transition-colors cursor-pointer',
    title: `查看引用: ${label}`
  }, `[${label}]`);
}

function MessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  return React.createElement(motion.div, {
    className: `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`,
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
    // 头像
    React.createElement('div', {
      className: `flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isUser ? 'bg-indigo-600/30' : 'bg-gray-800'}`,
    },
      isUser
        ? React.createElement(User, { size: 16, className: 'text-indigo-400' })
        : React.createElement(Bot, { size: 16, className: 'text-emerald-400' })
    ),

    // 消息内容
    React.createElement('div', {
      className: `flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`
    },
      // 引用标注
      !isUser && message.citations && message.citations.length > 0 && React.createElement('div', {
        className: 'flex items-center gap-1.5 mb-1.5'
      },
        React.createElement(BookOpen, { size: 12, className: 'text-indigo-400' }),
        React.createElement('span', { className: 'text-[10px] text-gray-500' }, '引用了'),
        message.citations.map((cid, i) => {
          const card = knowledgeCards.find(k => k.id === cid);
          return React.createElement(CitationBadge, {
            key: cid,
            id: cid,
            label: card ? card.tags[0] || cid : cid
          });
        })
      ),

      // 气泡
      React.createElement('div', {
        className: `relative group rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-indigo-600/20 border border-indigo-500/30 text-gray-100' : 'bg-gray-800/60 border border-gray-700/50 text-gray-200'}`,
        style: isStreaming ? { borderLeft: '3px solid #6366f1' } : {}
      },
        // 渲染 Markdown
        React.createElement('div', { className: 'prose prose-invert prose-sm max-w-none [&_pre]:bg-gray-900 [&_code]:text-emerald-300' },
          renderMarkdown(message.content)
        ),

        // 复制按钮
        React.createElement(Tooltip, { content: copied ? '已复制' : '复制内容', side: 'top' },
          React.createElement('button', {
            onClick: handleCopy,
            className: `absolute top-2 right-2 rounded-lg p-1.5 transition-all opacity-0 group-hover:opacity-100 ${copied ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`,
            'aria-label': '复制消息'
          }, copied ? React.createElement(Check, { size: 14 }) : React.createElement(Clipboard, { size: 14 }))
        )
      ),

      // Token 信息
      !isUser && message.tokenCount && React.createElement('div', {
        className: 'flex items-center gap-2 mt-1 px-1'
      },
        React.createElement('span', { className: 'text-[10px] text-gray-600' }, `${message.tokenCount} tokens`),
        React.createElement('span', { className: 'text-[10px] text-gray-600' }, 'deepseek-v4-pro[1m]')
      )
    )
  );
}

function StreamingMessage({ content }) {
  if (!content) return null;

  return React.createElement('div', { className: 'flex gap-3' },
    React.createElement('div', {
      className: 'flex-shrink-0 w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center'
    },
      React.createElement(Bot, { size: 16, className: 'text-emerald-400' })
    ),
    React.createElement('div', { className: 'flex-1 max-w-[85%]' },
      React.createElement('div', {
        className: 'relative rounded-2xl px-4 py-3 text-sm leading-relaxed bg-gray-800/60 border border-gray-700/50 text-gray-200',
        style: { borderLeft: '3px solid #6366f1' }
      },
        React.createElement('div', { className: 'prose prose-invert prose-sm max-w-none' },
          renderMarkdown(content)
        ),
        React.createElement('span', {
          className: 'inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-text-bottom'
        })
      )
    )
  );
}

function SuggestedQuestion({ question, onClick, index }) {
  return React.createElement(motion.button, {
    className: 'flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 hover:bg-gray-700/50 hover:border-indigo-500/30 hover:text-white transition-all text-left w-full',
    onClick: () => onClick(question),
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.1 },
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 }
  },
    React.createElement(Lightbulb, { size: 14, className: 'text-amber-400 flex-shrink-0' }),
    React.createElement('span', { className: 'flex-1' }, question),
    React.createElement(Plus, { size: 14, className: 'text-gray-500 flex-shrink-0' })
  );
}

export default function ChatModule() {
  const { state, actions } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(chatHistory);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamTimeoutRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async (text) => {
    const query = text || input;
    if (!query.trim() || isStreaming) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');
    setShowSuggestions(false);

    // Update thinking panel
    actions.setThinkingPanel(true);
    actions.setThinkingData({
      prompt: `你是一个基于知识库的 AI 助手。\n\n用户问题: ${query}\n\n可用知识库:\n${knowledgeCards.map(k => `- [${k.id}] ${k.title} (相关度: ${k.relevance})`).join('\n')}\n\n请根据知识库内容回答用户问题。如果问题超出知识库范围，明确告知用户。`,
      tokenCount: 0,
      status: 'thinking',
      logs: [
        { action: '接收查询', content: `收到用户查询: "${query}"`, timestamp: Date.now() },
        { action: '知识检索', content: `正在检索知识库，匹配到 ${knowledgeCards.length} 条相关知识...`, timestamp: Date.now() + 100 },
        { action: '排序过滤', content: '根据语义相似度排序并筛选最相关结果...', timestamp: Date.now() + 300 }
      ]
    });

    // Simulate streaming
    const simulatedResponse = getSimulatedResponse(query) || defaultResponse;
    let charIndex = 0;
    const chars = simulatedResponse.split('');
    let accumulated = '';

    // Add thinking logs
    await new Promise(r => setTimeout(r, 500));
    actions.setThinkingData({
      tokenCount: 384,
      logs: [
        ...state.thinkingData.logs,
        { action: '推理', content: `开始生成回答，模型: deepseek-v4-pro[1m]，温度: 0.7`, timestamp: Date.now() }
      ]
    });

    function typeNextChar() {
      if (charIndex >= chars.length) {
        // Done streaming
        const assistantMessage = {
          id: `msg-${Date.now()}-resp`,
          role: 'assistant',
          content: accumulated,
          citations: ['kc-001', 'kc-005'],
          timestamp: new Date().toISOString(),
          tokenCount: Math.round(accumulated.length * 0.75)
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsStreaming(false);
        setStreamingContent('');

        actions.setThinkingData({
          status: 'done',
          tokenCount: Math.round(accumulated.length * 0.75),
          logs: [
            ...state.thinkingData.logs,
            { action: '完成', content: `回答生成完成，共 ${accumulated.length} 字符，${Math.round(accumulated.length * 0.75)} tokens`, timestamp: Date.now() }
          ]
        });
        return;
      }

      const char = chars[charIndex];
      accumulated += char;
      setStreamingContent(accumulated);
      charIndex++;

      // Variable speed for realistic effect
      let delay = 15;
      if (char === '\n') delay = 80;
      else if (char === '。' || char === '！' || char === '？') delay = 120;
      else if (char === '，' || char === '；') delay = 40;
      else if (char === ' ' || char === '\t') delay = 5;

      streamTimeoutRef.current = setTimeout(typeNextChar, delay);
    }

    typeNextChar();
  }, [input, isStreaming, actions, state.thinkingData.logs]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setShowSuggestions(true);
    actions.addToast({ type: 'info', message: '对话已清空' });
  }, [actions]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleSuggestedClick = useCallback((question) => {
    setInput('');
    sendMessage(question);
  }, [sendMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    };
  }, []);

  return React.createElement('div', { className: 'flex flex-col h-[calc(100vh-12rem)]' },
    // 对话历史
    React.createElement('div', {
      className: 'flex-1 overflow-y-auto space-y-4 mb-4 px-1'
    },
      // 欢迎信息（无对话时）
      (messages.length === 0 || (messages.length === 0 && showSuggestions))
        ? React.createElement('div', {
          className: 'text-center py-16'
        },
          React.createElement('div', {
            className: 'w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20'
          },
            React.createElement(MessageSquare, { size: 28, className: 'text-indigo-400' })
          ),
          React.createElement('h3', { className: 'text-lg font-semibold text-white mb-2' }, '开始知识对话'),
          React.createElement('p', { className: 'text-sm text-gray-400 max-w-md mx-auto mb-8' },
            '基于知识库进行智能问答，支持多轮对话与引用溯源。输入你的问题或选择下方推荐问题开始。'
          )
        )
        : React.createElement('div', { className: 'space-y-4' },
          messages.map(msg => React.createElement(MessageBubble, { key: msg.id, message: msg })),
          // Streaming message
          isStreaming && React.createElement(StreamingMessage, { content: streamingContent })
        ),

      // Divider between messages and suggestions
      showSuggestions && messages.length === 0 && React.createElement('div', {
        className: 'space-y-2'
      },
        React.createElement('p', { className: 'text-xs text-gray-500 mb-3 flex items-center gap-2' },
          React.createElement(Sparkles, { size: 12 }),
          '推荐问题'
        ),
        suggestedQuestions.map((q, i) =>
          React.createElement(SuggestedQuestion, {
            key: q,
            question: q,
            index: i,
            onClick: handleSuggestedClick
          })
        )
      ),

      React.createElement('div', { ref: chatEndRef })
    ),

    // 操作栏
    messages.length > 0 && React.createElement('div', {
      className: 'flex items-center justify-between mb-3'
    },
      React.createElement('div', {
        className: 'flex items-center gap-2 text-xs text-gray-500'
      },
        React.createElement(BookOpen, { size: 12 }),
        React.createElement('span', null, `${messages.filter(m => m.role === 'assistant').length} 条回复`)
      ),
      React.createElement(Tooltip, { content: '清空对话历史' },
        React.createElement('button', {
          onClick: clearChat,
          className: 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors',
          'aria-label': '清空对话'
        },
          React.createElement(Trash2, { size: 12 }),
          '清空对话'
        )
      )
    ),

    // 输入区
    React.createElement(GlowCard, { glowColor: 'indigo', glowIntensity: 'low', className: 'flex-shrink-0' },
      React.createElement('div', {
        className: 'flex items-end gap-3 p-3 bg-gray-900/90 rounded-xl border border-gray-800'
      },
        React.createElement('div', {
          className: 'flex-1 relative'
        },
          React.createElement('textarea', {
            ref: inputRef,
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: '输入你的问题... (Enter 发送, Shift+Enter 换行)',
            rows: 2,
            className: 'w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none resize-none leading-relaxed',
            disabled: isStreaming,
            'aria-label': '输入问题'
          })
        ),
        React.createElement(Tooltip, { content: isStreaming ? '正在生成回复...' : '发送消息' },
          React.createElement(Button, {
            onClick: () => sendMessage(),
            disabled: !input.trim() || isStreaming,
            loading: isStreaming,
            size: 'icon',
            variant: 'default',
            className: 'rounded-xl',
            ariaLabel: '发送消息'
          },
            isStreaming
              ? React.createElement(Loader2, { size: 16, className: 'animate-spin' })
              : React.createElement(Send, { size: 16 })
          )
        )
      )
    )
  );
}
