/**
 * app.js — 业务逻辑（四大模块）
 * 智能采集、知识对话、工作流编排、成果产出
 */

/* ========== 全局状态 ========== */
const AppState = {
  knowledge: getKnowledgeBase(),                   // 知识库卡片
  captureQueue: [],                                // 采集队列
  chatMessages: JSON.parse(JSON.stringify(chatMockMessages)), // 对话历史
  pipelineRunning: false,                          // 流水线是否运行中
  currentStyle: 'glass'                            // 当前风格
};

/* ========== DOM 引用缓存 ========== */
let DOM = {};

function cacheDOM() {
  DOM = {
    // Module tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    moduleSections: document.querySelectorAll('.module-section'),
    // Capture
    captureUrl: document.getElementById('capture-url'),
    captureTopic: document.getElementById('capture-topic'),
    captureBtn: document.getElementById('capture-btn'),
    knowledgeGrid: document.getElementById('knowledge-grid'),
    // Chat
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    chatSendBtn: document.getElementById('chat-send-btn'),
    // Pipeline
    pipelineRunBtn: document.getElementById('pipeline-run-btn'),
    pipelineResetBtn: document.getElementById('pipeline-reset-btn'),
    pipelineOutput: document.getElementById('pipeline-output'),
    pipelineNodes: document.querySelectorAll('.pipeline-node'),
    pipelineConnectors: document.querySelectorAll('.pipeline-connector'),
    // Deliverables
    deliverablesGrid: document.getElementById('deliverables-grid'),
    previewModal: document.getElementById('deliverable-preview'),
    previewText: document.getElementById('preview-text'),
    previewClose: document.getElementById('preview-close'),
    previewCopy: document.getElementById('preview-copy'),
    previewDownload: document.getElementById('preview-download'),
    // Sidebar
    sidebarToggle: document.getElementById('sidebar-toggle'),
    aiSidebar: document.getElementById('ai-sidebar'),
    sidebarModel: document.getElementById('sidebar-model'),
    sidebarPrompt: document.getElementById('sidebar-prompt'),
    sidebarTokens: document.getElementById('sidebar-tokens'),
    sidebarStatus: document.getElementById('sidebar-status'),
    sidebarStatusDot: document.getElementById('sidebar-status-dot'),
    // Toast
    toast: document.getElementById('toast')
  };
}

/* ========== Toast 提示 ========== */
let toastTimer = null;

function showToast(message) {
  const el = DOM.toast;
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ========== AI 侧栏更新 ========== */
function updateAISidebar(data) {
  if (!DOM.sidebarModel) return;
  DOM.sidebarModel.textContent = data.model || 'DeepSeek-R1-Distill';
  DOM.sidebarPrompt.textContent = data.prompt || '等待输入...';
  DOM.sidebarTokens.textContent = (data.tokens || 0) + ' tokens';

  if (DOM.sidebarStatus) {
    DOM.sidebarStatus.textContent = data.status || '待机';
  }
  if (DOM.sidebarStatusDot) {
    DOM.sidebarStatusDot.className = 'status-dot';
    if (data.status === '生成中...' || data.status?.startsWith('执行中')) {
      DOM.sidebarStatusDot.classList.add('running');
    } else if (data.status === '完成') {
      DOM.sidebarStatusDot.classList.add('done');
    } else {
      DOM.sidebarStatusDot.classList.add('idle');
    }
  }
}

/* ========== 模块切换 ========== */
function initModuleTabs() {
  DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const module = btn.dataset.module;
      // 切换 tab 激活状态
      DOM.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // 切换模块显示
      DOM.moduleSections.forEach(s => s.classList.remove('active'));
      const target = document.getElementById(`module-${module}`);
      if (target) target.classList.add('active');
    });
  });
}

/* ================================================================
 * 模块 1: 智能采集（Smart Capture）
 * ================================================================ */

function initCaptureModule() {
  DOM.captureBtn.addEventListener('click', handleCapture);
  // 回车触发采集
  DOM.captureUrl.addEventListener('keydown', e => { if (e.key === 'Enter') handleCapture(); });
  DOM.captureTopic.addEventListener('keydown', e => { if (e.key === 'Enter') handleCapture(); });
  renderKnowledgeCards();
}

