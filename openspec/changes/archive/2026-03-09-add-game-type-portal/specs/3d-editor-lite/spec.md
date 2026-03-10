## ADDED Requirements

### Requirement: 3D 射击游戏编辑器

系统SHALL提供针对3D射击游戏优化的轻量级编辑器，保留核心3D功能并移除不必要的2D特定工具。

#### Scenario: 编辑器加载性能优化
- **WHEN** 用户访问 `/create-game/unity/3d-shooter`
- **THEN** 编辑器应在 ~300-500ms 内显示初始UI，相比原始编辑器有50%的性能改进

#### Scenario: 3D核心功能保留
- **WHEN** 3D射击编辑器加载完成
- **THEN** 系统提供以下核心功能：
  - 3D场景编辑（Three.js渲染）
  - 摄像机控制（OrbitControls）
  - 物体创建和编辑
  - Gizmo变换工具（移动、旋转、缩放）
  - 基础属性检查器（位置、旋转、缩放、材质）

#### Scenario: 2D特定工具移除
- **WHEN** 在3D射击编辑器中查看工具栏
- **THEN** 系统不加载以下2D特定工具以节省内存和加载时间：
  - 网格系统（Grid System）
  - 寻路工具（Pathfinding）
  - 战斗预览（Battle Preview）
  - NPC编辑器
  - 对话系统
  - 任务系统

#### Scenario: 射击游戏专用功能
- **WHEN** 用户在3D射击编辑器中使用专用工具
- **THEN** 系统提供以下射击游戏特定功能：
  - 光照系统编辑（方向光、点光、聚光灯）
  - 粒子系统编辑（发射形状、速度、生命周期）
  - 射线检测工具（起点、方向、范围可视化）
  - 物理引擎延迟加载（Ammo.js懒加载）

#### Scenario: 后向兼容性保证
- **WHEN** 用户在3D射击编辑器中打开已有的3D场景
- **THEN** 场景完整加载，所有对象、材质、光照设置保持不变
- **AND** 所有UnityScene、UnityObject、UnityMaterial数据无需转换即可使用

