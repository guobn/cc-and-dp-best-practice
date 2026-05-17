/**
 * Layout 组件 - 顶部 Header + 左侧 Sidebar + 主内容区
 * 包含：暗/亮模式切换、模块导航、Toast 通知
 */
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../lib/store.js';
import Switch from './ui/Switch.jsx';
import Tooltip from './ui/Tooltip.jsx';
import { Spotlight } from './effects/Spotlight.jsx';
import {
  Brain,
  Sparkles,
  MessageSquare,
  GitBranch,
  FileText,
  PanelRightOpen,
  Sun,
  Moon,
  Github,
  Zap
} from 'lucide-react';

// 模块导航配置
const modules = [
  { id: 'capture', label: '智能采集', icon: Sparkles, description: 'URL/主题抓取与摘要' },
  { id: 'chat', label: '知识对话', icon: MessageSquare, description: '基于知识库的 RAG 问答' },
  { id: 'pipeline', label: '工作流编排', icon: GitBranch, description: 'Agent 流水线执行' },
  { id: 'output', label: '成果产出', icon: FileText, description: '报告/推文/周报管理' }
];

/**
 * Toast 通知组件
 */
function Toast({ toast }) {
  const { actions } = useApp();
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => actions.removeToast(toast.id), 300);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, []);

  const typeStyles = {
    success: 'bg-emerald-900/80 border-emerald-700 text-emerald-200',
    error: 'bg-red-900/80 border-red-700 text-red-200',
    info: 'bg-indigo-900/80 border-indigo-700 text-indigo-200',
    warning: 'bg-yellow-900/80 border-yellow-700 text-yellow-200'
  };

  return React.createElement(motion.div, {
    className: `px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm text-sm ${typeStyles[toast.type] || typeStyles.info}`,
    initial: { opacity: 0, y: -20, scale: 0.9 },
    animate: isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.9 },
    transition: { type: 'spring', damping: 20 }
  }, toast.message);
}

/**
 * 顶部 Header
 */
function Header({ onToggleThinking }) {
  const { state, actions } = useApp();
  const { theme } = state;

  const toggleTheme = useCallback(() => {
    actions.toggleTheme();
    document.documentElement.classList.toggle('dark', theme === 'light');
  }, [theme, actions]);

  return React.createElement('header', {
    className: 'h-14 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 z-30'
  },
    // 左侧 Logo
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('div', {
        className: 'w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center'
      }, React.createElement(Brain, { size: 18, className: 'text-white' })),
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-sm font-bold text-white leading-tight' }, 'AI 工作站'),
        React.createElement('p', { className: 'text-[10px] text-gray-500' }, 'DeepSeek Agent Pro')
      )
    ),

    // 右侧操作区
    React.createElement('div', { className: 'flex items-center gap-3' },
      // 模型标签
      React.createElement('div', {
        className: 'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700'
      },
        React.createElement(Zap, { size: 12, className: 'text-yellow-400' }),
        React.createElement('span', { className: 'text-[11px] text-gray-300 font-mono' }, 'deepseek-v4-pro[1m]')
      ),

      // 暗/亮模式切换
      React.createElement(Tooltip, { content: theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式', side: 'bottom' },
        React.createElement('div', {
          className: 'flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-800/50 border border-gray-700/50'
        },
          React.createElement(Sun, { size: 14, className: theme === 'dark' ? 'text-gray-500' : 'text-yellow-400' }),
          React.createElement(Switch, {
            checked: theme === 'dark',
            onCheckedChange: toggleTheme,
            size: 'sm',
            ariaLabel: '切换暗/亮模式'
          }),
          React.createElement(Moon, { size: 14, className: theme === 'dark' ? 'text-indigo-400' : 'text-gray-500' })
        )
      ),

      // 思考面板开关
      React.createElement(Tooltip, { content: '打开 AI 思考面板', side: 'bottom' },
        React.createElement('button', {
          onClick: onToggleThinking,
          className: 'rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors',
          'aria-label': '打开 AI 思考面板'
        }, React.createElement(PanelRightOpen, { size: 18 }))
      ),

      // GitHub 链接
      React.createElement('a', {
        href: '#',
        className: 'hidden sm:flex rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors',
        'aria-label': 'GitHub 仓库'
      }, React.createElement(Github, { size: 18 }))
    )
  );
}

/**
 * 左侧 Sidebar
 */
