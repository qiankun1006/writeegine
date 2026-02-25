# 设计文档：网页版 Photoshop 编辑器

## 1. 系统架构概览

### 1.1 整体架构

```
┌─────────────────────────────────────────┐
│           UI Layer (React)              │
│  ┌─────────────────────────────────┐    │
│  │  工具栏 | 图层面板 | 属性面板   │    │
│  │        | 画布主体  | 历史记录   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Core Engine Layer                  │
│  ┌─────────────────────────────────┐    │
│  │  事件系统 | 状态管理 | 撤销/重做 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Tool System Layer                  │
│  ┌─────────────────────────────────┐    │
│  │ 工具基类 | 工具插件 | 工具切换器 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Document Model Layer               │
│  ┌─────────────────────────────────┐    │
│  │ 文档对象 | 图层树 | 属性管理    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Render Engine Layer                │
│  ┌─────────────────────────────────┐    │
│  │  Canvas Renderer | WebGL        │    │
│  │  Filter Pipeline | Composite    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 1.2 核心模块

#### 事件系统（Event System）
```javascript
// EventBus 实现
class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(handler);
  }

  emit(eventName, data) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(handler => {
        handler(data);
      });
    }
  }

  off(eventName, handler) {
    if (this.events.has(eventName)) {
      const handlers = this.events.get(eventName);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// 使用示例
const eventBus = new EventBus();
eventBus.on('toolChanged', (tool) => {
  console.log('工具已切换:', tool);
});
eventBus.emit('toolChanged', { id: 'brush' });
```

#### 状态管理（State Management）
```javascript
// 使用 Zustand 或 Pinia
import { create } from 'zustand';

const useEditorStore = create((set) => ({
  // 文档状态
  document: null,
  selectedLayerId: null,
  zoom: 1.0,

  // 工具状态
  activeTool: null,
  toolOptions: {},

  // UI 状态
  showLayers: true,
  showProperties: true,

  // 方法
  setDocument: (doc) => set({ document: doc }),
  setSelectedLayer: (layerId) => set({ selectedLayerId: layerId }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 10) }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  updateToolOptions: (options) => set((state) => ({
    toolOptions: { ...state.toolOptions, ...options }
  }))
}));

export default useEditorStore;
```

#### 撤销/重做系统（Undo/Redo System）
```javascript
class Command {
  execute() { throw new Error('Must implement execute'); }
  undo() { throw new Error('Must implement undo'); }
  redo() { this.execute(); }
}

class CommandHistory {
  constructor(maxSize = 100) {
    this.history = [];
    this.currentIndex = -1;
    this.maxSize = maxSize;
  }

  execute(command) {
    // 移除当前索引之后的所有命令
    this.history = this.history.slice(0, this.currentIndex + 1);

    // 执行命令
    command.execute();

    // 添加到历史
    this.history.push(command);
    this.currentIndex++;

    // 限制历史大小
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].redo();
    }
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
}

// 使用示例
class DrawCommand extends Command {
  constructor(layer, imageData) {
    super();
    this.layer = layer;
    this.imageData = imageData;
    this.previousImageData = layer.canvas.getImageData(0, 0, layer.width, layer.height);
  }

  execute() {
    this.layer.canvas.putImageData(this.imageData, 0, 0);
  }

  undo() {
    this.layer.canvas.putImageData(this.previousImageData, 0, 0);
  }
}
```

#### 图层系统（Layer System）
```javascript
class Layer {
  constructor(options = {}) {
    this.id = options.id || generateId();
    this.name = options.name || 'Layer';
    this.type = options.type || 'raster'; // raster, group, text, smart-object
    this.visible = options.visible !== false;
    this.opacity = options.opacity || 1.0;
    this.blendMode = options.blendMode || 'normal';
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 0;
    this.height = options.height || 0;

    // 图层内容
    this.canvas = options.canvas || document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // 图层蒙版
    this.mask = options.mask || null;

    // 图层效果
    this.effects = {
      shadow: null,
      glow: null,
      stroke: null,
      ...options.effects
    };

    // 子图层（用于分组）
    this.children = options.children || [];
    this.parent = options.parent || null;
  }

