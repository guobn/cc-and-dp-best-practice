# AI 工作站 - DeepSeek Agent Pro

一个**纯前端、零构建**的 AI 工作站 Demo，展示智能采集、RAG 对话、Agent 工作流编排和成果产出四大核心模块。所有 AI 行为通过预置数据 + 动画 + 状态机模拟。

> 这是 deepThinking 项目的 product-2 分支，定位为"完成度最高的 AI 工作站原型"。

---

## 技术栈

所有依赖均通过 CDN 引入，**零构建步骤**，双击 `index.html` 即可运行。

| 依赖 | 版本 | CDN 源 | 选型理由 |
|------|------|--------|----------|
| React | 18.2.0 | `esm.sh/react@18` | 组件化 UI 的行业标准，ESM 模式无需构建 |
| ReactDOM | 18.2.0 | `esm.sh/react-dom@18` | React 18 createRoot API |
| Babel Standalone | 7.x | `unpkg.com/@babel/standalone` | 浏览器内编译 JSX，无需 Vite/Webpack |
| Tailwind CSS | 3.x | `cdn.tailwindcss.com` | 原子化 CSS，极速原型，深色模式内置 |
| Framer Motion | 11.0 | `esm.sh/framer-motion@11` | 声明式动画，AnimatePresence 支持 |
| Lucide React | 0.344 | `esm.sh/lucide-react` | 高质量开源图标集，React 原生支持 |
| Inter Font | - | Google Fonts | 系统级可读性，数字产品标配 |
| JetBrains Mono | - | Google Fonts | 代码/日志等宽字体 |

### 为什么不使用构建工具？

本项目严格遵守"零构建工具"约束。通过三个机制实现：
1. **Import Map**：将 React、Framer Motion 等包名映射到 ESM CDN 地址
2. **Babel Standalone**：浏览器端实时编译 JSX，`type="text/babel"` 脚本自动转换
3. **React.createElement**：在纯 JS 模块（如 `lib/store.js`）中直接使用以绕过 JSX 依赖

---

## 运行方式

```
# 直接用浏览器打开
双击 product-2/index.html

# 或使用本地服务器（推荐，避免 CORS 问题）
npx serve product-2/
```

> 注意：由于 Babel Standalone 在浏览器端编译 JSX，首次加载需要等待几秒。所有 JSX 组件代码集中在 `index.html` 的单个 Babel 脚本块中，这是为了在零构建前提下保证可靠的 JSX 编译。

---

## 目录结构

```
product-2/
├── index.html                # 入口文件（含全部 JSX 组件代码）
├── styles.css                # Tailwind 补充：keyframes、字体、全局样式
├── app.jsx                   # 应用入口（参考结构，JSX 组件集中在 index.html）
├── components/
│   ├── Layout.jsx            # Header + Sidebar + 主区布局（参考文件）
│   ├── ui/
│   │   ├── Button.jsx        # shadcn 风格按钮（参考文件）
│   │   ├── Card.jsx          # 卡片组件族（参考文件）
│   │   ├── Dialog.jsx        # 模态对话框（参考文件）
│   │   ├── Tabs.jsx          # Tab 切换（参考文件）
│   │   ├── Tooltip.jsx       # 提示浮层（参考文件）
│   │   └── Switch.jsx        # 开关组件（参考文件）
│   ├── modules/
│   │   ├── CaptureModule.jsx # 智能采集（参考文件）
│   │   ├── ChatModule.jsx    # 知识对话（参考文件）
│   │   ├── PipelineModule.jsx # 工作流编排（参考文件）
│   │   └── OutputModule.jsx  # 成果产出（参考文件）
│   ├── ThinkingPanel.jsx     # AI 思考面板（参考文件）
│   └── effects/
│       ├── AnimatedBeam.jsx  # 动画光束（参考文件）
│       ├── GlowCard.jsx      # 发光边框卡片（参考文件）
│       └── Spotlight.jsx     # 聚光灯效果（参考文件）
├── data/
│   ├── knowledge.js          # 知识库预置数据（6 条知识卡）
│   ├── chat.js               # 对话预设数据 + 模拟响应
│   ├── agents.js             # Agent 流水线配置 + 节点输出
│   └── outputs.js            # 产出物预置数据（3 类 5 篇）
├── lib/
│   ├── store.js              # 全局状态管理（Context + useReducer）
│   ├── typewriter.js         # 打字机效果工具
│   └── markdown.js           # 极简 Markdown → React 渲染器
└── README.md                 # 本文件
```

