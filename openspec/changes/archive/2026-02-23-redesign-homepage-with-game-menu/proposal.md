# 提案：重构主页为游戏创作平台门户

## Why

当前主页展示的是通用的Web应用示例内容，不符合WriteMyself作为游戏创作平台的定位。需要重构主页为一个专业的游戏创作平台门户，提供三个核心功能入口：

1. **创作游戏** - 进入Tilemap编辑器进行游戏地图编辑
2. **我的游戏** - 查看用户创建的所有游戏列表
3. **游戏广场** - 浏览和发现社区分享的游戏

这样能够建立清晰的用户使用流程，并将Tilemap编辑器定位为创作游戏的一个功能模块而非独立工具。

## What Changes

- 重构 `index.html`，将其改造为游戏平台门户首页
- 新增游戏菜单导航，包含三个主要入口卡片
- 优化页面样式，使用游戏编辑器的深色科技感主题
- 后端新增路由：`/create-game`（创作游戏）、`/my-games`（我的游戏）、`/game-plaza`（游戏广场）
- 新增三个对应的视图页面：`create-game.html`、`my-games.html`、`game-plaza.html`
- `/tilemap-editor` 路由改为在创作游戏页面中嵌入（子模块）

## Impact

Affected specs:
- [Homepage Portal](specs/homepage-portal/spec.md) - 主页门户UI和路由
- [Game Management](specs/game-management/spec.md) - 游戏管理功能（创建、查看、发布）
- [Editor Integration](specs/editor-integration/spec.md) - 编辑器与创作页面的集成

Affected code:
- `src/main/resources/templates/index.html` (完全重写)
- `src/main/resources/templates/create-game.html` (新建)
- `src/main/resources/templates/my-games.html` (新建)
- `src/main/resources/templates/game-plaza.html` (新建)
- `src/main/java/com/example/writemyself/controller/HomeController.java` (新增路由)
- `src/main/resources/static/css/homepage.css` (新建)
- `src/main/resources/static/js/homepage.js` (新建)

