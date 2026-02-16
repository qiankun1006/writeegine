/**
 * 液化滤镜 - Liquify Filter
 * 使用径向基函数实现局部像素位移
 */
class LiquifyFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      brushRadius: params.brushRadius || 50,
      brushStrength: params.brushStrength || 0.5,
      strokes: params.strokes || [],  // [{x, y, dx, dy}, ...]
      mode: params.mode || 'forward',  // 'forward', 'backward', 'twirl'
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // 创建位移映射
    const displacementMap = new Map();

    // 处理每一笔笔划
    for (const stroke of this.params.strokes) {
      this.applyStroke(stroke, displacementMap, width, height);
    }

    // 创建新的 ImageData
    const newData = new Uint8ClampedArray(data);
    const newImageData = new ImageData(newData, width, height);

    // 应用位移
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        const displacement = displacementMap.get(key);

        if (displacement) {
          const sx = Math.round(x + displacement.dx);
          const sy = Math.round(y + displacement.dy);

          if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
            const srcIdx = (sy * width + sx) * 4;
            const dstIdx = (y * width + x) * 4;

            newData[dstIdx] = data[srcIdx];
            newData[dstIdx + 1] = data[srcIdx + 1];
            newData[dstIdx + 2] = data[srcIdx + 2];
            newData[dstIdx + 3] = data[srcIdx + 3];
          }
        }
      }
    }

    return newImageData;
  }

  applyStroke(stroke, displacementMap, width, height) {
    const { x, y, dx, dy } = stroke;
    const radius = this.params.brushRadius;
    const strength = this.params.brushStrength;

    for (let py = Math.max(0, y - radius); py < Math.min(height, y + radius); py++) {
      for (let px = Math.max(0, x - radius); px < Math.min(width, x + radius); px++) {
        const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);

        if (dist < radius) {
          // 高斯衰减
          const falloff = Math.exp(-(dist * dist) / (radius * radius));
          const influence = falloff * strength;

          const key = `${px},${py}`;
          const existing = displacementMap.get(key) || { dx: 0, dy: 0 };

          displacementMap.set(key, {
            dx: existing.dx + dx * influence,
            dy: existing.dy + dy * influence
          });
        }
      }
    }
  }
}

/**
 * 扭曲滤镜 - Displace Filter
 * 使用位移图进行图像扭曲
 */
class DisplaceFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      displacementX: params.displacementX || 10,
      displacementY: params.displacementY || 10,
      waveType: params.waveType || 'sine',  // 'sine', 'square', 'triangle'
      frequency: params.frequency || 10,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const newData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // 计算位移
        let displaceX = this.getWave(x, this.params.frequency) * this.params.displacementX;
        let displaceY = this.getWave(y, this.params.frequency) * this.params.displacementY;

        const sx = Math.round(x + displaceX);
        const sy = Math.round(y + displaceY);

        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const srcIdx = (sy * width + sx) * 4;
          const dstIdx = (y * width + x) * 4;

          newData[dstIdx] = data[srcIdx];
          newData[dstIdx + 1] = data[srcIdx + 1];
          newData[dstIdx + 2] = data[srcIdx + 2];
          newData[dstIdx + 3] = data[srcIdx + 3];
        }
      }
    }

    return new ImageData(newData, width, height);
  }

  getWave(value, frequency) {
    const normalized = (value % (360 / frequency)) / (360 / frequency);

    switch (this.params.waveType) {
      case 'sine':
        return Math.sin(normalized * Math.PI * 2);
      case 'square':
        return normalized < 0.5 ? 1 : -1;
      case 'triangle':
        return normalized < 0.5 ? normalized * 4 - 1 : 3 - normalized * 4;
      default:
        return 0;
    }
  }
}

/**
 * 旋转模糊滤镜 - Motion Blur
 */
class MotionBlurFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      angle: params.angle || 0,
      distance: params.distance || 10,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const originalData = new Uint8ClampedArray(data);
    const rad = (this.params.angle * Math.PI) / 180;
    const distance = Math.max(1, Math.min(this.params.distance, 100));

    // 计算采样方向
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        // 沿方向采样
        for (let d = 0; d < distance; d++) {
          const sx = Math.round(x + dx * d);
          const sy = Math.round(y + dy * d);

          if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
            const sIdx = (sy * width + sx) * 4;

            r += originalData[sIdx];
            g += originalData[sIdx + 1];
            b += originalData[sIdx + 2];
            a += originalData[sIdx + 3];
            count++;
          }
        }

        if (count > 0) {
          data[idx] = Math.round(r / count);
          data[idx + 1] = Math.round(g / count);
          data[idx + 2] = Math.round(b / count);
          data[idx + 3] = Math.round(a / count);
        }
      }
    }

    return imageData;
  }
}

/**
 * 径向模糊滤镜 - Radial Blur
 */
class RadialBlurFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      centerX: params.centerX || 0.5,
      centerY: params.centerY || 0.5,
      blurAmount: params.blurAmount || 0.1,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const originalData = new Uint8ClampedArray(data);
    const centerX = this.params.centerX * width;
    const centerY = this.params.centerY * height;
    const blurAmount = Math.max(0, Math.min(1, this.params.blurAmount));
    const samples = Math.ceil(10 + blurAmount * 30);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        let r = 0, g = 0, b = 0, a = 0;

        // 从中心点出发采样
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          const dirX = dx / dist;
          const dirY = dy / dist;

          for (let s = 0; s < samples; s++) {
            const offset = (s - samples / 2) * blurAmount * 2;
            const sx = Math.round(x + dirX * offset);
            const sy = Math.round(y + dirY * offset);

            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
              const sIdx = (sy * width + sx) * 4;

              r += originalData[sIdx];
              g += originalData[sIdx + 1];
              b += originalData[sIdx + 2];
              a += originalData[sIdx + 3];
            }
          }

          data[idx] = Math.round(r / samples);
          data[idx + 1] = Math.round(g / samples);
          data[idx + 2] = Math.round(b / samples);
          data[idx + 3] = Math.round(a / samples);
        }
      }
    }

    return imageData;
  }
}

/**
 * 像素化滤镜 - Pixelate
 */
class PixelateFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      blockSize: params.blockSize || 10,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const blockSize = Math.max(1, this.params.blockSize);

    const originalData = new Uint8ClampedArray(data);

    for (let by = 0; by < height; by += blockSize) {
      for (let bx = 0; bx < width; bx += blockSize) {
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        // 计算块的平均颜色
        for (let y = by; y < Math.min(by + blockSize, height); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
            const idx = (y * width + x) * 4;

            r += originalData[idx];
            g += originalData[idx + 1];
            b += originalData[idx + 2];
            a += originalData[idx + 3];
            count++;
          }
        }

        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);
        const avgA = Math.round(a / count);

        // 应用平均颜色
        for (let y = by; y < Math.min(by + blockSize, height); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
            const idx = (y * width + x) * 4;

            data[idx] = avgR;
            data[idx + 1] = avgG;
            data[idx + 2] = avgB;
            data[idx + 3] = avgA;
          }
        }
      }
    }

    return imageData;
  }
}

/**
 * 油画滤镜 - Oil Paint
 */
class OilPaintFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      radius: params.radius || 3,
      intensity: params.intensity || 7,
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const originalData = new Uint8ClampedArray(data);

    const radius = Math.max(1, this.params.radius);
    const intensity = Math.max(1, this.params.intensity);

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4;

        // 计算邻域内的主导颜色
        const colorBuckets = {};
        let maxBucketSize = 0;
        let dominantColor = null;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const r = originalData[nIdx];
            const g = originalData[nIdx + 1];
            const b = originalData[nIdx + 2];

            // 量化颜色
            const qr = Math.round(r / intensity);
            const qg = Math.round(g / intensity);
            const qb = Math.round(b / intensity);
            const key = `${qr},${qg},${qb}`;

            colorBuckets[key] = (colorBuckets[key] || 0) + 1;

            if (colorBuckets[key] > maxBucketSize) {
              maxBucketSize = colorBuckets[key];
              dominantColor = [qr * intensity, qg * intensity, qb * intensity];
            }
          }
        }

        if (dominantColor) {
          data[idx] = Math.min(255, dominantColor[0]);
          data[idx + 1] = Math.min(255, dominantColor[1]);
          data[idx + 2] = Math.min(255, dominantColor[2]);
        }
      }
    }

    return imageData;
  }
}

