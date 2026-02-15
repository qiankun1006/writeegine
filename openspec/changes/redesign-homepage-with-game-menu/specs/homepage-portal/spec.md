# 规格文档：游戏创作平台首页门户

## 概述

首页门户是整个游戏创作平台的入口，提供三个核心功能的快捷导航，帮助用户快速进入各个模块。

---

## ADDED Requirements

### 需求 1：首页门户 UI 布局

#### Requirement
首页应该展示一个现代的游戏平台门户界面，包含：
1. 顶部导航栏（品牌名、导航链接）
2. 英雄区（欢迎文字、平台简介）
3. 功能菜单网格（3 个菜单卡片）
4. 页脚（版权信息）

#### Scenario: 用户首次访问首页
```
Given: 用户访问 http://localhost:8080/
When: 页面加载完成
Then:
  - 页面显示 "WriteMyself 游戏创作平台" 标题
  - 显示 "欢迎来到游戏创作平台" 英雄区
  - 显示三个菜单卡片：
    1. 创作游戏 (emoji: 🎮)
    2. 我的游戏 (emoji: 📚)
    3. 游戏广场 (emoji: 🌟)
  - 每个卡片有标题、描述、CTA按钮
  - 页面采用深色科技感主题
```

#### Scenario: 用户点击菜单卡片
```
Given: 用户在首页看到三个菜单卡片
When: 用户点击"创作游戏"卡片
Then:
  - 跳转到 /create-game 页面
  - 编辑器界面正常加载
```

---

### 需求 2：导航栏功能

#### Requirement
顶部导航栏应该提供快速访问各个主要功能的链接，并标识当前页面。

#### Scenario: 导航栏链接
```
Given: 用户在任何页面
When: 查看顶部导航栏
Then:
  - 显示 "✨ WriteMyself" 品牌名
  - 显示导航链接：首页、我的游戏、游戏广场
  - 当前页面的链接高亮显示
  - 点击链接能正确跳转到对应页面
```

---

### 需求 3：响应式设计

#### Requirement
首页应该在所有屏幕尺寸上都能正常显示。

#### Scenario: 在移动设备上访问首页
```
Given: 用户在手机（< 768px）上访问首页
When: 页面加载完成
Then:
  - 菜单卡片从 3 列变为 1 列
  - 导航栏改为竖直堆叠
  - 所有内容可读且易于交互
  - 没有内容溢出屏幕
```

#### Scenario: 在平板上访问首页
```
Given: 用户在平板（768px - 1024px）上访问首页
When: 页面加载完成
Then:
  - 菜单卡片显示为 2 列或 3 列（自适应）
  - 页面布局合理
```

---

### 需求 4：主题样式

#### Requirement
首页应该采用与 Tilemap 编辑器一致的深色科技感主题。

#### Scenario: 颜色和样式
```
Given: 用户访问首页
When: 页面加载完成
Then:
  - 背景色：深灰黑 (#0f1419 到 #1a1f2e 渐变)
  - 强调色：青蓝色 (#00d4ff)
  - 文字色：亮灰白 (#e8e9ea)
  - 卡片有半透明玻璃态效果 (backdrop-filter: blur)
  - 按钮有渐变和发光效果
  - 悬停时有动画反馈
```

---

### 需求 5：内容管理

#### Requirement
首页内容应该可以通过后端动态配置。

#### Scenario: 首页菜单卡片内容
```
Given: 后端配置了菜单卡片信息
When: 用户访问首页
Then:
  - 页面显示后端提供的菜单卡片内容
  - 标题、描述、图标都可配置
  - CTA 按钮的链接指向正确的页面
```

---

## MODIFIED Requirements

### 修改要求：废弃旧首页功能

#### Requirement
原有的首页示例内容应该被替换。

#### Scenario: 首页内容更新
```
Given: 旧首页显示通用 Web 应用示例内容
When: 部署新首页
Then:
  - 旧的"功能特性"、"快速开始"等示例内容被移除
  - 新的游戏平台门户内容被加载
  - 页面标题从"欢迎使用WriteMyself系统"改为游戏平台相关文案
```

---

## REMOVED Requirements

### 移除要求：移除不相关的示例内容

#### Requirement
首页不再显示通用 Web 框架的示例代码。

#### Scenario: 首页内容移除
```
Given: 旧首页包含 Thymeleaf 语法示例代码
When: 访问新首页
Then:
  - 不显示"Thymeleaf示例"部分
  - 不显示代码片段
  - 不显示示例的重复项循环
```

---

## 接口定义

### HTTP 路由

```
GET /                        返回首页 (index.html)
GET /create-game             返回创作游戏页面
GET /my-games                返回我的游戏列表页面
GET /game-plaza              返回游戏广场页面
```

### 模型数据

#### HomePage ViewModel
```json
{
  "title": "WriteMyself - 游戏创作平台",
  "brandName": "WriteMyself",
  "tagline": "游戏创作平台",
  "heroTitle": "欢迎来到游戏创作平台",
  "heroSubtitle": "使用直观的Tilemap编辑器创作属于你的游戏"
}
```

#### MenuCard Model
```json
{
  "id": "create-game",
  "icon": "🎮",
  "title": "创作游戏",
  "description": "使用强大的Tilemap编辑器，快速创建和编辑游戏地图",
  "ctaText": "开始创作 →",
  "ctaLink": "/create-game",
  "buttonType": "primary"
}
```

---

## 相关规格交叉引用

- 关联到 [Game Management](../game-management/spec.md) - 游戏管理功能
- 关联到 [Editor Integration](../editor-integration/spec.md) - 编辑器集成
- 继承 [Tilemap Editor](../../optimize-editor-ux-design/specs/game-engine-theme/spec.md) 的深色主题

---

## 验收标准

- ✅ 首页能正常加载，无编译错误
- ✅ 显示三个菜单卡片，图标、标题、描述、按钮都正确显示
- ✅ 点击卡片能正确跳转到对应页面
- ✅ 导航栏链接正常工作，当前页面高亮
- ✅ 在 desktop/tablet/mobile 上都能正常显示
- ✅ 颜色和样式与 Tilemap 编辑器主题一致
- ✅ 没有响应式设计问题（溢出、重叠等）

