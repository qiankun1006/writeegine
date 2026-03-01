# 设计文档：游戏物品菜单绘图工具

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│              GameItemMenuTool (工具主类)                 │
│          继承 Tool，与图片编辑器深度集成                  │
└────────┬─────────────────────────────────────────────────┘
         │
         ├─ ItemMenuRenderer (渲染引擎)
         │   └─ 根据配置绘制菜单到 canvas
         │
         ├─ ItemMenuLayoutEngine (布局系统)
         │   ├─ ListLayout (列表式)
         │   ├─ GridLayout (网格式)
         │   └─ SidebarLayout (侧栏式)
         │
         └─ ItemMenuStylePresets (风格系统)
             ├─ PixelStyle (像素风)
             ├─ DarkStyle (暗黑风)
             ├─ CartoonStyle (卡通风)
             └─ SciFiStyle (科幻风)
```

## 核心数据结构

### 菜单配置对象 (MenuConfig)

```javascript
{
  // 基础配置
  layout: 'grid',              // 'list' | 'grid' | 'sidebar'
  style: 'pixel',              // 'pixel' | 'dark' | 'cartoon' | 'scifi'

  // 物品数据
  items: [
    { id: 0, icon: '⚔️', name: '长剑', rarity: 'rare' },
    { id: 1, icon: '🛡️', name: '铁盾', rarity: 'common' },
    // ...
  ],

  // 布局参数
  layout_params: {
    // 列表式
    rows: 4,              // 行数(列表式)
    cols: 3,              // 列数(列表式)
    item_width: 60,       // 物品宽度
    item_height: 60,      // 物品高度
    gap: 8,               // 物品间距
    padding: 10,          // 菜单内边距

    // 网格式
    grid_cols: 5,         // 网格列数
    grid_gap: 4,          // 网格间距

    // 侧栏式
    sidebar_width: 180,   // 侧栏宽度
    item_height_sidebar: 40,
  },

  // 交互状态
  hover_index: -1,        // 当前悬停物品索引 (-1 = 无)
  selected_index: -1,     // 当前选中物品索引

  // 位置信息 (由渲染器计算)
  positions: [            // 物品实际位置(由布局引擎填充)
    { x: 10, y: 10, width: 60, height: 60 },
    // ...
  ],

  // 风格参数
  style_params: {
    // 通用
    bg_color: '#1a1a1a',
    border_color: '#ff0000',
    border_width: 2,

    // 风格特定
    highlight_color: '#ff6600',
    glow_strength: 1.0,
    animation_speed: 1.0,
  }
}
```

### 物品对象 (Item)

```javascript
{
  id: number,             // 唯一标识
  icon: string,           // 图标(emoji或 URL)
  name: string,           // 物品名称
  quantity?: number,      // 数量(可选，如 99x)
  rarity?: string,        // 稀有度(common|uncommon|rare|epic|legendary)
  disabled?: boolean,     // 是否禁用
}
```

## 文件设计

### 1. GameItemMenuTool.js (菜单工具主类)

```javascript
/**
 * GameItemMenuTool - 游戏物品菜单绘图工具
 * 继承 Tool 基类，集成到图片编辑器工具系统
 */
class GameItemMenuTool extends Tool {
  constructor() {
    super({
      id: 'game-item-menu',
      name: '物品菜单',
      icon: '🎮',
      cursor: 'default',
      category: 'effects',
      options: {
        layout: 'grid',              // 布局类型
        style: 'pixel',              // 风格类型
        item_count: 12,              // 物品数量
        show_grid: true,             // 显示网格线
        enable_animation: true,      // 启用动画
      }
    });

    this.renderer = null;            // 菜单渲染器实例
    this.layoutEngine = null;        // 布局引擎实例
    this.stylePresets = null;        // 风格预设
    this.menuConfig = null;          // 当前菜单配置
    this.animationFrameId = null;    // 动画帧 ID
    this.isDrawing = false;          // 是否正在绘制
  }

  /**
   * 工具激活
   */
  activate(editor) {
    super.activate(editor);
    console.log('🎮 物品菜单工具已激活');

    // 初始化渲染器和引擎
    this.renderer = new ItemMenuRenderer();
    this.layoutEngine = new ItemMenuLayoutEngine();
    this.stylePresets = new ItemMenuStylePresets();

    // 创建初始菜单配置
    this.initMenuConfig();

    // 启动动画循环
    if (this.options.enable_animation) {
      this.startAnimation();
    }
  }

