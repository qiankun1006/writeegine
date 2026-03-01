/**
 * ShadowCircleTool - 阴影圆工具
 * 在图像上绘制圆形阴影，可调整大小、硬度、颜色深浅
 */
class ShadowCircleTool extends Tool {
  constructor() {
    super();
    this.id = 'shadow-circle';
    this.name = '阴影圆工具';
    this.icon = '⭕';
    this.cursor = 'crosshair';

    this.options = {
      radiusX: 60,         // 椭圆 X 半径（像素）
      radiusY: 40,         // 椭圆 Y 半径（像素）
      feather: 20,         // 羽化半径（边缘模糊）
      opacity: 0.8,        // 不透明度（默认改为更深）
      hardness: 0.3,       // 硬度（0=完全羽化, 1=硬边界，控制中心不透明区域的大小）
      color: '#000000'     // 阴影颜色
    };

    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.radiusX = 0;
    this.radiusY = 0;
  }

  onMouseDown(e, editor) {
    this.isDrawing = true;

    // 从鼠标事件获取世界坐标
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    this.startX = coords.x;
    this.startY = coords.y;
    this.radiusX = 0;
    this.radiusY = 0;
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing) return;

    // 从鼠标事件获取世界坐标
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    // 计算椭圆半径
    const dx = x - this.startX;
    const dy = y - this.startY;

    // 按住 Shift 键时保持圆形，否则允许椭圆形
    if (e.shiftKey) {
      // 圆形：X 和 Y 使用相同的半径
      const radius = Math.sqrt(dx * dx + dy * dy);
      this.radiusX = radius;
      this.radiusY = radius;
    } else {
      // 椭圆形：分别计算 X 和 Y 半径
      this.radiusX = Math.abs(dx);
      this.radiusY = Math.abs(dy);
    }

