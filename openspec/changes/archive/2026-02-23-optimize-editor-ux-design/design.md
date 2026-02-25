# 设计文档：编辑器 UX 优化

## 设计目标

创建一个具有游戏引擎风格的 Tilemap 编辑器，提供专业、科技感的视觉体验和友好的交互反馈。

## 1. 视觉设计方案

### 配色方案（深色游戏引擎风格）

```
主色调：
  - 背景深色：#0f1419（深灰蓝）
  - 卡片背景：#1a1f2e（深紫蓝）
  - 强调色：#00d4ff（青蓝，高亮）
  - 成功色：#00ff88（绿色）
  - 警告色：#ffb000（橙色）
  - 危险色：#ff3333（红色）

文字色：
  - 主文字：#e8e9ea（浅灰）
  - 次要文字：#a0a1a2（中灰）
  - 暗文字：#505355（深灰）
```

### 背景设计

```css
/* 整体背景 - 深色渐变 */
body {
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
  background-attachment: fixed;
}

/* 编辑器主容器 */
.tilemap-editor-wrapper {
  background: transparent;
}

/* 面板卡片 - 半透明玻璃态 */
.tile-selector-panel,
.editor-panel {
  background: rgba(26, 31, 46, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 按钮设计

```css
/* 主按钮 */
.btn-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
  color: white;
  font-weight: 600;
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
}

/* 危险按钮 */
.btn-danger {
  background: linear-gradient(135deg, #ff3333 0%, #cc0000 100%);
  border: 1px solid rgba(255, 51, 51, 0.3);
}

/* 次要按钮 */
.btn-secondary {
  background: rgba(160, 161, 162, 0.2);
  border: 1px solid rgba(160, 161, 162, 0.3);
  color: #e8e9ea;
}

.btn-secondary:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
}
```

### 分隔符设计

```css
.resizable-divider {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 212, 255, 0.3) 50%,
    transparent 100%);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.1);
}

.resizable-divider:hover {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 212, 255, 0.6) 50%,
    transparent 100%);
  box-shadow: 0 0 16px rgba(0, 212, 255, 0.3);
}
```

## 2. 布局优化方案

### Canvas 区域扩展

当前：
```
┌─────────────────────────────────┐
│ 图块选择 │ 分隔符 │ 编辑区域   │
│ 150px  │ 8px   │ flex(1)    │
│        │       │ - 工具栏   │
│        │       │ - Canvas   │
│        │       │ - 信息栏   │
└─────────────────────────────────┘
```

优化后：
```
┌──────────────────────────────────────┐
│ 图块选择 │ 分隔符 │   编辑区域     │
│ 140px  │ 6px   │  flex(1)       │
│        │       │  - 工具栏     │
│        │       │  - Canvas↑    │
│        │       │  - 当前选中   │
│        │       │  - 信息栏     │
└──────────────────────────────────────┘
```

### 当前选中模块重定位

**原方案：** 浮动在 canvas 右上角（可能遮挡）
```html
<div class="canvas-container">
  <canvas id="tilemap-canvas"></canvas>
  <div class="current-tile-display"><!-- 浮动面板 --></div>
</div>
```

**新方案：** 固定在编辑面板顶部
```html
<div class="editor-panel">
  <div class="editor-header">
    <div class="current-tile-display"><!-- 不再浮动 --></div>
    <div class="toolbar"><!-- 工具栏 --></div>
  </div>
  <div class="canvas-container">
    <canvas id="tilemap-canvas"></canvas>
  </div>
  <div class="editor-footer">
    <div class="editor-info"><!-- 信息栏 --></div>
    <div class="editor-hints"><!-- 提示栏 --></div>
  </div>
</div>
```

### 工具栏优化

```css
.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 6px;
  align-items: center;
}
```

## 3. 交互反馈优化

### 切换画布大小的友好提示

```javascript
// 改进前：简单 confirm
if (confirm('改变网格尺寸会清空当前画布，继续吗？')) { ... }

// 改进后：自定义对话框
showGridSizeDialog({
  title: '更改网格尺寸',
  message: `当前网格大小: ${this.gridSize}×${this.gridSize}`,
  detail: '网格尺寸更改后，当前画布内容将被清空。此操作无法撤销。',
  options: [
    { size: 8, label: '8×8' },
    { size: 16, label: '16×16（推荐）' },
    { size: 24, label: '24×24' },
    { size: 32, label: '32×32' }
  ],
  buttons: [
    { text: '取消', action: 'cancel' },
    { text: '确认更改', action: 'confirm', style: 'primary' }
  ]
});
```

### 清空画布的友好提示

```javascript
// 改进前：简单 confirm
if (confirm('确定要清空画布吗？')) { ... }

