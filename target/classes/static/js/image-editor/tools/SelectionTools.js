/**
 * RectSelectTool - 矩形选择工具
 */
class RectSelectTool extends Tool {
  constructor() {
    super({
      id: 'rect-select',
      name: '矩形选择',
      icon: '⬜',
      cursor: 'crosshair',
      category: 'selection',
      options: {
        feather: 0,
        antiAlias: true,
        mode: 'replace' // replace, add, subtract, intersect
      }
    });

    this.startX = 0;
    this.startY = 0;
    this.isSelecting = false;
  }

  onMouseDown(e, editor) {
    this.isSelecting = true;
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    this.startX = coords.x;
    this.startY = coords.y;
  }

  onMouseMove(e, editor) {
    if (!this.isSelecting) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const width = coords.x - this.startX;
    const height = coords.y - this.startY;

    // 设置选区
    if (Math.abs(width) > 1 && Math.abs(height) > 1) {
      const x = Math.min(this.startX, coords.x);
      const y = Math.min(this.startY, coords.y);
      const w = Math.abs(width);
      const h = Math.abs(height);

      editor.renderer.setSelection(x, y, w, h);
      editor.render();
    }
  }

  onMouseUp(e, editor) {
    if (this.isSelecting) {
      this.isSelecting = false;
      // 选择完成
      const selection = editor.renderer.getSelection();
      if (selection) {
        eventBus.emit('selectionChanged', { selection });
      }
    }
  }
}

/**
 * EllipseSelectTool - 椭圆选择工具
 */
class EllipseSelectTool extends Tool {
  constructor() {
    super({
      id: 'ellipse-select',
      name: '椭圆选择',
      icon: '⭕',
      cursor: 'crosshair',
      category: 'selection',
      options: {
        feather: 0,
        antiAlias: true,
        mode: 'replace'
      }
    });

    this.startX = 0;
    this.startY = 0;
    this.isSelecting = false;
  }

  onMouseDown(e, editor) {
    this.isSelecting = true;
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    this.startX = coords.x;
    this.startY = coords.y;
  }

  onMouseMove(e, editor) {
    if (!this.isSelecting) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const width = coords.x - this.startX;
    const height = coords.y - this.startY;

    if (Math.abs(width) > 1 && Math.abs(height) > 1) {
      const x = Math.min(this.startX, coords.x);
      const y = Math.min(this.startY, coords.y);
      const w = Math.abs(width);
      const h = Math.abs(height);

      // 对于椭圆选择，我们暂时用矩形表示，后续可以改进为真正的椭圆选区
      editor.renderer.setSelection(x, y, w, h);
      editor.render();
    }
  }

  onMouseUp(e, editor) {
    if (this.isSelecting) {
      this.isSelecting = false;
      const selection = editor.renderer.getSelection();
      if (selection) {
        eventBus.emit('selectionChanged', { selection });
      }
    }
  }
}

