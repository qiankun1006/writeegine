# 游戏类型门户和编辑器 - 开发者文档

## 目录

1. [系统架构](#系统架构)
2. [API 文档](#api-文档)
3. [前端架构](#前端架构)
4. [编辑器扩展指南](#编辑器扩展指南)
5. [添加新游戏类型](#添加新游戏类型)
6. [性能优化指南](#性能优化指南)
7. [测试指南](#测试指南)

---

## 系统架构

### 技术栈

#### 后端
- **框架**: Spring Boot 2.x
- **语言**: Java 11+
- **数据库**: MySQL
- **ORM**: Spring Data JPA

#### 前端
- **基础**: HTML5, CSS3, JavaScript (ES6+)
- **3D 渲染**: Three.js
- **物理引擎**: Ammo.js (可选)
- **构建工具**: 原生 JavaScript (无构建步骤)

### 项目结构

```
writeengine/
├── src/main/
│   ├── java/com/example/writemyself/
│   │   ├── controller/          # 控制器
│   │   │   ├── GameController.java
│   │   │   └── UnityController.java
│   │   ├── service/            # 服务层
│   │   │   ├── GameService.java
│   │   │   └── UnityService.java
│   │   ├── model/              # 数据模型
│   │   │   └── Game.java
│   │   ├── repository/         # 数据访问层
│   │   │   └── GameRepository.java
│   │   └── dto/                # 数据传输对象
│   │       └── GameDTO.java
│   └── resources/
│       ├── templates/          # HTML 模板
│       │   ├── create-game-unity-portal.html
│       │   ├── create-game-2d-strategy.html
│       │   ├── create-game-2d-metroidvania.html
│       │   ├── create-game-2d-rpg.html
│       │   ├── create-game-3d-shooter.html
│       │   └── e2e-test.html
│       └── static/
│           ├── css/
│           │   └── game-portal.css
│           └── js/
│               ├── game-portal.js
│               └── unity-editor/
│                   ├── BaseEditor2D.js
│                   ├── LightingEditor.js
│                   ├── ParticleSystemEditor.js
│                   ├── Editor2DTest.js
│                   ├── PerformanceTest3D.js
│                   ├── EndToEndTest.js
│                   ├── MODULES_CONFIG_2D.json
│                   └── MODULES_CONFIG_3D.json
└── openspec/
    └── changes/
        └── add-game-type-portal/
            ├── proposal.md
            ├── tasks.md
            └── docs/
                ├── USER_GUIDE.md
                └── DEVELOPER_GUIDE.md
```

---

## API 文档

### GameController API

#### 创建游戏

**端点**: `POST /api/game/create`

**请求参数**:
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| name | String | 是 | 游戏名称 |
| type | String | 是 | 游戏类型 (2d-strategy, 2d-metroidvania, 2d-rpg, 3d-shooter) |
| description | String | 否 | 游戏描述 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "game_123456789",
    "name": "我的策略游戏",
    "type": "2d-strategy",
    "description": "一个有趣的策略游戏",
    "thumbnailUrl": null,
    "createdAt": 1709075200000,
    "updatedAt": 1709075200000
  },
  "message": "游戏创建成功"
}
```

---

#### 获取游戏列表

**端点**: `GET /api/game/list`

**响应示例**:
```json
{
  "success": true,
  "games": [
    {
      "id": "game_123456789",
      "name": "我的策略游戏",
      "type": "2d-strategy",
      "thumbnailUrl": "/uploads/thumbnails/game_123456789.png",
      "createdAt": 1709075200000,
      "updatedAt": 1709075200000
    }
  ],
  "total": 1
}
```

---

#### 获取游戏详情

**端点**: `GET /api/game/{gameId}`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "game_123456789",
    "name": "我的策略游戏",
    "type": "2d-strategy",
    "description": "一个有趣的策略游戏",
    "thumbnailUrl": "/uploads/thumbnails/game_123456789.png",
    "metadata": {
      "version": "1.0.0",
      "lastSceneId": "scene_001"
    },
    "createdAt": 1709075200000,
    "updatedAt": 1709075200000
  }
}
```

---

#### 保存游戏

**端点**: `POST /api/game/{gameId}/save`

**请求体**:
```json
{
  "sceneData": {
    "objects": [...],
    "settings": {...}
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "游戏保存成功"
}
```

---

#### 删除游戏

**端点**: `DELETE /api/game/{gameId}`

**响应示例**:
```json
{
  "success": true,
  "message": "游戏删除成功"
}
```

---

### UnityController API

#### 保存场景

**端点**: `POST /api/unity/scene/save`

**请求体**:
```json
{
  "gameId": "game_123456789",
  "name": "主场景",
  "objects": [
    {
      "id": "obj_001",
      "type": "cube",
      "position": {"x": 0, "y": 0, "z": 0},
      "rotation": {"x": 0, "y": 0, "z": 0},
      "scale": {"x": 1, "y": 1, "z": 1}
    }
  ],
  "settings": {
    "backgroundColor": "#1a1a1a",
    "gridEnabled": true
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "sceneId": "scene_123456789",
  "message": "场景保存成功"
}
```

---

#### 加载场景

**端点**: `GET /api/unity/scene/load?sceneId={sceneId}`

**响应示例**:
```json
{
  "success": true,
  "scene": {
    "id": "scene_123456789",
    "name": "主场景",
    "objects": [...],
    "settings": {...}
  }
}
```

---

#### 获取场景列表

**端点**: `GET /api/unity/scene/list?page=1&pageSize=20`

**响应示例**:
```json
{
  "success": true,
  "scenes": [
    {
      "id": "scene_123456789",
      "name": "主场景",
      "createdAt": 1709075200000
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

#### 导入 3D 模型

**端点**: `POST /api/unity/model/import`

**请求参数** (multipart/form-data):
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | File | 是 | 模型文件 (gltf, glb, obj, fbx) |
| format | String | 否 | 文件格式 (默认自动检测) |

**响应示例**:
```json
{
  "success": true,
  "modelId": "model_123456789",
  "fileName": "character.glb",
  "fileSize": 5242880,
  "format": "glb",
  "message": "模型导入成功"
}
```

---

## 前端架构

### 编辑器基类

#### BaseEditor2D

2D 编辑器的基类，提供核心功能：

```javascript
class BaseEditor2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.objects = [];
    this.selectedObject = null;
    this.history = [];
    this.historyIndex = -1;

    this.initEventHandlers();
    this.initCanvas();
  }

  // 对象管理
  addObject(object) { }
  removeObject(objectId) { }
  selectObject(objectId) { }
  getSelectedObject() { }

  // 历史记录
  undo() { }
  redo() { }
  saveState() { }

  // 渲染
  render() { }
  clear() { }

  // 事件处理
  initEventHandlers() { }
  handleMouseDown(e) { }
  handleMouseMove(e) { }
  handleMouseUp(e) { }

  // 数据持久化
  save() { }
  load(data) { }
}
```

---

### 懒加载系统

#### 模块配置

每个编辑器类型有自己的模块配置文件：

**MODULES_CONFIG_2D.json**:
```json
{
  "modules": [
    {
      "name": "Canvas Core",
      "files": ["/js/unity-editor/core/CanvasCore.js"],
      "priority": 1,
      "required": true
    },
    {
      "name": "BaseEditor2D",
      "files": ["/js/unity-editor/BaseEditor2D.js"],
      "priority": 2,
      "required": true
    },
    {
      "name": "GridSystem",
      "files": ["/js/unity-editor/tools/GridSystem.js"],
      "priority": 3,
      "required": false
    }
  ]
}
```

**MODULES_CONFIG_3D.json**:
```json
{
  "modules": [
    {
      "name": "Three.js",
      "files": [
        "https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js",
        "https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js"
      ],
      "priority": 1,
      "required": true
    },
    {
      "name": "UnityRenderer",
      "files": ["/js/unity-editor/core/UnityRenderer.js"],
      "priority": 2,
      "required": true
    },
    {
      "name": "LightingEditor",
      "files": ["/js/unity-editor/tools/LightingEditor.js"],
      "priority": 3,
      "required": false
    },
    {
      "name": "Ammo.js",
      "files": ["/js/unity-editor/libs/ammo.js"],
      "priority": 5,
      "required": false,
      "lazy": true
    }
  ]
}
```

---

#### LazyLoader 实现

```javascript
class LazyLoader {
  constructor(config) {
    this.config = config;
    this.loadedModules = new Set();
    this.loadingModules = new Map();
  }

  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve();
    }

    if (this.loadingModules.has(moduleName)) {
      return this.loadingModules.get(moduleName);
    }

    const module = this.config.modules.find(m => m.name === moduleName);
    if (!module) {
      throw new Error(`Module not found: ${moduleName}`);
    }

    const promise = this.loadFiles(module.files);
    this.loadingModules.set(moduleName, promise);

    try {
      await promise;
      this.loadedModules.add(moduleName);
      this.loadingModules.delete(moduleName);
      console.log(`✅ Module loaded: ${moduleName}`);
    } catch (error) {
      this.loadingModules.delete(moduleName);
      throw error;
    }
  }

  async loadFiles(files) {
    const promises = files.map(file => this.loadScript(file));
    return Promise.all(promises);
  }

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load: ${url}`));
      document.head.appendChild(script);
    });
  }
}
```

---

## 编辑器扩展指南

### 创建自定义工具

#### 1. 定义工具类

```javascript
class CustomTool {
  constructor(editor) {
    this.editor = editor;
    this.isActive = false;
    this.settings = {
      // 默认设置
    };
  }

  activate() {
    this.isActive = true;
    console.log('CustomTool activated');
  }

  deactivate() {
    this.isActive = false;
    console.log('CustomTool deactivated');
  }

  handleEvent(event) {
    if (!this.isActive) return;

    switch (event.type) {
      case 'mousedown':
        this.onMouseDown(event);
        break;
      case 'mousemove':
        this.onMouseMove(event);
        break;
      case 'mouseup':
        this.onMouseUp(event);
        break;
    }
  }

  onMouseDown(event) {
    // 鼠标按下逻辑
  }

  onMouseMove(event) {
    // 鼠标移动逻辑
  }

  onMouseUp(event) {
    // 鼠标释放逻辑
  }

  // 自定义方法
  doSomething() {
    // 实现你的功能
  }
}
```

#### 2. 注册工具

```javascript
// 在编辑器初始化时注册
const customTool = new CustomTool(editor);
editor.tools.push(customTool);

// 或者通过配置文件注册
const config = {
  tools: [
    {
      name: 'CustomTool',
      class: CustomTool,
      icon: 'icon-custom-tool',
      tooltip: '自定义工具'
    }
  ]
};
```

---

### 添加自定义面板

#### 1. 创建面板 HTML

```html
<div id="custom-panel" class="panel custom-panel">
  <div class="panel-header">
    <h3>自定义面板</h3>
    <button class="panel-close">&times;</button>
  </div>
  <div class="panel-body">
    <!-- 面板内容 -->
    <label for="custom-input">输入值:</label>
    <input type="text" id="custom-input" />

    <button id="custom-button">执行</button>
  </div>
</div>
```

#### 2. 添加面板 CSS

```css
.custom-panel {
  position: absolute;
  right: 20px;
  top: 100px;
  width: 250px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.custom-panel .panel-header {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.custom-panel .panel-body {
  padding: 15px;
}
```

#### 3. 初始化面板

```javascript
function initCustomPanel() {
  const panel = document.getElementById('custom-panel');
  const button = document.getElementById('custom-button');
  const input = document.getElementById('custom-input');

  button.addEventListener('click', () => {
    const value = input.value;
    console.log('Custom action:', value);
    // 执行自定义逻辑
  });
}

// 在编辑器初始化时调用
initCustomPanel();
```

---

## 添加新游戏类型

### 步骤 1: 后端配置

#### 更新 GameType 枚举

```java
// src/main/java/com/example/writemyself/model/Game.java
public enum GameType {
    TWO_D_STRATEGY("2d-strategy", "2D 策略战棋"),
    TWO_D_METROIDVANIA("2d-metroidvania", "2D 恶魔城"),
    TWO_D_RPG("2d-rpg", "2D RPG"),
    THREE_D_SHOOTER("3d-shooter", "3D 射击"),
    NEW_TYPE("new-type", "新类型");  // 添加新类型

    private final String value;
    private final String displayName;

    // 构造函数、getter 方法等
}
```

---

### 步骤 2: 添加控制器路由

```java
// src/main/java/com/example/writemyself/controller/UnityController.java
/**
 * 新类型编辑器页面
 */
@GetMapping("/create-game/unity/new-type")
public String createGameNewType(Model model, @RequestParam(required = false) String gameId) {
    model.addAttribute("title", "新类型编辑器");
    model.addAttribute("editorType", "new-type");
    model.addAttribute("gameId", gameId != null ? gameId : "");
    model.addAttribute("version", "1.0.0");
    return "create-game-new-type";
}
```

---

### 步骤 3: 创建 HTML 模板

```html
<!-- src/main/resources/templates/create-game-new-type.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="/css/editor-common.css">
  <link rel="stylesheet" href="/css/new-type-editor.css">
</head>
<body>
  <div id="app">
    <header class="editor-header">
      <!-- 编辑器标题栏 -->
    </header>

    <div class="editor-container">
      <aside class="sidebar-left">
        <!-- 左侧工具栏 -->
      </aside>

      <main class="editor-viewport">
        <!-- 主编辑区域 -->
      </main>

      <aside class="sidebar-right">
        <!-- 右侧属性面板 -->
      </aside>
    </div>

    <footer class="editor-footer">
      <!-- 状态栏 -->
    </footer>
  </div>

  <!-- 脚本引入 -->
  <script src="/js/unity-editor/LazyLoader.js"></script>
  <script>
    // 加载新类型编辑器配置
    const editorConfig = {
      type: 'new-type',
      gameId: '${gameId}'
    };

    // 初始化编辑器
  </script>
</body>
</html>
```

---

### 步骤 4: 创建模块配置

```json
{
  "modules": [
    {
      "name": "Core",
      "files": ["/js/unity-editor/core/Core.js"],
      "priority": 1,
      "required": true
    },
    {
      "name": "NewTypeEditor",
      "files": ["/js/unity-editor/NewTypeEditor.js"],
      "priority": 2,
      "required": true
    },
    {
      "name": "CustomTools",
      "files": ["/js/unity-editor/tools/NewTypeTools.js"],
      "priority": 3,
      "required": false
    }
  ]
}
```

---

### 步骤 5: 更新门户页面

```javascript
// src/main/resources/static/js/game-portal.js
const gameTypes = [
  // ... 现有类型
  {
    id: 'new-type',
    name: '新类型',
    description: '新类型游戏编辑器',
    icon: '/images/icons/new-type.svg',
    color: '#ff6b6b'
  }
];
```

```html
<!-- src/main/resources/templates/create-game-unity-portal.html -->
<!-- 添加新类型的卡片 -->
<div class="game-card" data-type="new-type">
  <div class="card-icon">
    <img src="/images/icons/new-type.svg" alt="新类型">
  </div>
  <h3 class="card-title">新类型</h3>
  <p class="card-description">新类型游戏编辑器</p>
  <button class="btn btn-primary btn-new">新建游戏</button>
  <div class="game-dropdown" style="display: none;">
    <button class="btn btn-secondary btn-open">打开游戏</button>
  </div>
</div>
```

---

### 步骤 6: 测试

1. 访问门户页面，确认新类型卡片显示
2. 点击"新建游戏"，确认跳转到新编辑器
3. 测试编辑器核心功能
4. 运行端到端测试

---

## 性能优化指南

### 懒加载策略

#### 优先级分级

- **Priority 1 (必需)**: 核心功能，立即加载
- **Priority 2 (重要)**: 主要功能，延迟 100ms
- **Priority 3 (可选)**: 辅助功能，延迟 500ms
- **Priority 4 (按需)**: 用户交互后加载
- **Priority 5 (重型)**: 仅在用户明确请求时加载

#### 示例配置

```javascript
const loadingStrategy = {
  initial: ['Priority 1'],
  delayed: ['Priority 2'],
  lazy: ['Priority 3'],
  onDemand: ['Priority 4'],
  manual: ['Priority 5']
};

async function loadModulesByStrategy() {
  // 立即加载
  await Promise.all(loadingStrategy.initial.map(loadModule));

  // 延迟加载
  setTimeout(() => {
    loadingStrategy.delayed.forEach(loadModule);
  }, 100);

  // 懒加载
  setTimeout(() => {
    loadingStrategy.lazy.forEach(loadModule);
  }, 500);
}
```

---

### 3D 渲染优化

#### 对象池

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }

  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// 使用示例
const meshPool = new ObjectPool(
  () => new THREE.Mesh(geometry, material),
  (mesh) => {
    mesh.position.set(0, 0, 0);
    mesh.visible = false;
  },
  100
);
```

#### 批量渲染

```javascript
class BatchRenderer {
  constructor(maxObjects = 1000) {
    this.maxObjects = maxObjects;
    this.objects = [];
    this.geometry = new THREE.InstancedBufferGeometry();
    this.material = new THREE.MeshBasicMaterial();
  }

  addObject(position, scale) {
    if (this.objects.length >= this.maxObjects) {
      console.warn('Batch renderer full');
      return;
    }
    this.objects.push({ position, scale });
  }

  update() {
    // 更新实例化网格
  }
}
```

---

### 2D 渲染优化

#### 离屏渲染

```javascript
class OffscreenRenderer {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
  }

  renderStaticObjects(objects) {
    // 渲染不常变化的物体到离屏 Canvas
    objects.forEach(obj => {
      this.ctx.save();
      this.ctx.translate(obj.x, obj.y);
      this.ctx.rotate(obj.rotation);
      // 绘制对象
      this.ctx.restore();
    });
  }

  drawToMainCanvas(mainCtx) {
    // 将离屏 Canvas 绘制到主 Canvas
    mainCtx.drawImage(this.canvas, 0, 0);
  }
}
```

---

## 测试指南

### 运行端到端测试

#### 启动应用

```bash
# 启动 Spring Boot 应用
mvn spring-boot:run
```

#### 访问测试页面

打开浏览器访问: `http://localhost:8080/e2e-test`

