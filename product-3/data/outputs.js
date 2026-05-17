/**
 * data/outputs.js — 模拟成果产出数据
 * 成果产出模块的 3 类产出物
 */

const DELIVERABLES = [
  {
    id: 'report',
    title: '调研报告',
    icon: '📊',
    description: '基于知识库的 AI 技术趋势深度调研报告',
    content: `# 2026年AI技术趋势深度调研报告

## 概述
本报告基于对 6 篇核心知识文档的深度分析，总结了 2026 年 AI 领域最重要的技术趋势。

## 核心发现

### 1. Transformer 持续演进
Transformer 架构仍然是所有大模型的基石。从 2017 年至今，其核心的自注意力机制不断被优化，包括 Flash Attention、Multi-Query Attention 等改进。

### 2. RAG 成为企业标配
检索增强生成技术已经从学术概念演进为企业级应用的标准架构。GraphRAG、Agentic RAG 等新范式正在解决传统 RAG 在多跳推理和复杂查询方面的不足。

### 3. Agent 工作流走向生产
多 Agent 协作、Human-in-the-Loop、事件驱动等模式使得 LLM Agent 从 Demo 走向真实生产环境。

### 4. 模型优化加速部署
量化、剪枝、蒸馏等模型优化技术使得大模型能够在更广泛的硬件上运行，推动 AI 应用普及。

## 建议行动
- 短期：建立基于 RAG 的企业知识库系统
- 中期：试点 Agent 工作流自动化部分业务流程
- 长期：布局多模态 AI 能力，探索新的交互范式

---
*生成时间: 2026-05-18 | 来源: DeepMind 知识库*
`,
    tags: ['技术趋势', '调研', 'AI']
  },
  {
    id: 'article',
    title: '公众号推文',
    icon: '📝',
    description: '面向技术从业者的公众号科普文章',
    content: `# 2026年必知的四个 AI 技术趋势

> 技术变革的速度从未如此之快。

如果你从事技术工作，2026 年的以下四个趋势将直接影响你的职业发展和技术选型。

## 1. RAG 2.0：不只是检索

传统的 RAG 只是"检索 + 拼接"。2026 年的 RAG 2.0 加入了**知识图谱**和**多轮推理**能力，让 AI 回答不仅准确，而且有深度。

## 2. Agent：你的 AI 同事

想象一下，你有一个 24 小时在线、不知疲倦的同事 —— 这就是 2026 年的 AI Agent。它不再只是聊天机器人，而是能独立完成复杂任务的数字员工。

## 3. 手机也能跑大模型

量化技术的进步让 7B 参数的大模型能在手机上流畅运行。这意味着你的隐私数据不再需要上传到云端。

## 4. AI 能"看"也能"听"

多模态 AI 让机器真正理解世界——不只是文字，还有图片、视频和声音。这是人机交互的又一次革命。

---
*欢迎转发，关注我们获取更多 AI 干货*
`,
    tags: ['科普', '技术趋势', '公众号']
  },
  {
    id: 'weekly',
    title: '周报摘要',
    icon: '📋',
    description: '本周 AI 领域核心进展摘要',
    content: `# 2026年第20周 AI 周报摘要

## 本周热点
- **GraphRAG 正式开源**：微软 GraphRAG 项目发布 v1.0，支持企业级知识图谱构建
- **Agent 安全新标准**：OWASP 发布 LLM Agent 安全指南 v1.0
- **端侧模型突破**：Qualcomm 展示 13B 模型在手机端的实时推理

## 知识库更新
- 新增 2 篇 Agent 工作流相关文档
- 更新 RAG 技术白皮书至 v2.0

## 关键指标
- 知识库卡片总数: 6
- 本周新增: 2
- 覆盖主题: 5 个
- 本月研究成果: 3 篇

## 下周计划
- 扩展多模态相关文档
- 增加 Agent 工作流实践案例
- 更新量化技术对比数据

---
*报告周期: 2026-05-11 ~ 2026-05-17 | 自动生成*
`,
    tags: ['周报', '汇总', '进展']
  }
];

/** 复制内容到剪贴板 */
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject);
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(textarea);
    }
  });
}

/** 下载内容为 txt 文件 */
function downloadAsFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
