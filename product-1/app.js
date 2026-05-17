/**
 * app.js - AI 工作站 Demo 主逻辑
 * 职责：全局状态管理、模块切换、事件绑定、模拟交互
 *
 * 架构概述：
 *   state          - 全局状态对象，所有模块共享
 *   initApp()      - 入口函数，初始化所有模块
 *   navigateTo()   - 模块切换
 *   工具函数        - typewriter、markdownToHtml、fadeIn 等
 *
 * 依赖：window.DEMO_DATA_KNOWLEDGE / CHAT / AGENTS / OUTPUTS
 */

/* ===================================================================
 * 全局状态
 * =================================================================== */

const state = {
  /** 当前显示的模块 ID */
  currentModule: 'capture',

  /** 知识库条目列表（预置 + 动态采集） */
  knowledgeBase: [...window.DEMO_DATA_KNOWLEDGE.presets],

  /** 自动递增的知识条目 ID 计数器 */
  knowledgeIdCounter: window.DEMO_DATA_KNOWLEDGE.presets.length + 1,

  /** 模块 2：当前勾选的知识条目 ID 集合 */
  selectedKnowledgeIds: new Set(),

  /** 模块 3：是否已运行过流水线 */
  pipelineRan: false,

  /** 模块 3：最近一次流水线运行的模板 key */
  pipelineResult: null,

  /** 模块 2：是否正在流式输出中（防止并发发送） */
  isStreaming: false,

  /** 模块 1：是否正在采集中 */
  isCapturing: false,

  /** 模块 3：是否正在运行流水线 */
  isPipelineRunning: false,

  /** AI 思考侧栏是否打开 */
  thinkingDrawerOpen: false,

  /** 模块 4：当前选中的产出类型 */
  currentOutputType: 'research'
};

/* ===================================================================
 * 工具函数
 * =================================================================== */

/**
 * 打字机效果：向指定元素逐个字符输出文本
 * @param {HTMLElement} el - 目标元素
 * @param {string} text - 要输出的文本
 * @param {number} speed - 每个字符输出间隔（ms），默认 40
 * @param {Function} [callback] - 完成后的回调
 */
function typewriter(el, text, speed, callback) {
  speed = speed || 40;
  var i = 0;
  el.textContent = '';
  var timer = setInterval(function () {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
      if (callback) callback();
    }
  }, speed);
}

/**
 * 打字机效果（按行）：逐行向容器内追加 log 行
 * @param {HTMLElement} container - 日志容器
 * @param {string[]} lines - 日志行数组
 * @param {number} lineDelay - 行之间的延迟（ms），默认 500
 * @param {Function} [callback] - 全部完成后回调
 */
function typewriterLines(container, lines, lineDelay, callback, scrollContainer) {
  lineDelay = lineDelay || 500;
  var idx = 0;
  container.innerHTML = '';
  function nextLine() {
    if (idx >= lines.length) {
      if (callback) callback();
      return;
    }
    var div = document.createElement('div');
    div.className = 'log-line';
    div.textContent = lines[idx];
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    // 如果指定了外层滚动容器，同步滚动
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
    idx++;
    setTimeout(nextLine, lineDelay + Math.random() * 300);
  }
  nextLine();
}

/**
 * 简易 Markdown → HTML 转换
 * 支持：# ## ### **text** - * 1. > table | code
 * @param {string} md - Markdown 文本
 * @returns {string} HTML 字符串
 */
