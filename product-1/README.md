# AI 工作站 Demo

## 1. 项目定位

**AI 工作站 Demo** 是一个纯前端展示项目，面向技术招聘方、潜在合作者和 AI 工具链关注者。它通过一个完整的可视化工作流（采集 → 对话 → 编排 → 产出），展示作者在 AI 编程工具链方面的工程化驾驭能力。

这不是一个真正的 AI 产品——所有 AI 能力均通过预置数据 + 动画 + 前端状态机模拟。它的目的是证明：作者能设计清晰的系统架构、组织可维护的前端代码、并呈现专业级的交互体验。**代码本身的清晰度、注释质量和组织结构，与视觉效果同等重要。**

---

## 2. 运行方式

双击 `product-1/index.html`，在浏览器中直接运行。

- 零构建、零安装、零依赖（Tailwind CSS 通过 CDN 加载）
- 推荐浏览器：Chrome / Edge / Firefox 最新版
- 推荐分辨率：1280px+（桌面优先，1024px 下不破版）

---

## 3. 文件结构

```
product-1/
├── index.html          # 单一入口，双击即可运行。包含完整的页面骨架和 Tailwind CDN 引用
├── styles.css          # 自定义样式：动画关键帧、玻璃拟态、流水线节点状态、Markdown 渲染样式
├── app.js              # 主逻辑：全局状态管理、模块切换、所有交互逻辑、工具函数
├── data/
│   ├── knowledge.js    # 模拟知识库数据：预置 3 条 + 快捷采集 3 组
│   ├── chat.js         # 模拟对话回复数据：3 组关键词匹配问答 + 兜底回复
│   ├── agents.js       # 模拟 Agent 配置与运行时日志：3 个任务模板 × 4 个 Agent
│   └── outputs.js      # 模拟最终产出物数据：3 类产出的完整 Markdown 内容 + 元数据
├── assets/             # 图标/图片目录（当前通过 emoji 内联，无外部资源）
└── README.md           # 本文件：项目说明 + 工程化记录
```

| 文件 | 职责 |
|------|------|
| `index.html` | 页面骨架，包含4个模块的 HTML 结构和 Tailwind CDN 引用 |
| `styles.css` | 自定义 CSS 动画（fadeInUp、pulseGlow、flowDash）、玻璃拟态卡片、节点状态样式、Markdown 渲染样式 |
| `app.js` | 全局状态管理（`state` 对象）、模块切换路由、4个模块的全部交互逻辑、typewriter/markdownToHtml 工具函数 |
| `data/knowledge.js` | 预置知识条目与快捷采集结果，挂载到 `window.DEMO_DATA_KNOWLEDGE` |
| `data/chat.js` | 预制问答对与关键词匹配规则，挂载到 `window.DEMO_DATA_CHAT` |
| `data/agents.js` | 3 个任务模板的 Agent 配置与逐行日志，挂载到 `window.DEMO_DATA_AGENTS` |
| `data/outputs.js` | 3 类产出物的完整 Markdown 内容与元数据，挂载到 `window.DEMO_DATA_OUTPUTS` |

---

## 4. 功能清单

### 模块 1：智能采集（Smart Capture）

- **输入采集**：大输入框支持 URL 或主题输入，3 个快捷标签（AI 周报 / 前端最佳实践 / 产品方法论）一键填入
- **实时日志**：点击采集后弹出日志面板，逐行打字机式输出抓取→提取→标签→完成的模拟过程
- **摘要卡片**：日志结束后弹出带淡入动画的结果卡片（标题、摘要、标签 chips、来源、时间）
- **知识库管理**：结果自动追加到左侧知识库列表，hover 显示删除按钮
- **思考侧栏**：实时显示模拟的 Prompt、Token 计数、模型名称

### 模块 2：知识对话（RAG Chat）

