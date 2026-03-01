# 能力规格：物品菜单布局系统

## 概述

物品菜单布局系统负责根据用户选择的布局类型计算物品在 canvas 上的位置。系统支持三种标准布局：列表式、网格式、侧栏式，并允许通过参数灵活调整每种布局的尺寸和间距。

---

## Requirement: 列表式布局

### 定义

列表式布局将物品按行排列，每行固定列数，类似于传统物品栏。

#### Scenario: 基础列表排列

- **Given** 用户选择列表式布局，配置为 3 列 4 行，物品宽高 60×60，间距 8px
- **When** 布局引擎计算 12 个物品的位置
- **Then**
  - 第 0-2 个物品排在第 1 行：y=10
  - 第 3-5 个物品排在第 2 行：y=78 (60+8+10)
  - 第 6-8 个物品排在第 3 行：y=146
  - 第 9-11 个物品排在第 4 行：y=214
  - X 坐标从 10 开始，每个物品间隔 68 (60+8)

#### Scenario: 不完整行处理

- **Given** 布局为 3 列，但只有 5 个物品
- **When** 布局计算
- **Then**
  - 第 1 行有 3 个物品
  - 第 2 行有 2 个物品
  - 第 2 行的 2 个物品从左对齐，不会居中

#### Scenario: 列表式参数配置

- **Given** 用户需要修改列表的列数、间距、内边距
- **When** 通过 `layout_params` 更新参数
- **Then**
  - `cols`: 列数(默认 3)
  - `item_width`: 物品宽度(默认 60)
  - `item_height`: 物品高度(默认 60)
  - `gap`: 物品间距(默认 8)
  - `padding`: 菜单内边距(默认 10)

---

## Requirement: 网格式布局

### 定义

网格式布局是列表式布局的变体，强调规则的网格排列，通常用于图标密集显示。

#### Scenario: 密集网格排列

- **Given** 用户选择网格式布局，配置为 5 列，物品大小 50×50，网格间距 4px
- **When** 布局引擎计算 20 个物品的位置
- **Then**
  - 每行排列 5 个物品
  - X 坐标：10, 64, 118, 172, 226 (10 + i*54，其中 54=50+4)
  - Y 坐标：第 1 行 10，第 2 行 64，第 3 行 118，第 4 行 172
  - 形成规则的 5×4 网格

#### Scenario: 网格式参数配置

- **Given** 用户需要修改网格密度
- **When** 更新 `layout_params`
- **Then**
  - `grid_cols`: 网格列数(默认 5)
  - `grid_gap`: 网格间距(默认 4)
  - `item_width`: 物品宽度(使用与列表相同的参数)
  - `item_height`: 物品高度(使用与列表相同的参数)

#### Scenario: 网格与列表的区别

- **Given** 用户在两种布局间切换
- **When** 配置相同的列数、物品大小、间距
- **Then**
  - 网格和列表应计算出相同的位置
  - 区别在于渲染风格和视觉表现，而非位置计算

---

## Requirement: 侧栏式布局

### 定义

侧栏式布局将物品竖列排列在屏幕一侧，物品较大，适合展示少量重要物品及其描述。

#### Scenario: 竖列侧栏排列

- **Given** 用户选择侧栏式布局，侧栏宽 180px，物品高 40px，间距 8px
- **When** 布局引擎计算 6 个物品的位置
- **Then**
  - 所有物品的 X 坐标相同(10，内边距)
  - 所有物品的宽度相同(180，侧栏宽)
  - Y 坐标：10, 58, 106, 154, 202, 250 (每行间隔 48=40+8)

#### Scenario: 侧栏式参数配置

- **Given** 用户需要修改侧栏宽度和物品高度
- **When** 更新 `layout_params`
- **Then**
  - `sidebar_width`: 侧栏宽度(默认 180)
  - `item_height_sidebar`: 侧栏物品高度(默认 40)
  - `gap`: 物品间距(默认 8)
  - `padding`: 菜单内边距(默认 10)

#### Scenario: 侧栏滚动预留空间

- **Given** 侧栏配置支持可滚动区域
- **When** 物品数量超过可见范围
- **Then**
  - 布局应计算出所有物品的位置，即使超出可见范围
  - 渲染时由调用方(如 canvas 变换)处理裁剪

---

## Requirement: 布局计算公式和准确性

### 定义

布局引擎应按照明确的算法计算物品位置，确保位置准确。

#### Scenario: 位置计算准确性

- **Given** 任何布局、任何物品数量
- **When** 布局计算完成
- **Then**
  - 返回的 `positions` 数组长度等于物品数量
  - 每个位置对象包含 `{x, y, width, height}` 四个属性
  - 所有坐标值都是非负整数或浮点数(取决于参数)

