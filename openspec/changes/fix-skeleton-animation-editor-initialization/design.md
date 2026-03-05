# 骨骼动画编辑器初始化问题 - 技术设计

## 问题诊断

### 问题 0️⃣：脚本导出时序问题 ⚠️ **实际导致页面空白的直接原因**

**症状**：
```
character-frame-sequence:25 ❌ initFrameSequenceEditor 函数未找到，请检查 FrameSequenceEditor.js 是否正确加载
```

**原因**：
`FrameSequenceEditor.js` 使用 IIFE 包装，并在 `DOMContentLoaded` 事件监听器中导出函数。但当 DOM 已经加载完成时，`document.readyState !== 'loading'`，脚本会尝试立即导出，但此时 `character-frame-sequence.html` 的初始化脚本也在同一时刻运行，导致时序冲突。

**正确做法**：
立即导出函数到全局作用域，不要等待 `DOMContentLoaded` 事件。

### 问题 1️⃣：GameAssetCreatorApp 在错误页面初始化

**症状**：
```
Uncaught TypeError: Cannot read properties of null (reading 'classList')
  at GameAssetCreatorApp.loadWelcomePanel (app.js:122:49)
```

**原因**：
`app.js` 在末尾无条件地创建 `GameAssetCreatorApp` 实例，但这个类期望存在 `welcome-panel` 元素。在 `character-frame-sequence.html` 页面中不存在这个元素，导致 `document.getElementById('welcome-panel')` 返回 null，随后的 `.classList` 访问抛出错误。

**正确做法**：
在初始化前检查必要的 DOM 元素是否存在：
```javascript
if (document.getElementById('welcome-panel')) {
    window.app = new GameAssetCreatorApp();
}
```

### 问题 2️⃣：Thymeleaf Layout Fragment 脚本加载问题

**症状**：
```html
<!-- character-frame-sequence.html -->
<div layout:fragment="content">
    <script th:src="@{/static/js/skeleton-animation/SkeletonAnimationEditor.js}"></script>  <!-- ❌ 被过滤 -->
    <script>
        // 这段代码也不会执行
    </script>
</div>
```

**原因**：
Thymeleaf Layout Dialect 会自动过滤 `layout:fragment` 内部的 `<script>` 标签。这是为了防止脚本重复加载和执行顺序混乱。

**验证**：
根据 `project.md` 中的记录（第 153-202 行）：
> 在 `create-game-asset.html` 中添加的 `<script>` 标签在 `<div layout:fragment="content">` 内部时，**脚本代码根本不会被执行**。

**解决方案**：
所有脚本应该在 `layout.html` 的 `<body>` 末尾加载，这样所有使用该 layout 的页面都会自动加载这些脚本。

### 问题 3️⃣：脚本路径错误

**错误的引用**：
```html
<script th:src="@{/static/js/skeleton-animation/SkeletonAnimationEditor.js}"></script>
```

**实际位置**：
```
/static/js/image-editor/skeleton/ui/SkeletonAnimationEditor.js
```

**根本原因**：
页面作者引用了错误的路径。即使路径正确，脚本也不会被加载（因为问题 2️⃣）。

### 问题 4️⃣：初始化接口不匹配

**当前代码**（错误）：
```javascript
const container = document.getElementById('skeleton-animation-editor');
if (container && typeof SkeletonAnimationEditor !== 'undefined') {
    skeletonEditor = new SkeletonAnimationEditor(container);  // ❌ 错误参数
    skeletonEditor.init();
}
```

**SkeletonAnimationEditor 的实际接口**：
```javascript
class SkeletonAnimationEditor {
  constructor(imageEditor) {  // 期望 imageEditor 对象，不是 DOM 容器
    this.imageEditor = imageEditor;
    // ...
  }

  init() {
    // 创建内部面板容器
    this._createPanelContainer();
    // ...
  }
}
```

**正确做法**：
按照 `FrameSequenceEditor.js` 中的模式，创建 `ImageEditorAdapter` 并传递给 `SkeletonAnimationEditor`：
```javascript
const adapter = new ImageEditorAdapter(null);
window.skeletonEditor = new SkeletonAnimationEditor(adapter);
skeletonEditor.init();
```

## 现有解决方案分析

### FrameSequenceEditor.js 的正确实现

`src/main/resources/static/js/game-asset-creator/FrameSequenceEditor.js` 中已经实现了正确的初始化模式：

```javascript
function initFrameSequenceEditor() {
    console.log('🎬 初始化骨骼动画帧序列编辑器...');

    // 检查必要的类
    if (typeof SkeletonAnimationEditor === 'undefined') {
        console.error('❌ SkeletonAnimationEditor 类未找到...');
        return;
    }

    // 检查容器
    const container = document.getElementById('skeleton-animation-editor');
    if (!container) {
        console.error('❌ 骨骼动画编辑器容器不存在');
        return;
    }

    // 创建适配器
    const adapter = new ImageEditorAdapter(null);

    // 创建编辑器实例
    try {
        window.skeletonEditor = new SkeletonAnimationEditor(adapter);

        // 自定义 _createPanelContainer 方法
        window.skeletonEditor._createPanelContainer = function() {
            this.panelContainer = container;
            // 创建完整的 UI 结构...
        };

        // 初始化
        window.skeletonEditor.init();
    } catch (error) {
        console.error('编辑器初始化失败:', error);
    }
}
```

