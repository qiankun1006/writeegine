# 快速开始指南：编辑器扩展使用手册

## 🎯 功能概览

创作游戏页面现已支持**多编辑器选项卡管理**。用户可以在同一个页面中无缝切换不同的编辑器。

```
┌─────────────────────────────────┐
│  创作游戏                          │
├─────────────────────────────────┤
│  游戏信息表单                      │
├─────────────────────────────────┤
│  [🗺️ 地图编辑] [🖼️ 图片编辑]      │ ← 选项卡
├─────────────────────────────────┤
│                                 │
│  编辑器内容区域                    │ ← 显示当前选项卡的编辑器
│  (Tilemap 或 图片编辑器)           │
│                                 │
├─────────────────────────────────┤
│  [保存] [发布] [取消]              │
└─────────────────────────────────┘
```

---

## 🚀 使用说明

### 1. **切换编辑器**
- 点击「🗺️ 地图编辑」按钮 → 切换到 Tilemap 编辑器
- 点击「🖼️ 图片编辑」按钮 → 切换到图片编辑器（目前为占位符）
- 切换时有平滑的淡入淡出动画

### 2. **编辑地图**
- 在「🗺️ 地图编辑」选项卡中使用现有的 Tilemap 编辑器
- 所有功能与之前相同，完全兼容

### 3. **等待图片编辑器**
- 「🖼️ 图片编辑」选项卡目前显示占位符
- 后续将在此位置集成图片编辑器

---

## 🏗️ 架构说明

### 类结构

```
GameCreation (游戏创作页面)
    ├── EditorTabManager (选项卡管理器)
    │   ├── bindTabButtons() - 绑定选项卡按钮事件
    │   ├── switchTab(tabName) - 切换选项卡
    │   └── onTabSwitch(tabName) - 编辑器初始化回调
    │
    └── 其他功能 (保存、发布、取消等)
```

### 选项卡数据结构

```javascript
// 当前活跃选项卡
this.currentTab = 'tilemap' | 'image'

// HTML 标记
<button class="editor-tab-button active" data-tab="tilemap">
<div class="editor-tab-content active" id="tilemap-tab">
```

---

## 💻 开发者指南

### 为图片编辑器做准备

#### 1. 创建 `ImageEditor` 类 (`image-editor.js`)

```javascript
class ImageEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        // 初始化图片编辑器
        console.log('ImageEditor initialized');
    }

    destroy() {
        // 清理资源
    }
}
```

#### 2. 修改 `EditorTabManager` 以支持图片编辑器

```javascript
onTabSwitch(tabName) {
    console.log(`切换到: ${tabName} 编辑器`);

    if (tabName === 'tilemap') {
        if (typeof TilemapEditor !== 'undefined') {
            console.log('✓ Tilemap 编辑器已就绪');
        }
    } else if (tabName === 'image') {
        // 初始化图片编辑器
        if (!this.imageEditor && typeof ImageEditor !== 'undefined') {
            this.imageEditor = new ImageEditor('image-tab');
        }
    }
}
```

#### 3. 替换占位符容器

```html
<!-- 替换前 -->
<div class="image-editor-container">
    <div class="editor-placeholder">
        <p>🖼️ 图片编辑器开发中...</p>
    </div>
</div>

<!-- 替换后 -->
<div class="image-editor-container" id="image-editor-container">
    <!-- 图片编辑器将在这里渲染 -->
</div>
```

---

## 🎨 样式参考

### 关键 CSS 类

| 类名 | 用途 | 说明 |
|------|------|------|
| `.editor-tabs` | 容器 | 整个选项卡区域 |
| `.editor-tab-header` | 头部 | 选项卡按钮行 |
| `.editor-tab-button` | 按钮 | 单个选项卡按钮 |
| `.editor-tab-button.active` | 活跃按钮 | 当前活跃的选项卡 |
| `.editor-tab-content` | 内容 | 编辑器内容容器 |
| `.editor-tab-content.active` | 活跃内容 | 显示当前编辑器 |
| `.image-editor-container` | 图片编辑器 | 图片编辑器容器 |
| `.editor-placeholder` | 占位符 | 编辑器占位符 |

### 颜色变量

```css
:root {
    --bg-primary: #0f1419;
    --bg-secondary: #1a1f2e;
    --color-primary: #00d4ff;      /* 青色 - 活跃状态 */
    --color-primary-dark: #0099cc; /* 深青色 */
    --text-primary: #e8e9ea;       /* 亮色文字 */
    --text-secondary: #a0a1a2;     /* 暗色文字 */
}
```

---

## 🔧 常见问题

### Q: 如何添加新的编辑器选项卡？

A: 按照以下步骤：
1. 在 HTML 中添加新的 `<button class="editor-tab-button" data-tab="new-editor">`
2. 添加对应的 `<div class="editor-tab-content" id="new-editor-tab">`
3. 在 `EditorTabManager.onTabSwitch()` 中添加初始化逻辑

### Q: 选项卡切换时编辑器状态会丢失吗？

A: 不会。编辑器容器一直存在于 DOM 中，只是通过 CSS 显示/隐藏。编辑器内部的状态不会被清除。

### Q: 如何获取当前活跃的编辑器？

A: 通过 `EditorTabManager` 实例：
```javascript
const tabManager = new EditorTabManager();
console.log(tabManager.currentTab); // 'tilemap' 或 'image'
```

### Q: 动画效果太快/太慢？

A: 修改 CSS 中的动画时间：
```css
.editor-tab-content {
    animation: fadeIn 0.3s ease;  /* 修改 0.3s */
}
```

---

## 📋 任务检查清单

实施完成的所有任务：

- ✅ HTML 结构改造完成
- ✅ CSS 样式实现完成
- ✅ JavaScript 交互完成
- ✅ 选项卡切换功能正常
- ✅ 响应式设计验证
- ✅ 代码注释完整
- ✅ 无 Linter 错误
- ✅ 跨浏览器兼容

---

## 📞 技术支持

### 关键文件位置

| 文件 | 路径 |
|------|------|
| HTML | `src/main/resources/templates/create-game.html` |
| CSS | `src/main/resources/static/css/game-creation.css` |
| JavaScript | `src/main/resources/static/js/game-creation.js` |

### 相关文档

- 📖 详细设计: `design.md`
- 📋 任务列表: `tasks.md`
- 📊 实施报告: `IMPLEMENTATION_REPORT.md`
- 📝 提案文档: `proposal.md`

---

## ✨ 接下来的步骤

1. **图片编辑器开发** - 按照本指南创建 ImageEditor 类
2. **集成与测试** - 将图片编辑器集成到选项卡中
3. **性能优化** - 优化编辑器加载和内存使用
4. **用户反馈** - 收集用户反馈并进行迭代

---

**版本**: 1.0
**最后更新**: 2026-02-15
**状态**: ✅ 完成