  /**
   * 工具停用
   */
  deactivate() {
    super.deactivate();
    console.log('❌ 物品菜单工具已停用');

    // 停止动画
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 清理资源
    this.renderer = null;
    this.layoutEngine = null;
    this.stylePresets = null;
    this.menuConfig = null;
  }

  /**
   * 初始化菜单配置
   */
  initMenuConfig() {
    // 生成示例物品数据
    const items = this.generateSampleItems(this.options.item_count);

    this.menuConfig = {
      layout: this.options.layout,
      style: this.options.style,
      items: items,
      layout_params: this.getDefaultLayoutParams(),
      hover_index: -1,
      selected_index: -1,
      positions: [],
      style_params: this.stylePresets.getPreset(this.options.style),
    };

    // 计算布局
    this.updateLayout();
  }

  /**
   * 生成示例物品数据
   */
  generateSampleItems(count) {
    const icons = ['⚔️', '🛡️', '🏹', '🧪', '🔔', '💎', '📜', '🎁', '🔑', '🪃', '🎪', '⚡'];
    const names = ['长剑', '铁盾', '弓箭', '魔药', '铃铛', '钻石', '卷轴', '礼物', '钥匙', '回旋镖', '标志', '闪电'];
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    const items = [];
    for (let i = 0; i < Math.min(count, icons.length); i++) {
      items.push({
        id: i,
        icon: icons[i],
        name: names[i],
        quantity: Math.floor(Math.random() * 100),
        rarity: rarities[Math.floor(Math.random() * rarities.length)],
        disabled: Math.random() < 0.1,
      });
    }
    return items;
  }

  /**
   * 获取默认布局参数
   */
  getDefaultLayoutParams() {
    return {
      rows: 4,
      cols: 3,
      item_width: 60,
      item_height: 60,
      gap: 8,
      padding: 10,
      grid_cols: 5,
      grid_gap: 4,
      sidebar_width: 180,
      item_height_sidebar: 40,
    };
  }

