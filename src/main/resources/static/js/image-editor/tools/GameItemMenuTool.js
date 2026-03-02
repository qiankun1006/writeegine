/**
 * GameItemMenuTool.js - 游戏物品菜单绘图工具
 * 继承 Tool 基类，集成到图片编辑器工具系统
 */

/**
 * GameItemMenuTool - 游戏物品菜单绘图工具
 * 允许用户在图片编辑器中设计和预览游戏物品菜单
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
    this.renderer.init();

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
    if (this.renderer) {
      this.renderer.destroy();
    }
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
    if (!this.layoutEngine || !this.menuConfig) return;

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
    if (!this.menuConfig || !editor.renderer) return;

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
    if (!this.menuConfig || !editor.renderer) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const clickIndex = this.getItemAtPoint(coords.x, coords.y);

    if (clickIndex >= 0) {
      this.menuConfig.selected_index = clickIndex;
      const item = this.menuConfig.items[clickIndex];
      console.log(`✓ 选中物品: ${item.name}`);
      editor.render();
    }
  }

  /**
   * 获取指定点上的物品索引
   */
  getItemAtPoint(x, y) {
    if (!this.menuConfig || !this.menuConfig.positions) return -1;

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

    if (!this.menuConfig) return;

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
    if (this.animationFrameId) return; // 已在运行

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
   * 在屏幕左下方绘制菜单
   */
  render(ctx, editor) {
    if (!this.menuConfig || !this.renderer) return;

    // 保存上下文状态
    ctx.save();

    // 在屏幕坐标系中绘制菜单（屏幕左下方）
    // 计算菜单的显示位置
    const screenX = 20;  // 距屏幕左边 20px
    const screenY = editor.canvas.height - 220;  // 距屏幕底部 220px

    // 临时调整菜单配置中的位置信息（相对于屏幕坐标）
    const originalPositions = this.menuConfig.positions;
    this.menuConfig.positions = originalPositions.map(pos => ({
      ...pos,
      x: pos.x + screenX,
      y: pos.y + screenY
    }));

    // 渲染菜单
    this.isDrawing = true;
    this.renderer.render(ctx, this.menuConfig);
    this.isDrawing = false;

    // 恢复原始位置信息
    this.menuConfig.positions = originalPositions;

    // 恢复上下文状态
    ctx.restore();
  }
}

