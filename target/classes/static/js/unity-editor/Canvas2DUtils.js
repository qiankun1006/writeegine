/**
 * Canvas 2D 编辑器通用工具库
 * 提供 2D 绘制、对象选择、网格等基础功能
 */

const Canvas2DUtils = {
  /**
   * 清空画布
   * @param {HTMLCanvasElement} canvas - 画布元素
   * @param {string} color - 背景颜色，默认为白色
   */
  clearCanvas(canvas, color = '#f5f5f5') {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  /**
   * 绘制网格
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} width - 画布宽度
   * @param {number} height - 画布高度
   * @param {number} gridSize - 网格大小
   * @param {string} color - 网格颜色
   */
  drawGrid(ctx, width, height, gridSize = 32, color = '#e0e0e0') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;

    // 竖线
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 横线
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  },

  /**
   * 绘制矩形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} fillColor - 填充颜色
   * @param {string} strokeColor - 边框颜色
   * @param {number} lineWidth - 边框宽度
   */
  drawRect(ctx, x, y, width, height, fillColor = '#667eea', strokeColor = null, lineWidth = 1) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, width, height);
    }
  },

  /**
   * 绘制圆形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - 中心 X 坐标
   * @param {number} y - 中心 Y 坐标
   * @param {number} radius - 半径
   * @param {string} fillColor - 填充颜色
   * @param {string} strokeColor - 边框颜色
   * @param {number} lineWidth - 边框宽度
   */
  drawCircle(ctx, x, y, radius, fillColor = '#667eea', strokeColor = null, lineWidth = 1) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  },

  /**
   * 绘制直线
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x1 - 起始 X
   * @param {number} y1 - 起始 Y
   * @param {number} x2 - 结束 X
   * @param {number} y2 - 结束 Y
   * @param {string} color - 线条颜色
   * @param {number} lineWidth - 线条宽度
   */
  drawLine(ctx, x1, y1, x2, y2, color = '#333', lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  /**
   * 绘制文字
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {string} text - 文本内容
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {Object} options - 选项对象
   */
  drawText(ctx, text, x, y, options = {}) {
    const {
      color = '#333',
      fontSize = 14,
      fontFamily = 'Arial',
      align = 'left',
      baseline = 'top'
    } = options;

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  },

  /**
   * 计算两点距离
   * @param {number} x1 - 点 1 的 X 坐标
   * @param {number} y1 - 点 1 的 Y 坐标
   * @param {number} x2 - 点 2 的 X 坐标
   * @param {number} y2 - 点 2 的 Y 坐标
   * @returns {number} 距离
   */
  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  },

  /**
   * 检查点是否在矩形内
   * @param {number} x - 点的 X 坐标
   * @param {number} y - 点的 Y 坐标
   * @param {number} rectX - 矩形 X 坐标
   * @param {number} rectY - 矩形 Y 坐标
   * @param {number} width - 矩形宽度
   * @param {number} height - 矩形高度
   * @returns {boolean}
   */
  pointInRect(x, y, rectX, rectY, width, height) {
    return x >= rectX && x <= rectX + width &&
           y >= rectY && y <= rectY + height;
  },

  /**
   * 检查点是否在圆形内
   * @param {number} x - 点的 X 坐标
   * @param {number} y - 点的 Y 坐标
   * @param {number} cx - 圆心 X 坐标
   * @param {number} cy - 圆心 Y 坐标
   * @param {number} radius - 半径
   * @returns {boolean}
   */
  pointInCircle(x, y, cx, cy, radius) {
    return this.distance(x, y, cx, cy) <= radius;
  },

  /**
   * 对齐到网格
   * @param {number} value - 值
   * @param {number} gridSize - 网格大小
   * @returns {number} 对齐后的值
   */
  snapToGrid(value, gridSize = 32) {
    return Math.round(value / gridSize) * gridSize;
  },

  /**
   * 检测两个矩形是否碰撞
   * @param {number} x1 - 矩形 1 的 X 坐标
   * @param {number} y1 - 矩形 1 的 Y 坐标
   * @param {number} w1 - 矩形 1 的宽度
   * @param {number} h1 - 矩形 1 的高度
   * @param {number} x2 - 矩形 2 的 X 坐标
   * @param {number} y2 - 矩形 2 的 Y 坐标
   * @param {number} w2 - 矩形 2 的宽度
   * @param {number} h2 - 矩形 2 的高度
   * @returns {boolean}
   */
  rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
  },

  /**
   * 克隆对象
   * @param {Object} obj - 对象
   * @returns {Object} 克隆后的对象
   */
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * 缩放值
   * @param {number} value - 原始值
   * @param {number} zoom - 缩放比例
   * @returns {number} 缩放后的值
   */
  scale(value, zoom) {
    return value * zoom;
  },

  /**
   * 逆向缩放值
   * @param {number} value - 原始值
   * @param {number} zoom - 缩放比例
   * @returns {number} 逆向缩放后的值
   */
  unscale(value, zoom) {
    return value / zoom;
  }
};

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.Canvas2DUtils = Canvas2DUtils;
}

// 如果是在 Node.js 环境下，导出为模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Canvas2DUtils;
}

