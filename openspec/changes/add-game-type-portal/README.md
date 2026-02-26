# 游戏类型选择门户 Proposal

## 📝 概述

这是一个针对 Unity 编辑器进行**类型化重构**的提案。核心目标是：

🎯 **将重型的"一刀切" 3D 编辑器改造为轻量化的类型特定编辑器**

当前状态: ✅ **Proposal 已创建并通过验证**

---

## 📂 文件导航

| 文件 | 用途 | 阅读时间 |
|------|------|--------|
| **PROPOSAL_SUMMARY.md** | 📊 快速概览（强烈推荐首先阅读） | 5 分钟 |
| **proposal.md** | 📋 官方提案（为什么、做什么、影响什么） | 5 分钟 |
| **design.md** | 🏗️ 技术设计（架构、决策、权衡） | 15 分钟 |
| **tasks.md** | ✅ 实现清单（8 个阶段，~80 个任务） | 20 分钟 |
| **specs/ 目录** | 🔍 详细需求（4 个规格文件，每个 20-30 个需求） | 30 分钟 |
| **prompt.md** | 💬 原始需求（用户原话） | 1 分钟 |

---

## 🎯 快速理解

### 当前状况 ❌
```
用户访问 /create-game/unity
  ↓
🎮 Unity 3D 编辑器 (一刀切)
  ├─ 所有功能都在一起
  ├─ 加载 Three.js + Ammo.js + 所有工具
  ├─ 首屏: ~1s
  └─ 内存: ~1000MB
```

### 改进后 ✅
```
用户访问 /create-game/unity
  ↓
🎮 游戏类型选择门户 (新!)
  ├─ 2D 策略战棋 → Canvas 2D 编辑器 (~400ms)
  ├─ 2D 恶魔城   → Canvas 2D 编辑器 (~450ms)
  ├─ 2D RPG      → Canvas 2D 编辑器 (~480ms)
  └─ 3D 射击     → Three.js 编辑器  (~300ms)
```

---

## 📊 性能对比

| 指标 | 原始编辑器 | 2D 编辑器 | 改进 |
|------|----------|---------|------|
| 首屏加载 | ~1.0s | ~400-480ms | ⬇️ **50-60%** |
| 初始内存 | ~1000MB | ~400MB | ⬇️ **60%** |
| 初始请求 | 8+ 个 | 5 个 | ⬇️ **40%** |
| 初始数据 | ~1.2MB | ~600KB | ⬇️ **50%** |

---

## 💡 关键决策

### 1️⃣ 为什么分离编辑器？
- 2D 游戏开发者不需要 Three.js（节省 ~400KB）
- 不同编辑器可独立优化（针对性加载）
- 便于后续针对性功能开发（如 2D 骨骼动画）

### 2️⃣ 为什么选 Canvas 2D？
- 轻量级（比 Three.js 小 ~70%）
- 加载速度快（无 WebGL 初始化开销）
- 足以处理 2D 游戏需求
- 降低学习曲线

### 3️⃣ 数据兼容性怎样处理？
- 现有游戏标记为 "3d-legacy"
- 继续支持打开和编辑
- 自动迁移，无需用户干预

---

## 🎮 支持的游戏类型

### 1️⃣ **2D 策略战棋** 🗺️
- 引擎: Canvas 2D
- 特色工具:
  - 网格系统（可配置网格大小）
  - 寻路编辑
  - 战斗预览（范围、伤害可视化）

### 2️⃣ **2D 恶魔城** 🧛
- 引擎: Canvas 2D
- 特色工具:
  - 碰撞体编辑（盒子、圆形、多边形）
  - 物理预览（重力、摩擦力）
  - 平台跳跃机制支持

### 3️⃣ **2D RPG** 🎭
- 引擎: Canvas 2D
- 特色工具:
  - NPC 编辑
  - 对话系统（节点图/脚本）
  - 任务链编辑

### 4️⃣ **3D 射击** 🔫
- 引擎: Three.js
- 特色工具:
  - 光照编辑（方向光、点光、聚光灯）
  - 粒子系统
  - 射线检测工具
  - 网络同步配置（可选）

---

## 📋 实现路线图

### **第 1-2 天: 后端基础**
- [ ] Game 数据模型（支持 4 种类型）
- [ ] GameController 和 API
- [ ] 数据库迁移（为现有游戏标记类型）

### **第 2-3 天: 游戏门户**
- [ ] 创建门户 HTML（4 张卡片）
- [ ] 门户 JavaScript 逻辑（创建/打开游戏）
- [ ] 门户样式和交互

