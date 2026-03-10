# Unity 编辑器技术设计文档

## 1. 架构设计

### 1.1 整体架构
```
┌─────────────────────────────────────────────┐
│                前端层 (Browser)              │
├─────────────────────────────────────────────┤
│  Unity 编辑器应用                           │
│  ├── 3D 渲染引擎 (Three.js)                 │
│  ├── 物理引擎 (Ammo.js)                     │
│  ├── UI 框架 (原生 HTML/CSS/JS)             │
│  └── 状态管理 (自定义)                       │
├─────────────────────────────────────────────┤
│                后端层 (Spring Boot)          │
├─────────────────────────────────────────────┤
│  ├── REST API 控制器                        │
│  ├── 场景数据存储服务                       │
│  ├── 文件上传处理                           │
│  └── 用户认证与权限                         │
└─────────────────────────────────────────────┘
```

### 1.2 模块划分
1. **渲染模块**：负责 3D 场景的渲染和显示
2. **编辑模块**：处理用户编辑操作
3. **物理模块**：管理物理模拟和碰撞
4. **UI 模块**：处理用户界面交互
5. **数据模块**：管理场景数据的序列化和存储
6. **工具模块**：提供各种编辑工具

## 2. 数据模型设计

### 2.1 场景数据结构
```javascript
// 场景数据模型
class SceneData {
  constructor() {
    this.version = '1.0.0';
    this.name = '未命名场景';
    this.objects = [];          // 场景中的对象列表
    this.materials = [];        // 材质列表
    this.lights = [];           // 光源列表
    this.camera = {             // 摄像机设置
      position: { x: 0, y: 5, z: 10 },
      target: { x: 0, y: 0, z: 0 },
      fov: 60
    };
    this.settings = {           // 场景设置
      backgroundColor: '#87CEEB',
      gridEnabled: true,
      gridSize: 1,
      physicsEnabled: false
    };
  }
}

// 场景对象模型
class SceneObject {
  constructor(type, name) {
    this.id = generateUUID();
    this.type = type;           // 'cube', 'sphere', 'light', 'camera', etc.
    this.name = name;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.materialId = null;     // 引用的材质ID
    this.children = [];         // 子对象ID列表
    this.parentId = null;       // 父对象ID
    this.components = [];       // 组件列表
    this.visible = true;
    this.selectable = true;
  }
}

// 材质模型
class Material {
  constructor(name) {
    this.id = generateUUID();
    this.name = name;
    this.type = 'basic';        // 'basic', 'standard', 'phong'
    this.color = '#FFFFFF';
    this.opacity = 1.0;
    this.transparent = false;
    this.texture = null;        // 纹理URL或数据
    this.properties = {};       // 其他材质属性
  }
}

// 物理组件模型
class PhysicsComponent {
  constructor() {
    this.type = 'rigidbody';
    this.mass = 1.0;
    this.friction = 0.5;
    this.restitution = 0.3;
    this.collider = {           // 碰撞体设置
      type: 'box',              // 'box', 'sphere', 'mesh'
      size: { x: 1, y: 1, z: 1 }
    };
    this.constraints = [];      // 约束列表
  }
}
```

### 2.2 状态管理设计
```javascript
// 编辑器状态管理器
class EditorState {
  constructor() {
    // 场景数据
    this.scene = new SceneData();

    // 编辑状态
    this.selectedObjects = new Set();  // 选中的对象ID
    this.activeTool = 'select';        // 当前激活的工具
    this.editMode = 'object';          // 编辑模式: 'object', 'vertex', 'uv'

    // 视图状态
    this.viewport = {
      width: 800,
      height: 600,
      cameraMode: 'perspective',       // 'perspective', 'top', 'front', 'side'
      gridVisible: true,
      axesVisible: true
    };

    // 操作历史
    this.history = {
      undoStack: [],
      redoStack: [],
      maxSteps: 50
    };

    // 物理模拟状态
    this.physics = {
      enabled: false,
      simulating: false,
      gravity: { x: 0, y: -9.8, z: 0 },
      timeScale: 1.0
    };
  }

  // 状态操作方法
  selectObject(objectId) {
    this.selectedObjects.clear();
    this.selectedObjects.add(objectId);
    this.notify('selectionChanged');
  }

  addObject(object) {
    this.scene.objects.push(object);
    this.history.push({
      type: 'addObject',
      object: object,
      timestamp: Date.now()
    });
    this.notify('sceneChanged');
  }

  // 撤销/重做支持
  undo() {
    if (this.history.undoStack.length > 0) {
      const action = this.history.undoStack.pop();
      this.history.redoStack.push(action);
      this.applyUndoAction(action);
      this.notify('historyChanged');
    }
  }

  redo() {
    if (this.history.redoStack.length > 0) {
      const action = this.history.redoStack.pop();
      this.history.undoStack.push(action);
      this.applyRedoAction(action);
      this.notify('historyChanged');
    }
  }

  // 观察者模式支持
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(event) {
    this.observers.forEach(observer => observer.onStateChange(event, this));
  }
}
```