function markdownToHtml(md) {
  if (!md) return '';

  // 先提取并保护代码块，避免被后续正则破坏
  var codeBlocks = [];
  var html = md.replace(/```([\s\S]*?)```/g, function (_, code) {
    codeBlocks.push('<pre class="bg-slate-900 p-3 rounded-lg overflow-x-auto my-2"><code>' + code + '</code></pre>');
    return '%%CODEBLOCK_' + (codeBlocks.length - 1) + '%%';
  });

  // 按双换行拆分为块，每个块独立处理
  var blocks = html.split(/\n\n/);
  var result = [];

  blocks.forEach(function (block) {
    block = block.trim();
    if (!block) return;

    // 代码块占位符（直接还原）
    if (/^%%CODEBLOCK_\d+%%$/.test(block)) {
      result.push(block);
      return;
    }

    // 标题
    if (/^### (.+)$/m.test(block)) {
      result.push('<h3>' + block.replace(/^### /, '') + '</h3>');
      return;
    }
    if (/^## (.+)$/m.test(block)) {
      result.push('<h2>' + block.replace(/^## /, '') + '</h2>');
      return;
    }
    if (/^# (.+)$/m.test(block)) {
      result.push('<h1>' + block.replace(/^# /, '') + '</h1>');
      return;
    }

    // 引用
    if (/^> /.test(block)) {
      result.push('<blockquote>' + block.replace(/^> /, '') + '</blockquote>');
      return;
    }

    // 水平线
    if (/^---$/.test(block)) {
      result.push('<hr>');
      return;
    }

    // 无序列表
    if (/^- /.test(block)) {
      var items = block.split('\n').map(function (line) {
        return '<li>' + line.replace(/^- /, '') + '</li>';
      }).join('');
      result.push('<ul>' + items + '</ul>');
      return;
    }

    // 有序列表
    if (/^\d+\. /.test(block)) {
      var items = block.split('\n').map(function (line) {
        return '<li>' + line.replace(/^\d+\. /, '') + '</li>';
      }).join('');
      result.push('<ul>' + items + '</ul>');
      return;
    }

    // 表格（多行以 | 开头）
    if (/\|.*\|/.test(block) && block.indexOf('\n') !== -1) {
      var rows = block.split('\n');
      var tableHTML = '<table>';
      var headerSkipped = false;
      rows.forEach(function (row, ri) {
        var cells = row.split('|').filter(function (c) { return c.trim() !== ''; });
        // 跳过分隔行
        if (/^[-: |]+$/.test(row)) { headerSkipped = true; return; }
        var tag = (ri === 0 || (headerSkipped && ri === 1)) ? 'th' : 'td';
        tableHTML += '<tr>';
        cells.forEach(function (cell) {
          tableHTML += '<' + tag + '>' + cell.trim() + '</' + tag + '>';
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</table>';
      result.push(tableHTML);
      return;
    }

    // 普通段落
    result.push('<p>' + block + '</p>');
  });

  html = result.join('');

  // 还原代码块
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, function (_, i) {
    return codeBlocks[parseInt(i)];
  });

  // 行内格式（在块级处理之后）
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  return html;
}

/**
 * 显示 Toast 提示
 * @param {string} message - 提示文本
 * @param {number} [duration=2000] - 显示时长 ms
 */
function showToast(message, duration) {
  duration = duration || 2000;
  var container = document.getElementById('toast-container');
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function () {
    toast.remove();
  }, duration);
}

/**
 * 滚动元素到底部
 * @param {HTMLElement} el
 */
function scrollToBottom(el) {
  el.scrollTop = el.scrollHeight;
}

/**
 * 生成格式化时间字符串
 * @returns {string} YYYY-MM-DD HH:mm
 */
function nowStr() {
  var d = new Date();
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

/* ===================================================================
 * 模块切换
 * =================================================================== */

/**
 * 切换到指定模块
 * @param {string} moduleId - capture / chat / pipeline / deliverables
 */
function navigateTo(moduleId) {
  if (state.currentModule === moduleId) return;

  // 更新导航高亮
  document.querySelectorAll('.nav-item').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var activeNav = document.querySelector('[data-module="' + moduleId + '"]');
  if (activeNav) activeNav.classList.add('active');

  // 切换模块显示
  document.querySelectorAll('.module-section').forEach(function (sec) {
    sec.classList.add('hidden');
  });
  var target = document.getElementById('module-' + moduleId);
  if (target) {
    target.classList.remove('hidden');
    // 播放入场动画
    target.classList.remove('animate-module-in');
    void target.offsetWidth; // reflow
    target.classList.add('animate-module-in');
  }

  state.currentModule = moduleId;

  // 进入特定模块时的初始化
  if (moduleId === 'chat') {
    renderKnowledgeChecklist();
  }
  if (moduleId === 'deliverables') {
    refreshDeliverables();
  }
}

/**
 * 更新 AI 思考过程侧栏内容
 * @param {Object} data - { prompt, tokens, model, chunks, ... }
 */
function updateThinkingDrawer(data) {
  var content = document.getElementById('thinking-content');
  var html = '';

  if (data.model) {
    html += '<div class="mb-3"><span class="text-indigo-400 font-semibold">模型：</span>' + data.model + '</div>';
  }
  if (data.tokens) {
    html += '<div class="mb-3"><span class="text-indigo-400 font-semibold">Token 消耗：</span>' +
      'Prompt ' + data.tokens.prompt + ' + Completion ' + data.tokens.completion +
      ' = <span class="text-purple-300">' + data.tokens.total + ' total</span></div>';
  }
  if (data.prompt) {
    html += '<div class="mb-3"><span class="text-indigo-400 font-semibold">Prompt：</span>' +
      '<div class="mt-1 p-2 bg-slate-900 rounded-lg text-[11px] leading-relaxed max-h-32 overflow-y-auto">' +
      data.prompt + '</div></div>';
  }
  if (data.chunks && data.chunks.length > 0) {
    html += '<div class="mb-3"><span class="text-indigo-400 font-semibold">检索结果：</span>';
    data.chunks.forEach(function (ch) {
      html += '<div class="mt-1 p-2 bg-slate-900 rounded-lg flex justify-between items-center">' +
        '<span class="text-[11px] truncate flex-1">' + ch.title + '</span>' +
        '<span class="text-emerald-400 ml-2 text-[10px]">' + (ch.score * 100).toFixed(0) + '%</span>' +
        '</div>';
    });
    html += '</div>';
  }
  if (data.logLines && data.logLines.length > 0) {
    html += '<div class="mb-3"><span class="text-indigo-400 font-semibold">实时日志：</span>';
    data.logLines.forEach(function (line) {
      html += '<div class="text-[11px] text-slate-400 mt-0.5">' + line + '</div>';
    });
    html += '</div>';
  }

  content.innerHTML = html || '<p class="text-slate-600">暂无思考数据。</p>';
}

/**
 * 打开/关闭 AI 思考过程侧栏
 */
function toggleThinkingDrawer(forceOpen) {
  var drawer = document.getElementById('thinking-drawer');
  var open = forceOpen !== undefined ? forceOpen : !state.thinkingDrawerOpen;
  state.thinkingDrawerOpen = open;

  if (open) {
    drawer.classList.remove('closed');
    drawer.classList.add('open');
  } else {
    drawer.classList.remove('open');
    drawer.classList.add('closed');
  }
}

/* ===================================================================
 * 知识库渲染（侧栏迷你列表）
 * =================================================================== */

/**
 * 渲染左侧知识库迷你列表
 */
function renderKnowledgeMiniList() {
  var container = document.getElementById('knowledge-mini-list');
  if (!container) return;

  if (state.knowledgeBase.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-600 px-1 py-2">暂无知识条目</p>';
    return;
  }

  container.innerHTML = '';
  state.knowledgeBase.forEach(function (entry) {
    var card = document.createElement('div');
    card.className = 'knowledge-card glass rounded-lg p-2 text-xs cursor-pointer relative group';
    card.setAttribute('data-knowledge-id', entry.id);
    card.innerHTML =
      '<div class="font-medium text-slate-300 truncate">' + entry.title + '</div>' +
      '<div class="text-slate-500 text-[10px] mt-0.5 truncate">' + entry.source + '</div>' +
      '<button class="absolute top-1 right-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] knowledge-delete-btn" data-id="' + entry.id + '" aria-label="删除知识条目">✕</button>';
    container.appendChild(card);
  });

  // 绑定删除事件
  container.querySelectorAll('.knowledge-delete-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      removeKnowledgeEntry(this.getAttribute('data-id'));
    });
  });
}

/**
 * 从知识库中移除条目
 * @param {string} id - 知识条目 ID
 */
function removeKnowledgeEntry(id) {
  state.knowledgeBase = state.knowledgeBase.filter(function (e) { return e.id !== id; });
  state.selectedKnowledgeIds.delete(id);
  renderKnowledgeMiniList();
  if (state.currentModule === 'chat') {
    renderKnowledgeChecklist();
  }
}

/* ===================================================================
 * 模块 1：智能采集
 * =================================================================== */

/**
 * 初始化模块 1 事件监听
 */
function initCaptureModule() {
  // 开始采集按钮
  document.getElementById('btn-start-capture').addEventListener('click', function () {
    var input = document.getElementById('capture-input');
    var value = input.value.trim();
    if (!value) {
      showToast('请输入 URL 或主题');
      return;
    }
    startCapture(value);
  });

  // 回车触发采集
  document.getElementById('capture-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var value = this.value.trim();
      if (value) startCapture(value);
    }
  });

  // 快捷标签
  document.querySelectorAll('.quick-tag').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tag = this.getAttribute('data-tag');
      document.getElementById('capture-input').value = tag;
      startCapture(tag);
    });
  });
}

