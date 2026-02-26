/**
 * 2D 编辑器基类
 * 提供通用的 2D 编辑器功能
 */

class BaseEditor2D {
  constructor(config, gameId) {
    this.config = config;
    this.gameId = gameId;
    this.canvas = null;
    this.ctx = null;
    this.objects = [];
    this.selectedObject = null;
    this.zoom = config.initialZoom || 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.draggedObject = null;
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndoSteps = 50;
  }

  /**
   * 初始化编辑器
   */
  async initialize() {
    console.log(`📐 初始化 ${this.config.name}`);

    // 获取画布和上下文
    this.canvas = document.getElementById('canvas');
    if (!this.canvas) {
      console.error('❌ 未找到 canvas 元素');
      return false;
    }

    this.ctx = this.canvas.getContext('2d');

    // 设置画布大小
    this.canvas.width = this.config.canvasSize.width;
    this.canvas.height = this.config.canvasSize.height;

    // 绑定事件监听
    this.bindEventListeners();

    // 初始化子类特定工具
    await this.initializeTools();

    // 加载游戏数据
    if (this.gameId) {
      await this.loadGame(this.gameId);
    }

    // 启动主渲染循环
    this.startRenderLoop();

    // 初始化 UI
    this.initializeUI();

    console.log('✅ 编辑器初始化完成');
    return true;
  }

