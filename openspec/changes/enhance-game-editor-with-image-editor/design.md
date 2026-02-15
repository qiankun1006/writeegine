# 设计文档：扩展创作游戏页面 - 添加图片编辑功能入口

## 1. 概述

本设计文档详细说明如何改造创作游戏页面，使其支持多个编辑器的切换和管理。核心思想是通过选项卡（Tab）界面，让用户在 Tilemap 编辑器和图片编辑器之间无缝切换。

---

## 2. 页面结构设计

### 2.1 新的页面布局

```
┌─────────────────────────────────────────────────┐
│  创作游戏 - 返回首页                              │
├─────────────────────────────────────────────────┤
│  游戏信息表单                                    │
│  ┌──────────────┬──────────────────┐            │
│  │ 游戏名称    │ 输入框           │            │
│  ├──────────────┴──────────────────┤            │
│  │ 游戏描述                        │            │
│  │ 文本框...                       │            │
│  └─────────────────────────────────┘            │
├─────────────────────────────────────────────────┤
│  编辑器选项卡                                    │
│  [🗺️ 地图编辑]  [🖼️ 图片编辑]                    │
├─────────────────────────────────────────────────┤
│  编辑器内容区域                                  │
│  ┌─────────────────────────────────┐            │
│  │                                 │            │
│  │  Tilemap 编辑器 (Tab 1)          │            │
│  │  OR                             │            │
│  │  图片编辑器 (Tab 2 - 待开发)      │            │
│  │                                 │            │
│  └─────────────────────────────────┘            │
├─────────────────────────────────────────────────┤
│  操作按钮                                        │
│  [保存游戏] [发布到广场] [取消]                   │
└─────────────────────────────────────────────────┘
```

---

## 3. HTML 结构

### 3.1 改造后的 create-game.html

```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title>创作游戏</title>
    <link rel="stylesheet" th:href="@{/static/css/game-creation.css}">
</head>
<body>
    <div layout:fragment="content">
        <div class="game-creation-wrapper">
            <!-- 页面头部 -->
            <div class="creation-header">
                <h1>创作游戏</h1>
                <a href="/" class="back-button">← 返回首页</a>
            </div>

            <!-- 游戏信息表单 -->
            <div class="game-info-panel">
                <div class="info-group">
                    <label>游戏名称</label>
                    <input type="text" id="game-name" placeholder="输入游戏名称">
                </div>
                <div class="info-group">
                    <label>游戏描述</label>
                    <textarea id="game-description" placeholder="输入游戏描述"></textarea>
                </div>
            </div>

            <!-- 编辑器选项卡 -->
            <div class="editor-tabs">
                <div class="editor-tab-header">
                    <button class="editor-tab-button active" data-tab="tilemap">
                        🗺️ 地图编辑
                    </button>
                    <button class="editor-tab-button" data-tab="image">
                        🖼️ 图片编辑
                    </button>
                </div>

                <!-- 地图编辑器容器 (Tab 1) -->
                <div class="editor-tab-content active" id="tilemap-tab">
                    <div class="editor-container">
                        <!-- 嵌入 Tilemap 编辑器 -->
                        <div th:replace="~{tilemap-editor :: content}"></div>
                    </div>
                </div>

                <!-- 图片编辑器容器 (Tab 2) -->
                <div class="editor-tab-content" id="image-tab">
                    <div class="image-editor-container">
                        <div class="editor-placeholder">
                            <p>🖼️ 图片编辑器开发中...</p>
                            <p class="placeholder-hint">支持的功能：精灵图编辑、贴图库管理等</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button class="btn btn-save">保存游戏</button>
                <button class="btn btn-publish">发布到广场</button>
                <button class="btn btn-cancel">取消</button>
            </div>
        </div>
    </div>
    <script th:src="@{/static/js/game-creation.js}"></script>
</body>
</html>
```

---

## 4. CSS 样式设计

### 4.1 新增/修改的 CSS 类

