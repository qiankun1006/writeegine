/**
 * Layer - 图层类
 *
 * 表示一个可编辑的图层，包含内容、属性和效果
 */
class Layer {
  constructor(options = {}) {
    // 基础属性
    this.id = options.id || `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = options.name || 'Layer';
    this.type = options.type || 'raster'; // raster, group, text, smart-object

    // 可见性和透明度
    this.visible = options.visible !== false;
    this.opacity = Math.max(0, Math.min(1, options.opacity || 1.0));

    // 混合模式
    this.blendMode = options.blendMode || 'normal';

    // 位置和尺寸
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 0;
    this.height = options.height || 0;

    // 图层内容
    this.canvas = options.canvas || this.createCanvas(this.width, this.height);

    // 图层蒙版
    this.mask = options.mask || null;
    this.maskEnabled = false;

    // 图层效果
    this.effects = {
      shadow: null,
      glow: null,
      stroke: null,
      ...options.effects
    };

    // 子图层（用于分组）
    this.children = options.children || [];
    this.parent = options.parent || null;

    // 锁定状态
    this.locked = options.locked || false;
    this.lockAlpha = options.lockAlpha || false;

    // 元数据
    this.metadata = options.metadata || {};
  }

  /**
   * 创建 canvas 元素
   */
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    return canvas;
  }

  /**
   * 获取 canvas 上下文
   */
  getContext() {
    return this.canvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * 绘制图层到目标 canvas 上下文
   */
  draw(ctx, options = {}) {
    if (!this.visible || this.opacity === 0) {
      return;
    }

    ctx.save();

    // 应用透明度和混合模式
    ctx.globalAlpha = this.opacity;
    ctx.globalCompositeOperation = this.blendMode;

    // 绘制图层内容
    ctx.drawImage(this.canvas, this.x, this.y);

    // 应用效果（如果启用）
    if (!options.skipEffects) {
      this.applyEffects(ctx);
    }

    // 绘制子图层
    if (this.children.length > 0) {
      this.children.forEach(child => {
        child.draw(ctx, options);
      });
    }

    ctx.restore();
  }

  /**
   * 应用图层效果
   */
  applyEffects(ctx) {
    if (this.effects.shadow) {
      this.drawShadow(ctx);
    }
    if (this.effects.glow) {
      this.drawGlow(ctx);
    }
    if (this.effects.stroke) {
      this.drawStroke(ctx);
    }
  }

  /**
   * 绘制阴影效果
   */
  drawShadow(ctx) {
    const shadow = this.effects.shadow;
    if (!shadow) return;

    ctx.save();
    ctx.shadowColor = shadow.color || 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = shadow.blur || 5;
    ctx.shadowOffsetX = shadow.offsetX || 0;
    ctx.shadowOffsetY = shadow.offsetY || 0;
    ctx.drawImage(this.canvas, this.x, this.y);
    ctx.restore();
  }

  /**
   * 绘制发光效果（简化实现）
   */
  drawGlow(ctx) {
    // 发光效果的高级实现可以使用滤镜或多个 canvas 层
    // 这里是简化版本
    if (!this.effects.glow) return;
  }

  /**
   * 绘制描边效果
   */
  drawStroke(ctx) {
    const stroke = this.effects.stroke;
    if (!stroke) return;

    ctx.save();
    ctx.strokeStyle = stroke.color || '#000';
    ctx.lineWidth = stroke.width || 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  /**
   * 清空图层内容
   */
  clear() {
    const ctx = this.getContext();
    ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * 调整图层尺寸
   */
  resize(width, height, anchorX = 0, anchorY = 0) {
    if (width === this.width && height === this.height) {
      return;
    }

    const oldCanvas = this.canvas;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.canvas = this.createCanvas(this.width, this.height);

    // 复制旧内容到新 canvas
    if (oldCanvas.width > 0 && oldCanvas.height > 0) {
      const ctx = this.getContext();
      ctx.drawImage(oldCanvas, 0, 0);
    }
  }

  /**
   * 复制图层
   */
  clone() {
    const newLayer = new Layer({
      name: `${this.name} copy`,
      type: this.type,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      locked: this.locked,
      lockAlpha: this.lockAlpha,
      effects: { ...this.effects },
      metadata: { ...this.metadata }
    });

    // 复制 canvas 内容
    const ctx = newLayer.getContext();
    ctx.drawImage(this.canvas, 0, 0);

    // 递归复制子图层
    this.children.forEach(child => {
      newLayer.children.push(child.clone());
    });

    return newLayer;
  }

  /**
   * 转换为 JSON（用于序列化）
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      locked: this.locked,
      lockAlpha: this.lockAlpha,
      effects: this.effects,
      metadata: this.metadata,
      children: this.children.map(c => c.toJSON())
    };
  }

  /**
   * 从 JSON 恢复（用于反序列化）
   */
  static fromJSON(data) {
    const layer = new Layer(data);
    if (data.children && Array.isArray(data.children)) {
      layer.children = data.children.map(c => Layer.fromJSON(c));
    }
    return layer;
  }

  /**
   * 获取图层边界盒
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      right: this.x + this.width,
      bottom: this.y + this.height
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Layer;
}

