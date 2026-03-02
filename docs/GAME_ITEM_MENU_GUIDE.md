# 游戏物品菜单工具使用指南

## 概述

游戏物品菜单工具是图片编辑器中的一个高级工具，允许游戏开发者在编辑器中设计和预览游戏物品菜单。支持多种布局和风格，能够快速创建游戏 UI 原型。

## 功能特性

### 1. **三种布局模式**
- **网格布局** (`grid`): 物品按网格排列，适合库存界面
- **列表布局** (`list`): 物品按列表排列，适合菜单面板
- **侧栏布局** (`sidebar`): 物品按竖向列表排列，适合装备栏

### 2. **四种风格预设**
- **像素风** (`pixel`): 8-bit 风格，鲜艳纯色配色
- **暗黑风** (`dark`): 压抑深沉风格，红金配色，带光晕效果
- **卡通风** (`cartoon`): 活泼可爱风格，圆角设计，多彩配色
- **科幻风** (`scifi`): 未来感科技风，霓虹发光效果，扫描线动画

### 3. **交互功能**
- **鼠标悬停高亮**: 物品在鼠标悬停时自动高亮显示
- **物品选中**: 点击物品可选中并在控制台显示选中信息
- **参数实时更新**: 修改工具选项时菜单立即更新

### 4. **实时预览**
- **即时渲染**: 所有设置改动立即在画布上显示
- **动画支持**: 可选启用/禁用菜单动画效果

## 快速开始

### 第一步：打开图片编辑器

访问图片编辑器页面：`http://localhost:8083/create-game/image`

### 第二步：激活物品菜单工具

1. 在工具栏找到 **🎮** 图标（物品菜单按钮）
2. 点击激活工具
3. 工具激活后，菜单会出现在屏幕左下方

### 第三步：配置菜单

在右侧的"工具选项"面板中，可以配置：

- **布局** (`layout`): 选择网格、列表或侧栏布局
- **风格** (`style`): 选择像素、暗黑、卡通或科幻风格
- **物品数量** (`item_count`): 1-12 个物品
- **启用动画** (`enable_animation`): 启用/禁用菜单动画

### 第四步：交互预览

- **鼠标悬停**: 将鼠标移到菜单上的任何物品上，查看高亮效果
- **点击选中**: 点击物品进行选中，控制台会显示选中信息
- **实时切换**: 在工具选项中修改参数，菜单立即更新

## 工具选项详解

### 布局选项 (layout)

| 值 | 名称 | 说明 |
|---|---|---|
| `grid` | 网格布局 | 物品按网格排列，类似游戏背包 |
| `list` | 列表布局 | 物品按行列排列，类似传统菜单 |
| `sidebar` | 侧栏布局 | 物品按竖向列表排列，适合装备栏 |

**布局参数配置**:
- `grid_cols`: 网格列数（默认 5）
- `grid_gap`: 网格间隙（默认 4px）
- `rows`: 列表行数（默认 4）
- `cols`: 列表列数（默认 3）
- `item_width`: 物品宽度（默认 60px）
- `item_height`: 物品高度（默认 60px）
- `gap`: 物品间隙（默认 8px）
- `sidebar_width`: 侧栏宽度（默认 180px）
- `item_height_sidebar`: 侧栏物品高度（默认 40px）

### 风格选项 (style)

| 值 | 名称 | 特点 | 高亮效果 |
|---|---|---|---|
| `pixel` | 像素风 | 纯色鲜艳，8-bit 配色 | 颜色反转 |
| `dark` | 暗黑风 | 深红紫黑，压抑感 | 橙色光晕 |
| `cartoon` | 卡通风 | 圆角多彩，可爱感 | 放大加阴影 |
| `scifi` | 科幻风 | 霓虹发光，机械感 | 扫描线动画 |

### 物品数量 (item_count)

- 范围：1-12
- 默认：12
- 效果：直接影响菜单中显示的物品数

### 启用动画 (enable_animation)

- 默认：开启
- 功能：启用/禁用菜单的动画效果（如科幻风的扫描线）

## 样式和配色

### 像素风格

```javascript
{
  bg_color: '#1a1a1a',         // 背景：深灰
  border_color: '#ffff00',      // 边框：黄色
  item_bg: '#333333',           // 物品背景：灰色
  item_hover_bg: '#ffaa00',     // 悬停背景：橙色
  text_color: '#ffffff',        // 文字：白色
  quantity_color: '#ffff00'     // 数量标签：黄色
}
```

### 暗黑风格

```javascript
{
  bg_color: '#0a0a0a',          // 背景：纯黑
  border_color: '#990000',      // 边框：深红
  item_bg: '#2a0000',           // 物品背景：暗红
  accent_color: '#ff6400',      // 强调色：橙色
  glow_color: 'rgba(255, 100, 0, 0.6)',  // 光晕：橙色半透明
  text_color: '#ffcccc'         // 文字：浅红
}
```

### 卡通风格

```javascript
{
  bg_color: '#e6f2ff',          // 背景：浅蓝
  border_color: '#333333',      // 边框：黑色
  item_bg: '#66ccff',           // 物品背景：蓝色
  item_hover_bg: '#ffdd66',     // 悬停背景：黄色
  item_selected_bg: '#ffff66',  // 选中背景：浅黄
  text_color: '#ffffff',        // 文字：白色
  corner_radius: 6              // 圆角半径：6px
}
```

