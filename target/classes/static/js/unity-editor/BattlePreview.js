/**
 * 战斗预览 - 用于策略战棋编辑器
 * 提供单位范围、攻击范围、技能范围的可视化功能
 */

class BattlePreview {
  constructor(gridSystem) {
    this.gridSystem = gridSystem;
    this.units = []; // 单位数组
    this.selectedUnit = null; // 当前选中的单位
    this.previewMode = 'none'; // 预览模式: none, move, attack, skill, vision
    this.previewRange = 0; // 预览范围
    this.previewCenter = null; // 预览中心点 {col, row}
    this.rangeTiles = []; // 范围内的格子
    this.rangeColors = {
      move: '#4caf50',      // 绿色 - 移动范围
      attack: '#f44336',    // 红色 - 攻击范围
      skill: '#9c27b0',     // 紫色 - 技能范围
      vision: '#2196f3'     // 蓝色 - 视野范围
    };
  }

  /**
   * 添加单位
   */
  addUnit(unit) {
    unit.id = unit.id || `unit_${Date.now()}`;
    unit.moveRange = unit.moveRange || 3;
    unit.attackRange = unit.attackRange || 1;
    unit.skillRange = unit.skillRange || 2;
    unit.visionRange = unit.visionRange || 4;
    unit.hp = unit.hp || 100;
    unit.team = unit.team || 'ally'; // ally 或 enemy

    this.units.push(unit);
    return unit;
  }

  /**
   * 移除单位
   */
  removeUnit(unitId) {
    const index = this.units.findIndex(u => u.id === unitId);
    if (index > -1) {
      const unit = this.units[index];
      if (this.selectedUnit === unit) {
        this.selectedUnit = null;
        this.clearPreview();
      }
      this.units.splice(index, 1);
    }
  }

  /**
   * 获取指定位置的单位
   */
  getUnitAt(col, row) {
    return this.units.find(u => u.col === col && u.row === row);
  }

  /**
   * 选择单位
   */
  selectUnit(unit) {
    this.selectedUnit = unit;
    if (unit) {
      this.previewCenter = { col: unit.col, row: unit.row };
      this.updateRangeTiles();
    }
  }

  /**
   * 设置预览模式
   */
  setPreviewMode(mode) {
    this.previewMode = mode;
    if (this.selectedUnit) {
      this.updateRangeTiles();
    }
  }

  /**
   * 设置预览范围
   */
  setPreviewRange(range) {
    this.previewRange = range;
    this.updateRangeTiles();
  }

  /**
   * 设置预览中心
   */
  setPreviewCenter(col, row) {
    this.previewCenter = { col, row };
    this.updateRangeTiles();
  }

  /**
   * 更新范围格子
   */
  updateRangeTiles() {
    if (!this.previewCenter) {
      this.rangeTiles = [];
      return;
    }

    const center = this.previewCenter;
    let range = this.previewRange;

    // 根据模式自动设置范围
    if (this.selectedUnit) {
      switch (this.previewMode) {
        case 'move':
          range = this.selectedUnit.moveRange;
          break;
        case 'attack':
          range = this.selectedUnit.attackRange;
          break;
        case 'skill':
          range = this.selectedUnit.skillRange;
          break;
        case 'vision':
          range = this.selectedUnit.visionRange;
          break;
      }
    }

    // 根据模式计算范围
    switch (this.previewMode) {
      case 'move':
      case 'attack':
        // 使用曼哈顿距离计算菱形范围
        this.rangeTiles = this.getManhattanRange(center.col, center.row, range);
        break;
      case 'skill':
        // 使用圆形范围
        this.rangeTiles = this.getCircleRange(center.col, center.row, range);
        break;
      case 'vision':
        // 使用圆形范围
        this.rangeTiles = this.getCircleRange(center.col, center.row, range);
        break;
      default:
        this.rangeTiles = [];
    }
  }

