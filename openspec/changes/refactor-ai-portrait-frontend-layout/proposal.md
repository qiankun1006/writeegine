# 提案：重构 AI 人物立绘生成器前端布局

## Why

当前 AI 人物立绘生成器的前端页面布局采用多栏响应式设计，但需要简化为更直观的双栏布局，以降低交互复杂度，提升用户体验。用户需要一个**简洁清晰的界面**，左侧集中管理所有参数配置，右侧专注展示生成结果。这样的设计能够：
- 改善用户操作流程，参数调整和结果查看井然有序
- 降低学习成本，新用户能快速上手
- 优化 PC 端体验（最小宽度 1200px），充分利用屏幕空间
- 为后续功能扩展预留接口（如历史记录、快捷预设等）

## What Changes

- **布局重构**：从响应式三栏/四栏布局改为**左右分栏布局**，左侧固定 380px，右侧自适应
- **左侧控制区模块化**：整合为三个清晰模块（提示词、参考图片、参数配置），支持模块折叠
- **右侧预览区优化**：占剩余宽度，上方预览（90%），下方操作按钮（10%）
- **样式统一**：使用 Element Plus 组件库，主色调 #409EFF，圆角 8px，浅灰/纯白配色
- **交互升级**：参数模块默认折叠，支持展开/收起；图片上传实时显示缩略图；生成按钮显示加载状态
- **代码现代化**：统一采用 Vue 3 `<script setup>` 语法，ElementPlus 组件库集成

## Impact

- **Affected specs**: `ai-portrait-generator`
- **Affected code**:
  - `src/main/resources/static/ai-portrait-generator/src/App.vue` - 根组件布局调整
  - `src/main/resources/static/ai-portrait-generator/src/components/CoreParamsPanel.vue` - 新增/重构提示词模块
  - `src/main/resources/static/ai-portrait-generator/src/components/ReferenceImageUpload.vue` - 参考图片上传组件（可能新增）
  - `src/main/resources/static/ai-portrait-generator/src/components/AdvancedParamsPanel.vue` - 折叠参数配置模块
  - `src/main/resources/static/ai-portrait-generator/src/components/ResultsPanel.vue` - 结果展示区优化
  - `src/main/resources/static/ai-portrait-generator/src/styles/theme.scss` - 样式变量调整（颜色、间距等）

