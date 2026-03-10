# Change: 添加游戏类型选择门户 - 按需轻量化编辑器

## Why

当前 Unity 编辑器是一个全功能的重型编辑器，所有用户都需要加载完整的 3D 引擎、物理系统等模块。这导致：
- 2D 策略游戏开发者需要加载不必要的 3D 功能（加重首屏负担）
- 2D 恶魔城/RPG 开发者加载 3D 射击游戏不需要的模块
- 初始加载时间过长，用户体验欠佳
- 服务器资源被浪费在不必要的功能上

通过创建**游戏类型选择门户**，用户先选择游戏类型，再进入对应的轻量化编辑器，可以：
- 首屏加载时间从 ~1s 缩短到 ~300-500ms
- 编辑器初始内存占用减少 40-60%
- 为不同游戏类型提供针对性的工具和功能
- 支持后续的类型化特性开发（如 2D 的骨骼动画、3D 的光照系统等）

## What Changes

- **新增游戏选择入口** - `/create-game/unity` 改为游戏类型选择门户（卡片式 UI）
- **轻量化 2D 编辑器** - 共享 Canvas 2D 引擎而非 Three.js，集成 2D 特定工具
  - 2D 策略战棋编辑器 - 包含网格、寻路、战斗预览
  - 2D 恶魔城编辑器 - 包含层级系统、碰撞体编辑
  - 2D RPG 编辑器 - 包含 NPC、对话、任务系统
- **优化 3D 编辑器** - `/create-game/unity/3d-shooter` - 射击游戏特定功能
- **路由扩展** - 新增路由: `/create-game/unity/2d-strategy`, `/create-game/unity/2d-metroidvania`, `/create-game/unity/2d-rpg`, `/create-game/unity/3d-shooter`
- **后端 API 扩展** - 支持按游戏类型存储和检索数据
- **懒加载优化** - 不同编辑器的模块按类型隔离，按需加载

## Impact

- **Affected specs**:
  - `game-portal` (新)
  - `2d-editor-lite` (新)
  - `3d-editor-lite` (修改，精简原有 Unity 编辑器)
  - `game-management` (修改，扩展游戏类型支持)
  - `homepage-portal` (修改，集成新的游戏入口)

- **Affected code**:
  - `openspec/specs/game-portal/spec.md` (新)
  - `openspec/specs/2d-editor-lite/spec.md` (新)
  - `openspec/specs/3d-editor-lite/spec.md` (新)
  - `openspec/specs/game-management/spec.md` (修改)
  - `src/main/java/com/example/writemyself/controller/UnityController.java` (修改 - 添加类型路由)
  - `src/main/java/com/example/writemyself/service/UnityService.java` (修改 - 类型化数据管理)
  - `src/main/resources/templates/create-game-unity.html` (修改 - 改为选择门户)
  - `src/main/resources/templates/create-game-2d-strategy.html` (新)
  - `src/main/resources/templates/create-game-2d-metroidvania.html` (新)
  - `src/main/resources/templates/create-game-2d-rpg.html` (新)
  - `src/main/resources/templates/create-game-3d-shooter.html` (新)
  - `src/main/resources/static/js/unity-editor/` (新增编辑器分类目录)

