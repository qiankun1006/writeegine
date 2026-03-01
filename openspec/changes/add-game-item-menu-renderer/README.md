# 🎮 游戏物品菜单绘图工具 - OpenSpec 变更提案

## ✅ 提案创建完成

这是一个完整的 OpenSpec 变更提案，用于在图片编辑器中添加游戏物品菜单绘图功能。

---

## 📋 文档清单

| 文件 | 大小 | 说明 |
|------|------|------|
| `prompt.md` | 894B | 原始用户需求的完整记录 |
| `proposal.md` | 2.5K | OpenSpec 标准格式的提案(Why/What/Impact) |
| `tasks.md` | 6.0K | 6 个阶段 × 23 个任务的清单 |
| `design.md` | 23K | 详细的架构设计和代码实现 |
| `SUMMARY.md` | 4.2K | 提案的快速浏览总结 |
| `specs/game-item-menu-renderer/spec.md` | 7.7K | 核心功能规格(6 Req, 18 Scenario) |
| `specs/item-menu-layout/spec.md` | 8.2K | 布局系统规格(6 Req, 20 Scenario) |
| `specs/item-menu-style/spec.md` | 11K | 风格系统规格(5 Req, 25 Scenario) |

---

## 📊 提案统计

- **总文档行数**: 2,356 行
- **总 Requirement**: 17 个
- **总 Scenario**: 63 个
- **能力模块**: 3 个(核心、布局、风格)
- **新增文件**: 4 个(GameItemMenuTool, ItemMenuRenderer, ItemMenuLayoutEngine, ItemMenuStylePresets)
- **修改文件**: 2 个(create-game-image.html, app.js)
- **任务数量**: 23 个(6 个阶段)

---

## 🎯 功能概览

### 三种布局

- **列表式** - 行列排列，用于物品栏(4×3 网格)
- **网格式** - 规则网格排列，用于物品库(5 列)
- **侧栏式** - 竖列排列，用于装备栏(单列)

### 四种风格