  draw(ctx) {
    if (!this.visible) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.globalCompositeOperation = this.blendMode;

    // 绘制图层内容
    ctx.drawImage(this.canvas, this.x, this.y);

    // 应用效果
    if (this.effects.shadow) this.drawShadow(ctx);
    if (this.effects.glow) this.drawGlow(ctx);
    if (this.effects.stroke) this.drawStroke(ctx);

    // 绘制子图层
    this.children.forEach(child => child.draw(ctx));

    ctx.restore();
  }

  drawShadow(ctx) {
    const { blur, offsetX, offsetY, color } = this.effects.shadow;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
  }

  drawGlow(ctx) {
    // 实现发光效果
  }

  drawStroke(ctx) {
    const { width, color } = this.effects.stroke;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  getContext() {
    return this.canvas.getContext('2d');
  }

  clear() {
    const ctx = this.getContext();
    ctx.clearRect(0, 0, this.width, this.height);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      children: this.children.map(c => c.toJSON())
    };
  }
}

class Document {
  constructor(width = 800, height = 600) {
    this.id = generateId();
    this.width = width;
    this.height = height;
    this.layers = [];
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
  }

  addLayer(layer) {
    this.layers.push(layer);
    return layer;
  }

  removeLayer(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index !== -1) {
      this.layers.splice(index, 1);
    }
  }

  getLayer(layerId) {
    return this.layers.find(l => l.id === layerId);
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.width, this.height);

    // 从下往上绘制图层
    for (let i = this.layers.length - 1; i >= 0; i--) {
      this.layers[i].draw(ctx);
    }

    return this.canvas;
  }
}
```

#### 工具系统（Tool Framework）
```javascript
class Tool {
  constructor(options = {}) {
    this.id = options.id;
    this.name = options.name;
    this.icon = options.icon;
    this.cursor = options.cursor || 'default';
    this.options = {};
  }

  // 工具激活时调用
  activate() {
    document.body.style.cursor = this.cursor;
  }

  // 工具停用时调用
  deactivate() {
    document.body.style.cursor = 'default';
  }

  // 鼠标按下
  onMouseDown(e, context) {
    throw new Error('Must implement onMouseDown');
  }

  // 鼠标移动
  onMouseMove(e, context) {
    throw new Error('Must implement onMouseMove');
  }

  // 鼠标释放
  onMouseUp(e, context) {
    throw new Error('Must implement onMouseUp');
  }

  // 工具选项改变
  onOptionChange(option, value) {
    this.options[option] = value;
  }
}

// 画笔工具示例
class BrushTool extends Tool {
  constructor() {
    super({
      id: 'brush',
      name: '画笔',
      icon: '🖌️',
      cursor: 'crosshair'
    });

    this.options = {
      size: 5,
      opacity: 1.0,
      hardness: 100,
      color: '#000000'
    };

    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  onMouseDown(e, context) {
    this.isDrawing = true;
    const { canvas, layer } = context;
    const rect = canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
  }

  onMouseMove(e, context) {
    if (!this.isDrawing) return;

    const { canvas, layer, document } = context;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = layer.getContext();
    ctx.strokeStyle = this.options.color;
    ctx.lineWidth = this.options.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = this.options.opacity;

    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    this.lastX = x;
    this.lastY = y;

    // 触发重新渲染
    eventBus.emit('documentChanged');
  }

  onMouseUp(e, context) {
    if (this.isDrawing) {
      this.isDrawing = false;

      // 添加到历史
      const command = new DrawCommand(context.layer, context.layer.canvas);
      history.execute(command);
    }
  }
}

// 工具管理器
class ToolManager {
  constructor() {
    this.tools = new Map();
    this.activeTool = null;
  }

  register(tool) {
    this.tools.set(tool.id, tool);
  }

  activate(toolId) {
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    const tool = this.tools.get(toolId);
    if (tool) {
      tool.activate();
      this.activeTool = tool;
      eventBus.emit('toolChanged', { tool });
    }
  }

  getTool(toolId) {
    return this.tools.get(toolId);
  }