/**
 * 模拟采集流程
 * @param {string} inputValue - 用户输入的内容
 */
function startCapture(inputValue) {
  if (state.isCapturing) return;
  state.isCapturing = true;

  var btn = document.getElementById('btn-start-capture');
  var originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> 采集中...';
  btn.classList.add('opacity-70', 'pointer-events-none');

  // 显示日志面板
  var logPanel = document.getElementById('capture-log-panel');
  var logContent = document.getElementById('capture-log-content');
  logPanel.classList.remove('hidden');
  logPanel.classList.add('animate-fade-in');

  // 模拟日志行
  var logLines = [
    '🔍 正在抓取页面：' + inputValue + '...',
    '📡 连接成功，HTTP 200 OK',
    '📄 提取正文内容...',
    '🧹 清洗 HTML 标签，保留语义结构...',
    '🏷️ 生成标签：基于关键词提取...',
    '📊 内容统计：约 2,300 字符',
    '✅ 采集完成！'
  ];

  typewriterLines(logContent, logLines, 500, function () {
    // 确定使用哪个采集结果
    var quickData = window.DEMO_DATA_KNOWLEDGE.quickCapture[inputValue];
    var result;
    if (quickData) {
      result = quickData;
    } else {
      // 自定义输入，生成泛用结果
      result = {
        title: inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue,
        summary: '针对"' + inputValue + '"的智能采集结果。系统已自动提取核心信息并生成结构化摘要。这展示了 AI 采集管线对任意输入的自适应处理能力。',
        tags: ['自定义采集', 'AI处理'],
        source: 'custom-input'
      };
    }

    // 显示结果卡片
    showCaptureResultCard(result);

    // 添加到知识库
    var newEntry = {
      id: 'k' + state.knowledgeIdCounter,
      title: result.title,
      summary: result.summary,
      tags: result.tags || [],
      source: result.source,
      collectedAt: nowStr(),
      content: result.summary
    };
    state.knowledgeIdCounter++;
    state.knowledgeBase.unshift(newEntry);
    renderKnowledgeMiniList();

    // 更新思考侧栏
    updateThinkingDrawer({
      model: 'deepseek-v4-pro[1m]',
      tokens: { prompt: 850, completion: 420, total: 1270 },
      prompt: 'System: 你是一个网页内容采集与摘要 Agent。\nUser: 请抓取并总结以下内容：' + inputValue + '\n要求：提取标题、3-5 句摘要、3-4 个标签、来源信息。',
      chunks: []
    });

    // 恢复按钮
    btn.innerHTML = originalHTML;
    btn.classList.remove('opacity-70', 'pointer-events-none');
    state.isCapturing = false;
    showToast('采集完成！已添加到知识库');
  });
}

