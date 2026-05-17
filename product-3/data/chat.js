/**
 * data/chat.js — 模拟 RAG 对话数据
 * 知识对话模块的流式对话 + 引用回链
 */

const chatMockMessages = [
  {
    role: 'assistant',
    content: '你好！我是 DeepMind 知识助手。我已经学习了知识库中的 6 篇文档，你可以问我关于 Transformer、RAG、Agent 工作流等问题。',
    citations: []
  }
];

const mockResponses = {
  'transformer': {
    content: 'Transformer 架构由 Google 在 2017 年的论文 "Attention Is All You Need" 中提出。其核心创新是 **自注意力机制**（Self-Attention），它允许模型在处理每个词时同时关注序列中的所有其他词。\n\n相比 RNN/LSTM，Transformer 的优势在于：\n1. **并行计算** —— 不依赖时序逐步计算，大幅提升训练速度\n2. **长距离依赖** —— 自注意力可以直接建模任意两个位置的关联\n3. **可扩展性** —— 堆叠更多层可获得更强的表达能力\n\n目前几乎所有主流大模型（GPT、Claude、LLaMA 等）都基于 Transformer 架构。',
    citations: [1, 3, 6]
  },
  'rag': {
    content: 'RAG（Retrieval-Augmented Generation）是一种将信息检索与文本生成相结合的架构。它的工作流程是：\n\n1. **检索阶段** —— 收到用户问题后，先在知识库中检索最相关的文档片段（通常用向量相似度搜索）\n2. **增强阶段** —— 将检索到的文档片段与原始问题拼接成增强提示\n3. **生成阶段** —— 大模型根据增强提示生成带引用的回答\n\nRAG 的核心价值在于：**让模型"查资料"而非"背资料"**，有效缓解大模型的幻觉问题，同时支持知识库的实时更新而无需重新训练模型。',
    citations: [2, 6]
  },
  'agent': {
    content: 'LLM Agent 工作流是一种让大模型具备自主执行多步骤任务能力的架构设计。常见的四种设计模式包括：\n\n1. **顺序流水线** —— 步骤依次执行，前一步输出是后一步输入（如：采集→分析→撰写→审核）\n2. **路由模式** —— 根据分类结果将任务分发到不同的处理分支\n3. **并行扇出** —— 多个 Agent 同时处理不同子任务，结果汇总\n4. **循环自省** —— Agent 反复评估自身输出并进行改进\n\n在我们的流水线 Demo 中，采用了**顺序流水线**模式：输入采集器 → 研究员 → 写手 → 审稿人。',
    citations: [3, 6]
  },
  '量化': {
    content: '大模型量化技术旨在降低模型的存储和计算开销，使其能在消费级硬件上运行。主流方法包括：\n\n- **GPTQ** —— 基于最优脑手术刀（OBS）框架的后训练量化方法，支持 INT4/INT8\n- **AWQ** —— 通过识别权重中 1% 的"异常通道"并单独保护它们来减少量化误差\n- **GGUF** —— llama.cpp 生态使用的量化格式，支持从 Q2 到 Q8 多种精度\n\n量化后的模型体积可缩小 3-4 倍，推理速度提升 2-3 倍，而性能损失通常控制在 3% 以内。',
    citations: [4, 6]
  },
  '多模态': {
    content: '多模态大模型是当前 AI 领域最前沿的方向之一。它能同时理解和生成文本、图像、音频等多种模态的内容。\n\n核心技术栈包括：\n- **模态对齐** —— 使用对比学习（如 CLIP）将不同模态映射到统一语义空间\n- **跨模态注意力** —— 在 Transformer 中引入跨模态注意力层\n- **统一分词器** —— 将图像、音频等非文本输入也转化为 Token 序列\n\n目前 GPT-4V、Claude 3.5 Sonnet、Gemini 等模型都已支持多模态输入，应用场景包括图文问答、文档解析、视频理解等。',
    citations: [5, 1]
  },
  'default': {
    content: '这是一个很好的问题！根据我的知识库，这个问题涉及多个知识领域。建议你查看以下相关卡片获取更详细的信息：\n\n1. **[Transformer 架构详解]** —— 了解基础的深度学习架构\n2. **[RAG 技术白皮书]** —— 了解检索增强生成的工作机制\n3. **[Agent 工作流设计模式]** —— 了解 LLM Agent 的编排方式\n\n如果需要更深入的内容，请提供更具体的问题方向。',
    citations: [1, 2, 3]
  }
};

/** 模拟获取流式回复（逐字输出） */
function getStreamingResponse(userMessage, onToken, onComplete) {
  const lowerMsg = userMessage.toLowerCase();

  // 匹配关键词
  let responseKey = 'default';
  for (const key of Object.keys(mockResponses)) {
    if (lowerMsg.includes(key)) {
      responseKey = key;
      break;
    }
  }

  const response = mockResponses[responseKey];
  const text = response.content;
  const citations = response.citations.map(id => getKnowledgeById(id)).filter(Boolean);

  // 模拟流式输出 —— 每 30ms 输出一个字
  let index = 0;
  let accumulated = '';

  const thinkingTime = 500 + Math.random() * 500; // 模拟思考延迟
  const tokenCount = text.length;

  // 先更新 AI 思考侧栏
  updateAISidebar({
    model: 'DeepSeek-R1-Distill',
    prompt: `基于知识库回答用户问题: "${userMessage.substring(0, 50)}..."`,
    tokens: tokenCount,
    status: '生成中...'
  });

  setTimeout(() => {
    const interval = setInterval(() => {
      if (index < text.length) {
        // 按句子片段输出，更自然
        const chunkSize = Math.min(1 + Math.floor(Math.random() * 3), text.length - index);
        accumulated += text.substring(index, index + chunkSize);
        index += chunkSize;
        onToken(accumulated);
      } else {
        clearInterval(interval);

        updateAISidebar({
          model: 'DeepSeek-R1-Distill',
          prompt: `基于知识库回答用户问题: "${userMessage.substring(0, 50)}..."`,
          tokens: tokenCount,
          status: '完成'
        });

        onComplete(accumulated, citations);
      }
    }, 30);
  }, thinkingTime);
}
