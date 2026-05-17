/**
 * 对话数据 - 预设对话流与模拟响应
 */

export const chatHistory = [
  {
    id: 'msg-001',
    role: 'user',
    content: '请分析 AI Agent 架构演进的最新趋势',
    timestamp: '2026-05-18T09:00:00Z'
  },
  {
    id: 'msg-002',
    role: 'assistant',
    content: `## AI Agent 架构演进趋势分析

基于知识库中的相关资料，我梳理出以下关键演进方向：

### 1. 从单一模型到多 Agent 协作
- **ReAct 模式**：推理 + 行动循环，让 LLM 能够调用外部工具
- **Plan-and-Execute**：将复杂任务分解为可执行的子任务序列
- **Multi-Agent 框架**：多个专业化 Agent 协同完成复杂工作流

### 2. 检索增强生成（RAG）的深化
- 混合检索策略（密集向量 + 稀疏关键词）显著优于单一策略
- GraphRAG 将知识图谱引入检索，提升关系推理能力
- 评估框架从单一维度扩展到忠实度、相关性、精度、召回率四维

### 3. 工具调用标准化
- MCP 协议正在成为 Agent-工具交互的事实标准
- 基于 JSON-RPC 2.0，支持流式传输和权限管理
- 相比 Function Calling 提供更丰富的上下文管理

### 4. 多模态能力融合
- 视觉-语言-行动三模态 Agent 实现端到端任务执行
- 在 Robotics、GUI 自动化场景验证有效
- "感知-推理-执行"三阶段流水线成为主流架构

> 引用来源：[AI Agent 架构演进深度分析](https://arxiv.org/abs/2401.12345)、[MCP 协议文档](https://modelcontextprotocol.io/introduction)`,
    citations: ['kc-001', 'kc-005'],
    timestamp: '2026-05-18T09:00:05Z',
    tokenCount: 680
  }
];

export const suggestedQuestions = [
  'Cursor 编辑器相比传统 IDE 有哪些核心优势？',
  '如何评估一个 RAG 系统的检索质量？',
  '多模态 Agent 在金融领域有什么应用前景？',
  'MCP 协议与 Function Calling 相比优劣势？'
];

