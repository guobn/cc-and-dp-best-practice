/**
 * style-switcher.js — 风格切换器 + 转场动画控制
 *
 * 实现三种转场方案：
 *   A - 全屏蒙版扫过 (推荐，默认)
 *   B - 碎片化解构重组
 *   C - 液态形变 (clip-path)
 *
 * 切换时业务数据保持完整。
 */

/** 风格元数据 */
const STYLE_META = {
  glass:      { name: '玻璃拟态',    emoji: '🪟', icon: '🪟' },
  brutal:     { name: '新粗野主义',  emoji: '🧱', icon: '🧱' },
  neumorphism:{ name: '新拟物',      emoji: '🫧', icon: '🫧' },
  cyberpunk:  { name: '赛博朋克',    emoji: '🌃', icon: '🌃' },
  minimal:    { name: '极简主义',    emoji: '◻️', icon: '◻️' },
  maximal:    { name: '千禧风',      emoji: '🎨', icon: '🎨' }
};

let currentStyle = 'glass';
let isTransitioning = false;

/* ========== 初始化风格切换器 ========== */
function initStyleSwitcher() {
  const container = document.getElementById('style-switcher');
  if (!container) return;

  // 生成 6 个风格按钮
  container.innerHTML = Object.entries(STYLE_META).map(([key, meta]) => `
    <button class="style-btn${key === currentStyle ? ' active' : ''}"
            data-style="${key}"
            title="${meta.name}">
      ${meta.icon}
      <span class="tooltip">${meta.name}</span>
    </button>
  `).join('');

  // 绑定点击事件
  container.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStyle = btn.dataset.style;
      if (targetStyle !== currentStyle && !isTransitioning) {
        switchStyle(targetStyle);
      }
    });
  });
}

/* ========== 切换风格（主入口） ========== */
async function switchStyle(targetStyle) {
  if (isTransitioning) return;
  isTransitioning = true;

  const fromStyle = currentStyle;

  // 确定转场方案：随机选一种，但保证每次有变化
  const schemes = ['sweep', 'fragment', 'morph'];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];

  console.log(`🎨 切换风格: ${fromStyle} → ${targetStyle} (方案: ${scheme})`);

  try {
    switch (scheme) {
      case 'sweep':
        await transitionSweep(fromStyle, targetStyle);
        break;
      case 'fragment':
        await transitionFragment(fromStyle, targetStyle);
        break;
      case 'morph':
        await transitionMorph(fromStyle, targetStyle);
        break;
    }
  } catch (e) {
    console.warn('转场动画异常，直接切换:', e);
    applyStyle(targetStyle);
  }

  isTransitioning = false;
}

/* ========== 方案 A: 全屏蒙版扫过 ========== */
function transitionSweep(fromStyle, toStyle) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('transition-overlay');
    if (!overlay) { applyStyle(toStyle); resolve(); return; }

    // 清除之前的 class
    overlay.className = '';
    // 添加对应风格的蒙版色
    overlay.classList.add('active', `sweep-${toStyle}`);

    // 使用 GSAP 或 CSS 动画
    if (typeof gsap !== 'undefined') {
      // GSAP 动画：从左向右扫过
      const tl = gsap.timeline({
        onComplete: () => {
          overlay.classList.remove('active');
          resolve();
        }
      });

      // 阶段 1: 蒙版从左侧滑入（覆盖）
      tl.fromTo(overlay,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }
      )
      // 在覆盖状态下切换风格
      .call(() => {
        applyStyle(toStyle);
      })
      // 阶段 2: 蒙版继续向右滑出（揭晓）
      .to(overlay,
        { scaleX: 0, transformOrigin: 'right center', duration: 0.4, ease: 'power2.inOut' }
      );
    } else {
      // Fallback: CSS animation
      overlay.style.transform = 'scaleX(0)';
      overlay.style.transformOrigin = 'left center';
      overlay.style.transition = 'transform 0.8s ease-in-out';

      requestAnimationFrame(() => {
        overlay.style.transform = 'scaleX(1)';
      });

      setTimeout(() => {
        applyStyle(toStyle);
        overlay.style.transformOrigin = 'right center';
        requestAnimationFrame(() => {
          overlay.style.transform = 'scaleX(0)';
        });
        setTimeout(() => {
          overlay.classList.remove('active');
          resolve();
        }, 400);
      }, 400);
    }
  });
}

