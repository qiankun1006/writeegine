# 能力规格：物品菜单风格系统

## 概述

物品菜单风格系统定义了四种不同的游戏美术风格，每种风格包含独特的配色、字体、边框、阴影和高亮效果。系统支持风格预设加载、参数调整和风格切换。

---

## Requirement: 像素风格

### 定义

像素风格模仿复古像素艺术，采用鲜艳纯色、硬边界、栅格对齐的设计。

#### Scenario: 像素风外观特征

- **Given** 用户选择像素风格
- **When** 菜单被渲染
- **Then** 菜单呈现以下视觉特征：
  - 背景色：`#333333` (深灰)
  - 边框色：`#aaaaaa` (浅灰)
  - 边框宽度：1px，硬边界(无抗锯齿)
  - 高亮色：`#ffaa00` (橙色)
  - 字体：等宽字体(monospace)，粗体
  - 物品图标大小：24px

#### Scenario: 像素风高亮效果

- **Given** 用户鼠标悬停在物品上
- **When** 菜单渲染高亮状态
- **Then**
  - 物品背景色变为 `#ffaa00` (高亮色)
  - 物品边框色变为 `#ffff00` (黄色)
  - 边框宽度保持 1px
  - 如果物品有数量标记，颜色变为 `#ffff00`

#### Scenario: 像素风选中效果

- **Given** 用户点击了物品
- **When** 物品进入选中状态
- **Then**
  - 物品背景色为 `#ffff00` (黄色)
  - 这与高亮效果区别明显

#### Scenario: 像素风禁用物品

- **Given** 物品设置了 `disabled: true`
- **When** 菜单渲染该物品
- **Then**
  - 物品图标色变为 `#666666` (暗灰)
  - 其他元素正常渲染
  - 点击禁用物品无效

#### Scenario: 像素风参数

- **Given** 像素风格被加载
- **When** 获取风格参数
- **Then** 参数包括：
  - `name`: '像素风'
  - `bg_color`: '#333333'
  - `border_color`: '#aaaaaa'
  - `border_width`: 1
  - `highlight_color`: '#ffaa00'
  - `text_color`: '#ffffff'
  - `glow_strength`: 0 (无光晕)
  - `animation_speed`: 1.0

---

## Requirement: 暗黑风格

### 定义

暗黑风格采用深色调、发光边界、内阴影，呈现神秘压抑的氛围。

#### Scenario: 暗黑风外观特征

- **Given** 用户选择暗黑风格
- **When** 菜单被渲染
- **Then** 菜单呈现以下视觉特征：
  - 背景色：`#1a0000` (深红黑)
  - 背景渐变：从 `#2a0000` 到 `#1a0000` (营造深度)
  - 边框色：`#660000` (深红)
  - 边框宽度：2px
  - 高亮色：`#ff6600` (深橙)
  - 文字色：`#ffcccc` (浅粉)
  - 字体：衬线字体(serif)，给予高贵感

#### Scenario: 暗黑风高亮效果

- **Given** 用户鼠标悬停在物品上
- **When** 菜单渲染高亮状态
- **Then**
  - 物品背景透明度变化：`rgba(255, 100, 0, 0.3)` 覆盖层
  - 物品边框发光：`rgba(255, 100, 0, 0.6)` 的 2px 线条
  - 营造"火焰边光"效果
  - 内部暗下来，边缘亮起来

#### Scenario: 暗黑风物品名称

- **Given** 菜单渲染物品
- **When** 文字被绘制
- **Then**
  - 物品名称显示在图标下方
  - 文字大小：10px
  - 文字色：`#ccccaa` (略带绿的米色)
  - 营造古代卷轴感

#### Scenario: 暗黑风禁用物品

- **Given** 物品设置了 `disabled: true`
- **When** 菜单渲染该物品
- **Then**
  - 物品图标色变为 `#550000` (极深红)
  - 物品名称色变为 `#330000` (更暗)
  - 整体显得"灰暗无光"

#### Scenario: 暗黑风参数

- **Given** 暗黑风格被加载
- **When** 获取风格参数
- **Then** 参数包括：
  - `name`: '暗黑风'
  - `bg_color`: '#1a0000'
  - `border_color`: '#660000'
  - `border_width`: 2
  - `highlight_color`: '#ff6600'
  - `text_color`: '#ffcccc'
  - `glow_strength`: 0.8 (有光晕效果)
  - `animation_speed`: 1.0

---

## Requirement: 卡通风格

### 定义

卡通风格采用饱和鲜艳色、圆角、粗边框、活泼动画。