/**
 * 显示采集结果卡片
 * @param {Object} result - { title, summary, tags, source }
 */
function showCaptureResultCard(result) {
  var area = document.getElementById('capture-result-area');
  var tagsHTML = (result.tags || []).map(function (t) {
    return '<span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">' + t + '</span>';
  }).join('');

  var card = document.createElement('div');
  card.className = 'capture-result-card glass rounded-2xl p-5 space-y-3';
  card.innerHTML =
    '<div class="flex items-start justify-between">' +
    '<h3 class="font-semibold text-indigo-200">' + result.title + '</h3>' +
    '<span class="text-[10px] text-slate-500 whitespace-nowrap ml-2">' + nowStr() + '</span>' +
    '</div>' +
    '<p class="text-sm text-slate-400 leading-relaxed">' + result.summary + '</p>' +
    '<div class="flex items-center gap-2 flex-wrap">' + tagsHTML + '</div>' +
    '<div class="text-[10px] text-slate-600">来源：' + result.source + '</div>';

  // 替换已有结果
  area.innerHTML = '';
  area.appendChild(card);
}

/* ===================================================================
 * 模块 2：知识对话
 * =================================================================== */

/**
 * 渲染知识库勾选清单
 */
function renderKnowledgeChecklist() {
  var container = document.getElementById('chat-knowledge-checklist');
  if (!container) return;

  if (state.knowledgeBase.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-600">暂无知识条目，请先在「智能采集」中添加。</p>';
    return;
  }

  container.innerHTML = '';
  state.knowledgeBase.forEach(function (entry) {
    var checked = state.selectedKnowledgeIds.has(entry.id) ? 'checked' : '';
    var label = document.createElement('label');
    label.className = 'flex items-start gap-2 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-all text-xs';
    label.setAttribute('data-kid', entry.id);
    label.innerHTML =
      '<input type="checkbox" class="chat-knowledge-checkbox mt-0.5 accent-indigo-500" value="' + entry.id + '" ' + checked + '>' +
      '<div class="flex-1 min-w-0">' +
      '<div class="text-slate-300 truncate">' + entry.title + '</div>' +
      '<div class="text-slate-500 text-[10px] mt-0.5">' + (entry.tags || []).join(' · ') + '</div>' +
      '</div>';
    container.appendChild(label);
  });

  // 绑定 checkbox 事件
  container.querySelectorAll('.chat-knowledge-checkbox').forEach(function (cb) {
    cb.addEventListener('change', function () {
      if (this.checked) {
        state.selectedKnowledgeIds.add(this.value);
      } else {
        state.selectedKnowledgeIds.delete(this.value);
      }
      updateChatStats();
    });
  });

  updateChatStats();
}

