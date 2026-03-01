/**
 * CropTool.js - 裁剪工具
 * 提供无损质量的图片裁剪功能
 * 支持从图层裁剪到画布大小或创建新的裁剪图层
 */

/**
 * CropTool - 裁剪工具类
 * 允许用户通过拖拽选择要裁剪的区域
 */
class CropTool extends Tool {
  constructor() {
    super({
      id: 'crop',
      name: '裁剪',
      icon: '✂️',
      cursor: 'crosshair',
      category: 'transform',
      options: {
        preserveAspectRatio: false,
        mode: 'layer' // 'layer' 裁剪图层, 'canvas' 裁剪画布
      }
    });

    this.cropState = {
      isDrawing: false,
      startX: 0,
      startY: 0,
      cropBox: null, // { x, y, width, height }
      previewCanvas: null,
      controlPoints: []
    };

    this.resizeThreshold = 8; // 调整大小的阈值像素
    this.activeHandle = null; // 当前被拖拽的控制点
  }

  /**
   * 激活工具
   */
  activate(editor) {
    super.activate(editor);
    console.log('🔪 裁剪工具已激活');
    this.showCropUI();
  }

  /**
   * 停用工具
   */
  deactivate() {
    super.deactivate();
    this.hideCropUI();
  }

  /**
   * 鼠标按下事件
   */
  onMouseDown(e, editor) {
    if (!editor.document || !editor.document.getSelectedLayer()) {
      console.warn('⚠️ 没有选中图层');
      return;
    }

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    // 检查是否点击了控制点
    const hitHandle = this.getHandleAtPoint(coords.x, coords.y, editor);
    if (hitHandle) {
      this.activeHandle = hitHandle;
      this.cropState.isDrawing = true;
      return;
    }

    // 开始新的裁剪选择
    this.cropState.isDrawing = true;
    this.cropState.startX = coords.x;
    this.cropState.startY = coords.y;
    this.cropState.cropBox = {
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    };
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(e, editor) {
    if (!editor.document || !editor.document.getSelectedLayer()) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    // 处理控制点拖拽
    if (this.activeHandle && this.cropState.isDrawing && this.cropState.cropBox) {
      this.resizeCropBox(coords.x, coords.y);
      editor.render();
      this.updateCropUI(editor);
      return;
    }

    // 绘制新的裁剪框
    if (this.cropState.isDrawing && this.cropState.cropBox) {
      const width = coords.x - this.cropState.startX;
      const height = coords.y - this.cropState.startY;

      this.cropState.cropBox = {
        x: Math.min(this.cropState.startX, coords.x),
        y: Math.min(this.cropState.startY, coords.y),
        width: Math.abs(width),
        height: Math.abs(height)
      };

      editor.render();
      this.updateCropUI(editor);
    }

    // 更新光标
    const hitHandle = this.getHandleAtPoint(coords.x, coords.y, editor);
    if (hitHandle) {
      this.setCursorForHandle(hitHandle);
    } else {
      document.body.style.cursor = 'crosshair';
    }
  }

  /**
   * 鼠标抬起事件
   */
  onMouseUp(e, editor) {
    if (this.activeHandle) {
      this.activeHandle = null;
    }
    this.cropState.isDrawing = false;
  }

  /**
   * 获取指定点附近的控制点
   */
  getHandleAtPoint(x, y, editor) {
    if (!this.cropState.cropBox) return null;

    const box = this.cropState.cropBox;
    const t = this.resizeThreshold;

    // 8 个控制点: 4 个角 + 4 个边中点
    const handles = [
      { pos: 'nw', x: box.x, y: box.y },
      { pos: 'n', x: box.x + box.width / 2, y: box.y },
      { pos: 'ne', x: box.x + box.width, y: box.y },
      { pos: 'e', x: box.x + box.width, y: box.y + box.height / 2 },
      { pos: 'se', x: box.x + box.width, y: box.y + box.height },
      { pos: 's', x: box.x + box.width / 2, y: box.y + box.height },
      { pos: 'sw', x: box.x, y: box.y + box.height },
      { pos: 'w', x: box.x, y: box.y + box.height / 2 }
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) < t && Math.abs(y - handle.y) < t) {
        return handle.pos;
      }
    }

