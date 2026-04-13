# WriteMyself 前端页面结构全览

> 最后更新：2025-04-13
>
> **核心发现**：素材创作系统存在两套并行的前端架构（方案 A 和方案 B），用户访问的是方案 A（Portal 卡片页），但代码库中同时保留了方案 B（左侧选择框单页应用）的完整实现。

---

## 一、页面层级与跳转关系

```
/ (首页)
├── /create-game (游戏创作入口)
│   ├── /create-game/asset (素材创作 Portal)
│   │   ├── /create-game/asset/character-portrait     角色立绘
│   │   ├── /create-game/asset/character-sd           Q版/SD战棋
│   │   ├── /create-game/asset/character-animation    战斗动画
│   │   ├── /create-game/asset/character-frame-sequence  动画帧序列（骨骼动画）
│   │   ├── /create-game/asset/character-avatar       角色头像
│   │   ├── /create-game/asset/character-job          职业转职
│   │   ├── /create-game/asset/character-skill-icon   技能图标
│   │   ├── /create-game/asset/character-status-icon  状态图标
│   │   ├── /create-game/asset/map-grid               战棋网格地图
│   │   ├── /create-game/asset/map-terrain            地形
│   │   ├── /create-game/asset/map-obstacle           障碍物
│   │   ├── /create-game/asset/map-decoration         装饰物
│   │   ├── /create-game/asset/map-background         背景
│   │   ├── /create-game/asset/map-loading            加载图
│   │   ├── /create-game/asset/ui-layout-editor       UI布局编辑器 ★新增
│   │   ├── /create-game/asset/ui-main-menu           主菜单UI
│   │   ├── /create-game/asset/ui-level-select        关卡选择UI
│   │   ├── /create-game/asset/ui-dialog              剧情对话UI
│   │   ├── /create-game/asset/ui-battle-range        战斗范围UI
│   │   ├── /create-game/asset/ui-battle-hud          战斗HUD
│   │   ├── /create-game/asset/ui-character-panel     角色面板UI
│   │   ├── /create-game/asset/ui-inventory           背包UI
│   │   ├── /create-game/asset/ui-skill               技能UI
│   │   ├── /create-game/asset/ui-battle-result       战斗结算UI
│   │   ├── /create-game/asset/effect-movement        移动特效
│   │   ├── /create-game/asset/effect-attack          攻击特效
│   │   ├── /create-game/asset/effect-magic           魔法特效
│   │   ├── /create-game/asset/effect-heal            治愈特效
│   │   ├── /create-game/asset/effect-critical        暴击特效
│   │   ├── /create-game/asset/effect-status          状态特效
│   │   ├── /create-game/asset/effect-levelup         升级特效
│   │   ├── /create-game/asset/effect-trap            陷阱特效
│   │   ├── /create-game/asset/font-numbers           数字字体
│   │   ├── /create-game/asset/icon-button            按钮图标
│   │   ├── /create-game/asset/icon-job               职业图标
│   │   ├── /create-game/asset/icon-attribute         属性图标
│   │   ├── /create-game/asset/icon-quest             任务图标
│   │   ├── /create-game/asset/story-portrait         剧情立绘
│   │   ├── /create-game/asset/story-dialog-box       对话框
│   │   ├── /create-game/asset/story-transition       场景转场
│   │   ├── /create-game/asset/story-avatar           剧情头像
│   │   └── /create-game/asset/progress-bar-demo      进度条演示
│   ├── /create-game/tilemap   战棋地图编辑器（完整编辑器）
│   ├── /create-game/image     图片编辑器（Photoshop风格）
│   ├── /create-game/code      代码编辑器
│   └── /create-game/unity     Unity风格编辑器 Portal
│       ├── /create-game/unity/2d-strategy     2D策略游戏
│       ├── /create-game/unity/2d-rpg          2D RPG
│       ├── /create-game/unity/2d-metroidvania 2D银河恶魔城
│       └── /create-game/unity/3d-shooter      3D射击游戏
├── /particle-effect-editor    粒子效果编辑器（独立页面）
├── /tilemap-editor            地图编辑器（独立入口）
├── /my-games                  我的游戏
├── /game-plaza                游戏广场
├── /about                     关于
└── /e2e-test                  端到端测试页（开发用）
```

