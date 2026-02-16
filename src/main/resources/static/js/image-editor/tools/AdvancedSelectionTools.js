/**
 * 魔棒工具 - Magic Wand Tool
 * 基于颜色相似度进行选择
 */
class WandTool extends Tool {
  constructor() {
    super({
      id: 'wand',
      name: '魔棒',
      icon: '🪄',
      cursor: 'crosshair',
      category: 'selection',
      options: {
        tolerance: 32,      // 容差 0-255
        antiAlias: true,    // 反锯齿
        contiguous: true    // 连续选择
      }
    });

    this.isSelecting = false;
  }

  onMouseDown(e, editor) {
    this.isSelecting = true;
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = Math.round(coords.x);
    const y = Math.round(coords.y);

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    // 获取选中位置的颜色
    const ctx = layer.getContext();
    const imageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const pixelIndex = (Math.round(y) * layer.width + Math.round(x)) * 4;

    const targetColor = {
      r: imageData.data[pixelIndex],
      g: imageData.data[pixelIndex + 1],
      b: imageData.data[pixelIndex + 2],
      a: imageData.data[pixelIndex + 3]
    };

    // 使用洪泛算法进行选择
    const selection = this._floodFill(imageData, x, y, targetColor, layer.width, layer.height);

    // 设置选区
    if (selection && selection.length > 0) {
      // 计算选区的边界矩形
      let minX = layer.width, minY = layer.height, maxX = 0, maxY = 0;
      selection.forEach(([px, py]) => {
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      });

      const width = maxX - minX + 1;
      const height = maxY - minY + 1;

      editor.renderer.setSelection(minX, minY, width, height);
      editor.render();

      // 触发事件
      eventBus.emit('selectionChanged', {
        selection: { x: minX, y: minY, width, height },
        pixelCount: selection.length
      });
    }
  }

  /**
   * 洪泛算法 (Flood Fill Algorithm)
   * 从给定点开始，选择所有相似颜色的连续像素
   */
  _floodFill(imageData, startX, startY, targetColor, width, height) {
    const visited = new Set();
    const selection = [];
    const queue = [[startX, startY]];
    const tolerance = this.options.tolerance;

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;

      // 检查是否已访问或超出边界
      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      visited.add(key);

      // 获取当前像素颜色
      const pixelIndex = (y * width + x) * 4;
      const currentColor = {
        r: imageData.data[pixelIndex],
        g: imageData.data[pixelIndex + 1],
        b: imageData.data[pixelIndex + 2],
        a: imageData.data[pixelIndex + 3]
      };

      // 检查颜色是否相似
      if (this._colorSimilar(currentColor, targetColor, tolerance)) {
        selection.push([x, y]);

        // 仅连续选择时添加相邻像素到队列
        if (this.options.contiguous) {
          queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
      } else if (!this.options.contiguous) {
        // 如果不是连续选择，继续搜索
        queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    return selection;
  }

  /**
   * 检查两个颜色是否相似
   */
  _colorSimilar(color1, color2, tolerance) {
    const dr = Math.abs(color1.r - color2.r);
    const dg = Math.abs(color1.g - color2.g);
    const db = Math.abs(color1.b - color2.b);
    const da = Math.abs(color1.a - color2.a);

    // 使用欧几里得距离
    const distance = Math.sqrt(dr * dr + dg * dg + db * db + da * da);
    return distance <= tolerance;
  }

  onMouseUp(e, editor) {
    this.isSelecting = false;
  }
}

/**
 * 自由选择工具 - Free Select Tool (Lasso)
 * 手绘选区
 */
class FreeSelectTool extends Tool {
  constructor() {
    super({
      id: 'free-select',
      name: '自由选择',
      icon: '🔗',
      cursor: 'crosshair',
      category: 'selection',
      options: {
        smooth: true,       // 路径平滑化
        smoothness: 5       // 平滑度 1-10
      }
    });

    this.isDrawing = false;
    this.path = [];
  }

  onMouseDown(e, editor) {
    this.isDrawing = true;
    this.path = [];

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    this.path.push([coords.x, coords.y]);
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    this.path.push([coords.x, coords.y]);

    // 实时显示路径预览
    editor.render();
    this._drawPath(editor, this.path);
  }

  onMouseUp(e, editor) {
    if (this.isDrawing) {
      this.isDrawing = false;

      // 平滑路径
      let finalPath = this.path;
      if (this.options.smooth) {
        finalPath = this._smoothPath(this.path, this.options.smoothness);
      }

      // 计算选区边界
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      finalPath.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });

      const width = maxX - minX + 1;
      const height = maxY - minY + 1;

      // 设置选区
      editor.renderer.setSelection(minX, minY, width, height);
      editor.render();

      eventBus.emit('selectionChanged', {
        selection: { x: minX, y: minY, width, height },
        pathLength: finalPath.length
      });

      this.path = [];
    }
  }