async function handleCapture() {
  const url = DOM.captureUrl.value.trim();
  const topic = DOM.captureTopic.value.trim();
  if (!url && !topic) {
    showToast('请输入 URL 或主题关键词');
    return;
  }

  // 模拟采集过程
  DOM.captureBtn.disabled = true;
  DOM.captureBtn.innerHTML = '<span class="spinner"></span> 采集中...';

  updateAISidebar({
    model: 'DeepSeek-R1-Distill',
    prompt: `智能采集: 从 "${url || topic}" 中提取结构化信息，生成摘要卡片`,
    tokens: Math.floor(Math.random() * 200 + 100),
    status: '生成中...'
  });

  // 模拟延迟
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

  // 生成新卡片
  const newCard = {
    id: AppState.knowledge.length + 1,
    title: topic ? `${topic} 深度分析` : `网页摘要 #${AppState.knowledge.length + 1}`,
    summary: `基于 ${url || '用户输入主题'} 的智能采集结果。通过 AI 分析提取了关键信息，包括核心观点、数据支持和相关引用。这是一段模拟的摘要内容，展示了智能采集模块的能力。`,
    source: url || '用户输入',
    tags: topic ? [topic, 'AI采集'] : ['网页', 'AI采集'],
    date: new Date().toISOString().split('T')[0]
  };

  AppState.knowledge.unshift(newCard);

  updateAISidebar({
    model: 'DeepSeek-R1-Distill',
    prompt: `智能采集: 从 "${url || topic}" 中提取结构化信息`,
    tokens: newCard.summary.length,
    status: '完成'
  });

  // 重置输入
  DOM.captureUrl.value = '';
  DOM.captureTopic.value = '';

  DOM.captureBtn.disabled = false;
  DOM.captureBtn.textContent = '🚀 开始采集';

  renderKnowledgeCards();
  showToast(`✅ 采集完成: "${newCard.title}"`);
}