#### 运行测试

1. 点击"运行所有测试"按钮
2. 查看测试日志和结果
3. 导出测试报告（可选）

---

### 单元测试示例

#### 前端单元测试

```javascript
// test/Editor2DTest.js
function testObjectCreation() {
  const editor = new BaseEditor2D(canvas);
  const obj = {
    id: 1,
    x: 100,
    y: 100,
    width: 50,
    height: 50
  };

  editor.addObject(obj);

  const retrieved = editor.getObject(1);
  console.assert(retrieved.x === 100, 'Object X position should be 100');
  console.assert(retrieved.y === 100, 'Object Y position should be 100');
  console.log('✅ Object creation test passed');
}

function testSelection() {
  const editor = new BaseEditor2D(canvas);
  const obj = { id: 1, x: 100, y: 100, width: 50, height: 50 };
  editor.addObject(obj);

  editor.selectObject(1);
  const selected = editor.getSelectedObject();

  console.assert(selected.id === 1, 'Selected object should have id 1');
  console.log('✅ Selection test passed');
}

// 运行测试
testObjectCreation();
testSelection();
```

---

#### 后端单元测试

```java
// src/test/java/com/example/writemyself/controller/GameControllerTest.java
@SpringBootTest
@AutoConfigureMockMvc
public class GameControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  public void testCreateGame() throws Exception {
    mockMvc.perform(post("/api/game/create")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .param("name", "Test Game")
            .param("type", "2d-strategy"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Test Game"));
  }

  @Test
  public void testGetGameList() throws Exception {
    mockMvc.perform(get("/api/game/list"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.games").isArray());
  }
}
```