## 修复方案

### 步骤 1：清理 character-frame-sequence.html

**移除错误的脚本标签**（行 89-111）：
```html
<!-- ❌ 删除这些行 -->
<script th:src="@{/static/js/skeleton-animation/SkeletonAnimationEditor.js}"></script>
<script>
    let skeletonEditor = null;
    window.addEventListener('load', function() {
        // ...
    });
    function saveAsset() { ... }
</script>
```

**保留的内容**（只保留 fragment 和 HTML 结构）：
```html
<div layout:fragment="content">
    <div class="editor-wrapper">
        <!-- 头部 -->
        <div class="editor-header">
            <h1>🎬 动画帧序列编辑</h1>
            <div class="header-buttons">
                <button class="save-button" onclick="saveAsset()">💾 保存</button>
                <a href="/create-game/asset" class="back-button">← 返回</a>
            </div>
        </div>

        <!-- 编辑器容器 -->
        <div class="editor-container">
            <div class="skeleton-animation-editor" id="skeleton-animation-editor">
                <!-- 骨骼动画编辑器将由 JS 动态初始化 -->
            </div>
        </div>
    </div>
</div>
```

### 步骤 2：添加全局初始化函数

在 `layout.html` 中已加载的 `FrameSequenceEditor.js` 提供了 `initFrameSequenceEditor()` 函数。

### 步骤 3：在页面加载时调用初始化

创建一个新的初始化脚本文件或在 `layout.html` 中添加初始化逻辑。

**选项 A**：在 `layout.html` 中添加初始化钩子

```html
<!-- layout.html 中的最后 -->
<script>
    // 在所有脚本加载完成后初始化骨骼动画编辑器
    document.addEventListener('DOMContentLoaded', () => {
        // 检查当前页面是否为骨骼动画编辑器页面
        const container = document.getElementById('skeleton-animation-editor');
        if (container && typeof initFrameSequenceEditor === 'function') {
            console.log('🎬 初始化骨骼动画编辑器页面...');
            initFrameSequenceEditor();
        }
    });
</script>
```

**选项 B**：创建专门的初始化脚本

在 `character-frame-sequence.html` 的 `<head>` 中添加内联脚本（会在页面加载时执行）：

```html
<head>
    <!-- ... -->
    <script>
        // 在 DOM 构建完成后初始化骨骼动画编辑器
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof initFrameSequenceEditor === 'function') {
                console.log('🎬 初始化骨骼动画编辑器页面...');
                initFrameSequenceEditor();
            } else {
                console.error('❌ initFrameSequenceEditor 函数未找到');
            }
        });

        // 全局保存函数
        window.saveAsset = function() {
            if (window.skeletonEditor) {
                window.skeletonEditor.save();
                alert('动画已保存！');
            } else {
                alert('编辑器还在加载中，请稍候...');
            }
        };
    </script>
</head>
```

### 步骤 4：验证脚本加载顺序

`layout.html` 中的脚本加载顺序（第 49-66 行）：
1. 核心系统脚本（Matrix2D.js → Skeleton.js）
2. UI 组件脚本（BoneHierarchyPanel.js → SkeletonAnimationEditor.js）
3. 工具脚本（BoneEditTool.js）
4. 初始化脚本（init.js、FrameSequenceEditor.js）

## 故障排除

### 调试检查清单

1. **脚本加载检查**：
   ```javascript
   console.log('Matrix2D:', typeof Matrix2D);
   console.log('Bone:', typeof Bone);
   console.log('SkeletonAnimationEditor:', typeof SkeletonAnimationEditor);
   console.log('FrameSequenceEditor:', typeof initFrameSequenceEditor);
   ```

2. **容器检查**：
   ```javascript
   console.log('Container:', document.getElementById('skeleton-animation-editor'));
   ```

3. **初始化检查**：
   ```javascript
   console.log('Editor instance:', window.skeletonEditor);
   ```

### 常见问题

| 症状 | 原因 | 解决方案 |
|------|------|--------|
| 脚本未加载 | Thymeleaf 过滤 | 在 layout.html 中加载 |
| SkeletonAnimationEditor is not defined | 脚本路径错误或顺序错误 | 检查 layout.html 中的脚本路径和顺序 |
| Container not found | HTML 结构错误 | 确保 `<div id="skeleton-animation-editor">` 存在 |
| Editor appears blank | 初始化失败 | 查看浏览器控制台的错误信息 |

## 相关文档

- `project.md` - Thymeleaf Layout Fragment 问题记录（第 153-202 行）
- `IMPLEMENTATION_SUMMARY.md` - 骨骼动画系统实现总结
- `FrameSequenceEditor.js` - 正确的初始化模式参考

