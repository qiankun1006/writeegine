# Change: 实现游戏UI进度条组件

## Why
游戏素材创作系统需要丰富多样的UI组件来支持游戏开发。进度条是游戏UI中常见的组件，用于显示血量、能量、加载进度等。当前系统缺少一个功能完整、样式多样的进度条组件，无法满足游戏开发中对不同风格进度条的需求。

## What Changes
- 实现基于Vue3 + Composition API的进度条组件，支持6种游戏场景常用效果
- 创建独立的进度条演示页面（`/create-game/asset/progress-bar-demo`），不修改现有页面逻辑
- 通过新页面展示所有效果并提供参数调整功能，保持现有`/create-game/asset`页面不变
- 提供完整的API文档和使用示例
- 支持进度条样式的保存和加载

## Impact
- Affected specs: ui-components (实现现有规范)
- Affected code:
  - 前端：`src/main/resources/static/ui-components/`（新目录，不影响现有代码）
  - 页面：`/create-game/asset/progress-bar-demo`（全新独立页面）
  - 集成：通过新页面链接访问，不修改现有`create-game-asset.html`的菜单逻辑
- **重要保证**：不修改现有的`/create-game/asset`页面HTML结构、JavaScript逻辑和面板切换机制

