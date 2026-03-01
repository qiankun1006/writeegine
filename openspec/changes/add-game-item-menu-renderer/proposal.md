# 提案：游戏物品菜单绘图工具

## Why

游戏 UI 开发中，物品菜单(物品栏、背包、装备栏等)是常见元素。当前图片编辑器缺乏快速绘制这类标准化 UI 组件的工具，游戏开发者需要：

1. **快速预览** 不同布局(列表、网格、侧栏)的物品菜单外观
2. **风格切换** 在不同游戏风格(像素、暗黑、卡通、科幻)下快速调整 UI
3. **悬停效果可视化** 在编辑器中看到物品高亮效果，而不仅仅是静态布局
4. **一键生成** 标准化的菜单模板，加速 UI 设计流程

## What Changes

### 新增 3 个能力模块

#### 1. 游戏物品菜单渲染器核心 (game-item-menu-renderer)
- 创建独立的菜单渲染引擎
- 支持在图片编辑器的 canvas 上动态绘制物品菜单
- 包括布局引擎、风格系统、交互处理

#### 2. 物品菜单布局系统 (item-menu-layout)
- 实现 3 种布局：列表式、图标网格式、侧边栏式
- 每种布局支持动态配置(物品数量、大小、间距等)
- 与风格系统解耦，可任意组合

#### 3. 物品菜单风格系统 (item-menu-style)
- 实现 4 种内置风格：像素风、暗黑风、卡通风、科幻风
- 每种风格定义：配色、字体、图标、边框、阴影、高亮效果
- 支持风格预设和自定义参数调整

### 集成到图片编辑器

- 在工具栏新增"物品菜单"工具按钮
- 在工具选项面板显示布局和风格切换器
- 支持在 canvas 上绘制和调试菜单效果
- 鼠标悬停高亮效果实时预览

## Impact

### 受影响的能力模块 (Affected specs)
- `game-item-menu-renderer` (新增)
- `item-menu-layout` (新增)
- `item-menu-style` (新增)

### 受影响的代码文件 (Affected code)
- **新建**: `src/main/resources/static/js/image-editor/tools/GameItemMenuTool.js` - 菜单工具主类
- **新建**: `src/main/resources/static/js/image-editor/renderer/ItemMenuRenderer.js` - 菜单渲染引擎
- **新建**: `src/main/resources/static/js/image-editor/renderer/ItemMenuLayoutEngine.js` - 布局引擎
- **新建**: `src/main/resources/static/js/image-editor/renderer/ItemMenuStylePresets.js` - 风格预设
- **修改**: `src/main/resources/templates/create-game-image.html` - 新增菜单工具脚本加载
- **修改**: `src/main/resources/static/js/image-editor/app.js` - 注册新工具到工具管理器
- **修改**: `src/main/resources/static/js/image-editor/ImageEditor.js` - 工具集成入口(如需)

### 向后兼容性
- 完全新增功能，不影响现有工具
- 仅在工具栏新增一个按钮，无破坏性改动

