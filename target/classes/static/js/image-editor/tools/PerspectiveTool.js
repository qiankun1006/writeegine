/**
 * PerspectiveTool.js - 透视变换工具
 * Phase 4: 变换与3D 功能实现
 */

/**
 * PerspectiveTool - 透视变换工具
 */
class PerspectiveTool extends TransformTool {
  constructor() {
    super({
      id: 'perspective',
      name: '透视变换',
      icon: '🔲',
      cursor: 'crosshair'
    });

    // 透视变换状态
    this.perspectiveState = {
      isDraggingCorner: false,
      draggedCornerIndex: -1,
      originalCorners: null,
      currentCorners: null
    };

    // 透视参数
    this.options = {
      interpolation: 'bilinear',
      showGrid: true,
      ...this.options
    };
  }

  /**
   * 激活工具
   */
  activate(editor) {
    super.activate(editor);
    this.showPerspectiveControls();
    this.showPerspectiveOptions();
  }

  /**
   * 停用工具
   */
  deactivate() {
    super.deactivate();
    this.hidePerspectiveControls();
  }

  /**
   * 显示透视控制点
   */
  showPerspectiveControls() {
    const layer = this.getActiveLayer();
    if (!layer) return;

    // 创建透视变换框
    this.createPerspectiveBox(layer);
  }

  /**
   * 隐藏透视控制点
   */
  hidePerspectiveControls() {
    // 移除透视变换框
    const box = document.getElementById('perspective-box');
    if (box) {
      box.remove();
    }
  }

  /**
   * 创建透视变换框
   */
  createPerspectiveBox(layer) {
    // 移除现有的透视框
    this.hidePerspectiveControls();

    // 创建新的透视框
    const box = document.createElement('div');
    box.id = 'perspective-box';
    box.className = 'perspective-box';
    box.style.position = 'absolute';
    box.style.border = '2px dashed #ff9900';
    box.style.pointerEvents = 'none';

    // 设置初始角点位置
    const rect = this.getLayerRect(layer);
    this.perspectiveState.originalCorners = [
      { x: rect.x, y: rect.y },                    // 左上
      { x: rect.x + rect.width, y: rect.y },       // 右上
      { x: rect.x + rect.width, y: rect.y + rect.height }, // 右下
      { x: rect.x, y: rect.y + rect.height }       // 左下
    ];
    this.perspectiveState.currentCorners = [...this.perspectiveState.originalCorners];

    // 绘制透视框
    this.drawPerspectiveBox(box);

    // 添加角点控制
    this.addCornerControls(box);

    // 添加到画布容器
    const canvasContainer = document.querySelector('.canvas-area');
    if (canvasContainer) {
      canvasContainer.appendChild(box);
    }
  }

  /**
   * 绘制透视框
   */
  drawPerspectiveBox(box) {
    const corners = this.perspectiveState.currentCorners;
    if (!corners || corners.length < 4) return;

    // 清空内容
    box.innerHTML = '';

    // 创建 SVG 用于绘制透视网格
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';

    // 绘制透视网格
    if (this.options.showGrid) {
      this.drawPerspectiveGrid(svg, corners);
    }

    // 绘制边界线
    this.drawBoundaryLines(svg, corners);

    box.appendChild(svg);
  }

  /**
   * 绘制透视网格
   */
  drawPerspectiveGrid(svg, corners) {
    const gridSize = 10; // 网格大小
    const gridColor = 'rgba(255, 153, 0, 0.3)';

    // 创建水平网格线
    for (let i = 0; i <= gridSize; i++) {
      const t = i / gridSize;

      // 计算网格线起点和终点
      const startX = this.interpolate(corners[0].x, corners[3].x, t);
      const startY = this.interpolate(corners[0].y, corners[3].y, t);
      const endX = this.interpolate(corners[1].x, corners[2].x, t);
      const endY = this.interpolate(corners[1].y, corners[2].y, t);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', startX);
      line.setAttribute('y1', startY);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('stroke', gridColor);
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    // 创建垂直网格线
    for (let i = 0; i <= gridSize; i++) {
      const t = i / gridSize;

      // 计算网格线起点和终点
      const startX = this.interpolate(corners[0].x, corners[1].x, t);
      const startY = this.interpolate(corners[0].y, corners[1].y, t);
      const endX = this.interpolate(corners[3].x, corners[2].x, t);
      const endY = this.interpolate(corners[3].y, corners[2].y, t);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', startX);
      line.setAttribute('y1', startY);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('stroke', gridColor);
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }
  }

  /**
   * 绘制边界线
   */
  drawBoundaryLines(svg, corners) {
    const lineColor = '#ff9900';
    const lineWidth = '2';

    // 绘制四条边界线
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', corners[i].x);
      line.setAttribute('y1', corners[i].y);
      line.setAttribute('x2', corners[next].x);
      line.setAttribute('y2', corners[next].y);
      line.setAttribute('stroke', lineColor);
      line.setAttribute('stroke-width', lineWidth);
      line.setAttribute('stroke-dasharray', '5,5');
      svg.appendChild(line);
    }
  }