function renderKnowledgeCards() {
  if (!DOM.knowledgeGrid) return;
  if (AppState.knowledge.length === 0) {
    DOM.knowledgeGrid.innerHTML = '<div class="empty-state">暂无知识卡片，开始采集吧</div>';
    return;
  }
  DOM.knowledgeGrid.innerHTML = AppState.knowledge.map(card => `
    <div class="knowledge-card card" data-id="${card.id}">
      <div class="card-title">${card.title}</div>
      <div class="summary">${card.summary}</div>
      <div class="card-meta">
        <span>📅 ${card.date}</span>
        <span>🔗 ${card.source.substring(0, 30)}${card.source.length > 30 ? '...' : ''}</span>
      </div>
      <div class="card-meta">
        ${card.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

/* ================================================================
 * 模块 2: 知识对话（RAG Chat）
 * ================================================================ */

let isStreaming = false;

function initChatModule() {
  DOM.chatSendBtn.addEventListener('click', handleSendMessage);
  DOM.chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });
  renderChatMessages();
}

async function handleSendMessage() {
  const text = DOM.chatInput.value.trim();
  if (!text || isStreaming) return;

  // 添加用户消息
  AppState.chatMessages.push({ role: 'user', content: text });
  DOM.chatInput.value = '';
  renderChatMessages();
  scrollChatToBottom();

  isStreaming = true;
  DOM.chatSendBtn.disabled = true;
  DOM.chatSendBtn.textContent = '⏳';

  // 添加占位助手消息
  const msgIndex = AppState.chatMessages.length;
  AppState.chatMessages.push({ role: 'assistant', content: '', citations: [] });
  const msgEl = renderChatMessage(AppState.chatMessages[msgIndex], msgIndex);
  DOM.chatMessages.appendChild(msgEl);
  scrollChatToBottom();

  // 流式输出
  getStreamingResponse(
    text,
    (accumulated) => {
      // 更新当前消息
      AppState.chatMessages[msgIndex].content = accumulated;
      const contentEl = msgEl.querySelector('.message-content');
      if (contentEl) {
        contentEl.innerHTML = accumulated
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');
      }
      scrollChatToBottom();
    },
    (fullText, citations) => {
      // 完成
      AppState.chatMessages[msgIndex].content = fullText;
      AppState.chatMessages[msgIndex].citations = citations;

      // 显示引用
      const contentEl = msgEl.querySelector('.message-content');
      if (contentEl) {
        contentEl.innerHTML = fullText
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');
      }

      if (citations.length > 0) {
        const citationsBar = document.createElement('div');
        citationsBar.className = 'citations-bar';
        citationsBar.innerHTML = '<span style="font-size:0.75rem;opacity:0.6">📚 引用来源:</span> ' +
          citations.map(c =>
            `<a class="citation-link" href="#" data-id="${c.id}">${c.title.substring(0, 12)}...</a>`
          ).join('');

        // 引用点击事件
        citationsBar.querySelectorAll('.citation-link').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(e.target.dataset.id);
            const card = getKnowledgeById(id);
            if (card) {
              showToast(`📄 ${card.title}`);
              // 切换到采集模块查看
            }
          });
        });

        msgEl.appendChild(citationsBar);
      }

      isStreaming = false;
      DOM.chatSendBtn.disabled = false;
      DOM.chatSendBtn.textContent = '发送';
      scrollChatToBottom();
    }
  );
}

function renderChatMessages() {
  if (!DOM.chatMessages) return;
  DOM.chatMessages.innerHTML = '';
  AppState.chatMessages.forEach((msg, i) => {
    const el = renderChatMessage(msg, i);
    DOM.chatMessages.appendChild(el);
  });
  scrollChatToBottom();
}

function renderChatMessage(msg, index) {
  const div = document.createElement('div');
  div.className = `chat-message ${msg.role}`;

  let content = msg.content;
  if (content) {
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  div.innerHTML = `
    <div class="message-role">${msg.role === 'user' ? '🧑 你' : '🤖 DeepMind 助手'}</div>
    <div class="message-content">${content || '<span class="spinner"></span>'}</div>
  `;

  // 引用回链
  if (msg.citations && msg.citations.length > 0) {
    const citationsBar = document.createElement('div');
    citationsBar.className = 'citations-bar';
    citationsBar.innerHTML = '<span style="font-size:0.75rem;opacity:0.6">📚 引用来源:</span> ' +
      msg.citations.map(c =>
        `<a class="citation-link" href="#" data-id="${c.id}">${c.title.substring(0, 12)}...</a>`
      ).join('');
    div.appendChild(citationsBar);
  }

  return div;
}

function scrollChatToBottom() {
  if (DOM.chatMessages) {
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  }
}

/* ================================================================
 * 模块 3: 工作流编排（Agent Pipeline）
 * ================================================================ */

function initPipelineModule() {
  DOM.pipelineRunBtn.addEventListener('click', handleRunPipeline);
  DOM.pipelineResetBtn.addEventListener('click', handleResetPipeline);
  resetPipelineUI();
}

function handleRunPipeline() {
  if (AppState.pipelineRunning) return;

  resetPipelineUI();
  AppState.pipelineRunning = true;
  DOM.pipelineRunBtn.disabled = true;
  DOM.pipelineRunBtn.textContent = '⏳ 运行中...';

  runPipeline(
    // onNodeStart
    (nodeId) => {
      const nodeEl = document.querySelector(`.pipeline-node[data-node="${nodeId}"]`);
      const connectorEl = document.querySelector(`.pipeline-connector[data-from="${nodeId}"]`);
      if (nodeEl) {
        nodeEl.classList.add('active');
        nodeEl.querySelector('.node-status').textContent = '⏳ 执行中...';
      }
    },
    // onNodeComplete
    (nodeId, output) => {
      const nodeEl = document.querySelector(`.pipeline-node[data-node="${nodeId}"]`);
      const connectorEl = document.querySelector(`.pipeline-connector[data-from="${nodeId}"]`);
      if (nodeEl) {
        nodeEl.classList.remove('active');
        nodeEl.classList.add('completed');
        nodeEl.querySelector('.node-status').textContent = '✅ 完成';
      }
      if (connectorEl) {
        connectorEl.classList.add('active');
      }
      // 显示当前输出
      DOM.pipelineOutput.textContent = output;
      DOM.pipelineOutput.classList.add('visible');
    },
    // onComplete
    () => {
      AppState.pipelineRunning = false;
      DOM.pipelineRunBtn.disabled = false;
      DOM.pipelineRunBtn.textContent = '▶ 运行流水线';
      showToast('✅ 流水线执行完成');
    }
  );
}

function handleResetPipeline() {
  AppState.pipelineRunning = false;
  resetPipelineUI();
  DOM.pipelineRunBtn.disabled = false;
  DOM.pipelineRunBtn.textContent = '▶ 运行流水线';
  showToast('🔄 流水线已重置');
}

function resetPipelineUI() {
  DOM.pipelineNodes.forEach(node => {
    node.classList.remove('active', 'completed');
    const statusEl = node.querySelector('.node-status');
    if (statusEl) statusEl.textContent = '⏸️ 待机';
  });
  DOM.pipelineConnectors.forEach(c => c.classList.remove('active'));
  DOM.pipelineOutput.textContent = '';
  DOM.pipelineOutput.classList.remove('visible');

  updateAISidebar({
    model: 'DeepSeek-R1-Distill (Pipeline)',
    prompt: '等待流水线启动...',
    tokens: 0,
    status: '待机'
  });
}

/* ================================================================
 * 模块 4: 成果产出（Deliverables）
 * ================================================================ */

let currentPreviewData = null;

function initDeliverablesModule() {
  renderDeliverables();

  // 预览关闭
  DOM.previewClose.addEventListener('click', closePreview);
  DOM.previewModal.addEventListener('click', (e) => {
    if (e.target === DOM.previewModal) closePreview();
  });

  // 复制
  DOM.previewCopy.addEventListener('click', () => {
    if (currentPreviewData) {
      copyToClipboard(currentPreviewData.content).then(() => {
        showToast('✅ 内容已复制到剪贴板');
      }).catch(() => {
        showToast('❌ 复制失败');
      });
    }
  });

  // 下载
  DOM.previewDownload.addEventListener('click', () => {
    if (currentPreviewData) {
      const filename = `${currentPreviewData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
      downloadAsFile(currentPreviewData.content, filename);
      showToast(`✅ 已下载: ${filename}`);
    }
  });
}