  /**
   * 更新布局
   */
  updateLayout() {
    const layout = this.menuConfig.layout;
    const positions = this.layoutEngine.calculate(
      this.menuConfig.items,
      layout,
      this.menuConfig.layout_params
    );
    this.menuConfig.positions = positions;
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(e, editor) {
    if (!this.menuConfig) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const hoverIndex = this.getItemAtPoint(coords.x, coords.y);

    if (hoverIndex !== this.menuConfig.hover_index) {
      this.menuConfig.hover_index = hoverIndex;
      editor.render();
    }
  }

  /**
   * 鼠标点击事件
   */
  onMouseDown(e, editor) {
    if (!this.menuConfig) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const clickIndex = this.getItemAtPoint(coords.x, coords.y);

    if (clickIndex >= 0) {
      this.menuConfig.selected_index = clickIndex;
      console.log(`✓ 选中物品: ${this.menuConfig.items[clickIndex].name}`);
      editor.render();
    }
  }

  /**
   * 获取指定点上的物品索引
   */
  getItemAtPoint(x, y) {
    const positions = this.menuConfig.positions;
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      if (x >= pos.x && x <= pos.x + pos.width &&
          y >= pos.y && y <= pos.y + pos.height) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 工具选项变化
   */
  onOptionChange(option, value) {
    super.onOptionChange(option, value);

    if (option === 'layout' || option === 'style') {
      this.menuConfig[option] = value;
      if (option === 'layout') {
        this.updateLayout();
      } else if (option === 'style') {
        this.menuConfig.style_params = this.stylePresets.getPreset(value);
      }
    } else if (option === 'item_count') {
      this.menuConfig.items = this.generateSampleItems(value);
      this.updateLayout();
    } else if (option === 'enable_animation') {
      if (value) {
        this.startAnimation();
      } else if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    const editor = window.editor;
    if (editor) editor.render();
  }

  /**
   * 启动动画循环
   */
  startAnimation() {
    const animate = () => {
      const editor = window.editor;
      if (editor && this.isDrawing) {
        editor.render();
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * 自定义渲染
   */
  render(ctx, editor) {
    if (!this.menuConfig) return;

    this.isDrawing = true;
    this.renderer.render(ctx, this.menuConfig);
    this.isDrawing = false;
  }
}
```

### 2. ItemMenuRenderer.js (菜单渲染引擎)

```javascript
/**
 * ItemMenuRenderer - 菜单渲染引擎
 * 根据配置在 canvas 上绘制物品菜单
 */
class ItemMenuRenderer {
  /**
   * 主渲染函数
   */
  render(ctx, menuConfig) {
    ctx.save();

    // 绘制菜单背景
    this.drawBackground(ctx, menuConfig);

    // 绘制物品网格(如果启用)
    // this.drawGrid(ctx, menuConfig);

    // 绘制所有物品
    this.drawItems(ctx, menuConfig);

    ctx.restore();
  }

  /**
   * 绘制菜单背景
   */
  drawBackground(ctx, menuConfig) {
    const { positions, style_params } = menuConfig;
    if (positions.length === 0) return;

    // 计算菜单边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pos of positions) {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    }

    // 增加边距
    const padding = menuConfig.layout_params.padding || 10;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // 绘制背景
    ctx.fillStyle = style_params.bg_color || '#1a1a1a';
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

    // 绘制边框
    ctx.strokeStyle = style_params.border_color || '#ff0000';
    ctx.lineWidth = style_params.border_width || 2;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * 绘制所有物品
   */
  drawItems(ctx, menuConfig) {
    const { items, positions, hover_index, selected_index, style } = menuConfig;

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const item = items[i];
      const isHover = i === hover_index;
      const isSelected = i === selected_index;

      // 根据风格绘制物品
      this.drawItemByStyle(ctx, pos, item, isHover, isSelected, menuConfig);
    }
  }

  /**
   * 根据风格绘制单个物品
   */
  drawItemByStyle(ctx, pos, item, isHover, isSelected, menuConfig) {
    const { style, style_params } = menuConfig;

    switch (style) {
      case 'pixel':
        this.drawPixelItem(ctx, pos, item, isHover, isSelected, style_params);
        break;
      case 'dark':
        this.drawDarkItem(ctx, pos, item, isHover, isSelected, style_params);
        break;
      case 'cartoon':
        this.drawCartoonItem(ctx, pos, item, isHover, isSelected, style_params);
        break;
      case 'scifi':
        this.drawSciFiItem(ctx, pos, item, isHover, isSelected, style_params);
        break;
    }
  }

  /**
   * 绘制像素风物品
   */
  drawPixelItem(ctx, pos, item, isHover, isSelected, params) {
    ctx.save();

    // 背景
    ctx.fillStyle = isSelected ? '#ffff00' : (isHover ? '#ffaa00' : '#333333');
    ctx.fillRect(pos.x, pos.y, pos.width, pos.height);

    // 边框
    ctx.strokeStyle = isHover ? '#ffff00' : '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);

    // 图标
    ctx.font = '24px monospace';
    ctx.fillStyle = item.disabled ? '#666666' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, pos.x + pos.width / 2, pos.y + pos.height / 2 - 8);

    // 数量
    if (item.quantity) {
      ctx.font = '10px monospace';
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(item.quantity, pos.x + pos.width - 2, pos.y + pos.height - 2);
    }

    ctx.restore();
  }

  /**
   * 绘制暗黑风物品
   */
  drawDarkItem(ctx, pos, item, isHover, isSelected, params) {
    ctx.save();

    // 背景 - 渐变
    const gradient = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + pos.height);
    gradient.addColorStop(0, '#2a0000');
    gradient.addColorStop(1, '#1a0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(pos.x, pos.y, pos.width, pos.height);

    // 高亮效果
    if (isHover) {
      ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
      ctx.fillRect(pos.x, pos.y, pos.width, pos.height);

      // 外光晕
      ctx.strokeStyle = 'rgba(255, 100, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x + 1, pos.y + 1, pos.width - 2, pos.height - 2);
    } else {
      ctx.strokeStyle = '#660000';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);
    }

    // 图标
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = item.disabled ? '#550000' : '#ffcccc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, pos.x + pos.width / 2, pos.y + pos.height / 2 - 6);

    // 物品名称
    ctx.font = '10px serif';
    ctx.fillStyle = '#ccccaa';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(item.name, pos.x + pos.width / 2, pos.y + pos.height / 2 + 8);

    ctx.restore();
  }

  /**
   * 绘制卡通风物品
   */
  drawCartoonItem(ctx, pos, item, isHover, isSelected, params) {
    ctx.save();

    // 背景 - 圆角
    const radius = 6;
    ctx.fillStyle = isSelected ? '#ffff66' : (isHover ? '#ffdd66' : '#66ccff');
    this.roundRect(ctx, pos.x, pos.y, pos.width, pos.height, radius);
    ctx.fill();

    // 边框 - 粗线
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    this.roundRect(ctx, pos.x, pos.y, pos.width, pos.height, radius);
    ctx.stroke();

    // 高亮效果
    if (isHover) {
      ctx.scale(1.05, 1.05);
      ctx.translate(-pos.width * 0.025, -pos.height * 0.025);
    }

    // 图标
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = item.disabled ? '#999999' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, pos.x + pos.width / 2, pos.y + pos.height / 2 - 8);

    // 数量
    if (item.quantity) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ff3333';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('x' + item.quantity, pos.x + pos.width - 4, pos.y + pos.height - 4);
    }

    ctx.restore();
  }

  /**
   * 绘制科幻风物品
   */
  drawSciFiItem(ctx, pos, item, isHover, isSelected, params) {
    ctx.save();

    // 背景 - 深蓝/黑色
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(pos.x, pos.y, pos.width, pos.height);

    // 边框 - 霓虹蓝
    ctx.strokeStyle = isHover ? '#00ffff' : '#0088ff';
    ctx.lineWidth = isHover ? 2 : 1;
    ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);

    // 扫描线效果(高亮时)
    if (isHover) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      for (let y = pos.y; y < pos.y + pos.height; y += 3) {
        ctx.beginPath();
        ctx.moveTo(pos.x, y);
        ctx.lineTo(pos.x + pos.width, y);
        ctx.stroke();
      }
    }

    // 图标
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = isHover ? '#00ffff' : '#00ff00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, pos.x + pos.width / 2, pos.y + pos.height / 2 - 6);

    // 物品名称
    ctx.font = '9px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(item.name, pos.x + pos.width / 2, pos.y + pos.height / 2 + 8);

    ctx.restore();
  }