#### Scenario: 卡通风外观特征

- **Given** 用户选择卡通风格
- **When** 菜单被渲染
- **Then** 菜单呈现以下视觉特征：
  - 背景色：`#66ccff` (天蓝)
  - 边框色：`#333333` (黑色)
  - 边框宽度：2px，圆角半径 6px
  - 高亮色：`#ffdd66` (浅黄)
  - 文字色：`#ffffff` (白色)
  - 字体：无衬线字体(sans-serif)，粗体
  - 物品图标大小：28px
  - 物品数量显示：红色 `#ff3333`，加 "x" 前缀(如 x99)

#### Scenario: 卡通风高亮效果

- **Given** 用户鼠标悬停在物品上
- **When** 菜单渲染高亮状态
- **Then**
  - 物品背景色变为 `#ffdd66` (浅黄)
  - 物品轻微放大：scale(1.05)
  - 产生"弹性"的视觉反馈
  - 放大不会遮挡相邻物品(通过 z-order 或局部重绘)

#### Scenario: 卡通风圆角矩形

- **Given** 物品被渲染
- **When** 物品矩形被绘制
- **Then**
  - 四个角是 6px 半径的圆角
  - 边框跟随圆角轮廓
  - 不是简单的矩形，而是柔和的形状

#### Scenario: 卡通风禁用物品

- **Given** 物品设置了 `disabled: true`
- **When** 菜单渲染该物品
- **Then**
  - 物品图标色变为 `#999999` (浅灰)
  - 物品背景色变为 `#99ccff` (更浅的蓝)
  - 边框色保持黑色
  - 给人"淡化"的感觉

#### Scenario: 卡通风参数

- **Given** 卡通风格被加载
- **When** 获取风格参数
- **Then** 参数包括：
  - `name`: '卡通风'
  - `bg_color`: '#66ccff'
  - `border_color`: '#333333'
  - `border_width`: 2
  - `highlight_color`: '#ffdd66'
  - `text_color`: '#ffffff'
  - `glow_strength`: 0 (无光晕)
  - `animation_speed`: 1.5 (更快的动画)
  - `corner_radius`: 6 (圆角半径)

---

## Requirement: 科幻风格

### 定义

科幻风格采用冷色调、霓虹发光、扫描线效果，呈现未来感。

#### Scenario: 科幻风外观特征

- **Given** 用户选择科幻风格
- **When** 菜单被渲染
- **Then** 菜单呈现以下视觉特征：
  - 背景色：`#0a1a2a` (深蓝黑)
  - 边框色：`#0088ff` (鲜蓝)
  - 边框宽度：1px(正常)或 2px(悬停)
  - 高亮色：`#00ffff` (青绿)
  - 文字色：`#00ff00` (荧光绿)
  - 字体：等宽字体(monospace)，像代码
  - 物品图标大小：24px

#### Scenario: 科幻风扫描线效果

- **Given** 用户鼠标悬停在物品上
- **When** 菜单渲染高亮状态
- **Then**
  - 物品边框颜色变为 `#00ffff` (青绿)
  - 物品边框宽度变为 2px
  - 物品内部绘制水平扫描线
  - 扫描线间距 3px，颜色 `rgba(0, 255, 255, 0.2)` (半透明)
  - 营造 CRT 显示器或故障效果

#### Scenario: 科幻风物品名称

- **Given** 菜单渲染物品
- **When** 文字被绘制
- **Then**
  - 物品名称显示在图标下方
  - 文字大小：9px
  - 文字色：`#00ff00` (荧光绿)
  - 字体：等宽字体，像终端显示

#### Scenario: 科幻风禁用物品

- **Given** 物品设置了 `disabled: true`
- **When** 菜单渲染该物品
- **Then**
  - 物品图标色变为 `#008800` (暗绿)
  - 物品名称色变为 `#004400` (更暗)
  - 边框色保持蓝色但亮度降低
  - 整体显得"离线"或"无效"

#### Scenario: 科幻风参数

- **Given** 科幻风格被加载
- **When** 获取风格参数
- **Then** 参数包括：
  - `name`: '科幻风'
  - `bg_color`: '#0a1a2a'
  - `border_color`: '#0088ff'
  - `border_width`: 1
  - `highlight_color`: '#00ffff'
  - `text_color`: '#00ff00'
  - `glow_strength`: 1.2 (强光晕效果)
  - `animation_speed`: 1.0
  - `scanline_enabled`: true (启用扫描线)

---

## Requirement: 风格预设管理

### 定义

风格预设系统负责存储、加载、管理风格参数。

