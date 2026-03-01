/**
 * OpacityTool.js - 透明度工具
 * 提供支持透明通道和区域透明度调整功能
 */

/**
 * OpacityTool - 透明度调整工具
 * 允许用户调整图层全局透明度或指定区域的透明度
 */
class OpacityTool extends Tool {
  constructor() {
    super({
      id: 'opacity',
      name: '透明度',
      icon: '👻',
      cursor: 'default',
      category: 'adjustment',
      options: {
        mode: 'brush', // 'global' 全局, 'brush' 笔刷
        brushSize: 30,
        brushHardness: 0.7,
        opacity: 0.5,
        blendMode: 'destination-out' // 用于实现透明效果
      }
    });

    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.brushCanvas = this.createBrushPreview();
  }

  /**
   * 激活工具
   */
  activate(editor) {
    super.activate(editor);
    console.log('👻 透明度工具已激活');
    this.showOpacityUI();
  }

  /**
   * 停用工具
   */
  deactivate() {
    super.deactivate();
    this.hideOpacityUI();
  }

  /**
   * 鼠标按下事件
   */
  onMouseDown(e, editor) {
    if (!editor.document || !editor.document.getSelectedLayer()) {
      console.warn('⚠️ 没有活跃图层');
      return;
    }

    const layer = editor.document.getSelectedLayer();

    // 确保图层支持透明通道
    this.ensureAlphaChannel(layer);

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    this.startX = coords.x;
    this.startY = coords.y;
    this.isDrawing = true;

    // 获取工具选项
    const mode = this.options.mode || 'brush';

    if (mode === 'global') {
      // 全局透明度调整
      this.applyGlobalOpacity(editor, e);
    } else if (mode === 'brush') {
      // 笔刷模式
      this.applyBrushOpacity(editor, coords.x, coords.y);
    }
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(e, editor) {
    if (!editor.document || !editor.document.getSelectedLayer()) return;

    if (!this.isDrawing) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const mode = this.options.mode || 'brush';

    if (mode === 'brush') {
      this.applyBrushOpacity(editor, coords.x, coords.y);
      editor.render();
    }
  }

  /**
   * 鼠标抬起事件
   */
  onMouseUp(e, editor) {
    this.isDrawing = false;
  }

  /**
   * 确保图层拥有 Alpha 通道（支持透明度）
   */
  ensureAlphaChannel(layer) {
    if (layer._hasAlphaChannel) return;

    try {
      const ctx = layer.getContext();
      if (!ctx) return;

      // 获取现有内容
      const imageData = ctx.getImageData(0, 0, layer.width, layer.height);

      // 创建新的 canvas（支持透明）
      const newCanvas = document.createElement('canvas');
      newCanvas.width = layer.width;
      newCanvas.height = layer.height;

      const newCtx = newCanvas.getContext('2d');
      newCtx.putImageData(imageData, 0, 0);

      // 替换原有 canvas
      layer.canvas = newCanvas;
      layer._hasAlphaChannel = true;

      console.log('✅ Alpha 通道已启用');
    } catch (error) {
      console.error('❌ 启用 Alpha 通道失败:', error);
    }
  }

  /**
   * 应用全局透明度
   */
  applyGlobalOpacity(editor, e) {
    const layer = editor.document.getSelectedLayer();

    // 弹出对话框让用户输入透明度值
    const input = prompt('请输入透明度 (0-100):', '50');
    if (input === null) return;

    const opacityValue = Math.max(0, Math.min(100, parseInt(input) || 50)) / 100;
    layer.opacity = opacityValue;

    console.log(`✅ 图层透明度已设置为: ${opacityValue * 100}%`);
    editor.render();
    eventBus.emit('layerModified', { layerId: layer.id });
  }

  /**
   * 应用笔刷透明度
   */
  applyBrushOpacity(editor, x, y) {
    const layer = editor.document.getSelectedLayer();
    const ctx = layer.getContext();

    if (!ctx) return;

    const brushSize = this.options.brushSize || 30;
    const brushHardness = this.options.brushHardness || 0.7;
    const opacityValue = this.options.opacity || 0.5;

    // 创建圆形笔刷
    const brushCanvas = this.createBrushShape(brushSize, brushHardness);

    // 将笔刷位置转换为图层坐标
    const layerX = x - layer.x;
    const layerY = y - layer.y;

    // 在图层上应用透明度效果
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out'; // 删除像素（制造透明）
    ctx.globalAlpha = opacityValue;
    ctx.drawImage(
      brushCanvas,
      layerX - brushSize / 2,
      layerY - brushSize / 2,
      brushSize,
      brushSize
    );
    ctx.restore();

    // 触发图层修改事件
    eventBus.emit('layerModified', { layerId: layer.id });
  }

  /**
   * 创建笔刷形状（高斯模糊圆形）
   */
  createBrushShape(size, hardness = 0.7) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    // 创建径向渐变
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    // 根据硬度调整渐变
    const softness = 1 - hardness;
    gradient.addColorStop(0, `rgba(0, 0, 0, ${1 - softness})`);
    gradient.addColorStop(hardness, `rgba(0, 0, 0, ${1 - softness})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return canvas;
  }

  /**
   * 创建笔刷预览
   */
  createBrushPreview() {
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(30, 30, 25, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * 显示透明度 UI
   */
  showOpacityUI() {
    let panel = document.getElementById('opacity-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'opacity-panel';
      panel.className = 'opacity-panel';
      panel.innerHTML = `
        <div class="opacity-controls">
          <div class="control-group">
            <label for="opacityMode">模式:</label>
            <select id="opacityMode" class="control-select">
              <option value="global">全局透明度</option>
              <option value="brush">笔刷透明度</option>
            </select>
          </div>

          <div id="brushOptions" style="display: none;">
            <div class="control-group">
              <label for="brushSize">笔刷大小:</label>
              <input type="range" id="brushSize" min="5" max="200" value="30">
              <span id="brushSizeValue">30</span>px
            </div>

            <div class="control-group">
              <label for="brushHardness">笔刷硬度:</label>
              <input type="range" id="brushHardness" min="0" max="100" value="70">
              <span id="brushHardnessValue">70</span>%
            </div>

            <div class="control-group">
              <label for="opacityValue">透明度:</label>
              <input type="range" id="opacityValue" min="0" max="100" value="50">
              <span id="opacityValueDisplay">50</span>%
            </div>
          </div>

          <div class="opacity-buttons">
            <button id="toggleAlphaBtn" class="btn-primary">✓ 启用透明通道</button>
            <button id="convertToTransparentBtn" class="btn-secondary">🎨 转换为透明</button>
          </div>
        </div>
      `;
      document.body.appendChild(panel);

      // 绑定事件
      const modeSelect = document.getElementById('opacityMode');
      const brushOptions = document.getElementById('brushOptions');

      modeSelect.addEventListener('change', (e) => {
        brushOptions.style.display = e.target.value === 'brush' ? 'block' : 'none';
        this.options.mode = e.target.value;
      });

      // 笔刷大小
      document.getElementById('brushSize').addEventListener('change', (e) => {
        this.options.brushSize = parseInt(e.target.value);
        document.getElementById('brushSizeValue').textContent = e.target.value;
      });

      // 笔刷硬度
      document.getElementById('brushHardness').addEventListener('change', (e) => {
        this.options.brushHardness = parseInt(e.target.value) / 100;
        document.getElementById('brushHardnessValue').textContent = e.target.value;
      });

      // 透明度值
      document.getElementById('opacityValue').addEventListener('change', (e) => {
        this.options.opacity = parseInt(e.target.value) / 100;
        document.getElementById('opacityValueDisplay').textContent = e.target.value;
      });

      // 启用透明通道
      document.getElementById('toggleAlphaBtn').addEventListener('click', () => {
        const editor = window.editor;
        const layer = editor.document.getSelectedLayer();
        if (layer) {
          this.ensureAlphaChannel(layer);
          alert('✓ Alpha 通道已启用');
        }
      });

      // 转换为透明（将白色背景转换为透明）
      document.getElementById('convertToTransparentBtn').addEventListener('click', () => {
        this.convertWhiteToTransparent();
      });
    }

    panel.style.display = 'block';
  }

  /**
   * 隐藏透明度 UI
   */
  hideOpacityUI() {
    const panel = document.getElementById('opacity-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  /**
   * 将白色（或指定颜色）转换为透明
   */
  convertWhiteToTransparent() {
    const editor = window.editor;
    if (!editor) return;

    const layer = editor.document.getSelectedLayer();
    if (!layer) return;

    // 首先确保有 Alpha 通道
    this.ensureAlphaChannel(layer);

    const ctx = layer.getContext();
    const imageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const data = imageData.data;

    // 遍历所有像素
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // 判断是否接近白色（可调整阈值）
      if (r > 240 && g > 240 && b > 240 && a > 240) {
        // 设置透明度为 0
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    console.log('✅ 白色已转换为透明');

    editor.render();
    eventBus.emit('layerModified', { layerId: layer.id });
  }

  /**
   * 自定义绘制（显示笔刷预览）
   */
  render(ctx, editor) {
    if (!this.isDrawing) return;

    const brushSize = this.options.brushSize || 30;

    // 绘制笔刷预览圆圈
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(this.startX, this.startY, brushSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

