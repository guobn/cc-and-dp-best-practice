/**
 * data/knowledge.js — 模拟知识库数据
 * 智能采集模块采集到的知识卡片
 */

const knowledgeBase = [
  {
    id: 1,
    title: 'Transformer 架构详解',
    summary: 'Transformer 是一种基于自注意力（Self-Attention）机制的神经网络架构，由 Vaswani 等人在 2017 年提出。它摒弃了传统的循环和卷积结构，完全依赖注意力机制来建模序列数据中的长距离依赖关系。',
    source: 'https://arxiv.org/abs/1706.03762',
    tags: ['深度学习', 'NLP', '架构'],
    date: '2026-05-10'
  },
  {
    id: 2,
    title: 'RAG 技术白皮书',
    summary: '检索增强生成（Retrieval-Augmented Generation）将信息检索与文本生成相结合，在生成回答前先从外部知识库检索相关文档片段，显著提升大模型回答的事实准确性和时效性。',
    source: 'https://example.com/rag-whitepaper',
    tags: ['RAG', 'LLM', '检索'],
    date: '2026-05-12'
  },
  {
    id: 3,
    title: 'Agent 工作流设计模式',
    summary: 'LLM Agent 工作流通常包含规划（Planning）、工具调用（Tool Use）、记忆管理（Memory）和反思（Reflection）四个核心组件。常见的编排模式包括顺序流水线、DAG 和循环自省。',
    source: 'https://example.com/agent-patterns',
    tags: ['Agent', '工作流', '架构设计'],
    date: '2026-05-14'
  },
  {
    id: 4,
    title: '大模型量化技术综述',
    summary: '模型量化通过降低权重和激活值的位宽（如从 FP16 到 INT4/INT8）来减少模型存储和计算开销。主流方法包括 GPTQ、AWQ 和 GGUF，在保持 95% 以上性能的同时可将模型体积缩小 4 倍。',
    source: 'https://example.com/quantization',
    tags: ['模型优化', '量化', '部署'],
    date: '2026-05-15'
  },
  {
    id: 5,
    title: '多模态学习前沿',
    summary: '多模态大模型（如 GPT-4V、Claude 3.5）能够同时处理文本、图像、音频等多种输入模态。核心挑战在于异构数据的对齐与融合，CLIP 式对比学习是目前最广泛使用的对齐方法。',
    source: 'https://example.com/multimodal',
    tags: ['多模态', '视觉', '前沿'],
    date: '2026-05-16'
  },
  {
    id: 6,
    title: '提示工程最佳实践',
    summary: '高质量的提示词（Prompt）设计是发挥大模型能力的关键。核心技巧包括：明确角色设定、提供 Few-shot 示例、使用思维链（Chain-of-Thought）、分隔符清晰区分指令与输入、逐步推理等。',
    source: 'https://example.com/prompt-engineering',
    tags: ['Prompt', '最佳实践', '入门'],
    date: '2026-05-17'
  }
];

/** 获取所有知识卡片 */
function getKnowledgeBase() {
  return JSON.parse(JSON.stringify(knowledgeBase));
}

/** 根据 ID 获取单张卡片 */
function getKnowledgeById(id) {
  return knowledgeBase.find(item => item.id === id) || null;
}

/** 搜索知识库 */
function searchKnowledge(query) {
  const q = query.toLowerCase();
  return knowledgeBase.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.summary.toLowerCase().includes(q) ||
    item.tags.some(tag => tag.toLowerCase().includes(q))
  );
}
