/**
 * 生成唯一ID
 */
function generateId() {
  return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Layer 类 - 图层对象
 * 代表编辑器中的一个图层
 */
class Layer {
  constructor(options = {}) {
    this.id = options.id || generateId();
    this.name = options.name || 'Layer';
    this.type = options.type || 'raster'; // raster, group, text, smart-object
    this.visible = options.visible !== false;
    this.opacity = options.opacity !== undefined ? options.opacity : 1.0;
    this.blendMode = options.blendMode || 'normal';
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 0;
    this.height = options.height || 0;

    // 图层内容（Canvas）
    this.canvas = options.canvas || this._createCanvas();
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // 图层蒙版
    this.mask = options.mask || null;

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

    // 图层锁定状态
    this.locked = options.locked !== undefined ? options.locked : false;
    this.lockAlpha = options.lockAlpha !== undefined ? options.lockAlpha : false;
  }

  /**
   * 创建 Canvas 元素
   */
  _createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    return canvas;
  }

  /**
   * 获取 2D 绘图上下文
   */
  getContext() {
    return this.canvas.getContext('2d');
  }

  /**
   * 清空图层内容
   */
  clear() {
    const ctx = this.getContext();
    ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * 绘制图层
   */
  draw(ctx) {
    if (!this.visible) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.globalCompositeOperation = this.blendMode;

    // 绘制图层内容
    ctx.drawImage(this.canvas, this.x, this.y);

    // 绘制效果
    if (this.effects && this.effects.shadow) {
      this._drawShadow(ctx);
    }
    if (this.effects && this.effects.stroke) {
      this._drawStroke(ctx);
    }

    // 绘制子图层
    if (this.children && this.children.length > 0) {
      this.children.forEach(child => child.draw(ctx));
    }

    ctx.restore();
  }

  /**
   * 绘制投影
   */
  _drawShadow(ctx) {
    const { blur, offsetX, offsetY, color, opacity } = this.effects.shadow;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur || 5;
    ctx.shadowOffsetX = offsetX || 0;
    ctx.shadowOffsetY = offsetY || 0;
    ctx.globalAlpha = (opacity || 0.5) * this.opacity;
    ctx.drawImage(this.canvas, this.x, this.y);
    ctx.restore();
  }

  /**
   * 绘制描边
   */
  _drawStroke(ctx) {
    const { width, color } = this.effects.stroke;
    ctx.save();
    ctx.strokeStyle = color || '#000000';
    ctx.lineWidth = width || 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  /**
   * 缩放图层
   */
  scale(scaleX, scaleY = scaleX) {
    const newWidth = Math.round(this.width * scaleX);
    const newHeight = Math.round(this.height * scaleY);

    if (newWidth <= 0 || newHeight <= 0) {
      console.warn('Cannot scale to invalid dimensions');
      return false;
    }

    const newCanvas = this._createCanvas();
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;

    const ctx = newCanvas.getContext('2d');
    ctx.drawImage(
      this.canvas,
      0, 0, this.width, this.height,
      0, 0, newWidth, newHeight
    );

    this.canvas = newCanvas;
    this.width = newWidth;
    this.height = newHeight;

    return true;
  }

  /**
   * 将图层转换为 JSON
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
      children: this.children.map(c => c.toJSON()),
      // Canvas 数据使用 base64 编码
      canvasData: this.canvas.toDataURL('image/png')
    };
  }

  /**
   * 从 JSON 恢复
   */
  static fromJSON(json) {
    // 加载 canvas 图像
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);

        const layer = new Layer({
          id: json.id,
          name: json.name,
          type: json.type,
          visible: json.visible,
          opacity: json.opacity,
          blendMode: json.blendMode,
          x: json.x,
          y: json.y,
          width: json.width,
          height: json.height,
          locked: json.locked,
          lockAlpha: json.lockAlpha,
          canvas: canvas,
          effects: json.effects
        });

        resolve(layer);
      };
      img.src = json.canvasData;
    });
  }
}

/**
 * Document 类 - 文档对象
 * 管理整个编辑文档的所有图层和属性
 */
class Document {
  constructor(width = 800, height = 600, options = {}) {
    this.id = `doc-${Date.now()}`;
    this.name = options.name || 'Untitled';
    this.width = width;
    this.height = height;
    this.dpi = options.dpi || 72;
    this.layers = [];
    this.selectedLayerId = null;

    // 创建主 Canvas 用于合成渲染
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    // 初始化时创建一个默认背景层
    if (options.createDefaultLayer !== false) {
      const bgLayer = new Layer({
        name: 'Background',
        width: width,
        height: height
      });
      this.layers.push(bgLayer);
      this.selectedLayerId = bgLayer.id;
    }
  }

