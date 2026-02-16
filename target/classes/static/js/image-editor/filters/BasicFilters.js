/**
 * 模糊滤镜 - Blur Filter
 * 使用高斯模糊算法处理图像
 */
class BlurFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      radius: params.radius || 5,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const radius = Math.min(this.params.radius, 50);

    // 创建副本用于读取原始数据
    const originalData = new Uint8ClampedArray(data);

    // 水平方向高斯模糊
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        let r = 0, g = 0, b = 0, a = 0;
        let weight = 0;

        // 卷积核
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const nIdx = (y * width + nx) * 4;

          const gaussian = Math.exp(-(dx * dx) / (2 * radius * radius));
          const w = gaussian / (Math.sqrt(2 * Math.PI) * radius);

          r += originalData[nIdx] * w;
          g += originalData[nIdx + 1] * w;
          b += originalData[nIdx + 2] * w;
          a += originalData[nIdx + 3] * w;
          weight += w;
        }

        data[idx] = Math.round(r / weight);
        data[idx + 1] = Math.round(g / weight);
        data[idx + 2] = Math.round(b / weight);
        data[idx + 3] = Math.round(a / weight);
      }
    }

    // 垂直方向高斯模糊
    const horizontalData = new Uint8ClampedArray(data);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;

        let r = 0, g = 0, b = 0, a = 0;
        let weight = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nIdx = (ny * width + x) * 4;

          const gaussian = Math.exp(-(dy * dy) / (2 * radius * radius));
          const w = gaussian / (Math.sqrt(2 * Math.PI) * radius);

          r += horizontalData[nIdx] * w;
          g += horizontalData[nIdx + 1] * w;
          b += horizontalData[nIdx + 2] * w;
          a += horizontalData[nIdx + 3] * w;
          weight += w;
        }

        data[idx] = Math.round(r / weight);
        data[idx + 1] = Math.round(g / weight);
        data[idx + 2] = Math.round(b / weight);
        data[idx + 3] = Math.round(a / weight);
      }
    }

    return imageData;
  }
}

/**
 * 锐化滤镜 - Sharpen Filter
 * 增强图像边界对比度
 */
class SharpenFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      amount: params.amount || 1.0,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const amount = Math.max(0, Math.min(3, this.params.amount));

    const originalData = new Uint8ClampedArray(data);

    // 锐化卷积核
    const kernel = [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        let r = 0, g = 0, b = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const k = kernel[(ky + 1) * 3 + (kx + 1)];

            r += originalData[nIdx] * k;
            g += originalData[nIdx + 1] * k;
            b += originalData[nIdx + 2] * k;
          }
        }

        data[idx] = Math.min(255, Math.max(0, originalData[idx] + r * amount / 9));
        data[idx + 1] = Math.min(255, Math.max(0, originalData[idx + 1] + g * amount / 9));
        data[idx + 2] = Math.min(255, Math.max(0, originalData[idx + 2] + b * amount / 9));
      }
    }

    return imageData;
  }
}

/**
 * 浮雕滤镜 - Emboss Filter
 * 创建浮雕效果
 */
class EmbossFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      angle: params.angle || 45,
      depth: params.depth || 3,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const originalData = new Uint8ClampedArray(data);

    // 浮雕卷积核
    const kernel = [
      -1, -1,  0,
      -1,  0,  1,
       0,  1,  1
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        let r = 0, g = 0, b = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const k = kernel[(ky + 1) * 3 + (kx + 1)];

            r += originalData[nIdx] * k;
            g += originalData[nIdx + 1] * k;
            b += originalData[nIdx + 2] * k;
          }
        }

        const gray = 128 + (r + g + b) / 3;
        const value = Math.min(255, Math.max(0, gray));

        data[idx] = value;
        data[idx + 1] = value;
        data[idx + 2] = value;
      }
    }

    return imageData;
  }
}

/**
 * 边界检测滤镜 - Edge Detection Filter
 * Sobel 边界检测
 */
class EdgeDetectFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      threshold: params.threshold || 100,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const originalData = new Uint8ClampedArray(data);

    // Sobel 算子
    const sobelX = [
      -1, 0, 1,
      -2, 0, 2,
      -1, 0, 1
    ];

    const sobelY = [
      -1, -2, -1,
       0,  0,  0,
       1,  2,  1
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        let gx = 0, gy = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const gray = originalData[nIdx] * 0.299 +
                        originalData[nIdx + 1] * 0.587 +
                        originalData[nIdx + 2] * 0.114;

            gx += gray * sobelX[(ky + 1) * 3 + (kx + 1)];
            gy += gray * sobelY[(ky + 1) * 3 + (kx + 1)];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const value = magnitude > this.params.threshold ? 255 : 0;

        data[idx] = value;
        data[idx + 1] = value;
        data[idx + 2] = value;
      }
    }

    return imageData;
  }
}

/**
 * 高斯模糊工具类
 */
class GaussianBlurTool extends Tool {
  constructor() {
    super({
      id: 'gaussian-blur',
      name: '高斯模糊',
      icon: '💫',
      cursor: 'default',
      category: 'filter',
      options: {
        radius: 5,
        preview: true
      }
    });
  }

  onMouseDown(e, editor) {
    const layer = editor.getSelectedLayer();
    if (!layer) return;

    // 应用高斯模糊
    const ctx = layer.getContext();
    const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

    const filter = new BlurFilter({ radius: this.options.radius });
    const newImageData = filter.apply(ctx.getImageData(0, 0, layer.width, layer.height));

    ctx.putImageData(newImageData, 0, 0);

    // 添加到撤销历史
    const command = new DrawCommand(layer, newImageData, previousImageData);
    commandHistory.execute(command);

    editor.render();
  }
}

/**
 * 锐化工具类
 */
class SharpenTool extends Tool {
  constructor() {
    super({
      id: 'sharpen',
      name: '锐化',
      icon: '⚔️',
      cursor: 'default',
      category: 'filter',
      options: {
        amount: 1.0
      }
    });
  }

  onMouseDown(e, editor) {
    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const ctx = layer.getContext();
    const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

    const filter = new SharpenFilter({ amount: this.options.amount });
    const newImageData = filter.apply(ctx.getImageData(0, 0, layer.width, layer.height));

    ctx.putImageData(newImageData, 0, 0);

    const command = new DrawCommand(layer, newImageData, previousImageData);
    commandHistory.execute(command);

    editor.render();
  }
}

