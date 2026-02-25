# 设计文档：图片编辑器工具提示系统

## 上下文

当前图片编辑器已经实现了丰富的Photoshop功能，但用户界面缺乏足够的引导信息。用户需要悬停在工具图标上时看到功能描述和快捷键信息，以提高学习效率和使用体验。

## 目标与非目标

### 目标
- 为所有工具栏按钮提供清晰的工具提示
- 显示工具名称、功能描述和快捷键信息
- 提供流畅的动画效果和良好的用户体验
- 支持响应式设计和无障碍访问
- 与现有编辑器架构无缝集成

### 非目标
- 不改变现有工具的核心功能
- 不添加复杂的配置界面
- 不实现多语言支持（可后续扩展）
- 不改变现有的快捷键系统

## 技术决策

### 1. 工具提示管理器架构

**决策：** 创建独立的TooltipManager类来管理所有工具提示

**理由：**
- 集中管理工具提示逻辑，便于维护
- 支持统一的动画效果和样式
- 便于扩展和自定义
- 与现有事件系统解耦

**实现方案：**

```javascript
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
  }
}
```

### 2. 与ImageEditor集成

**决策：** 在ImageEditor类中添加工具提示管理功能

**理由：**
- 保持架构的一致性
- 便于统一管理编辑器状态
- 支持工具提示的动态更新

**实现方案：**

```javascript
// 在ImageEditor类中添加工具提示支持
class ImageEditor {
  constructor(canvasElement, options = {}) {
    // ... 现有代码 ...

    // 初始化工具提示管理器
    this.tooltipManager = new TooltipManager({
      delay: 300,
      fadeDuration: 150,
      position: 'top'
    });
    this.tooltipManager.init();

    // 注册工具提示
    this._setupTooltips();

    // ... 现有代码 ...
  }

  /**
   * 设置工具提示
   */
  _setupTooltips() {
    // 选择工具提示
    this._registerTooltip('rect-select', {
      title: '矩形选择',
      description: '创建矩形选区，用于选择图像的矩形区域',
      shortcut: 'R'
    });

    this._registerTooltip('ellipse-select', {
      title: '椭圆选择',
      description: '创建椭圆选区，用于选择图像的椭圆区域',
      shortcut: 'E'
    });

    // 绘制工具提示
    this._registerTooltip('brush', {
      title: '画笔',
      description: '使用软边画笔绘制，模拟真实画笔效果',
      shortcut: 'B'
    });

    this._registerTooltip('pencil', {
      title: '铅笔',
      description: '使用硬边铅笔绘制，创建清晰的线条',
      shortcut: 'P'
    });

    this._registerTooltip('eraser', {
      title: '橡皮擦',
      description: '擦除图像内容，显示下层图层或透明背景',
      shortcut: 'E'
    });

    // 变换工具提示
    this._registerTooltip('free-transform', {
      title: '自由变换',
      description: '自由缩放、旋转和扭曲选中的图层或选区',
      shortcut: 'Ctrl+T'
    });

    this._registerTooltip('scale', {
      title: '缩放',
      description: '按比例调整图层或选区的大小',
      shortcut: 'S'
    });

    this._registerTooltip('rotate', {
      title: '旋转',
      description: '旋转图层或选区',
      shortcut: 'R'
    });

    this._registerTooltip('skew', {
      title: '倾斜',
      description: '倾斜图层或选区，创建透视效果',
      shortcut: 'K'
    });

    this._registerTooltip('perspective', {
      title: '透视变换',
      description: '调整图层的透视效果，模拟三维空间',
      shortcut: 'P'
    });

    this._registerTooltip('3d-transform', {
      title: '3D变换',
      description: '在三维空间中旋转和变换图层',
      shortcut: '3'
    });

    // 菜单按钮提示
    this._registerTooltip('menuFile', {
      title: '文件',
      description: '文件操作菜单：新建、打开、保存、导出等'
    });

    this._registerTooltip('menuEdit', {
      title: '编辑',
      description: '编辑操作菜单：撤销、重做、复制、粘贴等'
    });

    // 面板按钮提示
    this._registerTooltip('addLayerBtn', {
      title: '新建图层',
      description: '在当前文档中添加新的空白图层'
    });

    this._registerTooltip('deleteLayerBtn', {
      title: '删除图层',
      description: '删除当前选中的图层'
    });

    this._registerTooltip('undoBtn', {
      title: '撤销',
      description: '撤销上一步操作',
      shortcut: 'Ctrl+Z'
    });

    this._registerTooltip('redoBtn', {
      title: '重做',
      description: '重做被撤销的操作',
      shortcut: 'Ctrl+Y'
    });

    // 状态栏按钮提示
    this._registerTooltip('exportBtn', {
      title: '导出图片',
      description: '将当前文档导出为图片文件（PNG/JPG）'
    });

    this._registerTooltip('saveBtn', {
      title: '保存文档',
      description: '保存当前编辑的文档'
    });
  }

  /**
   * 注册工具提示
   * @param {string} elementId - 元素ID
   * @param {Object} data - 工具提示数据
   */
  _registerTooltip(elementId, data) {
    this.tooltipManager.register(elementId, data);
  }

  /**
   * 销毁编辑器
   */
  destroy() {
    // ... 现有代码 ...

    // 销毁工具提示管理器
    if (this.tooltipManager) {
      this.tooltipManager.destroy();
      this.tooltipManager = null;
    }

    // ... 现有代码 ...
  }
}
```