```css
/* 编辑器选项卡样式 */
.editor-tabs {
    margin-bottom: 30px;
    background: rgba(26, 31, 46, 0.4);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(0, 212, 255, 0.1);
}

/* 选项卡头部 */
.editor-tab-header {
    display: flex;
    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
    background: rgba(15, 20, 25, 0.5);
}

/* 选项卡按钮 */
.editor-tab-button {
    flex: 1;
    padding: 16px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.editor-tab-button:hover {
    color: var(--color-primary);
    background: rgba(0, 212, 255, 0.05);
}

.editor-tab-button.active {
    color: var(--color-primary);
    background: rgba(0, 212, 255, 0.1);
}

/* 活跃标签的下划线 */
.editor-tab-button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-primary);
}

/* 选项卡内容容器 */
.editor-tab-content {
    display: none;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

.editor-tab-content.active {
    display: block;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 编辑器容器 */
.editor-container {
    min-height: 500px;
    background: rgba(15, 20, 25, 0.5);
    border-radius: 8px;
    padding: 15px;
}

/* 图片编辑器容器 */
.image-editor-container {
    min-height: 500px;
    background: rgba(15, 20, 25, 0.5);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 编辑器占位符 */
.editor-placeholder {
    text-align: center;
    color: var(--text-secondary);
}

.editor-placeholder p {
    margin: 10px 0;
    font-size: 16px;
}

.editor-placeholder .placeholder-hint {
    font-size: 12px;
    color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .editor-tab-header {
        flex-direction: column;
    }

    .editor-tab-button {
        border-bottom: 1px solid rgba(0, 212, 255, 0.1);
    }

    .editor-tab-button.active::after {
        bottom: auto;
        top: 0;
        height: 3px;
        width: 100%;
    }

    .editor-container,
    .image-editor-container {
        min-height: 400px;
    }
}
```

---

## 5. JavaScript 交互设计

### 5.1 选项卡管理逻辑

```javascript
/**
 * 编辑器选项卡管理
 */
class EditorTabManager {
    constructor() {
        this.currentTab = 'tilemap';
        this.init();
    }

    init() {
        this.bindTabButtons();
    }

    bindTabButtons() {
        // 获取所有选项卡按钮
        const tabButtons = document.querySelectorAll('.editor-tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // 移除所有活跃状态
        document.querySelectorAll('.editor-tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.editor-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 设置新的活跃选项卡
        const activeButton = document.querySelector(
            `.editor-tab-button[data-tab="${tabName}"]`
        );
        const activeContent = document.getElementById(`${tabName}-tab`);

        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');

        this.currentTab = tabName;

        // 触发编辑器初始化回调
        this.onTabSwitch(tabName);
    }

    onTabSwitch(tabName) {
        console.log(`切换到: ${tabName} 编辑器`);

        if (tabName === 'tilemap') {
            console.log('Tilemap 编辑器已激活');
            // Tilemap 编辑器初始化逻辑
        } else if (tabName === 'image') {
            console.log('图片编辑器已激活');
            // 图片编辑器初始化逻辑（后续添加）
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new EditorTabManager();
});
```

---

## 6. 集成说明

### 6.1 与现有系统的集成

1. **保持向后兼容**
   - 现有的 Tilemap 编辑器功能保持不变
   - 保存、发布、取消按钮的逻辑保持一致
   - 游戏信息表单保持不变

2. **样式系统**
   - 新增的 CSS 类使用现有的 CSS 变量（theme.css）
   - 所有颜色、圆角、阴影都遵循全局主题
   - 响应式设计遵循现有的断点规则

3. **JavaScript 模块化**
   - 创建独立的 EditorTabManager 类管理选项卡
   - 与现有的 GameCreation 类协作
   - 为后续的图片编辑器开发预留接口

---

## 7. 后续扩展点

### 7.1 图片编辑器开发时的接入点

当开发图片编辑器时，只需要：

1. 创建图片编辑器的 HTML 结构
2. 创建对应的 CSS 样式
3. 创建对应的 JavaScript 类（如 ImageEditor）
4. 在 EditorTabManager 的 `onTabSwitch` 方法中初始化图片编辑器

示例：
```javascript
} else if (tabName === 'image') {
    if (!this.imageEditor) {
        this.imageEditor = new ImageEditor('#image-tab');
    }
    this.imageEditor.activate();
}
```

---

## 8. 验收标准

- [x] 选项卡界面显示正常，两个选项卡可见
- [x] 点击选项卡可以切换编辑器视图
- [x] Tilemap 编辑器在地图编辑选项卡中正常工作
- [x] 图片编辑选项卡显示占位符（待开发）
- [x] 样式与全局主题保持一致
- [x] 响应式设计在移动端正常工作
- [x] 选项卡切换有平滑的动画效果
- [x] 没有 JavaScript 错误或警告

