/**
 * app.jsx - 应用主入口
 * 配置 React 根、全局 Provider、模块路由
 */
import React, { useCallback, useMemo, useEffect, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, useApp } from './lib/store.js';
import Layout from './components/Layout.jsx';
import ThinkingPanel from './components/ThinkingPanel.jsx';
import CaptureModule from './components/modules/CaptureModule.jsx';
import ChatModule from './components/modules/ChatModule.jsx';
import PipelineModule from './components/modules/PipelineModule.jsx';
import OutputModule from './components/modules/OutputModule.jsx';

/**
 * 模块路由器 - 根据 activeModule 渲染对应模块
 */
function ModuleRouter() {
  const { state } = useApp();
  const { activeModule } = state;

  switch (activeModule) {
    case 'capture':
      return React.createElement(CaptureModule);
    case 'chat':
      return React.createElement(ChatModule);
    case 'pipeline':
      return React.createElement(PipelineModule);
    case 'output':
      return React.createElement(OutputModule);
    default:
      return React.createElement(CaptureModule);
  }
}

/**
 * 应用根组件
 */
function App() {
  const { state, actions } = useApp();
  const { theme } = state;

  // 应用主题
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return React.createElement(React.Fragment, null,
    React.createElement(Layout, null,
      React.createElement(ModuleRouter, null)
    ),
    React.createElement(ThinkingPanel, null)
  );
}

/**
 * 启动应用
 */
export function bootstrap() {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    React.createElement(React.StrictMode, null,
      React.createElement(AppProvider, null,
        React.createElement(App)
      )
    )
  );
}

export default App;