function renderDeliverables() {
  DOM.deliverablesGrid.innerHTML = DELIVERABLES.map(d => `
    <div class="deliverable-card" data-id="${d.id}">
      <div class="del-icon">${d.icon}</div>
      <h3>${d.title}</h3>
      <div class="del-desc">${d.description}</div>
      <div class="card-meta">
        ${d.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="del-actions">
        <button class="btn btn-preview" data-id="${d.id}">👁 预览</button>
      </div>
    </div>
  `).join('');

  // 预览事件
  DOM.deliverablesGrid.querySelectorAll('.btn-preview').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const data = DELIVERABLES.find(d => d.id === id);
      if (data) openPreview(data);
    });
  });
}

function openPreview(data) {
  currentPreviewData = data;
  DOM.previewText.textContent = data.content;
  DOM.previewModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  DOM.previewModal.classList.remove('open');
  document.body.style.overflow = '';
  currentPreviewData = null;
}

/* ========== 侧栏切换 ========== */
function initSidebar() {
  DOM.sidebarToggle.addEventListener('click', () => {
    DOM.aiSidebar.classList.toggle('collapsed');
    DOM.sidebarToggle.textContent = DOM.aiSidebar.classList.contains('collapsed') ? '🤖' : '🤖 AI';
  });

  // 初始状态
  updateAISidebar({
    model: 'DeepSeek-R1-Distill',
    prompt: '等待用户操作...',
    tokens: 0,
    status: '待机'
  });
}

/* ========== 初始化 ========== */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  initModuleTabs();
  initCaptureModule();
  initChatModule();
  initPipelineModule();
  initDeliverablesModule();
  initSidebar();

  console.log('🧠 DeepMind App 已初始化');
  console.log(`📚 知识库: ${AppState.knowledge.length} 张卡片`);
  console.log(`💬 对话: ${AppState.chatMessages.length} 条消息`);
});
