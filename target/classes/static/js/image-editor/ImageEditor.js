/**
 * ImageEditor - 图片编辑器主类
 * 整合所有子系统，提供统一的编辑接口
 */
class ImageEditor {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      ...options
    };

    // 初始化子系统
    this.document = new Document(this.options.width, this.options.height);
    this.renderer = new CanvasRenderer(this.canvas);
    this.history = commandHistory;
    this.toolManager = toolManager;

    // 编辑器状态
    this.isDirty = false;
    this.isDrawing = false;

    // 初始化工具
    this._setupTools();

    // 事件监听
    this._setupEventListeners();

    // 初始化渲染
    this.render();
  }

  /**
   * 设置工具
   */
  _setupTools() {
    // Phase 1 - 基础工具
    this.toolManager.register(new RectSelectTool());
    this.toolManager.register(new EllipseSelectTool());
    this.toolManager.register(new BrushTool());
    this.toolManager.register(new PencilTool());
    this.toolManager.register(new EraserTool());

    // Phase 2 - 高级工具
    this.toolManager.register(new WandTool());
    this.toolManager.register(new FreeSelectTool());
    this.toolManager.register(new QuickSelectTool());
    this.toolManager.register(new CloneTool());
    this.toolManager.register(new HealingTool());
    this.toolManager.register(new SprayTool());
    this.toolManager.register(new BucketFillTool());
    this.toolManager.register(new GradientTool());
    this.toolManager.register(new TextTool());
    this.toolManager.register(new PenTool());

    // 激活画笔工具作为默认工具
    this.toolManager.activate('brush', this);
  }

  /**
   * 设置事件监听
   */
  _setupEventListeners() {
    // Canvas 事件
    this.canvas.addEventListener('mousedown', (e) => this._handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this._handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this._handleWheel(e));

    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => this._handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this._handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this._handleTouchEnd(e));

    // 全局快捷键
    document.addEventListener('keydown', (e) => this._handleKeyDown(e));
    document.addEventListener('keyup', (e) => this._handleKeyUp(e));

    // 事件总线事件
    eventBus.on('documentChanged', () => this.render());
    eventBus.on('historyChanged', () => this.render());
  }

  /**
   * 处理鼠标按下
   */
  _handleMouseDown(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.toolManager.handleMouseEvent('mousedown', {
      clientX: x,
      clientY: y,
      button: e.button,
      buttons: e.buttons,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    }, this);
  }

  /**
   * 处理鼠标移动
   */
  _handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.toolManager.handleMouseEvent('mousemove', {
      clientX: x,
      clientY: y,
      button: e.button,
      buttons: e.buttons,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    }, this);
  }

  /**
   * 处理鼠标释放
   */
  _handleMouseUp(e) {
    this.isDrawing = false;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.toolManager.handleMouseEvent('mouseup', {
      clientX: x,
      clientY: y,
      button: e.button,
      buttons: e.buttons,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    }, this);
  }

  /**
   * 处理滚轮缩放
   */
  _handleWheel(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = this.canvas.getBoundingClientRect();
    this.renderer.zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
    this.render();
  }

  /**
   * 处理触摸开始
   */
  _handleTouchStart(e) {
    e.preventDefault();
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.toolManager.handleTouchEvent('touchstart', {
      touches: e.touches,
      clientX: x,
      clientY: y
    }, this);
  }

  /**
   * 处理触摸移动
   */
  _handleTouchMove(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.toolManager.handleTouchEvent('touchmove', {
      touches: e.touches,
      clientX: x,
      clientY: y
    }, this);
  }

  /**
   * 处理触摸结束
   */
  _handleTouchEnd(e) {
    e.preventDefault();
    this.isDrawing = false;

    this.toolManager.handleTouchEvent('touchend', {
      touches: e.touches
    }, this);
  }

  /**
   * 处理键盘按下
   */
  _handleKeyDown(e) {
    // 快捷键
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          this.undo();
          break;
        case 'y':
        case 'shift':
          if (e.shiftKey) {
            e.preventDefault();
            this.redo();
          }
          break;
        case 's':
          e.preventDefault();
          this.saveDocument();
          break;
      }
    }

    this.toolManager.handleKeyEvent('keydown', e, this);
  }

  /**
   * 处理键盘释放
   */
  _handleKeyUp(e) {
    this.toolManager.handleKeyEvent('keyup', e, this);
  }

  /**
   * 渲染编辑器
   */
  render() {
    this.renderer.render(this.document, true);
  }

  /**
   * 撤销
   */
  undo() {
    if (this.history.undo()) {
      this.render();
      return true;
    }
    return false;
  }

  /**
   * 重做
   */
  redo() {
    if (this.history.redo()) {
      this.render();
      return true;
    }
    return false;
  }

  /**
   * 可以撤销
   */
  canUndo() {
    return this.history.canUndo();
  }

  /**
   * 可以重做
   */
  canRedo() {
    return this.history.canRedo();
  }

  /**
   * 新建图层
   */
  createLayer(name = 'Layer') {
    const layer = new Layer({
      name,
      width: this.document.width,
      height: this.document.height
    });
    this.document.addLayer(layer);
    this.render();
    return layer;
  }

  /**
   * 删除图层
   */
  deleteLayer(layerId) {
    this.document.removeLayer(layerId);
    this.render();
  }

  /**
   * 获取选中的图层
   */
  getSelectedLayer() {
    return this.document.getSelectedLayer();
  }

  /**
   * 选中图层
   */
  selectLayer(layerId) {
    this.document.selectedLayerId = layerId;
    eventBus.emit('layerSelected', { layerId });
  }

  /**
   * 激活工具
   */
  activateTool(toolId) {
    return this.toolManager.activate(toolId, this);
  }

  /**
   * 获取工具选项
   */
  getToolOptions() {
    const tool = this.toolManager.getActiveTool();
    if (tool) {
      return tool.getOptions();
    }
    return {};
  }

  /**
   * 设置工具选项
   */
  setToolOption(option, value) {
    const tool = this.toolManager.getActiveTool();
    if (tool) {
      tool.onOptionChange(option, value);
    }
  }

  /**
   * 保存文档
   */
  async saveDocument() {
    const docJSON = await this.document.toJSON();
    const dataStr = JSON.stringify(docJSON);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.document.name || 'image'}.json`;
    link.click();
    URL.revokeObjectURL(url);

    eventBus.emit('documentSaved', { documentName: this.document.name });
  }

  /**
   * 加载文档
   */
  async loadDocument(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          this.document = await Document.fromJSON(json);
          this.render();
          eventBus.emit('documentLoaded', { documentName: this.document.name });
          resolve(this.document);
        } catch (error) {
          console.error('Error loading document:', error);
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  /**
   * 导出为 PNG
   */
  exportPNG(filename = 'image.png') {
    const dataURL = this.renderer.toDataURL('image/png');
    this._downloadImage(dataURL, filename);
    eventBus.emit('imageExported', { format: 'png', filename });
  }

  /**
   * 导出为 JPG
   */
  exportJPG(filename = 'image.jpg', quality = 0.9) {
    const dataURL = this.renderer.toDataURL('image/jpeg', quality);
    this._downloadImage(dataURL, filename);
    eventBus.emit('imageExported', { format: 'jpg', filename });
  }

  /**
   * 下载图片
   */
  _downloadImage(dataURL, filename) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.click();
  }

  /**
   * 获取编辑器信息
   */
  getInfo() {
    return {
      documentSize: { width: this.document.width, height: this.document.height },
      layersCount: this.document.layers.length,
      selectedLayerId: this.document.selectedLayerId,
      activeTool: this.toolManager.getActiveTool()?.id,
      zoomLevel: this.renderer.getZoomLevel(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      isDirty: this.isDirty
    };
  }
}

