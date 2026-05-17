/**
 * 极简 Markdown 渲染器
 * 支持：标题、粗体、列表、代码块、引用、表格、链接
 * 输出：React 元素数组
 */

import React from 'react';

/**
 * 将 Markdown 文本解析为 React 元素数组
 * @param {string} markdown
 * @returns {React.ReactElement[]}
 */
export function renderMarkdown(markdown) {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';
  let inTable = false;
  let tableRows = [];
  let listStack = []; // [{type: 'ul'|'ol', items: []}]
  let inBlockquote = false;
  let blockquoteLines = [];

  function flushBlockquote() {
    if (blockquoteLines.length > 0) {
      elements.push(
        React.createElement('blockquote', {
          key: `bq-${elements.length}`,
          className: 'border-l-4 border-indigo-500 pl-4 py-1 my-2 text-gray-400 italic'
        },
          React.createElement('p', { className: 'm-0' }, blockquoteLines.join('\n'))
        )
      );
      blockquoteLines = [];
      inBlockquote = false;
    }
  }

  function flushTable() {
    if (tableRows.length > 0) {
      const headerCells = tableRows[0].split('|').filter(c => c.trim()).map(c => c.trim());
      const bodyRows = tableRows.slice(2); // skip header separator
      const tableEl = React.createElement('div', {
        key: `table-${elements.length}`,
        className: 'overflow-x-auto my-3'
      },
        React.createElement('table', { className: 'min-w-full border-collapse text-sm' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              headerCells.map((cell, i) =>
                React.createElement('th', {
                  key: i,
                  className: 'border border-gray-700 px-3 py-2 bg-gray-800 text-gray-200 font-medium text-left'
                }, cell)
              )
            )
          ),
          React.createElement('tbody', null,
            bodyRows.map((row, ri) =>
              React.createElement('tr', {
                key: ri,
                className: ri % 2 === 0 ? 'bg-gray-900/50' : ''
              },
                row.split('|').filter(c => c.trim()).map((cell, ci) =>
                  React.createElement('td', {
                    key: ci,
                    className: 'border border-gray-700 px-3 py-2 text-gray-300'
                  }, cell.trim())
                )
              )
            )
          )
        )
      );
      elements.push(tableEl);
      tableRows = [];
      inTable = false;
    }
  }

  function flushList() {
    if (listStack.length > 0) {
      for (const list of listStack) {
        const listEl = React.createElement(
          list.type === 'ol' ? 'ol' : 'ul',
          {
            key: `list-${elements.length}`,
            className: list.type === 'ol' ? 'list-decimal pl-6 my-2 space-y-1' : 'list-disc pl-6 my-2 space-y-1'
          },
          list.items.map((item, i) =>
            React.createElement('li', { key: i, className: 'text-gray-300' }, item)
          )
        );
        elements.push(listEl);
      }
      listStack = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 代码块处理
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          React.createElement('pre', {
            key: `code-${elements.length}`,
            className: 'bg-gray-900 rounded-lg p-4 my-3 overflow-x-auto font-mono text-sm text-emerald-300'
          },
            React.createElement('code', { className: `language-${codeLang}` }, codeContent)
          )
        );
        codeContent = '';
        codeLang = '';
        inCodeBlock = false;
      } else {
        flushBlockquote();
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line;
      continue;
    }

    // 空行 - 刷新待处理的元素
    if (line.trim() === '') {
      flushBlockquote();
      flushList();
      if (inTable && tableRows.length > 0) {
        flushTable();
      }
      continue;
    }

    // 表格行
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) inTable = true;
      tableRows.push(line.trim());
      continue;
    }

    // 如果之前以为在表格里但实际上不是
    if (inTable && !line.trim().startsWith('|')) {
      flushTable();
    }

    // 引用
    if (line.trim().startsWith('>')) {
      flushList();
      inBlockquote = true;
      blockquoteLines.push(line.trim().replace(/^>\s?/, ''));
      continue;
    }

    // 列表
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)/);
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)/);
    if (ulMatch) {
      flushBlockquote();
      flushTable();
      if (listStack.length === 0 || listStack[listStack.length - 1].type !== 'ul') {
        flushList();
        listStack.push({ type: 'ul', items: [] });
      }
      listStack[listStack.length - 1].items.push(inlineMarkdown(ulMatch[1]));
      continue;
    }
    if (olMatch) {
      flushBlockquote();
      flushTable();
      if (listStack.length === 0 || listStack[listStack.length - 1].type !== 'ol') {
        flushList();
        listStack.push({ type: 'ol', items: [] });
      }
      listStack[listStack.length - 1].items.push(inlineMarkdown(olMatch[1]));
      continue;
    }

    flushBlockquote();
    flushList();

    // 标题
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2];
      const sizeClasses = {
        1: 'text-2xl font-bold text-white mt-6 mb-3',
        2: 'text-xl font-bold text-white mt-5 mb-2',
        3: 'text-lg font-semibold text-gray-100 mt-4 mb-2',
        4: 'text-base font-semibold text-gray-200 mt-3 mb-1',
        5: 'text-sm font-medium text-gray-300 mt-2 mb-1',
        6: 'text-xs font-medium text-gray-400 mt-2 mb-1'
      };
      elements.push(
        React.createElement(`h${level}`, {
          key: `h-${elements.length}`,
          className: sizeClasses[level] || 'text-lg font-bold text-white mt-4 mb-2'
        }, inlineMarkdown(text))
      );
      continue;
    }

    // 水平线
    if (/^[-*_]{3,}$/.test(line.trim())) {
      elements.push(
        React.createElement('hr', {
          key: `hr-${elements.length}`,
          className: 'border-gray-700 my-4'
        })
      );
      continue;
    }

    // 普通段落
    const processedLine = processInlineContent(line);
    elements.push(
      React.createElement('p', {
        key: `p-${elements.length}`,
        className: 'text-gray-300 leading-relaxed my-2'
      }, processedLine)
    );
  }

  // 清理剩余的待处理元素
  if (inCodeBlock) {
    elements.push(
      React.createElement('pre', {
        key: `code-${elements.length}`,
        className: 'bg-gray-900 rounded-lg p-4 my-3 overflow-x-auto font-mono text-sm text-emerald-300'
      },
        React.createElement('code', null, codeContent)
      )
    );
  }
  flushBlockquote();
  flushList();
  flushTable();

  return elements;
}