#### Scenario: 布局参数边界情况

- **Given** 用户输入极端参数值
- **When** 布局计算
- **Then**
  - 单列布局(cols=1)：物品竖列排列
  - 单行布局(由 item_count < cols 触发)：物品横列排列
  - 零间距(gap=0)：物品紧邻
  - 负值参数：应被忽略或使用默认值(防崩溃)

#### Scenario: 缓存和性能

- **Given** 用户频繁改变悬停位置，但布局参数未变
- **When** 同一配置再次调用布局计算
- **Then**
  - 布局引擎应缓存计算结果
  - 重复调用不会重新计算(可选优化)

---

## Requirement: 布局切换和动态更新

### 定义

用户应能无缝切换布局，菜单应立即显示新布局。

#### Scenario: 布局热切换

- **Given** 菜单当前显示网格布局，用户选择列表布局
- **When** 菜单工具调用 `updateLayout()`
- **Then**
  - 布局引擎重新计算物品位置
  - Canvas 自动重绘，显示新布局
  - 物品数据不丢失，只是位置变化
  - 悬停和选中状态被清除

#### Scenario: 布局参数微调

- **Given** 用户在工具选项面板调整列数或间距
- **When** 参数值变化
- **Then**
  - 菜单工具检测参数变化
  - 调用 `updateLayout()` 重新计算
  - 布局变化实时反映在 canvas 上

#### Scenario: 多个物品数量下的布局

- **Given** 用户将物品数量从 12 改为 20
- **When** 菜单重新生成物品数据并更新布局
- **Then**
  - 新的 20 个物品按当前布局排列
  - 如果新布局需要更多行/列，canvas 自动扩展显示范围

---

## Requirement: 布局与风格的分离

### 定义

布局系统和风格系统应相互独立，任何布局可配合任何风格使用。

#### Scenario: 布局风格无关性

- **Given** 用户使用列表布局配合像素风，然后切换到卡通风
- **When** 只修改风格，不修改布局
- **Then**
  - 物品位置不变
  - 只有渲染方式(颜色、边框、效果)改变
  - 布局计算逻辑不涉及风格信息

#### Scenario: 风格布局组合

- **Given** 系统有 3 种布局 × 4 种风格 = 12 种组合
- **When** 用户选择任意组合
- **Then**
  - 所有 12 种组合都能正常工作
  - 位置计算与风格渲染完全解耦

---

## Requirement: 边界和容器管理

### 定义

布局系统应跟踪菜单的总体边界，支持背景和边框绘制。

#### Scenario: 菜单整体边界计算

- **Given** 布局计算完成，返回所有物品的位置
- **When** 菜单渲染器需要绘制背景
- **Then**
  - 渲染器从 `positions` 数组计算菜单边界
  - `minX = min(positions[*].x)`
  - `minY = min(positions[*].y)`
  - `maxX = max(positions[*].x + positions[*].width)`
  - `maxY = max(positions[*].y + positions[*].height)`
  - 背景矩形 = (minX-padding, minY-padding, maxX-minX+2*padding, maxY-minY+2*padding)

#### Scenario: 不同布局的边界特性

- **Given** 三种布局(列表、网格、侧栏)
- **When** 菜单边界被计算
- **Then**
  - 列表式：通常呈矩形，宽度较小
  - 网格式：通常呈方形，宽高接近
  - 侧栏式：通常呈竖长矩形

---

## 位置计算算法伪代码

```
算法：calculateListLayout(items, params)
输入：items（物品数组），params（参数对象）
输出：positions（位置数组）

x ← params.padding
y ← params.padding
positions ← []

对于 i=0 到 len(items)-1 做：
  positions.push({
    x: x,
    y: y,
    width: params.item_width,
    height: params.item_height
  })

  x ← x + params.item_width + params.gap

  如果 (i + 1) % params.cols == 0 则：
    x ← params.padding
    y ← y + params.item_height + params.gap

返回 positions
```

```
算法：calculateGridLayout(items, params)
[与 calculateListLayout 相同，仅参数名不同]
```

```
算法：calculateSidebarLayout(items, params)
输入：items（物品数组），params（参数对象）
输出：positions（位置数组）

y ← params.padding
positions ← []

对于 i=0 到 len(items)-1 做：
  positions.push({
    x: params.padding,
    y: y,
    width: params.sidebar_width,
    height: params.item_height_sidebar
  })

  y ← y + params.item_height_sidebar + params.gap

返回 positions