    // 实时预览
    editor.render();
    this._drawPreview(editor, x, y);
  }

  onMouseUp(e, editor) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    // 获取图层
    const layer = editor.getSelectedLayer();
    if (!layer) return;

    // 应用阴影椭圆
    this._applyShadowEllipse(editor, this.startX, this.startY, this.radiusX, this.radiusY);
  }

  /**
   * 绘制预览椭圆
   */
  _drawPreview(editor, x, y) {
    const canvas = editor.canvas;
    const ctx = canvas.getContext('2d');

    // 保存状态
    ctx.save();

    // 绘制预览椭圆（外轮廓）
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制中心点
    ctx.fillStyle = 'rgba(0, 150, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(this.startX, this.startY, 3, 0, Math.PI * 2);
    ctx.fill();

    // 恢复状态
    ctx.restore();
  }

  /**
   * 应用阴影椭圆到图层
   */
  _applyShadowEllipse(editor, centerX, centerY, radiusX, radiusY) {
    const layer = editor.getSelectedLayer();
    if (!layer) return;

    // 确保有最小半径
    if (radiusX < 5 || radiusY < 5) {
      radiusX = Math.max(5, radiusX || this.options.radiusX);
      radiusY = Math.max(5, radiusY || this.options.radiusY);
    }

    const ctx = layer.getContext();

    // 保存原始数据用于撤销
    const originalImageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const imageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const data = imageData.data;

    const feather = this.options.feather;
    const opacity = this.options.opacity;
    const hardness = this.options.hardness;

    // 解析颜色
    const color = this._hexToRgb(this.options.color);

    // 限制绘制范围
    const minX = Math.max(0, Math.floor(centerX - radiusX - feather));
    const maxX = Math.min(layer.width, Math.ceil(centerX + radiusX + feather));
    const minY = Math.max(0, Math.floor(centerY - radiusY - feather));
    const maxY = Math.min(layer.height, Math.ceil(centerY + radiusY + feather));

    // 绘制阴影椭圆
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const idx = (y * layer.width + x) * 4;

        // 计算到椭圆中心的标准化距离（在 0-1 范围内代表在椭圆+羽化范围内）
        const dx = (x - centerX) / (radiusX + feather);
        const dy = (y - centerY) / (radiusY + feather);
        const distanceSquared = dx * dx + dy * dy;

        let alpha = 0;

        // 只处理在椭圆+羽化范围内的像素
        if (distanceSquared <= 1) {
          // 计算归一化距离（0 = 中心，1 = 边界）
          const distance = Math.sqrt(distanceSquared);

          // 计算到核心椭圆（不含羽化）的距离
          const coreDx = (x - centerX) / radiusX;
          const coreDy = (y - centerY) / radiusY;
          const coreDistanceSquared = coreDx * coreDx + coreDy * coreDy;

          if (coreDistanceSquared <= 1) {
            // 在核心椭圆范围内

            // 计算硬度区域的大小（0 到 radiusX/Y 之间）
            const hardnessRadiusX = radiusX * hardness;
            const hardnessRadiusY = radiusY * hardness;

            const hardnessDx = (x - centerX) / (hardnessRadiusX || 0.1);
            const hardnessDy = (y - centerY) / (hardnessRadiusY || 0.1);
            const hardnessDistanceSquared = hardnessDx * hardnessDx + hardnessDy * hardnessDy;

            if (hardnessDistanceSquared <= 1) {
              // 在硬度区域内：完全不透明
              alpha = opacity * 255;
            } else {
              // 在硬度区域外但在核心椭圆内：线性衰减
              const coreDistance = Math.sqrt(coreDistanceSquared);
              const hardnessDistance = Math.sqrt(Math.min(hardnessDistanceSquared, 1.5));
              // 从硬度区域边界（~hardness）到核心椭圆边界（1）线性衰减
              const fadeStart = hardness;
              const fade = Math.max(0, (1 - coreDistance) / (1 - fadeStart));
              alpha = fade * opacity * 255;
            }
          } else if (distanceSquared <= 1) {
            // 在羽化区域内（超过核心椭圆但在加羽化范围内）
            // 二次衰减，使边缘更柔和
            const fadeRange = 1 - Math.sqrt(coreDistanceSquared);
            alpha = Math.max(0, fadeRange * fadeRange * opacity * 255);
          }
        }

        if (alpha > 0.5) {
          // 混合模式：只在透明区域显示阴影（不遮挡已有内容）
          const existingAlpha = data[idx + 3] / 255;

          // 如果当前像素是透明的，添加阴影
          if (existingAlpha < 0.1) {
            data[idx] = color.r;
            data[idx + 1] = color.g;
            data[idx + 2] = color.b;
            data[idx + 3] = Math.round(alpha);
          }
        }
      }
    }

    // 应用更改
    ctx.putImageData(imageData, 0, 0);

    // 添加到撤销历史（先取得修改后的数据）
    const newImageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const command = new DrawCommand(layer, newImageData, originalImageData);
    editor.history.execute(command);

    editor.isDirty = true;
    editor.render();
  }

  /**
   * 十六进制颜色转 RGB
   */
  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * 获取工具提示
   */
  getHint() {
    return `
      🎯 阴影椭圆工具 - 绘制椭圆形阴影

      使用方法:
      1. 点击并拖拽定义椭圆的大小
      2. 按住 Shift 拖拽可绘制正圆
      3. 松开鼠标完成绘制

      选项说明:
      • 椭圆 X 半径: 椭圆的水平半径（px）
      • 椭圆 Y 半径: 椭圆的垂直半径（px）
      • 羽化半径: 边缘模糊程度（0-50px）
      • 不透明度: 阴影的深浅（0-1，推荐0.6）
      • 硬度: 0=完全羽化, 1=硬边界（推荐0.2）
      • 颜色: 阴影的颜色（支持任意色彩）

      💡 提示:
      • 只会在透明区域绘制，不会遮住已有内容
      • 默认颜色更深（0.6透明度）
      • 调整参数后重新绘制即可应用新设置
    `;
  }
}

