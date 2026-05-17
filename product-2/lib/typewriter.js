/**
 * 打字机工具 - 模拟 AI 流式输出
 * 提供逐字/逐段输出的动画效果
 */

/**
 * 创建打字机效果迭代器
 * @param {string} text - 要输出的完整文本
 * @param {Object} options
 * @param {number} options.charDelay - 每字符延迟(ms)，默认 30
 * @param {number} options.lineDelay - 换行额外延迟(ms)，默认 100
 * @param {number} options.punctuationDelay - 标点后额外延迟(ms)，默认 150
 */
export function createTypewriter(text, options = {}) {
  const {
    charDelay = 30,
    lineDelay = 100,
    punctuationDelay = 150
  } = options;

  let index = 0;
  const punctuation = new Set(['。', '，', '？', '！', '：', '；', '.', ',', '!', '?', '\n']);

  return {
    next() {
      if (index >= text.length) {
        return { done: true, value: '' };
      }

      const char = text[index];
      index++;

      let delay = charDelay;
      if (char === '\n') {
        delay = lineDelay;
      } else if (punctuation.has(char)) {
        delay = punctuationDelay;
      }

      return {
        done: false,
        value: char,
        delay
      };
    },
    reset() {
      index = 0;
    },
    get progress() {
      return text.length > 0 ? index / text.length : 0;
    },
    get remaining() {
      return text.length - index;
    }
  };
}

/**
 * 将打字机效果应用到回调函数
 * @param {string} text
 * @param {function} onChar - 每输出一个字符的回调
 * @param {Object} options
 * @returns {Promise<void>}
 */
export function runTypewriter(text, onChar, options = {}) {
  return new Promise((resolve) => {
    const writer = createTypewriter(text, options);

    function tick() {
      const result = writer.next();
      if (result.done) {
        resolve();
        return;
      }
      onChar(result.value);
      setTimeout(tick, result.delay);
    }

    tick();
  });
}

/**
 * 分段打字机 - 按句子/段落输出
 * @param {string[]} segments - 文本段数组
 * @param {function} onSegment - 每段回调
 * @param {number} segmentDelay - 段间延迟
 */
export function runSegmentedTypewriter(segments, onSegment, segmentDelay = 500) {
  return new Promise((resolve) => {
    let index = 0;

    function nextSegment() {
      if (index >= segments.length) {
        resolve();
        return;
      }

      const segment = segments[index];
      let charIndex = 0;
      const segmentContent = [];

      function typeChar() {
        if (charIndex >= segment.length) {
          onSegment(segmentContent.join(''), index, true);
          index++;
          setTimeout(nextSegment, segmentDelay);
          return;
        }
        segmentContent.push(segment[charIndex]);
        onSegment(segmentContent.join(''), index, false);
        charIndex++;
        const delay = segment[charIndex - 1] === '\n' ? 80 : 20;
        setTimeout(typeChar, delay);
      }

      typeChar();
    }

    nextSegment();
  });
}