  /**
   * 辅助函数：绘制圆角矩形
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
```

### 3. ItemMenuLayoutEngine.js (布局引擎)

```javascript
/**
 * ItemMenuLayoutEngine - 菜单布局引擎
 * 计算物品在不同布局下的位置
 */
class ItemMenuLayoutEngine {
  /**
   * 计算布局
   * @param {Array} items - 物品数组
   * @param {string} layout - 布局类型 ('list'|'grid'|'sidebar')
   * @param {Object} params - 布局参数
   * @returns {Array} 位置数组
   */
  calculate(items, layout, params) {
    switch (layout) {
      case 'list':
        return this.calculateListLayout(items, params);
      case 'grid':
        return this.calculateGridLayout(items, params);
      case 'sidebar':
        return this.calculateSidebarLayout(items, params);
      default:
        return [];
    }
  }

  /**
   * 计算列表式布局
   */
  calculateListLayout(items, params) {
    const positions = [];
    const { item_width, item_height, gap, padding } = params;
    const cols = params.cols || 3;

    let x = padding;
    let y = padding;

    for (let i = 0; i < items.length; i++) {
      positions.push({
        x, y, width: item_width, height: item_height
      });

      x += item_width + gap;
      if ((i + 1) % cols === 0) {
        x = padding;
        y += item_height + gap;
      }
    }

    return positions;
  }

  /**
   * 计算网格式布局
   */
  calculateGridLayout(items, params) {
    const positions = [];
    const { item_width, item_height, grid_gap, padding } = params;
    const cols = params.grid_cols || 5;

    let x = padding;
    let y = padding;

    for (let i = 0; i < items.length; i++) {
      positions.push({
        x, y, width: item_width, height: item_height
      });

      x += item_width + grid_gap;
      if ((i + 1) % cols === 0) {
        x = padding;
        y += item_height + grid_gap;
      }
    }

    return positions;
  }