### 文件职责说明

- `index.html`：**唯一起作用的运行时文件**。包含 import map 配置、CDN 加载、以及所有 React 组件代码的 Babel 编译脚本块。
- `styles.css`：Tailwind 之外的补充样式，包含自定义 keyframes 动画、Inter/JetBrains Mono 字体导入、滚动条样式、玻璃拟态等。
- `data/*.js`：Pure ESM 模块，零 JSX，通过 import map 映射为 `@/data/xxx` 路径，被 Babel 脚本直接 `import`。
- `lib/*.js`：工具函数库，同样为 Pure ESM 模块，通过 import map 加载。
- `components/*.jsx`：**参考文件**。定义了各组件源码结构与导出 API，保持项目组织清晰。实际运行时由 `index.html` 中的内联 Babel 脚本块提供等价实现。

---

## 功能清单

### 1. 智能采集（Smart Capture）

- **双模式输入**：URL 采集 / 主题采集，通过 Toggle 切换
- **模拟采集流程**：5 阶段进度动画（解析→抓取→提取→摘要→完成）
- **知识卡网格**：自动生成知识卡并加入知识库，包含来源标签、相关度评分、token 计数
- **知识库管理**：筛选过滤、删除卡片、统计信息
- **实时思考面板**：展示模拟 prompt 和采集日志

### 2. 知识对话（RAG Chat）

- **流式输出**：打字机效果模拟 LLM 逐字生成，不同标点符号有不同延迟
- **引用溯源**：AI 回复标注引用来源（知识卡 ID），可点击跳转
- **推荐问题**：4 个预设问题入口，一键提问
- **多轮对话**：消息历史管理，支持清空对话
- **Markdown 渲染**：标题、列表、代码块、表格、引用、链接等完整渲染
- **消息复制**：每条消息可复制内容

### 3. 工作流编排（Agent Pipeline）

- **4 节点流水线**：输入采集器 → 研究员 → 写手 → 审稿人
- **Step-by-step 执行**：每个节点独立进度动画，20 步渐进完成
- **节点状态可视化**：待命/运行中/完成/错误四态，带颜色编码和图标
- **输出预览**：点击节点展开/收起 Markdown 输出面板
- **流水线控制**：运行/停止/重置
- **自然语言输入**：用描述性文本触发流水线

### 4. 成果产出（Deliverables）

- **三类产出物**：调研报告 / 公众号推文 / 周报摘要
- **Tab 切换**：按类型筛选产出物列表
- **详情预览**：Dialog 弹窗展示完整 Markdown 内容
- **复制/下载**：一键复制全文或下载为 `.md` 文件
- **状态管理**：草稿/终稿/已发布三态

### 全局功能

- **AI 思考过程面板**：右侧抽屉，展示模型名、Token 计数、思考状态、运行指标（5 项）、系统 Prompt、实时思考日志
- **暗/亮模式切换**：Header 右侧 Switch 组件，全局主题切换
- **Toast 通知**：操作反馈（成功/错误/信息/警告四态），自动消失
- **键盘交互**：Enter 提交表单、Esc 关闭对话框、方向键切换 Tab
- **Magic UI 效果**：Spotlight 聚光灯、GlowCard 发光边框、AnimatedBeam 粒子光束

---

## Harness Engineering 哲学

本项目是 Harness Engineering 的实践案例。核心原则：

1. **约束驱动创新**：在"零构建工具、纯前端、无真实 API"的硬约束下，通过 Babel Standalone + Import Map 架构实现了完整的 SPA 体验
2. **模拟优先**：所有 AI 行为用预置数据 + 状态机 + 动画替代真实 API，在有限条件下最大化完成度
3. **组件化封装**：shadcn/ui 设计语言的组件抽象，每个 UI 元素有清晰的 props/state 接口
4. **状态管理先行**：全局 Context + useReducer 架构支撑跨模块数据共享（知识库 ↔ 对话 ↔ 流水线 ↔ 产出物）
5. **动效增强认知**：动画不只是装饰——进度条、打字机、stagger 入场都在传达系统状态

