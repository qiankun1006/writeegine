/**
 * CanvasRenderer - Canvas 渲染器
 *
 * 负责将文档渲染到屏幕上，包括图层合成、视口变换等
 */
class CanvasRenderer {
  constructor(canvasElement, document) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    this.document = document;

    // 视口状态
    this.viewport = {
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0
    };

    // 其他状态
    this.showGrid = false;
    this.gridSize = 16;
    this.showRulers = false;
    this.selection = null;
    this.isDirty = true;

    // 性能优化
    this.lastRenderTime = 0;
    this.renderFPS = 60;
    this.minFrameTime = 1000 / this.renderFPS;
  }

  /**
   * 设置脏标志以强制重新渲染
   */
  markDirty() {
    this.isDirty = true;
  }

  /**
   * 渲染
   */
  render() {
    const now = performance.now();
    const elapsed = now - this.lastRenderTime;

    // 性能优化：限制帧率
    if (elapsed < this.minFrameTime && !this.isDirty) {
      return;
    }

    this.lastRenderTime = now;

    // 清空画布
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 应用视口变换
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(this.viewport.rotation);
    this.ctx.scale(this.viewport.scale, this.viewport.scale);
    this.ctx.translate(-this.canvas.width / (2 * this.viewport.scale), -this.canvas.height / (2 * this.viewport.scale));
    this.ctx.translate(this.viewport.x, this.viewport.y);

    // 绘制网格（如果启用）
    if (this.showGrid) {
      this.drawGrid();
    }

    // 渲染文档
    if (this.document) {
      const compositeCanvas = this.document.render();
      this.ctx.drawImage(compositeCanvas, 0, 0);
    }

    // 绘制选区（如果存在）
    if (this.selection) {
      this.drawSelection();
    }

    this.ctx.restore();

    this.isDirty = false;
  }

  /**
   * 绘制网格
   */
  drawGrid() {
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 0.5;

    const startX = Math.floor(this.viewport.x / this.gridSize) * this.gridSize;
    const startY = Math.floor(this.viewport.y / this.gridSize) * this.gridSize;
    const endX = startX + this.canvas.width / this.viewport.scale + this.gridSize;
    const endY = startY + this.canvas.height / this.viewport.scale + this.gridSize;

    // 垂直线
    for (let x = startX; x <= endX; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    // 水平线
    for (let y = startY; y <= endY; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }
  }

  /**
   * 绘制选区
   */
  drawSelection() {
    if (!this.selection) return;

    const { x, y, width, height } = this.selection;

    this.ctx.save();
    this.ctx.strokeStyle = '#0099ff';
    this.ctx.lineWidth = 1 / this.viewport.scale;
    this.ctx.setLineDash([5, 5]);

    this.ctx.strokeRect(x, y, width, height);

    this.ctx.setLineDash([]);
    this.ctx.restore();
  }

  /**
   * 设置选区
   */
  setSelection(selection) {
    this.selection = selection;
    this.markDirty();
  }

  /**
   * 缩放
   */
  zoom(factor, centerX = null, centerY = null) {
    const oldScale = this.viewport.scale;

    // 计算缩放中心（如果未指定，使用画布中心）
    if (centerX === null) centerX = this.canvas.width / 2;
    if (centerY === null) centerY = this.canvas.height / 2;

    // 更新缩放
    this.viewport.scale *= factor;

    // 限制缩放范围
    this.viewport.scale = Math.max(0.1, Math.min(10, this.viewport.scale));

    // 调整视口位置以保持缩放中心不变
    const scaleFactor = this.viewport.scale / oldScale;
    this.viewport.x = centerX - (centerX - this.viewport.x) * scaleFactor;
    this.viewport.y = centerY - (centerY - this.viewport.y) * scaleFactor;

    this.markDirty();
  }

  /**
   * 平移
   */
  pan(dx, dy) {
    this.viewport.x += dx / this.viewport.scale;
    this.viewport.y += dy / this.viewport.scale;
    this.markDirty();
  }

  /**
   * 重置视口
   */
  resetViewport() {
    this.viewport = {
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0
    };
    this.markDirty();
  }

  /**
   * 适应窗口
   */
  fitToWindow() {
    if (!this.document) return;

    const canvasAspect = this.canvas.width / this.canvas.height;
    const docAspect = this.document.width / this.document.height;

    let scale;
    if (canvasAspect > docAspect) {
      scale = (this.canvas.height - 20) / this.document.height;
    } else {
      scale = (this.canvas.width - 20) / this.document.width;
    }

    this.viewport.scale = Math.min(scale, 1);
    this.viewport.x = (this.document.width - this.canvas.width / this.viewport.scale) / 2;
    this.viewport.y = (this.document.height - this.canvas.height / this.viewport.scale) / 2;

    this.markDirty();
  }

  /**
   * 屏幕坐标转换为世界坐标
   */
  screenToWorld(screenX, screenY) {
    // 计算相对于画布中心的坐标
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const relX = screenX - centerX;
    const relY = screenY - centerY;

    // 应用反向变换
    const cos = Math.cos(-this.viewport.rotation);
    const sin = Math.sin(-this.viewport.rotation);
    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;

    const worldX = rotX / this.viewport.scale + centerX / this.viewport.scale + this.viewport.x;
    const worldY = rotY / this.viewport.scale + centerY / this.viewport.scale + this.viewport.y;

    return { x: worldX, y: worldY };
  }

  /**
   * 世界坐标转换为屏幕坐标
   */
  worldToScreen(worldX, worldY) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // 减去视口偏移
    let x = (worldX - this.viewport.x) * this.viewport.scale;
    let y = (worldY - this.viewport.y) * this.viewport.scale;

    // 应用旋转
    const cos = Math.cos(this.viewport.rotation);
    const sin = Math.sin(this.viewport.rotation);
    const rotX = x * cos - y * sin;
    const rotY = x * sin + y * cos;

    // 加上画布中心
    return {
      x: centerX + rotX,
      y: centerY + rotY
    };
  }

  /**
   * 获取视口信息
   */
  getViewportInfo() {
    return {
      scale: this.viewport.scale,
      offsetX: this.viewport.x,
      offsetY: this.viewport.y,
      rotation: this.viewport.rotation,
      zoom: Math.round(this.viewport.scale * 100) + '%'
    };
  }

  /**
   * 调整画布尺寸
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.markDirty();
  }

  /**
   * 设置 FPS 限制
   */
  setFPSLimit(fps) {
    this.renderFPS = fps;
    this.minFrameTime = 1000 / fps;
  }

  /**
   * 启用/禁用网格
   */
  setGridVisible(visible) {
    this.showGrid = visible;
    this.markDirty();
  }

  /**
   * 设置网格大小
   */
  setGridSize(size) {
    this.gridSize = Math.max(1, size);
    this.markDirty();
  }

  /**
   * 导出为 PNG blob
   */
  async exportPNG() {
    return new Promise((resolve) => {
      this.canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/png');
    });
  }

  /**
   * 导出为 JPG blob
   */
  async exportJPG(quality = 0.9) {
    return new Promise((resolve) => {
      this.canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/jpeg', quality);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasRenderer;
}