  /**
   * 计算侧栏式布局
   */
  calculateSidebarLayout(items, params) {
    const positions = [];
    const { sidebar_width, item_height_sidebar, gap, padding } = params;

    let y = padding;

    for (let i = 0; i < items.length; i++) {
      positions.push({
        x: padding,
        y,
        width: sidebar_width,
        height: item_height_sidebar
      });

      y += item_height_sidebar + gap;
    }

    return positions;
  }
}
```

### 4. ItemMenuStylePresets.js (风格预设)

```javascript
/**
 * ItemMenuStylePresets - 菜单风格预设管理
 */
class ItemMenuStylePresets {
  /**
   * 获取风格预设
   */
  getPreset(styleName) {
    const presets = {
      pixel: this.pixelPreset(),
      dark: this.darkPreset(),
      cartoon: this.cartoonPreset(),
      scifi: this.scifiPreset(),
    };
    return presets[styleName] || presets.pixel;
  }

  /**
   * 像素风预设
   */
  pixelPreset() {
    return {
      name: '像素风',
      bg_color: '#333333',
      border_color: '#aaaaaa',
      border_width: 1,
      highlight_color: '#ffaa00',
      text_color: '#ffffff',
      glow_strength: 0,
      animation_speed: 1.0,
    };
  }

  /**
   * 暗黑风预设
   */
  darkPreset() {
    return {
      name: '暗黑风',
      bg_color: '#1a0000',
      border_color: '#660000',
      border_width: 2,
      highlight_color: '#ff6600',
      text_color: '#ffcccc',
      glow_strength: 0.8,
      animation_speed: 1.0,
    };
  }

  /**
   * 卡通风预设
   */
  cartoonPreset() {
    return {
      name: '卡通风',
      bg_color: '#66ccff',
      border_color: '#333333',
      border_width: 2,
      highlight_color: '#ffdd66',
      text_color: '#ffffff',
      glow_strength: 0,
      animation_speed: 1.5,
    };
  }

  /**
   * 科幻风预设
   */
  scifiPreset() {
    return {
      name: '科幻风',
      bg_color: '#0a1a2a',
      border_color: '#0088ff',
      border_width: 1,
      highlight_color: '#00ffff',
      text_color: '#00ff00',
      glow_strength: 1.2,
      animation_speed: 1.0,
    };
  }
}
```

## 集成点

### 修改 app.js

```javascript
// 在 setupEventListeners() 中添加菜单工具按钮事件
document.getElementById('gameItemMenuBtn').addEventListener('click', () => {
  editor.activateTool('game-item-menu');
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('gameItemMenuBtn').classList.add('active');
  console.log('✓ 物品菜单工具已激活');
});
```

### 修改 create-game-image.html

```html
<!-- 在 <body> 末尾添加脚本加载 -->
<script src="/static/js/image-editor/renderer/ItemMenuRenderer.js"></script>
<script src="/static/js/image-editor/renderer/ItemMenuLayoutEngine.js"></script>
<script src="/static/js/image-editor/renderer/ItemMenuStylePresets.js"></script>
<script src="/static/js/image-editor/tools/GameItemMenuTool.js"></script>
```

## 交互流程

```
用户点击工具栏"物品菜单"按钮
  ↓
GameItemMenuTool 被激活
  ↓
初始化菜单配置 (默认网格布局、像素风)
  ↓
用户在工具选项面板选择:
  - 布局: list | grid | sidebar
  - 风格: pixel | dark | cartoon | scifi
  - 物品数量: 1-50
  ↓
updateLayout() 重新计算物品位置
  ↓
鼠标移动到物品上
  ↓
getItemAtPoint() 检测悬停物品
  ↓
更新 hover_index，触发重绘
  ↓
render() 方法根据风格绘制高亮效果
  ↓
用户点击物品
  ↓
onMouseDown() 更新 selected_index
  ↓
触发提示信息(已选中 XX 物品)
```

## 性能考虑

1. **缓存** - 布局计算结果缓存，仅在布局或物品数量变化时重新计算
2. **渲染优化** - 只绘制可见区域的物品(适用于大列表)
3. **动画帧** - 使用 requestAnimationFrame，仅在需要时更新
4. **内存** - 及时清理资源，避免内存泄漏

## 扩展点

1. **自定义风格** - 用户可创建新的风格预设
2. **物品数据管理** - 从外部 JSON 或数据库加载物品
3. **拖拽排序** - 添加物品拖拽功能
4. **导出** - 将菜单设计导出为图片或代码

