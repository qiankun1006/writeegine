# 能力规格：游戏物品菜单渲染器核心

## 概述

游戏物品菜单渲染器是图片编辑器中的一个新工具，允许游戏开发者在 canvas 上动态绘制和预览物品菜单的高亮效果。该模块提供菜单管理、渲染、交互的完整基础设施。

---

## Requirement: 菜单工具基础功能

### 定义

菜单工具应能作为图片编辑器的标准工具集成，支持激活/停用、配置管理、事件处理。

#### Scenario: 工具激活和初始化

- **Given** 用户在图片编辑器中点击工具栏上的"物品菜单"按钮
- **When** 工具管理器接收激活命令
- **Then**
  - GameItemMenuTool 被激活
  - 内部渲染器、布局引擎、风格系统初始化
  - 创建默认菜单配置(12 个示例物品，网格布局，像素风)
  - 工具选项面板显示布局、风格、物品数量等参数

#### Scenario: 工具停用和清理

- **Given** 用户切换到其他工具
- **When** 当前工具接收停用命令
- **Then**
  - 动画循环停止
  - 渲染资源释放
  - 菜单配置被清空
  - 不会留下内存泄漏

---

## Requirement: 菜单配置和参数

### 定义

菜单应支持通过配置对象管理其结构、样式、交互状态。

#### Scenario: 配置对象结构

- **Given** 菜单工具初始化
- **When** 创建菜单配置对象
- **Then** 配置包含以下字段：
  - `layout`: 布局类型
  - `style`: 风格类型
  - `items`: 物品数组
  - `layout_params`: 布局参数
  - `hover_index`: 当前悬停物品索引
  - `selected_index`: 当前选中物品索引
  - `positions`: 物品实际位置数组
  - `style_params`: 风格参数字典

#### Scenario: 参数动态更新

- **Given** 用户在工具选项面板修改参数(如改变布局从 grid 到 list)
- **When** `onOptionChange()` 被调用
- **Then**
  - 菜单配置更新
  - 布局重新计算
  - Canvas 自动重绘

#### Scenario: 物品数据结构

- **Given** 菜单配置被初始化
- **When** 物品数组被生成
- **Then** 每个物品包含：
  - `id`: 唯一标识符(数字)
  - `icon`: 图标(emoji 字符串)
  - `name`: 物品名称(字符串)
  - `quantity`: 数量(可选，数字)
  - `rarity`: 稀有度等级(可选，string 枚举)
  - `disabled`: 是否禁用(可选，布尔值)

---

## Requirement: 菜单渲染到 Canvas

### 定义

菜单渲染器应能根据配置在 canvas 上高效地绘制菜单及其交互反馈。

#### Scenario: 基础菜单绘制

- **Given** 菜单工具激活且配置完成
- **When** `render(ctx, menuConfig)` 被调用
- **Then**
  - 菜单背景被绘制
  - 所有物品按布局位置绘制
  - 边框、阴影等装饰元素被渲染
  - 绘制不会超出 canvas 范围

#### Scenario: 高亮效果渲染

- **Given** 用户鼠标悬停在某个物品上
- **When** 菜单配置的 `hover_index` 被更新
- **Then**
  - 悬停物品的高亮效果被渲染
  - 根据不同风格显示不同的高亮方式(如像素风反色、科幻风发光)
  - 高亮效果清晰可见且不遮挡其他物品

#### Scenario: 选中状态显示

- **Given** 用户点击了一个物品
- **When** 菜单配置的 `selected_index` 被更新
- **Then**
  - 选中物品使用不同的视觉反馈(如更强的高亮、边框)
  - 选中状态与悬停状态有明确区别
  - 选中状态在 canvas 上正确显示

---

## Requirement: 鼠标交互和点击检测

### 定义

菜单应支持鼠标悬停和点击检测，能准确识别用户操作的物品。

#### Scenario: 鼠标悬停检测

- **Given** 用户在图片编辑器 canvas 上移动鼠标
- **When** 鼠标位置经过物品区域
- **Then**
  - 工具的 `onMouseMove()` 被调用
  - 点击检测算法计算鼠标坐标对应的物品索引
  - 如果索引变化，`hover_index` 被更新
  - Canvas 重绘以显示新的高亮效果