/**
 * 更新聊天页面的统计条
 */
function updateChatStats() {
  var count = state.selectedKnowledgeIds.size;
  var estimatedTokens = count * 350; // 每条知识约 350 tokens
  document.getElementById('chat-selected-count').textContent = count;
  document.getElementById('chat-estimated-tokens').textContent = estimatedTokens;
}

/**
 * 初始化模块 2 事件监听
 */
function initChatModule() {
  var sendBtn = document.getElementById('btn-send-message');
  var input = document.getElementById('chat-input');

  sendBtn.addEventListener('click', function () {
    handleSendMessage();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSendMessage();
  });
}

/**
 * 处理发送消息
 */
function handleSendMessage() {
  if (state.isStreaming) return;

  var input = document.getElementById('chat-input');
  var text = input.value.trim();
  if (!text) return;

  input.value = '';

  // 检查是否勾选了知识
  if (state.selectedKnowledgeIds.size === 0) {
    showToast('请先勾选至少一条知识条目作为对话上下文');
    return;
  }

  state.isStreaming = true;

  // 添加用户气泡
  addChatBubble(text, 'user');

  // 匹配预制回复
  var match = matchChatResponse(text);
  var responseData = match || window.DEMO_DATA_CHAT.fallback;

  // 添加 AI 气泡（空壳，后续流式填充）
  var aiBubble = addChatBubble('', 'ai');
  var textEl = aiBubble.querySelector('.bubble-text');

  // 更新思考侧栏
  updateThinkingDrawer(responseData.thinkingData);

  // 流式打字机输出
  typewriter(textEl, responseData.reply, 40, function () {
    // 流式输出完成后，渲染引用角标
    renderCitationBadges(aiBubble, responseData.citations);
    state.isStreaming = false;
  });
}

/**
 * 添加聊天消息气泡
 * @param {string} text - 消息文本
 * @param {string} role - 'user' | 'ai'
 * @returns {HTMLElement} 气泡 DOM
 */
