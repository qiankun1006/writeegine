# 编辑器 UX 优化：布局、视觉和交互改进

## Why

当前 Tilemap 编辑器虽然功能完整，但在视觉设计和用户体验方面还有改进空间：
- 画布区域相对较小，不利于精细编辑
- 当前选中模块可能遮挡画布内容
- 提示文案不够友好，缺乏游戏编辑器的专业感
- 整体视觉风格偏普通网页，不符合 toC 页面的科技感需求

这个提案旨在通过布局优化、视觉升级和交互改进，让编辑器成为一个专业、美观、易用的 toC 产品。

## What Changes

### 1. 画布优化和排版调整
- 扩大画布显示区域（调整布局比例）
- 优化工具栏布局，使其更紧凑
- 信息栏和提示栏优化显示

### 2. 当前选中模块重定位
- 将【当前选中】模块从画布右上角浮动改为固定在右侧面板顶部
- 防止遮挡画布核心内容

### 3. 友好的交互提示
- 切换画布大小时显示确认对话框，提示变化说明
- 清空画布时显示更友好的警告提示
- 操作反馈更加清晰和人性化

### 4. 游戏引擎科技感视觉设计
- 页面背景改为深色主题（科技感）
- 使用渐变色、阴影、高亮等设计元素
- 按钮、控件优化为现代 UI 风格
- 整体配色更加专业和高端

## Impact

**Affected specs:**
- `canvas-optimization` - 画布和布局优化
- `game-engine-theme` - 游戏引擎科技感主题
- `ui-feedback` - 交互反馈和提示改进

**Affected code:**
- `src/main/resources/templates/tilemap-editor.html` - 布局调整
- `src/main/resources/static/css/tilemap-editor.css` - 视觉设计和主题
- `src/main/resources/static/js/tilemap-editor.js` - 交互提示优化
- `src/main/resources/templates/layout.html` - 全局背景样式（可选）