/* ========== 方案 B: 碎片化解构重组 ========== */
function transitionFragment(fromStyle, toStyle) {
  return new Promise((resolve) => {
    const app = document.getElementById('app');

    // 创建碎片网格
    const grid = document.createElement('div');
    grid.className = 'fragment-grid';
    document.body.appendChild(grid);

    // 截取当前页面样式快照（通过 canvas 或直接取色）
    // 这里简化：使用色块碎片 + 动画
    const colors = ['#667eea', '#ffd700', '#e0e5ec', '#00fff9', '#fff', '#ff6b6b'];
    const fragmentCount = 64; // 8x8

    for (let i = 0; i < fragmentCount; i++) {
      const cell = document.createElement('div');
      cell.className = 'fragment-cell';
      cell.style.background = colors[i % colors.length];
      cell.style.opacity = '0.7';
      cell.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0.5)`;
      cell.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      grid.appendChild(cell);
    }

    // 碎片飞入中心（解构）
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fragment-cell').forEach((cell, i) => {
        const delay = i * 8;
        setTimeout(() => {
          cell.style.transform = 'translate(0, 0) scale(1)';
          cell.style.opacity = '1';
        }, delay);
      });
    });

    // 在碎片聚合时切换风格
    setTimeout(() => {
      applyStyle(toStyle);

      // 碎片飞散（重构）
      grid.querySelectorAll('.fragment-cell').forEach((cell, i) => {
        const delay = i * 5;
        setTimeout(() => {
          cell.style.transform = `translate(${Math.random() * 300 - 150}px, ${Math.random() * 300 - 150}px) scale(0.3)`;
          cell.style.opacity = '0';
        }, delay + 300);
      });

      // 清理
      setTimeout(() => {
        grid.remove();
        resolve();
      }, 1200);
    }, 700);
  });
}

/* ========== 方案 C: 液态形变 (clip-path) ========== */
function transitionMorph(fromStyle, toStyle) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('transition-overlay');
    if (!overlay) { applyStyle(toStyle); resolve(); return; }

    overlay.className = '';
    overlay.classList.add('active', `sweep-${toStyle}`);

    // 使用 clip-path 做液态形变
    if (typeof gsap !== 'undefined') {
      const randomPath = () => {
        const r = () => Math.random() * 100;
        return `polygon(${r()}% ${r()}%, ${r()}% ${r()}%, ${r()}% ${r()}%, ${r()}% ${r()}%)`;
      };

      const tl = gsap.timeline({
        onComplete: () => {
          overlay.style.clipPath = '';
          overlay.classList.remove('active');
          resolve();
        }
      });

      // 从圆形开始
      overlay.style.clipPath = 'circle(0% at 50% 50%)';

      // 形变成覆盖全屏的不规则形状
      tl.to(overlay, {
        clipPath: 'circle(70.7% at 50% 50%)',
        duration: 0.5,
        ease: 'elastic.inOut'
      })
      .call(() => {
        applyStyle(toStyle);
      })
      .to(overlay, {
        clipPath: 'circle(0% at 50% 50%)',
        duration: 0.5,
        ease: 'power2.inOut'
      });
    } else {
      // Fallback
      overlay.style.clipPath = 'circle(0% at 50% 50%)';
      overlay.style.transition = 'clip-path 0.6s ease-in-out';
      requestAnimationFrame(() => {
        overlay.style.clipPath = 'circle(70.7% at 50% 50%)';
      });
      setTimeout(() => {
        applyStyle(toStyle);
        requestAnimationFrame(() => {
          overlay.style.clipPath = 'circle(0% at 50% 50%)';
        });
        setTimeout(() => {
          overlay.style.clipPath = '';
          overlay.classList.remove('active');
          resolve();
        }, 600);
      }, 600);
    }
  });
}

/* ========== 应用风格 ========== */
function applyStyle(styleName) {
  const body = document.body;

  // 移除所有风格 class
  Object.keys(STYLE_META).forEach(s => {
    body.classList.remove(`style-${s}`);
  });

  // 添加新风格 class
  body.classList.add(`style-${styleName}`);
  currentStyle = styleName;
  AppState.currentStyle = styleName;

  // 更新按钮激活状态
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === styleName);
  });

  // 触发自定义事件
  document.dispatchEvent(new CustomEvent('styleChanged', {
    detail: { style: styleName, meta: STYLE_META[styleName] }
  }));

  console.log(`🎨 已切换至: ${STYLE_META[styleName].name}`);
}

/* ========== 获取当前风格名 ========== */
function getCurrentStyle() {
  return currentStyle;
}

/* ========== 导出 ========== */
window.initStyleSwitcher = initStyleSwitcher;
window.switchStyle = switchStyle;
window.applyStyle = applyStyle;
window.getCurrentStyle = getCurrentStyle;
window.STYLE_META = STYLE_META;

/**
 * 风格设计 tokens 汇总（用于 README 文档）
 *
 * Glass:       bg=渐变, card=backdrop-blur(16px)+rgba(255,255,255,0.12), border=rgba(255,255,255,0.2)
 * Brutal:      bg=#fffbe6, card=border:4px solid #000+box-shadow:8px 8px 0 #000, font=Impact
 * Neumorphism: bg=#e0e5ec, card=box-shadow:9px 9px 16px #b8bcc3 / -9px -9px 16px #ffffff
 * Cyberpunk:   bg=#0a0a0a, card=border:1px solid #00fff9+box-shadow:0 0 10px rgba(0,255,249,0.3), font='Share Tech Mono'
 * Minimal:     bg=#fff, card=bg:#fafafa+border:none, font-weight:200-300
 * Maximal:     bg=gradient, card=border:3px solid+box-shadow:6px 6px 0+rotation, font='Fredoka One'/'Baloo 2'/'Comic Neue'
 */
