# Change: 添加游戏进度条组件

## Why
当前游戏素材创作系统缺少统一的进度反馈组件，用户在进行素材生成、AI立绘生成、地图生成等耗时操作时，无法直观地了解操作进度和状态。为提升用户体验和提供专业的游戏UI组件，需要开发一个多风格、可配置的进度条组件，集成到 `/create-game/asset` 页面中。

## What Changes
- 基于 Vue3 + Composition API 开发独立的进度条组件 `ProgressBar.vue`
- 支持6种游戏场景常用进度条效果：极简纯色款、游戏血条款、能量条款、加载进度款、复古像素款、玻璃拟态款
- 提供血条专属编辑能力，支持拖拽滑块和数值输入两种编辑方式
- 集成到 `/create-game/asset` 页面，作为新的功能块展示
- 提供完整的API文档和使用示例
- 支持响应式设计，适配PC端和平板端

## Impact
- Affected specs: ui-components (新增), game-asset-creator (修改)
- Affected code:
  - `src/main/resources/static/ai-portrait-generator/src/components/ProgressBar.vue` (新组件)
  - `src/main/resources/static/ai-portrait-generator/src/App.vue` (集成示例)
  - `src/main/resources/templates/create-game-asset-portal.html` (添加进度条功能块)
  - `src/main/resources/static/ai-portrait-generator/package.json` (如有需要，添加依赖)
  - `src/main/java/com/example/writemyself/controller/GameAssetController.java` (添加进度条相关API)