function addChatBubble(text, role) {
  var messages = document.getElementById('chat-messages');
  // 移除初始占位提示
  var placeholder = messages.querySelector('.text-center');
  if (placeholder) placeholder.remove();

  var wrapper = document.createElement('div');
  wrapper.className = 'flex ' + (role === 'user' ? 'justify-end' : 'justify-start') + ' animate-fade-in-up';

  var bubble = document.createElement('div');
  bubble.className = (role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai') +
    ' max-w-[80%] px-4 py-3 text-sm leading-relaxed';

  if (role === 'ai') {
    bubble.innerHTML = '<span class="bubble-text typewriter-cursor"></span>';
  } else {
    bubble.textContent = text;
  }

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  scrollToBottom(messages);
  return bubble;
}

/**
 * 匹配预制问答回复
 * @param {string} userInput - 用户输入
 * @returns {Object|null} 匹配到的回复数据，或 null
 */
function matchChatResponse(userInput) {
  var responses = window.DEMO_DATA_CHAT.responses;
  var input = userInput.toLowerCase();
  for (var i = 0; i < responses.length; i++) {
    var keywords = responses[i].keywords;
    for (var j = 0; j < keywords.length; j++) {
      if (input.indexOf(keywords[j]) !== -1) {
        return responses[i];
      }
    }
  }
  return null;
}

/**
 * 在 AI 气泡中渲染引用角标
 * @param {HTMLElement} bubble - AI 气泡 DOM
 * @param {Array} citations - [{ id, marker }]
 */
function renderCitationBadges(bubble, citations) {
  if (!citations || citations.length === 0) return;

  var html = bubble.querySelector('.bubble-text').innerHTML;
  citations.forEach(function (cit) {
    var badgeHTML = '<span class="citation-badge" data-cite-id="' + cit.id + '" title="跳转到：' + cit.id + '">' +
      cit.marker.replace(/[\[\]]/g, '') + '</span>';
    html = html.replace(cit.marker, badgeHTML);
  });
  bubble.querySelector('.bubble-text').innerHTML = html;
  bubble.querySelector('.bubble-text').classList.remove('typewriter-cursor');

  // 绑定引用角标点击事件
  bubble.querySelectorAll('.citation-badge').forEach(function (badge) {
    badge.addEventListener('click', function () {
      var kid = this.getAttribute('data-cite-id');
      highlightKnowledgeCard(kid);
    });
  });
}

/**
 * 高亮闪烁并滚动到指定知识卡片
 * @param {string} knowledgeId
 */
function highlightKnowledgeCard(kid) {
  // 在侧栏迷你列表中找到对应卡片
  var card = document.querySelector('#knowledge-mini-list [data-knowledge-id="' + kid + '"]');
  // 也在勾选清单中找
  var checklistItem = document.querySelector('#chat-knowledge-checklist [data-kid="' + kid + '"]');

  var target = card || checklistItem;
  if (target) {
    target.classList.add('animate-highlight-flash');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      target.classList.remove('animate-highlight-flash');
    }, 2500);
  }
}

/* ===================================================================
 * 模块 3：工作流编排
 * =================================================================== */

/**
 * 初始化模块 3 事件监听
 */
function initPipelineModule() {
  document.getElementById('btn-run-pipeline').addEventListener('click', function () {
    var templateKey = document.getElementById('pipeline-template-select').value;
    runPipeline(templateKey);
  });

  document.getElementById('btn-reset-pipeline').addEventListener('click', function () {
    resetPipeline();
  });
}

/**
 * 绘制/更新 SVG 连线
 */
function drawPipelineConnections() {
  var svg = document.getElementById('pipeline-svg');
  var canvas = document.getElementById('pipeline-canvas');
  var nodes = canvas.querySelectorAll('.pipeline-node');

  if (nodes.length < 2) return;

  var canvasRect = canvas.getBoundingClientRect();
  var svgRect = svg.parentElement.getBoundingClientRect();

  // 设置 SVG 视口
  svg.setAttribute('viewBox', '0 0 ' + svgRect.width + ' ' + svgRect.height);
  svg.style.width = svgRect.width + 'px';
  svg.style.height = svgRect.height + 'px';

  var linesHTML = '';
  for (var i = 0; i < nodes.length - 1; i++) {
    var curr = nodes[i].getBoundingClientRect();
    var next = nodes[i + 1].getBoundingClientRect();

    var x1 = curr.right - svgRect.left;
    var y1 = curr.top + curr.height / 2 - svgRect.top;
    var x2 = next.left - svgRect.left;
    var y2 = next.top + next.height / 2 - svgRect.top;

    linesHTML += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" class="pipeline-connection" id="connection-' + i + '" />';
  }
  svg.innerHTML = linesHTML;
}

/**
 * 运行流水线（动画模拟）
 * @param {string} templateKey - research / social / weekly
 */