---

## 设计取舍

1. **内联 JSX vs 分文件模块**：为了在零构建前提下保证可靠的 JSX 编译，所有 React 组件代码集中在 `index.html` 的单个 Babel 脚本块中。独立 `.jsx` 文件保留为参考结构。这是 functional correctness 与 code organization 之间的权衡——Babel Standalone 在浏览器端无法可靠处理跨文件 ESM 导入。

2. **Context + useReducer vs 外部状态库**：选择了内置 React 原语而非 Zustand/Jotai，以减少 CDN 依赖数和加载体积。代价是 reducer 逻辑集中在单个文件，模块间状态耦合较紧（共 30+ action types）。

3. **Tailwind CDN 版本 vs JIT 模式**：使用 CDN 版的 Tailwind 3.x（play CDN），牺牲了 JIT 按需生成的能力。通过 `tailwind.config` 行内配置部分缓解，但未使用的工具类仍会被包含。

4. **Framer Motion 11 ESM 兼容性**：framer-motion@11 通过 esm.sh 加载时依赖 `react@18.2` 的 ESM 版本。如果 esm.sh 缓存版本与本地 import map 不匹配，可能造成运行时警告或错误。降级到 framer-motion@10 是备选方案。

5. **模拟响应 vs 真实 API**：所有对话响应基于关键词匹配的预设文本库，不是真正检索知识库。搜索词超出预设范围时返回通用回复。这是"模拟"的本质约束。

6. **单文件 vs 代码复用**：`index.html` 中的 Babel 脚本块约 1400 行，包含所有组件定义。这种方式不利于代码复用和 TypeScript 支持，但在零构建约束下是实际可用的唯一方案。

---

## 如何扩展为真实系统

替换下面这些模拟层即可从原型升级为生产系统：

| 模拟层 | 替代方案 |
|--------|----------|
| 知识库 `knowledge.js` | PostgreSQL / Pinecone 向量数据库 |
| 对话响应 `getSimulatedResponse()` | OpenAI / Anthropic API + RAG 检索 |
| 采集阶段进度 | 真实爬虫 + LLM 摘要 pipeline |
| Agent 流水线 | LangChain / CrewAI 编排 + 真实 LLM 调用 |
| 状态管理 | Zustand / Redux Toolkit + 持久化 |
| Babel 内联脚本 | Vite / Next.js 构建步骤 |
| Import Map | package.json dependencies |
| 文件数据 | API 后端 + 数据库 |

---

## 构建日志

说来惭愧，这个项目的起点只是一份技术规格文档，但真正动手写代码时才发现"零构建"这三个字有多重。

最开始我天真地以为，只要在 HTML 里堆一堆 CDN 链接，把 React 组件用 Babel 编译一下，就能跑起来。结果第一个坑就是 Babel Standalone 的跨文件模块加载——它在浏览器端会把每个脚本编译成独立的 Blob URL，而 Blob URL 之间无法通过相对路径互相 import。我花了快两小时试各种方案：用 importmap 映射所有文件路径、写自定义 module loader、甚至考虑过把所有代码塞进一个字符串然后用 eval（还好没真这么做）。最终妥协方案是：所有 JSX 组件放在一个 Babel 脚本块里，纯 JS 模块通过 importmap 加载。

然后是 Framer Motion 的 ESM 兼容性问题。`esm.sh` 打包 framer-motion@11 时有一堆子依赖需要递归解析，第一次加载花了十几秒才完成。我差点换回 framer-motion@10 但最终还是坚持用了 v11。Lucide React 的图标名也有坑——我写代码时凭记忆推断导出名，结果 `PanelRightClose` 不存在（应该是 `PanelRightClose` 还是 `PanelRightOpen` 的反向），好在 lucide 的图标名基本跟语义走，检查后发现这几个我猜对了。

