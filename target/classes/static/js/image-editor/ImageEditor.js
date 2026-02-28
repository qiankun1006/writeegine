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

    // 初始化工具提示管理器
    this.tooltipManager = new TooltipManager({
      delay: 300,
      fadeDuration: 150,
      position: 'top'
    });
    this.tooltipManager.init();

    // 编辑器状态
    this.isDirty = false;
    this.isDrawing = false;

    // 初始化工具
    this._setupTools();

    // 设置工具提示
    this._setupTooltips();

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

    // Phase 4 - 变换与3D工具
    this.toolManager.register(new FreeTransformTool());
    this.toolManager.register(new ScaleTool());
    this.toolManager.register(new RotateTool());
    this.toolManager.register(new SkewTool());
    this.toolManager.register(new PerspectiveTool());
    this.toolManager.register(new ThreeDTransformTool());

    // Phase 5 - 裁剪与透明度工具
    this.toolManager.register(new CropTool());
    this.toolManager.register(new OpacityTool());

    // 激活画笔工具作为默认工具
    this.toolManager.activate('brush', this);

    // 初始化滤镜系统
    this._setupFilters();
  }

  /**
   * 设置工具提示
   */
  _setupTooltips() {
    // 选择工具提示
    this._registerTooltip('rect-select-btn', {
      title: '矩形选择',
      description: '创建矩形选区，用于选择图像的矩形区域',
      shortcut: 'R'
    });

    this._registerTooltip('ellipse-select-btn', {
      title: '椭圆选择',
      description: '创建椭圆选区，用于选择图像的椭圆区域',
      shortcut: 'E'
    });

    // 绘制工具提示
    this._registerTooltip('brush-btn', {
      title: '画笔',
      description: '使用软边画笔绘制，模拟真实画笔效果',
      shortcut: 'B'
    });

    this._registerTooltip('pencil-btn', {
      title: '铅笔',
      description: '使用硬边铅笔绘制，创建清晰的线条',
      shortcut: 'P'
    });

    this._registerTooltip('eraser-btn', {
      title: '橡皮擦',
      description: '擦除图像内容，显示下层图层或透明背景',
      shortcut: 'E'
    });

    // 变换工具提示
    this._registerTooltip('free-transform-btn', {
      title: '自由变换',
      description: '自由缩放、旋转和扭曲选中的图层或选区',
      shortcut: 'Ctrl+T'
    });

    this._registerTooltip('scale-btn', {
      title: '缩放',
      description: '按比例调整图层或选区的大小',
      shortcut: 'S'
    });

    this._registerTooltip('rotate-btn', {
      title: '旋转',
      description: '旋转图层或选区',
      shortcut: 'R'
    });

    this._registerTooltip('skew-btn', {
      title: '倾斜',
      description: '倾斜图层或选区，创建透视效果',
      shortcut: 'K'
    });

    this._registerTooltip('perspective-btn', {
      title: '透视变换',
      description: '调整图层的透视效果，模拟三维空间',
      shortcut: 'P'
    });

    this._registerTooltip('3d-transform-btn', {
      title: '3D变换',
      description: '在三维空间中旋转和变换图层',
      shortcut: '3'
    });

    // 裁剪与透明度工具提示
    this._registerTooltip('crop-btn', {
      title: '裁剪',
      description: '无损质量裁剪图像，支持自由调整裁剪区域',
      shortcut: 'C'
    });

    this._registerTooltip('opacity-btn', {
      title: '透明度',
      description: '调整图层或指定区域的透明度，支持笔刷模式',
      shortcut: 'O'
    });

    // 菜单按钮提示
    this._registerTooltip('menuFile', {
      title: '文件',
      description: '文件操作菜单：新建、打开、保存、导出等'
    });

    this._registerTooltip('menuEdit', {
      title: '编辑',
      description: '编辑操作菜单：撤销、重做、复制、粘贴等'
    });

    this._registerTooltip('menuImage', {
      title: '图像',
      description: '图像操作菜单：调整大小、旋转、裁剪等'
    });

    this._registerTooltip('menuLayer', {
      title: '图层',
      description: '图层操作菜单：新建、删除、合并、调整等'
    });

    this._registerTooltip('menuSelect', {
      title: '选择',
      description: '选择操作菜单：全选、反选、取消选择等'
    });

    this._registerTooltip('menuFilter', {
      title: '滤镜',
      description: '滤镜效果菜单：模糊、锐化、色彩调整等'
    });

    this._registerTooltip('menuView', {
      title: '查看',
      description: '查看选项菜单：缩放、网格、标尺等'
    });

    // 缩放控制提示
    this._registerTooltip('zoomOut', {
      title: '缩小',
      description: '缩小画布显示比例',
      shortcut: 'Ctrl+-'
    });

    this._registerTooltip('zoomIn', {
      title: '放大',
      description: '放大画布显示比例',
      shortcut: 'Ctrl++'
    });

    this._registerTooltip('fitWindow', {
      title: '适应窗口',
      description: '调整画布大小以适应窗口'
    });

    // 面板按钮提示
    this._registerTooltip('addLayerBtn', {
      title: '新建图层',
      description: '在当前文档中添加新的空白图层'
    });

    this._registerTooltip('deleteLayerBtn', {
      title: '删除图层',
      description: '删除当前选中的图层'
    });

    this._registerTooltip('undoBtn', {
      title: '撤销',
      description: '撤销上一步操作',
      shortcut: 'Ctrl+Z'
    });

    this._registerTooltip('redoBtn', {
      title: '重做',
      description: '重做被撤销的操作',
      shortcut: 'Ctrl+Y'
    });

    // 状态栏按钮提示
    this._registerTooltip('exportBtn', {
      title: '导出图片',
      description: '将当前文档导出为图片文件（PNG/JPG）'
    });

    this._registerTooltip('saveBtn', {
      title: '保存文档',
      description: '保存当前编辑的文档'
    });

    // 状态栏信息提示
    this._registerTooltip('coordsDisplay', {
      title: '坐标信息',
      description: '显示鼠标当前位置的坐标（X, Y）'
    });

    this._registerTooltip('sizeDisplay', {
      title: '文档尺寸',
      description: '显示当前文档的宽度和高度'
    });

    this._registerTooltip('layerInfoDisplay', {
      title: '图层信息',
      description: '显示当前图层信息和总图层数'
    });
  }

  /**
   * 注册工具提示
   * @param {string} elementId - 元素ID
   * @param {Object} data - 工具提示数据
   */
  _registerTooltip(elementId, data) {
    this.tooltipManager.register(elementId, data);
  }

  /**
   * 设置滤镜系统
   */
  _setupFilters() {
    // 注册基础滤镜
    filterPipeline.registerFilter('blur', BlurFilter);
    filterPipeline.registerFilter('sharpen', SharpenFilter);
    filterPipeline.registerFilter('emboss', EmbossFilter);
    filterPipeline.registerFilter('edge-detect', EdgeDetectFilter);

    // 注册色彩调整滤镜
    filterPipeline.registerFilter('brightness-contrast', BrightnessContrastFilter);
    filterPipeline.registerFilter('hue-saturation', HueSaturationFilter);
    filterPipeline.registerFilter('levels', LevelsFilter);
    filterPipeline.registerFilter('curves', CurvesFilter);
    filterPipeline.registerFilter('saturation', SaturationFilter);
    filterPipeline.registerFilter('grayscale', GrayscaleFilter);
    filterPipeline.registerFilter('invert', InvertFilter);
    filterPipeline.registerFilter('temperature', TemperatureFilter);

    // 注册高级滤镜
    filterPipeline.registerFilter('liquify', LiquifyFilter);
    filterPipeline.registerFilter('displace', DisplaceFilter);
    filterPipeline.registerFilter('motion-blur', MotionBlurFilter);
    filterPipeline.registerFilter('radial-blur', RadialBlurFilter);
    filterPipeline.registerFilter('pixelate', PixelateFilter);
    filterPipeline.registerFilter('oil-paint', OilPaintFilter);

    // 注册效果滤镜
    filterPipeline.registerFilter('clouds', CloudsFilter);
    filterPipeline.registerFilter('lighting', LightingFilter);
    filterPipeline.registerFilter('emboss-render', EmbossRenderFilter);
    filterPipeline.registerFilter('bevel-emboss', BevelEmbossFilter);
    filterPipeline.registerFilter('mirror', MirrorFilter);
    filterPipeline.registerFilter('checkerboard', CheckerboardFilter);
    filterPipeline.registerFilter('shadow', ShadowFilter);
    filterPipeline.registerFilter('ground-shadow', GroundShadowFilter);

    // 注册图层样式
    layerStyleManager.registerStyle('drop-shadow', DropShadowStyle);
    layerStyleManager.registerStyle('outer-glow', OuterGlowStyle);
    layerStyleManager.registerStyle('inner-glow', InnerGlowStyle);
    layerStyleManager.registerStyle('stroke', StrokeStyle);
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
    const activeTool = this.toolManager.getActiveTool();
    this.renderer.render(this.document, true, activeTool);
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
   * 保存文档 - 导出为 PNG 格式
   */
  saveDocument() {
    try {
      console.log('💾 保存文档开始...');

      // 直接导出为 PNG 格式
      const dataURL = this.renderer.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${this.document.name || 'image'}-${Date.now()}.png`;
      link.click();

      console.log('✅ 文档已保存为 PNG');
      alert('✅ 图片已成功导出为 PNG 格式');
      eventBus.emit('documentSaved', { documentName: this.document.name, format: 'png' });
    } catch (error) {
      console.error('❌ 保存失败:', error);
      alert('保存失败: ' + error.message);
    }
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

  /**
   * 应用滤镜到当前图层
   */
  applyFilter(filterId, params = {}) {
    const layer = this.getSelectedLayer();
    if (!layer) return null;

    const ctx = layer.getContext();
    const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

    // 应用滤镜
    const newImageData = filterPipeline.applyFilter(filterId, previousImageData, params);

    if (newImageData) {
      ctx.putImageData(newImageData, 0, 0);

      // 添加到撤销历史
      const command = new DrawCommand(layer, newImageData, previousImageData);
      commandHistory.execute(command);

      this.isDirty = true;
      this.render();
      eventBus.emit('filterApplied', { filterId, params });

      return newImageData;
    }

    return null;
  }

  /**
   * 应用滤镜链
   */
  applyFilterChain(filterIds, paramsList = []) {
    const layer = this.getSelectedLayer();
    if (!layer) return null;

    const ctx = layer.getContext();
    const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

    // 应用滤镜链
    let result = filterPipeline.applyFilterChain(filterIds, previousImageData, paramsList);

    if (result) {
      ctx.putImageData(result, 0, 0);

      // 添加到撤销历史
      const command = new DrawCommand(layer, result, previousImageData);
      commandHistory.execute(command);

      this.isDirty = true;
      this.render();
      eventBus.emit('filterChainApplied', { filterIds });

      return result;
    }

    return null;
  }

  /**
   * 应用图层样式
   */
  applyLayerStyle(styleId, params = {}) {
    const layer = this.getSelectedLayer();
    if (!layer) return null;

    const ctx = layer.getContext();
    const previousImageData = ctx.getImageData(0, 0, layer.width, layer.height);

    // 应用样式
    const newImageData = layerStyleManager.applyStyle(styleId, previousImageData, params);

    if (newImageData) {
      ctx.putImageData(newImageData, 0, 0);

      // 添加到撤销历史
      const command = new DrawCommand(layer, newImageData, previousImageData);
      commandHistory.execute(command);

      this.isDirty = true;
      this.render();
      eventBus.emit('layerStyleApplied', { styleId, params });

      return newImageData;
    }

    return null;
  }

  /**
   * 获取所有可用的滤镜
   */
  getAvailableFilters() {
    return filterPipeline.getAllFilters();
  }

  /**
   * 获取滤镜历史
   */
  getFilterHistory() {
    return filterPipeline.getHistory();
  }

  /**
   * 撤销滤镜
   */
  undoFilter() {
    const item = filterPipeline.undo();
    if (item) {
      this.render();
      return item;
    }
    return null;
  }

  /**
   * 重做滤镜
   */
  redoFilter() {
    const item = filterPipeline.redo();
    if (item) {
      this.render();
      return item;
    }
    return null;
  }

  /**
   * 销毁编辑器
   */
  destroy() {
    // 销毁工具提示管理器
    if (this.tooltipManager) {
      this.tooltipManager.destroy();
      this.tooltipManager = null;
    }

    // 清理其他资源
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    // 清理事件监听
    if (this._eventListeners) {
      this._eventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      this._eventListeners = null;
    }

    // 清理画布
    if (this.canvas) {
      const context = this.canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    // 重置状态
    this.document = null;
    this.history = null;
    this.toolManager = null;
    this.isDirty = false;
    this.isDrawing = false;
  }
}

