/**
 * 云彩渲染滤镜 - Clouds Filter
 */
class CloudsFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      scale: params.scale || 50,
      opacity: params.opacity || 0.7,
      seed: params.seed || Math.random(),
      ...params
    };
  }

  apply(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // 生成 Perlin 噪声云彩
    const cloudData = this.generateClouds(width, height);

    // 混合云彩
    for (let i = 0; i < data.length; i += 4) {
      const cloudIdx = (i / 4);
      const cloudValue = cloudData[cloudIdx];

      // 使用云彩作为覆盖层
      const cloudColor = cloudValue * 255;
      const alpha = this.params.opacity;

      data[i] = Math.round(data[i] * (1 - alpha) + cloudColor * alpha);
      data[i + 1] = Math.round(data[i + 1] * (1 - alpha) + cloudColor * alpha);
      data[i + 2] = Math.round(data[i + 2] * (1 - alpha) + cloudColor * alpha);
    }

    return imageData;
  }

  generateClouds(width, height) {
    const result = new Float32Array(width * height);
    const scale = this.params.scale;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;

        // 简化的 Perlin 噪声
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < 4; i++) {
          const nx = (x * frequency) / scale + this.params.seed * 1000;
          const ny = (y * frequency) / scale + this.params.seed * 2000;

          value += this.perlinNoise(nx, ny) * amplitude;
          maxValue += amplitude;

          amplitude *= 0.5;
          frequency *= 2;
        }

        result[idx] = (value / maxValue + 1) / 2;
      }
    }

    return result;
  }

  perlinNoise(x, y) {
    // 简化的 Perlin 噪声实现
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const n00 = this.randomGradient(xi, yi);
    const n10 = this.randomGradient(xi + 1, yi);
    const n01 = this.randomGradient(xi, yi + 1);
    const n11 = this.randomGradient(xi + 1, yi + 1);

    const nx0 = this.lerp(n00, n10, u);
    const nx1 = this.lerp(n01, n11, u);

    return this.lerp(nx0, nx1, v);
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  randomGradient(x, y) {
    const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return hash - Math.floor(hash);
  }
}

/**
 * 光照滤镜 - Light and Shadow
 */
class LightingFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      lightX: params.lightX || 0.5,
      lightY: params.lightY || 0.5,
      lightZ: params.lightZ || 100,
      intensity: params.intensity || 1.0,
      ambientLight: params.ambientLight || 0.2,
      ...params
    };
  }

  apply(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    const lightX = this.params.lightX * width;
    const lightY = this.params.lightY * height;
    const lightZ = this.params.lightZ;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // 计算光照
        const dx = x - lightX;
        const dy = y - lightY;
        const distance = Math.sqrt(dx * dx + dy * dy + lightZ * lightZ);

        const illumination = Math.max(
          this.params.ambientLight,
          1 / (1 + distance / 100) * this.params.intensity
        );

        // 应用光照
        data[idx] = Math.round(data[idx] * illumination);
        data[idx + 1] = Math.round(data[idx + 1] * illumination);
        data[idx + 2] = Math.round(data[idx + 2] * illumination);
      }
    }

    return imageData;
  }
}

/**
 * 浮雕渲染滤镜 - Emboss Render
 */
class EmbossRenderFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      depth: params.depth || 10,
      lightingAngle: params.lightingAngle || 45,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const originalData = new Uint8ClampedArray(data);
    const depth = this.params.depth;

    // Sobel 边界检测用于浮雕
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

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

            const k = (ky + 1) * 3 + (kx + 1);
            gx += gray * sobelX[k];
            gy += gray * sobelY[k];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const value = Math.round(128 + magnitude / depth);

        data[idx] = Math.max(0, Math.min(255, value));
        data[idx + 1] = Math.max(0, Math.min(255, value));
        data[idx + 2] = Math.max(0, Math.min(255, value));
      }
    }

    return imageData;
  }
}