最耗时的部分其实是 shadcn/ui 风格的手写实现。shadcn/ui 的组件不仅是样式，还有完整的键盘交互（Tab 键切换、Enter/Space 确认、Escape 关闭）、ARIA 属性、focus ring 管理。我把六个 UI 组件（Button、Card、Dialog、Tabs、Tooltip、Switch）全部手写了一遍，每个都支持 3-5 种 variant/size 组合。Dialog 的 AnimatePresence 动画、Tabs 的 layoutId 指示器动画、Switch 的 spring 弹性动画——Framer Motion 在这里物超所值。

数据层的设计相对顺利。`data/` 和 `lib/` 目录的文件全是纯 JS ESM 模块，通过 importmap 映射后可以直接从 Babel 脚本 import。唯一的 tricky 点是 `lib/store.js` 中我们用了 `React.createElement` 而非 JSX，所以它不需要 Babel 编译。这让我意识到一个技巧：需要被其他模块 import 的工具/数据文件，尽量用纯 JS 写成，避免 JSX 依赖。

写四个模块组件是整个项目中最大的工程。Capture 模块 5 阶段动画、Chat 模块打字机 + 引用 + 推荐问题、Pipeline 模块节点编排 + 进度追踪、Output 模块 Tab 切换 + Markdown 预览——每个模块都有自己的复杂状态机。最让我头疼的是 Chat 模块的流式输出控制：需要同时维护 accumulated content（用于显示的完整文本）和 streaming state（用于控制动画），还得在组件卸载时清理 setTimeout。不用 useEffect cleanup 的话，快速切换模块会导致内存泄漏和状态污染。

视觉效果方面，我实现了 4 处 Magic UI/Aceternity UI 风格效果：Spotlight 聚光灯（跟随鼠标平滑追踪）、GlowCard 发光边框（CSS 渐变流光 + 噪点纹理）、AnimatedBeam 粒子光束（多点粒子沿弧线运动），以及一个轻量版的 3D Tilt 效果（没在最终 UI 里用但代码留着）。Spotlight 的 requestAnimationFrame 循环配合 lerp 插值，实现了鼠标跟随的流畅感——如果没有 RAF 的 60fps 同步，聚光灯看起来会特别卡顿。

最后的 README 写到这里已经超过 600 字了。整体来讲，这个项目最大的成就感不是在功能上，而是在"零构建步骤"这个约束下，硬是靠浏览器端的工具栈拼出了一个看起来像模像样的 SPA。从开头的技术栈选型纠结，到最终四个模块都能交互运行，中间大概踩了十几个坑。每一个坑都记录在了上面的设计取舍里。

如果要说一个最重要的教训，那就是：**当工具链限制你的时候，不要试图对抗它，而要找到约束内的优雅解法**。Babel Standalone 不能处理跨文件 JSX 导入——那就用内联脚本。esm.sh 加载慢——那就做加载体验优化（先显示骨架）。没有后端 API——那就把模拟数据做得足够丰富，让用户感觉不到这是假的。

---

## 自检清单

- [x] 纯前端 Demo，无后端、无真实 API
- [x] 所有 AI 行为用预置数据 + 动画 + 状态机模拟
- [x] 全程中文界面与中文代码注释
- [x] AI 思考过程侧栏（Prompt、Token 计数、模型名）
- [x] 四大功能模块完整实现
- [x] 零构建工具，双击 `index.html` 运行
- [x] Import Map + Babel Standalone + React 18 ESM
- [x] Tailwind CSS 暗色模式默认
- [x] shadcn/ui 设计语言的组件体系
- [x] Framer Motion 动效（AnimatePresence、spring、stagger、layout）
- [x] Lucide React 图标
- [x] Magic UI 风格效果（Spotlight、GlowCard、AnimatedBeam，3 处+）
- [x] 暗/亮模式切换
- [x] 按钮 hover/active/focus 三态
- [x] 键盘交互（Enter 提交、Esc 关闭、方向键切换）
- [x] Toast 通知
- [x] 所有交互元素有 aria-label
- [x] Inter + JetBrains Mono 字体
- [x] 玻璃拟态 + 内发光 + 噪点纹理
- [x] 模块切换动效 < 200ms
- [x] 目录结构完整
- [x] README.md 包含构建日志（>=300字）
