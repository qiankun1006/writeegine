# 设计文档：当前选中模块移至画布右上角

## 架构设计

### 布局变更

**当前布局（三列）：**
```
┌──────────────────────────────────────┐
│ 图块选择 │ 当前选中 │   编辑区域     │
│  (左)   │ (中间)   │   (右侧)      │
│         │          │   - 工具栏    │
│         │          │   - Canvas    │
│         │          │   - 信息栏    │
└──────────────────────────────────────┘
```

**新布局（当前选中浮动在右上角）：**
```
┌──────────────────────────────────────┐
│ 图块选择 │       编辑区域            │
│  (左)   │   - 工具栏                │
│         │   - Canvas  ┌─当前选中─┐  │
│         │   - 信息栏  │ (浮动)   │  │
│         │   - 提示    └──────────┘  │
└──────────────────────────────────────┘
```

### 技术实现

#### 1. HTML 结构调整

**移除：** `current-tile-display` 从主容器中移出
**新增：** 将其放在 `canvas-container` 内部，作为浮动面板

```html
<!-- 新的 HTML 结构 -->
<div class="tilemap-editor-wrapper">
    <!-- 左侧：图块选择面板 -->
    <div class="tile-selector-panel">
        <!-- ... 不变 ... -->
    </div>

    <!-- 右侧：编辑区域 -->
    <div class="editor-panel">
        <!-- 工具栏 -->
        <div class="toolbar">
            <!-- ... 不变 ... -->
        </div>

        <!-- Canvas绘制区 -->
        <div class="canvas-container">
            <canvas id="tilemap-canvas" width="512" height="512"></canvas>

            <!-- ✨ 新：当前选中浮动在右上角 -->
            <div class="current-tile-display">
                <h3>当前选中</h3>
                <div class="current-tile-preview">
                    <img id="current-tile-image" src="" alt="未选择">
                </div>
                <div class="current-tile-name" id="current-tile-name">未选择</div>
                <div class="tile-info-tip">点击左侧图块选择</div>
            </div>
        </div>

        <!-- 信息栏和提示 -->
        <div class="editor-info"><!-- ... --></div>
        <div class="editor-hints"><!-- ... --></div>
    </div>
</div>
```

#### 2. CSS 样式设计

**原有样式（作为独立列）：**
```css
.current-tile-display {
    width: 150px;
    background: white;
    border-radius: 8px;
    padding: 15px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**新样式（浮动面板）：**
```css
.canvas-container {
    position: relative;  /* 相对定位容器 */
    flex: 1;
}

.current-tile-display {
    position: absolute;           /* 绝对定位 */
    top: 10px;                    /* 距顶部 */
    right: 10px;                  /* 距右侧 */
    width: 150px;                 /* 宽度不变 */
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10;                  /* 浮在 canvas 上方 */
    border: 2px solid #e0e0e0;
}

.current-tile-display h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #333;
}

.current-tile-preview {
    width: 100%;
    height: 100px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    overflow: hidden;
}

.current-tile-preview img {
    max-width: 90%;
    max-height: 90%;
}

.current-tile-name {
    text-align: center;
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
}

.tile-info-tip {
    text-align: center;
    font-size: 11px;
    color: #999;
}
```

#### 3. 主容器布局调整

**修改 tilemap-editor-wrapper：**
从三列改为二列

```css
.tilemap-editor-wrapper {
    display: flex;
    gap: 15px;
    padding: 15px;
    height: calc(100vh - 200px);
    background: #f5f5f5;
    /* flex-direction: row; 默认即可 */
}

.tile-selector-panel {
    width: 150px;
    flex-shrink: 0;
}

.editor-panel {
    flex: 1;           /* 扩展以填充剩余空间 */
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    padding: 15px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

## 实现步骤

### 第一步：HTML 结构调整
1. 在 `tilemap-editor.html` 中，将 `current-tile-display` 从主容器中移除
2. 将其插入到 `canvas-container` 内部，紧邻 `<canvas>` 标签后

### 第二步：CSS 样式更新
1. 更新 `tilemap-editor.css`：
   - 修改 `.tilemap-editor-wrapper` 为二列布局
   - 修改 `.canvas-container` 为相对定位
   - 重新设计 `.current-tile-display` 为浮动面板
   - 调整相关元素的间距和大小

### 第三步：验证功能
1. 确保图块选择功能正常
2. 确保当前选中预览能正确更新
3. 确保没有样式冲突
4. 在不同分辨率下验证布局

## 样式优化建议

### 响应式考虑
- 在小屏幕上可能需要调整面板大小或位置
- 可考虑在移动端将其改为其他布局

### 交互优化
- 可添加半透明背景使其更突出
- 可在悬停时显示边框高亮效果

### 视觉改进
- 考虑使用淡色背景（如 #fafafa）
- 增加内阴影效果以增强立体感

## 风险评估

**低风险：**
- 只涉及 HTML 和 CSS 变更
- JavaScript 逻辑无需修改
- 功能完全保持不变

**验证点：**
- [ ] 浮动面板不遮挡 canvas 关键区域
- [ ] 滚动行为正确
- [ ] 所有浏览器兼容性