---

## 二、页面详情表

### 2.1 主导航页面

| 页面名称 | URL | 模板文件 | Controller | JS | CSS |
|---------|-----|---------|------------|-----|-----|
| 首页 | `/` | `index.html` | HomeController#home | `homepage.js` | `homepage.css` |
| 游戏创作入口 | `/create-game` | `create-game.html` | HomeController#createGame | `game-creation.js` | `game-creation.css` |
| 我的游戏 | `/my-games` | `my-games.html` | HomeController#myGames | `game-management.js` | `game-management.css` |
| 游戏广场 | `/game-plaza` | `game-plaza.html` | HomeController#gamePlaza | `game-plaza.js` | `game-plaza.css` |
| 关于 | `/about` | `about.html` | HomeController#about | — | — |

### 2.2 素材创作系统

#### 架构说明

素材创作系统有**两套并存的前端实现**：

**方案 A（当前对外展示）**：Portal 卡片页 + 独立路由页面
- `/create-game/asset` → `create-game-asset-portal.html`：仅展示 4 张入口卡片（角色立绘、动画帧序列、战棋地图、粒子编辑器）
- 点击卡片跳转到对应的独立 URL，每个页面是独立的 HTML 文件，加载不同的编辑器
- 例：角色立绘页加载 Vue 构建的 AI 立绘生成应用；动画帧序列页加载骨骼动画编辑器

**方案 B（历史遗留）**：左侧选择框 + 右侧工作区单页应用
- 模板文件：`create-game-asset.html`（无独立路由，通常仅在本地开发中直接访问）
- 包含左侧菜单（6 大分类+40+ 项功能）和右侧面板
- 所有编辑功能通过 `GameAssetCreatorApp.switchPanel(category)` 在前端切换面板显示/隐藏，**不做页面跳转**
- 共享 `game-asset-creator/app.js`

#### Portal 卡片页面（方案 A 展示入口）

| 页面名称 | URL | 模板文件 | Controller | 主要 JS | CSS |
|---------|-----|---------|------------|---------|-----|
| 素材创作 Portal | `/create-game/asset` | `create-game-asset-portal.html` | HomeController#createGameAsset | — | — |
| **UI布局编辑器** ★ | `/create-game/asset/ui-layout-editor` | `asset-editors/ui-layout-editor.html` | HomeController#createUILayoutEditor | `js/ui-layout-editor/app.js` | `css/ui-layout-editor.css` |
| 角色立绘 | `/create-game/asset/character-portrait` | `asset-editors/character-portrait.html` | HomeController#createCharacterPortrait | AI Portrait Vue App | — |
| 动画帧序列 | `/create-game/asset/character-frame-sequence` | `asset-editors/character-frame-sequence.html` | HomeController#createCharacterFrameSequence | `game-asset-creator/FrameSequenceEditor.js` + 骨骼动画系统 | `skeleton-animation.css` |
| 战棋网格地图 | `/create-game/asset/map-grid` | `asset-editors/map-grid.html` | HomeController#createMapGrid | `game-asset-creator/app.js` | `game-asset-creator.css` |

#### 其他 40+ 个功能页面（有 Controller 路由但 Portal 未展示入口）

⚠️ **说明**：以下页面均使用 `game-asset-creator/app.js` + `game-asset-creator.css`，属于**方案 B 的历史遗留**。虽然都有独立的 Controller 路由映射，但 Portal 卡片页没有展示这些入口链接。这些页面可通过直接访问 URL 打开，但在正常用户流中不可达。