/**
 * 浮雕高光滤镜 - Bevel and Emboss
 */
class BevelEmbossFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      depth: params.depth || 3,
      direction: params.direction || 'up-left',
      softness: params.softness || 1,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const originalData = new Uint8ClampedArray(data);

    // 计算方向
    let dx = 0, dy = 0;
    switch (this.params.direction) {
      case 'up-left':
        dx = -1;
        dy = -1;
        break;
      case 'up':
        dx = 0;
        dy = -1;
        break;
      case 'up-right':
        dx = 1;
        dy = -1;
        break;
      case 'left':
        dx = -1;
        dy = 0;
        break;
      case 'right':
        dx = 1;
        dy = 0;
        break;
      case 'down-left':
        dx = -1;
        dy = 1;
        break;
      case 'down':
        dx = 0;
        dy = 1;
        break;
      case 'down-right':
        dx = 1;
        dy = 1;
        break;
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const offset = (dy * width + dx) * 4;

        const centerGray = originalData[idx] * 0.299 +
                          originalData[idx + 1] * 0.587 +
                          originalData[idx + 2] * 0.114;

        let neighborGray = 0;
        if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          neighborGray = originalData[nIdx] * 0.299 +
                        originalData[nIdx + 1] * 0.587 +
                        originalData[nIdx + 2] * 0.114;
        }

        const diff = (centerGray - neighborGray) * this.params.depth;
        const value = Math.round(128 + diff);

        data[idx] = Math.max(0, Math.min(255, value));
        data[idx + 1] = Math.max(0, Math.min(255, value));
        data[idx + 2] = Math.max(0, Math.min(255, value));
      }
    }

    return imageData;
  }
}

/**
 * 镜像效果滤镜 - Mirror
 */
class MirrorFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      direction: params.direction || 'horizontal',  // 'horizontal', 'vertical'
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const originalData = new Uint8ClampedArray(data);

    if (this.params.direction === 'horizontal') {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width / 2; x++) {
          const leftIdx = (y * width + x) * 4;
          const rightIdx = (y * width + (width - 1 - x)) * 4;

          for (let c = 0; c < 4; c++) {
            const temp = data[leftIdx + c];
            data[leftIdx + c] = originalData[rightIdx + c];
            data[rightIdx + c] = temp;
          }
        }
      }
    } else {
      for (let y = 0; y < height / 2; y++) {
        for (let x = 0; x < width; x++) {
          const topIdx = (y * width + x) * 4;
          const bottomIdx = ((height - 1 - y) * width + x) * 4;

          for (let c = 0; c < 4; c++) {
            const temp = data[topIdx + c];
            data[topIdx + c] = originalData[bottomIdx + c];
            data[bottomIdx + c] = temp;
          }
        }
      }
    }

    return imageData;
  }
}

/**
 * 棋盘背景滤镜 - Checkerboard
 */
class CheckerboardFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      squareSize: params.squareSize || 10,
      color1: params.color1 || '#FFFFFF',
      color2: params.color2 || '#E0E0E0',
      opacity: params.opacity || 1.0,
      ...params
    };
  }

  apply(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    const c1 = this.parseColor(this.params.color1);
    const c2 = this.parseColor(this.params.color2);
    const squareSize = this.params.squareSize;
    const opacity = this.params.opacity;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        const squareX = Math.floor(x / squareSize) % 2;
        const squareY = Math.floor(y / squareSize) % 2;
        const isWhite = (squareX + squareY) % 2 === 0;

        const color = isWhite ? c1 : c2;

        // 混合背景色
        data[idx] = Math.round(data[idx] * (1 - opacity) + color.r * opacity);
        data[idx + 1] = Math.round(data[idx + 1] * (1 - opacity) + color.g * opacity);
        data[idx + 2] = Math.round(data[idx + 2] * (1 - opacity) + color.b * opacity);
      }
    }

    return imageData;
  }

  parseColor(colorStr) {
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext('2d');
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

