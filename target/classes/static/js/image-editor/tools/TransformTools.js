/**
 * TransformTools.js - 变换工具集合
 * Phase 4: 变换与3D 功能实现
 */

/**
 * TransformTool - 变换工具基类
 */
class TransformTool extends Tool {
  constructor(options = {}) {
    super({
      id: options.id || 'transform',
      name: options.name || '变换',
      icon: options.icon || '🔄',
      cursor: options.cursor || 'move'
    });

    // 变换状态
    this.transformState = {
      isTransforming: false,
      transformType: null, // 'move', 'scale', 'rotate', 'skew'
      startX: 0,
      startY: 0,
      originalMatrix: null,
      currentMatrix: null,
      controlPoints: []
    };

    // 变换参数
    this.options = {
      preserveAspectRatio: true,
      interpolation: 'bilinear',
      ...options
    };
  }

  /**
   * 激活工具
   */
  activate(editor) {
    super.activate(editor);
    this.showTransformControls();
  }

  /**
   * 停用工具
   */
  deactivate() {
    super.deactivate();
    this.hideTransformControls();
  }

  /**
   * 显示变换控制点
   */
  showTransformControls() {
    const layer = this.getActiveLayer();
    if (!layer) return;

    // 创建变换控制框
    this.createTransformBox(layer);
  }

  /**
   * 隐藏变换控制点
   */
  hideTransformControls() {
    // 移除变换控制框
    const box = document.getElementById('transform-box');
    if (box) {
      box.remove();
    }
  }

