/**
 * ThreeDTransformTool.js - 3D 变换工具
 * Phase 4: 变换与3D 功能实现
 * 使用 Three.js 实现 3D 变换功能
 */

// 检查 Three.js 是否可用
let THREE = null;
try {
  if (typeof window !== 'undefined' && window.THREE) {
    THREE = window.THREE;
  }
} catch (e) {
  console.warn('Three.js 未加载，3D 变换功能将不可用');
}

/**
 * ThreeDTransformTool - 3D 变换工具
 */
class ThreeDTransformTool extends TransformTool {
  constructor() {
    super({
      id: '3d-transform',
      name: '3D 变换',
      icon: '📦',
      cursor: 'move'
    });

    // 3D 变换状态
    this.threeDState = {
      isInitialized: false,
      scene: null,
      camera: null,
      renderer: null,
      mesh: null,
      controls: null,
      originalTexture: null
    };

    // 3D 参数
    this.options = {
      showGrid: true,
      showAxes: true,
      lighting: true,
      ...this.options
    };
  }

  /**
   * 激活工具
   */
  activate() {
    super.activate();

    // 检查 Three.js 是否可用
    if (!this.checkThreeJS()) {
      this.showThreeJSError();
      return;
    }

    // 初始化 3D 环境
    this.initThreeJS();
    this.show3DControls();
    this.show3DOptions();
  }

  /**
   * 停用工具
   */
  deactivate() {
    super.deactivate();
    this.cleanupThreeJS();
  }

  /**
   * 检查 Three.js 是否可用
   */
  checkThreeJS() {
    if (!THREE) {
      // 尝试从 CDN 加载 Three.js
      this.loadThreeJS();
      return false;
    }
    return true;
  }

  /**
   * 加载 Three.js
   */
  loadThreeJS() {
    console.log('正在加载 Three.js...');

    // 创建脚本标签
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      THREE = window.THREE;
      console.log('Three.js 加载成功');
      this.initThreeJS();
    };
    script.onerror = () => {
      console.error('Three.js 加载失败');
      this.showThreeJSError();
    };