### 科幻风格

```javascript
{
  bg_color: '#0a1a2a',          // 背景：深蓝黑
  border_color: '#0088ff',      // 边框：蓝色
  neon_color: '#00ffff',        // 霓虹色：青色
  text_color: '#00ff00',        // 文字：绿色
  scanline_color: 'rgba(0, 255, 255, 0.2)' // 扫描线：半透明青色
}
```

## 高级用法

### 自定义物品数据

在工具激活后，可以通过 JavaScript 控制台修改菜单的物品数据：

```javascript
// 获取激活的工具
const tool = editor.toolManager.getActiveTool();

// 访问菜单配置
if (tool && tool.menuConfig) {
  console.log(tool.menuConfig.items);  // 查看当前物品列表

  // 修改物品数据
  tool.menuConfig.items[0].quantity = 99;
  tool.menuConfig.selected_index = 0;

  // 重新渲染
  editor.render();
}
```

### 动态改变参数

```javascript
// 改变布局
tool.onOptionChange('layout', 'sidebar');

// 改变风格
tool.onOptionChange('style', 'scifi');

// 改变物品数量
tool.onOptionChange('item_count', 8);

// 禁用动画
tool.onOptionChange('enable_animation', false);
```

### 访问布局引擎

```javascript
if (tool && tool.layoutEngine) {
  // 获取特定布局的物品位置
  const positions = tool.layoutEngine.calculate(
    tool.menuConfig.items,
    'grid',
    tool.menuConfig.layout_params
  );

  console.log('物品位置:', positions);
  // 输出: [
  //   { x: 20, y: 20, width: 32, height: 32 },
  //   { x: 56, y: 20, width: 32, height: 32 },
  //   ...
  // ]
}
```

## 常见问题

### Q1: 如何导出菜单设计？

**A**: 菜单工具生成的是实时预览。要导出设计：

1. 使用 **截图工具**（如 Print Screen）或浏览器开发工具的截图功能
2. 或使用图片编辑器的导出功能导出整个画布为 PNG/JPG

### Q2: 如何在游戏中使用这个设计？

**A**: 菜单工具是 UI 设计工具，生成的是视觉参考。在游戏中使用时：

1. 参考菜单的配置参数（布局类型、风格、物品数量等）
2. 在游戏引擎中实现相同的布局和渲染逻辑
3. 使用工具提供的配色和尺寸参数

### Q3: 可以修改菜单的绘制位置吗？

**A**: 当前菜单固定在屏幕左下方。若需要修改，可以编辑 `GameItemMenuTool.js` 的 `render()` 方法中的位置参数：

```javascript
const screenX = 20;    // 距屏幕左边的距离
const screenY = editor.canvas.height - 220;  // 距屏幕底部的距离
```

### Q4: 如何添加自定义风格？

**A**: 编辑 `ItemMenuStylePresets.js` 文件，使用 `registerCustomStyle()` 方法：

```javascript
const presets = new ItemMenuStylePresets();
presets.registerCustomStyle('my-style', {
  bg_color: '#ff00ff',
  border_color: '#00ff00',
  // ... 其他参数
});

// 在工具选项中选择 'my-style'
```

## 测试

运行自动化测试可验证工具的基本功能：

1. 打开浏览器开发者工具（F12）
2. 在控制台中查看测试输出
3. 应显示类似以下信息：

```
🎮 游戏物品菜单工具 - 集成测试
✓ ItemMenuRenderer: function
✓ ItemMenuLayoutEngine: function
✓ ItemMenuStylePresets: function
✓ GameItemMenuTool: function
...
✅ 所有基础测试完成！
```

## 性能考虑

- **推荐物品数量**: 1-12 个（当前支持范围）
- **布局计算**: 即时完成，无延迟
- **渲染性能**: 帧率 ≥ 60fps（取决于 Canvas 性能）
- **内存占用**: 低，预设数据约 50KB

## 技术规格

| 项目 | 规格 |
|---|---|
| 最大物品数 | 12 |
| 布局类型 | 3 种 |
| 风格预设 | 4 种 |
| 屏幕坐标绘制 | 是 |
| 响应式交互 | 是 |
| 动画支持 | 是 |
| 导出格式 | PNG/JPG（通过编辑器） |

## 文件结构

```
src/main/resources/static/js/image-editor/
├── renderer/
│   ├── ItemMenuRenderer.js           # 菜单渲染引擎
│   ├── ItemMenuLayoutEngine.js       # 布局计算引擎
│   └── ItemMenuStylePresets.js       # 风格预设管理
├── tools/
│   └── GameItemMenuTool.js           # 菜单工具主类
└── game-item-menu-test.js            # 测试脚本
```

## 支持与反馈

如有问题或建议，请：

1. 检查浏览器控制台是否有错误信息
2. 运行测试脚本验证功能正常性
3. 查阅本指南中的常见问题部分
4. 查看代码中的 JSDoc 注释了解 API 详情

## 许可证

本工具是 WriteEngine 图片编辑器的一部分，遵循项目许可证。

---

**版本**: 1.0
**最后更新**: 2026-03-01
**作者**: CatPaw AI Assistant

