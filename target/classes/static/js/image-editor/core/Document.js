/**
 * Document - 文档类
 *
 * 管理整个编辑文档，包括所有图层、渲染和序列化
 */
class Document {
  constructor(options = {}) {
    this.id = options.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = options.name || 'Untitled';
    this.width = options.width || 800;
    this.height = options.height || 600;

    // 图层管理
    this.layers = [];
    this.selectedLayerIndex = -1;

    // 背景色
    this.backgroundColor = options.backgroundColor || '#ffffff';

    // 合成 canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // 文档属性
    this.dpi = options.dpi || 72;
    this.colorSpace = options.colorSpace || 'RGB';
    this.metadata = options.metadata || {};
  }

  /**
   * 添加图层
   */
  addLayer(layer, index = -1) {
    if (index === -1 || index >= this.layers.length) {
      this.layers.push(layer);
      return this.layers.length - 1;
    } else {
      this.layers.splice(index, 0, layer);
      return index;
    }
  }

  /**
   * 移除图层
   */
  removeLayer(indexOrId) {
    let index = -1;

    if (typeof indexOrId === 'string') {
      index = this.layers.findIndex(l => l.id === indexOrId);
    } else {
      index = indexOrId;
    }

    if (index >= 0 && index < this.layers.length) {
      const removedLayers = this.layers.splice(index, 1);

      // 更新选中图层
      if (this.selectedLayerIndex >= this.layers.length) {
        this.selectedLayerIndex = this.layers.length - 1;
      }

      return removedLayers[0];
    }

    return null;
  }

  /**
   * 获取图层
   */
  getLayer(indexOrId) {
    if (typeof indexOrId === 'string') {
      return this.layers.find(l => l.id === indexOrId);
    } else {
      return this.layers[indexOrId];
    }
  }

  /**
   * 获取图层索引
   */
  getLayerIndex(idOrLayer) {
    if (typeof idOrLayer === 'string') {
      return this.layers.findIndex(l => l.id === idOrLayer);
    } else {
      return this.layers.indexOf(idOrLayer);
    }
  }

  /**
   * 获取当前选中图层
   */
  getSelectedLayer() {
    if (this.selectedLayerIndex >= 0 && this.selectedLayerIndex < this.layers.length) {
      return this.layers[this.selectedLayerIndex];
    }
    return null;
  }

  /**
   * 选择图层
   */
  selectLayer(indexOrId) {
    let index = -1;

    if (typeof indexOrId === 'string') {
      index = this.layers.findIndex(l => l.id === indexOrId);
    } else {
      index = indexOrId;
    }

    if (index >= 0 && index < this.layers.length) {
      this.selectedLayerIndex = index;
      return true;
    }

    return false;
  }

  /**
   * 移动图层（改变顺序）
   */
  moveLayer(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.layers.length ||
        toIndex < 0 || toIndex >= this.layers.length) {
      return false;
    }

    const layer = this.layers.splice(fromIndex, 1)[0];
    this.layers.splice(toIndex, 0, layer);

    // 更新选中图层索引
    if (this.selectedLayerIndex === fromIndex) {
      this.selectedLayerIndex = toIndex;
    } else if (this.selectedLayerIndex > fromIndex && this.selectedLayerIndex <= toIndex) {
      this.selectedLayerIndex--;
    } else if (this.selectedLayerIndex < fromIndex && this.selectedLayerIndex >= toIndex) {
      this.selectedLayerIndex++;
    }