### 3. CSS样式设计

**决策：** 创建独立的CSS样式文件来管理工具提示样式

**理由：**
- 保持样式的可维护性
- 支持主题切换
- 便于响应式设计调整

**实现方案：**

```css
/* image-editor-tooltips.css */

/* 工具提示容器 */
.image-editor-tooltip-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10000;
}

/* 工具提示基础样式 */
.image-editor-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

/* 工具提示标题 */
.image-editor-tooltip .tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

/* 工具提示描述 */
.image-editor-tooltip .tooltip-description {
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
}

/* 工具提示快捷键 */
.image-editor-tooltip .tooltip-shortcut {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.image-editor-tooltip .tooltip-shortcut code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 10px;
  margin-left: 4px;
}

/* 箭头样式（可选） */
.image-editor-tooltip::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

/* 上方箭头 */
.image-editor-tooltip[data-position="top"]::before {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
}

/* 下方箭头 */
.image-editor-tooltip[data-position="bottom"]::before {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent rgba(0, 0, 0, 0.85) transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-editor-tooltip {
    max-width: 250px;
    font-size: 11px;
    padding: 6px 10px;
  }

  .image-editor-tooltip .tooltip-title {
    font-size: 12px;
  }

  .image-editor-tooltip .tooltip-description,
  .image-editor-tooltip .tooltip-shortcut {
    font-size: 10px;
  }
}

/* 无障碍访问支持 */
.image-editor-tooltip[aria-hidden="true"] {
  display: none;
}

.image-editor-tooltip[aria-hidden="false"] {
  display: block;
}

/* 高对比度主题支持 */
@media (prefers-contrast: high) {
  .image-editor-tooltip {
    background: black;
    border: 1px solid white;
  }

  .image-editor-tooltip .tooltip-title {
    color: white;
  }

  .image-editor-tooltip .tooltip-description {
    color: #ccc;
  }

  .image-editor-tooltip .tooltip-shortcut code {
    background: #333;
    color: white;
  }
}
```

### 4. HTML模板更新

**决策：** 更新HTML模板以支持工具提示

**理由：**
- 保持HTML结构的清晰性
- 支持无障碍访问属性
- 便于工具提示的动态绑定

**实现方案：**

```html
<!-- 在create-game-image.html中更新工具栏按钮 -->
<div class="tool-group">
  <button class="tool-btn"
          data-tool="rect-select"
          id="rect-select-btn"
          aria-label="矩形选择工具"
          title="矩形选择 (R)">
    ⬜
  </button>
  <button class="tool-btn"
          data-tool="ellipse-select"
          id="ellipse-select-btn"
          aria-label="椭圆选择工具"
          title="椭圆选择 (E)">
    ⭕
  </button>
</div>

<!-- 菜单按钮 -->
<div class="menu-group">
  <button class="menu-btn"
          id="menuFile"
          aria-label="文件菜单"
          title="文件操作">
    文件
  </button>
  <!-- 其他按钮类似 -->
</div>

<!-- 面板按钮 -->
<div class="panel-buttons">
  <button id="addLayerBtn"
          class="btn-small"
          aria-label="新建图层"
          title="新建图层">
    ➕ 新建
  </button>
  <button id="deleteLayerBtn"
          class="btn-small"
          aria-label="删除图层"
          title="删除图层">
    🗑️ 删除
  </button>
</div>

<!-- 状态栏按钮 -->
<div class="status-item">
  <button id="exportBtn"
          class="btn-small"
          aria-label="导出图片"
          title="导出图片">
    📥 导出
  </button>
  <button id="saveBtn"
          class="btn-small"
          aria-label="保存文档"
          title="保存文档">
    💾 保存
  </button>
</div>
```

## 风险与权衡

### 风险
1. **性能影响**：大量工具提示可能影响编辑器性能
   - **缓解措施**：使用虚拟DOM技术，延迟加载，优化动画性能

2. **界面遮挡**：工具提示可能遮挡重要界面元素
   - **缓解措施**：智能位置计算，支持手动调整位置

3. **浏览器兼容性**：某些CSS特性可能不被旧浏览器支持
   - **缓解措施**：提供降级方案，使用兼容性更好的CSS属性

### 权衡
1. **功能丰富度 vs 性能**：在提供丰富提示信息的同时保持良好性能
   - **决策**：优先保证核心功能的性能，提示信息作为辅助功能

2. **自定义程度 vs 维护成本**：提供高度自定义的工具提示 vs 保持简单易维护
   - **决策**：提供基础的自定义选项，保持核心逻辑简单

## 迁移计划

### 阶段1：基础实现
1. 实现TooltipManager类
2. 集成到ImageEditor
3. 添加基础CSS样式
4. 测试核心功能

### 阶段2：全面覆盖
1. 为所有工具添加提示
2. 为菜单和面板添加提示
3. 优化响应式设计
4. 添加无障碍访问支持

### 阶段3：优化与测试
1. 性能优化
2. 用户体验测试
3. 浏览器兼容性测试
4. 文档更新

## 开放问题

1. 是否支持用户自定义工具提示内容？
2. 是否需要支持多语言工具提示？
3. 是否提供工具提示的显示/隐藏开关？
4. 如何收集用户对工具提示的反馈？

这些开放问题可以在后续迭代中根据用户反馈和实际需求来决定。