  /**
   * 获取曼哈顿距离范围内的格子（菱形）
   */
  getManhattanRange(centerCol, centerRow, range) {
    const tiles = [];
    for (let dc = -range; dc <= range; dc++) {
      for (let dr = -range; dr <= range; dr++) {
        if (Math.abs(dc) + Math.abs(dr) <= range) {
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
   * 获取圆形范围内的格子
   */
  getCircleRange(centerCol, centerRow, radius) {
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
   * 获取方形范围内的格子
   */
  getSquareRange(centerCol, centerRow, size) {
    const tiles = [];
    const halfSize = Math.floor(size / 2);
    for (let dc = -halfSize; dc <= halfSize; dc++) {
      for (let dr = -halfSize; dr <= halfSize; dr++) {
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
   * 清除预览
   */
  clearPreview() {
    this.previewMode = 'none';
    this.previewRange = 0;
    this.rangeTiles = [];
    this.previewCenter = null;
  }

  /**
   * 绘制战斗预览
   */
  draw(ctx, tileSize) {
    if (!this.gridSystem) return;

    ctx.save();

    // 绘制单位
    for (const unit of this.units) {
      const isSelected = unit === this.selectedUnit;
      const x = unit.col * tileSize;
      const y = unit.row * tileSize;

      // 单位背景
      ctx.fillStyle = unit.team === 'ally' ? '#4caf50' : '#f44336';
      ctx.globalAlpha = isSelected ? 0.8 : 0.5;
      ctx.fillRect(x, y, tileSize, tileSize);

      // 选中高亮
      if (isSelected) {
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }

      // 单位信息
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('U', x + tileSize / 2, y + tileSize / 2 - 5);

      // HP 条
      const hpPercent = unit.hp / 100;
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 2, y + tileSize - 6, tileSize - 4, 4);
      ctx.fillStyle = hpPercent > 0.5 ? '#4caf50' : hpPercent > 0.25 ? '#ff9800' : '#f44336';
      ctx.fillRect(x + 2, y + tileSize - 6, (tileSize - 4) * hpPercent, 4);
    }

    // 绘制范围预览
    if (this.previewMode !== 'none' && this.rangeTiles.length > 0) {
      const color = this.rangeColors[this.previewMode] || '#fff';
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;

      for (const tile of this.rangeTiles) {
        ctx.fillRect(tile.col * tileSize, tile.row * tileSize, tileSize, tileSize);
      }

      // 绘制范围边界
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      for (const tile of this.rangeTiles) {
        ctx.strokeRect(tile.col * tileSize, tile.row * tileSize, tileSize, tileSize);
      }

      // 绘制中心点标记
      if (this.previewCenter) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          this.previewCenter.col * tileSize + tileSize / 2,
          this.previewCenter.row * tileSize + tileSize / 2,
          5,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * 获取范围内的单位
   */
  getUnitsInRange(centerCol, centerRow, range, shape = 'circle') {
    let tiles;
    switch (shape) {
      case 'circle':
        tiles = this.getCircleRange(centerCol, centerRow, range);
        break;
      case 'square':
        tiles = this.getSquareRange(centerCol, centerRow, range);
        break;
      case 'manhattan':
      default:
        tiles = this.getManhattanRange(centerCol, centerRow, range);
        break;
    }

    const unitsInTiles = [];
    for (const tile of tiles) {
      const unit = this.getUnitAt(tile.col, tile.row);
      if (unit) {
        unitsInTiles.push(unit);
      }
    }
    return unitsInTiles;
  }

  /**
   * 计算单位之间的距离
   */
  getUnitDistance(unit1, unit2) {
    return Math.abs(unit1.col - unit2.col) + Math.abs(unit1.row - unit2.row);
  }

  /**
   * 导出配置
   */
  exportConfig() {
    return {
      units: this.units.map(u => ({ ...u })),
      selectedUnitId: this.selectedUnit?.id,
      previewMode: this.previewMode
    };
  }

  /**
   * 导入配置
   */
  importConfig(config) {
    if (config.units) {
      this.units = [];
      for (const unitData of config.units) {
        this.addUnit(unitData);
      }
    }
    if (config.selectedUnitId) {
      const unit = this.units.find(u => u.id === config.selectedUnitId);
      if (unit) {
        this.selectUnit(unit);
      }
    }
    if (config.previewMode) {
      this.setPreviewMode(config.previewMode);
    }
  }

  /**
   * 清除所有单位
   */
  clearUnits() {
    this.units = [];
    this.selectedUnit = null;
    this.clearPreview();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const allyUnits = this.units.filter(u => u.team === 'ally');
    const enemyUnits = this.units.filter(u => u.team === 'enemy');

    return {
      totalUnits: this.units.length,
      allyUnits: allyUnits.length,
      enemyUnits: enemyUnits.length,
      selectedUnit: this.selectedUnit ? {
        id: this.selectedUnit.id,
        team: this.selectedUnit.team,
        moveRange: this.selectedUnit.moveRange,
        attackRange: this.selectedUnit.attackRange
      } : null
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.BattlePreview = BattlePreview;
}

