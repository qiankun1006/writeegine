/**
 * ImageEditor - 主编辑器类
 *
 * 整合所有核心系统，提供统一的编辑器接口
 */
class ImageEditor {
  constructor(canvasElement, options = {}) {
    // 配置
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      maxHistorySize: options.maxHistorySize || 100,
      renderFPS: options.renderFPS || 60,
      ...options
    };

    // DOM 元素
    this.canvas = canvasElement;
    if (!this.canvas) {
      throw new Error('Canvas element is required');
    }

    // 设置 canvas 尺寸
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;

    // 核心系统
    this.document = new Document({
      width: this.options.width,
      height: this.options.height
    });

    this.renderer = new CanvasRenderer(this.canvas, this.document);
    this.renderer.setFPSLimit(this.options.renderFPS);

    this.history = new CommandHistory(this.options.maxHistorySize);
    this.toolManager = new ToolManager(this);

    // 状态
    this.isInitialized = false;
    this.isRunning = false;

    // 初始化
    this.init();
  }

  /**
   * 初始化编辑器
   */
  init() {
    try {
      // 创建默认图层
      const layer = new Layer({
        name: 'Layer 1',
        width: this.document.width,
        height: this.document.height
      });
      this.document.addLayer(layer);
      this.document.selectLayer(0);

      // 设置事件监听
      this.setupEventListeners();

      // 注册默认工具
      this.registerDefaultTools();

      // 激活第一个工具
      this.toolManager.activate('brush');

      // 启动渲染循环
      this.startRenderLoop();

      this.isInitialized = true;

      if (window.eventBus) {
        window.eventBus.emit('editorInitialized', { editor: this });
      }

      console.log('ImageEditor initialized successfully');
    } catch (error) {
      console.error('Error initializing ImageEditor:', error);
      throw error;
    }
  }

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    this.canvas.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
    this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

    // 滚轮缩放
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    // 键盘事件
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // 事件总线监听
    if (window.eventBus) {
      window.eventBus.on('documentChanged', () => this.renderer.markDirty());
    }
  }

  /**
   * 注册默认工具
   */
  registerDefaultTools() {
    // 这些工具会在后续实现
    // 这里先占位
    console.log('Default tools will be registered when tool classes are created');
  }

  /**
   * 鼠标事件处理
   */
  handleMouseDown(e) {
    const { x, y } = this.getMouseWorldCoords(e);
    const event = {
      clientX: e.clientX,
      clientY: e.clientY,
      worldX: x,
      worldY: y,
      button: e.button,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    };

    this.toolManager.handleMouseDown(event);

    if (window.eventBus) {
      window.eventBus.emit('mouseDown', event);
    }
  }

  handleMouseMove(e) {
    const { x, y } = this.getMouseWorldCoords(e);
    const event = {
      clientX: e.clientX,
      clientY: e.clientY,
      worldX: x,
      worldY: y,
      button: e.button,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    };

    this.toolManager.handleMouseMove(event);

    if (window.eventBus) {
      window.eventBus.emit('mouseMove', event);
    }
  }

  handleMouseUp(e) {
    const { x, y } = this.getMouseWorldCoords(e);
    const event = {
      clientX: e.clientX,
      clientY: e.clientY,
      worldX: x,
      worldY: y,
      button: e.button,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    };

    this.toolManager.handleMouseUp(event);

    if (window.eventBus) {
      window.eventBus.emit('mouseUp', event);
    }
  }

  handleMouseLeave(e) {
    this.toolManager.handleMouseLeave(e);

    if (window.eventBus) {
      window.eventBus.emit('mouseLeave', { target: e.target });
    }
  }

  handleMouseEnter(e) {
    this.toolManager.handleMouseEnter(e);

    if (window.eventBus) {
      window.eventBus.emit('mouseEnter', { target: e.target });
    }
  }

  handleDoubleClick(e) {
    const { x, y } = this.getMouseWorldCoords(e);
    const event = {
      clientX: e.clientX,
      clientY: e.clientY,
      worldX: x,
      worldY: y,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    };

    const tool = this.toolManager.getActiveTool();
    if (tool && tool.onDoubleClick) {
      tool.onDoubleClick(event, this);
    }

    if (window.eventBus) {
      window.eventBus.emit('doubleClick', event);
    }
  }

  handleWheel(e) {
    e.preventDefault();

    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    this.renderer.zoom(factor, e.clientX, e.clientY);

    if (window.eventBus) {
      window.eventBus.emit('viewportChanged', this.renderer.getViewportInfo());
    }
  }

  /**
   * 键盘事件处理
   */
  handleKeyDown(e) {
    // 快捷键
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        this.undo();
        return;
      } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        this.redo();
        return;
      } else if (e.key === 's') {
        e.preventDefault();
        if (window.eventBus) {
          window.eventBus.emit('saveRequested');
        }
        return;
      }
    }

    this.toolManager.handleKeyDown(e);

    if (window.eventBus) {
      window.eventBus.emit('keyDown', e);
    }
  }

  handleKeyUp(e) {
    this.toolManager.handleKeyUp(e);

    if (window.eventBus) {
      window.eventBus.emit('keyUp', e);
    }
  }

  /**
   * 获取鼠标的世界坐标
   */
  getMouseWorldCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return this.renderer.screenToWorld(screenX, screenY);
  }

  /**
   * 启动渲染循环
   */
  startRenderLoop() {
    this.isRunning = true;

    const loop = () => {
      this.renderer.render();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  /**
   * 停止渲染循环
   */
  stopRenderLoop() {
    this.isRunning = false;
  }

  /**
   * 撤销
   */
  undo() {
    this.history.undo();
    this.renderer.markDirty();

    if (window.eventBus) {
      window.eventBus.emit('undoPerformed');
    }
  }

  /**
   * 重做
   */
  redo() {
    this.history.redo();
    this.renderer.markDirty();

    if (window.eventBus) {
      window.eventBus.emit('redoPerformed');
    }
  }

  /**
   * 获取编辑器信息
   */
  getInfo() {
    return {
      document: this.document.getInfo(),
      viewport: this.renderer.getViewportInfo(),
      tool: this.toolManager.getActiveTool()?.getInfo() || null,
      history: {
        size: this.history.size(),
        canUndo: this.history.canUndo(),
        canRedo: this.history.canRedo()
      }
    };
  }

  /**
   * 销毁编辑器
   */
  destroy() {
    this.stopRenderLoop();
    this.isInitialized = false;

    if (window.eventBus) {
      window.eventBus.emit('editorDestroyed');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageEditor;
}

