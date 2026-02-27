/**
 * 网格系统 - 用于策略战棋编辑器
 * 提供网格显示、对齐、配置等功能
 */

class GridSystem {
  constructor(config = {}) {
    this.tileSize = config.tileSize || 32; // 网格大小（像素）
    this.showGrid = config.showGrid !== undefined ? config.showGrid : true;
    this.snapToGrid = config.snapToGrid !== undefined ? config.snapToGrid : true;
    this.gridColor = config.gridColor || '#e0e0e0';
    this.gridAlpha = config.gridAlpha || 0.5;
    this.highlightColor = config.highlightColor || '#ffeb3b';
    this.highlightedTile = null; // 当前高亮的格子
    this.occupiedTiles = new Map(); // 占用格子记录
  }

  /**
   * 绘制网格
   */
  draw(ctx, width, height, offsetX = 0, offsetY = 0) {
    if (!this.showGrid) return;

    ctx.save();
    ctx.strokeStyle = this.gridColor;
    ctx.globalAlpha = this.gridAlpha;
    ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = offsetX % this.tileSize; x < width; x += this.tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 绘制水平线
    for (let y = offsetY % this.tileSize; y < height; y += this.tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 高亮当前选中的格子
    if (this.highlightedTile) {
      const { col, row } = this.highlightedTile;
      const x = col * this.tileSize;
      const y = row * this.tileSize;

      ctx.fillStyle = this.highlightColor;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }

    // 标记占用的格子
    this.occupiedTiles.forEach((data, key) => {
      const [col, row] = key.split(',').map(Number);
      const x = col * this.tileSize;
      const y = row * this.tileSize;

      ctx.fillStyle = data.color || '#ff5722';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
    });

    ctx.restore();
  }

  /**
   * 将像素坐标转换为网格坐标
   */
  pixelToGrid(x, y) {
    return {
      col: Math.floor(x / this.tileSize),
      row: Math.floor(y / this.tileSize)
    };
  }

  /**
   * 将网格坐标转换为像素坐标（中心点）
   */
  gridToPixel(col, row) {
    return {
      x: col * this.tileSize + this.tileSize / 2,
      y: row * this.tileSize + this.tileSize / 2
    };
  }

  /**
   * 将坐标对齐到网格
   */
  snapToGridCoord(x, y) {
    return {
      x: Math.round(x / this.tileSize) * this.tileSize,
      y: Math.round(y / this.tileSize) * this.tileSize
    };
  }

  /**
   * 高亮指定的格子
   */
  highlightTile(col, row) {
    this.highlightedTile = { col, row };
  }

  /**
   * 清除高亮
   */
  clearHighlight() {
    this.highlightedTile = null;
  }

  /**
   * 标记格子为占用
   */
  markTileOccupied(col, row, data = {}) {
    const key = `${col},${row}`;
    this.occupiedTiles.set(key, data);
  }

  /**
   * 取消格子占用
   */
  unmarkTileOccupied(col, row) {
    const key = `${col},${row}`;
    this.occupiedTiles.delete(key);
  }

  /**
   * 检查格子是否被占用
   */
  isTileOccupied(col, row) {
    return this.occupiedTiles.has(`${col},${row}`);
  }

  /**
   * 清除所有占用标记
   */
  clearOccupied() {
    this.occupiedTiles.clear();
  }

  /**
   * 计算两个格子之间的距离（曼哈顿距离）
   */
  getManhattanDistance(col1, row1, col2, row2) {
    return Math.abs(col1 - col2) + Math.abs(row1 - row2);
  }

  /**
   * 计算两个格子之间的直线距离
   */
  getEuclideanDistance(col1, row1, col2, row2) {
    const dx = col2 - col1;
    const dy = row2 - row1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 获取指定范围内的格子
   */
  getTilesInRange(centerCol, centerRow, range) {
    const tiles = [];
    for (let dc = -range; dc <= range; dc++) {
      for (let dr = -range; dr <= range; dr++) {
        const col = centerCol + dc;
        const row = centerRow + dr;
        if (col >= 0 && row >= 0) {
          tiles.push({ col, row });
        }
      }
    }
    return tiles;
  }

  /**
   * 获取指定形状范围内的格子（圆形）
   */
  getTilesInCircle(centerCol, centerRow, radius) {
    const tiles = [];
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        const dist = Math.sqrt(dc * dc + dr * dr);
        if (dist <= radius) {
          const col = centerCol + dc;
          const row = centerRow + dr;
          if (col >= 0 && row >= 0) {
            tiles.push({ col, row });
          }
        }
      }
    }
    return tiles;
  }

  /**
   * 设置网格大小
   */
  setTileSize(size) {
    this.tileSize = size;
  }

  /**
   * 切换网格显示
   */
  toggleGrid() {
    this.showGrid = !this.showGrid;
    return this.showGrid;
  }

  /**
   * 切换网格对齐
   */
  toggleSnap() {
    this.snapToGrid = !this.snapToGrid;
    return this.snapToGrid;
  }

  /**
   * 设置网格颜色
   */
  setGridColor(color) {
    this.gridColor = color;
  }

  /**
   * 设置网格透明度
   */
  setGridAlpha(alpha) {
    this.gridAlpha = Math.max(0, Math.min(1, alpha));
  }

  /**
   * 导出网格配置
   */
  exportConfig() {
    return {
      tileSize: this.tileSize,
      showGrid: this.showGrid,
      snapToGrid: this.snapToGrid,
      gridColor: this.gridColor,
      gridAlpha: this.gridAlpha,
      highlightColor: this.highlightColor
    };
  }

  /**
   * 导入网格配置
   */
  importConfig(config) {
    if (config.tileSize) this.tileSize = config.tileSize;
    if (config.showGrid !== undefined) this.showGrid = config.showGrid;
    if (config.snapToGrid !== undefined) this.snapToGrid = config.snapToGrid;
    if (config.gridColor) this.gridColor = config.gridColor;
    if (config.gridAlpha !== undefined) this.gridAlpha = config.gridAlpha;
    if (config.highlightColor) this.highlightColor = config.highlightColor;
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.GridSystem = GridSystem;
}

