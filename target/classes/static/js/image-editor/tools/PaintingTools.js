/**
 * 绘制命令 - 用于撤销/重做
 */
class DrawCommand extends Command {
  constructor(layer, imageData, previousImageData) {
    super();
    this.layer = layer;
    this.imageData = imageData;
    this.previousImageData = previousImageData;
  }

  execute() {
    this.layer.canvas.getContext('2d').putImageData(this.imageData, 0, 0);
  }

  undo() {
    this.layer.canvas.getContext('2d').putImageData(this.previousImageData, 0, 0);
  }

  getDescription() {
    return 'Draw Stroke';
  }
}

/**
 * BrushTool - 画笔工具
 */
class BrushTool extends Tool {
  constructor() {
    super({
      id: 'brush',
      name: '画笔',
      icon: '🖌️',
      cursor: 'crosshair',
      category: 'painting',
      options: {
        size: 10,
        opacity: 1.0,
        hardness: 100,
        color: '#000000',
        spacing: 1
      }
    });

    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.strokeStartImageData = null;
  }

  activate(editor) {
    super.activate(editor);
    eventBus.emit('toolOptionsChanged', {
      tool: this.id,
      options: this.options
    });
  }

  onMouseDown(e, editor) {
    this.isDrawing = true;

    const layer = editor.getSelectedLayer();
    if (!layer) {
      console.warn('No layer selected');
      this.isDrawing = false;
      return;
    }

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    // 保存初始状态用于撤销
    this.strokeStartImageData = layer.canvas
      .getContext('2d')
      .getImageData(0, 0, layer.width, layer.height);

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing) return;

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    this._drawStroke(layer, this.lastX, this.lastY, x, y);

    this.lastX = x;
    this.lastY = y;

    editor.render();
  }

  onMouseUp(e, editor) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const layer = editor.getSelectedLayer();
      if (layer && this.strokeStartImageData) {
        // 创建绘制命令并添加到历史
        const currentImageData = layer.canvas
          .getContext('2d')
          .getImageData(0, 0, layer.width, layer.height);

        const command = new DrawCommand(layer, currentImageData, this.strokeStartImageData);
        commandHistory.execute(command);

        eventBus.emit('strokeFinished');
      }

      this.strokeStartImageData = null;
    }
  }

  _drawStroke(layer, fromX, fromY, toX, toY) {
    const ctx = layer.getContext();

    // 关键修复：将世界坐标转换为图层本地坐标
    // 这样才能正确在缩放/平移以及裁剪后的图层上绘制
    const localFromX = fromX - layer.x;
    const localFromY = fromY - layer.y;
    const localToX = toX - layer.x;
    const localToY = toY - layer.y;

    ctx.strokeStyle = this.options.color;
    ctx.lineWidth = this.options.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = this.options.opacity;

    // 绘制柔和笔刷
    const hardness = this.options.hardness / 100;
    ctx.shadowBlur = this.options.size * (1 - hardness) * 2;
    ctx.shadowColor = this.options.color;

    ctx.beginPath();
    ctx.moveTo(localFromX, localFromY);
    ctx.lineTo(localToX, localToY);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  }

  onOptionChange(option, value) {
    super.onOptionChange(option, value);
    eventBus.emit('brushSettingsChanged', { option, value });
  }
}

/**
 * PencilTool - 铅笔工具
 */
class PencilTool extends Tool {
  constructor() {
    super({
      id: 'pencil',
      name: '铅笔',
      icon: '✏️',
      cursor: 'crosshair',
      category: 'painting',
      options: {
        size: 5,
        opacity: 1.0,
        color: '#000000'
      }
    });

    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.strokeStartImageData = null;
  }

  onMouseDown(e, editor) {
    this.isDrawing = true;

    const layer = editor.getSelectedLayer();
    if (!layer) {
      this.isDrawing = false;
      return;
    }

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    this.strokeStartImageData = layer.canvas
      .getContext('2d')
      .getImageData(0, 0, layer.width, layer.height);

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing) return;

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    this._drawStroke(layer, this.lastX, this.lastY, x, y);

    this.lastX = x;
    this.lastY = y;

    editor.render();
  }

  onMouseUp(e, editor) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const layer = editor.getSelectedLayer();
      if (layer && this.strokeStartImageData) {
        const currentImageData = layer.canvas
          .getContext('2d')
          .getImageData(0, 0, layer.width, layer.height);

        const command = new DrawCommand(layer, currentImageData, this.strokeStartImageData);
        commandHistory.execute(command);
      }

      this.strokeStartImageData = null;
    }
  }

  _drawStroke(layer, fromX, fromY, toX, toY) {
    const ctx = layer.getContext();

    // 关键修复：将世界坐标转换为图层本地坐标
    const localFromX = fromX - layer.x;
    const localFromY = fromY - layer.y;
    const localToX = toX - layer.x;
    const localToY = toY - layer.y;

    ctx.strokeStyle = this.options.color;
    ctx.lineWidth = this.options.size;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'bevel';
    ctx.globalAlpha = this.options.opacity;

    // 铅笔是硬边缘，不带阴影
    ctx.beginPath();
    ctx.moveTo(localFromX, localFromY);
    ctx.lineTo(localToX, localToY);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
  }
}

/**
 * EraserTool - 橡皮擦工具
 */
class EraserTool extends Tool {
  constructor() {
    super({
      id: 'eraser',
      name: '橡皮',
      icon: '🧹',
      cursor: 'crosshair',
      category: 'painting',
      options: {
        size: 15,
        opacity: 1.0,
        hardness: 100
      }
    });

    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.strokeStartImageData = null;
  }

  onMouseDown(e, editor) {
    this.isDrawing = true;

    const layer = editor.getSelectedLayer();
    if (!layer) {
      this.isDrawing = false;
      return;
    }

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    this.strokeStartImageData = layer.canvas
      .getContext('2d')
      .getImageData(0, 0, layer.width, layer.height);

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing) return;

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    this._erase(layer, this.lastX, this.lastY, x, y);

    this.lastX = x;
    this.lastY = y;

    editor.render();
  }

  onMouseUp(e, editor) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const layer = editor.getSelectedLayer();
      if (layer && this.strokeStartImageData) {
        const currentImageData = layer.canvas
          .getContext('2d')
          .getImageData(0, 0, layer.width, layer.height);

        const command = new DrawCommand(layer, currentImageData, this.strokeStartImageData);
        commandHistory.execute(command);
      }

      this.strokeStartImageData = null;
    }
  }

  _erase(layer, fromX, fromY, toX, toY) {
    const ctx = layer.getContext();

    // 关键修复：将世界坐标转换为图层本地坐标
    const localFromX = fromX - layer.x;
    const localFromY = fromY - layer.y;
    const localToX = toX - layer.x;
    const localToY = toY - layer.y;

    ctx.strokeStyle = 'transparent';
    ctx.lineWidth = this.options.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = this.options.opacity;
    ctx.globalCompositeOperation = 'destination-out';

    // 使用深色笔刷擦除
    ctx.strokeStyle = '#000000';

    ctx.beginPath();
    ctx.moveTo(localFromX, localFromY);
    ctx.lineTo(localToX, localToY);
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  }
}