function Sidebar({ modules, activeModule, onModuleChange }) {
  return React.createElement('aside', {
    className: 'w-60 flex-shrink-0 border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm flex flex-col overflow-y-auto',
    'aria-label': '模块导航'
  },
    // 导航
    React.createElement('nav', { className: 'flex-1 px-3 py-4 space-y-1' },
      modules.map(mod => {
        const isActive = mod.id === activeModule;
        const Icon = mod.icon;

        return React.createElement('button', {
          key: mod.id,
          onClick: () => onModuleChange(mod.id),
          className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`,
          'aria-label': `${mod.label} - ${mod.description}`,
          'aria-current': isActive ? 'page' : undefined
        },
          // 活跃指示器
          isActive && React.createElement(motion.span, {
            layoutId: 'sidebar-active',
            className: 'absolute inset-0 rounded-xl bg-indigo-600/20 border border-indigo-500/30',
            transition: { type: 'spring', stiffness: 380, damping: 30 }
          }),

          // 图标
          React.createElement('span', {
            className: `relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/30 text-indigo-400' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700'}`,
          }, React.createElement(Icon, { size: 16 })),

          // 标签
          React.createElement('span', { className: 'relative z-10' }, mod.label),

          // 提示
          !isActive && React.createElement('span', {
            className: 'ml-auto relative z-10 text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity'
          }, '切换')
        );
      })
    ),

    // 底部信息
    React.createElement('div', {
      className: 'px-4 py-3 border-t border-gray-800'
    },
      React.createElement('div', {
        className: 'flex items-center gap-2 text-[10px] text-gray-600'
      },
        React.createElement('div', {
          className: 'w-1.5 h-1.5 rounded-full bg-emerald-500'
        }),
        React.createElement('span', null, '系统运行中'),
        React.createElement('span', { className: 'ml-auto' }, 'v2.4.0')
      )
    )
  );
}

/**
 * 主 Layout - 组合所有布局元素
 */
export default function Layout({ children }) {
  const { state, actions } = useApp();
  const { activeModule, theme, toasts } = state;

  const handleModuleChange = useCallback((moduleId) => {
    actions.setActiveModule(moduleId);
    actions.setThinkingData({
      prompt: `切换到模块: ${modules.find(m => m.id === moduleId)?.label || moduleId}`,
      status: 'idle'
    });
    actions.addToast({
      type: 'info',
      message: `切换到 ${modules.find(m => m.id === moduleId)?.label || ''}`,
      duration: 1500
    });
  }, [actions]);

  const handleToggleThinking = useCallback(() => {
    actions.setThinkingPanel(!state.thinkingPanelOpen);
  }, [state.thinkingPanelOpen, actions]);

  return React.createElement(Spotlight, {
    className: 'min-h-screen bg-gray-950 text-gray-100 flex flex-col',
    color: 'indigo',
    opacity: 0.06
  },
    // Toast 容器
    React.createElement('div', {
      className: 'fixed top-4 right-4 z-50 flex flex-col gap-2 min-w-[280px]'
    },
      React.createElement(AnimatePresence, null,
        toasts.map(t => React.createElement(Toast, { key: t.id, toast: t }))
      )
    ),

    // Header
    React.createElement(Header, { onToggleThinking: handleToggleThinking }),

    // 主体
    React.createElement('div', { className: 'flex flex-1 overflow-hidden' },
      // Sidebar
      React.createElement(Sidebar, {
        modules,
        activeModule,
        onModuleChange: handleModuleChange
      }),

      // 主内容区
      React.createElement('main', {
        className: 'flex-1 overflow-y-auto p-4 lg:p-6 max-w-7xl mx-auto w-full',
        'aria-label': '主内容区域'
      },
        // 模块标题
        React.createElement(motion.div, {
          key: activeModule,
          className: 'mb-6',
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.2 }
        },
          React.createElement('h2', {
            className: 'text-xl font-bold text-white'
          }, modules.find(m => m.id === activeModule)?.label || ''),
          React.createElement('p', {
            className: 'text-sm text-gray-400 mt-1'
          }, modules.find(m => m.id === activeModule)?.description || '')
        ),

        // 子内容
        React.createElement(AnimatePresence, { mode: 'wait' },
          React.createElement(motion.div, {
            key: activeModule,
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -20 },
            transition: { duration: 0.2 }
          }, children)
        )
      )
    )
  );
}
