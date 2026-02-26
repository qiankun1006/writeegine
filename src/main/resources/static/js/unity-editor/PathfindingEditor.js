/**
 * 寻路编辑器 - 用于策略战棋编辑器
 * 提供寻路可视化、障碍物编辑、路径计算等功能
 */

class PathfindingEditor {
  constructor(gridSystem) {
    this.gridSystem = gridSystem;
    this.obstacles = new Set(); // 障碍物格子集合（key格式: "col,row"）
    this.startPoint = null; // 起点 {col, row}
    this.endPoint = null; // 终点 {col, row}
    this.currentPath = []; // 当前计算的路径
    this.isEditingObstacle = false; // 是否正在编辑障碍物
    this.pathfindingMode = 'bfs'; // 寻路算法: bfs, dfs, astar
    this.showPath = true;
    this.pathColor = '#4caf50';
    this.obstacleColor = '#f44336';
    this.startColor = '#2196f3';
    this.endColor = '#ff9800';
  }

  /**
   * 设置起点
   */
  setStartPoint(col, row) {
    this.startPoint = { col, row };
    this.recalculatePath();
  }

  /**
   * 设置终点
   */
  setEndPoint(col, row) {
    this.endPoint = { col, row };
    this.recalculatePath();
  }

  /**
   * 添加障碍物
   */
  addObstacle(col, row) {
    const key = `${col},${row}`;

    // 不允许在起点或终点添加障碍物
    if (this.startPoint && this.startPoint.col === col && this.startPoint.row === row) {
      return;
    }
    if (this.endPoint && this.endPoint.col === col && this.endPoint.row === row) {
      return;
    }

    this.obstacles.add(key);
    this.recalculatePath();
  }

  /**
   * 移除障碍物
   */
  removeObstacle(col, row) {
    const key = `${col},${row}`;
    this.obstacles.delete(key);
    this.recalculatePath();
  }

  /**
   * 切换障碍物
   */
  toggleObstacle(col, row) {
    const key = `${col},${row}`;
    if (this.obstacles.has(key)) {
      this.obstacles.delete(key);
    } else {
      this.addObstacle(col, row);
    }
  }

  /**
   * 清除所有障碍物
   */
  clearObstacles() {
    this.obstacles.clear();
    this.recalculatePath();
  }

  /**
   * 清除路径
   */
  clearPath() {
    this.startPoint = null;
    this.endPoint = null;
    this.currentPath = [];
  }

  /**
   * 重新计算路径
   */
  recalculatePath() {
    if (!this.startPoint || !this.endPoint) {
      this.currentPath = [];
      return;
    }

    switch (this.pathfindingMode) {
      case 'bfs':
        this.currentPath = this.findPathBFS(this.startPoint, this.endPoint);
        break;
      case 'dfs':
        this.currentPath = this.findPathDFS(this.startPoint, this.endPoint);
        break;
      case 'astar':
        this.currentPath = this.findPathAStar(this.startPoint, this.endPoint);
        break;
      default:
        this.currentPath = this.findPathBFS(this.startPoint, this.endPoint);
    }
  }

  /**
   * BFS 寻路算法（广度优先搜索）
   */
  findPathBFS(start, end) {
    const queue = [[start]];
    const visited = new Set();
    visited.add(`${start.col},${start.row}`);

    const directions = [
      { dc: 0, dr: -1 }, // 上
      { dc: 1, dr: 0 },  // 右
      { dc: 0, dr: 1 },  // 下
      { dc: -1, dr: 0 }  // 左
    ];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      // 到达终点
      if (current.col === end.col && current.row === end.row) {
        return path;
      }

      // 探索邻居
      for (const dir of directions) {
        const nextCol = current.col + dir.dc;
        const nextRow = current.row + dir.dr;
        const nextKey = `${nextCol},${nextRow}`;

        // 检查边界
        if (nextCol < 0 || nextRow < 0) continue;

        // 检查障碍物和访问状态
        if (!this.obstacles.has(nextKey) && !visited.has(nextKey)) {
          visited.add(nextKey);
          queue.push([...path, { col: nextCol, row: nextRow }]);
        }
      }
    }