| 页面名称 | URL | 模板文件 | Controller |
|---------|-----|---------|------------|
| Q版/SD战棋 | `/create-game/asset/character-sd` | `asset-editors/character-sd.html` | HomeController#createCharacterSD |
| 战斗动画 | `/create-game/asset/character-animation` | `asset-editors/character-animation.html` | HomeController#createCharacterAnimation | `game-asset-creator/app.js` | — |
| 角色头像 | `/create-game/asset/character-avatar` | `asset-editors/character-avatar.html` | HomeController#createCharacterAvatar | `game-asset-creator/app.js` | — |
| 职业转职 | `/create-game/asset/character-job` | `asset-editors/character-job.html` | HomeController#createCharacterJob | `game-asset-creator/app.js` | — |
| 技能图标 | `/create-game/asset/character-skill-icon` | `asset-editors/character-skill-icon.html` | HomeController#createCharacterSkillIcon | `game-asset-creator/app.js` | — |
| 状态图标 | `/create-game/asset/character-status-icon` | `asset-editors/character-status-icon.html` | HomeController#createCharacterStatusIcon | `game-asset-creator/app.js` | — |
| 地形 | `/create-game/asset/map-terrain` | `asset-editors/map-terrain.html` | HomeController#createMapTerrain | `game-asset-creator/app.js` | — |
| 障碍物 | `/create-game/asset/map-obstacle` | `asset-editors/map-obstacle.html` | HomeController#createMapObstacle | `game-asset-creator/app.js` | — |
| 装饰物 | `/create-game/asset/map-decoration` | `asset-editors/map-decoration.html` | HomeController#createMapDecoration | `game-asset-creator/app.js` | — |
| 背景 | `/create-game/asset/map-background` | `asset-editors/map-background.html` | HomeController#createMapBackground | `game-asset-creator/app.js` | — |
| 加载图 | `/create-game/asset/map-loading` | `asset-editors/map-loading.html` | HomeController#createMapLoading | `game-asset-creator/app.js` | — |
| 主菜单UI | `/create-game/asset/ui-main-menu` | `asset-editors/ui-main-menu.html` | HomeController#createUIMainMenu | `game-asset-creator/app.js` | — |
| 关卡选择UI | `/create-game/asset/ui-level-select` | `asset-editors/ui-level-select.html` | HomeController#createUILevelSelect | `game-asset-creator/app.js` | — |
| 剧情对话UI | `/create-game/asset/ui-dialog` | `asset-editors/ui-dialog.html` | HomeController#createUIDialog | `game-asset-creator/app.js` | — |
| 战斗范围UI | `/create-game/asset/ui-battle-range` | `asset-editors/ui-battle-range.html` | HomeController#createUIBattleRange | `game-asset-creator/app.js` | — |
| 战斗HUD | `/create-game/asset/ui-battle-hud` | `asset-editors/ui-battle-hud.html` | HomeController#createUIBattleHUD | `game-asset-creator/app.js` | — |
| 角色面板UI | `/create-game/asset/ui-character-panel` | `asset-editors/ui-character-panel.html` | HomeController#createUICharacterPanel | `game-asset-creator/app.js` | — |
| 背包UI | `/create-game/asset/ui-inventory` | `asset-editors/ui-inventory.html` | HomeController#createUIInventory | `game-asset-creator/app.js` | — |
| 技能UI | `/create-game/asset/ui-skill` | `asset-editors/ui-skill.html` | HomeController#createUISkill | `game-asset-creator/app.js` | — |
| 战斗结算UI | `/create-game/asset/ui-battle-result` | `asset-editors/ui-battle-result.html` | HomeController#createUIBattleResult | `game-asset-creator/app.js` | — |
| 移动特效 | `/create-game/asset/effect-movement` | `asset-editors/effect-movement.html` | HomeController#createEffectMovement | `game-asset-creator/app.js` | — |
| 攻击特效 | `/create-game/asset/effect-attack` | `asset-editors/effect-attack.html` | HomeController#createEffectAttack | `game-asset-creator/app.js` | — |
| 魔法特效 | `/create-game/asset/effect-magic` | `asset-editors/effect-magic.html` | HomeController#createEffectMagic | `game-asset-creator/app.js` | — |
| 治愈特效 | `/create-game/asset/effect-heal` | `asset-editors/effect-heal.html` | HomeController#createEffectHeal | `game-asset-creator/app.js` | — |
| 暴击特效 | `/create-game/asset/effect-critical` | `asset-editors/effect-critical.html` | HomeController#createEffectCritical | `game-asset-creator/app.js` | — |
| 状态特效 | `/create-game/asset/effect-status` | `asset-editors/effect-status.html` | HomeController#createEffectStatus | `game-asset-creator/app.js` | — |
| 升级特效 | `/create-game/asset/effect-levelup` | `asset-editors/effect-levelup.html` | HomeController#createEffectLevelup | `game-asset-creator/app.js` | — |
| 陷阱特效 | `/create-game/asset/effect-trap` | `asset-editors/effect-trap.html` | HomeController#createEffectTrap | `game-asset-creator/app.js` | — |
| 数字字体 | `/create-game/asset/font-numbers` | `asset-editors/font-numbers.html` | HomeController#createFontNumbers | `game-asset-creator/app.js` | — |
| 按钮图标 | `/create-game/asset/icon-button` | `asset-editors/icon-button.html` | HomeController#createIconButton | `game-asset-creator/app.js` | — |
| 职业图标 | `/create-game/asset/icon-job` | `asset-editors/icon-job.html` | HomeController#createIconJob | `game-asset-creator/app.js` | — |
| 属性图标 | `/create-game/asset/icon-attribute` | `asset-editors/icon-attribute.html` | HomeController#createIconAttribute | `game-asset-creator/app.js` | — |
| 任务图标 | `/create-game/asset/icon-quest` | `asset-editors/icon-quest.html` | HomeController#createIconQuest | `game-asset-creator/app.js` | — |
| 剧情立绘 | `/create-game/asset/story-portrait` | `asset-editors/story-portrait.html` | HomeController#createStoryPortrait | `game-asset-creator/app.js` | — |
| 对话框 | `/create-game/asset/story-dialog-box` | `asset-editors/story-dialog-box.html` | HomeController#createStoryDialogBox | `game-asset-creator/app.js` | — |
| 场景转场 | `/create-game/asset/story-transition` | `asset-editors/story-transition.html` | HomeController#createStoryTransition | `game-asset-creator/app.js` | — |
| 剧情头像 | `/create-game/asset/story-avatar` | `asset-editors/story-avatar.html` | HomeController#createStoryAvatar | `game-asset-creator/app.js` | — |
| 进度条演示 | `/create-game/asset/progress-bar-demo` | `create-game-asset-progress-bar-demo.html` | HomeController#createProgressBarDemo | — | — |