// 改进后：增强提示
showClearCanvasDialog({
  title: '清空画布',
  icon: 'warning',
  message: '即将清空所有绘制内容',
  detail: '清空后，已绘制的所有图块将被删除。你仍然可以使用"撤销"来恢复最后的操作。',
  buttons: [
    { text: '取消', action: 'cancel', style: 'secondary' },
    { text: '清空画布', action: 'confirm', style: 'danger' }
  ]
});
```

### 自定义对话框样式

```css
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-box {
  background: linear-gradient(135deg, #1a1f2e 0%, #252d3d 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #00d4ff;
  margin-bottom: 12px;
}

.dialog-message {
  font-size: 14px;
  color: #e8e9ea;
  margin-bottom: 8px;
}

.dialog-detail {
  font-size: 12px;
  color: #a0a1a2;
  margin-bottom: 20px;
  line-height: 1.5;
}

.dialog-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-buttons .btn {
  min-width: 100px;
  padding: 10px 16px;
}
```

## 4. 信息栏和提示栏优化

### 信息栏（更新样式）

```css
.editor-info {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid rgba(0, 212, 255, 0.3);
  font-size: 12px;
  color: #a0a1a2;
}

.editor-info span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.editor-info span strong {
  color: #e8e9ea;
  font-weight: 600;
}
```

### 提示栏（增强样式）

```css
.editor-hints {
  padding: 12px 16px;
  background: linear-gradient(90deg,
    rgba(0, 212, 255, 0.05) 0%,
    rgba(0, 212, 255, 0.1) 100%);
  border-left: 3px solid #00d4ff;
  border-radius: 6px;
  font-size: 12px;
  color: #a0a1a2;
  margin-top: 12px;
}

.editor-hints p {
  margin: 0;
}

.editor-hints strong {
  color: #00d4ff;
}
```

## 5. 当前选中模块新样式

```css
/* 从浮动改为正常流 */
.current-tile-display {
  position: static;
  top: auto;
  right: auto;
  width: 100%;
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.2);
  margin-bottom: 12px;
  padding: 12px;
}

.current-tile-display h3 {
  color: #00d4ff;
  font-size: 13px;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.current-tile-preview {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.current-tile-name {
  color: #e8e9ea;
  font-weight: 600;
}

.tile-info-tip {
  font-size: 11px;
  color: #505355;
}
```

## 6. 响应式设计

在移动设备上自动调整布局，保持可用性：

```css
@media (max-width: 1024px) {
  .tilemap-editor-wrapper {
    flex-direction: column;
  }

  .tile-selector-panel {
    width: 100%;
    margin-right: 0;
    margin-bottom: 15px;
  }

  .resizable-divider {
    display: none;
  }

  .editor-panel {
    margin-left: 0;
  }
}
```

## 7. 实现步骤

### 第一阶段：视觉主题
1. 更新全局背景颜色和渐变
2. 更新面板和卡片样式（半透明玻璃态）
3. 优化按钮样式和悬停效果

### 第二阶段：布局调整
1. 移除当前选中模块的浮动定位
2. 重新组织编辑面板的内部布局
3. 调整工具栏和信息栏的样式

### 第三阶段：交互反馈
1. 创建自定义对话框组件
2. 优化网格大小切换提示
3. 优化清空画布提示
4. 添加操作反馈动画

### 第四阶段：测试和优化
1. 跨浏览器测试
2. 响应式设计测试
3. 性能优化（确保动画流畅）

## 8. 技术考虑

### 浏览器兼容性
- `backdrop-filter` - 支持现代浏览器（Chrome 76+, Firefox 103+, Safari 9+）
- 降级方案：使用简单半透明背景

### 性能优化
- 使用 CSS 变量管理颜色，减少重复代码
- 使用 `will-change` 提示浏览器优化动画
- 确保动画帧率在 60fps

### 无障碍设计
- 保证足够的颜色对比度（WCAG AA 标准）
- 所有交互元素可键盘访问
- 对话框支持 Esc 键关闭

