/**
 * 图层样式系统 - Layer Styles
 * 实现投影、外发光、描边等效果
 */
class LayerStyle {
  constructor(params = {}) {
    this.params = params;
  }

  apply(imageData) {
    throw new Error('Subclass must implement apply method');
  }

  copyImageData(imageData) {
    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    return newImageData;
  }
}

/**
 * 投影效果 - Drop Shadow
 */
class DropShadowStyle extends LayerStyle {
  constructor(params = {}) {
    super(params);
    this.params = {
      angle: params.angle || 45,
      distance: params.distance || 10,
      blur: params.blur || 5,
      opacity: params.opacity || 0.5,
      color: params.color || '#000000',
      ...params
    };
  }

  apply(imageData) {
    const width = imageData.width;
    const height = imageData.height;

    // 创建阴影图层
    const shadowCanvas = new OffscreenCanvas(width, height);
    const shadowCtx = shadowCanvas.getContext('2d');

    // 计算阴影位移
    const rad = (this.params.angle * Math.PI) / 180;
    const offsetX = Math.cos(rad) * this.params.distance;
    const offsetY = Math.sin(rad) * this.params.distance;

    // 提取 Alpha 通道
    const alphaData = new Uint8ClampedArray(width * height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      alphaData[i / 4] = data[i + 3];
    }

    // 创建投影
    const shadowImageData = new ImageData(width, height);
    const shadowPixels = shadowImageData.data;

    // 获取颜色值
    const color = this.parseColor(this.params.color);

    for (let i = 0; i < alphaData.length; i++) {
      if (alphaData[i] > 0) {
        const idx = i * 4;
        const alpha = alphaData[i] * this.params.opacity / 255;

        shadowPixels[idx] = color.r;
        shadowPixels[idx + 1] = color.g;
        shadowPixels[idx + 2] = color.b;
        shadowPixels[idx + 3] = alpha * 255;
      }
    }

    // 应用模糊
    if (this.params.blur > 0) {
      const blurFilter = new BlurFilter({ radius: this.params.blur });
      blurFilter.apply(shadowImageData);
    }

    // 应用位移
    const offsetImageData = new ImageData(width, height);
    const offsetPixels = offsetImageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nx = Math.round(x + offsetX);
        const ny = Math.round(y + offsetY);

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const srcIdx = (y * width + x) * 4;
          const dstIdx = (ny * width + nx) * 4;

          offsetPixels[dstIdx] = shadowPixels[srcIdx];
          offsetPixels[dstIdx + 1] = shadowPixels[srcIdx + 1];
          offsetPixels[dstIdx + 2] = shadowPixels[srcIdx + 2];
          offsetPixels[dstIdx + 3] = shadowPixels[srcIdx + 3];
        }
      }
    }

    // 合并原始图像和阴影
    for (let i = 0; i < data.length; i += 4) {
      if (offsetPixels[i + 3] > 0) {
        const alpha = offsetPixels[i + 3] / 255;
        data[i] = Math.round(data[i] * (1 - alpha) + offsetPixels[i] * alpha);
        data[i + 1] = Math.round(data[i + 1] * (1 - alpha) + offsetPixels[i + 1] * alpha);
        data[i + 2] = Math.round(data[i + 2] * (1 - alpha) + offsetPixels[i + 2] * alpha);
      }
    }

    return imageData;
  }

  parseColor(colorStr) {
    const ctx = new OffscreenCanvas(1, 1).getContext('2d');
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const data = imageData.data;
    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    };
  }
}

/**
 * 外发光效果 - Outer Glow
 */
class OuterGlowStyle extends LayerStyle {
  constructor(params = {}) {
    super(params);
    this.params = {
      blur: params.blur || 10,
      opacity: params.opacity || 0.8,
      color: params.color || '#FFFFFF',
      size: params.size || 20,
      ...params
    };
  }

  apply(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // 创建光晕副本
    const glowData = this.copyImageData(imageData);

    // 应用模糊
    const blurFilter = new BlurFilter({ radius: this.params.blur });
    blurFilter.apply(glowData);

    // 获取颜色
    const color = this.parseColor(this.params.color);

    // 应用颜色并与原始图像混合
    const glowPixels = glowData.data;
    for (let i = 0; i < glowPixels.length; i += 4) {
      if (glowPixels[i + 3] > 0) {
        // 将发光改为指定颜色
        const alpha = glowPixels[i + 3] / 255 * this.params.opacity;

        glowPixels[i] = color.r;
        glowPixels[i + 1] = color.g;
        glowPixels[i + 2] = color.b;
        glowPixels[i + 3] = alpha * 255;
      }
    }

    // 合并图像
    for (let i = 0; i < data.length; i += 4) {
      if (glowPixels[i + 3] > 0) {
        const alpha = glowPixels[i + 3] / 255;
        data[i] = Math.round(data[i] * (1 - alpha) + glowPixels[i] * alpha);
        data[i + 1] = Math.round(data[i + 1] * (1 - alpha) + glowPixels[i + 1] * alpha);
        data[i + 2] = Math.round(data[i + 2] * (1 - alpha) + glowPixels[i + 2] * alpha);
      }
    }

    return imageData;
  }