### 2.3 独立编辑器页面

| 页面名称 | URL | 模板文件 | Controller | 主要 JS | CSS |
|---------|-----|---------|------------|---------|-----|
| 图片编辑器 | `/create-game/image` | `create-game-image.html` | HomeController#createGameImage | `image-editor/app.js` + 多个 tools/filters | `image-editor.css` |
| 地图编辑器（创作入口） | `/create-game/tilemap` | `create-game-tilemap.html` | HomeController#createGameTilemap | `tilemap-editor.js` | `tilemap-editor.css` |
| 地图编辑器（独立） | `/tilemap-editor` | `tilemap-editor.html` | TilemapEditorController#tilemapEditor | `tilemap-editor.js` | `tilemap-editor.css` |
| 代码编辑器 | `/create-game/code` | `create-game-code.html` | HomeController#createGameCode | `code-editor/app.js` | `code-editor.css` |
| 粒子效果编辑器 | `/particle-effect-editor` | `particle-editor.html` | HomeController#particleEffectEditor | 加载 `static/particle-editor-dist/` 构建产物 | — |

### 2.4 Unity 风格编辑器

| 页面名称 | URL | 模板文件 | Controller | 主要 JS | CSS |
|---------|-----|---------|------------|---------|-----|
| Unity Portal | `/create-game/unity` | `create-game-unity-portal.html` | UnityController#createGameUnity | — | — |
| 2D策略游戏 | `/create-game/unity/2d-strategy` | `create-game-2d-strategy.html` | UnityController#createGame2DStrategy | `unity-editor/app.js` | `unity-editor.css` |
| 2D RPG | `/create-game/unity/2d-rpg` | `create-game-2d-rpg.html` | UnityController#createGame2DRPG | `unity-editor/app.js` | `unity-editor.css` |
| 2D银河恶魔城 | `/create-game/unity/2d-metroidvania` | `create-game-2d-metroidvania.html` | UnityController#createGame2DMetroidvania | `unity-editor/app.js` | `unity-editor.css` |
| 3D射击游戏 | `/create-game/unity/3d-shooter` | `create-game-3d-shooter.html` | UnityController#createGame3DShooter | `unity-editor/app.js` | `unity-editor.css` |

