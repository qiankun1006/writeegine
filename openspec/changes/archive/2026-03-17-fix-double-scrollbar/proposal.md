# 移除 AI 立绘生成器页面中的重复滚动条

## Why

character-portrait.html 页面中，左侧的参数面板（第 1 个核心参数面板和第 3 个高级参数面板）存在双层滚动条问题。这是由于 CSS 的 `overflow-y: auto` 样式被重复应用，导致：
- 用户体验不佳，视觉上混乱
- 实际只需要一个滚动条
- 这是常见的 CSS 嵌套 overflow 问题

## What Changes

### 主要修改点

1. **App.vue** - 检查并移除多余的 overflow 属性
   - `.core-params-panel` 容器：当前有 `overflow-y: auto`
   - `.advanced-params-panel` 容器：当前有 `overflow-y: auto`
   - `.model-selection-panel` 容器：当前有 `overflow-y: auto`

2. **各面板组件**（CoreParamsPanel.vue、AdvancedParamsPanel.vue、ModelSelectionPanel.vue）
   - 检查是否有额外的 overflow 样式
   - 确保内容区域不重复设置 overflow

### 修改策略

- 保留外层容器的 `overflow-y: auto`（App.vue 中的 aside 元素）
- 移除内层组件内的重复 overflow 样式
- 确保内容能正常滚动，不破坏功能

## Impact

**Affected specs**: character-portrait-layout

**Affected code**:
- `src/main/resources/static/ai-portrait-generator/src/App.vue`
- `src/main/resources/static/ai-portrait-generator/src/components/CoreParamsPanel.vue`
- `src/main/resources/static/ai-portrait-generator/src/components/AdvancedParamsPanel.vue`
- `src/main/resources/static/ai-portrait-generator/src/components/ModelSelectionPanel.vue`