  /**
   * 绑定事件监听
   */
  bindEventListeners() {
    // 鼠标按下
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));

    // 鼠标移动
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // 鼠标抬起
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // 鼠标滚轮（缩放）
    this.canvas.addEventListener('wheel', (e) => this.onMouseWheel(e));

    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.onKeyDown(e));

    // 右键菜单
    this.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
  }

  /**
   * 鼠标按下事件
   */
  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.zoom;
    const y = (e.clientY - rect.top - this.panY) / this.zoom;

    // 右键拖动画布
    if (e.button === 2) {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      return;
    }

    // 左键选择对象
    if (e.button === 0) {
      const obj = this.getObjectAt(x, y);
      if (obj) {
        this.selectObject(obj);
        this.draggedObject = obj;
        this.saveUndoState();
      } else {
        this.selectObject(null);
      }
    }
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.zoom;
    const y = (e.clientY - rect.top - this.panY) / this.zoom;

    if (this.isDragging && e.button === 2) {
      // 拖动画布
      this.panX += e.clientX - this.dragStartX;
      this.panY += e.clientY - this.dragStartY;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    } else if (this.draggedObject) {
      // 移动对象
      this.draggedObject.x = Canvas2DUtils.snapToGrid(x, this.config.gridSize);
      this.draggedObject.y = Canvas2DUtils.snapToGrid(y, this.config.gridSize);
    }

    // 更新鼠标指针
    const obj = this.getObjectAt(x, y);
    this.canvas.style.cursor = obj ? 'move' : 'default';
  }

  /**
   * 鼠标抬起事件
   */
  onMouseUp(e) {
    if (e.button === 2) {
      this.isDragging = false;
    } else if (this.draggedObject) {
      this.draggedObject = null;
    }
  }

  /**
   * 鼠标滚轮事件（缩放）
   */
  onMouseWheel(e) {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const oldZoom = this.zoom;
    this.zoom = Math.max(0.5, Math.min(3.0, this.zoom * zoomFactor));

    // 调整平移以保持鼠标位置不变
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.panX = mouseX - (mouseX - this.panX) * (this.zoom / oldZoom);
    this.panY = mouseY - (mouseY - this.panY) * (this.zoom / oldZoom);
  }

  /**
   * 键盘快捷键事件
   */
  onKeyDown(e) {
    // Ctrl+Z: 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      this.undo();
    }
    // Ctrl+Y / Ctrl+Shift+Z: 重做
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      this.redo();
    }
    // Delete: 删除选中对象
    if (e.key === 'Delete' && this.selectedObject) {
      e.preventDefault();
      this.saveUndoState();
      this.deleteObject(this.selectedObject);
    }
    // Ctrl+S: 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.saveGame();
    }
  }

  /**
   * 右键菜单事件
   */
  onContextMenu(e) {
    e.preventDefault();

    // 可以显示自定义菜单
    console.log('右键点击位置:', e.clientX, e.clientY);
  }

  /**
   * 获取指定坐标的对象
   */
  getObjectAt(x, y) {
    // 从后往前遍历（最后绘制的对象在前面）
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      if (Canvas2DUtils.pointInRect(x, y, obj.x, obj.y, obj.width, obj.height)) {
        return obj;
      }
    }
    return null;
  }

  /**
   * 选择对象
   */
  selectObject(obj) {
    this.selectedObject = obj;
    this.updateProperties();
  }

  /**
   * 创建新对象
   */
  createObject(x, y, width = 50, height = 50, color = '#667eea') {
    const obj = {
      id: this.generateId(),
      x: Canvas2DUtils.snapToGrid(x, this.config.gridSize),
      y: Canvas2DUtils.snapToGrid(y, this.config.gridSize),
      width,
      height,
      color,
      type: 'object',
      properties: {}
    };
    this.objects.push(obj);
    this.saveUndoState();
    return obj;
  }

  /**
   * 删除对象
   */
  deleteObject(obj) {
    const index = this.objects.indexOf(obj);
    if (index > -1) {
      this.objects.splice(index, 1);
      if (this.selectedObject === obj) {
        this.selectedObject = null;
      }
    }
  }

  /**
   * 生成唯一 ID
   */
  generateId() {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新属性面板
   */
  updateProperties() {
    const panel = document.getElementById('propertyPanel');
    if (!panel) return;

    if (!this.selectedObject) {
      panel.innerHTML = '<p>选择一个对象以编辑属性</p>';
      return;
    }

    const obj = this.selectedObject;
    panel.innerHTML = `
      <div class="property-group">
        <label>X:</label>
        <input type="number" id="propX" value="${obj.x}" onchange="editor.updateObjectProperty('x', this.value)">
      </div>
      <div class="property-group">
        <label>Y:</label>
        <input type="number" id="propY" value="${obj.y}" onchange="editor.updateObjectProperty('y', this.value)">
      </div>
      <div class="property-group">
        <label>宽度:</label>
        <input type="number" id="propWidth" value="${obj.width}" onchange="editor.updateObjectProperty('width', this.value)">
      </div>
      <div class="property-group">
        <label>高度:</label>
        <input type="number" id="propHeight" value="${obj.height}" onchange="editor.updateObjectProperty('height', this.value)">
      </div>
      <div class="property-group">
        <label>颜色:</label>
        <input type="color" id="propColor" value="${obj.color}" onchange="editor.updateObjectProperty('color', this.value)">
      </div>
    `;
  }

  /**
   * 更新对象属性
   */
  updateObjectProperty(prop, value) {
    if (!this.selectedObject) return;

    this.saveUndoState();

    if (prop === 'x' || prop === 'y' || prop === 'width' || prop === 'height') {
      this.selectedObject[prop] = parseInt(value);
    } else {
      this.selectedObject[prop] = value;
    }
  }

  /**
   * 保存撤销状态
   */
  saveUndoState() {
    this.undoStack.push(JSON.stringify(this.objects));
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }
    this.redoStack = []; // 清空重做栈
  }

  /**
   * 撤销
   */
  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push(JSON.stringify(this.objects));
      this.objects = JSON.parse(this.undoStack.pop());
      this.selectedObject = null;
      console.log('↶ 撤销');
    }
  }

  /**
   * 重做
   */
  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(JSON.stringify(this.objects));
      this.objects = JSON.parse(this.redoStack.pop());
      this.selectedObject = null;
      console.log('↷ 重做');
    }
  }

  /**
   * 启动渲染循环
   */
  startRenderLoop() {
    const render = () => {
      this.render();
      requestAnimationFrame(render);
    };
    render();
  }

  /**
   * 渲染场景
   */
  render() {
    // 保存当前变换状态
    this.ctx.save();

    // 清空画布
    Canvas2DUtils.clearCanvas(this.canvas);

    // 应用变换
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // 绘制网格
    Canvas2DUtils.drawGrid(
      this.ctx,
      this.canvas.width / this.zoom,
      this.canvas.height / this.zoom,
      this.config.gridSize
    );

    // 绘制对象
    this.objects.forEach(obj => {
      const isSelected = obj === this.selectedObject;
      Canvas2DUtils.drawRect(
        this.ctx,
        obj.x, obj.y, obj.width, obj.height,
        obj.color,
        isSelected ? '#333' : null,
        isSelected ? 2 : 0
      );

      // 绘制对象 ID
      Canvas2DUtils.drawText(
        this.ctx,
        obj.id.substr(0, 8),
        obj.x + 5, obj.y + 5,
        { fontSize: 10, color: '#fff' }
      );
    });

    // 恢复变换状态
    this.ctx.restore();

    // 绘制 UI 信息
    this.renderUI();
  }

  /**
   * 渲染 UI 信息
   */
  renderUI() {
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      const objCount = this.objects.length;
      const zoom = (this.zoom * 100).toFixed(0);
      statusBar.innerHTML = `
        对象数: ${objCount} | 缩放: ${zoom}% |
        撤销: ${this.undoStack.length} | 重做: ${this.redoStack.length}
      `;
    }
  }

  /**
   * 初始化工具（由子类实现）
   */
  async initializeTools() {
    // 子类实现
  }

  /**
   * 初始化 UI（由子类实现）
   */
  initializeUI() {
    // 子类实现
  }

  /**
   * 加载游戏数据
   */
  async loadGame(gameId) {
    try {
      const response = await fetch(`/api/game/${gameId}`);
      const data = await response.json();
      if (data.success) {
        console.log('✅ 游戏数据加载成功');
        this.currentGame = data.data;
        if (data.data.objects) {
          this.objects = data.data.objects;
        }
      }
    } catch (error) {
      console.error('❌ 加载游戏失败:', error);
    }
  }

  /**
   * 保存游戏数据
   */
  async saveGame() {
    if (!this.gameId) {
      alert('未指定游戏 ID');
      return;
    }

    try {
      const response = await fetch(`/api/game/${this.gameId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          objects: this.objects,
          metadata: this.config,
          timestamp: Date.now()
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ 游戏已保存');
        alert('游戏已保存');
      } else {
        console.error('❌ 保存失败:', data.error);
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('❌ 保存游戏失败:', error);
      alert('保存游戏失败: ' + error.message);
    }
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.BaseEditor2D = BaseEditor2D;
}