  /**
   * 创建变换控制框
   */
  createTransformBox(layer) {
    // 移除现有的控制框
    this.hideTransformControls();

    // 创建新的控制框
    const box = document.createElement('div');
    box.id = 'transform-box';
    box.className = 'transform-box';
    box.style.position = 'absolute';
    box.style.border = '2px dashed #0099ff';
    box.style.pointerEvents = 'none';

    // 设置位置和大小
    const rect = this.getLayerRect(layer);
    box.style.left = `${rect.x}px`;
    box.style.top = `${rect.y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;

    // 添加控制点
    this.addControlPoints(box, rect);

    // 添加到画布容器
    const canvasContainer = document.querySelector('.canvas-area');
    if (canvasContainer) {
      canvasContainer.appendChild(box);
    }
  }

  /**
   * 添加控制点
   */
  addControlPoints(box, rect) {
    const points = [
      { x: 0, y: 0, type: 'nw-resize' },      // 左上
      { x: rect.width / 2, y: 0, type: 'n-resize' },      // 上中
      { x: rect.width, y: 0, type: 'ne-resize' },        // 右上
      { x: rect.width, y: rect.height / 2, type: 'e-resize' },   // 右中
      { x: rect.width, y: rect.height, type: 'se-resize' },      // 右下
      { x: rect.width / 2, y: rect.height, type: 's-resize' },   // 下中
      { x: 0, y: rect.height, type: 'sw-resize' },       // 左下
      { x: 0, y: rect.height / 2, type: 'w-resize' },    // 左中
      { x: rect.width / 2, y: rect.height / 2, type: 'move' }    // 中心
    ];

    points.forEach((point, index) => {
      const controlPoint = document.createElement('div');
      controlPoint.className = 'transform-control-point';
      controlPoint.dataset.index = index;
      controlPoint.dataset.type = point.type;
      controlPoint.style.position = 'absolute';
      controlPoint.style.left = `${point.x - 4}px`;
      controlPoint.style.top = `${point.y - 4}px`;
      controlPoint.style.width = '8px';
      controlPoint.style.height = '8px';
      controlPoint.style.backgroundColor = '#0099ff';
      controlPoint.style.border = '1px solid white';
      controlPoint.style.borderRadius = '50%';
      controlPoint.style.cursor = point.type;
      controlPoint.style.pointerEvents = 'all';

      // 添加事件监听
      controlPoint.addEventListener('mousedown', (e) => this.onControlPointMouseDown(e, index));

      box.appendChild(controlPoint);
    });
  }

  /**
   * 获取活动图层
   */
  getActiveLayer() {
    const editor = window.imageEditor;
    if (!editor || !editor.document || !editor.document.layers.length) {
      return null;
    }

    // 获取选中的图层或第一个图层
    const selectedLayerId = editor.document.selectedLayerId;
    if (selectedLayerId) {
      return editor.document.getLayer(selectedLayerId);
    }

    return editor.document.layers[0];
  }

  /**
   * 获取图层矩形区域
   */
  getLayerRect(layer) {
    return {
      x: layer.x || 0,
      y: layer.y || 0,
      width: layer.width || 0,
      height: layer.height || 0
    };
  }

  /**
   * 控制点鼠标按下事件
   */
  onControlPointMouseDown(e, pointIndex) {
    e.preventDefault();
    e.stopPropagation();

    const layer = this.getActiveLayer();
    if (!layer) return;

    this.transformState.isTransforming = true;
    this.transformState.startX = e.clientX;
    this.transformState.startY = e.clientY;
    this.transformState.originalMatrix = this.getLayerTransformMatrix(layer);

    // 根据控制点类型设置变换类型
    const pointType = e.target.dataset.type;
    this.setTransformTypeFromPoint(pointType);

    // 添加全局事件监听
    document.addEventListener('mousemove', this.onMouseMoveBound = this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUpBound = this.onMouseUp.bind(this));
  }

  /**
   * 根据控制点类型设置变换类型
   */
  setTransformTypeFromPoint(pointType) {
    switch (pointType) {
      case 'move':
        this.transformState.transformType = 'move';
        break;
      case 'n-resize':
      case 's-resize':
      case 'e-resize':
      case 'w-resize':
        this.transformState.transformType = 'scale';
        break;
      case 'nw-resize':
      case 'ne-resize':
      case 'se-resize':
      case 'sw-resize':
        this.transformState.transformType = 'scale';
        break;
      default:
        this.transformState.transformType = 'move';
    }
  }

  /**
   * 获取图层变换矩阵
   */
  getLayerTransformMatrix(layer) {
    // 返回当前图层的变换矩阵
    return {
      translateX: layer.x || 0,
      translateY: layer.y || 0,
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
      skewX: 0,
      skewY: 0
    };
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(e) {
    if (!this.transformState.isTransforming) return;

    const dx = e.clientX - this.transformState.startX;
    const dy = e.clientY - this.transformState.startY;

    const layer = this.getActiveLayer();
    if (!layer) return;

    switch (this.transformState.transformType) {
      case 'move':
        this.applyMoveTransform(layer, dx, dy);
        break;
      case 'scale':
        this.applyScaleTransform(layer, dx, dy);
        break;
      case 'rotate':
        this.applyRotateTransform(layer, dx, dy);
        break;
      case 'skew':
        this.applySkewTransform(layer, dx, dy);
        break;
    }

    // 更新控制框位置
    this.updateTransformBox(layer);

    // 触发渲染
    eventBus.emit('documentChanged');
  }

  /**
   * 鼠标释放事件
   */
  onMouseUp(e) {
    if (!this.transformState.isTransforming) return;

    this.transformState.isTransforming = false;
    this.transformState.transformType = null;

    // 移除事件监听
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('mouseup', this.onMouseUpBound);

    // 保存变换到历史记录
    this.saveTransformToHistory();
  }

  /**
   * 应用移动变换
   */
  applyMoveTransform(layer, dx, dy) {
    layer.x = (layer.x || 0) + dx;
    layer.y = (layer.y || 0) + dy;
  }

  /**
   * 应用缩放变换
   */
  applyScaleTransform(layer, dx, dy) {
    // 简单的缩放实现
    const scaleFactor = 1 + dx / 100;
    layer.width = Math.max(10, (layer.width || 0) * scaleFactor);
    layer.height = Math.max(10, (layer.height || 0) * scaleFactor);
  }

  /**
   * 应用旋转变换
   */
  applyRotateTransform(layer, dx, dy) {
    // 旋转角度计算
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    layer.rotation = (layer.rotation || 0) + angle;
  }

  /**
   * 应用倾斜变换
   */
  applySkewTransform(layer, dx, dy) {
    layer.skewX = (layer.skewX || 0) + dx * 0.01;
    layer.skewY = (layer.skewY || 0) + dy * 0.01;
  }

  /**
   * 更新变换控制框
   */
  updateTransformBox(layer) {
    const box = document.getElementById('transform-box');
    if (!box) return;

    const rect = this.getLayerRect(layer);
    box.style.left = `${rect.x}px`;
    box.style.top = `${rect.y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;

    // 更新控制点位置
    this.updateControlPoints(box, rect);
  }

  /**
   * 更新控制点位置
   */
  updateControlPoints(box, rect) {
    const points = box.querySelectorAll('.transform-control-point');
    const pointPositions = [
      { x: 0, y: 0 },           // 左上
      { x: rect.width / 2, y: 0 },      // 上中
      { x: rect.width, y: 0 },          // 右上
      { x: rect.width, y: rect.height / 2 },   // 右中
      { x: rect.width, y: rect.height },       // 右下
      { x: rect.width / 2, y: rect.height },   // 下中
      { x: 0, y: rect.height },         // 左下
      { x: 0, y: rect.height / 2 },     // 左中
      { x: rect.width / 2, y: rect.height / 2 } // 中心
    ];

    points.forEach((point, index) => {
      if (index < pointPositions.length) {
        point.style.left = `${pointPositions[index].x - 4}px`;
        point.style.top = `${pointPositions[index].y - 4}px`;
      }
    });
  }

  /**
   * 保存变换到历史记录
   */
  saveTransformToHistory() {
    // 创建变换命令并添加到历史记录
    const editor = window.imageEditor;
    if (editor && editor.history) {
      const command = new TransformCommand(this.getActiveLayer(), this.transformState.originalMatrix);
      editor.history.execute(command);
    }
  }

  /**
   * 工具选项改变
   */
  onOptionChange(option, value) {
    this.options[option] = value;
  }
}

/**
 * FreeTransformTool - 自由变换工具
 */
class FreeTransformTool extends TransformTool {
  constructor() {
    super({
      id: 'free-transform',
      name: '自由变换',
      icon: '🔄',
      cursor: 'move'
    });
  }