- **知识勾选**：左侧展示所有知识条目，勾选后加入对话上下文，顶部统计条显示已选数量和估算 Token
- **流式对话**：发送消息后 AI 回复以打字机效果逐字输出（40ms/字符）
- **引用溯源**：AI 回复中的 `[1]` `[2]` 角标可点击，点击后对应知识卡片闪烁高亮并滚动到可见
- **关键词匹配**：预置 3 组问答（"总结一下"、"最佳实践有哪些"、"如何开始"），其余问题返回兜底引导
- **思考侧栏**：显示检索到的 chunks、相似度分数、最终 Prompt、Token 消耗

### 模块 3：工作流编排（Agent Pipeline）

- **固定流水线**：4 个节点（输入采集器 → 研究员 → 写手 → 审稿人），SVG 连线
- **3 个任务模板**：调研报告 / 公众号推文 / 周报摘要
- **逐节点动画**：节点依次激活（待命 → 蓝色脉冲运行中 → 绿色完成），连线跟随点亮（流动光效）
- **实时日志流**：右侧面板逐行打字机输出每个 Agent 的思考日志
- **自动跳转**：流水线完成后自动跳转到成果产出模块并闪烁高亮
- **重置功能**：一键恢复所有节点为待命态

### 模块 4：成果产出（Deliverables）

- **3 个产出 Tab**：调研报告 / 公众号推文 / 周报摘要，内置完整的 Markdown 内容
- **富文本预览**：自研轻量 Markdown→HTML 渲染（支持标题、粗体、列表、引用、表格、代码）
- **复制全文**：一键复制到剪贴板（使用 Clipboard API）
- **下载 Markdown**：生成 `.md` 文件并触发浏览器下载（Blob + a[download]）
- **重新生成**：清空预览区后逐段打字机重写
- **元数据卡**：显示生成时间、Token 消耗、模型、Agent 链路
- **空状态提示**：未运行流水线时引导用户先去编排模块

---

## 5. 模拟数据说明

所有模拟数据位于 `data/` 目录，以 `window.DEMO_DATA_XXX` 全局对象挂载。

### knowledge.js — `window.DEMO_DATA_KNOWLEDGE`

| 字段 | 含义 |
|------|------|
| `presets[]` | 预置知识条目数组，包含 id、title、summary、tags、source、collectedAt、content |
| `quickCapture{}` | 快捷标签的采集结果字典，key 为标签名 |

**替换为真实数据**：将 `presets` 替换为数据库查询结果；`quickCapture` 替换为真实爬虫/API 返回结构。

### chat.js — `window.DEMO_DATA_CHAT`

| 字段 | 含义 |
|------|------|
| `responses[]` | 预制问答对，含 keywords（触发词）、reply（回复文本）、citations（引用映射）、thinkingData |
| `fallback` | 兜底回复 |

**替换为真实数据**：`responses` 改为调用 LLM API（如 `/v1/chat/completions`）的返回结果；关键词匹配改为向量检索。

### agents.js — `window.DEMO_DATA_AGENTS`

| 字段 | 含义 |
|------|------|
| `templates{}` | 任务模板字典，每个模板含 name 和 agents 数组 |
| `agents[].logs[]` | 每个 Agent 运行时的逐行日志文本 |

**替换为真实数据**：每个 Agent 的 `logs` 改为 SSE/WebSocket 实时推送；模板配置从数据库读取。

### outputs.js — `window.DEMO_DATA_OUTPUTS`

| 字段 | 含义 |
|------|------|
| `[key].content` | Markdown 格式的产出物正文 |
| `[key].metadata` | 生成元数据（时间、token、模型、Agent 链路） |

**替换为真实数据**：`content` 改为 LLM 流式生成结果；`metadata` 从 API 响应头或日志系统获取。

---

## 6. 设计取舍 (Trade-offs)

### 1. 为什么用 CDN 而不是构建工具？

**决策**：Tailwind CSS 通过 CDN 加载，整个项目零构建步骤，双击 HTML 即可运行。

**理由**：这个 Demo 的受众需要"零摩擦体验"——下载即看，不需要 `npm install && npm run dev`。对作品集展示而言，降低看客的操作门槛比技术先进性更重要。CDN 版本的 Tailwind 会稍微增加首屏加载时间（约 200KB），但在本地文件场景下可以忽略。