    return true;
  }

  /**
   * 上移图层
   */
  raiseLayer(indexOrId) {
    const index = typeof indexOrId === 'string'
      ? this.getLayerIndex(indexOrId)
      : indexOrId;

    if (index < this.layers.length - 1) {
      return this.moveLayer(index, index + 1);
    }
    return false;
  }

  /**
   * 下移图层
   */
  lowerLayer(indexOrId) {
    const index = typeof indexOrId === 'string'
      ? this.getLayerIndex(indexOrId)
      : indexOrId;

    if (index > 0) {
      return this.moveLayer(index, index - 1);
    }
    return false;
  }

  /**
   * 将图层移到顶部
   */
  raiseLayerToTop(indexOrId) {
    const index = typeof indexOrId === 'string'
      ? this.getLayerIndex(indexOrId)
      : indexOrId;

    if (index < this.layers.length - 1) {
      return this.moveLayer(index, this.layers.length - 1);
    }
    return false;
  }

  /**
   * 将图层移到底部
   */
  lowerLayerToBottom(indexOrId) {
    const index = typeof indexOrId === 'string'
      ? this.getLayerIndex(indexOrId)
      : indexOrId;

    if (index > 0) {
      return this.moveLayer(index, 0);
    }
    return false;
  }

  /**
   * 合并图层
   */
  mergeDownLayer(indexOrId) {
    const index = typeof indexOrId === 'string'
      ? this.getLayerIndex(indexOrId)
      : indexOrId;

    if (index <= 0 || index >= this.layers.length) {
      return false;
    }

    const topLayer = this.layers[index];
    const bottomLayer = this.layers[index - 1];

    // 扩展底层 canvas 以容纳合并后的内容
    const newWidth = Math.max(bottomLayer.width, topLayer.x + topLayer.width);
    const newHeight = Math.max(bottomLayer.height, topLayer.y + topLayer.height);

    if (newWidth > bottomLayer.width || newHeight > bottomLayer.height) {
      bottomLayer.resize(newWidth, newHeight);
    }

    // 将上层绘制到底层
    const ctx = bottomLayer.getContext();
    ctx.save();
    ctx.globalAlpha = topLayer.opacity;
    ctx.globalCompositeOperation = topLayer.blendMode;
    ctx.drawImage(topLayer.canvas, topLayer.x - bottomLayer.x, topLayer.y - bottomLayer.y);
    ctx.restore();

    // 移除顶层
    this.removeLayer(index);

    return true;
  }

  /**
   * 扁平化图层（合并所有图层）
   */
  flattenImage() {
    if (this.layers.length <= 1) {
      return;
    }

    while (this.layers.length > 1) {
      this.mergeDownLayer(this.layers.length - 1);
    }

    if (this.layers.length === 1) {
      this.layers[0].blendMode = 'normal';
      this.layers[0].opacity = 1;
      this.selectedLayerIndex = 0;
    }
  }

  /**
   * 渲染文档到合成 canvas
   */
  render() {
    const ctx = this.canvas.getContext('2d');

    // 清空背景
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // 从底到顶渲染所有图层
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].draw(ctx);
    }

    return this.canvas;
  }

  /**
   * 调整文档尺寸
   */
  resize(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * 转换为 JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor,
      dpi: this.dpi,
      colorSpace: this.colorSpace,
      selectedLayerIndex: this.selectedLayerIndex,
      layers: this.layers.map(l => l.toJSON()),
      metadata: this.metadata
    };
  }

  /**
   * 从 JSON 恢复
   */
  static fromJSON(data) {
    const doc = new Document({
      id: data.id,
      name: data.name,
      width: data.width,
      height: data.height,
      backgroundColor: data.backgroundColor,
      dpi: data.dpi,
      colorSpace: data.colorSpace,
      metadata: data.metadata
    });

    if (data.layers && Array.isArray(data.layers)) {
      data.layers.forEach(layerData => {
        if (typeof Layer !== 'undefined') {
          doc.addLayer(Layer.fromJSON(layerData));
        }
      });
    }

    doc.selectedLayerIndex = data.selectedLayerIndex || -1;
    return doc;
  }

  /**
   * 获取文档信息
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      layerCount: this.layers.length,
      selectedLayer: this.selectedLayerIndex,
      size: `${this.width}x${this.height}`,
      dpi: this.dpi
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Document;
}