---

## 三、核心 JS 模块说明

### 3.1 game-asset-creator 模块

位于 `static/js/game-asset-creator/`，属于**方案 B 单页应用架构**的核心模块。通过左侧菜单切换不同功能，所有编辑器在同一页面的不同面板中运行。

> 关键类：`GameAssetCreatorApp`
>
> 主要方法：`switchPanel(category)` — 根据 `data-category` 属性切换内容面板的显示/隐藏，不做页面跳转

| 文件 | 职责 |
|------|------|
| `app.js` | 主入口，`GameAssetCreatorApp` 类，管理 40+ 功能的面板切换（`switchPanel(category)`） |
| `AssetManager.js` | 素材的 CRUD 操作，与后端 `/api/asset/*` 交互 |
| `AssetEditor.js` | 画布编辑器基类，管理工具栏和绘图操作 |
| `CanvasUtils.js` | Canvas 工具函数 |
| `FrameSequenceEditor.js` | 动画帧序列编辑器，`initFrameSequenceEditor()` 初始化函数 |

### 3.2 image-editor 模块
位于 `static/js/image-editor/`，Photoshop 风格图片编辑器。

| 文件/目录 | 职责 |
|-----------|------|
| `app.js` | 主入口 |
| `ImageEditor.js` | 核心编辑器类 |
| `Layer.js` | 图层系统 |
| `CanvasRenderer.js` | 渲染引擎 |
| `CommandHistory.js` | 撤销/重做 |
| `EventBus.js` | 事件总线 |
| `MenuManager.js` | 菜单栏管理 |
| `tools/` | 选择/绘画/变换/填充/钢笔/透视/裁切等工具 |
| `filters/` | 基础/颜色/高级/特效/图层样式滤镜 |
| `renderer/` | 物品菜单渲染器 |
| `skeleton/` | 骨骼动画子系统（core + ui + tools） |

### 3.3 骨骼动画系统
位于 `static/js/image-editor/skeleton/`，被动画帧序列编辑器调用。

| 文件/目录 | 职责 |
|-----------|------|
| `core/` | Bone、Skeleton、Animation、AnimationPlayer、Track、Keyframe、Skin、ExportManager |
| `ui/` | SkeletonAnimationEditor、Timeline、BoneHierarchyPanel、BonePropertyPanel |
| `tools/BoneEditTool.js` | 骨骼编辑交互工具 |
| `init.js` | `initSkeletonAnimationEditor()` 入口函数 |

### 3.4 unity-editor 模块
位于 `static/js/unity-editor/`，Unity 风格多功能编辑器。

| 文件 | 职责 |
|------|------|
| `app.js` / `app-optimized.js` | 主入口 |
| `UnityEditor.js` | 核心编辑器 |
| `UnityRenderer.js` | 渲染引擎 |
| `UnityUI.js` | UI 管理 |
| `UnityPhysics.js` | 物理引擎 |
| `GridSystem.js` | 网格系统 |
| `NPCEditor.js` | NPC 编辑 |
| `DialogueEditor.js` | 对话系统 |
| `QuestSystem.js` | 任务系统 |
| `PathfindingEditor.js` | 寻路编辑 |
| `ParticleSystemEditor.js` | 粒子系统 |
| `LightingEditor.js` | 光照编辑 |
| `BattlePreview.js` | 战斗预览 |

### 3.5 ui-layout-editor 模块（新增）
位于 `static/js/ui-layout-editor/`。

| 文件 | 职责 |
|------|------|
| `app.js` | `initUiLayoutEditor()` 入口，可视化拖拽布局编辑器，支持8方向缩放、自动对齐吸附、JSON导出 |

### 3.6 前端独立应用（Vue + Vite 构建）