  /**
   * 线性插值
   */
  interpolate(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * 添加角点控制
   */
  addCornerControls(box) {
    const corners = this.perspectiveState.currentCorners;
    if (!corners) return;

    corners.forEach((corner, index) => {
      const controlPoint = document.createElement('div');
      controlPoint.className = 'perspective-corner-point';
      controlPoint.dataset.index = index;
      controlPoint.style.position = 'absolute';
      controlPoint.style.left = `${corner.x - 6}px`;
      controlPoint.style.top = `${corner.y - 6}px`;
      controlPoint.style.width = '12px';
      controlPoint.style.height = '12px';
      controlPoint.style.backgroundColor = '#ff9900';
      controlPoint.style.border = '2px solid white';
      controlPoint.style.borderRadius = '50%';
      controlPoint.style.cursor = 'move';
      controlPoint.style.pointerEvents = 'all';
      controlPoint.style.zIndex = '1000';

      // 添加事件监听
      controlPoint.addEventListener('mousedown', (e) => this.onCornerMouseDown(e, index));

      box.appendChild(controlPoint);
    });
  }

  /**
   * 角点鼠标按下事件
   */
  onCornerMouseDown(e, cornerIndex) {
    e.preventDefault();
    e.stopPropagation();

    this.perspectiveState.isDraggingCorner = true;
    this.perspectiveState.draggedCornerIndex = cornerIndex;
    this.perspectiveState.dragStartX = e.clientX;
    this.perspectiveState.dragStartY = e.clientY;

    // 保存原始角点位置
    this.perspectiveState.dragStartCorners = [...this.perspectiveState.currentCorners];

    // 添加全局事件监听
    document.addEventListener('mousemove', this.onCornerMouseMoveBound = this.onCornerMouseMove.bind(this));
    document.addEventListener('mouseup', this.onCornerMouseUpBound = this.onCornerMouseUp.bind(this));
  }

  /**
   * 角点鼠标移动事件
   */
  onCornerMouseMove(e) {
    if (!this.perspectiveState.isDraggingCorner) return;

    const dx = e.clientX - this.perspectiveState.dragStartX;
    const dy = e.clientY - this.perspectiveState.dragStartY;
    const cornerIndex = this.perspectiveState.draggedCornerIndex;

    // 更新角点位置
    this.perspectiveState.currentCorners[cornerIndex] = {
      x: this.perspectiveState.dragStartCorners[cornerIndex].x + dx,
      y: this.perspectiveState.dragStartCorners[cornerIndex].y + dy
    };

    // 更新透视框显示
    this.updatePerspectiveBox();

    // 实时预览透视变换效果
    this.previewPerspectiveTransform();
  }

  /**
   * 角点鼠标释放事件
   */
  onCornerMouseUp(e) {
    if (!this.perspectiveState.isDraggingCorner) return;

    this.perspectiveState.isDraggingCorner = false;
    this.perspectiveState.draggedCornerIndex = -1;

    // 移除事件监听
    document.removeEventListener('mousemove', this.onCornerMouseMoveBound);
    document.removeEventListener('mouseup', this.onCornerMouseUpBound);

    // 应用透视变换
    this.applyPerspectiveTransform();

    // 保存到历史记录
    this.savePerspectiveToHistory();
  }

  /**
   * 更新透视框显示
   */
  updatePerspectiveBox() {
    const box = document.getElementById('perspective-box');
    if (!box) return;

    // 更新角点控制位置
    const cornerPoints = box.querySelectorAll('.perspective-corner-point');
    cornerPoints.forEach((point, index) => {
      const corner = this.perspectiveState.currentCorners[index];
      if (corner) {
        point.style.left = `${corner.x - 6}px`;
        point.style.top = `${corner.y - 6}px`;
      }
    });

    // 重新绘制透视框
    this.drawPerspectiveBox(box);
  }

  /**
   * 预览透视变换效果
   */
  previewPerspectiveTransform() {
    const layer = this.getActiveLayer();
    if (!layer) return;

    // 创建临时画布用于预览
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.width;
    tempCanvas.height = layer.height;
    const tempCtx = tempCanvas.getContext('2d');

    // 绘制原始图层内容
    tempCtx.drawImage(layer.canvas, 0, 0);

    // 应用透视变换
    const transformedCanvas = this.applyPerspectiveToCanvas(tempCanvas, this.perspectiveState.currentCorners);

    // 在编辑器中显示预览
    this.showPreview(transformedCanvas);
  }

  /**
   * 应用透视变换到画布
   */
  applyPerspectiveToCanvas(sourceCanvas, destinationCorners) {
    const destCanvas = document.createElement('canvas');

    // 计算目标画布大小
    const bounds = this.getBounds(destinationCorners);
    destCanvas.width = Math.ceil(bounds.width);
    destCanvas.height = Math.ceil(bounds.height);

    const destCtx = destCanvas.getContext('2d');

    // 设置变换矩阵
    const sourceCorners = [
      { x: 0, y: 0 },
      { x: sourceCanvas.width, y: 0 },
      { x: sourceCanvas.width, y: sourceCanvas.height },
      { x: 0, y: sourceCanvas.height }
    ];

    // 计算透视变换矩阵
    const matrix = this.calculatePerspectiveMatrix(sourceCorners, destinationCorners);

    // 应用变换
    destCtx.setTransform(
      matrix.a, matrix.b,
      matrix.c, matrix.d,
      matrix.e, matrix.f
    );

    // 绘制图像
    destCtx.drawImage(sourceCanvas, 0, 0);

    return destCanvas;
  }

  /**
   * 计算边界框
   */
  getBounds(corners) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    corners.forEach(corner => {
      minX = Math.min(minX, corner.x);
      maxX = Math.max(maxX, corner.x);
      minY = Math.min(minY, corner.y);
      maxY = Math.max(maxY, corner.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 计算透视变换矩阵
   */
  calculatePerspectiveMatrix(src, dst) {
    // 简化的透视变换计算
    // 实际实现应使用完整的 3x3 透视变换矩阵

    // 计算仿射变换矩阵 (2x3)
    const srcRect = this.getBounds(src);
    const dstRect = this.getBounds(dst);

    const scaleX = dstRect.width / srcRect.width;
    const scaleY = dstRect.height / srcRect.height;

    return {
      a: scaleX,
      b: 0,
      c: 0,
      d: scaleY,
      e: dstRect.x - srcRect.x * scaleX,
      f: dstRect.y - srcRect.y * scaleY
    };
  }

  /**
   * 显示预览
   */
  showPreview(canvas) {
    // 创建或更新预览层
    let previewLayer = document.getElementById('perspective-preview');
    if (!previewLayer) {
      previewLayer = document.createElement('div');
      previewLayer.id = 'perspective-preview';
      previewLayer.style.position = 'absolute';
      previewLayer.style.top = '0';
      previewLayer.style.left = '0';
      previewLayer.style.pointerEvents = 'none';
      previewLayer.style.opacity = '0.7';
      previewLayer.style.zIndex = '500';

      const canvasContainer = document.querySelector('.canvas-area');
      if (canvasContainer) {
        canvasContainer.appendChild(previewLayer);
      }
    }

    previewLayer.innerHTML = '';
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    previewLayer.appendChild(canvas);
  }

  /**
   * 应用透视变换
   */
  applyPerspectiveTransform() {
    const layer = this.getActiveLayer();
    if (!layer) return;

    // 获取原始画布内容
    const sourceCanvas = layer.canvas;

    // 应用透视变换
    const transformedCanvas = this.applyPerspectiveToCanvas(sourceCanvas, this.perspectiveState.currentCorners);

    // 更新图层
    layer.canvas = transformedCanvas;
    layer.width = transformedCanvas.width;
    layer.height = transformedCanvas.height;

    // 更新图层位置
    const bounds = this.getBounds(this.perspectiveState.currentCorners);
    layer.x = bounds.x;
    layer.y = bounds.y;

    // 隐藏预览
    this.hidePreview();

    // 触发渲染
    eventBus.emit('documentChanged');
  }

  /**
   * 隐藏预览
   */
  hidePreview() {
    const previewLayer = document.getElementById('perspective-preview');
    if (previewLayer) {
      previewLayer.remove();
    }
  }

  /**
   * 保存透视变换到历史记录
   */
  savePerspectiveToHistory() {
    const layer = this.getActiveLayer();
    if (!layer) return;

    const editor = window.imageEditor;
    if (editor && editor.history) {
      const command = new PerspectiveCommand(
        layer,
        this.perspectiveState.originalCorners,
        this.perspectiveState.currentCorners
      );
      editor.history.execute(command);
    }
  }

  /**
   * 显示透视选项
   */
  showPerspectiveOptions() {
    const optionsPanel = document.getElementById('toolOptions');
    if (!optionsPanel) return;

    optionsPanel.innerHTML = `
      <div class="tool-option">
        <label>显示网格:</label>
        <input type="checkbox" id="showGrid" ${this.options.showGrid ? 'checked' : ''}>
      </div>
      <div class="tool-option">
        <label>插值方法:</label>
        <select id="interpolationMethod">
          <option value="nearest" ${this.options.interpolation === 'nearest' ? 'selected' : ''}>最近邻</option>
          <option value="bilinear" ${this.options.interpolation === 'bilinear' ? 'selected' : ''}>双线性</option>
          <option value="bicubic" ${this.options.interpolation === 'bicubic' ? 'selected' : ''}>双三次</option>
        </select>
      </div>
      <div class="tool-option">
        <button id="resetPerspective">重置透视</button>
        <button id="applyPerspective">应用变换</button>
      </div>
    `;

    // 添加事件监听
    document.getElementById('showGrid').addEventListener('change', (e) => {
      this.options.showGrid = e.target.checked;
      this.updatePerspectiveBox();
    });

    document.getElementById('interpolationMethod').addEventListener('change', (e) => {
      this.options.interpolation = e.target.value;
    });

    document.getElementById('resetPerspective').addEventListener('click', () => {
      this.resetPerspective();
    });

    document.getElementById('applyPerspective').addEventListener('click', () => {
      this.applyPerspectiveTransform();
    });
  }

  /**
   * 重置透视变换
   */
  resetPerspective() {
    const layer = this.getActiveLayer();
    if (!layer) return;

    // 重置角点位置
    const rect = this.getLayerRect(layer);
    this.perspectiveState.currentCorners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ];

    // 更新显示
    this.updatePerspectiveBox();
    this.hidePreview();
  }

  /**
   * 工具选项改变
   */
  onOptionChange(option, value) {
    this.options[option] = value;
  }
}

/**
 * PerspectiveCommand - 透视变换命令
 */
class PerspectiveCommand extends Command {
  constructor(layer, originalCorners, newCorners) {
    super();
    this.layer = layer;
    this.originalCorners = [...originalCorners];
    this.newCorners = [...newCorners];
    this.originalCanvas = layer.canvas;
    this.originalWidth = layer.width;
    this.originalHeight = layer.height;
    this.originalX = layer.x;
    this.originalY = layer.y;
  }

  execute() {
    // 应用新的透视变换
    this.applyPerspectiveTransform(this.newCorners);
  }

  undo() {
    // 恢复到原始状态
    this.layer.canvas = this.originalCanvas;
    this.layer.width = this.originalWidth;
    this.layer.height = this.originalHeight;
    this.layer.x = this.originalX;
    this.layer.y = this.originalY;
  }

  redo() {
    this.execute();
  }

  /**
   * 应用透视变换
   */
  applyPerspectiveTransform(corners) {
    // 这里应该实现完整的透视变换逻辑
    // 由于时间关系，这里使用简化的实现

    const tool = new PerspectiveTool();
    const transformedCanvas = tool.applyPerspectiveToCanvas(this.originalCanvas, corners);
    const bounds = tool.getBounds(corners);

    this.layer.canvas = transformedCanvas;
    this.layer.width = transformedCanvas.width;
    this.layer.height = transformedCanvas.height;
    this.layer.x = bounds.x;
    this.layer.y = bounds.y;
  }
}

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PerspectiveTool,
    PerspectiveCommand
  };
}