    return null;
  }

  /**
   * 根据控制点调整裁剪框
   */
  resizeCropBox(x, y) {
    const box = this.cropState.cropBox;
    const handle = this.activeHandle;

    const minSize = 10; // 最小尺寸

    switch (handle) {
      case 'nw':
        box.width = Math.max(box.x + box.width - x, minSize);
        box.height = Math.max(box.y + box.height - y, minSize);
        box.x = x;
        box.y = y;
        break;
      case 'n':
        box.height = Math.max(box.y + box.height - y, minSize);
        box.y = y;
        break;
      case 'ne':
        box.width = Math.max(x - box.x, minSize);
        box.height = Math.max(box.y + box.height - y, minSize);
        box.y = y;
        break;
      case 'e':
        box.width = Math.max(x - box.x, minSize);
        break;
      case 'se':
        box.width = Math.max(x - box.x, minSize);
        box.height = Math.max(y - box.y, minSize);
        break;
      case 's':
        box.height = Math.max(y - box.y, minSize);
        break;
      case 'sw':
        box.width = Math.max(box.x + box.width - x, minSize);
        box.height = Math.max(y - box.y, minSize);
        box.x = x;
        break;
      case 'w':
        box.width = Math.max(box.x + box.width - x, minSize);
        box.x = x;
        break;
    }
  }

  /**
   * 根据控制点设置光标样式
   */
  setCursorForHandle(handle) {
    const cursorMap = {
      nw: 'nwse-resize',
      n: 'ns-resize',
      ne: 'nesw-resize',
      e: 'ew-resize',
      se: 'nwse-resize',
      s: 'ns-resize',
      sw: 'nesw-resize',
      w: 'ew-resize'
    };
    document.body.style.cursor = cursorMap[handle] || 'crosshair';
  }

  /**
   * 显示裁剪 UI
   */
  showCropUI() {
    // 创建或显示裁剪框控制面板
    let panel = document.getElementById('crop-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'crop-panel';
      panel.className = 'crop-panel';
      panel.innerHTML = `
        <div class="crop-controls">
          <div class="control-group">
            <label>位置 X:</label>
            <input type="number" id="cropX" min="0" value="0">
          </div>
          <div class="control-group">
            <label>位置 Y:</label>
            <input type="number" id="cropY" min="0" value="0">
          </div>
          <div class="control-group">
            <label>宽度:</label>
            <input type="number" id="cropWidth" min="1" value="0">
          </div>
          <div class="control-group">
            <label>高度:</label>
            <input type="number" id="cropHeight" min="1" value="0">
          </div>
          <div class="crop-buttons">
            <button id="applyCropBtn" class="btn-primary">✓ 应用裁剪</button>
            <button id="cancelCropBtn" class="btn-secondary">✗ 取消</button>
          </div>
        </div>
      `;
      document.body.appendChild(panel);

      // 绑定应用和取消按钮事件（使用箭头函数保持 this 上下文）
      document.getElementById('applyCropBtn').addEventListener('click', () => {
        console.log('🔘 应用裁剪按钮被点击');
        this.applyCrop();
      });

      document.getElementById('cancelCropBtn').addEventListener('click', () => {
        console.log('❌ 取消裁剪按钮被点击');
        this.cancelCrop();
      });

      // 绑定输入框变化事件 - 从输入框读取坐标更新裁剪框
      const inputFields = ['cropX', 'cropY', 'cropWidth', 'cropHeight'];
      inputFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
          input.addEventListener('change', () => {
            this.updateCropBoxFromInput();
          });
          // 实时更新（按键时）
          input.addEventListener('input', () => {
            this.updateCropBoxFromInput();
          });
        }
      });
    }

    panel.style.display = 'block';
  }

  /**
   * 从输入框更新裁剪框
   */
  updateCropBoxFromInput() {
    try {
      const x = parseInt(document.getElementById('cropX').value) || 0;
      const y = parseInt(document.getElementById('cropY').value) || 0;
      const width = parseInt(document.getElementById('cropWidth').value) || 0;
      const height = parseInt(document.getElementById('cropHeight').value) || 0;

      // 验证数值
      if (width > 0 && height > 0) {
        this.cropState.cropBox = { x, y, width, height };

        const editor = window.editor;
        if (editor) {
          editor.render();
        }
      }
    } catch (error) {
      console.error('❌ 输入框更新失败:', error);
    }
  }

  /**
   * 隐藏裁剪 UI
   */
  hideCropUI() {
    const panel = document.getElementById('crop-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  /**
   * 更新裁剪 UI 中的数值
   */
  updateCropUI(editor) {
    if (!this.cropState.cropBox) return;

    const box = this.cropState.cropBox;
    document.getElementById('cropX').value = Math.round(box.x);
    document.getElementById('cropY').value = Math.round(box.y);
    document.getElementById('cropWidth').value = Math.round(box.width);
    document.getElementById('cropHeight').value = Math.round(box.height);
  }

  /**
   * 应用裁剪操作（无损质量）
   */
  applyCrop() {
    console.log('📋 applyCrop 方法被调用');

    if (!this.cropState.cropBox) {
      console.warn('⚠️ 没有选择裁剪区域');
      return;
    }

    console.log('✅ 裁剪框存在:', this.cropState.cropBox);

    const editor = window.editor;
    console.log('📌 编辑器对象:', editor);

    if (!editor) {
      console.error('❌ 编辑器不存在');
      return;
    }

    const layer = editor.document.getSelectedLayer();
    console.log('📌 选中的图层:', layer);

    if (!layer) {
      console.error('❌ 没有选中的图层');
      return;
    }

    const box = this.cropState.cropBox;
    const x = Math.round(box.x);
    const y = Math.round(box.y);
    const w = Math.round(box.width);
    const h = Math.round(box.height);

    console.log('📐 裁剪参数:', { x, y, w, h });
    console.log('📦 原始图层尺寸:', { width: layer.width, height: layer.height });

    try {
      // 创建新的 canvas 用于裁剪内容
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = w;
      croppedCanvas.height = h;

      const ctx = croppedCanvas.getContext('2d', { willReadFrequently: true });

      // 从原始图层 canvas 中提取指定区域（无损质量）
      const sourceCtx = layer.canvas.getContext('2d');
      console.log('🎨 源 Canvas 尺寸:', { width: layer.canvas.width, height: layer.canvas.height });

      const imageData = sourceCtx.getImageData(x, y, w, h);
      console.log('📸 提取的图像数据:', { width: imageData.width, height: imageData.height });

      ctx.putImageData(imageData, 0, 0);

      // 更新图层内容
      // 关键：调整图层位置以保持视觉位置不变
      // 当我们裁剪掉左边 x 像素和上边 y 像素时，
      // 需要将图层向右下移动相应距离以补偿

      // 保存原始的裁剪偏移量，用于后续调整
      const cropOffsetX = x;
      const cropOffsetY = y;

      layer.canvas = croppedCanvas;
      layer.width = w;
      layer.height = h;
      layer.x = layer.x + cropOffsetX;  // 向右移动裁剪的左边距离
      layer.y = layer.y + cropOffsetY;  // 向下移动裁剪的上边距离

      // 关键修复：保存裁剪偏移信息到图层，供后续绘制工具使用
      // 绘制工具需要知道新图层坐标系相对于原图层的偏移
      layer._cropOffsetX = cropOffsetX;
      layer._cropOffsetY = cropOffsetY;

      console.log('✅ 裁剪成功:', { x, y, width: w, height: h });
      console.log('📦 新图层尺寸:', { width: layer.width, height: layer.height });
      console.log('📍 新图层位置:', { x: layer.x, y: layer.y });
      console.log('📌 裁剪偏移:', { offsetX: cropOffsetX, offsetY: cropOffsetY });

      // 清空裁剪框并重新渲染
      this.cropState.cropBox = null;
      editor.render();

      // 通知编辑器内容已改变
      eventBus.emit('layerModified', { layerId: layer.id });

    } catch (error) {
      console.error('❌ 裁剪失败:', error);
      console.error('💥 错误堆栈:', error.stack);
      alert('裁剪失败: ' + error.message);
    }
  }

  /**
   * 取消裁剪
   */
  cancelCrop() {
    this.cropState.cropBox = null;
    console.log('❌ 已取消裁剪');
    const editor = window.editor;
    if (editor) {
      editor.render();
    }
  }

  /**
   * 自定义绘制（用于渲染裁剪框和控制点）
   * 注意：此方法在屏幕坐标系中绘制（坐标系变换已恢复）
   */
  render(ctx, editor) {
    if (!this.cropState.cropBox) return;

    const box = this.cropState.cropBox;
    const renderer = editor?.renderer;
    const document = editor?.document;

    if (!renderer || !document) return;

    // 将世界坐标转换为屏幕坐标
    const screenCoords = {
      topLeft: renderer.worldToScreenCoords(box.x, box.y),
      topRight: renderer.worldToScreenCoords(box.x + box.width, box.y),
      bottomLeft: renderer.worldToScreenCoords(box.x, box.y + box.height),
      bottomRight: renderer.worldToScreenCoords(box.x + box.width, box.y + box.height)
    };

    // 计算屏幕空间中的裁剪框
    const minX = Math.min(screenCoords.topLeft.x, screenCoords.topRight.x, screenCoords.bottomLeft.x, screenCoords.bottomRight.x);
    const maxX = Math.max(screenCoords.topLeft.x, screenCoords.topRight.x, screenCoords.bottomLeft.x, screenCoords.bottomRight.x);
    const minY = Math.min(screenCoords.topLeft.y, screenCoords.topRight.y, screenCoords.bottomLeft.y, screenCoords.bottomRight.y);
    const maxY = Math.max(screenCoords.topLeft.y, screenCoords.topRight.y, screenCoords.bottomLeft.y, screenCoords.bottomRight.y);

    const screenBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    // 获取画布宽高
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // 绘制半透明遮罩
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    // 使用路径绘制遮罩（更清晰的方式）
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight); // 外部矩形（整个屏幕）
    ctx.rect(screenBox.x, screenBox.y, screenBox.width, screenBox.height); // 内部裁剪框（挖空）
    ctx.fillRule = 'evenodd';
    ctx.fill();

    // 绘制裁剪框边界
    ctx.strokeStyle = '#0099ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenBox.x, screenBox.y, screenBox.width, screenBox.height);

    // 绘制网格（三分构图）
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.3)';
    ctx.lineWidth = 1;
    const gridX = screenBox.width / 3;
    const gridY = screenBox.height / 3;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(screenBox.x + gridX * i, screenBox.y);
      ctx.lineTo(screenBox.x + gridX * i, screenBox.y + screenBox.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(screenBox.x, screenBox.y + gridY * i);
      ctx.lineTo(screenBox.x + screenBox.width, screenBox.y + gridY * i);
      ctx.stroke();
    }

    // 绘制控制点
    ctx.fillStyle = '#0099ff';
    const pointSize = 5;
    const handles = [
      { x: screenBox.x, y: screenBox.y },
      { x: screenBox.x + screenBox.width / 2, y: screenBox.y },
      { x: screenBox.x + screenBox.width, y: screenBox.y },
      { x: screenBox.x + screenBox.width, y: screenBox.y + screenBox.height / 2 },
      { x: screenBox.x + screenBox.width, y: screenBox.y + screenBox.height },
      { x: screenBox.x + screenBox.width / 2, y: screenBox.y + screenBox.height },
      { x: screenBox.x, y: screenBox.y + screenBox.height },
      { x: screenBox.x, y: screenBox.y + screenBox.height / 2 }
    ];

    handles.forEach(handle => {
      ctx.fillRect(handle.x - pointSize, handle.y - pointSize, pointSize * 2, pointSize * 2);
    });

    ctx.restore();
  }
}