  /**
   * 鼠标按下事件
   */
  onMouseDown(e, context) {
    // 如果点击在控制点上，由基类处理
    if (e.target.classList.contains('transform-control-point')) {
      return;
    }

    // 否则开始新的变换
    this.transformState.isTransforming = true;
    this.transformState.startX = e.clientX;
    this.transformState.startY = e.clientY;
    this.transformState.transformType = 'move';

    const layer = this.getActiveLayer();
    if (layer) {
      this.transformState.originalMatrix = this.getLayerTransformMatrix(layer);
    }
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(e, context) {
    if (!this.transformState.isTransforming) return;

    const dx = e.clientX - this.transformState.startX;
    const dy = e.clientY - this.transformState.startY;

    const layer = this.getActiveLayer();
    if (!layer) return;

    // 应用移动变换
    this.applyMoveTransform(layer, dx, dy);

    // 更新控制框
    this.updateTransformBox(layer);

    // 触发渲染
    eventBus.emit('documentChanged');
  }

  /**
   * 鼠标释放事件
   */
  onMouseUp(e, context) {
    if (!this.transformState.isTransforming) return;

    this.transformState.isTransforming = false;
    this.transformState.transformType = null;

    // 保存变换到历史记录
    this.saveTransformToHistory();
  }
}

/**
 * ScaleTool - 缩放工具
 */
class ScaleTool extends TransformTool {
  constructor() {
    super({
      id: 'scale',
      name: '缩放',
      icon: '↔️',
      cursor: 'nwse-resize'
    });

    this.options.preserveAspectRatio = true;
  }

  /**
   * 激活工具
   */
  activate(editor) {
    super.activate(editor);
    // 显示缩放选项
    this.showScaleOptions();
  }

  /**
   * 显示缩放选项
   */
  showScaleOptions() {
    const optionsPanel = document.getElementById('toolOptions');
    if (!optionsPanel) return;

    optionsPanel.innerHTML = `
      <div class="tool-option">
        <label>保持宽高比:</label>
        <input type="checkbox" id="preserveAspectRatio" ${this.options.preserveAspectRatio ? 'checked' : ''}>
      </div>
      <div class="tool-option">
        <label>宽度:</label>
        <input type="number" id="scaleWidth" value="100" min="1" max="1000">%
      </div>
      <div class="tool-option">
        <label>高度:</label>
        <input type="number" id="scaleHeight" value="100" min="1" max="1000">%
      </div>
      <div class="tool-option">
        <button id="applyScale">应用缩放</button>
      </div>
    `;

    // 添加事件监听
    document.getElementById('preserveAspectRatio').addEventListener('change', (e) => {
      this.options.preserveAspectRatio = e.target.checked;
    });

    document.getElementById('applyScale').addEventListener('click', () => {
      this.applyManualScale();
    });
  }

