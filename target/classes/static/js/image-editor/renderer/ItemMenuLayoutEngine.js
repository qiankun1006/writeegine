/**
 * ItemMenuLayoutEngine.js - 物品菜单布局引擎
 * 实现列表、网格、侧栏三种布局
 */

/**
 * ItemMenuLayoutEngine - 布局引擎
 * 根据指定的布局类型和参数，计算物品的位置信息
 */
class ItemMenuLayoutEngine {
  constructor() {
    this.layoutStrategies = {
      'list': this.calculateListLayout.bind(this),
      'grid': this.calculateGridLayout.bind(this),
      'sidebar': this.calculateSidebarLayout.bind(this),
    };
  }

  /**
   * 计算布局 - 主入口
   */
  calculate(items, layoutType, layoutParams) {
    const strategy = this.layoutStrategies[layoutType];
    if (!strategy) {
      console.warn(`❌ 未知的布局类型: ${layoutType}，使用默认网格布局`);
      return this.calculateGridLayout(items, layoutParams);
    }
    return strategy(items, layoutParams);
  }

  /**
   * 计算列表式布局
   * 物品按行排列
   */
  calculateListLayout(items, layoutParams) {
    const positions = [];
    if (!items || items.length === 0) return positions;

    const {
      rows = 4,
      cols = 3,
      item_width = 60,
      item_height = 60,
      gap = 8,
      padding = 10,
    } = layoutParams || {};

    let x = padding;
    let y = padding;
    let colCount = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push({
        x: x,
        y: y,
        width: item_width,
        height: item_height,
      });

      // 移动到下一个位置
      x += item_width + gap;
      colCount++;

      if (colCount >= cols) {
        x = padding;
        y += item_height + gap;
        colCount = 0;
      }
    }

    return positions;
  }

  /**
   * 计算网格式布局
   * 物品按网格排列
   */
  calculateGridLayout(items, layoutParams) {
    const positions = [];
    if (!items || items.length === 0) return positions;

    const {
      grid_cols = 5,
      grid_gap = 4,
      padding = 10,
    } = layoutParams || {};

    // 根据列数和网格间隙计算单个物品大小
    const totalWidth = 200; // 菜单宽度
    const availableWidth = totalWidth - 2 * padding;
    const itemSize = (availableWidth - (grid_cols - 1) * grid_gap) / grid_cols;

    let x = padding;
    let y = padding;
    let colCount = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push({
        x: x,
        y: y,
        width: itemSize,
        height: itemSize,
      });

      // 移动到下一个位置
      x += itemSize + grid_gap;
      colCount++;

      if (colCount >= grid_cols) {
        x = padding;
        y += itemSize + grid_gap;
        colCount = 0;
      }
    }

    return positions;
  }

  /**
   * 计算侧栏式布局
   * 左侧是物品列表，右侧是描述信息
   */
  calculateSidebarLayout(items, layoutParams) {
    const positions = [];
    if (!items || items.length === 0) return positions;

    const {
      sidebar_width = 180,
      item_height_sidebar = 40,
      gap = 8,
      padding = 10,
    } = layoutParams || {};

    let y = padding;

    for (let i = 0; i < items.length; i++) {
      positions.push({
        x: padding,
        y: y,
        width: sidebar_width,
        height: item_height_sidebar,
      });

      y += item_height_sidebar + gap;
    }

    return positions;
  }

  /**
   * 验证布局参数
   */
  validateParams(layoutParams) {
    const errors = [];

    if (!layoutParams) {
      return ['布局参数为空'];
    }

    if (layoutParams.item_width && layoutParams.item_width <= 0) {
      errors.push('物品宽度必须大于 0');
    }
    if (layoutParams.item_height && layoutParams.item_height <= 0) {
      errors.push('物品高度必须大于 0');
    }
    if (layoutParams.gap && layoutParams.gap < 0) {
      errors.push('间隙不能为负');
    }

    return errors;
  }
}

