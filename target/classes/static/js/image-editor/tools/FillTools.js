/**
 * 油漆桶工具 - Bucket Fill Tool
 * 填充相似颜色的连续区域
 */
class BucketFillTool extends Tool {
  constructor() {
    super({
      id: 'bucket-fill',
      name: '油漆桶',
      icon: '🪣',
      cursor: 'crosshair',
      category: 'fill',
      options: {
        tolerance: 32,
        color: '#000000',
        contiguous: true,
        fillForeground: true
      }
    });
  }

  onMouseDown(e, editor) {
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = Math.round(coords.x);
    const y = Math.round(coords.y);

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    // 保存原始状态
    const ctx = layer.getContext();
    const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

    // 获取目标颜色
    const imageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const pixelIndex = (Math.round(y) * layer.width + Math.round(x)) * 4;

    const targetColor = {
      r: imageData.data[pixelIndex],
      g: imageData.data[pixelIndex + 1],
      b: imageData.data[pixelIndex + 2],
      a: imageData.data[pixelIndex + 3]
    };

    // 获取填充颜色
    const fillColor = this._parseColor(this.options.color);

    // 洪泛填充
    this._floodFill(imageData, x, y, targetColor, fillColor, layer.width, layer.height);

    // 应用填充
    ctx.putImageData(imageData, 0, 0);

    // 创建撤销命令
    const command = new DrawCommand(layer, imageData, previousImageData);
    commandHistory.execute(command);

    editor.render();
    eventBus.emit('bucketFilled');
  }

  /**
   * 解析颜色字符串为 RGBA 对象
   */
  _parseColor(colorStr) {
    if (colorStr.startsWith('#')) {
      const hex = colorStr.substring(1);
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: 255
      };
    }
    return { r: 0, g: 0, b: 0, a: 255 };
  }

  /**
   * 洪泛填充
   */
  _floodFill(imageData, startX, startY, targetColor, fillColor, width, height) {
    const visited = new Set();
    const queue = [[startX, startY]];
    const data = imageData.data;
    const tolerance = this.options.tolerance;

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      visited.add(key);

      const pixelIndex = (y * width + x) * 4;
      const currentColor = {
        r: data[pixelIndex],
        g: data[pixelIndex + 1],
        b: data[pixelIndex + 2],
        a: data[pixelIndex + 3]
      };

      // 检查颜色是否匹配
      if (this._colorSimilar(currentColor, targetColor, tolerance)) {
        // 填充像素
        data[pixelIndex] = fillColor.r;
        data[pixelIndex + 1] = fillColor.g;
        data[pixelIndex + 2] = fillColor.b;
        data[pixelIndex + 3] = fillColor.a;

        // 添加相邻像素
        if (this.options.contiguous) {
          queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
      }
    }
  }

  /**
   * 检查颜色相似度
   */
  _colorSimilar(color1, color2, tolerance) {
    const dr = Math.abs(color1.r - color2.r);
    const dg = Math.abs(color1.g - color2.g);
    const db = Math.abs(color1.b - color2.b);
    const da = Math.abs(color1.a - color2.a);

    const distance = Math.sqrt(dr * dr + dg * dg + db * db + da * da);
    return distance <= tolerance;
  }
}

/**
 * 渐变工具 - Gradient Tool
 * 在指定方向绘制从一种颜色到另一种颜色的渐变
 */
class GradientTool extends Tool {
  constructor() {
    super({
      id: 'gradient',
      name: '渐变',
      icon: '🌈',
      cursor: 'crosshair',
      category: 'fill',
      options: {
        gradientType: 'linear',    // linear, radial, angle, reflected, diamond
        foreground: '#000000',
        background: '#ffffff',
        opacity: 1.0,
        reverse: false
      }
    });

    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
  }

  onMouseDown(e, editor) {
    this.isDrawing = true;
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    this.startX = coords.x;
    this.startY = coords.y;
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing) return;

    // 实时预览（可选）
    // editor.render();
  }

  onMouseUp(e, editor) {
    if (this.isDrawing) {
      const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
      const endX = coords.x;
      const endY = coords.y;

      const layer = editor.getSelectedLayer();
      if (layer) {
        const ctx = layer.getContext();
        const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

        // 应用渐变
        this._applyGradient(ctx, this.startX, this.startY, endX, endY, layer.width, layer.height);

        // 创建撤销命令
        const currentImageData = ctx.getImageData(0, 0, layer.width, layer.height);
        const command = new DrawCommand(layer, currentImageData, previousImageData);
        commandHistory.execute(command);

        editor.render();
      }

      this.isDrawing = false;
    }
  }

  /**
   * 应用渐变
   */
  _applyGradient(ctx, startX, startY, endX, endY, width, height) {
    let gradient;

    switch (this.options.gradientType) {
      case 'linear':
        gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        break;
      case 'radial':
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        gradient = ctx.createRadialGradient(startX, startY, 0, startX, startY, distance);
        break;
      default:
        gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    }

    // 添加颜色停止点
    const color1 = this.options.reverse ? this.options.background : this.options.foreground;
    const color2 = this.options.reverse ? this.options.foreground : this.options.background;

    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    // 填充渐变
    ctx.fillStyle = gradient;
    ctx.globalAlpha = this.options.opacity;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
  }
}

/**
 * 文字工具 - Text Tool
 * 在画布上添加文本
 */
class TextTool extends Tool {
  constructor() {
    super({
      id: 'text',
      name: '文字',
      icon: '📝',
      cursor: 'text',
      category: 'text',
      options: {
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        alignment: 'left'
      }
    });

    this.textLayers = [];
  }

  onMouseDown(e, editor) {
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    // 显示文本输入对话框
    const text = prompt('输入文本：');
    if (!text) return;

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const ctx = layer.getContext();
    const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

    // 设置文字样式
    const fontStr = `${this.options.fontStyle} ${this.options.fontWeight} ${this.options.fontSize}px ${this.options.fontFamily}`;
    ctx.font = fontStr;
    ctx.fillStyle = this.options.color;
    ctx.textAlign = this.options.alignment;

    // 绘制文本
    ctx.fillText(text, coords.x, coords.y);

    // 创建撤销命令
    const currentImageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const command = new DrawCommand(layer, currentImageData, previousImageData);
    commandHistory.execute(command);

    editor.render();
    eventBus.emit('textAdded', { text, x: coords.x, y: coords.y });
  }
}