export const simulatedResponses = {
  'cursor': `## Cursor 编辑器核心优势分析

Cursor 作为 AI-native IDE，在以下方面显著超越传统编辑器：

### 1. 智能代码补全
- **Tab 补全准确率提升 43%**：基于对完整项目上下文的深度理解
- 支持多行补全和条件性代码生成
- 自动预测下一个编辑位置

### 2. Composer 模式
- 多文件协同编辑能力，一次性完成跨文件重构
- 支持自然语言描述修改需求
- 实时展示变更预览与差异对比

### 3. 上下文理解
- 上下文窗口达 **20K tokens**，覆盖整个项目结构
- 自动索引项目代码库形成项目级理解
- 支持自定义 Agent 指令与项目级规则配置

### 4. 实际效率提升
- 重构任务效率提升 **2.3 倍**
- 样板代码生成速度提升 **4.5 倍**
- Bug 定位时间减少 **60%**

> ⚠️ 局限：在复杂架构决策、跨领域知识整合场景仍需人工把控。Cursor 是强大的辅助工具，而非完全替代品。

引用来源：[Cursor 编辑器深度评测](https://cursor.sh/blog/ai-coding-paradigm)`,

  '评估': `## RAG 系统评估框架详解

### 四维评估体系

| 维度 | 说明 | 测量方法 |
|------|------|----------|
| **忠实度** | 回答是否基于检索文档 | 事实一致性校验 |
| **答案相关性** | 回答是否切题 | 语义相似度评分 |
| **上下文精度** | 检索结果中相关文档占比 | @precision 指标 |
| **上下文召回率** | 相关文档被检索到的比例 | @recall 指标 |

### 关键技术发现

- **混合检索 > 单一检索**：密集向量检索 + 稀疏关键词检索 组合比单一策略优 **27%**
- **人工闭环必要性**：纯自动评估存在偏差，建议引入人工反馈调整检索权重
- **领域适配**：通用评估框架需要针对垂直领域微调评估标准

### 实践建议

1. 建立自动化评估流水线，每次知识库更新后运行
2. 设置评估阈值（如忠实度 > 0.85），低于阈值触发告警
3. 定期收集用户反馈，持续优化检索策略

引用来源：[RAG 系统评估框架](https://rag-benchmark.dev/report)`,

  '金融': `## 多模态 Agent 在金融领域的应用前景

### 核心场景

### 1. 智能研报分析
- 同时解析财报 PDF、图表趋势、新闻文本
- 跨模态信息交叉验证，发现潜在风险信号
- 自动生成投资摘要与关键指标仪表盘

### 2. 合规审查自动化
- 结合 OCR 识别合同文档 + NLP 语义分析
- 检测违规条款与潜在法律风险
- 监管报告自动生成与报送

### 3. 智能客服升级
- 理解用户发送的截图、语音和文字咨询
- 基于知识图谱提供精准的产品推荐
- 风险预警与主动服务

### 技术挑战

| 挑战 | 描述 | 当前进展 |
|------|------|----------|
| 数据安全 | 金融数据敏感，本地化部署要求高 | 边缘部署方案 |
| 实时性 | 交易场景要求毫秒级响应 | 推理优化中 |
| 可解释性 | 金融决策需要明确的推理依据 | Chain-of-Thought 导出 |

引用来源：[多模态 Agent 系统设计白皮书](https://multimodal-agent.dev/whitepaper)`,

  'mcp': `## MCP 协议 vs Function Calling 对比

### 核心差异

| 维度 | MCP 协议 | Function Calling |
|------|----------|-----------------|
| **设计理念** | 标准化接口协议 | API 调用约定 |
| **通信协议** | JSON-RPC 2.0 | HTTP/自定义 |
| **流式支持** | 原生支持流式传输 | 需额外实现 |
| **权限管理** | 内置权限控制 | 需自行实现 |
| **资源管理** | 资源访问抽象层 | 无标准化管理 |
| **工具发现** | 动态工具发现机制 | 静态定义 |

### MCP 三大核心能力

1. **资源访问**：标准化的数据获取接口，支持多种数据源
2. **工具执行**：统一工具调用规范，支持参数校验和错误处理
3. **采样反馈**：Agent 可向用户请求更多信息或澄清

### 选择建议

- **新项目**：优先选择 MCP 协议，面向未来标准化
- **已有系统**：可通过适配器桥接 Function Calling 与 MCP
- **简单场景**：Function Calling 仍够用，无需过度设计

引用来源：[MCP 协议介绍](https://modelcontextprotocol.io/introduction)`
};

export function getSimulatedResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('cursor') || q.includes('编辑器')) return simulatedResponses.cursor;
  if (q.includes('评估') || q.includes('rag') || q.includes('检索')) return simulatedResponses['评估'];
  if (q.includes('金融') || q.includes('多模态') || q.includes('应用')) return simulatedResponses['金融'];
  if (q.includes('mcp') || q.includes('function') || q.includes('协议')) return simulatedResponses['mcp'];
  return null;
}

export const defaultResponse = `## 思考与分析

基于知识库中的相关资料，我可以从以下几个角度进行分析：

### 核心洞察

您提出的问题涉及 AI Agent 领域的多个关键方面。从当前的技术发展趋势来看，以下几个方向值得重点关注：

1. **架构层面**：从单一 Agent 向 Multi-Agent 系统演进
2. **知识层面**：RAG 技术的深化与 GraphRAG 的兴起
3. **交互层面**：MCP 协议推动工具调用标准化
4. **体验层面**：多模态能力与 Agent 系统的深度融合

### 建议进一步了解

如果您有更具体的需求，欢迎提出以下方向的深入分析：
- 特定架构方案的优劣对比
- 实际落地中的工程挑战
- 针对您业务场景的定制化建议

> 以上分析基于知识库中的多篇文献综合得出，具体引用可在原文中查看。`;
