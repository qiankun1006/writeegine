# Design: 游戏类型选择门户与轻量化编辑器架构

## Context

WriteEngine 当前提供了一个功能完整但"过重"的 3D Unity 编辑器。不同类型的游戏开发者需要：
- **2D 策略战棋** 开发者：需要网格系统、寻路、战斗预览
- **2D 恶魔城** 开发者：需要层级系统、碰撞体、跳跃/攀爬机制
- **2D RPG** 开发者：需要 NPC、对话、任务系统、存档
- **3D 射击** 开发者：需要光照、粒子、射线检测、网络同步

目前所有这些需求都被塞入一个编辑器中，导致：
1. 首屏加载时间长（必须加载 Three.js、Ammo.js、所有工具）
2. 内存占用高（所有功能都在内存中）
3. UI 混乱（显示用户不需要的工具）
4. 维护成本高（任何改动都影响全局）

## Goals

### 核心目标
- 将单一的"重型"Unity 编辑器分解为多个"轻量化"的类型化编辑器
- 提供统一的游戏类型选择入口
- 首屏加载时间从 ~1s 减少到 ~300-500ms
- 编辑器初始内存占用减少 40-60%
- 每个编辑器只加载必需的模块

### 非目标
- 不改变现有的场景/对象数据模型（向后兼容）
- 不立即实现完整的 2D/3D 引擎（使用现有的 Canvas 2D 和 Three.js）
- 不创建独立的游戏类型特定 API（共享 `/api/game/` 命名空间）

## Decisions

### 1. 编辑器分类方案

**选择方案**：基于游戏类型创建独立编辑器类（而非特性化单一编辑器）

```
理由：
✅ 便于维护 - 每个编辑器独立演进
✅ 易于优化 - 可针对性地删除不需要的代码
✅ 支持共享 - 通过基类共享通用功能
✅ 便于扩展 - 后续新增游戏类型时只需增加新编辑器
```

**类型定义**：
- `2d-strategy` - 策略战棋编辑器（Canvas 2D）
- `2d-metroidvania` - 恶魔城编辑器（Canvas 2D + 物理）
- `2d-rpg` - RPG 编辑器（Canvas 2D + NPC/对话）
- `3d-shooter` - 射击编辑器（Three.js + 光照）

### 2. 前端架构

```
create-game-unity.html (门户页面)
├── GameTypeSelector 组件
│   ├── 卡片 1: 2D 策略战棋
│   ├── 卡片 2: 2D 恶魔城
│   ├── 卡片 3: 2D RPG
│   └── 卡片 4: 3D 射击
└── 跳转逻辑 (route to specific editor)

create-game-2d-strategy.html
├── BaseEditor (2D 基类)
├── StrategyTools (网格、寻路、战斗预览)
└── LazyLoader (轻量化)

create-game-2d-metroidvania.html
├── BaseEditor (2D 基类)
├── MetroidvaniaTools (碰撞体、跳跃)
└── LazyLoader

create-game-2d-rpg.html
├── BaseEditor (2D 基类)
├── RPGTools (NPC、对话、任务)
└── LazyLoader

create-game-3d-shooter.html
├── BaseEditor (3D 基类)
├── ShooterTools (光照、粒子、网络)
└── LazyLoader (可选加载物理、脚本)
```

### 3. 后端 API 分层

```
/api/game/                              # 游戏管理 API
├── /game/list                          # 获取用户的所有游戏
├── /game/create?type=2d-strategy       # 创建特定类型游戏
├── /game/{gameId}                      # 获取游戏元数据
├── /game/{gameId}/save                 # 保存游戏
└── /game/{gameId}/scenes               # 场景管理

/api/scene/                             # 场景 API（类型无关）
├── /scene/{sceneId}                    # 获取场景数据
└── /scene/{sceneId}/update             # 更新场景

/api/editor/{gameType}/                 # 编辑器特定 API（可选）
├── /editor/2d-strategy/grid            # 策略网格配置
├── /editor/2d-strategy/pathfinding     # 寻路计算
└── /editor/3d-shooter/lighting         # 光照配置
```

### 4. 加载优化策略

**阶段 1: 必需模块（~200-400KB，同步加载）**
- HTML DOM 结构
- 基础样式
- 编辑器基类（UIPanel, Selection, History）

**阶段 2: 类型引擎（~150-300KB，同步加载）**
- Canvas 2D 或 Three.js（取决于类型）
- 输入控制系统
- 渲染循环

**阶段 3: 类型工具（~100-200KB，异步加载）**
- Strategy: GridSystem, PathFinding, BattlePreview
- Metroidvania: PhysicsComponent, CollisionEditor, PlatformerTools
- RPG: NPCManager, DialogueSystem, QuestSystem
- 3D: LightingSystem, ParticleEditor, NetworkSync

**阶段 4: 可选功能（~100-150KB，按需加载）**
- 脚本编辑器
- 资源库
- 高级物理（仅 3D）
- 动画系统

