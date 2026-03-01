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

/**
 * 阴影滤镜 - Drop Shadow Filter
 * 为图像添加逼真的落地阴影效果，适用于人物立绘等场景
 */
class ShadowFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      offsetX: params.offsetX || 5,        // 阴影水平偏移（像素）
      offsetY: params.offsetY || 10,       // 阴影垂直偏移（像素）
      blurRadius: params.blurRadius || 8, // 模糊半径
      opacity: params.opacity || 0.4,     // 阴影不透明度（0-1）
      scaleX: params.scaleX || 0.8,       // 水平缩放（0-1）
      fadeDirection: params.fadeDirection || 'bottom', // 'bottom', 'top', 'left', 'right' - 近实远虚方向
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const { offsetX, offsetY, blurRadius, opacity, scaleX, fadeDirection } = this.params;

    // 创建新的 ImageData 用于阴影
    const shadowData = new Uint8ClampedArray(width * height * 4);

    // 第一步：创建阴影（黑色，去除饱和度）
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        shadowData[i] = 0;     // R = 0 (黑色)
        shadowData[i + 1] = 0; // G = 0
        shadowData[i + 2] = 0; // B = 0
        shadowData[i + 3] = alpha * opacity; // 应用透明度
      }
    }

    // 第二步：扭曲阴影（压扁成贴地面的效果）
    const distortedShadow = this._distortShadow(shadowData, width, height, scaleX);

    // 第三步：位移阴影
    const offsetShadow = this._offsetShadow(distortedShadow, width, height, offsetX, offsetY);

    // 第四步：高斯模糊
    const blurredShadow = this._gaussianBlur(offsetShadow, width, height, blurRadius);

    // 第五步：近实远虚效果（可选）
    const finalShadow = this._applyFadeEffect(blurredShadow, width, height, fadeDirection);

    // 第六步：将阴影与原图合并
    for (let i = 0; i < data.length; i += 4) {
      // 阴影在底层，原图在顶层
      const shadowAlpha = finalShadow[i + 3];

      if (shadowAlpha > 0 && data[i + 3] < 255) {
        // 只在原图透明区域显示阴影
        const originalAlpha = data[i + 3] / 255;
        const shadowContrib = shadowAlpha / 255 * (1 - originalAlpha);

        data[i] = Math.round(data[i] * originalAlpha + finalShadow[i] * shadowContrib);
        data[i + 1] = Math.round(data[i + 1] * originalAlpha + finalShadow[i + 1] * shadowContrib);
        data[i + 2] = Math.round(data[i + 2] * originalAlpha + finalShadow[i + 2] * shadowContrib);
        data[i + 3] = Math.round(Math.min(255, originalAlpha * 255 + shadowAlpha));
      }
    }

    return imageData;
  }

  /**
   * 扭曲阴影，使其看起来像贴在地面上
   */
  _distortShadow(data, width, height, scaleX) {
    const result = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // 水平方向缩放（从底部开始）
        const normalizedY = y / height;
        const scaleAtY = scaleX + (1 - scaleX) * (1 - normalizedY);

        // 扭曲映射
        const centerX = width / 2;
        const distortedX = Math.round(centerX + (x - centerX) * scaleAtY);

        if (distortedX >= 0 && distortedX < width) {
          const srcIdx = (y * width + distortedX) * 4;
          result[idx] = data[srcIdx];
          result[idx + 1] = data[srcIdx + 1];
          result[idx + 2] = data[srcIdx + 2];
          result[idx + 3] = data[srcIdx + 3];
        } else {
          result[idx + 3] = 0;
        }
      }
    }

    return result;
  }

  /**
   * 位移阴影
   */
  _offsetShadow(data, width, height, offsetX, offsetY) {
    const result = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const srcIdx = ((y + offsetY) * width + (x + offsetX)) * 4;

        if (srcIdx >= 0 && srcIdx < data.length) {
          result[idx] = data[srcIdx];
          result[idx + 1] = data[srcIdx + 1];
          result[idx + 2] = data[srcIdx + 2];
          result[idx + 3] = data[srcIdx + 3];
        }
      }
    }

    return result;
  }

  /**
   * 高斯模糊
   */
  _gaussianBlur(data, width, height, radius) {
    const result = new Uint8ClampedArray(data);
    const originalData = new Uint8ClampedArray(data);
    const r = Math.max(1, Math.min(radius, 50));

    // 水平模糊
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        let weight = 0;

        for (let dx = -r; dx <= r; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const nIdx = (y * width + nx) * 4;
          const gaussian = Math.exp(-(dx * dx) / (2 * r * r));
          const w = gaussian / (Math.sqrt(2 * Math.PI) * r);

          result[idx] += originalData[nIdx] * w;
          result[idx + 1] += originalData[nIdx + 1] * w;
          result[idx + 2] += originalData[nIdx + 2] * w;
          result[idx + 3] += originalData[nIdx + 3] * w;
          weight += w;
        }

        result[idx] /= weight;
        result[idx + 1] /= weight;
        result[idx + 2] /= weight;
        result[idx + 3] /= weight;
      }
    }

    const horizontalData = new Uint8ClampedArray(result);

    // 垂直模糊
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        let weight = 0;
        let sumA = 0, sumB = 0, sumG = 0, sumR = 0;

        for (let dy = -r; dy <= r; dy++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nIdx = (ny * width + x) * 4;
          const gaussian = Math.exp(-(dy * dy) / (2 * r * r));
          const w = gaussian / (Math.sqrt(2 * Math.PI) * r);

          sumR += horizontalData[nIdx] * w;
          sumG += horizontalData[nIdx + 1] * w;
          sumB += horizontalData[nIdx + 2] * w;
          sumA += horizontalData[nIdx + 3] * w;
          weight += w;
        }

        result[idx] = sumR / weight;
        result[idx + 1] = sumG / weight;
        result[idx + 2] = sumB / weight;
        result[idx + 3] = sumA / weight;
      }
    }

    return result;
  }

  /**
   * 近实远虚效果
   */
  _applyFadeEffect(data, width, height, direction) {
    const result = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        if (result[idx + 3] > 0) {
          let fadeFactor = 1;

          switch (direction) {
            case 'bottom':
              // 底部清晰，顶部模糊
              fadeFactor = y / height;
              break;
            case 'top':
              // 顶部清晰，底部模糊
              fadeFactor = 1 - (y / height);
              break;
            case 'right':
              // 右侧清晰，左侧模糊
              fadeFactor = x / width;
              break;
            case 'left':
              // 左侧清晰，右侧模糊
              fadeFactor = 1 - (x / width);
              break;
            case 'none':
            default:
              fadeFactor = 1;
              break;
          }

          // 应用平滑的淡入淡出
          fadeFactor = Math.max(0.1, Math.min(1, fadeFactor));
          result[idx + 3] = Math.round(result[idx + 3] * fadeFactor);
        }
      }
    }

    return result;
  }
}