function runPipeline(templateKey) {
  if (state.isPipelineRunning) return;
  state.isPipelineRunning = true;

  var template = window.DEMO_DATA_AGENTS.templates[templateKey];
  if (!template) return;

  // 禁用按钮
  var runBtn = document.getElementById('btn-run-pipeline');
  runBtn.classList.add('opacity-70', 'pointer-events-none');
  runBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> 运行中...';

  // 重置所有节点
  resetPipelineNodes();

  // 显示日志面板
  var logPanel = document.getElementById('pipeline-log-panel');
  var logContent = document.getElementById('pipeline-log-content');
  logPanel.classList.remove('hidden');
  logPanel.classList.add('animate-fade-in');
  logContent.innerHTML = '';

  // 绘制连线
  setTimeout(function () { drawPipelineConnections(); }, 100);

  // 依次激活节点
  var agentIndex = 0;
  var allLines = [];

  function runNextAgent() {
    if (agentIndex >= template.agents.length) {
      // 全部完成
      state.isPipelineRunning = false;
      state.pipelineRan = true;
      state.pipelineResult = templateKey;
      runBtn.classList.remove('opacity-70', 'pointer-events-none');
      runBtn.innerHTML = '▶️ 运行流水线';
      showToast('流水线执行完成！正在跳转到成果产出...');

      // 自动跳转到模块 4
      setTimeout(function () {
        navigateTo('deliverables');
        state.currentOutputType = templateKey;
        refreshDeliverables();
        // 闪烁高亮产出物
        var preview = document.getElementById('output-preview');
        if (preview) {
          preview.classList.add('animate-highlight-flash');
          setTimeout(function () { preview.classList.remove('animate-highlight-flash'); }, 2500);
        }
      }, 800);
      return;
    }

    var agentData = template.agents[agentIndex];
    var node = document.getElementById('pipeline-node-' + agentIndex);

    // 节点切换为运行态
    node.classList.remove('idle');
    node.classList.add('running');
    node.querySelector('.node-status').textContent = '运行中';

    // 逐行打字机输出 Agent 日志
    var lines = agentData.logs;
    var agentLinesContainer = document.createElement('div');
    logContent.appendChild(agentLinesContainer);

    // 更新思考侧栏
    updateThinkingDrawer({
      model: agentData.model,
      tokens: { prompt: 400 + agentIndex * 300, completion: 200 + agentIndex * 150, total: 600 + agentIndex * 450 },
      prompt: '执行 Agent：' + agentData.name + '\n模板：' + template.name,
      logLines: lines
    });

    typewriterLines(agentLinesContainer, lines, 350, function () {
      // 日志输出完成后，切换节点为完成态
      node.classList.remove('running');
      node.classList.add('complete');
      node.querySelector('.node-status').textContent = '完成';

      // 点亮连线
      if (agentIndex > 0) {
        var conn = document.getElementById('connection-' + (agentIndex - 1));
        if (conn) conn.classList.add('active');
      }

      agentIndex++;
      setTimeout(runNextAgent, 600);
    }, logContent);
  }

  // 首个节点延迟后启动
  setTimeout(runNextAgent, 400);
}

/**
 * 重置所有流水线节点为待命态
 */
function resetPipelineNodes() {
  for (var i = 0; i < 4; i++) {
    var node = document.getElementById('pipeline-node-' + i);
    if (!node) continue;
    node.classList.remove('running', 'complete', 'failed');
    node.classList.add('idle');
    node.querySelector('.node-status').textContent = '待命';
  }
  // 重置连线
  var svg = document.getElementById('pipeline-svg');
  svg.innerHTML = '';
  // 隐藏日志面板
  var logPanel = document.getElementById('pipeline-log-panel');
  logPanel.classList.add('hidden');
  document.getElementById('pipeline-log-content').innerHTML = '';
}

/**
 * 重置流水线（用户点击重置按钮）
 */
function resetPipeline() {
  resetPipelineNodes();
  state.isPipelineRunning = false;
  var runBtn = document.getElementById('btn-run-pipeline');
  runBtn.classList.remove('opacity-70', 'pointer-events-none');
  runBtn.innerHTML = '▶️ 运行流水线';
  showToast('流水线已重置');
}

/* ===================================================================
 * 模块 4：成果产出
 * =================================================================== */

/**
 * 初始化模块 4 事件监听
 */
function initDeliverablesModule() {
  // Tab 切换
  document.querySelectorAll('.output-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var type = this.getAttribute('data-output');
      switchOutputTab(type);
    });
  });

  // 复制全文
  document.getElementById('btn-copy-content').addEventListener('click', function () {
    var data = window.DEMO_DATA_OUTPUTS[state.currentOutputType];
    if (data) {
      navigator.clipboard.writeText(data.content).then(function () {
        showToast('✅ 已复制到剪贴板');
      }).catch(function () {
        showToast('复制失败，请手动复制');
      });
    }
  });

  // 下载 Markdown
  document.getElementById('btn-download-md').addEventListener('click', function () {
    var data = window.DEMO_DATA_OUTPUTS[state.currentOutputType];
    if (!data) return;
    var blob = new Blob([data.content], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = data.title.replace(/\s+/g, '_') + '.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('⬇️ 下载中...');
  });

  // 重新生成
  document.getElementById('btn-regenerate').addEventListener('click', function () {
    regenerateOutput();
  });
}

/**
 * 刷新模块 4 显示
 */