/**
 * 处理行内 Markdown（粗体、链接、行内代码、斜体）
 */
function inlineMarkdown(text) {
  if (!text) return text;
  // 简单处理：如果 text 是字符串，解析行内标记
  if (typeof text !== 'string') return text;

  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // 行内代码 `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index === 0) {
      parts.push(React.createElement('code', {
        key: key++,
        className: 'bg-gray-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono'
      }, codeMatch[1]));
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 粗体 **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index === 0) {
      parts.push(React.createElement('strong', {
        key: key++,
        className: 'font-semibold text-white'
      }, boldMatch[1]));
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 链接 [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch.index === 0) {
      parts.push(React.createElement('a', {
        key: key++,
        href: linkMatch[2],
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'text-indigo-400 hover:text-indigo-300 underline underline-offset-2'
      }, linkMatch[1]));
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 斜体 *text*
    const italicMatch = remaining.match(/\*([^*]+)\*/);
    if (italicMatch && italicMatch.index === 0) {
      parts.push(React.createElement('em', {
        key: key++,
        className: 'italic text-gray-200'
      }, italicMatch[1]));
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 普通文本
    const nextSpecial = remaining.search(/[`*\[\]]/);
    if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else if (nextSpecial > 0) {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    } else {
      parts.push(remaining);
      remaining = '';
    }
  }

  return parts.length > 0 ? parts : text;
}

/**
 * 处理行内的警告/提示块
 */
function processInlineContent(line) {
  // 处理 > 警告提示
  const warningMatch = line.match(/^> ⚠️ (.+)/);
  if (warningMatch) {
    return React.createElement('div', {
      className: 'flex items-start gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-3 my-2'
    },
      React.createElement('span', { className: 'text-yellow-400 mt-0.5' }, '⚠'),
      React.createElement('span', { className: 'text-yellow-200 text-sm' }, inlineMarkdown(warningMatch[1]))
    );
  }
  return inlineMarkdown(line);
}
