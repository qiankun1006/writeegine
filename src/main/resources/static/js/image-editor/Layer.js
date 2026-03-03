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
    console.log('🔧 Layer 构造函数被调用，参数:', options);

    this.id = options.id || generateId();
    this.name = options.name || 'Layer';
    this.type = options.type || 'raster'; // raster, group, text, smart-object
    this.visible = options.visible !== false;
    this.opacity = options.opacity !== undefined ? options.opacity : 1.0;
    this.blendMode = options.blendMode || 'normal';
    this.x = options.x || 0;
    this.y = options.y || 0;

    // 修复：确保width和height有有效值
    this.width = options.width > 0 ? options.width : 800;
    this.height = options.height > 0 ? options.height : 600;

    console.log('📐 图层尺寸设置:', { width: this.width, height: this.height });

    // 图层内容（Canvas）
    this.canvas = options.canvas || this._createCanvas();
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    console.log('✅ Canvas 尺寸设置:', { canvasWidth: this.canvas.width, canvasHeight: this.canvas.height });

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

    // 骨骼动画数据
    this.skeletonData = options.skeletonData || null;       // 骨骼系统
    this.animationData = options.animationData || null;      // 动画数据
    this.isSkeletonLayer = options.isSkeletonLayer || false; // 标记为骨骼动画层
  }

  /**
   * 创建 Canvas 元素
   */
  _createCanvas() {
    try {
      console.log('🎨 创建Canvas，尺寸:', { width: this.width, height: this.height });

      if (this.width <= 0 || this.height <= 0) {
        console.warn('⚠️ 无效的Canvas尺寸，使用默认值');
        this.width = Math.max(this.width, 800);
        this.height = Math.max(this.height, 600);
      }

      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;

      console.log('✅ Canvas创建成功:', { width: canvas.width, height: canvas.height });
      return canvas;
    } catch (error) {
      console.error('❌ Canvas创建失败:', error);
      // 创建备用Canvas
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 800;
      fallbackCanvas.height = 600;
      return fallbackCanvas;
    }
  }

  /**
   * 获取 2D 绘图上下文
   */
  getContext() {
    try {
      if (!this.canvas) {
        console.error('❌ Canvas不存在，无法获取上下文');
        return null;
      }

      const ctx = this.canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ 无法获取2D上下文');
        return null;
      }

      return ctx;
    } catch (error) {
      console.error('❌ 获取绘图上下文失败:', error);
      return null;
    }
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
   * 启用透明通道 (Alpha Channel)
   * 确保图层支持透明度编辑
   */
  enableAlphaChannel() {
    if (this._hasAlphaChannel) {
      console.log('⚠️ Alpha 通道已启用');
      return true;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) return false;

      // 获取现有内容
      const imageData = ctx.getImageData(0, 0, this.width, this.height);

      // 创建新的 canvas（支持透明）
      const newCanvas = document.createElement('canvas');
      newCanvas.width = this.width;
      newCanvas.height = this.height;

      const newCtx = newCanvas.getContext('2d');
      newCtx.putImageData(imageData, 0, 0);

      // 替换原有 canvas
      this.canvas = newCanvas;
      this._hasAlphaChannel = true;

      console.log('✅ Alpha 通道已启用，图层现在支持透明度');
      return true;
    } catch (error) {
      console.error('❌ 启用 Alpha 通道失败:', error);
      return false;
    }
  }

  /**
   * 将白色背景转换为透明（实用函数）
   */
  convertWhiteToTransparent(threshold = 240) {
    if (!this._hasAlphaChannel) {
      this.enableAlphaChannel();
    }

    try {
      const ctx = this.getContext();
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;

      // 遍历所有像素
      let changedPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // 判断是否接近白色（超过阈值）
        if (r > threshold && g > threshold && b > threshold && a > 240) {
          // 设置透明度为 0
          data[i + 3] = 0;
          changedPixels++;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      console.log(`✅ 已将 ${changedPixels} 个像素转换为透明`);
      return true;
    } catch (error) {
      console.error('❌ 转换白色为透明失败:', error);
      return false;
    }
  }

  /**
   * 调整指定区域的透明度
   * @param {number} x - 矩形左上角 X 坐标
   * @param {number} y - 矩形左上角 Y 坐标
   * @param {number} width - 矩形宽度
   * @param {number} height - 矩形高度
   * @param {number} alphaValue - 透明度值 (0-1)
   */
  adjustRegionOpacity(x, y, width, height, alphaValue) {
    if (!this._hasAlphaChannel) {
      this.enableAlphaChannel();
    }

    try {
      const ctx = this.getContext();

      // 确保坐标在有效范围内
      const startX = Math.max(0, Math.min(x, this.width));
      const startY = Math.max(0, Math.min(y, this.height));
      const endX = Math.min(this.width, x + width);
      const endY = Math.min(this.height, y + height);

      const w = Math.max(0, endX - startX);
      const h = Math.max(0, endY - startY);

      if (w <= 0 || h <= 0) return false;

      const imageData = ctx.getImageData(startX, startY, w, h);
      const data = imageData.data;

      // 调整区域内所有像素的透明度
      for (let i = 3; i < data.length; i += 4) {
        data[i] = Math.round(data[i] * alphaValue);
      }

      ctx.putImageData(imageData, startX, startY);
      console.log(`✅ 已调整矩形区域 (${startX}, ${startY}, ${w}x${h}) 的透明度为 ${alphaValue * 100}%`);
      return true;
    } catch (error) {
      console.error('❌ 调整区域透明度失败:', error);
      return false;
    }
  }

  /**
   * 使用笔刷在指定位置调整透明度
   * @param {number} x - 笔刷中心 X 坐标
   * @param {number} y - 笔刷中心 Y 坐标
   * @param {number} brushSize - 笔刷大小
   * @param {number} opacityValue - 透明度值 (0-1)
   * @param {number} brushHardness - 笔刷硬度 (0-1)
   */
  applyOpacityBrush(x, y, brushSize, opacityValue, brushHardness = 0.7) {
    if (!this._hasAlphaChannel) {
      this.enableAlphaChannel();
    }

    try {
      const ctx = this.getContext();

      // 创建笔刷遮罩
      const brushCanvas = document.createElement('canvas');
      brushCanvas.width = brushSize;
      brushCanvas.height = brushSize;

      const brushCtx = brushCanvas.getContext('2d');
      const centerX = brushSize / 2;
      const centerY = brushSize / 2;
      const radius = brushSize / 2;

      // 创建径向渐变笔刷
      const gradient = brushCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );

      const softness = 1 - brushHardness;
      gradient.addColorStop(0, `rgba(0, 0, 0, ${1 - softness})`);
      gradient.addColorStop(brushHardness, `rgba(0, 0, 0, ${1 - softness})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      brushCtx.fillStyle = gradient;
      brushCtx.fillRect(0, 0, brushSize, brushSize);

      // 应用笔刷
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out'; // 删除像素
      ctx.globalAlpha = opacityValue;
      ctx.drawImage(
        brushCanvas,
        x - brushSize / 2,
        y - brushSize / 2,
        brushSize,
        brushSize
      );
      ctx.restore();

      console.log(`✅ 已在 (${x}, ${y}) 应用透明度笔刷，大小: ${brushSize}, 强度: ${opacityValue * 100}%`);
      return true;
    } catch (error) {
      console.error('❌ 应用笔刷透明度失败:', error);
      return false;
    }
  }

  /**
   * 将图层转换为 JSON
   */
  toJSON() {
    const json = {
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
      // Canvas 数据使用 base64 编码（PNG格式支持透明通道）
      canvasData: this.canvas.toDataURL('image/png'),
      // 保存是否启用了 Alpha 通道
      hasAlphaChannel: this._hasAlphaChannel || false
    };

    // 如果是骨骼动画层，序列化骨骼和动画数据
    if (this.isSkeletonLayer) {
      json.isSkeletonLayer = true;
      if (this.skeletonData) {
        json.skeletonData = this.skeletonData.serialize();
      }
      if (this.animationData) {
        json.animationData = this.animationData.serialize();
      }
    }

    return json;
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
          effects: json.effects,
          isSkeletonLayer: json.isSkeletonLayer || false
        });

        // 恢复 Alpha 通道状态
        if (json.hasAlphaChannel) {
          layer._hasAlphaChannel = true;
        }

        // 恢复骨骼动画数据
        if (json.isSkeletonLayer && typeof Skeleton !== 'undefined' && typeof Animation !== 'undefined') {
          if (json.skeletonData) {
            layer.skeletonData = Skeleton.deserialize(json.skeletonData);
          }
          if (json.animationData) {
            layer.animationData = Animation.deserialize(json.animationData);
          }
        }

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