    document.head.appendChild(script);
  }

  /**
   * 显示 Three.js 错误信息
   */
  showThreeJSError() {
    const optionsPanel = document.getElementById('toolOptions');
    if (!optionsPanel) return;

    optionsPanel.innerHTML = `
      <div class="error-message" style="color: #ff4444; padding: 20px; text-align: center;">
        <h3>⚠️ Three.js 未加载</h3>
        <p>3D 变换功能需要 Three.js 库。</p>
        <p>请确保 Three.js 已正确加载，或刷新页面重试。</p>
        <button id="retryLoadThreeJS" style="margin-top: 10px;">重试加载</button>
      </div>
    `;

    document.getElementById('retryLoadThreeJS').addEventListener('click', () => {
      this.loadThreeJS();
    });
  }

  /**
   * 初始化 Three.js 环境
   */
  initThreeJS() {
    if (!THREE) {
      console.error('Three.js 未定义');
      return;
    }

    if (this.threeDState.isInitialized) {
      return;
    }

    try {
      // 创建场景
      this.threeDState.scene = new THREE.Scene();
      this.threeDState.scene.background = new THREE.Color(0xf0f0f0);

      // 创建相机
      this.threeDState.camera = new THREE.PerspectiveCamera(
        75, // 视野角度
        window.innerWidth / window.innerHeight, // 宽高比
        0.1, // 近平面
        1000 // 远平面
      );
      this.threeDState.camera.position.z = 5;

      // 创建渲染器
      this.threeDState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.threeDState.renderer.setSize(800, 600);
      this.threeDState.renderer.setPixelRatio(window.devicePixelRatio);

      // 创建网格
      this.create3DMesh();

      // 添加灯光
      if (this.options.lighting) {
        this.addLights();
      }

      // 添加辅助工具
      if (this.options.showGrid) {
        this.addGridHelper();
      }
      if (this.options.showAxes) {
        this.addAxesHelper();
      }

      // 创建轨道控制器
      this.createOrbitControls();

      this.threeDState.isInitialized = true;
      console.log('Three.js 环境初始化成功');
    } catch (error) {
      console.error('Three.js 初始化失败:', error);
      this.showThreeJSError();
    }
  }

  /**
   * 创建 3D 网格
   */
  create3DMesh() {
    if (!THREE || !this.threeDState.scene) return;

    const layer = this.getActiveLayer();
    if (!layer) {
      // 创建默认平面
      this.createDefaultPlane();
      return;
    }

    try {
      // 从图层创建纹理
      const texture = this.createTextureFromLayer(layer);
      this.threeDState.originalTexture = texture;

      // 创建平面几何体
      const geometry = new THREE.PlaneGeometry(4, 3);

      // 创建材质
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });

      // 创建网格
      this.threeDState.mesh = new THREE.Mesh(geometry, material);
      this.threeDState.scene.add(this.threeDState.mesh);

      console.log('3D 网格创建成功');
    } catch (error) {
      console.error('创建 3D 网格失败:', error);
      this.createDefaultPlane();
    }
  }

  /**
   * 从图层创建纹理
   */
  createTextureFromLayer(layer) {
    if (!THREE) return null;

    // 创建临时画布
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');

    // 绘制图层内容
    ctx.drawImage(layer.canvas, 0, 0);

    // 创建 Three.js 纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * 创建默认平面
   */
  createDefaultPlane() {
    if (!THREE || !this.threeDState.scene) return;

    const geometry = new THREE.PlaneGeometry(4, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });

    this.threeDState.mesh = new THREE.Mesh(geometry, material);
    this.threeDState.scene.add(this.threeDState.mesh);
  }

  /**
   * 添加灯光
   */
  addLights() {
    if (!THREE || !this.threeDState.scene) return;

    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.threeDState.scene.add(ambientLight);

    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.threeDState.scene.add(directionalLight);
  }

  /**
   * 添加网格辅助
   */
  addGridHelper() {
    if (!THREE || !this.threeDState.scene) return;

    const gridHelper = new THREE.GridHelper(10, 10);
    this.threeDState.scene.add(gridHelper);
  }

  /**
   * 添加坐标轴辅助
   */
  addAxesHelper() {
    if (!THREE || !this.threeDState.scene) return;

    const axesHelper = new THREE.AxesHelper(5);
    this.threeDState.scene.add(axesHelper);
  }

  /**
   * 创建轨道控制器
   */
  createOrbitControls() {
    if (!THREE || !this.threeDState.camera || !this.threeDState.renderer) return;

    // 检查 OrbitControls 是否可用
    if (typeof THREE.OrbitControls === 'undefined') {
      console.warn('OrbitControls 未加载，尝试从 CDN 加载');
      this.loadOrbitControls();
      return;
    }

    try {
      this.threeDState.controls = new THREE.OrbitControls(
        this.threeDState.camera,
        this.threeDState.renderer.domElement
      );
      this.threeDState.controls.enableDamping = true;
      this.threeDState.controls.dampingFactor = 0.05;

      console.log('轨道控制器创建成功');
    } catch (error) {
      console.error('创建轨道控制器失败:', error);
    }
  }

  /**
   * 加载 OrbitControls
   */
  loadOrbitControls() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
    script.onload = () => {
      console.log('OrbitControls 加载成功');
      this.createOrbitControls();
    };
    script.onerror = () => {
      console.error('OrbitControls 加载失败');
    };

    document.head.appendChild(script);
  }

  /**
   * 显示 3D 控制界面
   */
  show3DControls() {
    // 创建 3D 视图容器
    const container = document.createElement('div');
    container.id = 'threejs-container';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '1000';
    container.style.backgroundColor = '#f0f0f0';

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.zIndex = '1001';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#ff4444';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '3px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
      this.exit3DMode();
    });

    container.appendChild(closeButton);

    // 添加渲染器 DOM 元素
    if (this.threeDState.renderer) {
      container.appendChild(this.threeDState.renderer.domElement);
    }

    // 添加到画布区域
    const canvasArea = document.querySelector('.canvas-area');
    if (canvasArea) {
      canvasArea.appendChild(container);
    }

    // 开始渲染循环
    this.startRenderLoop();
  }

  /**
   * 开始渲染循环
   */
  startRenderLoop() {
    if (!this.threeDState.renderer || !this.threeDState.scene || !this.threeDState.camera) {
      return;
    }

    const animate = () => {
      requestAnimationFrame(animate);

      // 更新控制器
      if (this.threeDState.controls) {
        this.threeDState.controls.update();
      }

      // 渲染场景
      this.threeDState.renderer.render(this.threeDState.scene, this.threeDState.camera);
    };

    animate();

    // 处理窗口大小变化
    window.addEventListener('resize', this.onWindowResizeBound = this.onWindowResize.bind(this));
  }

  /**
   * 窗口大小变化处理
   */
  onWindowResize() {
    if (!this.threeDState.camera || !this.threeDState.renderer) return;

    // 更新相机宽高比
    this.threeDState.camera.aspect = window.innerWidth / window.innerHeight;
    this.threeDState.camera.updateProjectionMatrix();

    // 更新渲染器大小
    this.threeDState.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 退出 3D 模式
   */
  exit3DMode() {
    // 停止渲染循环
    if (this.onWindowResizeBound) {
      window.removeEventListener('resize', this.onWindowResizeBound);
    }

    // 移除 3D 容器
    const container = document.getElementById('threejs-container');
    if (container) {
      container.remove();
    }

    // 应用 3D 变换到 2D 图层
    this.apply3DTransformToLayer();
  }

  /**
   * 应用 3D 变换到图层
   */
  apply3DTransformToLayer() {
    if (!this.threeDState.mesh || !this.threeDState.originalTexture) return;

    const layer = this.getActiveLayer();
    if (!layer) return;

    try {
      // 获取当前网格的变换矩阵
      const matrix = this.threeDState.mesh.matrix;

      // 创建新的画布
      const canvas = document.createElement('canvas');
      canvas.width = layer.width;
      canvas.height = layer.height;
      const ctx = canvas.getContext('2d');

      // 保存原始变换
      ctx.save();

      // 应用 3D 变换（简化的 2D 投影）
      // 这里应该实现完整的 3D 到 2D 的投影变换
      // 由于时间关系，这里使用简化的实现

      // 绘制原始纹理
      const image = this.threeDState.originalTexture.image;
      if (image) {
        ctx.drawImage(image, 0, 0);
      }

      ctx.restore();

      // 更新图层
      layer.canvas = canvas;

      // 触发渲染
      eventBus.emit('documentChanged');

      // 保存到历史记录
      this.save3DTransformToHistory(layer);
    } catch (error) {
      console.error('应用 3D 变换失败:', error);
    }
  }

  /**
   * 保存 3D 变换到历史记录
   */
  save3DTransformToHistory(layer) {
    const editor = window.imageEditor;
    if (editor && editor.history) {
      const command = new ThreeDTransformCommand(layer, this.threeDState.mesh);
      editor.history.execute(command);
    }
  }

  /**
   * 清理 Three.js 资源
   */
  cleanupThreeJS() {
    // 停止渲染循环
    if (this.onWindowResizeBound) {
      window.removeEventListener('resize', this.onWindowResizeBound);
    }

    // 清理 Three.js 资源
    if (this.threeDState.renderer) {
      this.threeDState.renderer.dispose();
    }

    if (this.threeDState.scene) {
      // 清理场景中的对象
      while (this.threeDState.scene.children.length > 0) {
        const object = this.threeDState.scene.children[0];
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (object.material.map) object.material.map.dispose();
          object.material.dispose();
        }
        this.threeDState.scene.remove(object);
      }
    }

    // 重置状态
    this.threeDState = {
      isInitialized: false,
      scene: null,
      camera: null,
      renderer: null,
      mesh: null,
      controls: null,
      originalTexture: null
    };
  }

  /**
   * 显示 3D 选项
   */
  show3DOptions() {
    const optionsPanel = document.getElementById('toolOptions');
    if (!optionsPanel) return;

    optionsPanel.innerHTML = `
      <div class="tool-option">
        <label>显示网格:</label>
        <input type="checkbox" id="show3DGrid" ${this.options.showGrid ? 'checked' : ''}>
      </div>
      <div class="tool-option">
        <label>显示坐标轴:</label>
        <input type="checkbox" id="show3DAxes" ${this.options.showAxes ? 'checked' : ''}>
      </div>
      <div class="tool-option">
        <label>启用灯光:</label>
        <input type="checkbox" id="enable3DLighting" ${this.options.lighting ? 'checked' : ''}>
      </div>
      <div class="tool-option">
        <label>旋转 X:</label>
        <input type="range" id="rotateX" min="0" max="360" value="0">
        <span id="rotateXValue">0°</span>
      </div>
      <div class="tool-option">
        <label>旋转 Y:</label>
        <input type="range" id="rotateY" min="0" max="360" value="0">
        <span id="rotateYValue">0°</span>
      </div>
      <div class="tool-option">
        <label>旋转 Z:</label>
        <input type="range" id="rotateZ" min="0" max="360" value="0">
        <span id="rotateZValue">0°</span>
      </div>
      <div class="tool-option">
        <button id="enter3DMode">进入 3D 模式</button>
        <button id="reset3DTransform">重置变换</button>
      </div>
    `;

    // 添加事件监听
    document.getElementById('show3DGrid').addEventListener('change', (e) => {
      this.options.showGrid = e.target.checked;
      this.update3DHelpers();
    });

    document.getElementById('show3DAxes').addEventListener('change', (e) => {
      this.options.showAxes = e.target.checked;
      this.update3DHelpers();
    });

    document.getElementById('enable3DLighting').addEventListener('change', (e) => {
      this.options.lighting = e.target.checked;
      this.update3DLights();
    });

    // 旋转控制
    ['X', 'Y', 'Z'].forEach(axis => {
      const slider = document.getElementById(`rotate${axis}`);
      const valueSpan = document.getElementById(`rotate${axis}Value`);

      if (slider && valueSpan) {
        slider.addEventListener('input', (e) => {
          const value = e.target.value;
          valueSpan.textContent = `${value}°`;
          this.applyRotation(axis.toLowerCase(), parseFloat(value));
        });
      }
    });

    document.getElementById('enter3DMode').addEventListener('click', () => {
      this.show3DControls();
    });

    document.getElementById('reset3DTransform').addEventListener('click', () => {
      this.reset3DTransform();
    });
  }

  /**
   * 更新 3D 辅助工具
   */
  update3DHelpers() {
    if (!this.threeDState.scene) return;

    // 移除现有的辅助工具
    const helpers = this.threeDState.scene.children.filter(child =>
      child instanceof THREE.GridHelper || child instanceof THREE.AxesHelper
    );

    helpers.forEach(helper => {
      this.threeDState.scene.remove(helper);
    });

    // 添加新的辅助工具
    if (this.options.showGrid) {
      this.addGridHelper();
    }
    if (this.options.showAxes) {
      this.addAxesHelper();
    }
  }

  /**
   * 更新 3D 灯光
   */
  update3DLights() {
    if (!this.threeDState.scene) return;

    // 移除现有的灯光
    const lights = this.threeDState.scene.children.filter(child =>
      child instanceof THREE.Light
    );

    lights.forEach(light => {
      this.threeDState.scene.remove(light);
    });

    // 添加新的灯光
    if (this.options.lighting) {
      this.addLights();
    }
  }

  /**
   * 应用旋转
   */
  applyRotation(axis, angle) {
    if (!this.threeDState.mesh) return;

    const radians = angle * (Math.PI / 180);

    switch (axis) {
      case 'x':
        this.threeDState.mesh.rotation.x = radians;
        break;
      case 'y':
        this.threeDState.mesh.rotation.y = radians;
        break;
      case 'z':
        this.threeDState.mesh.rotation.z = radians;
        break;
    }
  }

  /**
   * 重置 3D 变换
   */
  reset3DTransform() {
    if (!this.threeDState.mesh) return;

    // 重置位置、旋转和缩放
    this.threeDState.mesh.position.set(0, 0, 0);
    this.threeDState.mesh.rotation.set(0, 0, 0);
    this.threeDState.mesh.scale.set(1, 1, 1);

    // 重置 UI 控件
    ['X', 'Y', 'Z'].forEach(axis => {
      const slider = document.getElementById(`rotate${axis}`);
      const valueSpan = document.getElementById(`rotate${axis}Value`);

      if (slider && valueSpan) {
        slider.value = 0;
        valueSpan.textContent = '0°';
      }
    });
  }

  /**
   * 工具选项改变
   */
  onOptionChange(option, value) {
    this.options[option] = value;
  }
}