#### Scenario: 预设加载

- **Given** 菜单工具需要初始化
- **When** 调用 `stylePresets.getPreset('pixel')`
- **Then** 返回像素风格的完整参数对象

#### Scenario: 预设切换

- **Given** 用户在风格选择器中选择新风格
- **When** 菜单工具的 `onOptionChange('style', 'dark')` 被调用
- **Then**
  - `stylePresets.getPreset('dark')` 被调用
  - 菜单配置的 `style_params` 被更新
  - Canvas 重绘，显示新风格

#### Scenario: 预设参数结构

- **Given** 任何风格预设
- **When** 预设被加载
- **Then** 返回的参数对象至少包含：
  - `name`: 风格名称(用于调试)
  - `bg_color`: 背景颜色(hex 字符串)
  - `border_color`: 边框颜色
  - `border_width`: 边框宽度(像素)
  - `highlight_color`: 高亮颜色
  - `text_color`: 文字颜色
  - `glow_strength`: 光晕强度(0-1.5)
  - `animation_speed`: 动画速度倍数(0.5-2.0)
  - [风格特定参数]

#### Scenario: 风格特定参数

- **Given** 某些风格有独特的特性
- **When** 风格被加载
- **Then**
  - 卡通风：额外 `corner_radius` 参数
  - 科幻风：额外 `scanline_enabled` 参数
  - 其他风格可扩展添加参数

---

## Requirement: 风格参数调整和微调

### 定义

虽然系统提供预设风格，但用户可以微调某些参数以满足特定需求。

#### Scenario: 参数微调范围

- **Given** 用户要调整某个风格的参数
- **When** 参数被修改
- **Then** 支持的微调参数包括(通过工具选项面板)：
  - 高亮颜色的亮度(可选)
  - 边框宽度(可选)
  - 动画速度倍数(可选)
  - [其他可见的风格特定参数]

#### Scenario: 参数调整的实时预览

- **Given** 用户修改了一个风格参数
- **When** 参数值变化
- **Then**
  - 菜单配置的 `style_params` 被更新
  - Canvas 自动重绘
  - 用户看到新参数的效果

---

## Requirement: 风格间的视觉区别

### 定义

四种风格应在视觉上有明确区别，能够满足不同游戏类型的美术需求。

#### Scenario: 色彩对比

- **Given** 四种风格显示相同的物品菜单
- **When** 渲染完成
- **Then**
  - 像素风：中性色(灰色系)，复古感
  - 暗黑风：红色系，压抑感
  - 卡通风：蓝/黄色系，活泼感
  - 科幻风：蓝/绿色系，未来感
  - 四种风格在色彩上截然不同

#### Scenario: 边框风格差异

- **Given** 同一物品在不同风格中渲染
- **When** 渲染完成
- **Then**
  - 像素风：硬边界，1px
  - 暗黑风：发光边框，2px
  - 卡通风：圆角边框，2px
  - 科幻风：霓虹边框，1-2px
  - 边框风格各不相同

#### Scenario: 高亮效果差异

- **Given** 鼠标悬停在物品上，不同风格
- **When** 高亮效果被渲染
- **Then**
  - 像素风：颜色变化
  - 暗黑风：边光效果
  - 卡通风：放大 + 颜色变化
  - 科幻风：扫描线 + 边框变亮
  - 每种风格的高亮方式都独特

#### Scenario: 风格与游戏类型的匹配

- **Given** 开发者创建不同类型的游戏
- **When** 选择对应的物品菜单风格
- **Then**
  - 复古像素游戏 → 像素风
  - 暗黑系 RPG → 暗黑风
  - 轻度休闲游戏 → 卡通风
  - 科幻 MOBA/FPS → 科幻风
  - 风格与游戏氛围匹配

---

## 风格参数参考表

| 参数 | 像素风 | 暗黑风 | 卡通风 | 科幻风 |
|------|--------|--------|--------|--------|
| bg_color | #333333 | #1a0000 | #66ccff | #0a1a2a |
| border_color | #aaaaaa | #660000 | #333333 | #0088ff |
| border_width | 1px | 2px | 2px | 1px |
| highlight_color | #ffaa00 | #ff6600 | #ffdd66 | #00ffff |
| text_color | #ffffff | #ffcccc | #ffffff | #00ff00 |
| glow_strength | 0 | 0.8 | 0 | 1.2 |
| animation_speed | 1.0 | 1.0 | 1.5 | 1.0 |
| corner_radius | 0 | 0 | 6px | 0 |
| scanline_enabled | false | false | false | true |

