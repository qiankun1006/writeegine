/**
 * TooltipManager - 工具提示管理器
 * 负责管理所有工具提示的显示、隐藏和动画效果
 */
class TooltipManager {
  constructor(options = {}) {
    this.options = {
      delay: 300, // 延迟显示时间（毫秒）
      fadeDuration: 150, // 淡入淡出动画时间
      maxWidth: 300, // 最大宽度
      position: 'top', // 默认位置：top, bottom, left, right
      ...options
    };

    this.tooltips = new Map(); // 存储工具提示数据
    this.currentTooltip = null; // 当前显示的工具提示
    this.timeoutId = null; // 延迟显示计时器
    this.container = null; // 工具提示容器
  }

  /**
   * 初始化工具提示管理器
   */
  init() {
    // 创建工具提示容器
    this.container = document.createElement('div');
    this.container.className = 'image-editor-tooltip-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 10000;
    `;
    document.body.appendChild(this.container);

    // 监听全局事件
    this._setupGlobalEvents();
  }

  /**
   * 注册工具提示
   * @param {string} elementId - 元素ID
   * @param {Object} data - 工具提示数据
   */
  register(elementId, data) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id "${elementId}" not found`);
      return;
    }

    this.tooltips.set(elementId, {
      element,
      data: {
        title: data.title || '未命名工具',
        description: data.description || '',
        shortcut: data.shortcut || '',
        position: data.position || this.options.position
      }
    });

    // 添加事件监听
    this._attachEvents(elementId);
  }

  /**
   * 批量注册工具提示
   * @param {Array} tooltips - 工具提示数组，每个元素包含id和data
   */
  registerAll(tooltips) {
    tooltips.forEach(({ id, data }) => {
      this.register(id, data);
    });
  }

  /**
   * 显示工具提示
   * @param {string} elementId - 元素ID
   */
  show(elementId) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const tooltipData = this.tooltips.get(elementId);
    if (!tooltipData) return;

    this.timeoutId = setTimeout(() => {
      this._createTooltip(tooltipData);
    }, this.options.delay);
  }

  /**
   * 隐藏当前工具提示
   */
  hide() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.currentTooltip) {
      this._removeTooltip();
    }
  }

  /**
   * 创建工具提示元素
   * @param {Object} tooltipData - 工具提示数据
   * @private
   */
  _createTooltip(tooltipData) {
    // 移除现有的工具提示
    if (this.currentTooltip) {
      this._removeTooltip();
    }

    const { element, data } = tooltipData;
    const rect = element.getBoundingClientRect();

    // 创建工具提示元素
    const tooltip = document.createElement('div');
    tooltip.className = 'image-editor-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'false');
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.4;
      max-width: ${this.options.maxWidth}px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity ${this.options.fadeDuration}ms ease;
      pointer-events: none;
      backdrop-filter: blur(4px);
    `;

    // 构建内容
    let content = `<div class="tooltip-title">${data.title}</div>`;

    if (data.description) {
      content += `<div class="tooltip-description">${data.description}</div>`;
    }

    if (data.shortcut) {
      content += `<div class="tooltip-shortcut">快捷键: <code>${data.shortcut}</code></div>`;
    }

    tooltip.innerHTML = content;

    // 计算位置
    const position = this._calculatePosition(rect, data.position);
    tooltip.style.left = `${position.x}px`;
    tooltip.style.top = `${position.y}px`;

    // 添加到容器
    this.container.appendChild(tooltip);
    this.currentTooltip = tooltip;

    // 触发淡入动画
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
    });
  }

  /**
   * 计算工具提示位置
   * @param {DOMRect} rect - 目标元素的位置信息
   * @param {string} preferredPosition - 首选位置
   * @returns {Object} 位置坐标
   * @private
   */
  _calculatePosition(rect, preferredPosition) {
    const tooltipHeight = 80; // 预估高度
    const tooltipWidth = 200; // 预估宽度
    const offset = 8; // 偏移量

    let x, y;

    switch (preferredPosition) {
      case 'top':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.top - tooltipHeight - offset;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.bottom + offset;
        break;
      case 'left':
        x = rect.left - tooltipWidth - offset;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = rect.right + offset;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      default:
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.top - tooltipHeight - offset;
    }

    // 确保不超出视口
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 0) x = 0;
    if (x + tooltipWidth > viewportWidth) x = viewportWidth - tooltipWidth;
    if (y < 0) y = 0;
    if (y + tooltipHeight > viewportHeight) y = viewportHeight - tooltipHeight;

    return { x, y };
  }

  /**
   * 移除工具提示
   * @private
   */
  _removeTooltip() {
    if (!this.currentTooltip) return;

    this.currentTooltip.style.opacity = '0';
    this.currentTooltip.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      if (this.currentTooltip && this.currentTooltip.parentNode) {
        this.currentTooltip.parentNode.removeChild(this.currentTooltip);
      }
      this.currentTooltip = null;
    }, this.options.fadeDuration);
  }

  /**
   * 附加事件监听
   * @param {string} elementId - 元素ID
   * @private
   */
  _attachEvents(elementId) {
    const tooltipData = this.tooltips.get(elementId);
    if (!tooltipData) return;

    const { element } = tooltipData;

    element.addEventListener('mouseenter', () => {
      this.show(elementId);
    });

    element.addEventListener('mouseleave', () => {
      this.hide();
    });

    element.addEventListener('focus', () => {
      this.show(elementId);
    });

    element.addEventListener('blur', () => {
      this.hide();
    });

    // 触摸设备支持
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.show(elementId);
    });

    element.addEventListener('touchend', () => {
      setTimeout(() => {
        this.hide();
      }, 1000); // 触摸设备上显示1秒后隐藏
    });
  }

  /**
   * 设置全局事件
   * @private
   */
  _setupGlobalEvents() {
    // 窗口滚动时隐藏工具提示
    window.addEventListener('scroll', () => {
      this.hide();
    }, true);

    // 窗口大小改变时重新计算位置
    window.addEventListener('resize', () => {
      if (this.currentTooltip) {
        this.hide();
      }
    });

    // ESC键隐藏工具提示
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentTooltip) {
        this.hide();
      }
    });
  }

  /**
   * 更新工具提示数据
   * @param {string} elementId - 元素ID
   * @param {Object} newData - 新的工具提示数据
   */
  update(elementId, newData) {
    const tooltipData = this.tooltips.get(elementId);
    if (!tooltipData) return;

    tooltipData.data = {
      ...tooltipData.data,
      ...newData
    };

    this.tooltips.set(elementId, tooltipData);
  }

  /**
   * 移除工具提示
   * @param {string} elementId - 元素ID
   */
  unregister(elementId) {
    const tooltipData = this.tooltips.get(elementId);
    if (!tooltipData) return;

    // 如果当前显示的是这个工具提示，先隐藏
    if (this.currentTooltip && this.tooltips.get(elementId)?.element === tooltipData.element) {
      this.hide();
    }

    this.tooltips.delete(elementId);
  }

  /**
   * 销毁工具提示管理器
   */
  destroy() {
    this.hide();

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.tooltips.clear();
    this.currentTooltip = null;
    this.container = null;

    // 清理事件监听
    window.removeEventListener('scroll', this.hide);
    window.removeEventListener('resize', this.hide);
    document.removeEventListener('keydown', this._handleEscape);
  }
}

// 导出TooltipManager类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TooltipManager;
}

