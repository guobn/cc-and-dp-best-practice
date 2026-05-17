/**
 * Agent 流水线数据 - 预置节点与执行逻辑
 */

export const pipelineConfig = {
  nodes: [
    {
      id: 'input-collector',
      type: 'input',
      name: '输入采集器',
      icon: 'FileSearch',
      description: '解析用户需求，收集相关背景信息',
      color: '#6366f1', // indigo
      status: 'idle', // idle | running | done | error
      progress: 0,
      prompt: `你是一个智能采集器。用户输入的需求是："{{query}}"
请执行以下步骤：
1. 解析用户意图，提取关键主题词
2. 确定需要采集的信息类型
3. 生成采集计划（至少3个信息源方向）

输出格式：
- 意图理解：xxx
- 关键主题：[主题1, 主题2, ...]
- 采集计划：[来源1, 来源2, ...]`,
      output: ''
    },
    {
      id: 'researcher',
      type: 'process',
      name: '研究员',
      icon: 'Search',
      description: '深度分析采集到的信息，提取关键洞察',
      color: '#8b5cf6', // violet
      status: 'idle',
      progress: 0,
      prompt: `作为 AI 研究员，请基于以下采集结果进行分析：
{{input}}

分析维度：
1. 核心发现（列出3-5个关键发现）
2. 数据支撑（每个发现对应的数据点）
3. 趋势判断（短期/长期趋势）
4. 知识缺口（当前信息中缺失的关键部分）

要求：每个发现必须有具体引用。`,
      output: ''
    },
    {
      id: 'writer',
      type: 'process',
      name: '写手',
      icon: 'PenLine',
      description: '将分析结果转化为高质量内容',
      color: '#ec4899', // pink
      status: 'idle',
      progress: 0,
      prompt: `请将以下研究成果转化为目标格式的内容：
{{input}}

要求：
1. 保持专业性和准确性
2. 使用清晰的结构（标题、段落、列表）
3. 加入适当的过渡和连接词
4. 控制在 800-1200 字
5. 如果需要特定风格，请按 "${'{'}style{'}"调整语气

输出格式：Markdown 格式的完整文章。`,
      output: ''
    },
    {
      id: 'reviewer',
      type: 'output',
      name: '审稿人',
      icon: 'ClipboardCheck',
      description: '审核内容质量，确保准确性与可读性',
      color: '#10b981', // emerald
      status: 'idle',
      progress: 0,
      prompt: `请审核以下文章的质量：
{{input}}

审核维度（每项 1-10 分）：
1. 事实准确性 - 是否有不准确或误导性陈述
2. 结构完整性 - 是否有清晰的开头、主体、结尾
3. 可读性 - 语言是否流畅，是否适合目标读者
4. 引用充分性 - 关键观点是否有数据或引用支撑
5. 原创性 - 是否提供了独特见解而非泛泛而谈

输出格式：
- 总体评分：X/10
- 各项评分：[详细评分]
- 改进建议：[具体建议]
- 审核结论：通过/需修改/不通过`,
      output: ''
    }
  ],
  edges: [
    { from: 'input-collector', to: 'researcher' },
    { from: 'researcher', to: 'writer' },
    { from: 'writer', to: 'reviewer' }
  ]
};

export const nodeDurations = {
  'input-collector': 2000,
  'researcher': 3500,
  'writer': 3000,
  'reviewer': 2500
};

export const simulationOutputs = {
  'input-collector': `## 采集结果

### 意图理解
用户希望了解 AI Agent 在软件开发领域的应用现状和最佳实践。

### 关键主题
- AI Agent 辅助编程工具
- 自动化代码审查与测试
- Agent 驱动的 DevOps 流水线

### 采集计划
1. Cursor/ Copilot 等 AI 编程助手最新进展
2. AI Agent 在 CI/CD 中的应用案例
3. 企业级 AI 开发平台方案对比
4. 开发者社区对 AI 编程的态度调查`,

  'researcher': `## 研究成果

### 核心发现

1. **AI 编程助手采用率快速增长**
   - 2026 年开发者调查显示 78% 的受访者日常使用 AI 编程助手
   - Cursor 以 34% 市场份额领先，Copilot 占 28%

2. **Agent 驱动的自动化测试正在普及**
   - 自动生成测试用例覆盖率提升 56%
   - 结合静态分析，缺陷检出率提高 42%

3. **DevOps 流水线的智能化**
   - AI Agent 可自动诊断构建失败并建议修复
   - 智能容量预测减少 31% 的部署回滚

4. **企业落地仍存挑战**
   - 代码质量与安全合规是最主要顾虑（45%）
   - 团队需要调整开发流程以适应 AI 协作

### 趋势判断
- 短期（6-12月）：AI Agent 从辅助编码扩展到全流程
- 长期（2-3年）：自主开发 Agent 将承担 60%+ 的日常开发任务`,

  'writer': `# AI Agent 在软件开发中的应用现状与展望

## 引言

2026年，AI Agent 已从实验性工具演进为软件开发的核心基础设施。本文将深入分析当前的应用现状、最佳实践以及未来趋势。

## 一、AI 编程助手的崛起

当前开发者生态中，AI 编程助手已成为标配。Cursor 凭借其 Composer 模式和多文件协同能力占据 34% 的市场份额。GitHub Copilot 紧随其后，占比 28%。这些工具不仅提供代码补全，更能理解项目整体上下文。

### 关键能力对比

- **代码生成**：从注释到完整函数，准确率持续提升
- **智能重构**：基于项目模式的架构级建议
- **Bug 检测**：运行时异常预测与预防性修复

## 二、自动化测试的智能化

AI Agent 正在从根本上改变软件测试的方式。自动生成的测试用例覆盖率提高了 56%，结合静态分析工具后，缺陷检出率提升 42%。

## 三、DevOps 流水线中的 Agent

智能化的 DevOps 是另一个重要应用方向。AI Agent 可自动诊断构建失败原因并建议修复方案。智能容量预测模型帮助团队减少 31% 的部署回滚。

## 四、挑战与应对

尽管前景光明，企业落地仍面临挑战。代码质量和安全合规是最主要的顾虑。团队需要调整开发流程来适应人机协作的新范式。

## 结语

AI Agent 在软件开发中的应用正从"辅助"走向"协作"。未来 2-3 年，自主开发 Agent 将承担超过 60% 的日常开发任务。`,

  'reviewer': `## 审核报告

### 总体评分：8.2/10

### 各项评分
| 维度 | 评分 | 说明 |
|------|------|------|
| 事实准确性 | 9/10 | 数据引用准确，无明显错误 |
| 结构完整性 | 8/10 | 结构清晰，但结尾略显仓促 |
| 可读性 | 8/10 | 语言流畅，技术术语解释到位 |
| 引用充分性 | 7/10 | 部分论断缺少具体引用来源 |
| 原创性 | 8/10 | 提供了有价值的整合分析 |

### 改进建议
1. 补充更多具体的引用来源和数据出处
2. 结尾部分可以增加展望和行动建议
3. 考虑加入一个案例研究增强说服力

### 审核结论：通过
文章整体质量良好，建议根据改进建议进行微调后发布。`
};

export function getSimulationOutput(nodeId) {
  return simulationOutputs[nodeId] || '';
}
