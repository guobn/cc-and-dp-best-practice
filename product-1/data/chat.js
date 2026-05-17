/**
 * chat.js - 模拟对话回复数据
 * 职责：提供基于关键词匹配的预制问答对 + AI 思考过程数据
 * 全局挂载：window.DEMO_DATA_CHAT
 *
 * 字段说明：
 *   keywords     - 触发关键词数组（用户输入包含任一即匹配）
 *   reply        - 完整回复文本，[N] 表示引用第 N 条知识的角标位置
 *   citations    - 引用映射：{ id: 知识条目ID, marker: '[N]' }
 *   thinkingData - 模拟的 AI 思考过程（检索 chunks、相似度、prompt、token）
 */
window.DEMO_DATA_CHAT = {
  responses: [
    {
      keywords: ['总结', '概括', '汇总', '总结一下'],
      reply: '根据知识库内容，我为你总结如下：\n\n当前知识库涵盖了三大主题领域。一是[AI 辅助编程最佳实践][1]，强调结构化 Prompt 模板和多 Agent 协作架构的重要性。二是[前端性能优化策略][2]，从资源加载到运行时优化提供了完整的实践路径。三是[产品思维方法论][3]，核心是问题空间与解空间的分离。\n\n这三个主题实际上形成了现代软件工程的完整闭环：用产品思维定义正确的问题，用 AI 编程提升实现效率，用性能优化保障交付质量。',
      citations: [
        { id: 'k1', marker: '[1]' },
        { id: 'k2', marker: '[2]' },
        { id: 'k3', marker: '[3]' }
      ],
      thinkingData: {
        chunks: [
          { id: 'k1', title: 'AI 辅助编程最佳实践（2025）', score: 0.92 },
          { id: 'k2', title: '前端性能优化全景指南', score: 0.87 },
          { id: 'k3', title: '产品思维：从用户问题到解决方案', score: 0.81 }
        ],
        prompt: '基于以下知识库内容，回答用户问题："总结一下"。请用结构化的方式呈现三大主题及其关联...',
        tokens: { prompt: 1520, completion: 380, total: 1900 },
        model: 'deepseek-v4-pro[1m]'
      }
    },
    {
      keywords: ['最佳实践', '实践', '怎么做', '方法', '技巧'],
      reply: '关于最佳实践，知识库中提供了丰富的指导：\n\n在 [AI 辅助编程][1] 方面，关键是建立结构化的 Prompt 模板体系——明确角色、提供上下文、定义输出格式。单 Agent 处理简单任务，多 Agent 协作解决复杂场景。\n\n在 [前端性能优化][2] 方面，建议从三个层面推进：网络层启用 HTTP/3 + CDN，运行时使用虚拟滚动和 Web Worker，构建时做好 Tree Shaking 和 Code Splitting。\n\n建议你从最痛的点开始优化，用一个指标（如 FCP 或 LCP）来衡量改进效果。',
      citations: [
        { id: 'k1', marker: '[1]' },
        { id: 'k2', marker: '[2]' }
      ],
      thinkingData: {
        chunks: [
          { id: 'k1', title: 'AI 辅助编程最佳实践（2025）', score: 0.94 },
          { id: 'k2', title: '前端性能优化全景指南', score: 0.90 }
        ],
        prompt: '基于以下知识库内容，回答用户问题："最佳实践有哪些"。请列举具体可操作的实践建议...',
        tokens: { prompt: 1280, completion: 420, total: 1700 },
        model: 'deepseek-v4-pro[1m]'
      }
    },
    {
      keywords: ['开始', '入门', '如何', '怎么开始', '如何开始'],
      reply: '很好的问题！根据知识库内容，建议按以下路径开始：\n\n第一步，建立[产品思维][3]——先搞清楚你要解决什么问题，用户是谁，痛点在哪。不要一上来就写代码。\n\n第二步，学习[AI 辅助编程][1]——从写一个好的 Prompt 开始。尝试用 AI 工具生成一个简单功能的代码，体验人机协作的节奏。\n\n第三步，关注[性能优化][2]——在功能跑通后，学习基本的性能分析和优化技巧，养成"先跑通再优化"的工程习惯。\n\n建议你从一个小项目开始实践，边做边学，效果最好。',
      citations: [
        { id: 'k3', marker: '[3]' },
        { id: 'k1', marker: '[1]' },
        { id: 'k2', marker: '[2]' }
      ],
      thinkingData: {
        chunks: [
          { id: 'k3', title: '产品思维：从用户问题到解决方案', score: 0.91 },
          { id: 'k1', title: 'AI 辅助编程最佳实践（2025）', score: 0.88 },
          { id: 'k2', title: '前端性能优化全景指南', score: 0.79 }
        ],
        prompt: '基于以下知识库内容，回答用户问题："如何开始"。请给出分步骤的入门路径...',
        tokens: { prompt: 1350, completion: 460, total: 1810 },
        model: 'deepseek-v4-pro[1m]'
      }
    }
  ],

  /**
   * 兜底回复：当用户输入无法匹配任何关键词时返回
   */
  fallback: {
    reply: '这是一个演示 Demo，当前已配置 3 组示例问答。请尝试输入以下关键词触发演示：\n\n• "总结一下" — 获取知识库全景摘要\n• "最佳实践有哪些" — 查看各领域实践建议\n• "如何开始" — 获取入门路径指导\n\n如需扩展，可在 data/chat.js 中添加更多问答对。',
    thinkingData: {
      chunks: [],
      prompt: '用户输入无匹配关键词，返回兜底引导回复...',
      tokens: { prompt: 200, completion: 120, total: 320 },
      model: 'deepseek-v4-pro[1m]'
    }
  }
};