/**
 * 圆形地面阴影滤镜 - Ground Shadow Filter
 * 在图像底部中心位置添加椭圆形的地面阴影，适用于人物站立效果
 */
class GroundShadowFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      // 光源位置（相对于图像，仅在透视投影时使用）
      lightX: params.lightX || 0.5,     // 光源 X 位置（0-1，0.5=中心）
      lightY: params.lightY || 0.0,     // 光源 Y 位置（0-1，0=顶部）
      lightHeight: params.lightHeight || 200,  // 光源高度（像素）

      // 放射源位置（仅在放射状投影时使用）
      radialCenterX: params.radialCenterX || 0.5,  // 放射源 X 位置（0-1）
      radialCenterY: params.radialCenterY || 0.8,  // 放射源 Y 位置（0-1，通常在底部）
      radialRadius: params.radialRadius || 60,     // 放射半径（像素）

      // 阴影参数
      shadowWidth: params.shadowWidth || 60,     // 阴影宽度（像素，仅在透视投影时使用）
      shadowLength: params.shadowLength || 40,    // 阴影长度（像素，仅在透视投影时使用）
      blurRadius: params.blurRadius || 12,       // 模糊半径
      opacity: params.opacity || 0.5,            // 不透明度

      // 投影方式
      projectionMethod: params.projectionMethod || 'radial',  // 'radial'（放射状）或 'perspective'（透视）
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const { lightX, lightY, lightHeight, shadowWidth, shadowLength, blurRadius, opacity, projectionMethod, radialCenterX, radialCenterY, radialRadius } = this.params;

    // 计算阴影位置（基于光源位置的投影）
    const lightScreenX = lightX * width;
    const lightScreenY = lightY * height;

    // 阴影中心点（图像底部中心）
    const shadowCenterX = width / 2;
    const shadowCenterY = height - 20;  // 距离底部20px

    // 放射源中心点
    const radialCenterScreenX = radialCenterX * width;
    const radialCenterScreenY = radialCenterY * height;

    // 创建阴影层
    const shadowData = new Uint8ClampedArray(width * height * 4);

    if (projectionMethod === 'radial') {
      // 放射状投影（从指定放射源向外扩散）
      this._drawRadialShadow(shadowData, width, height, radialCenterScreenX, radialCenterScreenY, radialRadius, blurRadius, opacity);
    } else {
      // 透视投影（适合平行光源）
      this._drawPerspectiveShadow(shadowData, width, height, lightScreenX, lightScreenY, lightHeight, shadowCenterX, shadowCenterY, shadowWidth, shadowLength, opacity);
    }

    // 应用模糊效果
    const blurredShadow = this._gaussianBlurShadow(shadowData, width, height, blurRadius);

    // 将阴影与原图合并
    for (let i = 0; i < data.length; i += 4) {
      const shadowAlpha = blurredShadow[i + 3];

      if (shadowAlpha > 0) {
        // 只在原图透明区域显示阴影
        const originalAlpha = data[i + 3] / 255;
        const shadowContrib = shadowAlpha / 255 * (1 - originalAlpha);

        data[i] = Math.round(data[i] * originalAlpha + blurredShadow[i] * shadowContrib);
        data[i + 1] = Math.round(data[i + 1] * originalAlpha + blurredShadow[i + 1] * shadowContrib);
        data[i + 2] = Math.round(data[i + 2] * originalAlpha + blurredShadow[i + 2] * shadowContrib);
        data[i + 3] = Math.round(Math.min(255, originalAlpha * 255 + shadowAlpha));
      }
    }

    return imageData;
  }

  /**
   * 绘制放射状阴影（从放射源中心向外扩散）
   * @param {Uint8ClampedArray} data - 阴影数据
   * @param {number} width - 图像宽度
   * @param {number} height - 图像高度
   * @param {number} centerX - 放射源 X 坐标（像素）
   * @param {number} centerY - 放射源 Y 坐标（像素）
   * @param {number} radius - 放射半径（像素）
   * @param {number} blurRadius - 模糊半径
   * @param {number} opacity - 不透明度
   */
  _drawRadialShadow(data, width, height, centerX, centerY, radius, blurRadius, opacity) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // 计算点到放射源中心的距离
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 如果在放射半径范围内
        if (distance <= radius) {
          // 径向渐变：中心最暗，边缘渐隐
          // 使用二次衰减，使中心更暗
          const normalizedDistance = distance / radius;
          const gradient = 1 - (normalizedDistance * normalizedDistance);
          const alpha = Math.round(gradient * opacity * 255);

          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = alpha;
        }
      }
    }
  }

  /**
   * 绘制透视阴影（基于光源位置的快速投影）
   */
  _drawPerspectiveShadow(data, width, height, lightX, lightY, lightHeight, shadowCenterX, shadowCenterY, shadowWidth, shadowLength, opacity) {
    // 计算阴影偏移方向（从光源到阴影中心）
    const dx = shadowCenterX - lightX;
    const dy = shadowCenterY - lightY;

    // 计算阴影角度
    const shadowAngle = Math.atan2(dy, dx);

    // 计算阴影长度系数（基于光源高度）
    const lengthFactor = Math.min(2.0, Math.max(0.5, lightHeight / 100));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // 将点旋转到阴影的主轴方向
        const rx = (x - shadowCenterX) * Math.cos(-shadowAngle) - (y - shadowCenterY) * Math.sin(-shadowAngle);
        const ry = (x - shadowCenterX) * Math.sin(-shadowAngle) + (y - shadowCenterY) * Math.cos(-shadowAngle);

        // 计算透视阴影形状（远处宽，近处窄）
        const normalizedY = ry / (shadowLength * lengthFactor);
        const normalizedX = rx / (shadowWidth * (1 + Math.abs(normalizedY) * 0.3));

        const distanceSquared = normalizedX * normalizedX + normalizedY * normalizedY;

        if (distanceSquared <= 1) {
          // 透视渐变（近处暗，远处淡）
          const gradient = 1 - Math.sqrt(distanceSquared);
          // 越远的阴影越淡
          const perspectiveFade = 1 - Math.abs(normalizedY) * 0.3;
          const alpha = Math.round(gradient * gradient * perspectiveFade * opacity * 255);

          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = alpha;
        }
      }
    }
  }

  /**
   * 高斯模糊（仅对阴影层）
   */
  _gaussianBlurShadow(data, width, height, radius) {
    const result = new Uint8ClampedArray(data);
    const originalData = new Uint8ClampedArray(data);
    const r = Math.max(1, Math.min(radius, 50));

    // 水平模糊
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        let weight = 0;
        let sumA = 0;

        for (let dx = -r; dx <= r; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const nIdx = (y * width + nx) * 4;
          const gaussian = Math.exp(-(dx * dx) / (2 * r * r));
          const w = gaussian / (Math.sqrt(2 * Math.PI) * r);

          sumA += originalData[nIdx + 3] * w;
          weight += w;
        }

        result[idx] = originalData[idx];
        result[idx + 1] = originalData[idx + 1];
        result[idx + 2] = originalData[idx + 2];
        result[idx + 3] = sumA / weight;
      }
    }

    const horizontalData = new Uint8ClampedArray(result);

    // 垂直模糊
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        let weight = 0;
        let sumA = 0;

        for (let dy = -r; dy <= r; dy++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nIdx = (ny * width + x) * 4;
          const gaussian = Math.exp(-(dy * dy) / (2 * r * r));
          const w = gaussian / (Math.sqrt(2 * Math.PI) * r);

          sumA += horizontalData[nIdx + 3] * w;
          weight += w;
        }

        result[idx] = horizontalData[idx];
        result[idx + 1] = horizontalData[idx + 1];
        result[idx + 2] = horizontalData[idx + 2];
        result[idx + 3] = sumA / weight;
      }
    }

    return result;
  }
}