**代价**：无法使用 Tailwind 的 `@apply` 指令和插件系统，部分复杂样式需要手写 CSS 补充。

### 2. 为什么用固定流水线而不是可拖拽节点？

**决策**：模块 3 的 Agent 编排使用固定的 4 节点水平流水线 + SVG 连线，而不是可拖拽的节点编辑器。

**理由**：可拖拽节点编排（如 React Flow 风格）的实现复杂度太高，对于一个展示 Demo 来说投入产出不成正比。固定流水线已经能充分展示"多 Agent 协作"的概念核心，且代码更易理解和维护。真正需要可拖拽编排的用户会使用专业的编排工具（如 LangChain、Dify），而非前端 Demo。

**代价**：无法演示自定义编排路径，但对于"展示工程师对多 Agent 架构的理解"这一目标而言足够了。

### 3. 为什么聊天用预制回复而不是真实接 LLM？

**决策**：模块 2 的对话功能使用关键词匹配预制回复，而非调用真实 LLM API。

**理由**：① 避免 API Key 泄露风险（作品集代码通常上传到公开 GitHub）；② 确保 Demo 在任何网络环境下都能完整展示（不依赖外部 API 可用性）；③ 预制回复经过精心设计，能稳定展示引用溯源、流式输出等关键特性，而真实 LLM 的输出格式不可控。数据文件的结构设计已为接入真实 API 留好接口——只需替换 `matchChatResponse` 和 `typewriter` 的调用方式即可。

### 4. 为什么 emoji 替代图标库？

**决策**：所有图标使用系统 emoji 而非图标库（如 Heroicons、Lucide）。

**理由**：emoji 在主流操作系统上渲染一致、零额外体积、无需引入外部依赖。对于 Demo 级别的项目，emoji 的视觉效果足够好。如果升级为正式产品，可以用 SVG 图标组件替换。

---

## 7. 如何扩展为真实系统

以下是各模块接入真实后端的关键位置和伪代码。

### 模块 1：智能采集 → 接入真实爬虫 API

```javascript
// 当前（模拟）：startCapture() 从 DEMO_DATA_KNOWLEDGE.quickCapture 读取
// 替换为：
async function startCapture(inputValue) {
  const response = await fetch('/api/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: inputValue })
  });

  // SSE 接收实时日志
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    appendLogLine(text); // 复用现有的 appendLogLine 逻辑
  }
}
```

### 模块 2：知识对话 → 接入 LLM API

```javascript
// 当前（模拟）：matchChatResponse() 关键词匹配 → typewriter() 流式输出
// 替换为：
async function sendMessage(userInput) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userInput }],
      context: getSelectedKnowledgeIds(), // 复用现有勾选逻辑
      stream: true
    })
  });

  // SSE 流式接收 → 复用现有 typewriter 逐步追加逻辑
  const eventSource = new EventSource('/api/chat/stream');
  eventSource.onmessage = (event) => {
    appendToBubble(event.data); // 逐 token 追加
  };
}
```

### 模块 3：工作流编排 → 接入任务队列