### **第 3-5 天: 2D 编辑器**
- [ ] BaseEditor2D 基类
- [ ] 策略编辑器（+网格工具）
- [ ] 恶魔城编辑器（+碰撞体工具）
- [ ] RPG 编辑器（+NPC 工具）

### **第 5-6 天: 3D 编辑器优化**
- [ ] 从现有编辑器中移除 2D 工具
- [ ] 创建 3D 射击编辑器模板
- [ ] 添加射击特定功能

### **第 6-7 天: 性能优化**
- [ ] 为每个编辑器配置懒加载
- [ ] 性能基准测试
- [ ] 监控和指标收集

### **第 7-9 天: 测试和部署**
- [ ] 端到端功能测试
- [ ] 浏览器兼容性测试
- [ ] 灰度发布准备
- [ ] 文档编写

---

## 🚀 如何开始

### 1️⃣ **阅读 Proposal**
```bash
# 快速了解
cat openspec/changes/add-game-type-portal/PROPOSAL_SUMMARY.md

# 官方文档
cat openspec/changes/add-game-type-portal/proposal.md
```

### 2️⃣ **理解技术设计**
```bash
# 详细的架构、决策、风险分析
cat openspec/changes/add-game-type-portal/design.md
```

### 3️⃣ **查看规格需求**
```bash
# 每个规格的详细需求和场景
ls -la openspec/changes/add-game-type-portal/specs/
cat openspec/changes/add-game-type-portal/specs/game-portal/spec.md
cat openspec/changes/add-game-type-portal/specs/2d-editor-lite/spec.md
cat openspec/changes/add-game-type-portal/specs/3d-editor-lite/spec.md
cat openspec/changes/add-game-type-portal/specs/game-management/spec.md
```

### 4️⃣ **获取实现清单**
```bash
# ~80 个具体的任务项
cat openspec/changes/add-game-type-portal/tasks.md
```

### 5️⃣ **验证 Proposal 质量**
```bash
# 确保所有规格和需求都符合 OpenSpec 规范
openspec validate add-game-type-portal --strict
```

---

## ✅ 验证状态

✅ **proposal.md** - 格式正确
✅ **design.md** - 技术设计完整
✅ **tasks.md** - 任务清单详细
✅ **game-portal/spec.md** - 需求完整，Scenarios 正确
✅ **2d-editor-lite/spec.md** - 需求完整，Scenarios 正确
✅ **3d-editor-lite/spec.md** - MODIFIED 需求正确
✅ **game-management/spec.md** - ADDED + MODIFIED 需求正确
✅ **openspec validate --strict** - **PASSED** ✨

---

## 📞 关键问题 & 答案

### Q: 现有游戏会被破坏吗？
**A**: 不会。现有游戏会被标记为 "3d-legacy" 类型，继续在 3D 编辑器中打开和编辑。

### Q: 用户需要迁移吗？
**A**: 不需要。迁移是自动的和透明的。用户在门户中访问游戏时，系统会自动处理。

### Q: 如果我不想要 2D 编辑器呢？
**A**: 虽然创建了 2D 编辑器，但用户仍然可以选择只使用 3D 编辑器。门户允许用户选择。

### Q: 后续如何添加新游戏类型？
**A**: 创建新的编辑器 HTML、添加类型到 GameType enum、扩展 API。见 design.md 中的 "Open Questions"。

### Q: 2D 编辑器功能会不会太弱？
**A**: 初期可能是。但通过迭代可以逐步增强（如添加骨骼动画、高级物理等）。

---

## 🔗 相关链接

- **OpenSpec 文档**: openspec/AGENTS.md
- **项目规范**: openspec/project.md
- **现有规格**: openspec/specs/
- **已完成的 Changes**: openspec/changes/archive/

---

## 📝 下一步

1. ✅ **审核本 Proposal** - 确保方向正确
2. 🟡 **批准执行** - 如无意见，准备开始实现
3. 🟢 **执行 /openspec/apply** - 开始代码实现
4. 📊 **定期同步进度** - 按 tasks.md 更新完成状态
5. 🎉 **归档变更** - 完成后使用 `openspec archive`

---

## 👤 作者信息

Created: 2026-02-25
Change Type: 架构重构 + 性能优化
Breaking Change: ⚠️ **是的** (路由改变，但兼容现有数据)

---

**准备开始实现了吗?**

```bash
# 确认 Proposal 有效
openspec validate add-game-type-portal --strict

# 查看所有详情
openspec show add-game-type-portal

# 当准备好时，执行:
# /openspec/apply add-game-type-portal
```

🚀 **让我们开始构建 WriteEngine 的游戏类型生态系统吧！** 🎮

