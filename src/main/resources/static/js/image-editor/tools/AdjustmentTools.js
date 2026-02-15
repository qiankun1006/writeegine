/**
 * 色彩调整命令 - 用于撤销/重做
 */
class AdjustmentCommand extends Command {
  constructor(layer, adjustment, previousImageData) {
    super();
    this.layer = layer;
    this.adjustment = adjustment;
    this.previousImageData = previousImageData;
  }

  execute() {
    // 重新应用调整
    const canvas = this.layer.canvas;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    AdjustmentTools.applyAdjustment(imageData, this.adjustment);

    ctx.putImageData(imageData, 0, 0);
  }

  undo() {
    this.layer.canvas.getContext('2d').putImageData(this.previousImageData, 0, 0);
  }

  getDescription() {
    return `${this.adjustment.type} 调整`;
  }
}

/**
 * 色彩调整工具集合
 */
class AdjustmentTools {
  /**
   * 应用色彩调整
   */
  static applyAdjustment(imageData, adjustment) {
    const data = imageData.data;
    const length = data.length;

    switch (adjustment.type) {
      case 'brightness':
        this._applyBrightness(data, adjustment.value);
        break;
      case 'contrast':
        this._applyContrast(data, adjustment.value);
        break;
      case 'saturation':
        this._applySaturation(data, adjustment.value);
        break;
      case 'hue':
        this._applyHue(data, adjustment.value);
        break;
    }
  }

  /**
   * 应用亮度调整
   */
  static _applyBrightness(data, value) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + value));     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value)); // B
      // data[i + 3] 是 Alpha 通道，不变
    }
  }

  /**
   * 应用对比度调整
   */
  static _applyContrast(data, value) {
    const factor = (259 * (value + 255)) / (255 * (259 - value));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
  }

  /**
   * 应用饱和度调整
   */
  static _applySaturation(data, value) {
    for (let i = 0; i < data.length; i += 4) {
      // 转换为 HSL
      const [h, s, l] = this._rgbToHsl(data[i], data[i + 1], data[i + 2]);

      // 调整饱和度
      const newS = Math.min(100, Math.max(0, s + value));

      // 转换回 RGB
      const [r, g, b] = this._hslToRgb(h, newS, l);

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  /**
   * 应用色相调整
   */
  static _applyHue(data, value) {
    for (let i = 0; i < data.length; i += 4) {
      const [h, s, l] = this._rgbToHsl(data[i], data[i + 1], data[i + 2]);

      // 调整色相
      const newH = (h + value) % 360;

      // 转换回 RGB
      const [r, g, b] = this._hslToRgb(newH, s, l);

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  /**
   * RGB 转 HSL
   */
  static _rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [h * 360, s * 100, l * 100];
  }

  /**
   * HSL 转 RGB
   */
  static _hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  }
}

/**
 * BrightnessContrastTool - 亮度/对比度调整工具
 */
class BrightnessContrastTool extends Tool {
  constructor() {
    super({
      id: 'brightness-contrast',
      name: '亮度/对比度',
      icon: '☀️',
      cursor: 'default',
      category: 'adjustment',
      options: {
        brightness: 0,
        contrast: 0
      }
    });

    this.previewImageData = null;
  }

  activate(editor) {
    super.activate(editor);
    eventBus.emit('toolOptionsChanged', {
      tool: this.id,
      options: this.options
    });
  }

  onOptionChange(option, value) {
    super.onOptionChange(option, value);

    // 实时预览
    const layer = this._editor?.getSelectedLayer();
    if (layer && this.previewImageData) {
      const ctx = layer.getContext();
      const imageData = ctx.getImageData(0, 0, layer.width, layer.height);

      // 复制原始数据
      for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = this.previewImageData.data[i];
      }

      // 应用当前调整
      AdjustmentTools.applyAdjustment(imageData, {
        type: 'brightness',
        value: this.options.brightness
      });

      AdjustmentTools.applyAdjustment(imageData, {
        type: 'contrast',
        value: this.options.contrast
      });

      ctx.putImageData(imageData, 0, 0);
      eventBus.emit('documentChanged');
    }
  }

  onMouseDown(e, editor) {
    this._editor = editor;
    const layer = editor.getSelectedLayer();

    if (!layer) return;

    // 保存原始图像数据用于预览
    const ctx = layer.getContext();
    this.previewImageData = ctx.getImageData(0, 0, layer.width, layer.height);
  }

  onMouseUp(e, editor) {
    const layer = editor.getSelectedLayer();

    if (layer && this.previewImageData) {
      // 应用调整
      const ctx = layer.getContext();
      const imageData = ctx.getImageData(0, 0, layer.width, layer.height);

      AdjustmentTools.applyAdjustment(imageData, {
        type: 'brightness',
        value: this.options.brightness
      });

      AdjustmentTools.applyAdjustment(imageData, {
        type: 'contrast',
        value: this.options.contrast
      });

      // 创建调整命令
      const command = new AdjustmentCommand(layer, {
        type: 'brightness-contrast',
        brightness: this.options.brightness,
        contrast: this.options.contrast
      }, this.previewImageData);

      commandHistory.execute(command);

      this.previewImageData = null;
    }
  }
}

