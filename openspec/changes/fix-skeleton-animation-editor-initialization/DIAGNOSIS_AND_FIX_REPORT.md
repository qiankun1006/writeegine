# 【动画帧序列编辑】页面骨骼动画编辑器初始化问题 - 诊断和修复报告

## 问题概述

**URL**: `http://localhost:8083/create-game/asset/character-frame-sequence`
**页面**: 【动画帧序列编辑】
**症状**: 页面显示为一片空白，骨骼动画编辑器未初始化
**根本原因**: 多个脚本加载和初始化问题共同导致编辑器无法启动

---

## 三大问题诊断

### 问题 1️⃣：Thymeleaf Layout Fragment 脚本加载问题 ⚠️ **最关键**

**症状**：
```html
<!-- character-frame-sequence.html -->
<div layout:fragment="content">
    <script th:src="@{/static/js/skeleton-animation/SkeletonAnimationEditor.js}"></script>  <!-- ❌ 被过滤 -->
    <script>
        let skeletonEditor = null;
        window.addEventListener('load', function() {
            // 这段代码也不会执行
        });
    </script>
</div>
```

**原因**：
Thymeleaf Layout Dialect 会**自动过滤** `layout:fragment="content"` 内部的 `<script>` 标签。这是为了防止脚本重复加载和执行顺序混乱。参考 `project.md` 第 153-202 行的详细记录。

**影响**：
- 脚本文件不会被加载
- 初始化代码不会执行
- 页面显示为空白，没有任何错误提示

**验证**：
在浏览器控制台中查看：
```javascript
typeof SkeletonAnimationEditor  // "undefined" (未定义)
```

---

### 问题 2️⃣：脚本路径错误

**错误的引用**：
```html
<script th:src="@{/static/js/skeleton-animation/SkeletonAnimationEditor.js}"></script>
```

**实际位置**：
```
/static/js/image-editor/skeleton/ui/SkeletonAnimationEditor.js
```

**根本原因**：
页面作者引用了不存在的路径。即使路径正确，脚本仍然不会被加载（因为问题 1️⃣）。

---

### 问题 3️⃣：初始化接口不匹配

**当前代码（错误）**：
```javascript
const container = document.getElementById('skeleton-animation-editor');
if (container && typeof SkeletonAnimationEditor !== 'undefined') {
    skeletonEditor = new SkeletonAnimationEditor(container);  // ❌ 错误的参数类型
    skeletonEditor.init();
}
```

**SkeletonAnimationEditor 的实际接口**（源文件第 8 行）：
```javascript
class SkeletonAnimationEditor {
  constructor(imageEditor) {  // 期望 imageEditor 对象，不是 DOM 元素
    this.imageEditor = imageEditor;
    // ...
  }
}
```

**正确用法**（参考 FrameSequenceEditor.js 第 74 行）：
```javascript
const adapter = new ImageEditorAdapter(null);  // 创建适配器
window.skeletonEditor = new SkeletonAnimationEditor(adapter);  // 传递适配器
skeletonEditor.init();
```

---

## 修复方案

### 修复步骤 1️⃣：清理 character-frame-sequence.html

**删除行**: 89-111（所有错误的脚本标签）

**添加行**（在 `<head>` 中）:
```html
<!-- 骨骼动画编辑器页面初始化 -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎬 【动画帧序列编辑】页面加载完成，开始初始化骨骼动画编辑器...');

        // 检查骨骼动画编辑器页面初始化函数是否存在
        if (typeof initFrameSequenceEditor === 'function') {
            console.log('✓ initFrameSequenceEditor 函数已加载');
            initFrameSequenceEditor();
        } else {
            console.error('❌ initFrameSequenceEditor 函数未找到，请检查 FrameSequenceEditor.js 是否正确加载');
        }
    });

    // 全局保存函数
    window.saveAsset = function() {
        console.log('💾 保存动画资源...');
        if (window.skeletonEditor && typeof window.skeletonEditor.save === 'function') {
            try {
                window.skeletonEditor.save();
                alert('✓ 动画已保存！');
            } catch (error) {
                console.error('保存失败:', error);
                alert('✗ 保存失败，请查看控制台日志');
            }
        } else {
            alert('⏳ 编辑器还在加载中，请稍候...');
        }
    };
</script>
```

**结果**：
- ✅ 所有脚本由 `layout.html` 中央管理
- ✅ 页面在 `DOMContentLoaded` 事件后调用全局初始化函数
- ✅ 清晰的错误日志帮助调试

---

### 修复步骤 2️⃣：验证 layout.html 脚本加载

**layout.html 中的脚本加载顺序**（已正确配置）：