  /**
   * 使用 Catmull-Rom 样条曲线平滑路径
   */
  _smoothPath(path, smoothness) {
    if (path.length < 3) return path;

    const smoothed = [];
    const steps = smoothness;

    for (let i = 0; i < path.length - 1; i++) {
      const p0 = path[Math.max(0, i - 1)];
      const p1 = path[i];
      const p2 = path[i + 1];
      const p3 = path[Math.min(path.length - 1, i + 2)];

      for (let t = 0; t < steps; t++) {
        const u = t / steps;
        const u2 = u * u;
        const u3 = u2 * u;

        const x = 0.5 * (
          2 * p1[0] +
          (-p0[0] + p2[0]) * u +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3
        );

        const y = 0.5 * (
          2 * p1[1] +
          (-p0[1] + p2[1]) * u +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3
        );

        smoothed.push([x, y]);
      }
    }

    smoothed.push(path[path.length - 1]);
    return smoothed;
  }

  /**
   * 绘制路径预览
   */
  _drawPath(editor, path) {
    if (path.length < 2) return;

    const ctx = editor.renderer.ctx;
    ctx.save();
    ctx.strokeStyle = '#0099ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // 应用视口变换
    ctx.translate(editor.renderer.viewport.x, editor.renderer.viewport.y);
    ctx.scale(editor.renderer.viewport.scale, editor.renderer.viewport.scale);

    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i][0], path[i][1]);
    }
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * 快速选择工具 - Quick Selection Tool
 * 使用边界检测进行智能选择
 */
class QuickSelectTool extends Tool {
  constructor() {
    super({
      id: 'quick-select',
      name: '快速选择',
      icon: '⚡',
      cursor: 'crosshair',
      category: 'selection',
      options: {
        brushSize: 30,
        autoImprove: true
      }
    });

    this.isSelecting = false;
  }

  onMouseDown(e, editor) {
    this.isSelecting = true;
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = Math.round(coords.x);
    const y = Math.round(coords.y);

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    // 简单的边界检测：查找高对比度的边界
    const ctx = layer.getContext();
    const imageData = ctx.getImageData(0, 0, layer.width, layer.height);

    // 在画笔大小区域内查找边界
    const brushSize = this.options.brushSize;
    const selection = this._findEdges(imageData, x, y, brushSize, layer.width, layer.height);

    if (selection && selection.length > 0) {
      let minX = layer.width, minY = layer.height, maxX = 0, maxY = 0;
      selection.forEach(([px, py]) => {
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      });

      const width = maxX - minX + 1;
      const height = maxY - minY + 1;

      editor.renderer.setSelection(minX, minY, width, height);
      editor.render();

      eventBus.emit('selectionChanged', {
        selection: { x: minX, y: minY, width, height }
      });
    }
  }

  /**
   * 简单的边界检测
   */
  _findEdges(imageData, startX, startY, radius, width, height) {
    const data = imageData.data;
    const selection = [];

    // 在指定区域内查找亮度变化大的区域
    for (let y = Math.max(0, startY - radius); y < Math.min(height, startY + radius); y++) {
      for (let x = Math.max(0, startX - radius); x < Math.min(width, startX + radius); x++) {
        const idx = (y * width + x) * 4;
        const idx_right = (y * width + Math.min(x + 1, width - 1)) * 4;
        const idx_down = (Math.min(y + 1, height - 1) * width + x) * 4;

        // 计算像素亮度
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const brightness_right = (data[idx_right] + data[idx_right + 1] + data[idx_right + 2]) / 3;
        const brightness_down = (data[idx_down] + data[idx_down + 1] + data[idx_down + 2]) / 3;

        // 检测边界（亮度变化 > 30）
        if (Math.abs(brightness - brightness_right) > 30 || Math.abs(brightness - brightness_down) > 30) {
          selection.push([x, y]);
        }
      }
    }

    return selection;
  }

  onMouseUp(e, editor) {
    this.isSelecting = false;
  }
}

