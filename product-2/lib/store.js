/**
 * 全局状态管理 - 使用 useReducer 的跨模块状态共享
 *
 * 设计思路：
 * - 单一状态树，所有模块可访问
 * - 通过 Context + useReducer 实现
 * - 每个模块只更新自己关心的状态片段
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// ============== 初始状态 ==============
export const initialState = {
  // 全局
  theme: 'dark',
  activeModule: 'capture',
  thinkingPanelOpen: false,
  thinkingData: {
    model: 'deepseek-v4-pro[1m]',
    prompt: '',
    tokenCount: 0,
    status: 'idle', // idle | thinking | done
    logs: []
  },
  toasts: [],

  // 知识库
  knowledge: {
    cards: [],
    loading: false,
    searchQuery: ''
  },

  // 对话
  chat: {
    messages: [],
    isStreaming: false,
    streamingContent: ''
  },

  // 流水线
  pipeline: {
    nodes: [],
    edges: [],
    running: false,
    currentNode: null,
    speed: 1
  },

  // 产出物
  deliverables: {
    items: [],
    activeTab: 'research',
    viewingItem: null
  }
};

// ============== Action Types ==============
export const ActionTypes = {
  // 全局
  SET_THEME: 'SET_THEME',
  SET_ACTIVE_MODULE: 'SET_ACTIVE_MODULE',
  SET_THINKING_PANEL: 'SET_THINKING_PANEL',
  SET_THINKING_DATA: 'SET_THINKING_DATA',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',

  // 知识库
  SET_KNOWLEDGE_CARDS: 'SET_KNOWLEDGE_CARDS',
  SET_KNOWLEDGE_LOADING: 'SET_KNOWLEDGE_LOADING',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  ADD_KNOWLEDGE_CARD: 'ADD_KNOWLEDGE_CARD',

  // 对话
  ADD_MESSAGE: 'ADD_MESSAGE',
  CLEAR_CHAT: 'CLEAR_CHAT',
  SET_STREAMING: 'SET_STREAMING',
  SET_STREAMING_CONTENT: 'SET_STREAMING_CONTENT',
  APPEND_STREAMING_CONTENT: 'APPEND_STREAMING_CONTENT',
  COMMIT_STREAMING: 'COMMIT_STREAMING',

  // 流水线
  INIT_PIPELINE: 'INIT_PIPELINE',
  SET_PIPELINE_RUNNING: 'SET_PIPELINE_RUNNING',
  SET_NODE_STATUS: 'SET_NODE_STATUS',
  SET_NODE_PROGRESS: 'SET_NODE_PROGRESS',
  SET_NODE_OUTPUT: 'SET_NODE_OUTPUT',
  SET_CURRENT_NODE: 'SET_CURRENT_NODE',
  RESET_PIPELINE: 'RESET_PIPELINE',

  // 产出物
  SET_DELIVERABLES: 'SET_DELIVERABLES',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_VIEWING_ITEM: 'SET_VIEWING_ITEM'
};

// ============== Reducer ==============
export function appReducer(state, action) {
  switch (action.type) {
    // 全局
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    case ActionTypes.SET_ACTIVE_MODULE:
      return { ...state, activeModule: action.payload };
    case ActionTypes.SET_THINKING_PANEL:
      return { ...state, thinkingPanelOpen: action.payload };
    case ActionTypes.SET_THINKING_DATA:
      return { ...state, thinkingData: { ...state.thinkingData, ...action.payload } };
    case ActionTypes.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };
    case ActionTypes.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    // 知识库
    case ActionTypes.SET_KNOWLEDGE_CARDS:
      return { ...state, knowledge: { ...state.knowledge, cards: action.payload } };
    case ActionTypes.SET_KNOWLEDGE_LOADING:
      return { ...state, knowledge: { ...state.knowledge, loading: action.payload } };
    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, knowledge: { ...state.knowledge, searchQuery: action.payload } };
    case ActionTypes.ADD_KNOWLEDGE_CARD:
      return { ...state, knowledge: { ...state.knowledge, cards: [action.payload, ...state.knowledge.cards] } };

    // 对话
    case ActionTypes.ADD_MESSAGE:
      return { ...state, chat: { ...state.chat, messages: [...state.chat.messages, action.payload] } };
    case ActionTypes.CLEAR_CHAT:
      return { ...state, chat: { ...state.chat, messages: [], streamingContent: '' } };
    case ActionTypes.SET_STREAMING:
      return { ...state, chat: { ...state.chat, isStreaming: action.payload } };
    case ActionTypes.SET_STREAMING_CONTENT:
      return { ...state, chat: { ...state.chat, streamingContent: action.payload } };
    case ActionTypes.APPEND_STREAMING_CONTENT:
      return { ...state, chat: { ...state.chat, streamingContent: state.chat.streamingContent + action.payload } };
    case ActionTypes.COMMIT_STREAMING:
      return {
        ...state,
        chat: {
          messages: [...state.chat.messages, action.payload],
          isStreaming: false,
          streamingContent: ''
        }
      };

    // 流水线
    case ActionTypes.INIT_PIPELINE:
      return { ...state, pipeline: { ...state.pipeline, nodes: action.payload.nodes, edges: action.payload.edges } };
    case ActionTypes.SET_PIPELINE_RUNNING:
      return { ...state, pipeline: { ...state.pipeline, running: action.payload } };
    case ActionTypes.SET_NODE_STATUS:
      return {
        ...state,
        pipeline: {
          ...state.pipeline,
          nodes: state.pipeline.nodes.map(n =>
            n.id === action.payload.id ? { ...n, status: action.payload.status } : n
          )
        }
      };
    case ActionTypes.SET_NODE_PROGRESS:
      return {
        ...state,
        pipeline: {
          ...state.pipeline,
          nodes: state.pipeline.nodes.map(n =>
            n.id === action.payload.id ? { ...n, progress: action.payload.progress } : n
          )
        }
      };
    case ActionTypes.SET_NODE_OUTPUT:
      return {
        ...state,
        pipeline: {
          ...state.pipeline,
          nodes: state.pipeline.nodes.map(n =>
            n.id === action.payload.id ? { ...n, output: action.payload.output } : n
          )
        }
      };
    case ActionTypes.SET_CURRENT_NODE:
      return { ...state, pipeline: { ...state.pipeline, currentNode: action.payload } };
    case ActionTypes.RESET_PIPELINE:
      return {
        ...state,
        pipeline: {
          ...state.pipeline,
          running: false,
          currentNode: null,
          nodes: state.pipeline.nodes.map(n => ({
            ...n,
            status: 'idle',
            progress: 0,
            output: ''
          }))
        }
      };

    // 产出物
    case ActionTypes.SET_DELIVERABLES:
      return { ...state, deliverables: { ...state.deliverables, items: action.payload } };
    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, deliverables: { ...state.deliverables, activeTab: action.payload } };
    case ActionTypes.SET_VIEWING_ITEM:
      return { ...state, deliverables: { ...state.deliverables, viewingItem: action.payload } };

    default:
      return state;
  }
}

// ============== Context ==============
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ============== Actions ==============
  const actions = useMemo(() => ({
    // 全局
    setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    setActiveModule: (mod) => dispatch({ type: ActionTypes.SET_ACTIVE_MODULE, payload: mod }),
    toggleTheme: () => dispatch({
      type: ActionTypes.SET_THEME,
      payload: state.theme === 'dark' ? 'light' : 'dark'
    }),
    setThinkingPanel: (open) => dispatch({ type: ActionTypes.SET_THINKING_PANEL, payload: open }),
    setThinkingData: (data) => dispatch({ type: ActionTypes.SET_THINKING_DATA, payload: data }),
    addToast: (toast) => dispatch({ type: ActionTypes.ADD_TOAST, payload: { ...toast, id: Date.now() } }),
    removeToast: (id) => dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id }),

    // 知识库
    setKnowledgeCards: (cards) => dispatch({ type: ActionTypes.SET_KNOWLEDGE_CARDS, payload: cards }),
    setKnowledgeLoading: (loading) => dispatch({ type: ActionTypes.SET_KNOWLEDGE_LOADING, payload: loading }),
    setSearchQuery: (q) => dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: q }),
    addKnowledgeCard: (card) => dispatch({ type: ActionTypes.ADD_KNOWLEDGE_CARD, payload: card }),

    // 对话
    addMessage: (msg) => dispatch({ type: ActionTypes.ADD_MESSAGE, payload: msg }),
    clearChat: () => dispatch({ type: ActionTypes.CLEAR_CHAT }),
    setStreaming: (s) => dispatch({ type: ActionTypes.SET_STREAMING, payload: s }),
    setStreamingContent: (c) => dispatch({ type: ActionTypes.SET_STREAMING_CONTENT, payload: c }),
    appendStreamingContent: (c) => dispatch({ type: ActionTypes.APPEND_STREAMING_CONTENT, payload: c }),
    commitStreaming: (msg) => dispatch({ type: ActionTypes.COMMIT_STREAMING, payload: msg }),

    // 流水线
    initPipeline: (nodes, edges) => dispatch({ type: ActionTypes.INIT_PIPELINE, payload: { nodes, edges } }),
    setPipelineRunning: (r) => dispatch({ type: ActionTypes.SET_PIPELINE_RUNNING, payload: r }),
    setNodeStatus: (id, status) => dispatch({ type: ActionTypes.SET_NODE_STATUS, payload: { id, status } }),
    setNodeProgress: (id, progress) => dispatch({ type: ActionTypes.SET_NODE_PROGRESS, payload: { id, progress } }),
    setNodeOutput: (id, output) => dispatch({ type: ActionTypes.SET_NODE_OUTPUT, payload: { id, output } }),
    setCurrentNode: (id) => dispatch({ type: ActionTypes.SET_CURRENT_NODE, payload: id }),
    resetPipeline: () => dispatch({ type: ActionTypes.RESET_PIPELINE }),

    // 产出物
    setDeliverables: (items) => dispatch({ type: ActionTypes.SET_DELIVERABLES, payload: items }),
    setActiveTab: (tab) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab }),
    setViewingItem: (item) => dispatch({ type: ActionTypes.SET_VIEWING_ITEM, payload: item })
  }), [state.theme]);

  const value = useMemo(() => ({ state, dispatch, actions }), [state, actions]);

  return React.createElement(AppContext.Provider, { value }, children);
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
