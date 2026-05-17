/**
 * 成果产出数据 - 三类预置产出物
 */

export const deliverables = {
  research: [
    {
      id: 'del-res-001',
      title: 'AI Agent 架构选型调研报告',
      type: 'research',
      typeLabel: '调研报告',
      createdAt: '2026-05-17T14:00:00Z',
      updatedAt: '2026-05-17T16:30:00Z',
      status: 'final',
      summary: '系统性评估主流 AI Agent 架构方案，为技术选型提供决策依据',
      authors: ['Agent Pipeline'],
      wordCount: 3500,
      content: `# AI Agent 架构选型调研报告

## 1. 背景与目标

本文旨在系统评估主流 AI Agent 架构方案，为技术团队选型提供参考。

## 2. 评估框架

### 2.1 评估维度
- **功能性**：是否支持计划、执行、工具调用、记忆等核心能力
- **可扩展性**：是否易于增加新的工具和技能
- **性能**：推理延迟、资源消耗
- **生态成熟度**：社区活跃度、文档完整性、商业支持

### 2.2 评分权重
| 维度 | 权重 |
|------|------|
| 功能性 | 30% |
| 可扩展性 | 25% |
| 性能 | 25% |
| 生态成熟度 | 20% |

## 3. 方案对比

### 3.1 ReAct 模式
- **原理**：推理-行动循环，交替进行推理和工具调用
- **优势**：简单直观，易于调试
- **局限**：缺乏长程规划能力

### 3.2 Plan-and-Execute
- **原理**：先规划再执行，任务分解为子任务
- **优势**：适合复杂多步骤任务
- **局限**：规划质量依赖 LLM 能力

### 3.3 Multi-Agent 框架
- **原理**：多个专业化 Agent 协作
- **优势**：分工明确，容错性好
- **局限**：通信开销大，协调复杂

## 4. 推荐方案

对于中大型项目，推荐采用 Plan-and-Execute + Multi-Agent 混合架构。`,
      tags: ['架构选型', 'Agent', '技术调研'],
      pipelineId: 'pipe-001'
    },
    {
      id: 'del-res-002',
      title: 'LLM 应用安全风险与防护措施',
      type: 'research',
      typeLabel: '调研报告',
      createdAt: '2026-05-16T10:00:00Z',
      status: 'draft',
      summary: '分析 LLM 应用的提示注入、数据泄露等风险并提供防护建议',
      wordCount: 2800,
      content: `# LLM 应用安全风险报告

## 提示注入
提示注入是最主要的攻击面。攻击者通过精心构造的输入操纵 LLM 行为。

## 数据泄露
敏感信息可能通过模型输出被泄露。建议实施输出过滤和脱敏机制。

## 防护框架
1. 输入验证与消毒
2. 权限最小化
3. 输出监控与审计`,
      tags: ['安全', 'LLM', '风险']
    }
  ],
  article: [
    {
      id: 'del-art-001',
      title: 'AI Agent 正在如何重塑软件开发流程？',
      type: 'article',
      typeLabel: '公众号推文',
      createdAt: '2026-05-17T15:00:00Z',
      status: 'published',
      summary: '深入浅出地介绍 AI Agent 在软件开发中的实际应用与未来趋势',
      wordCount: 1200,
      content: `# AI Agent 正在如何重塑软件开发流程？

> 从代码补全到自主开发，AI Agent 正在重新定义"写代码"这件事。

## 从工具到伙伴

还记得两年前，AI 编程助手还只会补全下一行代码。而现在，Cursor 的 Composer 模式可以一次性完成跨 5 个文件的修改。

## 三个改变

### 1. 编码效率的质变
78% 的开发者已经在日常工作中使用 AI 编程助手。

### 2. 测试的自动化革命
AI Agent 自动生成的测试用例覆盖率提升 56%。

### 3. DevOps 的智能化
AI Agent 可自动诊断构建失败原因并给出修复方案。

## 未来已来

AI Agent 不再是辅助工具，而是开发团队的数字成员。`,
      tags: ['AI编程', '效率提升'],
      pipelineId: 'pipe-002'
    },
    {
      id: 'del-art-002',
      title: '一文读懂 RAG 系统的评估与优化',
      type: 'article',
      typeLabel: '公众号推文',
      createdAt: '2026-05-15T09:00:00Z',
      status: 'published',
      summary: '从评估框架到实战优化，全面解析 RAG 系统质量保障',
      wordCount: 1500,
      content: `# 一文读懂 RAG 系统的评估与优化

RAG（检索增强生成）系统正在成为企业知识库问答的标准方案。但如何评估其质量？

## RAGAS 四维评估

忠实度、答案相关性、上下文精度、上下文召回率。

## 优化策略

混合检索策略比单一策略优 27%。`,
      tags: ['RAG', '评估', '系统优化']
    }
  ],
  weekly: [
    {
      id: 'del-week-001',
      title: 'AI 行业周报 2026-W20',
      type: 'weekly',
      typeLabel: '周报摘要',
      createdAt: '2026-05-18T08:00:00Z',
      status: 'final',
      summary: '本周 AI 领域重要动态：MCP 协议更新、多模态 Agent 新突破',
      wordCount: 800,
      content: `# AI 行业周报 2026-W20

## 本周头条
1. MCP 协议发布 v2.0 草案
2. 开源多模态 Agent 框架发布
3. AI 编程助手市场格局变化

## 业界动态
Cursor 获得新一轮融资，估值达 30 亿美元。

## 技术前沿
GraphRAG 在企业场景中表现优异。

## 工具推荐
本周推荐：AI Agent 工作流编排工具`,
      tags: ['周报', '行业动态'],
      pipelineId: 'pipe-003'
    }
  ]
};

export function getAllDeliverables() {
  return [
    ...deliverables.research,
    ...deliverables.article,
    ...deliverables.weekly
  ];
}

export function getDeliverablesByType(type) {
  return deliverables[type] || [];
}

export function getDeliverableById(id) {
  return getAllDeliverables().find(d => d.id === id);
}

export const outputTypeConfig = {
  research: {
    label: '调研报告',
    icon: 'FileText',
    color: '#6366f1'
  },
  article: {
    label: '公众号推文',
    icon: 'Newspaper',
    color: '#ec4899'
  },
  weekly: {
    label: '周报摘要',
    icon: 'Calendar',
    color: '#10b981'
  }
};
