# Tilemap编辑器代码注释设计

## 概述
为Tilemap编辑器的CSS和JavaScript文件添加详细的行级注释，提升代码可读性和可维护性。所有注释将使用中文，使团队成员能快速理解代码意图。

## CSS注释策略

### 1. 全局样式注释
```css
/* 编辑器主容器 - 整个编辑器应用的最外层包装，提供基础内边距 */
.tilemap-editor {
    padding: 1rem; /* 为内部内容留出空间 */
}

/* 编辑器标题区域 - 显示应用名称和说明文字 */
.editor-header {
    margin-bottom: 2rem; /* 为下方内容留出充足间距 */
    text-align: center; /* 标题居中对齐 */
}

/* 标题的h1元素样式 */
.editor-header h1 {
    color: #2c3e50; /* 深灰色，便于阅读 */
    margin-bottom: 0.5rem; /* 标题和说明文字间距 */
}

/* 标题说明文字样式 */
.editor-header p {
    color: #7f8c8d; /* 浅灰色，降低视觉权重 */
}
```

### 2. 容器和布局注释
```css
/* 编辑器主容器 - 包含工具栏和编辑区域的白色卡片 */
.editor-container {
    background: #fff; /* 白色背景 */
    border-radius: 8px; /* 圆角让界面更柔和 */
    box-shadow: 0 2px 10px rgba(0,0,0,0.1); /* 浅阴影提升视觉层级 */
    overflow: hidden; /* 隐藏超出边界的内容 */
}

/* 工具栏 - 放置编辑工具的横向栏 */
.toolbar {
    background: #34495e; /* 深蓝灰色背景 */
    padding: 1rem; /* 内边距 */
    display: flex; /* 使用Flexbox布局 */
    flex-wrap: wrap; /* 当空间不足时折行 */
    gap: 1.5rem; /* 工具栏组之间的间距 */
    align-items: center; /* 垂直居中对齐 */
}

/* 工具栏组 - 相关工具的分组容器 */
.toolbar-group {
    display: flex; /* Flexbox布局 */
    align-items: center; /* 元素垂直居中 */
    gap: 0.5rem; /* 组内元素间距 */
}
```

### 3. 按钮样式注释
```css
/* 通用按钮基础样式 */
.btn-tool, .btn-primary, .btn-secondary {
    padding: 0.5rem 1rem; /* 上下0.5rem，左右1rem内边距 */
    border: none; /* 移除默认边框 */
    border-radius: 4px; /* 轻微圆角 */
    cursor: pointer; /* 鼠标悬停时显示手指图标 */
    font-weight: 500; /* 中等粗细字体 */
    transition: all 0.2s; /* 平滑过渡效果 */
}

/* 普通工具按钮 - 浅色背景 */
.btn-tool {
    background: #ecf0f1; /* 浅灰色背景 */
    color: #2c3e50; /* 深灰色文字 */
}

/* 工具按钮悬停效果 */
.btn-tool:hover {
    background: #d5dbdb; /* 点击时背景变深 */
}

/* 主要操作按钮 - 蓝色背景强调 */
.btn-primary {
    background: #3498db; /* 蓝色背景 */
    color: white; /* 白色文字 */
}

/* 主要按钮悬停效果 */
.btn-primary:hover {
    background: #2980b9; /* 点击时变为更深的蓝色 */
}

/* 次要操作按钮 - 灰色背景 */
.btn-secondary {
    background: #95a5a6; /* 中等灰色背景 */
    color: white; /* 白色文字 */
}

/* 次要按钮悬停效果 */
.btn-secondary:hover {
    background: #7f8c8d; /* 点击时变为更深的灰色 */
}

/* 下拉菜单选择框样式 */
.tool-select {
    padding: 0.4rem; /* 内边距 */
    border: 1px solid #bdc3c7; /* 灰色边框 */
    border-radius: 4px; /* 轻微圆角 */
    background: white; /* 白色背景 */
}
```

