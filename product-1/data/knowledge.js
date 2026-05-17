/**
 * knowledge.js - 模拟知识库数据
 * 职责：提供预置知识条目 + 快捷采集的模拟结果
 * 全局挂载：window.DEMO_DATA_KNOWLEDGE
 *
 * 字段说明：
 *   id          - 唯一标识
 *   title       - 知识条目标题
 *   summary     - 3-5 句摘要
 *   tags        - 标签数组
 *   source      - 来源域名
 *   collectedAt - 采集时间
 *   content     - 完整正文（模块 2 RAG 检索用）
 */
window.DEMO_DATA_KNOWLEDGE = {
  presets: [
    {
      id: 'k1',
      title: 'AI 辅助编程最佳实践（2025）',
      summary: '本文总结了 2025 年 AI 辅助编程领域的关键实践，包括 Prompt Engineering 技巧、Agent 编排模式、以及人机协作的工程化方法论。研究表明，结构化的 Prompt 模板能将代码生成准确率提升 40% 以上，而多 Agent 协作架构可解决单 Agent 的上下文窗口瓶颈。',
      tags: ['AI编程', 'Prompt Engineering', '工程化'],
      source: 'github.blog',
      collectedAt: '2025-06-15 10:30',
      content: 'AI 辅助编程在 2025 年已成为主流开发方式。通过精心设计的 Prompt 模板，开发者可以将需求描述转化为高质量代码。多 Agent 协作架构将复杂任务拆分为子任务，由专业化 Agent 分别处理，最后通过编排层汇总结果。关键实践包括：明确角色设定、提供充分上下文、使用结构化输出格式、以及建立反馈循环。'
    },
    {
      id: 'k2',
      title: '前端性能优化全景指南',
      summary: '从浏览器渲染原理出发，系统梳理了资源加载优化（HTTP/3、CDN、资源提示）、运行时优化（虚拟滚动、Web Worker、WASM）、以及构建产物优化（Tree Shaking、Code Splitting）的核心策略。实践表明，综合运用这些策略可将 FCP 降低 60%。',
      tags: ['前端', '性能优化', '浏览器'],
      source: 'web.dev',
      collectedAt: '2025-06-14 14:20',
      content: '前端性能优化是提升用户体验的关键环节。在资源加载层面，HTTP/3 协议的多路复用消除了队头阻塞，CDN 边缘节点将静态资源延迟降至 50ms 以内。运行时优化方面，虚拟滚动技术将长列表渲染性能提升 10 倍，Web Worker 将密集计算移出主线程。构建产物优化中，Tree Shaking 平均减少 30% 的包体积。'
    },
    {
      id: 'k3',
      title: '产品思维：从用户问题到解决方案',
      summary: '产品思维的核心是以用户问题为起点，通过假设-验证循环逐步收敛到最优解。本文介绍了用户故事映射、影响地图、以及 OKR 驱动的产品迭代框架。重点强调"问题空间"与"解空间"的分离是做出好产品的关键。',
      tags: ['产品思维', '用户研究', '方法论'],
      source: 'productlessons.substack.com',
      collectedAt: '2025-06-13 09:00',
      content: '产品思维不是玄学，而是一套可复用的方法论。首先需要在问题空间充分探索：通过用户访谈识别真实痛点，用量化数据验证问题规模。然后进入解空间：用原型快速验证假设，通过 A/B 测试量化效果。整个过程中，用户故事映射帮助团队对齐需求全景，影响地图确保每个功能都追溯到业务目标。'
    }
  ],

  /**
   * 快捷标签的模拟采集结果
   * 点击快捷标签后模拟采集，生成以下数据
   */
  quickCapture: {
    'AI 周报': {
      title: 'AI 行业周报（6月第二周）',
      summary: '本周 AI 领域焦点：OpenAI 发布 GPT-5 多模态能力升级，DeepSeek 推出 v4 系列模型，Google DeepMind 在蛋白质折叠领域取得新突破。开源社区方面，Llama 4 生态持续扩张，HuggingFace 模型数量突破 50 万。',
      tags: ['AI周报', '行业动态', '开源'],
      source: 'aiweekly.substack.com'
    },
    '前端最佳实践': {
      title: '2025 前端最佳实践速览',
      summary: 'React 19 的 Server Components 已稳定，主流项目开始迁移。Tailwind CSS v4 带来全新的配置体验。Bun 作为运行时和包管理器日趋成熟，在性能和开发者体验上全面领先 Node.js。',
      tags: ['前端', '最佳实践', '2025'],
      source: 'frontendmastery.com'
    },
    '产品方法论': {
      title: '精益产品开发方法论精华',
      summary: '精益产品开发强调 Build-Measure-Learn 循环。在 AI 时代，这一方法论需要升级：AI 可以加速原型生成（Build）、自动化数据洞察（Measure）、以及辅助决策推演（Learn）。核心不变的是对用户价值的持续聚焦。',
      tags: ['产品', '精益', '方法论'],
      source: 'leanproduct.co'
    }
  }
};