- **像素风** - 复古、硬边界、鲜艳纯色(#333333 背景)
- **暗黑风** - 压抑、发光边框、红色系(#1a0000 背景)
- **卡通风** - 活泼、圆角、明亮色(#66ccff 背景)
- **科幻风** - 未来感、霓虹、扫描线(#0a1a2a 背景)

### 高亮效果

- 鼠标悬停显示物品高亮状态(风格特定效果)
- 点击显示物品选中状态
- 支持平滑的实时更新和动画

---

## 🏗️ 架构概览

```
GameItemMenuTool (菜单工具主类)
├─ ItemMenuRenderer (渲染引擎)
│  ├─ drawBackground() - 绘制菜单背景
│  ├─ drawItems() - 绘制所有物品
│  ├─ drawItemByStyle() - 根据风格绘制物品
│  ├─ drawPixelItem() - 像素风绘制
│  ├─ drawDarkItem() - 暗黑风绘制
│  ├─ drawCartoonItem() - 卡通风绘制
│  └─ drawSciFiItem() - 科幻风绘制
│
├─ ItemMenuLayoutEngine (布局系统)
│  ├─ calculateListLayout() - 计算列表式布局
│  ├─ calculateGridLayout() - 计算网格式布局
│  └─ calculateSidebarLayout() - 计算侧栏式布局
│
└─ ItemMenuStylePresets (风格系统)
   ├─ pixelPreset() - 像素风预设
   ├─ darkPreset() - 暗黑风预设
   ├─ cartoonPreset() - 卡通风预设
   └─ scifiPreset() - 科幻风预设
```

---

## 📖 如何查看提案

### 快速开始
1. 打开 `SUMMARY.md` - 了解提案总体情况
2. 打开 `proposal.md` - 查看 OpenSpec 标准提案
3. 打开 `design.md` - 了解详细的架构设计

### 深入了解
1. 打开 `tasks.md` - 查看 23 个具体任务
2. 打开 `specs/*/spec.md` - 查看详细的能力规格

### 原始需求
- 打开 `prompt.md` - 查看用户原始需求

---

## ✨ 提案亮点

1. **完整设计** - 从架构到代码都有详细文档
2. **规范化** - 严格遵守 OpenSpec 标准格式
3. **可实现性强** - 包含伪代码和具体的实现方案
4. **高扩展性** - 易于添加新的布局或风格
5. **用户友好** - 3×4 = 12 种组合满足多种需求

---

## 🚀 实现计划

### 第一阶段：核心渲染引擎(3 个任务)
- 创建菜单渲染基类
- 实现菜单工具基类
- 集成到工具管理器

### 第二阶段：布局系统(4 个任务)
- 实现列表式布局
- 实现网格式布局
- 实现侧栏式布局
- 布局切换和配置

### 第三阶段：风格系统(5 个任务)
- 实现像素风格
- 实现暗黑风格
- 实现卡通风格
- 实现科幻风格
- 风格切换和参数调整

### 第四阶段：交互和高亮(4 个任务)
- 实现鼠标悬停检测
- 实现物品高亮效果
- 实现简单的动画框架
- 物品点击和选择逻辑

### 第五阶段：测试和优化(4 个任务)
- 单元测试
- 集成测试
- 性能优化
- UI 完善

### 第六阶段：文档和交付(3 个任务)
- 代码文档
- 用户文档
- 验证和交付

---

## 📝 格式规范

本提案严格遵守以下 OpenSpec 规范：

- ✅ `proposal.md` 包含 ## Why / ## What Changes / ## Impact 三部分
- ✅ `tasks.md` 中每个任务都有 [ ] 复选框
- ✅ `spec.md` 文件包含 ### Requirement 和 #### Scenario
- ✅ 所有内容使用中文编写
- ✅ 包含完整的代码设计和实现方案

---

## 🎓 核心数据结构

### MenuConfig (菜单配置对象)

```javascript
{
  layout: 'grid',              // 布局类型
  style: 'pixel',              // 风格类型
  items: [...],                // 物品数组
  layout_params: {...},        // 布局参数
  hover_index: -1,             // 悬停物品索引
  selected_index: -1,          // 选中物品索引
  positions: [...],            // 物品实际位置
  style_params: {...}          // 风格参数
}
```

### Item (物品对象)

```javascript
{
  id: number,                  // 唯一标识
  icon: string,                // 图标(emoji)
  name: string,                // 物品名称
  quantity?: number,           // 数量(可选)
  rarity?: string,             // 稀有度(可选)
  disabled?: boolean           // 是否禁用(可选)
}
```

---

## 📚 规格统计

| 模块 | Requirement 数 | Scenario 数 |
|------|-----------------|------------|
| 核心功能 | 6 | 18 |
| 布局系统 | 6 | 20 |
| 风格系统 | 5 | 25 |
| **总计** | **17** | **63** |

---

## 🔄 集成流程

```
用户点击工具栏"物品菜单"按钮
  ↓
GameItemMenuTool 被激活
  ↓
初始化菜单(默认 12 物品、网格布局、像素风)
  ↓
显示工具选项面板(布局、风格、物品数量)
  ↓
用户选择参数
  ↓
Canvas 实时预览菜单效果
  ↓
鼠标悬停/点击物品
  ↓
显示高亮/选中效果
```

---

## ✅ 审核清单

在批准实现前，请检查：

- [ ] 需求理解是否正确
- [ ] 架构设计是否合理
- [ ] 工作量拆分是否合理
- [ ] 规格定义是否完整
- [ ] 代码设计是否可实现

---

## 📞 提案信息

- **变更ID**: add-game-item-menu-renderer
- **创建时间**: 2026-03-01 CST
- **状态**: 📋 待审核
- **预计实现周期**: 2-3 周
- **预计代码行数**: 2,500-3,000 行

---

**提案已准备好进入审核和批准流程！** ✅