### 4. 编辑区域布局注释
```css
/* 编辑器主区域 - 分为图块选择器和编辑区两部分 */
.editor-main {
    display: flex; /* 水平并排布局 */
    min-height: 600px; /* 最小高度保证编辑空间 */
}

/* 图块调色板 - 左侧图块选择器面板 */
.tile-palette {
    width: 250px; /* 固定宽度250像素 */
    background: #f8f9fa; /* 浅灰色背景，区分主区域 */
    border-right: 1px solid #dee2e6; /* 右侧边框分隔线 */
    padding: 1rem; /* 内边距 */
    overflow-y: auto; /* 超出时垂直滚动 */
}

/* 图块调色板标题 */
.tile-palette h3 {
    margin-bottom: 1rem; /* 标题底部间距 */
    color: #2c3e50; /* 深灰色文字 */
}

/* 图块网格 - 2列布局展示图块 */
.tile-grid {
    display: grid; /* 网格布局 */
    grid-template-columns: repeat(2, 1fr); /* 2列相等宽度 */
    gap: 0.75rem; /* 行列间距 */
}

/* 单个图块项 - 可选择的图块卡片 */
.tile-item {
    background: white; /* 白色背景 */
    border: 2px solid #dee2e6; /* 灰色边框 */
    border-radius: 6px; /* 圆角使界面友好 */
    padding: 0.5rem; /* 内边距 */
    text-align: center; /* 内容居中 */
    cursor: pointer; /* 手指指针表示可点击 */
    transition: all 0.2s; /* 平滑过渡 */
}

/* 图块项悬停效果 */
.tile-item:hover {
    border-color: #3498db; /* 边框变为蓝色 */
    transform: translateY(-2px); /* 上移2像素产生浮起效果 */
    box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 添加阴影深度感 */
}

/* 图块项被选中状态 */
.tile-item.selected {
    border-color: #2ecc71; /* 边框变为绿色 */
    background: #f0f9f4; /* 浅绿色背景 */
}

/* 图块预览图片 */
.tile-preview {
    width: 48px; /* 固定宽度48像素 */
    height: 48px; /* 固定高度48像素 */
    object-fit: contain; /* 完整显示图片内容 */
    margin-bottom: 0.5rem; /* 图片和文字间距 */
}

/* 图块名称文字 */
.tile-item span {
    display: block; /* 块级元素另起一行 */
    font-size: 0.85rem; /* 较小字体 */
    color: #34495e; /* 深灰色文字 */
}
```