---

### 性能测试

#### FPS 测试

```javascript
function measureFPS(callback) {
  let frames = 0;
  let lastTime = performance.now();

  function countFrames() {
    frames++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
      const fps = frames;
      console.log(`FPS: ${fps}`);
      callback(fps);
      frames = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(countFrames);
  }

  countFrames();
}

// 使用示例
measureFPS((fps) => {
  if (fps < 30) {
    console.warn('Low FPS detected:', fps);
  }
});
```

---

## 常见问题排查

### 前端问题

#### 问题: 编辑器无法加载模块

**解决方案**:
1. 检查网络连接
2. 确认模块路径正确
3. 查看浏览器控制台错误信息
4. 检查 CORS 设置

---

#### 问题: 3D 渲染卡顿

**解决方案**:
1. 减少场景中的对象数量
2. 使用对象池
3. 启用视锥体剔除
4. 降低材质复杂度
5. 使用 PerformanceMonitor 监控性能

---

### 后端问题

#### 问题: API 返回 500 错误

**解决方案**:
1. 查看服务器日志
2. 检查数据库连接
3. 验证请求参数格式
4. 确认所有依赖已正确加载

---

#### 问题: 数据保存失败

**解决方案**:
1. 检查数据库表结构
2. 确认用户权限
3. 验证数据格式
4. 检查磁盘空间

---

## 贡献指南

### 代码提交规范

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具链相关
```

### Pull Request 流程

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 联系方式

如有问题或建议，请联系开发团队：

- 邮箱: dev@example.com
- Slack: #game-editor-dev
- GitHub Issues: https://github.com/example/game-editor/issues

---

**版本**: 1.0.0
**最后更新**: 2026-02-27

