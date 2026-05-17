/**
 * data/agents.js — 模拟 Agent 流水线数据
 * 工作流编排模块的 4 节点流水线
 */

/** 流水线节点定义 */
const PIPELINE_NODES = [
  {
    id: 'collector',
    name: '输入采集器',
    icon: '📥',
    description: '收集并整理用户输入的原始需求和信息源',
    prompt: '分析用户输入的 URL 和主题，提取关键信息并结构化存储',
    duration: 1200 // 模拟执行时长 (ms)
  },
  {
    id: 'researcher',
    name: '研究员',
    icon: '🔍',
    description: '对采集到的信息进行深度研究和分析',
    prompt: '基于采集的数据，查找相关资料，进行多角度分析并撰写研究报告',
    duration: 2000
  },
  {
    id: 'writer',
    name: '写手',
    icon: '✍️',
    description: '将研究结果转化为高质量的内容输出',
    prompt: '根据研究报告，撰写结构清晰、语言流畅的最终文档',
    duration: 1800
  },
  {
    id: 'reviewer',
    name: '审稿人',
    icon: '✅',
    description: '审核内容质量，确保事实准确和格式规范',
    prompt: '检查文档的事实准确性、逻辑一致性、语法正确性和格式规范性',
    duration: 1500
  }
];

/** 模拟输出数据（流水线执行结果） */
const PIPELINE_OUTPUTS = {
  collector: '【采集结果】\n- 来源 URL: https://example.com/ai-trends-2026\n- 主题: 2026年AI技术趋势分析\n- 关键词: Agent、RAG、多模态、端侧部署\n- 采集时间: 2026-05-18 14:32:00\n- 文档长度: 2,847 字',

  researcher: '【研究报告】\n## 2026年AI技术趋势分析\n\n### 1. Agent 工作流走向主流\n2026年，基于大模型的 Agent 工作流从实验走向生产。主流框架（LangGraph、CrewAI）支持复杂的多 Agent 协作，企业开始采用 "Human-in-the-Loop" 模式确保关键决策的可靠性。\n\n### 2. RAG 技术持续演进\nRAG 从简单的向量检索演进为多模态 RAG、Agentic RAG 等新范式。GraphRAG 结合知识图谱提升多跳推理能力，成为企业知识库的标准方案。\n\n### 3. 端侧部署加速\n量化技术的成熟（如 AWQ、GGUF）使得 7B 参数模型能在手机和笔记本上运行，隐私敏感场景的本地推理需求激增。\n\n### 4. 多模态融合深化\n2026年的多模态模型已支持视频理解、3D 场景解析和实时音频交互，多模态 Agent 成为新的研究热点。',

  writer: '【最终文档】\n\n# 2026年AI技术趋势深度报告\n\n## 摘要\n2026年是AI技术从"能力突破"转向"工程落地"的关键一年。本报告聚焦四大趋势：Agent 工作流、RAG 技术演进、端侧部署和多模态融合，为技术决策提供参考。\n\n## 一、Agent 工作流：从实验到生产\n\n### 1.1 关键进展\n- LangGraph、CrewAI 等框架日趋成熟，支持复杂的图状工作流编排\n- 多 Agent 协作模式（辩论、投票、分工）在复杂任务中表现优异\n- "Human-in-the-Loop" 成为企业级部署的标准配置\n\n### 1.2 实践建议\n- 从简单顺序流水线起步，逐步引入并行和路由模式\n- 为每个 Agent 设置明确的角色和约束边界\n- 建立完整的日志和监控体系\n\n## 二、RAG 技术：从检索到推理\n\n### 2.1 GraphRAG 崛起\n传统向量 RAG 在处理多跳推理问题时存在局限，GraphRAG 通过构建知识图谱显著提升了复杂查询的回答质量。\n\n### 2.2 Agentic RAG\n将 RAG 与 Agent 结合，使系统能够自主决定何时检索、检索什么、如何综合多个来源的信息。\n\n## 三、端侧部署：让 AI 无处不在\n\n量化技术（AWQ、GGUF）使得 7B 模型在消费级 GPU 上流畅运行，Apple Silicon 和高通芯片的 NPU 进一步降低了端侧推理门槛。\n\n## 四、多模态：超越文本\n\n视频理解、3D 场景解析、实时语音对话 —— 多模态能力正在重新定义人机交互的边界。\n\n## 结论\n2026年的AI工程化需要综合运用 Agent、RAG、量化和多模态技术，构建可靠、高效、可扩展的智能系统。',

  reviewer: '【审核报告】\n\n审核结果: ✅ 通过\n\n检查项:\n- 事实准确性: ✅ 无事实错误\n- 逻辑一致性: ✅ 结构合理，论点清晰\n- 语法规范性: ✅ 无语法问题\n- 格式规范性: ✅ 符合 Markdown 标准\n- 引用完整性: ⚠️ 建议增加外部数据来源引用\n\n综合评级: A-\n\n建议修改:\n1. 在"端侧部署"部分增加具体性能数据对比\n2. 补充各趋势的引用来源'
};

let pipelineRunning = false;

/** 执行流水线（模拟） */
function runPipeline(onNodeStart, onNodeComplete, onComplete) {
  if (pipelineRunning) return;
  pipelineRunning = true;

  let nodeIndex = 0;

  function executeNext() {
    if (nodeIndex >= PIPELINE_NODES.length) {
      pipelineRunning = false;
      updateAISidebar({
        model: 'DeepSeek-R1-Distill (Pipeline)',
        prompt: '流水线编排执行：4 节点顺序流水线完成',
        tokens: PIPELINE_OUTPUTS.reviewer.length,
        status: '完成'
      });
      onComplete();
      return;
    }

    const node = PIPELINE_NODES[nodeIndex];
    const output = Object.values(PIPELINE_OUTPUTS)[nodeIndex];

    updateAISidebar({
      model: 'DeepSeek-R1-Distill (Pipeline)',
      prompt: node.prompt,
      tokens: output.length,
      status: `执行中: ${node.name}`
    });

    onNodeStart(node.id);

    // 模拟节点执行延迟
    setTimeout(() => {
      onNodeComplete(node.id, output);
      nodeIndex++;
      executeNext();
    }, node.duration);
  }

  executeNext();
}
