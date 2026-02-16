/**
 * 亮度/对比度滤镜 - Brightness & Contrast Filter
 */
class BrightnessContrastFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      brightness: params.brightness || 0,  // -100 到 100
      contrast: params.contrast || 0,      // -100 到 100
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const brightness = this.params.brightness / 100;
    const contrast = (this.params.contrast / 100) + 1;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 应用对比度
      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;

      // 应用亮度
      r += brightness * 255;
      g += brightness * 255;
      b += brightness * 255;

      // 裁剪值
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    return imageData;
  }
}

/**
 * 色相/饱和度滤镜 - Hue/Saturation Filter
 */
class HueSaturationFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      hue: params.hue || 0,            // -180 到 180
      saturation: params.saturation || 0,  // -100 到 100
      lightness: params.lightness || 0,    // -100 到 100
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const hueShift = this.params.hue;
    const saturation = (this.params.saturation / 100) + 1;
    const lightness = this.params.lightness / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] / 255;
      let g = data[i + 1] / 255;
      let b = data[i + 2] / 255;

      // RGB 转 HSL
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      // 应用调整
      h = (h * 360 + hueShift) % 360;
      if (h < 0) h += 360;
      h /= 360;

      s = Math.max(0, Math.min(1, s * saturation));
      l = Math.max(0, Math.min(1, l + lightness));

      // HSL 转 RGB
      let nr, ng, nb;
      if (s === 0) {
        nr = ng = nb = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        nr = hue2rgb(p, q, h + 1/3);
        ng = hue2rgb(p, q, h);
        nb = hue2rgb(p, q, h - 1/3);
      }

      data[i] = Math.round(nr * 255);
      data[i + 1] = Math.round(ng * 255);
      data[i + 2] = Math.round(nb * 255);
    }

    return imageData;
  }
}

/**
 * 色阶调整滤镜 - Levels Filter
 * 调整图像的黑点、中间调和白点
 */
class LevelsFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      inputBlack: params.inputBlack || 0,      // 0-255
      inputMid: params.inputMid || 1.0,        // 0.1-10
      inputWhite: params.inputWhite || 255,    // 0-255
      outputBlack: params.outputBlack || 0,    // 0-255
      outputWhite: params.outputWhite || 255,  // 0-255
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const inputRange = this.params.inputWhite - this.params.inputBlack;

    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let value = data[i + c];

        // 将输入值映射到 0-1
        value = (value - this.params.inputBlack) / inputRange;
        value = Math.max(0, Math.min(1, value));

        // 应用伽玛校正（中间调）
        if (this.params.inputMid !== 1.0) {
          value = Math.pow(value, 1 / this.params.inputMid);
        }

        // 映射到输出范围
        const outputRange = this.params.outputWhite - this.params.outputBlack;
        value = value * outputRange + this.params.outputBlack;

        data[i + c] = Math.max(0, Math.min(255, Math.round(value)));
      }
    }

    return imageData;
  }
}

/**
 * 曲线调整滤镜 - Curves Filter
 * 使用贝塞尔曲线精细调整图像色调
 */
class CurvesFilter extends Filter {
  constructor(params = {}) {
    super(params);
    // 曲线点数组：[{x: 0-1, y: 0-1}, ...]
    this.params = {
      curvePoints: params.curvePoints || [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ],
      ...params
    };

    // 生成查找表
    this.lut = this.generateLUT();
  }

  generateLUT() {
    const lut = new Uint8Array(256);
    const points = this.params.curvePoints;

    for (let i = 0; i < 256; i++) {
      const x = i / 255;
      lut[i] = Math.round(this.evaluateCurve(x, points) * 255);
    }

    return lut;
  }

  evaluateCurve(x, points) {
    // 查找两个相邻的点
    let p0 = points[0];
    let p1 = points[points.length - 1];

    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x <= points[i + 1].x) {
        p0 = points[i];
        p1 = points[i + 1];
        break;
      }
    }

    // 线性插值
    if (p1.x === p0.x) return p0.y;
    const t = (x - p0.x) / (p1.x - p0.x);
    return p0.y + t * (p1.y - p0.y);
  }

  apply(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.lut[data[i]];
      data[i + 1] = this.lut[data[i + 1]];
      data[i + 2] = this.lut[data[i + 2]];
    }

    return imageData;
  }
}

/**
 * 饱和度滤镜 - Saturation Filter
 */
class SaturationFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      saturation: params.saturation || 0,  // -100 到 100
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const sat = this.params.saturation / 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 计算灰度值
      const gray = r * 0.299 + g * 0.587 + b * 0.114;

      // 在灰度和原色之间插值
      data[i] = Math.round(gray + (r - gray) * (1 + sat));
      data[i + 1] = Math.round(gray + (g - gray) * (1 + sat));
      data[i + 2] = Math.round(gray + (b - gray) * (1 + sat));

      // 裁剪值
      data[i] = Math.max(0, Math.min(255, data[i]));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }

    return imageData;
  }
}

/**
 * 黑白转换滤镜 - Grayscale Filter
 */
class GrayscaleFilter extends Filter {
  apply(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    return imageData;
  }
}

/**
 * 反色滤镜 - Invert Filter
 */
class InvertFilter extends Filter {
  apply(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }

    return imageData;
  }
}

/**
 * 色温调整滤镜 - Temperature Filter
 * 暖色/冷色调整
 */
class TemperatureFilter extends Filter {
  constructor(params = {}) {
    super(params);
    this.params = {
      temperature: params.temperature || 0,  // -100 冷色 到 100 暖色
      ...params
    };
  }

  apply(imageData) {
    const data = imageData.data;
    const temp = this.params.temperature / 100;

    for (let i = 0; i < data.length; i += 4) {
      if (temp > 0) {
        // 暖色：增加红色，减少蓝色
        data[i] = Math.min(255, data[i] + temp * 50);
        data[i + 2] = Math.max(0, data[i + 2] - temp * 50);
      } else {
        // 冷色：增加蓝色，减少红色
        data[i] = Math.max(0, data[i] + temp * 50);
        data[i + 2] = Math.min(255, data[i + 2] - temp * 50);
      }
    }

    return imageData;
  }
}