## 3. 核心模块实现

### 3.1 渲染引擎模块
```javascript
// 渲染引擎封装
class UnityRenderer {
  constructor(canvasId) {
    // 初始化 Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById(canvasId),
      antialias: true,
      alpha: true
    });

    // 初始化控制器
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // 初始化场景
    this.initScene();

    // 渲染循环
    this.animate();
  }

  initScene() {
    // 添加网格地面
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    this.scene.add(gridHelper);

    // 添加坐标轴
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);
  }

  // 创建几何体
  createGeometry(type, options) {
    let geometry;
    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(
          options.width || 1,
          options.height || 1,
          options.depth || 1
        );
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          options.radius || 1,
          options.widthSegments || 32,
          options.heightSegments || 16
        );
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          options.radiusTop || 1,
          options.radiusBottom || 1,
          options.height || 2,
          options.radialSegments || 32
        );
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(
          options.width || 10,
          options.height || 10
        );
        break;
      default:
        throw new Error(`Unsupported geometry type: ${type}`);
    }
    return geometry;
  }

  // 创建材质
  createMaterial(type, options) {
    let material;
    switch (type) {
      case 'basic':
        material = new THREE.MeshBasicMaterial({
          color: options.color || 0xffffff,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          wireframe: options.wireframe || false
        });
        break;
      case 'standard':
        material = new THREE.MeshStandardMaterial({
          color: options.color || 0xffffff,
          metalness: options.metalness || 0.5,
          roughness: options.roughness || 0.5,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0
        });
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial({
          color: options.color || 0xffffff,
          shininess: options.shininess || 30,
          specular: options.specular || 0x111111,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0
        });
        break;
      default:
        throw new Error(`Unsupported material type: ${type}`);
    }
    return material;
  }

  // 添加对象到场景
  addObject(objectData) {
    const geometry = this.createGeometry(objectData.geometry.type, objectData.geometry.options);
    const material = this.createMaterial(objectData.material.type, objectData.material.options);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      objectData.position.x,
      objectData.position.y,
      objectData.position.z
    );
    mesh.rotation.set(
      objectData.rotation.x * Math.PI / 180,
      objectData.rotation.y * Math.PI / 180,
      objectData.rotation.z * Math.PI / 180
    );
    mesh.scale.set(
      objectData.scale.x,
      objectData.scale.y,
      objectData.scale.z
    );

    // 添加用户数据用于识别
    mesh.userData = {
      id: objectData.id,
      name: objectData.name,
      type: objectData.type,
      selectable: true
    };

    this.scene.add(mesh);
    return mesh;
  }

  // 选择对象
  selectObject(raycaster, mouse) {
    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
      const object = intersects[i].object;
      if (object.userData.selectable) {
        return object;
      }
    }
    return null;
  }

  // 渲染循环
  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // 调整大小
  onResize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
```

## 4. 技术选型总结

### 4.1 核心技术栈
1. **渲染引擎**：Three.js（成熟、灵活、社区活跃）
2. **物理引擎**：Ammo.js（功能完整、性能优秀）
3. **UI 框架**：保持现有原生方案（一致性、可控性）
4. **构建工具**：扩展现有 Maven 配置

### 4.2 开发策略
1. **渐进式开发**：从最简单的 3D 查看器开始，逐步添加编辑功能
2. **模块化设计**：渲染模块独立，物理模块可选，UI 组件可复用
3. **测试驱动**：单元测试核心算法，集成测试交互流程，性能测试关键场景

### 4.3 资源规划
1. **团队配置**：2-3 名全栈工程师，1 名 UI/UX 设计师
2. **时间规划**：
   - 调研阶段：2-4 周
   - MVP 开发：8-12 周
   - 增强功能：12-16 周
   - 优化完善：8-12 周

## 5. 风险分析与应对

### 5.1 技术风险
- **性能风险**：复杂场景导致浏览器崩溃
  - 应对：实施性能监控和警告，提供场景复杂度限制
- **兼容性风险**：某些浏览器不支持关键特性
  - 应对：提供降级方案，明确浏览器要求

### 5.2 开发风险
- **范围蔓延风险**：功能过多导致项目失控
  - 应对：严格遵循 MVP 原则，分阶段开发计划
- **技术债务风险**：快速开发导致代码质量下降
  - 应对：建立代码规范，定期重构，自动化测试

### 5.3 成功指标
- **技术指标**：场景加载时间 < 3秒，编辑操作响应时间 < 100ms
- **用户体验指标**：学习曲线平缓，30分钟内上手，用户满意度评分 > 4/5

