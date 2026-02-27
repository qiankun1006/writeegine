/**
 * CanvasRenderer - Canvas 2D 渲染引擎
 * 负责将文档渲染到屏幕上
 */
class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    // 视口状态
    this.viewport = {
      x: 0,
      y: 0,
      scale: 1.0,
      minScale: 0.1,
      maxScale: 10.0
    };

    // 选区
    this.selection = null;

    // 渲染配置
    this.showGrid = false;
    this.gridSize = 16;
    this.gridColor = 'rgba(200, 200, 200, 0.3)';

    // 性能指标
    this.fps = 0;
    this.lastFrameTime = 0;
    this.frameCount = 0;
  }

  /**
   * 渲染文档
   */
  render(document, showSelection = true, activeTool = null) {
    const startTime = performance.now();

    // 清空画布
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 应用视口变换
    this.ctx.save();
    this.ctx.translate(this.viewport.x, this.viewport.y);
    this.ctx.scale(this.viewport.scale, this.viewport.scale);

    // 绘制网格（如果启用）
    if (this.showGrid) {
      this._drawGrid(document);
    }

    // 渲染文档
    const compositeCanvas = document.render();
    this.ctx.drawImage(compositeCanvas, 0, 0);

    // 绘制选区
    if (showSelection && this.selection) {
      this._drawSelection();
    }

    // 调用活跃工具的 render 方法（用于绘制工具特定的 UI，如裁剪框）
    if (activeTool && typeof activeTool.render === 'function') {
      activeTool.render(this.ctx, { renderer: this, document });
    }

    this.ctx.restore();

    // 计算 FPS
    const endTime = performance.now();
    this.frameCount++;
    if (endTime - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = endTime;
    }
  }

  /**
   * 绘制网格
   */
  _drawGrid(document) {
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;

    // 竖线
    for (let x = 0; x <= document.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, document.height);
      this.ctx.stroke();
    }

    // 横线
    for (let y = 0; y <= document.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(document.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * 绘制选区
   */
  _drawSelection() {
    if (!this.selection) return;

    const { x, y, width, height } = this.selection;

    this.ctx.save();
    this.ctx.strokeStyle = '#0099ff';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);
    this.ctx.restore();
  }

  /**
   * 设置选区
   */
  setSelection(x, y, width, height) {
    if (width >= 0 && height >= 0) {
      this.selection = { x, y, width, height };
    } else {
      this.selection = null;
    }
  }

  /**
   * 清除选区
   */
  clearSelection() {
    this.selection = null;
  }

  /**
   * 获取选区
   */
  getSelection() {
    return this.selection ? { ...this.selection } : null;
  }

  /**
   * 缩放视口
   * @param {number} factor - 缩放因子 (> 1 放大，< 1 缩小)
   * @param {number} centerX - 缩放中心 X 坐标（屏幕坐标）
   * @param {number} centerY - 缩放中心 Y 坐标（屏幕坐标）
   */
  zoom(factor, centerX = this.canvas.width / 2, centerY = this.canvas.height / 2) {
    // 限制缩放范围
    const newScale = Math.min(
      this.viewport.maxScale,
      Math.max(this.viewport.minScale, this.viewport.scale * factor)
    );

    // 计算缩放中心点的世界坐标
    const worldX = (centerX - this.viewport.x) / this.viewport.scale;
    const worldY = (centerY - this.viewport.y) / this.viewport.scale;

    // 更新缩放和视口位置
    this.viewport.scale = newScale;
    this.viewport.x = centerX - worldX * newScale;
    this.viewport.y = centerY - worldY * newScale;

    eventBus.emit('zoomChanged', { scale: this.viewport.scale });
  }

  /**
   * 平移视口
   */
  pan(dx, dy) {
    this.viewport.x += dx;
    this.viewport.y += dy;
  }

  /**
   * 重置视口到初始状态
   */
  resetViewport() {
    this.viewport.x = 0;
    this.viewport.y = 0;
    this.viewport.scale = 1.0;
  }

  /**
   * 适应窗口
   */
  fitToWindow(document) {
    const scaleX = this.canvas.width / document.width;
    const scaleY = this.canvas.height / document.height;
    const scale = Math.min(scaleX, scaleY) * 0.95; // 留一点边距

    this.viewport.scale = scale;
    this.viewport.x = (this.canvas.width - document.width * scale) / 2;
    this.viewport.y = (this.canvas.height - document.height * scale) / 2;

    eventBus.emit('zoomChanged', { scale: this.viewport.scale });
  }

  /**
   * 100% 缩放
   */
  zoom100Percent() {
    this.viewport.scale = 1.0;
    this.viewport.x = 0;
    this.viewport.y = 0;
    eventBus.emit('zoomChanged', { scale: 1.0 });
  }

  /**
   * 屏幕坐标转换为世界坐标
   */
  screenToWorldCoords(screenX, screenY) {
    return {
      x: (screenX - this.viewport.x) / this.viewport.scale,
      y: (screenY - this.viewport.y) / this.viewport.scale
    };
  }

  /**
   * 世界坐标转换为屏幕坐标
   */
  worldToScreenCoords(worldX, worldY) {
    return {
      x: worldX * this.viewport.scale + this.viewport.x,
      y: worldY * this.viewport.scale + this.viewport.y
    };
  }

  /**
   * 获取当前缩放级别
   */
  getZoomLevel() {
    return Math.round(this.viewport.scale * 100);
  }

  /**
   * 获取视口信息
   */
  getViewportInfo() {
    return {
      ...this.viewport,
      zoomPercent: this.getZoomLevel(),
      fps: this.fps
    };
  }

  /**
   * 切换网格显示
   */
  toggleGrid() {
    this.showGrid = !this.showGrid;
  }

  /**
   * 导出为图片
   */
  toDataURL(format = 'image/png', quality = 0.92) {
    return this.canvas.toDataURL(format, quality);
  }
}