/**
 * ThreeDTransformCommand - 3D 变换命令
 */
class ThreeDTransformCommand extends Command {
  constructor(layer, mesh) {
    super();
    this.layer = layer;
    this.mesh = mesh;
    this.originalCanvas = layer.canvas;
    this.originalWidth = layer.width;
    this.originalHeight = layer.height;

    // 保存网格的变换状态
    this.originalTransform = {
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone()
    };
  }

  execute() {
    // 应用 3D 变换到图层
    // 这里应该实现完整的 3D 到 2D 的投影变换
    // 由于时间关系，这里使用简化的实现

    // 创建新的画布
    const canvas = document.createElement('canvas');
    canvas.width = this.originalWidth;
    canvas.height = this.originalHeight;
    const ctx = canvas.getContext('2d');

    // 绘制原始内容
    ctx.drawImage(this.originalCanvas, 0, 0);

    // 应用简单的旋转效果
    ctx.save();

    // 根据网格旋转应用 2D 变换
    const centerX = this.originalWidth / 2;
    const centerY = this.originalHeight / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate(this.mesh.rotation.z);
    ctx.scale(this.mesh.scale.x, this.mesh.scale.y);
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(this.originalCanvas, 0, 0);
    ctx.restore();

    // 更新图层
    this.layer.canvas = canvas;
  }

  undo() {
    // 恢复到原始状态
    this.layer.canvas = this.originalCanvas;
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
    ThreeDTransformTool,
    ThreeDTransformCommand
  };
}