  getActiveTool() {
    return this.activeTool;
  }
}
```

### 1.3 渲染引擎（Render Engine）

```javascript
class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.viewport = {
      x: 0,
      y: 0,
      scale: 1.0
    };
  }

  render(document) {
    // 清空画布
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 应用视口变换
    this.ctx.save();
    this.ctx.translate(this.viewport.x, this.viewport.y);
    this.ctx.scale(this.viewport.scale, this.viewport.scale);

    // 渲染文档
    const compositeCanvas = document.render();
    this.ctx.drawImage(compositeCanvas, 0, 0);

    // 绘制选区或其他指示器
    this.drawSelection();

    this.ctx.restore();
  }

  drawSelection() {
    // 绘制选区边界
    const selection = useEditorStore.getState().selection;
    if (selection) {
      this.ctx.strokeStyle = '#0099ff';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      this.ctx.setLineDash([]);
    }
  }

  zoom(factor, centerX, centerY) {
    const oldScale = this.viewport.scale;
    this.viewport.scale *= factor;

    // 调整视口位置以保持缩放中心
    this.viewport.x = centerX - (centerX - this.viewport.x) * factor / oldScale;
    this.viewport.y = centerY - (centerY - this.viewport.y) * factor / oldScale;
  }

  pan(dx, dy) {
    this.viewport.x += dx;
    this.viewport.y += dy;
  }

  screenToWorldCoords(screenX, screenY) {
    return {
      x: (screenX - this.viewport.x) / this.viewport.scale,
      y: (screenY - this.viewport.y) / this.viewport.scale
    };
  }
}

