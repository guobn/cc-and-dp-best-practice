/**
 * 知识库数据 - 预置采集结果
 * 模拟真实的数据采集与摘要
 */

export const knowledgeCards = [
  {
    id: 'kc-001',
    title: 'AI Agent 架构演进深度分析',
    source: 'https://arxiv.org/abs/2401.12345',
    sourceType: '学术论文',
    summary: '本文系统梳理了 AI Agent 从 ReAct 到 Plan-and-Execute 的架构演进路径。提出了一种混合推理框架，将 System 1（快速直觉）与 System 2（深度思考）有机结合，在多个推理基准测试中取得 SOTA 表现。关键在于引入结构化记忆模块，支持长序列任务的上下文保持。',
    tags: ['AI Agent', '推理架构', '论文摘要'],
    collectedAt: '2026-05-17T08:30:00Z',
    relevance: 0.95,
    tokenCount: 1247,
    wordCount: 845
  },
  {
    id: 'kc-002',
    title: 'LLM 与知识图谱融合实践指南',
    source: 'https://medium.com/llm-knowledge-graph',
    sourceType: '技术博客',
    summary: '详细介绍了如何将 LLM 与知识图谱结合构建企业级问答系统。包含实体抽取、关系建模、图数据库查询生成等关键步骤。对比了 GraphRAG、KGP-Llama 等主流方案，提出了一种轻量级融合策略，在保持推理能力的同时显著降低计算开销。',
    tags: ['LLM', '知识图谱', 'RAG'],
    collectedAt: '2026-05-17T09:15:00Z',
    relevance: 0.88,
    tokenCount: 2130,
    wordCount: 1520
  },
  {
    id: 'kc-003',
    title: 'Cursor 编辑器深度评测：AI 编程新范式',
    source: 'https://cursor.sh/blog/ai-coding-paradigm',
    sourceType: '产品博客',
    summary: 'Cursor 作为 AI-native IDE，通过 Composer 模式实现多文件协同编辑。Tab 补全准确率提升 43%，上下文理解窗口达 20K tokens。支持自定义 Agent 指令与项目级规则配置。评测显示在重构任务中效率提升 2.3 倍，但在复杂架构决策场景仍需人工把控。',
    tags: ['AI编程', 'Cursor', '开发工具'],
    collectedAt: '2026-05-17T10:00:00Z',
    relevance: 0.92,
    tokenCount: 1856,
    wordCount: 1340
  },
  {
    id: 'kc-004',
    title: 'RAG 系统评估框架：从检索到生成的全面测试',
    source: 'https://rag-benchmark.dev/report',
    sourceType: '技术报告',
    summary: '提出了 RAGAS 评估框架的增强版本，包含忠实度、答案相关性、上下文精度、上下文召回率四个维度。在 12 个知识库上进行了大规模对比实验。结果显示混合检索策略（密集 + 稀疏）优于单一策略约 27%。建议在实际部署中引入人工反馈闭环。',
    tags: ['RAG', '评估', '检索增强'],
    collectedAt: '2026-05-17T11:30:00Z',
    relevance: 0.85,
    tokenCount: 3240,
    wordCount: 2180
  },
  {
    id: 'kc-005',
    title: 'MCP 协议：AI Agent 的工具调用标准',
    source: 'https://modelcontextprotocol.io/introduction',
    sourceType: '技术文档',
    summary: 'Model Context Protocol 定义了 AI Agent 与外部工具交互的标准接口，涵盖资源访问、工具执行、采样反馈三大核心能力。协议基于 JSON-RPC 2.0，支持流式传输和权限管理。对比了 Function Calling、Toolformer 等方案的优劣。',
    tags: ['MCP', '协议', 'Agent'],
    collectedAt: '2026-05-17T12:00:00Z',
    relevance: 0.90,
    tokenCount: 1670,
    wordCount: 1190
  },
  {
    id: 'kc-006',
    title: '多模态 Agent 系统设计白皮书',
    source: 'https://multimodal-agent.dev/whitepaper',
    sourceType: '白皮书',
    summary: '探索了视觉-语言-行动多模态 Agent 的系统架构。核心模块包括视觉感知编码器、跨模态对齐层、行动规划解码器。在 Robotics、GUI 自动化和文档理解三大场景验证了可行性。提出"感知-推理-执行"三阶段流水线，平均任务完成率提升 34%。',
    tags: ['多模态', 'Agent', '系统设计'],
    collectedAt: '2026-05-17T13:00:00Z',
    relevance: 0.93,
    tokenCount: 4520,
    wordCount: 3210
  }
];

export function getKnowledgeById(id) {
  return knowledgeCards.find(c => c.id === id);
}

export function searchKnowledge(query) {
  const q = query.toLowerCase();
  return knowledgeCards.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.summary.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
}