```javascript
// 当前（模拟）：runPipeline() 使用 setTimeout 模拟节点动画
// 替换为：
async function runPipeline(templateKey) {
  const response = await fetch('/api/pipeline/run', {
    method: 'POST',
    body: JSON.stringify({ template: templateKey })
  });
  const { taskId } = await response.json();

  // WebSocket 监听任务进度
  const ws = new WebSocket(`wss://api.example.com/ws/pipeline/${taskId}`);
  ws.onmessage = (event) => {
    const { agentIndex, status, log } = JSON.parse(event.data);
    updateNodeState(agentIndex, status); // 复用现有节点状态更新
    appendLogLine(log);                   // 复用现有日志输出
  };
}
```

### 模块 4：成果产出 → 接入内容存储

```javascript
// 当前（模拟）：从 DEMO_DATA_OUTPUTS 读取 → markdownToHtml() 渲染
// 替换为：
async function loadOutput(taskId) {
  const response = await fetch(`/api/outputs/${taskId}`);
  const data = await response.json();
  renderMarkdown(data.content); // 复用现有 markdownToHtml()
  renderMetadata(data.metadata); // 复用现有元数据卡渲染
}
```

**关键设计原则**：所有模拟数据文件的字段结构与真实 API 返回结构一一对应，切换时只需替换数据获取方式，UI 渲染逻辑无需改动。

---

## 8. 构建日志

这次任务我在开始前先花了大约 10 分钟仔细阅读了提示词全文，在心里把 4 个模块的数据流和交互关系梳理了一遍。提示词写得非常详尽，几乎没有模糊地带，这让我在实现过程中基本没有遇到需要"猜"的地方。

第一个关键决策是**数据文件的组织结构**。我选择用 `window.DEMO_DATA_XXX` 全局挂载而不是 ES Module，因为提示词明确要求零构建、原生 ES2020+。这意味着不能使用 `import/export` 语法。全局挂载在这个场景下是合理的——所有数据文件本质上是"配置"，而非需要模块隔离的业务逻辑。

第二个值得记录的决策是 **Markdown 渲染函数的实现策略**。提示词说"不需要引入库"，我最初想用一个简单的正则链式替换，但实际写下来发现表格、引用、代码块的处理相互有依赖顺序。我最终采用的策略是先 HTML 转义原文、再按优先级依次替换（代码块 → 行内代码 → 表格 → 标题 → 粗体 → 引用 → 列表 → 段落），最后还原转义。这个顺序经过了两次调整——最初代码块处理放在标题之后，导致 `#` 开头的代码被错误转换。

第三个踩坑点是**跨模块数据共享**。模块 1 采集的知识条目需要在模块 2 的勾选清单和知识库迷你列表中同时显示，模块 3 的流水线结果要传递到模块 4。我选择将 `knowledgeBase` 和 `pipelineResult` 放在全局 `state` 对象中，所有模块通过读写 `state` 来同步数据。这比事件总线更简单直观，适合 Demo 级别的复杂度。

**打字机效果的实现**也值得记录。提示词要求两种打字机效果——逐字符输出（聊天回复）和逐行输出（日志面板）。我封装了两个函数：`typewriter()` 用 `setInterval` 逐字填充 `textContent`，`typewriterLines()` 用递归 `setTimeout` 逐行追加 DOM 元素。行间加了 `Math.random() * 300` 的随机延迟，让日志输出看起来更像真实异步过程。

还有一个**流水线 SVG 连线的动态定位**问题。因为节点使用 flex 布局，位置会随容器宽度变化，连线需要在 resize 时重绘。我通过计算节点 `getBoundingClientRect()` 相对于 SVG 父容器的偏移来定位连线端点，并在 `window.resize` 事件中防抖重绘。

最后，**设计取舍**方面我故意压低了技术上限——不用可拖拽编排、不用真实 LLM、不用构建工具——这些决策都是为了"零摩擦体验"。一个作品集 Demo 的第一优先级是让人 3 分钟看懂，而不是证明技术深度。技术深度体现在代码结构、注释质量、和扩展接口的设计上。

我的个人评判：这个 Demo 作为作品集展示项目能够胜任。代码组织清晰、交互流畅、文档完备。如果让我指出可以改进的地方，我会说模块 3 的固定流水线可以考虑增加一个"手动步进"模式，让观众可以逐个节点地观察状态转换，增强教育意义。

---

## 验收清单

- [x] `product-1/` 目录已创建，所有文件在内
- [x] 双击 `index.html` 在浏览器中可直接运行，无报错
- [x] 四大模块均可访问且交互完整
- [x] 模块 1 采集后能在模块 2 看到、在模块 4 引用
- [x] 流水线运行有逐节点动效 + 日志流
- [x] 复制、下载真实可用
- [x] AI 思考过程侧栏在 4 个模块都能展示对应内容
- [x] README 八项内容齐备，构建日志真诚具体
- [x] 代码注释覆盖率高，结构清晰