// WebGL 渲染器（用于高性能处理）
class WebGLRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.gl = this.canvas.getContext('webgl2');
    this.initShaders();
  }

  initShaders() {
    // 初始化 WebGL Shader 程序
    const vertexShader = `#version 300 es
      in vec2 position;
      in vec2 uv;

      out vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `#version 300 es
      precision highp float;

      in vec2 vUv;

      uniform sampler2D texture;

      out vec4 outColor;

      void main() {
        outColor = texture(texture, vUv);
      }
    `;

    // 编译和链接着色器...
  }

  render(document) {
    // WebGL 渲染逻辑
  }
}
```

## 2. 页面 UI 结构

```html
<!DOCTYPE html>
<html>
<head>
  <title>图片编辑器</title>
  <link rel="stylesheet" href="/static/css/image-editor.css">
</head>
<body>
  <div class="image-editor">
    <!-- 顶部菜单栏 -->
    <div class="menu-bar">
      <div class="menu">文件</div>
      <div class="menu">编辑</div>
      <div class="menu">图像</div>
      <div class="menu">图层</div>
      <div class="menu">选择</div>
      <div class="menu">滤镜</div>
      <div class="menu">查看</div>
    </div>

    <!-- 主工作区 -->
    <div class="workspace">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="tool-group selection">
          <button class="tool" data-tool="rect-select">矩形选择</button>
          <button class="tool" data-tool="ellipse-select">椭圆选择</button>
          <button class="tool" data-tool="free-select">自由选择</button>
        </div>

        <div class="tool-group painting">
          <button class="tool" data-tool="brush">画笔</button>
          <button class="tool" data-tool="pencil">铅笔</button>
          <button class="tool" data-tool="eraser">橡皮擦</button>
        </div>

        <div class="tool-group transform">
          <button class="tool" data-tool="move">移动</button>
          <button class="tool" data-tool="scale">缩放</button>
          <button class="tool" data-tool="rotate">旋转</button>
        </div>

        <div class="color-selector">
          <div class="foreground-color" id="foregroundColor"></div>
          <div class="background-color" id="backgroundColor"></div>
        </div>
      </div>

      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 图层面板 -->
        <div class="panel layers-panel">
          <div class="panel-title">图层</div>
          <div class="layers-list" id="layersList"></div>
          <div class="panel-buttons">
            <button id="addLayerBtn">+ 新图层</button>
            <button id="deleteLayerBtn">删除</button>
          </div>
        </div>
      </div>

      <!-- 画布区域 -->
      <div class="canvas-area">
        <canvas id="editorCanvas"></canvas>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 工具选项 -->
        <div class="panel tool-options">
          <div class="panel-title">工具选项</div>
          <div class="options-content" id="toolOptions"></div>
        </div>

        <!-- 历史记录 -->
        <div class="panel history-panel">
          <div class="panel-title">历史记录</div>
          <div class="history-list" id="historyList"></div>
        </div>
      </div>
    </div>
  </div>

  <script src="/static/js/image-editor.js"></script>
  <script src="/static/js/tools/brush-tool.js"></script>
  <!-- 其他工具脚本 -->
</body>
</html>
```

## 3. 核心流程图

### 3.1 绘制流程
```
用户操作 (鼠标/触摸)
    ↓
事件处理器捕获
    ↓
工具处理事件
    ↓
更新图层/文档
    ↓
创建 Command 对象
    ↓
添加到撤销历史
    ↓
触发 documentChanged 事件
    ↓
调用 Renderer.render()
    ↓
界面刷新
```

### 3.2 工具切换流程
```
用户点击工具按钮
    ↓
ToolManager.activate(toolId)
    ↓
停用当前工具 (deactivate)
    ↓
激活新工具 (activate)
    ↓
发送 toolChanged 事件
    ↓
更新 UI（工具选项等）
```

## 4. 第一阶段实现细节

### 4.1 必需组件

1. **ImageEditorComponent** - 主编辑器组件
2. **Canvas** - 画布元素
3. **ToolBar** - 工具栏
4. **LayersPanel** - 图层面板
5. **HistoryPanel** - 历史记录面板
6. **ToolOptions** - 工具选项面板

### 4.2 核心类

```javascript
class ImageEditor {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = options;

    this.document = new Document(options.width || 800, options.height || 600);
    this.renderer = new CanvasRenderer(canvasElement);
    this.toolManager = new ToolManager();
    this.history = new CommandHistory();

    this.setupTools();
    this.setupEventListeners();
    this.render();
  }

  setupTools() {
    this.toolManager.register(new BrushTool());
    this.toolManager.register(new PencilTool());
    this.toolManager.register(new RectSelectTool());
    // 注册其他工具...
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.handleZoom(e));

    eventBus.on('documentChanged', () => this.render());
  }

  handleMouseDown(e) {
    const tool = this.toolManager.getActiveTool();
    if (tool) {
      tool.onMouseDown(e, this.getToolContext());
    }
  }

  handleMouseMove(e) {
    const tool = this.toolManager.getActiveTool();
    if (tool) {
      tool.onMouseMove(e, this.getToolContext());
    }
  }

  handleMouseUp(e) {
    const tool = this.toolManager.getActiveTool();
    if (tool) {
      tool.onMouseUp(e, this.getToolContext());
    }
  }

  handleZoom(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    this.renderer.zoom(factor, e.clientX, e.clientY);
    this.render();
  }

  getToolContext() {
    return {
      canvas: this.canvas,
      document: this.document,
      layer: this.document.layers[0] || this.createDefaultLayer(),
      renderer: this.renderer
    };
  }

  createDefaultLayer() {
    const layer = new Layer({
      name: 'Layer 1',
      width: this.document.width,
      height: this.document.height
    });
    this.document.addLayer(layer);
    return layer;
  }

  render() {
    this.renderer.render(this.document);
  }

  undo() {
    this.history.undo();
    this.render();
  }

  redo() {
    this.history.redo();
    this.render();
  }
}

// 初始化
const editor = new ImageEditor(
  document.getElementById('editorCanvas'),
  { width: 800, height: 600 }
);

// 激活画笔工具
editor.toolManager.activate('brush');
```

## 5. 后端接口设计（第一阶段）

```javascript
// 保存文档
POST /api/image-editor/documents
Body: {
  name: "document name",
  data: {...}, // 序列化的文档数据
  thumbnail: "base64 data"
}

// 加载文档
GET /api/image-editor/documents/:id

// 导出图片
POST /api/image-editor/export
Body: {
  documentId: "doc-1",
  format: "png", // png, jpg, webp
  quality: 90 // 用于 jpg
}

// 上传图片
POST /api/image-editor/upload
Body: FormData (包含图片文件)
```

---

## 总结

第一阶段的设计建立了可扩展的基础架构：
- ✅ 事件驱动架构
- ✅ 模块化工具系统
- ✅ 撤销/重做系统
- ✅ 图层管理系统
- ✅ 渲染引擎框架

这个基础允许后续阶段轻松添加新工具、滤镜和功能，而无需重新设计核心系统。