  parseColor(colorStr) {
    const ctx = new OffscreenCanvas(1, 1).getContext('2d');
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const data = imageData.data;
    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    };
  }
}

/**
 * 描边效果 - Stroke
 */
class StrokeStyle extends LayerStyle {
  constructor(params = {}) {
    super(params);
    this.params = {
      size: params.size || 2,
      color: params.color || '#000000',
      opacity: params.opacity || 1.0,
      position: params.position || 'outside',  // 'outside', 'center', 'inside'
      ...params
    };
  }

  apply(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const size = Math.max(1, Math.min(this.params.size, 20));

    // 获取颜色
    const color = this.parseColor(this.params.color);

    // 创建轮廓
    const outlineData = new Uint8ClampedArray(width * height);

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        // 像素有内容
        const pixelIdx = i / 4;
        outlineData[pixelIdx] = 255;
      }
    }

    // 应用膨胀操作来创建描边
    for (let s = 0; s < size; s++) {
      const dilatedData = new Uint8ClampedArray(outlineData);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;

          if (outlineData[idx] === 255) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nIdx = (y + dy) * width + (x + dx);
                if (nIdx >= 0 && nIdx < outlineData.length) {
                  dilatedData[nIdx] = 255;
                }
              }
            }
          }
        }
      }

      outlineData.set(dilatedData);
    }

    // 应用描边颜色
    const strokeCanvas = new OffscreenCanvas(width, height);
    const strokeCtx = strokeCanvas.getContext('2d');
    const strokeImageData = new ImageData(width, height);
    const strokePixels = strokeImageData.data;

    for (let i = 0; i < outlineData.length; i++) {
      if (outlineData[i] === 255) {
        const idx = i * 4;
        strokePixels[idx] = color.r;
        strokePixels[idx + 1] = color.g;
        strokePixels[idx + 2] = color.b;
        strokePixels[idx + 3] = this.params.opacity * 255;
      }
    }

    // 合并描边和原始图像
    for (let i = 0; i < data.length; i += 4) {
      if (strokePixels[i + 3] > 0 && data[i + 3] === 0) {
        // 只在透明区域绘制描边
        data[i] = strokePixels[i];
        data[i + 1] = strokePixels[i + 1];
        data[i + 2] = strokePixels[i + 2];
        data[i + 3] = strokePixels[i + 3];
      }
    }

    return imageData;
  }

  parseColor(colorStr) {
    const ctx = new OffscreenCanvas(1, 1).getContext('2d');
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const data = imageData.data;
    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    };
  }
}

/**
 * 内发光效果 - Inner Glow
 */
class InnerGlowStyle extends LayerStyle {
  constructor(params = {}) {
    super(params);
    this.params = {
      blur: params.blur || 10,
      opacity: params.opacity || 0.8,
      color: params.color || '#FFFFFF',
      ...params
    };
  }

  apply(imageData) {
    const width = imageData.width;
    const height = imageData.height;

    // 创建反色图像（用于创建内发光）
    const invertedData = this.copyImageData(imageData);
    const data = invertedData.data;

    // 反色处理以获得边界
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = 255 - data[i + 3];
    }

    // 应用模糊
    const blurFilter = new BlurFilter({ radius: this.params.blur });
    blurFilter.apply(invertedData);

    // 获取颜色
    const color = this.parseColor(this.params.color);

    // 应用内发光
    const glowPixels = invertedData.data;
    const originalData = imageData.data;

    for (let i = 0; i < glowPixels.length; i += 4) {
      if (originalData[i + 3] > 0) {
        const alpha = glowPixels[i + 3] / 255 * this.params.opacity;

        originalData[i] = Math.round(originalData[i] * (1 - alpha) + color.r * alpha);
        originalData[i + 1] = Math.round(originalData[i + 1] * (1 - alpha) + color.g * alpha);
        originalData[i + 2] = Math.round(originalData[i + 2] * (1 - alpha) + color.b * alpha);
      }
    }

    return imageData;
  }

  parseColor(colorStr) {
    const ctx = new OffscreenCanvas(1, 1).getContext('2d');
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const data = imageData.data;
    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    };
  }
}

/**
 * 图层样式管理器
 */
class LayerStyleManager {
  constructor() {
    this.styles = new Map();
  }

  registerStyle(id, styleClass) {
    this.styles.set(id, styleClass);
  }

  getStyle(id) {
    return this.styles.get(id);
  }

  applyStyle(styleId, imageData, params = {}) {
    const StyleClass = this.styles.get(styleId);
    if (!StyleClass) {
      console.error(`Style ${styleId} not found`);
      return null;
    }

    try {
      const style = new StyleClass(params);
      return style.apply(imageData);
    } catch (error) {
      console.error(`Error applying style ${styleId}:`, error);
      return null;
    }
  }
}

// 创建全局样式管理器
const layerStyleManager = new LayerStyleManager();