  /**
   * 应用手动缩放
   */
  applyManualScale() {
    const widthInput = document.getElementById('scaleWidth');
    const heightInput = document.getElementById('scaleHeight');

    const widthScale = parseFloat(widthInput.value) / 100;
    const heightScale = parseFloat(heightInput.value) / 100;

    const layer = this.getActiveLayer();
    if (!layer) return;

    // 保存原始状态
    const originalWidth = layer.width;
    const originalHeight = layer.height;

    // 应用缩放
    layer.width = Math.max(10, originalWidth * widthScale);
    layer.height = Math.max(10, originalHeight * heightScale);

    // 更新控制框
    this.updateTransformBox(layer);

    // 触发渲染
    eventBus.emit('documentChanged');

    // 保存到历史记录
    const command = new ScaleCommand(layer, originalWidth, originalHeight, layer.width, layer.height);
    const editor = window.imageEditor;
    if (editor && editor.history) {
      editor.history.execute(command);
    }
  }
}

/**
 * RotateTool - 旋转工具
 */
class RotateTool extends TransformTool {
  constructor() {
    super({
      id: 'rotate',
      name: '旋转',
      icon: '🔄',
      cursor: 'crosshair'
    });
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(e) {
    if (!this.transformState.isTransforming) return;

    const dx = e.clientX - this.transformState.startX;
    const dy = e.clientY - this.transformState.startY;

    const layer = this.getActiveLayer();
    if (!layer) return;

    // 计算旋转角度
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;

    const angle1 = Math.atan2(this.transformState.startY - centerY, this.transformState.startX - centerX);
    const angle2 = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const angleDiff = (angle2 - angle1) * (180 / Math.PI);

    // 应用旋转
    layer.rotation = (layer.rotation || 0) + angleDiff;

    // 更新起始位置
    this.transformState.startX = e.clientX;
    this.transformState.startY = e.clientY;

    // 更新控制框
    this.updateTransformBox(layer);

    // 触发渲染
    eventBus.emit('documentChanged');
  }
}

/**
 * SkewTool - 倾斜工具
 */
class SkewTool extends TransformTool {
  constructor() {
    super({
      id: 'skew',
      name: '倾斜',
      icon: '🔀',
      cursor: 'move'
    });
  }
}

/**
 * TransformCommand - 变换命令
 */
class TransformCommand extends Command {
  constructor(layer, originalMatrix) {
    super();
    this.layer = layer;
    this.originalMatrix = { ...originalMatrix };
    this.newMatrix = this.getCurrentMatrix(layer);
  }

  /**
   * 获取当前矩阵
   */
  getCurrentMatrix(layer) {
    return {
      translateX: layer.x || 0,
      translateY: layer.y || 0,
      scaleX: layer.scaleX || 1,
      scaleY: layer.scaleY || 1,
      rotate: layer.rotation || 0,
      skewX: layer.skewX || 0,
      skewY: layer.skewY || 0
    };
  }

  /**
   * 应用矩阵到图层
   */
  applyMatrix(layer, matrix) {
    layer.x = matrix.translateX;
    layer.y = matrix.translateY;
    layer.scaleX = matrix.scaleX;
    layer.scaleY = matrix.scaleY;
    layer.rotation = matrix.rotate;
    layer.skewX = matrix.skewX;
    layer.skewY = matrix.skewY;
  }

  execute() {
    this.applyMatrix(this.layer, this.newMatrix);
  }

  undo() {
    this.applyMatrix(this.layer, this.originalMatrix);
  }

  redo() {
    this.execute();
  }
}

/**
 * ScaleCommand - 缩放命令
 */
class ScaleCommand extends Command {
  constructor(layer, originalWidth, originalHeight, newWidth, newHeight) {
    super();
    this.layer = layer;
    this.originalWidth = originalWidth;
    this.originalHeight = originalHeight;
    this.newWidth = newWidth;
    this.newHeight = newHeight;
  }

  execute() {
    this.layer.width = this.newWidth;
    this.layer.height = this.newHeight;
  }

  undo() {
    this.layer.width = this.originalWidth;
    this.layer.height = this.originalHeight;
  }

  redo() {
    this.execute();
  }
}

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TransformTool,
    FreeTransformTool,
    ScaleTool,
    RotateTool,
    SkewTool,
    TransformCommand,
    ScaleCommand
  };
}