  /**
   * 添加图层
   */
  addLayer(layer, index = -1) {
    if (index < 0) {
      this.layers.push(layer);
    } else {
      this.layers.splice(index, 0, layer);
    }
    this.selectedLayerId = layer.id;
    eventBus.emit('layerAdded', { layer });
    return layer;
  }

  /**
   * 删除图层
   */
  removeLayer(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index !== -1) {
      const layer = this.layers.splice(index, 1)[0];
      if (this.selectedLayerId === layerId) {
        this.selectedLayerId = this.layers.length > 0 ? this.layers[0].id : null;
      }
      eventBus.emit('layerRemoved', { layer });
      return layer;
    }
    return null;
  }

  /**
   * 获取图层
   */
  getLayer(layerId) {
    return this.layers.find(l => l.id === layerId);
  }

  /**
   * 获取选中的图层
   */
  getSelectedLayer() {
    return this.getLayer(this.selectedLayerId);
  }

  /**
   * 移动图层位置
   */
  moveLayer(layerId, newIndex) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index !== -1 && newIndex >= 0 && newIndex < this.layers.length) {
      const layer = this.layers.splice(index, 1)[0];
      this.layers.splice(newIndex, 0, layer);
      eventBus.emit('layerMoved', { layerId, newIndex });
      return true;
    }
    return false;
  }

  /**
   * 获取图层索引
   */
  getLayerIndex(layerId) {
    return this.layers.findIndex(l => l.id === layerId);
  }

  /**
   * 图层上移
   */
  moveLayerUp(layerId) {
    const index = this.getLayerIndex(layerId);
    if (index < this.layers.length - 1) {
      return this.moveLayer(layerId, index + 1);
    }
    return false;
  }

  /**
   * 图层下移
   */
  moveLayerDown(layerId) {
    const index = this.getLayerIndex(layerId);
    if (index > 0) {
      return this.moveLayer(layerId, index - 1);
    }
    return false;
  }

  /**
   * 图层置顶
   */
  moveLayerToTop(layerId) {
    return this.moveLayer(layerId, this.layers.length - 1);
  }

  /**
   * 图层置底
   */
  moveLayerToBottom(layerId) {
    return this.moveLayer(layerId, 0);
  }

  /**
   * 合并图层
   */
  mergeLayers(layerId1, layerId2) {
    const layer1 = this.getLayer(layerId1);
    const layer2 = this.getLayer(layerId2);

    if (!layer1 || !layer2) return false;

    const ctx = layer1.getContext();
    ctx.globalAlpha = layer2.opacity;
    ctx.globalCompositeOperation = layer2.blendMode;
    ctx.drawImage(layer2.canvas, layer2.x - layer1.x, layer2.y - layer1.y);

    this.removeLayer(layerId2);
    return true;
  }

  /**
   * 拉平图像（合并所有图层）
   */
  flattenImage() {
    if (this.layers.length <= 1) return false;

    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = this.width;
    flatCanvas.height = this.height;
    const ctx = flatCanvas.getContext('2d');

    // 从下往上绘制所有图层
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].draw(ctx);
    }

    // 创建新的背景层
    const bgLayer = new Layer({
      name: 'Flattened',
      width: this.width,
      height: this.height,
      canvas: flatCanvas
    });

    this.layers = [bgLayer];
    this.selectedLayerId = bgLayer.id;
    eventBus.emit('imageFlattened');
    return true;
  }

  /**
   * 渲染文档
   */
  render() {
    const ctx = this.canvas.getContext('2d');

    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    // 从下往上渲染所有图层
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].draw(ctx);
    }

    return this.canvas;
  }

  /**
   * 导出为图片
   */
  toDataURL(format = 'image/png', quality = 0.92) {
    this.render();
    return this.canvas.toDataURL(format, quality);
  }

  /**
   * 将文档转换为 JSON
   */
  async toJSON() {
    const layersJSON = await Promise.all(
      this.layers.map(layer => Promise.resolve(layer.toJSON()))
    );

    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      dpi: this.dpi,
      selectedLayerId: this.selectedLayerId,
      layers: layersJSON
    };
  }

  /**
   * 从 JSON 恢复文档
   */
  static async fromJSON(json) {
    const doc = new Document(json.width, json.height, {
      name: json.name,
      dpi: json.dpi,
      createDefaultLayer: false
    });

    doc.id = json.id;

    // 恢复所有图层
    for (const layerJSON of json.layers) {
      const layer = await Layer.fromJSON(layerJSON);
      doc.layers.push(layer);
    }

    doc.selectedLayerId = json.selectedLayerId || (doc.layers.length > 0 ? doc.layers[0].id : null);
    return doc;
  }
}