| 应用 | 源码位置 | 构建产物 | 使用页面 |
|------|---------|---------|---------|
| AI 立绘生成器 | `static/ai-portrait-generator/src/` | `static/ai-portrait-generator/dist/` | `/create-game/asset/character-portrait` |
| 粒子效果编辑器 | `static/particle-effect-editor/src/` | `static/particle-editor-dist/` | `/particle-effect-editor` |

---

## 四、全局资源

### 4.1 布局模板
- `templates/layout.html`：所有 Thymeleaf 页面的基础布局，通过 `layout:decorate="~{layout}"` 引入
  - `<head>` 中加载：`theme.css`、`ui-layout-editor.css`
  - `<body>` 末尾加载：`main.js`、`image-editor/*`、`game-asset-creator/*`、`骨骼动画系统/*`、`tilemap-editor.js`、`ui-layout-editor/app.js`

### 4.2 全局 CSS
| 文件 | 覆盖页面 |
|------|---------|
| `css/theme.css` | 所有页面（全局主题/暗色模式） |
| `css/homepage.css` | 首页 |
| `css/game-creation.css` | 游戏创作入口 |
| `css/game-asset-creator.css` | 素材创作系统 |
| `css/image-editor.css` | 图片编辑器 |
| `css/skeleton-animation.css` | 骨骼动画编辑器 |
| `css/tilemap-editor.css` | 地图编辑器 |
| `css/unity-editor.css` | Unity 编辑器 |
| `css/game-plaza.css` | 游戏广场 |
| `css/game-management.css` | 我的游戏 |
| `css/game-portal.css` | 游戏类型Portal |
| `css/game-map-editor.css` | 游戏地图生成器 |
| `css/code-editor.css` | 代码编辑器 |
| `css/ui-layout-editor.css` | UI布局编辑器（作用域限定在 `#ui-layout-editor-panel`） |

### 4.3 全局 JS
| 文件 | 职责 |
|------|------|
| `js/main.js` | 全局初始化（主题切换等） |
| `js/homepage.js` | 首页交互 |
| `js/game-creation.js` | 游戏创作入口交互 |
| `js/game-management.js` | 我的游戏管理 |
| `js/game-plaza.js` | 游戏广场 |
| `js/game-portal.js` | 游戏类型选择Portal |
| `js/tilemap-editor.js` | 地图编辑器核心 |

### 4.4 UI 组件库
位于 `static/ui-components/`：
- `index.js`：组件注册入口
- `ProgressBar.vue`：进度条 Vue 组件
- `styles/`：组件基础样式 + 6种主题（simple/loading/glass/health/pixel/energy）
- `utils/animation.js`、`utils/color.js`

---

## 五、后端 API 分组

| Controller | 路径前缀 | 职责 |
|------------|---------|------|
| HomeController | — | 所有视图页面路由（52个） |
| UnityController | `/api/unity/` | Unity 场景/对象管理 + Unity 视图页面 |
| AssetController | `/api/asset/` | 素材 CRUD、上传、导出 |
| ImageEditorController | `/api/image-editor/` | 图片上传、文档保存、AI 功能 |
| AIPortraitController | `/api/ai/portrait/` | AI 立绘生成、进度查询、历史记录 |
| SkeletonAssetController | `/api/ai/portrait/skeleton/` | 骨骼素材 AI 生成 |
| OpenPoseTemplateController | `/api/ai/skeleton/template/` | OpenPose 模板生成 |
| GameMapController | `/api/game-map/` | 游戏地图 AI 生成 |
| GameController | `/api/game/` | 游戏项目 CRUD |
| DatabaseHealthController | `/api/database/` | 数据库健康检查 |
| TilemapEditorController | — | Tilemap 编辑器视图 |

---

## 六、静态测试/调试页面（不在导航内）

| 文件 | 用途 |
|------|------|
| `static/test-unity.html` | Unity 编辑器测试 |
| `static/test-filters.html` | 图像滤镜测试 |
| `static/test-tooltips.html` | Tooltip 组件测试 |
| `static/test-physics.html` | 物理引擎测试 |
| `static/test-skeleton-editor.html` | 骨骼编辑器测试 |
| `templates/e2e-test.html` | 端到端测试（`/e2e-test`） |
| `index.html`（项目根目录） | UI 布局编辑器独立演示版（原始文件，已集成进项目） |

