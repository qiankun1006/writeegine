/**
 * BrushTool - 画笔工具
 *
 * 用柔和边缘的笔刷进行自由绘制
 */
class BrushTool extends Tool {
  constructor() {
    super({
      id: 'brush',
      name: '画笔',
      icon: '🖌️',
      cursor: 'crosshair',
      hotkey: 'b'
    });

    // 工具特定选项
    this.options = {
      size: 10,
      opacity: 1.0,
      hardness: 50, // 0-100，越高边缘越硬
      color: '#000000',
      flow: 100 // 笔刷流量 0-100
    };

    // 绘制状态
    this.lastX = 0;
    this.lastY = 0;
    this.lastPressure = 1.0;
  }

  /**
   * 鼠标按下
   */
  onMouseDown(e, editor) {
    super.onMouseDown(e, editor);

    const layer = editor.document.getSelectedLayer();
    if (!layer) return;

    this.lastX = e.worldX;
    this.lastY = e.worldY;

    // 保存初始状态用于撤销
    this.initialImageData = layer.getContext().getImageData(
      0, 0, layer.width, layer.height
    );
  }

  /**
   * 鼠标移动
   */
  onMouseMove(e, editor) {
    if (!this.isDragging) return;

    const layer = editor.document.getSelectedLayer();
    if (!layer) return;

    const { worldX, worldY } = e;

    // 获取图层上下文
    const ctx = layer.getContext();

    // 设置笔刷参数
    ctx.globalAlpha = (this.options.opacity * this.options.flow) / 100;
    ctx.fillStyle = this.options.color;
    ctx.strokeStyle = this.options.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 根据硬度计算笔刷半径和软硬度
    const size = this.options.size;
    const hardness = this.options.hardness / 100;

    // 绘制笔刷笔划
    this.drawBrushStroke(ctx, this.lastX, this.lastY, worldX, worldY, size, hardness);

    this.lastX = worldX;
    this.lastY = worldY;

    // 标记脏区域以重新渲染
    editor.renderer.markDirty();

    if (window.eventBus) {
      window.eventBus.emit('documentChanged', { type: 'brush-stroke', layer: layer.id });
    }
  }

  /**
   * 鼠标释放
   */
  onMouseUp(e, editor) {
    if (!this.isDragging) return;

    const layer = editor.document.getSelectedLayer();
    if (!layer || !this.initialImageData) return;

    // 创建命令用于撤销/重做
    const finalImageData = layer.getContext().getImageData(
      0, 0, layer.width, layer.height
    );

    const command = new DrawCommand(layer, finalImageData, this.initialImageData);
    editor.history.execute(command);

    this.initialImageData = null;

    super.onMouseUp(e, editor);
  }

  /**
   * 绘制笔刷笔划
   */
  drawBrushStroke(ctx, x0, y0, x1, y1, size, hardness) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance) + 1;

    // 沿着路径绘制多个笔刷点
    for (let i = 0; i < steps; i++) {
      const t = steps > 1 ? i / (steps - 1) : 0;
      const x = x0 + dx * t;
      const y = y0 + dy * t;

      // 根据硬度创建笔刷
      if (hardness > 0.5) {
        // 硬笔刷
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 软笔刷（使用渐变）
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
        const alpha = ctx.globalAlpha;
        const alphaValue = Math.round(alpha * 255);

        // 根据硬度计算渐变
        const softness = 1 - hardness;
        gradient.addColorStop(0, this.hexToRgba(this.options.color, alpha * hardness));
        gradient.addColorStop(softness, this.hexToRgba(this.options.color, alpha * hardness * 0.5));
        gradient.addColorStop(1, this.hexToRgba(this.options.color, 0));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.options.color;
      }
    }
  }

  /**
   * Hex 颜色转 RGBA
   */
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * 获取工具选项 UI
   */
  getOptionsUI() {
    return `
      <div class="option-group">
        <label class="option-label">笔刷大小</label>
        <input type="range" class="option-input" min="1" max="100" value="${this.options.size}" data-option="size">
      </div>
      <div class="option-group">
        <label class="option-label">不透明度</label>
        <input type="range" class="option-input" min="0" max="100" value="${this.options.opacity * 100}" data-option="opacity">
      </div>
      <div class="option-group">
        <label class="option-label">硬度</label>
        <input type="range" class="option-input" min="0" max="100" value="${this.options.hardness}" data-option="hardness">
      </div>
      <div class="option-group">
        <label class="option-label">颜色</label>
        <input type="color" class="option-input" value="${this.options.color}" data-option="color">
      </div>
    `;
  }
}

/**
 * DrawCommand - 绘制命令
 */
class DrawCommand extends Command {
  constructor(layer, imageData, previousImageData) {
    super();
    this.layer = layer;
    this.imageData = imageData;
    this.previousImageData = previousImageData;
  }

  execute() {
    // 执行时已经完成，但为了一致性保留此方法
    this.layer.getContext().putImageData(this.imageData, 0, 0);
  }

  undo() {
    this.layer.getContext().putImageData(this.previousImageData, 0, 0);
  }

  getDescription() {
    return 'Brush Stroke';
  }
}

