# 提案：扩展创作游戏页面 - 添加图片编辑功能入口

## Why

目前创作游戏页面仅包含 Tilemap 编辑器用于地图编辑。游戏开发通常还需要编辑游戏图片/精灵图等资源。我们需要在创作游戏页面中添加图片编辑功能的入口，建立一个统一的游戏编辑中心，让用户可以在同一个页面中管理地图和图片资源。

## What Changes

- 改造现有的 `create-game.html` 页面结构，使用选项卡（Tab）或分离容器的方式管理两个编辑器
- 保留现有的 Tilemap 编辑器功能
- 新增图片编辑器的入口和容器（具体实现后续进行）
- 更新 CSS 样式以支持多编辑器布局
- 更新 JavaScript 交互逻辑以管理编辑器切换

## Impact

Affected specs:
- [Editor Container Layout](./specs/editor-layout/spec.md) - 编辑器容器布局和切换机制
- [Image Editor Entry](./specs/image-editor-entry/spec.md) - 图片编辑功能入口

Affected code:
- `src/main/resources/templates/create-game.html` (改造)
- `src/main/resources/static/css/game-creation.css` (扩展)
- `src/main/resources/static/js/game-creation.js` (扩展)