#### Scenario: 鼠标点击检测

- **Given** 用户在某个物品上点击鼠标左键
- **When** 工具的 `onMouseDown()` 被调用
- **Then**
  - 点击检测算法计算点击坐标对应的物品
  - 如果点击了物品，`selected_index` 被更新
  - 控制台输出选中物品的信息(如 "✓ 选中物品: 长剑")
  - Canvas 重绘以显示选中状态

#### Scenario: 点击检测的准确性

- **Given** 物品使用不同布局(列表、网格、侧栏)
- **When** 用户在物品边界附近移动鼠标
- **Then**
  - 点击检测只在物品矩形范围内触发
  - 物品之间的间隙不会被错误识别为物品
  - 不同布局下的检测逻辑都准确

---

## Requirement: 动画和实时更新

### 定义

菜单应支持平滑的实时更新和动画效果。

#### Scenario: 动画循环管理

- **Given** 工具选项中 `enable_animation` 被设置为 true
- **When** 工具激活
- **Then**
  - `requestAnimationFrame` 循环被启动
  - 循环持续调用 `editor.render()`，保持菜单更新
  - 动画帧率与浏览器同步(通常 60fps)

#### Scenario: 动画停止

- **Given** 用户禁用了 `enable_animation` 或切换到其他工具
- **When** 工具停用或选项变化
- **Then**
  - `requestAnimationFrame` 循环被正确取消
  - 不会继续消耗 CPU 资源

#### Scenario: 风格特定动画

- **Given** 用户选择不同风格(如科幻风)
- **When** 鼠标悬停在物品上
- **Then**
  - 动画效果根据风格变化(如科幻风的扫描线)
  - 动画动作流畅，无闪烁或跳帧

---

## Requirement: 工具选项面板集成

### 定义

菜单工具应在图片编辑器的工具选项面板中提供参数控制。

#### Scenario: 参数控制显示

- **Given** 菜单工具被激活
- **When** 图片编辑器更新工具选项面板
- **Then** 面板显示以下参数：
  - 布局选择器(下拉菜单：list / grid / sidebar)
  - 风格选择器(下拉菜单：pixel / dark / cartoon / scifi)
  - 物品数量滑块(1-50)
  - 启用动画复选框

#### Scenario: 参数修改反馈

- **Given** 用户修改任何参数
- **When** 参数值变化被检测
- **Then**
  - `onOptionChange()` 被调用
  - 菜单配置即时更新
  - Canvas 自动重绘，显示新的菜单状态
  - 不需要用户手动刷新

#### Scenario: 参数说明提示

- **Given** 用户将鼠标悬停在参数标签上
- **When** `title` 属性被设置
- **Then** 显示参数说明提示(如 "选择菜单布局方式")

---

## Requirement: 资源管理和性能

### 定义

菜单工具应高效管理资源，不引起显著的性能下降。

#### Scenario: 内存清理

- **Given** 工具被停用
- **When** `deactivate()` 被调用
- **Then**
  - 所有内部对象被设置为 null
  - 不会产生内存泄漏
  - 再次激活工具时可正常初始化

#### Scenario: 大数量物品性能

- **Given** 菜单配置了 50 个物品
- **When** 用户在菜单上移动鼠标
- **Then**
  - 帧率保持 ≥ 60fps
  - 没有明显的卡顿或延迟

#### Scenario: 布局计算缓存

- **Given** 用户频繁改变悬停位置
- **When** 布局参数未改变
- **Then**
  - 布局计算结果被缓存
  - 不会重复计算相同的物品位置

---

## 交互示意图

```
工具栏 → 物品菜单按钮
         ↓
     工具激活 (activate)
         ↓
 初始化配置、渲染器、引擎
         ↓
   工具选项面板显示参数
    (布局、风格、数量等)
         ↓
用户调整参数 → onOptionChange()
             ↓
         配置更新
             ↓
      布局重新计算
             ↓
         Canvas 重绘
         ↓
  鼠标移动 → onMouseMove()
         ↓
  点击检测计算 hover_index
         ↓
      Canvas 重绘(显示高亮)
         ↓
  用户点击 → onMouseDown()
         ↓
    点击检测计算 selected_index
         ↓
  更新选中状态、输出信息
         ↓
      Canvas 重绘(显示选中)

