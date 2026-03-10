# 2d-editor-lite Specification

## Purpose
TBD - created by archiving change add-game-type-portal. Update Purpose after archive.
## Requirements
### Requirement: 2D 编辑器基础架构
系统 SHALL 提供一个轻量级的 2D 游戏编辑器，基于 Canvas 2D API 而非 Three.js，用于 2D 游戏开发。

#### Scenario: 2D 编辑器加载
- **WHEN** 用户访问 `/create-game/unity/2d-strategy` 或其他 2D 类型的编辑器 URL
- **THEN** 编辑器应在 ~400-500ms 内显示可用的 2D 编辑界面（首屏加载时间）

#### Scenario: 编辑器初始化
- **WHEN** 2D 编辑器加载完成
- **THEN** 系统显示：
  - 左侧层级面板（Hierarchy）
  - 中央 2D Canvas 画布
  - 右侧属性检查器（Inspector）
  - 顶部工具栏

#### Scenario: 减少加载数据量
- **WHEN** 2D 编辑器初始化
- **THEN** 初始加载数据量不超过 600KB（相比 3D 编辑器的 ~1.2MB 减少 50%）

### Requirement: 2D 画布核心功能
系统 SHALL 提供 2D 画布的基本编辑功能，包括对象创建、选择和编辑。

#### Scenario: 创建 2D 对象
- **WHEN** 用户在 2D 编辑器中右键点击画布或使用工具栏 "新建对象"
- **THEN** 系统显示 2D 对象类型菜单（精灵、矩形、圆形、多边形等）

#### Scenario: 编辑对象属性
- **WHEN** 用户在 2D 编辑器中选择对象
- **THEN** 右侧 Inspector 显示 2D 特有属性：
  - 位置（X, Y）
  - 旋转（Z 轴旋转）
  - 缩放（X, Y）
  - 图层（Z 深度）
  - 透明度

#### Scenario: 缩放和平移
- **WHEN** 用户在 2D 画布中操作
- **THEN** 系统支持：
  - 鼠标滚轮缩放
  - 右键拖拽平移
  - 快捷键支持（+/- 缩放, 空格+拖拽平移）

### Requirement: 2D 策略战棋编辑器特定功能
系统 SHALL 为策略战棋游戏提供网格、寻路和战斗预览等特定工具。

#### Scenario: 网格配置
- **WHEN** 用户在 2D 策略编辑器中访问 "网格设置"
- **THEN** 系统显示网格配置面板：
  - 网格大小（Tile Size）：可设置为 32, 64, 128 像素
  - 网格显示开关
  - 网格对齐开关

#### Scenario: 自动对齐到网格
- **WHEN** 用户启用 "网格对齐"，在画布上拖拽对象
- **THEN** 对象位置自动对齐到最近的网格点

#### Scenario: 战斗预览
- **WHEN** 用户在 2D 策略编辑器中使用 "战斗预览" 工具
- **THEN** 系统显示模式选择：单位范围、攻击范围、技能范围可视化

### Requirement: 2D 恶魔城编辑器特定功能
系统 SHALL 为恶魔城/横版游戏提供碰撞体编辑和物理基础功能。

#### Scenario: 碰撞体编辑
- **WHEN** 用户在 2D 恶魔城编辑器中选择对象，并在 Inspector 中启用物理
- **THEN** 系统显示碰撞体编辑面板：
  - 碰撞体类型：盒子(Box)、圆形(Circle)、多边形(Polygon)
  - 碰撞体大小编辑
  - 碰撞体可视化（画布上显示碰撞边界）

#### Scenario: 刚体属性
- **WHEN** 用户配置对象的物理属性
- **THEN** 系统支持设置：
  - 质量（Mass）
  - 摩擦力（Friction）
  - 恢复力（Restitution）
  - 重力开关

#### Scenario: 平台跳跃预览
- **WHEN** 用户启用 "物理预览" 模式
- **THEN** 编辑器模拟基础物理，允许预览角色跳跃效果

### Requirement: 2D RPG 编辑器特定功能
系统 SHALL 为 RPG 游戏提供 NPC、对话和任务系统的编辑功能。

#### Scenario: NPC 创建和编辑
- **WHEN** 用户在 2D RPG 编辑器中使用 "NPC 工具"
- **THEN** 系统提供 NPC 配置面板：
  - NPC 名称
  - 头像/精灵资源
  - 初始对话文本
  - AI 行为配置

#### Scenario: 对话系统编辑
- **WHEN** 用户为 NPC 配置对话
- **THEN** 系统显示对话编辑器（节点图或脚本形式）：
  - 对话文本输入
  - 选项分支
  - 条件判断（如需要）
  - 关键字标签（如触发任务）

#### Scenario: 任务链编辑
- **WHEN** 用户创建游戏任务链
- **THEN** 系统允许定义：
  - 任务目标（如收集 N 个物品）
  - 任务触发条件
  - 任务完成奖励

### Requirement: 3D 射击编辑器优化
系统 SHALL 提供精简的 3D 编辑器，移除 2D 游戏不需要的功能。

#### Scenario: 3D 编辑器加载
- **WHEN** 用户访问 `/create-game/unity/3d-shooter`
- **THEN** 编辑器应在 ~300-500ms 内加载（依赖 Three.js 和选择性加载物理引擎）

#### Scenario: 射击游戏特定工具
- **WHEN** 用户在 3D 射击编辑器中访问工具栏
- **THEN** 系统显示射击游戏相关的工具：
  - 光照编辑
  - 粒子系统
  - 射线检测（射击检测）
  - 网络同步配置（可选）

#### Scenario: 移除不必要的功能
- **WHEN** 在 3D 射击编辑器中搜索或查看功能
- **THEN** 系统不显示：
  - 2D 网格系统
  - 对话编辑器
  - 任务系统
  - 其他 2D 特定功能

### Requirement: 类型化编辑器性能优化
系统 SHALL 确保每个类型化编辑器的首屏加载时间显著小于原始 Unity 编辑器。

#### Scenario: 初始加载性能
- **WHEN** 用户首次访问任何类型化编辑器
- **THEN** 性能指标满足：
  - 2D 策略: 初始加载 ≤ 400ms
  - 2D 恶魔城: 初始加载 ≤ 450ms
  - 2D RPG: 初始加载 ≤ 480ms
  - 3D 射击: 初始加载 ≤ 300ms

#### Scenario: 初始内存占用
- **WHEN** 编辑器加载完成
- **THEN** 内存占用不超过：
  - 2D 编辑器: 400MB（原 3D 编辑器约 800-1000MB）
  - 3D 射击: 600MB

