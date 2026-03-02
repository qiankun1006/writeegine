/**
 * ItemMenuRenderer.js - 菜单渲染引擎
 * 根据配置在 canvas 上绘制物品菜单
 */

/**
 * ItemMenuRenderer - 菜单渲染引擎
 * 负责根据配置在 canvas 上高效地绘制菜单及其交互反馈
 */
class ItemMenuRenderer {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化渲染器
   */
  init() {
    this.initialized = true;
    console.log('✅ ItemMenuRenderer 已初始化');
  }

  /**
   * 销毁渲染器，释放资源
   */
  destroy() {
    this.initialized = false;
    console.log('❌ ItemMenuRenderer 已销毁');
  }

  /**
   * 主渲染函数 - 根据配置在 canvas 上绘制菜单
   * @param {CanvasRenderingContext2D} ctx - canvas 上下文
   * @param {Object} menuConfig - 菜单配置对象
   */
  render(ctx, menuConfig) {
    if (!menuConfig || !menuConfig.positions || menuConfig.positions.length === 0) {
      return; // 没有物品，不绘制
    }

    ctx.save();

    try {
      // 绘制菜单背景
      this.drawBackground(ctx, menuConfig);

      // 绘制所有物品
      this.drawItems(ctx, menuConfig);
    } catch (error) {
      console.error('❌ 菜单渲染失败:', error);
    }

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
    const padding = menuConfig.layout_params?.padding || 10;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // 绘制背景
    ctx.fillStyle = style_params?.bg_color || '#1a1a1a';
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

    // 绘制边框
    ctx.strokeStyle = style_params?.border_color || '#ff0000';
    ctx.lineWidth = style_params?.border_width || 2;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * 绘制所有物品
   */
  drawItems(ctx, menuConfig) {
    const { items, positions, hover_index, selected_index, style } = menuConfig;

    for (let i = 0; i < positions.length && i < items.length; i++) {
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
    const { style } = menuConfig;

    switch (style) {
      case 'pixel':
        this.drawPixelItem(ctx, pos, item, isHover, isSelected, menuConfig);
        break;
      case 'dark':
        this.drawDarkItem(ctx, pos, item, isHover, isSelected, menuConfig);
        break;
      case 'cartoon':
        this.drawCartoonItem(ctx, pos, item, isHover, isSelected, menuConfig);
        break;
      case 'scifi':
        this.drawSciFiItem(ctx, pos, item, isHover, isSelected, menuConfig);
        break;
      default:
        this.drawPixelItem(ctx, pos, item, isHover, isSelected, menuConfig);
    }
  }

  /**
   * 绘制像素风物品
   */
  drawPixelItem(ctx, pos, item, isHover, isSelected, menuConfig) {
    ctx.save();

    // 背景
    ctx.fillStyle = isSelected ? '#ffff00' : (isHover ? '#ffaa00' : '#333333');
    ctx.fillRect(pos.x, pos.y, pos.width, pos.height);

    // 边框
    ctx.strokeStyle = isHover ? '#ffff00' : '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);

    // 图标
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = item.disabled ? '#666666' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon || '?', pos.x + pos.width / 2, pos.y + pos.height / 2 - 8);

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
  drawDarkItem(ctx, pos, item, isHover, isSelected, menuConfig) {
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
    ctx.fillText(item.icon || '?', pos.x + pos.width / 2, pos.y + pos.height / 2 - 6);

    // 物品名称
    ctx.font = '10px serif';
    ctx.fillStyle = '#ccccaa';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(item.name || '', pos.x + pos.width / 2, pos.y + pos.height / 2 + 8);

    ctx.restore();
  }

  /**
   * 绘制卡通风物品
   */
  drawCartoonItem(ctx, pos, item, isHover, isSelected, menuConfig) {
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

    // 图标
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = item.disabled ? '#999999' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon || '?', pos.x + pos.width / 2, pos.y + pos.height / 2 - 8);

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
  drawSciFiItem(ctx, pos, item, isHover, isSelected, menuConfig) {
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
    ctx.fillText(item.icon || '?', pos.x + pos.width / 2, pos.y + pos.height / 2 - 6);

    // 物品名称
    ctx.font = '9px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(item.name || '', pos.x + pos.width / 2, pos.y + pos.height / 2 + 8);

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