    return []; // 未找到路径
  }

  /**
   * DFS 寻路算法（深度优先搜索）
   */
  findPathDFS(start, end) {
    const visited = new Set();
    const path = [];
    const found = this.dfsHelper(start, end, visited, path);
    return found ? path : [];
  }

  dfsHelper(current, end, visited, path) {
    path.push(current);
    visited.add(`${current.col},${current.row}`);

    // 到达终点
    if (current.col === end.col && current.row === end.row) {
      return true;
    }

    const directions = [
      { dc: 0, dr: -1 },
      { dc: 1, dr: 0 },
      { dc: 0, dr: 1 },
      { dc: -1, dr: 0 }
    ];

    for (const dir of directions) {
      const nextCol = current.col + dir.dc;
      const nextRow = current.row + dir.dr;
      const nextKey = `${nextCol},${nextRow}`;

      if (nextCol < 0 || nextRow < 0) continue;

      if (!this.obstacles.has(nextKey) && !visited.has(nextKey)) {
        if (this.dfsHelper({ col: nextCol, row: nextRow }, end, visited, path)) {
          return true;
        }
      }
    }

    path.pop();
    return false;
  }

  /**
   * A* 寻路算法
   */
  findPathAStar(start, end) {
    const openSet = new Set([`${start.col},${start.row}`]);
    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();

    const startKey = `${start.col},${start.row}`;
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, end));

    const directions = [
      { dc: 0, dr: -1 },
      { dc: 1, dr: 0 },
      { dc: 0, dr: 1 },
      { dc: -1, dr: 0 }
    ];

    while (openSet.size > 0) {
      // 找到 fScore 最小的节点
      let minNode = null;
      let minScore = Infinity;
      for (const key of openSet) {
        const score = fScore.get(key) || Infinity;
        if (score < minScore) {
          minScore = score;
          minNode = key;
        }
      }

      if (!minNode) break;

      openSet.delete(minNode);
      const [currentCol, currentRow] = minNode.split(',').map(Number);

      // 到达终点
      if (currentCol === end.col && currentRow === end.row) {
        return this.reconstructPath(cameFrom, minNode);
      }

      // 探索邻居
      for (const dir of directions) {
        const nextCol = currentCol + dir.dc;
        const nextRow = currentRow + dir.dr;
        const nextKey = `${nextCol},${nextRow}`;

        if (nextCol < 0 || nextRow < 0) continue;
        if (this.obstacles.has(nextKey)) continue;

        const tentativeG = (gScore.get(minNode) || 0) + 1;
        const existingG = gScore.get(nextKey);

        if (existingG === undefined || tentativeG < existingG) {
          cameFrom.set(nextKey, minNode);
          gScore.set(nextKey, tentativeG);
          fScore.set(nextKey, tentativeG + this.heuristic({ col: nextCol, row: nextRow }, end));
          openSet.add(nextKey);
        }
      }
    }

    return []; // 未找到路径
  }

  /**
   * 启发式函数（曼哈顿距离）
   */
  heuristic(a, b) {
    return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
  }

  /**
   * 重建路径
   */
  reconstructPath(cameFrom, current) {
    const path = [];
    while (cameFrom.has(current)) {
      const [col, row] = current.split(',').map(Number);
      path.unshift({ col, row });
      current = cameFrom.get(current);
    }
    const [col, row] = current.split(',').map(Number);
    path.unshift({ col, row });
    return path;
  }

  /**
   * 绘制寻路信息
   */
  draw(ctx, tileSize) {
    if (!this.gridSystem) return;

    // 绘制障碍物
    ctx.save();
    ctx.fillStyle = this.obstacleColor;
    ctx.globalAlpha = 0.5;
    for (const key of this.obstacles) {
      const [col, row] = key.split(',').map(Number);
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);

      // 绘制 X 标记
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(col * tileSize + 5, row * tileSize + 5);
      ctx.lineTo(col * tileSize + tileSize - 5, row * tileSize + tileSize - 5);
      ctx.moveTo(col * tileSize + tileSize - 5, row * tileSize + 5);
      ctx.lineTo(col * tileSize + 5, row * tileSize + tileSize - 5);
      ctx.stroke();
    }

    // 绘制起点
    if (this.startPoint) {
      ctx.fillStyle = this.startColor;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(
        this.startPoint.col * tileSize,
        this.startPoint.row * tileSize,
        tileSize,
        tileSize
      );
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', this.startPoint.col * tileSize + tileSize / 2, this.startPoint.row * tileSize + tileSize / 2);
    }

    // 绘制终点
    if (this.endPoint) {
      ctx.fillStyle = this.endColor;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(
        this.endPoint.col * tileSize,
        this.endPoint.row * tileSize,
        tileSize,
        tileSize
      );
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', this.endPoint.col * tileSize + tileSize / 2, this.endPoint.row * tileSize + tileSize / 2);
    }

    // 绘制路径
    if (this.showPath && this.currentPath.length > 0) {
      ctx.strokeStyle = this.pathColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();

      for (let i = 0; i < this.currentPath.length; i++) {
        const tile = this.currentPath[i];
        const x = tile.col * tileSize + tileSize / 2;
        const y = tile.row * tileSize + tileSize / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 绘制路径点
      ctx.fillStyle = this.pathColor;
      for (let i = 1; i < this.currentPath.length - 1; i++) {
        const tile = this.currentPath[i];
        ctx.beginPath();
        ctx.arc(
          tile.col * tileSize + tileSize / 2,
          tile.row * tileSize + tileSize / 2,
          4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * 设置寻路算法
   */
  setPathfindingMode(mode) {
    this.pathfindingMode = mode;
    this.recalculatePath();
  }

  /**
   * 切换路径显示
   */
  togglePath() {
    this.showPath = !this.showPath;
    return this.showPath;
  }

  /**
   * 导出配置
   */
  exportConfig() {
    return {
      obstacles: Array.from(this.obstacles),
      startPoint: this.startPoint,
      endPoint: this.endPoint,
      pathfindingMode: this.pathfindingMode,
      showPath: this.showPath
    };
  }

  /**
   * 导入配置
   */
  importConfig(config) {
    if (config.obstacles) {
      this.obstacles = new Set(config.obstacles);
    }
    if (config.startPoint) {
      this.startPoint = config.startPoint;
    }
    if (config.endPoint) {
      this.endPoint = config.endPoint;
    }
    if (config.pathfindingMode) {
      this.pathfindingMode = config.pathfindingMode;
    }
    if (config.showPath !== undefined) {
      this.showPath = config.showPath;
    }
    this.recalculatePath();
  }

  /**
   * 获取路径长度
   */
  getPathLength() {
    return this.currentPath.length;
  }

  /**
   * 获取路径详情
   */
  getPathDetails() {
    return {
      length: this.currentPath.length,
      obstacles: this.obstacles.size,
      start: this.startPoint,
      end: this.endPoint,
      algorithm: this.pathfindingMode
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.PathfindingEditor = PathfindingEditor;
}

