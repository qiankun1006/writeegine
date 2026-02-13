# Spec: Canvas Optimization and Layout

## MODIFIED Requirements

#### Requirement: 当前选中模块不遮挡画布

当前选中（预览）模块应该重新定位，确保不会遮挡 Canvas 的任何部分，让用户有更大的编辑空间。

##### Scenario: 模块重定位到编辑面板顶部

- 给定：用户打开 Tilemap 编辑器
- 当：页面加载完成
- 那么：当前选中模块应该显示在编辑面板的顶部（在工具栏之前或之后）
- 并且：模块宽度为 100%，填充整个编辑面板宽度
- 并且：模块不再使用绝对定位
- 并且：Canvas 区域应该有更多空间用于绘制

##### Scenario: 当前选中模块与工具栏关系

- 给定：编辑面板加载
- 当：初始化完成
- 那么：当前选中模块应该在编辑面板的顶部区域
- 并且：工具栏应该在当前选中模块下方
- 并且：Canvas 容器应该占据最大的可用空间

#### Requirement: 画布区域扩展

Canvas 容器应该获得更多的垂直和水平空间，以提供更好的编辑体验。

##### Scenario: Canvas 容器高度扩展

- 给定：编辑面板显示
- 当：除去工具栏和信息栏后的空间
- 那么：Canvas 容器应该使用 `flex: 1` 扩展，填充所有可用空间
- 并且：Canvas 尺寸应该根据内容自适应

## Layout Structure

### HTML 结构

```html
<div class="editor-panel">
  <!-- 编辑面板头部 -->
  <div class="editor-header">
    <!-- 当前选中模块（非浮动） -->
    <div class="current-tile-display">
      <!-- 内容 -->
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 按钮 -->
    </div>
  </div>

  <!-- Canvas 区域（最大化） -->
  <div class="canvas-container">
    <canvas id="tilemap-canvas"></canvas>
  </div>

  <!-- 编辑面板底部 -->
  <div class="editor-footer">
    <!-- 信息栏 -->
    <div class="editor-info"></div>

    <!-- 提示栏 -->
    <div class="editor-hints"></div>
  </div>
</div>
```

## CSS Changes

### 当前选中模块样式

```css
.current-tile-display {
  position: static;      /* 改为静态定位 */
  top: auto;
  right: auto;
  width: 100%;           /* 填充整个宽度 */
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.2);
  margin-bottom: 12px;
  padding: 12px;
  z-index: 1;            /* 移除 z-index: 10 */
}
```

### Editor Panel 结构

```css
.editor-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.canvas-container {
  flex: 1;               /* 占用所有剩余空间 */
  min-height: 400px;     /* 最小高度保证可用性 */
}

.editor-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

## Files Affected

- `src/main/resources/templates/tilemap-editor.html` - 重新组织 HTML 结构
- `src/main/resources/static/css/tilemap-editor.css` - 更新布局样式

