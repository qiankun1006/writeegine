# 设计文档：可拖动布局分隔符

## 架构设计

### 布局概览

```
┌─────────────────────────────────────────┐
│ 图块选择 │ ▌ │      编辑区域            │
│  面板   │ ▌ │   - 工具栏              │
│         │ ▌ │   - Canvas              │
│         │ ▌ │   - 信息栏              │
└─────────────────────────────────────────┘
          ↑
    可拖动分隔符
```

### 设计原则

1. **视觉指示**
   - 分隔符应该清晰可见
   - 悬停时显示高亮状态
   - 显示拖动光标（resize）

2. **尺寸约束**
   - 左侧最小宽度：120px（保证图块可见）
   - 右侧最小宽度：300px（保证编辑区可用）
   - 初始宽度保持不变

3. **交互流畅**
   - 拖动过程中无抖动
   - 拖动中即时更新宽度
   - 支持鼠标移出窗口时继续拖动
   - 释放鼠标时停止拖动

## 技术实现

### 1. HTML 结构

```html
<div class="tilemap-editor-wrapper">
    <!-- 左侧：图块选择面板 -->
    <div class="tile-selector-panel">
        <!-- ... 现有内容 ... -->
    </div>

    <!-- ✨ 新增：可拖动分隔符 -->
    <div class="resizable-divider" id="resizable-divider"></div>

    <!-- 右侧：编辑区域 -->
    <div class="editor-panel">
        <!-- ... 现有内容 ... -->
    </div>
</div>
```

### 2. CSS 样式

#### 基础样式
```css
.resizable-divider {
    width: 8px;                    /* 分隔符宽度 */
    background: #e0e0e0;
    cursor: col-resize;            /* 列调整游标 */
    user-select: none;             /* 防止选中文本 */
    flex-shrink: 0;                /* 不缩小 */
    transition: background 0.2s;
}

.resizable-divider:hover {
    background: #4a90e2;           /* 悬停时高亮 */
    box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
}

.resizable-divider.active {
    background: #4a90e2;           /* 拖动中保持高亮 */
    box-shadow: 0 0 8px rgba(74, 144, 226, 0.5);
}
```

### 3. JavaScript 交互逻辑

#### 核心逻辑
```javascript
class ResizableLayoutManager {
    constructor() {
        this.divider = document.getElementById('resizable-divider');
        this.wrapper = document.querySelector('.tilemap-editor-wrapper');
        this.leftPanel = document.querySelector('.tile-selector-panel');
        this.rightPanel = document.querySelector('.editor-panel');

        this.isDragging = false;
        this.minLeftWidth = 120;     // 左侧最小宽度
        this.minRightWidth = 300;    // 右侧最小宽度

        this.initEventListeners();
    }

    initEventListeners() {
        this.divider.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
    }

    startDrag(e) {
        this.isDragging = true;
        this.divider.classList.add('active');
        this.startX = e.clientX;
        this.startLeftWidth = this.leftPanel.offsetWidth;
    }

    onDrag(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.startX;
        const newLeftWidth = this.startLeftWidth + deltaX;

        // 计算右侧宽度（需要考虑分隔符宽度）
        const dividerWidth = this.divider.offsetWidth;
        const availableWidth = this.wrapper.offsetWidth - dividerWidth;
        const newRightWidth = availableWidth - newLeftWidth;

        // 验证最小宽度限制
        if (newLeftWidth >= this.minLeftWidth &&
            newRightWidth >= this.minRightWidth) {
            this.leftPanel.style.width = newLeftWidth + 'px';
            this.rightPanel.style.width = newRightWidth + 'px';
        }
    }

    stopDrag() {
        this.isDragging = false;
        this.divider.classList.remove('active');
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    new ResizableLayoutManager();
    // 其他初始化代码...
});
```

### 4. 集成到现有代码

在 `TilemapEditor` 类中，或在全局初始化中创建 `ResizableLayoutManager` 实例。

## 实现步骤

### Step 1: 添加 HTML 元素
在 `tilemap-editor-panel` 和 `editor-panel` 之间添加 `<div class="resizable-divider">`

### Step 2: 添加 CSS 样式
在 `tilemap-editor.css` 中定义分隔符的样式

### Step 3: 编写 JavaScript 逻辑
在 `tilemap-editor.js` 中创建 `ResizableLayoutManager` 类并初始化

### Step 4: 调整布局 CSS
修改 `.tilemap-editor-wrapper` 为 flex 布局（如果还不是）

## 样式改进建议

### 视觉反馈
- 在拖动时显示实时尺寸提示
- 添加平滑的过渡动画
- 分隔符可以显示拖动手柄（小点或线条）

### 持久化存储（可选）
- 使用 localStorage 保存用户偏好的宽度
- 下次打开时恢复相同的布局

## 风险评估

**低风险：**
- 只影响布局，不改变功能
- JavaScript 是独立模块
- 可以通过 flex 布局灵活调整

**验证点：**
- [ ] 分隔符显示位置正确
- [ ] 拖动流畅无卡顿
- [ ] 最小宽度限制有效
- [ ] 两个面板宽度和不超过容器
- [ ] 浏览器兼容性（Chrome, Firefox, Safari, Edge）