**预期结果**：
| 编辑器 | 初始加载 | 完全加载 |
|--------|---------|---------|
| 2D 策略 | ~400ms | ~1.2s |
| 2D 恶魔城 | ~450ms | ~1.5s |
| 2D RPG | ~480ms | ~1.8s |
| 3D 射击 | ~300ms | ~2.0s |

### 5. 数据兼容性

**现有数据结构保留**：
- `UnityScene` - 继续使用
- `UnityObject` - 继续使用
- `UnityMaterial` - 继续使用

**新增字段**：
```java
class Game {
    String id;
    String name;
    String type;  // "2d-strategy", "2d-metroidvania", "2d-rpg", "3d-shooter"
    String thumbnailUrl;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Map<String, Object> metadata;  // 类型特定配置
}
```

### 6. 路由映射

```java
GET  /create-game/unity              → create-game-unity.html (门户)
GET  /create-game/unity/2d-strategy  → create-game-2d-strategy.html
GET  /create-game/unity/2d-metroidvania → create-game-2d-metroidvania.html
GET  /create-game/unity/2d-rpg       → create-game-2d-rpg.html
GET  /create-game/unity/3d-shooter   → create-game-3d-shooter.html
GET  /create-game/unity/2d-strategy?gameId={id} → 打开已有游戏
```

## Risks & Trade-offs

### Risk 1: 代码重复
**描述**：多个编辑器文件可能有很多重复代码
**影响**：维护难度高，错误修复需要同步多个地方
**缓解**：
- 创建 `BaseEditor` 基类提取通用逻辑
- 使用模块系统（MODULES_CONFIG.json）配置不同编辑器
- 建立代码共享约定（utility 函数库）

### Risk 2: 后端复杂度
**描述**：需要支持多种游戏类型的 API
**影响**：API 设计不当可能导致维护困难
**缓解**：
- 使用策略模式（GameTypeHandler）
- 类型与业务逻辑解耦
- 先实现简单版本，后期再优化

### Risk 3: 用户迁移
**描述**：现有用户的 Unity 编辑器 URL 会变
**影响**：可能破坏用户的书签和集成
**缓解**：
- 保持 `/create-game/unity` 重定向到门户
- 在门户提供"返回完整编辑器"选项
- 向用户提供迁移指南

## Migration Plan

### Phase 1: 并行运行（第 1 周）
```
- 部署新门户和类型化编辑器到暂存环境
- 保持现有 /create-game/unity 不变
- URL: /create-game/unity-new (新门户)
- 收集用户反馈
```

### Phase 2: 灰度切换（第 2-3 周）
```
- 10% 用户访问新门户
- 90% 用户访问现有编辑器
- 监控性能和错误
- 逐步提高到 50% → 100%
```

### Phase 3: 完整切换（第 4 周）
```
- 100% 用户使用新门户
- 旧编辑器 URL 重定向到门户
- 保留旧编辑器作为"advanced mode"
```

## Implementation Order

1. **后端基础**（第 1 天）
   - [ ] 创建 Game 数据模型
   - [ ] 扩展 UnityService 支持类型
   - [ ] 添加 GameTypeController

2. **门户页面**（第 1-2 天）
   - [ ] 创建 create-game-unity.html（门户）
   - [ ] 实现卡片 UI 和跳转逻辑
   - [ ] 集成 API 调用

3. **2D 编辑器基础**（第 2-3 天）
   - [ ] 创建 BaseEditor2D 基类
   - [ ] 创建策略战棋编辑器
   - [ ] 创建恶魔城编辑器
   - [ ] 创建 RPG 编辑器

4. **3D 编辑器优化**（第 3-4 天）
   - [ ] 优化现有 3D 编辑器（移除不必要代码）
   - [ ] 应用到 create-game-3d-shooter.html
   - [ ] 集成类型特定功能

5. **懒加载和优化**（第 4-5 天）
   - [ ] 为每个编辑器配置 MODULES_CONFIG.json
   - [ ] 实现类型特定的 LazyLoader
   - [ ] 性能测试和优化

6. **测试和部署**（第 5-6 天）
   - [ ] 单元测试
   - [ ] 集成测试
   - [ ] 性能基准测试
   - [ ] 部署到暂存环境

## Open Questions

1. 是否需要为不同编辑器创建不同的 API 前缀？
   - 建议：暂时使用统一的 `/api/game/` 前缀，后期可分离为 `/api/2d-strategy/`, `/api/3d-shooter/` 等

2. 2D 编辑器是否需要完整的物理引擎支持？
   - 建议：Metroidvania 和 RPG 需要基础物理（碰撞检测），但不需要 Ammo.js 级别的复杂物理

3. 现有的 Unity 编辑器用户数据如何迁移？
   - 建议：将现有数据标记为 "legacy" 类型，在门户提供"恢复"选项

4. 是否需要支持在不同编辑器间切换游戏类型？
   - 建议：暂时不支持（类型转换复杂），后期作为高级功能添加