function refreshDeliverables() {
  if (!state.pipelineRan) {
    document.getElementById('deliverables-empty').classList.remove('hidden');
    document.getElementById('deliverables-content').classList.add('hidden');
    return;
  }

  document.getElementById('deliverables-empty').classList.add('hidden');
  document.getElementById('deliverables-content').classList.remove('hidden');
  document.getElementById('deliverables-content').classList.add('animate-fade-in');

  // 切换到流水线运行时的产出类型
  if (state.pipelineResult) {
    switchOutputTab(state.pipelineResult);
  }
}

/**
 * 切换产出 Tab
 * @param {string} type - research / social / weekly
 */
function switchOutputTab(type) {
  state.currentOutputType = type;

  // 更新 Tab 样式
  document.querySelectorAll('.output-tab').forEach(function (tab) {
    if (tab.getAttribute('data-output') === type) {
      tab.className = 'output-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
    } else {
      tab.className = 'output-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-slate-800 text-slate-400 border border-slate-700';
    }
  });

  // 渲染内容
  var data = window.DEMO_DATA_OUTPUTS[type];
  if (!data) return;

  var preview = document.getElementById('output-preview');
  preview.innerHTML = markdownToHtml(data.content);
  preview.classList.add('animate-fade-in');

  // 渲染元数据
  var meta = data.metadata;
  document.getElementById('output-metadata').innerHTML =
    '<h4 class="text-sm font-semibold text-slate-300 mb-2">📋 生成信息</h4>' +
    '<div><span class="text-slate-500">生成时间：</span>' + meta.generatedAt + '</div>' +
    '<div><span class="text-slate-500">消耗 Token：</span><span class="text-purple-300">' + meta.tokens.toLocaleString() + '</span></div>' +
    '<div><span class="text-slate-500">模型：</span>' + meta.model + '</div>' +
    '<div class="mt-2 pt-2 border-t border-slate-700/50"><span class="text-slate-500">Agent 链路：</span></div>' +
    '<div class="text-indigo-300 mt-1 leading-relaxed">' + meta.agentChain + '</div>';
}

/**
 * 重新生成（打字机重写）
 */
function regenerateOutput() {
  var data = window.DEMO_DATA_OUTPUTS[state.currentOutputType];
  if (!data) return;

  var preview = document.getElementById('output-preview');
  preview.innerHTML = '';
  showToast('🔄 重新生成中...');

  // 模拟打字机重写（按段落输出）
  var paragraphs = data.content.split('\n\n');
  var idx = 0;
  var container = preview;

  function nextParagraph() {
    if (idx >= paragraphs.length) {
      showToast('✅ 重新生成完成');
      return;
    }
    var p = paragraphs[idx];
    var div = document.createElement('div');
    div.className = 'animate-fade-in';
    div.innerHTML = markdownToHtml(p);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    idx++;
    setTimeout(nextParagraph, 200 + Math.random() * 200);
  }

  nextParagraph();

  // 更新思考侧栏
  updateThinkingDrawer({
    model: data.metadata.model,
    tokens: { prompt: 2000, completion: data.metadata.tokens, total: data.metadata.tokens + 2000 },
    prompt: '重新生成产出物：' + data.title,
    chunks: []
  });
}

/* ===================================================================
 * 初始化和全局事件绑定
 * =================================================================== */

/**
 * 主入口：初始化整个应用
 */
function initApp() {
  // 1. 渲染知识库迷你列表
  renderKnowledgeMiniList();

  // 2. 初始化各模块事件
  initCaptureModule();
  initChatModule();
  initPipelineModule();
  initDeliverablesModule();

  // 3. 导航切换事件
  document.querySelectorAll('[data-module]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateTo(this.getAttribute('data-module'));
    });
  });

  // 4. AI 思考过程侧栏
  document.getElementById('btn-toggle-thinking').addEventListener('click', function () {
    toggleThinkingDrawer();
  });
  document.getElementById('btn-close-thinking').addEventListener('click', function () {
    toggleThinkingDrawer(false);
  });

  // 5. 窗口 resize 时重绘连线
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (state.currentModule === 'pipeline' && state.isPipelineRunning) {
        drawPipelineConnections();
      }
    }, 300);
  });

  // 6. 初始进入模块 1
  navigateTo('capture');

  console.log('🚀 AI 工作站 Demo 已就绪');
  console.log('   - 状态管理：全局 state 对象');
  console.log('   - 数据来源：data/*.js 模拟数据');
  console.log('   - 所有 AI 能力均为前端模拟，无后端依赖');
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