### 5. 编辑区域注释
```css
/* 编辑区域 - 画布和控制面板所在的右侧区域 */
.editor-area {
    flex: 1; /* 占据剩余所有空间 */
    padding: 1rem; /* 内边距 */
    display: flex; /* Flexbox布局 */
    flex-direction: column; /* 垂直排列（从上到下） */
}

/* 编辑器控制面板 - 显示当前选择和状态信息 */
.editor-controls {
    display: flex; /* 水平布局 */
    justify-content: space-between; /* 左右两端对齐 */
    align-items: center; /* 垂直居中 */
    margin-bottom: 1rem; /* 下方间距 */
    padding: 0.75rem; /* 内边距 */
    background: #f8f9fa; /* 浅灰色背景 */
    border-radius: 6px; /* 圆角 */
}

/* 当前选择的图块显示区域 */
.current-tile {
    display: flex; /* 水平布局 */
    align-items: center; /* 垂直居中 */
    gap: 0.75rem; /* 元素间距 */
}

/* 当前选择图块的预览图 */
#current-tile-preview {
    width: 32px; /* 宽度32像素 */
    height: 32px; /* 高度32像素 */
    border: 1px solid #bdc3c7; /* 灰色边框 */
    border-radius: 4px; /* 轻微圆角 */
}

/* 当前选择的图块名称 */
#current-tile-name {
    font-weight: 500; /* 中等粗细 */
    color: #2c3e50; /* 深灰色文字 */
}

/* 网格信息显示（网格尺寸、已放置数量） */
.grid-info {
    color: #7f8c8d; /* 浅灰色 */
    font-size: 0.9rem; /* 较小字体 */
}

/* Canvas容器 - 包裹画布和网格叠加层 */
.canvas-container {
    position: relative; /* 相对定位，用于绝对定位子元素 */
    flex: 1; /* 占据剩余空间 */
    border: 1px solid #dee2e6; /* 灰色边框 */
    border-radius: 6px; /* 圆角 */
    overflow: hidden; /* 隐藏超出边界的内容 */
    background: #f8f9fa; /* 浅灰色背景 */
}

/* Canvas画布 - 绘制图块的2D画布 */
#tilemap-canvas {
    display: block; /* 块级元素 */
    width: 100%; /* 占满容器宽度 */
    height: 100%; /* 占满容器高度 */
    cursor: crosshair; /* 十字光标表示可点击绘制 */
}

/* 网格叠加层 - 显示编辑网格和接收点击 */
.canvas-grid {
    position: absolute; /* 绝对定位覆盖canvas */
    top: 0; /* 顶部对齐 */
    left: 0; /* 左侧对齐 */
    width: 100%; /* 占满容器宽度 */
    height: 100%; /* 占满容器高度 */
    pointer-events: auto; /* 接收鼠标点击事件 */
}

/* 编辑器提示文字 */
.editor-hints {
    margin-top: 1rem; /* 上方间距 */
    padding: 0.75rem; /* 内边距 */
    background: #fff3cd; /* 浅黄色背景 */
    border: 1px solid #ffeaa7; /* 黄色边框 */
    border-radius: 6px; /* 圆角 */
    color: #856404; /* 深橙色文字 */
    font-size: 0.9rem; /* 较小字体 */
}

/* =============== 响应式设计 =============== */

/* 平板设备（最大宽度992px）响应式 */
@media (max-width: 992px) {
    /* 当空间不足时，改为竖排布局 */
    .editor-main {
        flex-direction: column; /* 从横排改为竖排 */
    }

    /* 图块调色板宽度改为100%，改为横排 */
    .tile-palette {
        width: 100%; /* 占满宽度 */
        border-right: none; /* 移除右边框 */
        border-bottom: 1px solid #dee2e6; /* 改为下边框分隔 */
    }

    /* 图块网格改为4列布局 */
    .tile-grid {
        grid-template-columns: repeat(4, 1fr); /* 平板上显示4列 */
    }
}

/* 手机设备（最大宽度576px）响应式 */
@media (max-width: 576px) {
    /* 工具栏改为竖排 */
    .toolbar {
        flex-direction: column; /* 从横排改为竖排 */
        align-items: flex-start; /* 左对齐 */
        gap: 1rem; /* 增加行间距 */
    }

    /* 图块网格改为3列布局 */
    .tile-grid {
        grid-template-columns: repeat(3, 1fr); /* 手机上显示3列 */
    }
}
```

## JavaScript注释策略

详见下一部分。所有关键方法都会有详细行级注释，说明：
1. 方法的目的和功能
2. 参数含义（如有）
3. 变量的用途
4. 条件判断的逻辑
5. 循环的执行过程
6. DOM操作的目的
7. 事件处理的流程

注释会使用以下格式：
- `// 功能描述` - 单行注释
- `/* 块注释 */` - 多行或复杂逻辑说明
- 分组注释标题用`// ===== 功能名称 =====`

## 实现原则

1. **清晰易懂** - 用简单的中文说明每行代码做什么
2. **适度详细** - 既不过于简洁，也不冗长繁琐
3. **保持整洁** - 注释风格统一，缩进对齐
4. **不改变功能** - 只添加注释，不修改代码逻辑