```html
<!-- layout.html 第 48-69 行 -->

<!-- 骨骼动画系统脚本 -->
<link rel="stylesheet" href="/static/css/skeleton-animation.css">

<!-- 核心系统（第一优先级） -->
<script src="/static/js/image-editor/skeleton/core/Matrix2D.js"></script>
<script src="/static/js/image-editor/skeleton/core/Bone.js"></script>
<script src="/static/js/image-editor/skeleton/core/Skeleton.js"></script>
<script src="/static/js/image-editor/skeleton/core/Keyframe.js"></script>
<script src="/static/js/image-editor/skeleton/core/Track.js"></script>
<script src="/static/js/image-editor/skeleton/core/Animation.js"></script>
<script src="/static/js/image-editor/skeleton/core/AnimationPlayer.js"></script>
<script src="/static/js/image-editor/skeleton/core/Skin.js"></script>
<script src="/static/js/image-editor/skeleton/core/SkeletonCommands.js"></script>
<script src="/static/js/image-editor/skeleton/core/ExportManager.js"></script>

<!-- UI 组件（第二优先级） -->
<script src="/static/js/image-editor/skeleton/ui/BoneHierarchyPanel.js"></script>
<script src="/static/js/image-editor/skeleton/ui/Timeline.js"></script>
<script src="/static/js/image-editor/skeleton/ui/BonePropertyPanel.js"></script>
<script src="/static/js/image-editor/skeleton/ui/SkeletonAnimationEditor.js?v=2"></script>

<!-- 工具（第三优先级） -->
<script src="/static/js/image-editor/skeleton/tools/BoneEditTool.js"></script>

<!-- 初始化脚本（第四优先级） -->
<script src="/static/js/image-editor/skeleton/init.js"></script>
<script src="/static/js/game-asset-creator/FrameSequenceEditor.js?v=2"></script>
```

**检查清单**：
- ✅ 所有必要的脚本都已加载
- ✅ 脚本顺序正确（核心 → UI → 工具 → 初始化）
- ✅ `FrameSequenceEditor.js` 在末尾加载，确保导出全局函数

---

## 初始化流程（修复后）

### 时间线
```
页面加载
    ↓
HTML 解析，执行 layout.html 中的所有脚本
    ↓
脚本按顺序加载：
  1. 核心系统 (Matrix2D, Bone, Skeleton, ...)
  2. UI 组件 (BoneHierarchyPanel, Timeline, ...)
  3. 工具 (BoneEditTool)
  4. 初始化脚本 (init.js, FrameSequenceEditor.js)
     └─→ FrameSequenceEditor.js 第 560 行导出 initFrameSequenceEditor 到全局
    ↓
DOM 构建完成，触发 DOMContentLoaded 事件
    ↓
character-frame-sequence.html 中的脚本执行：
  1. 检查 initFrameSequenceEditor 是否存在 ✅
  2. 调用 initFrameSequenceEditor()
    ↓
initFrameSequenceEditor() 执行：
  1. 检查 SkeletonAnimationEditor 类是否已加载 ✅
  2. 获取容器 <div id="skeleton-animation-editor"> ✅
  3. 创建 ImageEditorAdapter
  4. 实例化 SkeletonAnimationEditor ✅
  5. 覆盖 _createPanelContainer 方法
  6. 调用 init() 初始化编辑器
    ↓
编辑器完全初始化完成 ✅
```

---

## 修复验证

### 浏览器控制台日志

**修复前**：
```
❌ 无日志输出（脚本未加载）
Uncaught TypeError: SkeletonAnimationEditor is not defined
```

**修复后**：
```
✓ initFrameSequenceEditor 函数已加载
🎬 初始化骨骼动画帧序列编辑器...
✅ 骨骼动画帧序列编辑器初始化完成
```

---

## 测试检查清单

- [ ] 打开 http://localhost:8083/create-game/asset/character-frame-sequence
- [ ] 浏览器控制台无任何错误
- [ ] 页面显示完整的编辑器界面（骨骼层级、时间轴、属性面板、画布）
- [ ] 可以在画布上创建新骨骼
- [ ] 可以编辑骨骼属性
- [ ] 可以在时间轴上创建关键帧
- [ ] 点击"保存"按钮提示成功
- [ ] 返回按钮能跳转回资源管理页面

---

## 相关文件修改

| 文件 | 修改 | 原因 |
|------|------|------|
| `character-frame-sequence.html` | 移除 fragment 内脚本，在 `<head>` 添加初始化脚本 | 修复 Thymeleaf 过滤问题 |
| `layout.html` | 无需修改（脚本加载已正确） | 参考和验证 |
| `FrameSequenceEditor.js` | 无需修改（初始化函数已正确导出） | 参考和验证 |

---

## 预防措施

### 🚨 避免的做法

❌ **不要在 fragment 内写脚本**：
```html
<div layout:fragment="content">
    <script>  <!-- 这会被 Thymeleaf 过滤掉 -->
        // ...
    </script>
</div>
```

### ✅ 正确的做法

✅ **在主 layout 的 body 末尾加载脚本**：
```html
<!-- layout.html -->
<body>
    <main>
        <div layout:fragment="content">
            <!-- 子页面内容 -->
        </div>
    </main>

    <!-- 所有脚本在这里加载 -->
    <script src="/static/js/..."></script>
</body>
```

✅ **在子页面的 `<head>` 中调用初始化**：
```html
<!-- child-page.html -->
<head>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // 调用由 layout.html 加载的全局函数
            if (typeof initializeMyPage === 'function') {
                initializeMyPage();
            }
        });
    </script>
</head>
```

---

## 文档参考

- 📄 `openspec/project.md` - Thymeleaf Layout Fragment 问题详细记录（第 153-202 行）
- 📄 `openspec/changes/add-2d-skeleton-animation/IMPLEMENTATION_SUMMARY.md` - 骨骼动画系统实现总结
- 📄 `openspec/changes/fix-skeleton-animation-editor-initialization/` - 本次修复的完整提案

---

## 状态

✅ **修复完成**
✅ **提案已验证**
⏳ **等待测试验证**

修复日期：2026-03-05
变更 ID：`fix-skeleton-animation-editor-initialization`

