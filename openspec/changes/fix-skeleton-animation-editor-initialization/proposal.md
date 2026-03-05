# Change: 修复【动画帧序列编辑】页面骨骼动画编辑器初始化问题

## Why
【动画帧序列编辑】页面（`character-frame-sequence.html`）在浏览器中显示为空白，用户无法使用骨骼动画编辑器。这个问题的根本原因是：
1. **脚本路径错误**：页面中引用了不存在的路径 `/static/js/skeleton-animation/SkeletonAnimationEditor.js`，而实际脚本在 `/static/js/image-editor/skeleton/ui/SkeletonAnimationEditor.js`
2. **Thymeleaf Layout Fragment 脚本加载问题**：在 `layout:fragment="content"` 内部写 `<script>` 标签会被 Thymeleaf Layout Dialect 过滤剥离，代码根本不会执行
3. **初始化时序问题**：页面中的初始化代码尝试直接将 `SkeletonAnimationEditor` 实例化为容器 `div`，但 `SkeletonAnimationEditor` 类的设计是期望一个 ImageEditor 适配器对象，而不是 DOM 元素

这些问题共同导致编辑器无法初始化，页面显示为空白。

## What Changes
- **修复脚本加载**：移除 fragment 内部的 script 标签，所有脚本已在 `layout.html` 中正确加载
- **修复初始化逻辑**：页面的初始化代码应该调用正确的初始化流程
- **检查并完善 FrameSequenceEditor.js**：确保该文件中的初始化函数能够正确处理页面加载
- **添加错误诊断日志**：在初始化过程中添加清晰的日志，帮助调试初始化问题

## Impact
- Affected specs: [skeleton-animation-core, skeleton-animation-ui]
- Affected code: [src/main/resources/templates/asset-editors/character-frame-sequence.html, src/main/resources/static/js/game-asset-creator/FrameSequenceEditor.js]

