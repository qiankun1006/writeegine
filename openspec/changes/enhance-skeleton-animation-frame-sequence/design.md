# 动画帧序列编辑器 - 技术设计文档

## 上下文
当前项目已经有一个正在开发的2D骨骼动画系统（`add-2d-skeleton-animation`变更），但用户需要在游戏素材创作页面中直接访问一个完整的动画帧序列编辑器。这个编辑器需要提供丰富的动画编辑功能，并与现有的骨骼动画系统深度集成。

## 目标 / 非目标

### 目标
1. 在 `create-game-asset.html` 页面的【一、角色相关】下提供完整的动画帧序列编辑器
2. 集成现有的骨骼动画核心功能
3. 提供进阶的动画编辑工具（多段插值、骨骼镜像、动画片段管理）
4. 支持资源导入导出（PNG、JSON、PNG序列、GIF）
5. 实现本地存储和项目管理
6. 提供精准编辑工具（数值微调、吸附功能、撤销重做）
7. 遵循模块化设计和性能优化原则

### 非目标
1. 不重新实现现有的骨骼动画核心功能
2. 不支持3D骨骼动画
3. 不实现复杂的物理模拟
4. 不提供云端协作编辑（后续迭代考虑）

## 架构设计

### 整体架构
```
游戏素材创作页面 (create-game-asset.html)
    ├── 动画帧序列编辑器面板
    │   ├── 编辑器核心 (FrameSequenceEditor.js)
    │   ├── 骨骼管理模块 (集成现有)
    │   ├── 帧管理模块 (FrameManager.js)
    │   ├── 动画播放模块 (集成现有)
    │   ├── 资源管理模块 (ResourceManager.js)
    │   ├── 本地存储模块 (StorageManager.js)
    │   └── UI组件模块 (UIComponents.js)
    └── 其他素材编辑器面板
```

### 模块职责

#### 1. FrameSequenceEditor (编辑器核心)
- 负责编辑器整体协调和初始化
- 管理各模块之间的通信
- 处理用户界面事件分发
- 维护编辑器状态

#### 2. 骨骼管理模块 (集成现有)
- 复用现有的骨骼系统核心功能
- 提供骨骼创建、编辑、删除接口
- 处理骨骼层级关系和变换计算
- 集成正向动力学（FK）系统

#### 3. FrameManager (帧管理模块)
- 管理动画时间轴和关键帧
- 处理帧率（FPS）设置和帧计算
- 实现关键帧插值（线性、缓入缓出）
- 管理动画片段（行走、攻击、待机等）

#### 4. 动画播放模块 (集成现有)
- 复用现有的动画播放器
- 提供播放、暂停、停止控制
- 处理动画循环和速度调整
- 实时更新骨骼变换

#### 5. ResourceManager (资源管理模块)
- 处理PNG纹理导入和绑定
- 实现JSON格式导入导出
- 生成PNG序列帧
- 编码GIF动画（简易实现）

#### 6. StorageManager (本地存储模块)
- 实现自动保存到localStorage
- 管理多个项目（命名、删除、切换）
- 处理数据压缩和序列化
- 提供导入导出文件功能

#### 7. UIComponents (UI组件模块)
- 提供可复用的UI组件
- 时间轴组件
- 骨骼树组件
- 属性编辑器组件
- 工具栏组件

## 关键技术决策

### 决策1：复用现有骨骼动画系统
**决策**：复用正在开发的2D骨骼动画系统，而不是重新实现。
**理由**：
- 避免重复工作，提高开发效率
- 保持系统一致性
- 可以利用已经完成的核心功能
- 减少维护成本

**替代方案考虑**：
- 重新实现：开发周期长，容易引入不一致性
- 使用第三方库：集成成本高，可能不符合项目需求

### 决策2：模块化设计
**决策**：采用高度模块化的设计，每个功能模块独立。
**理由**：
- 提高代码可维护性
- 便于单元测试
- 支持功能扩展
- 降低耦合度

**实现方式**：
- 每个模块有清晰的接口定义
- 使用事件总线进行模块间通信
- 支持模块热插拔

### 决策3：性能优化策略
**决策**：采用离屏Canvas渲染和插值预计算。
**理由**：
- 骨骼动画渲染计算量大
- 需要保证编辑和播放的流畅性
- 避免实时计算导致的卡顿

**具体实现**：
- 使用离屏Canvas预渲染骨骼和纹理
- 关键帧插值结果提前计算缓存
- 渲染帧率稳定控制

### 决策4：本地存储方案
**决策**：使用localStorage + 项目文件导出。
**理由**：
- localStorage提供快速本地存储
- 项目文件导出支持备份和分享
- 自动保存防止数据丢失

**数据格式**：
```json
{
  "version": "1.0",
  "project": {
    "name": "角色动画",
    "created": "2026-03-02T10:30:00Z",
    "modified": "2026-03-02T11:45:00Z"
  },
  "skeleton": { /* 骨骼数据 */ },
  "animations": [
    {
      "name": "行走",
      "fps": 24,
      "frames": 60,
      "keyframes": [ /* 关键帧数据 */ ]
    }
  ],
  "textures": [ /* 纹理数据 */ ]
}
```

## 详细设计

### 1. 编辑器核心类设计

```javascript
/**
 * 动画帧序列编辑器核心类
 * 使用说明：负责协调骨骼动画编辑器的所有模块
 */
class FrameSequenceEditor {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // 离屏Canvas用于预渲染
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    // 初始化各模块
    this.skeletonManager = new SkeletonManager();
    this.frameManager = new FrameManager();
    this.animationPlayer = new AnimationPlayer();
    this.resourceManager = new ResourceManager();
    this.storageManager = new StorageManager();
    this.uiComponents = new UIComponents();

    // 编辑器状态
    this.state = {
      currentTime: 0,
      isPlaying: false,
      selectedBone: null,
      selectedKeyframe: null,
      zoomLevel: 1.0,
      gridVisible: true,
      snapEnabled: true
    };

    // 事件总线
    this.eventBus = new EventBus();

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupModules();
    this.loadLastProject();
    this.startRenderLoop();
  }

  // ... 其他方法
}
```

### 2. 帧管理模块设计

```javascript
/**
 * 帧管理模块
 * 使用说明：管理动画时间轴、关键帧和插值计算
 */
class FrameManager {
  constructor() {
    this.fps = 24; // 默认帧率
    this.totalFrames = 60; // 默认总帧数
    this.currentFrame = 0;

    // 动画片段管理
    this.animations = new Map();
    this.currentAnimation = 'idle';

    // 关键帧数据
    this.keyframes = new Map(); // boneId -> [keyframe1, keyframe2, ...]

    // 插值缓存
    this.interpolationCache = new Map();
  }

  /**
   * 添加关键帧
   * @param {number} frame - 帧号
   * @param {string} boneId - 骨骼ID
   * @param {object} transform - 变换数据
   * @param {string} interpolation - 插值类型
   */
  addKeyframe(frame, boneId, transform, interpolation = 'linear') {
    if (!this.keyframes.has(boneId)) {
      this.keyframes.set(boneId, []);
    }

    const keyframe = {
      frame,
      transform,
      interpolation,
      id: `keyframe_${Date.now()}_${Math.random()}`
    };

    this.keyframes.get(boneId).push(keyframe);
    this.keyframes.get(boneId).sort((a, b) => a.frame - b.frame);

    // 清除缓存
    this.interpolationCache.delete(boneId);

    return keyframe;
  }

  /**
   * 计算插值
   * @param {number} currentFrame - 当前帧
   * @param {string} boneId - 骨骼ID
   * @returns {object} 插值后的变换数据
   */
  interpolate(currentFrame, boneId) {
    // 检查缓存
    const cacheKey = `${boneId}_${currentFrame}`;
    if (this.interpolationCache.has(cacheKey)) {
      return this.interpolationCache.get(cacheKey);
    }

    const keyframes = this.keyframes.get(boneId) || [];
    if (keyframes.length === 0) {
      return null;
    }

    // 查找前后关键帧
    let prevKeyframe = null;
    let nextKeyframe = null;

    for (const kf of keyframes) {
      if (kf.frame <= currentFrame) {
        prevKeyframe = kf;
      }
      if (kf.frame >= currentFrame && !nextKeyframe) {
        nextKeyframe = kf;
      }
    }

    // 计算插值
    let result;
    if (!prevKeyframe || !nextKeyframe) {
      result = prevKeyframe ? prevKeyframe.transform : nextKeyframe.transform;
    } else if (prevKeyframe.frame === nextKeyframe.frame) {
      result = prevKeyframe.transform;
    } else {
      const t = (currentFrame - prevKeyframe.frame) /
                (nextKeyframe.frame - prevKeyframe.frame);

      switch (prevKeyframe.interpolation) {
        case 'linear':
          result = this.linearInterpolation(prevKeyframe.transform, nextKeyframe.transform, t);
          break;
        case 'easeInOut':
          result = this.easeInOutInterpolation(prevKeyframe.transform, nextKeyframe.transform, t);
          break;
        case 'step':
          result = prevKeyframe.transform;
          break;
        default:
          result = this.linearInterpolation(prevKeyframe.transform, nextKeyframe.transform, t);
      }
    }

    // 缓存结果
    this.interpolationCache.set(cacheKey, result);

    return result;
  }

  /**
   * 线性插值
   */
  linearInterpolation(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      rotation: a.rotation + (b.rotation - a.rotation) * t,
      scaleX: a.scaleX + (b.scaleX - a.scaleX) * t,
      scaleY: a.scaleY + (b.scaleY - a.scaleY) * t
    };
  }

  /**
   * 缓入缓出插值
   */
  easeInOutInterpolation(a, b, t) {
    // 使用三次贝塞尔曲线实现缓入缓出
    const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    return this.linearInterpolation(a, b, easeT);
  }
}
```

### 3. 资源管理模块设计

```javascript
/**
 * 资源管理模块
 * 使用说明：处理纹理导入和动画导出
 */
class ResourceManager {
  constructor() {
    this.textures = new Map(); // boneId -> texture data
    this.exportQueue = [];
    this.isExporting = false;
  }

  /**
   * 导入PNG纹理
   * @param {File} file - PNG文件
   * @param {string} boneId - 绑定的骨骼ID
   * @returns {Promise} 导入结果
   */
  async importPNGTexture(file, boneId) {
    return new Promise((resolve, reject) => {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        reject(new Error('请选择图片文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const texture = {
            image: img,
            width: img.width,
            height: img.height,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            scale: 1.0,
            opacity: 1.0,
            boneId: boneId
          };

          this.textures.set(boneId, texture);
          resolve(texture);
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 导出为JSON
   * @param {object} projectData - 项目数据
   * @returns {string} JSON字符串
   */
  exportToJSON(projectData) {
    const exportData = {
      version: '1.0',
      metadata: {
        exportDate: new Date().toISOString(),
        tool: 'FrameSequenceEditor'
      },
      project: projectData.project,
      skeleton: this.serializeSkeleton(projectData.skeleton),
      animations: this.serializeAnimations(projectData.animations),
      textures: this.serializeTextures(projectData.textures)
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导出为PNG序列帧
   * @param {object} projectData - 项目数据
   * @param {number} startFrame - 起始帧
   * @param {number} endFrame - 结束帧
   * @returns {Promise} 导出进度
   */
  async exportToPNGSequence(projectData, startFrame = 0, endFrame = 60) {
    const totalFrames = endFrame - startFrame + 1;
    const zip = new JSZip();

    for (let frame = startFrame; frame <= endFrame; frame++) {
      // 渲染当前帧
      const canvas = await this.renderFrame(projectData, frame);

      // 转换为PNG数据URL
      const pngData = canvas.toDataURL('image/png');
      const base64Data = pngData.split(',')[1];

      // 添加到ZIP
      zip.file(`frame_${frame.toString().padStart(4, '0')}.png`, base64Data, { base64: true });

      // 更新进度
      const progress = ((frame - startFrame + 1) / totalFrames) * 100;
      this.emit('exportProgress', { type: 'png', frame, progress });
    }

    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  }

  /**
   * 导出为GIF
   * @param {object} projectData - 项目数据
   * @param {number} fps - 帧率
   * @returns {Promise} GIF Blob
   */
  async exportToGIF(projectData, fps = 24) {
    // 使用简易GIF编码器
    const gif = new GIFEncoder();
    gif.setRepeat(0); // 无限循环
    gif.setDelay(1000 / fps); // 帧延迟
    gif.start();

    const totalFrames = projectData.animations[0]?.frames || 60;

    for (let frame = 0; frame < totalFrames; frame++) {
      // 渲染当前帧
      const canvas = await this.renderFrame(projectData, frame);

      // 添加到GIF
      gif.addFrame(canvas.getContext('2d'));

      // 更新进度
      const progress = ((frame + 1) / totalFrames) * 100;
      this.emit('exportProgress', { type: 'gif', frame, progress });
    }

    gif.finish();
    const gifBlob = gif.getBlob();
    return gifBlob;
  }
}
```

### 4. 本地存储模块设计

```javascript
/**
 * 本地存储模块
 * 使用说明：管理项目自动保存和加载
 */
class StorageManager {
  constructor() {
    this.storageKey = 'frameSequenceProjects';
    this.currentProjectId = null;
    this.autoSaveInterval = 30000; // 30秒
    this.autoSaveTimer = null;

    this.init();
  }

  init() {
    // 确保存储结构存在
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({
        version: '1.0',
        projects: {},
        lastModified: Date.now()
      }));
    }

    // 开始自动保存定时器
    this.startAutoSave();
  }

  /**
   * 开始自动保存
   */
  startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      if (this.currentProjectId) {
        this.autoSaveCurrentProject();
      }
    }, this.autoSaveInterval);
  }

  /**
   * 自动保存当前项目
   */
  autoSaveCurrentProject() {
    try {
      const projectData = this.getCurrentProjectData();
      if (projectData) {
        this.saveProject(this.currentProjectId, projectData);
        console.log('✅ 项目已自动保存');
      }
    } catch (error) {
      console.error('自动保存失败:', error);
    }
  }

  /**
   * 保存项目
   * @param {string} projectId - 项目ID
   * @param {object} data - 项目数据
   */
  saveProject(projectId, data) {
    const storage = JSON.parse(localStorage.getItem(this.storageKey));

    // 压缩数据（移除base64图片等大对象）
    const compressedData = this.compressData(data);

    storage.projects[projectId] = {
      ...compressedData,
      id: projectId,
      name: data.project?.name || `未命名项目_${projectId}`,
      thumbnail: this.generateThumbnail(data),
      lastModified: Date.now(),
      created: storage.projects[projectId]?.created || Date.now()
    };

    storage.lastModified = Date.now();
    localStorage.setItem(this.storageKey, JSON.stringify(storage));

    return projectId;
  }

  /**
   * 加载项目
   * @param {string} projectId - 项目ID
   * @returns {object} 项目数据
   */
  loadProject(projectId) {
    const storage = JSON.parse(localStorage.getItem(this.storageKey));
    const project = storage.projects[projectId];

    if (!project) {
      throw new Error(`项目 ${projectId} 不存在`);
    }

    // 解压数据
    const decompressedData = this.decompressData(project);

    this.currentProjectId = projectId;
    return decompressedData;
  }

  /**
   * 获取项目列表
   * @returns {Array} 项目列表
   */
  getProjectList() {
    const storage = JSON.parse(localStorage.getItem(this.storageKey));
    return Object.values(storage.projects).map(project => ({
      id: project.id,
      name: project.name,
      thumbnail: project.thumbnail,
      lastModified: project.lastModified,
      created: project.created
    })).sort((a, b) => b.lastModified - a.lastModified);
  }

  /**
   * 删除项目
   * @param {string} projectId - 项目ID
   */
  deleteProject(projectId) {
    const storage = JSON.parse(localStorage.getItem(this.storageKey));
    delete storage.projects[projectId];
    storage.lastModified = Date.now();
    localStorage.setItem(this.storageKey, JSON.stringify(storage));

    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
    }
  }

  /**
   * 数据压缩（移除大对象）
   */
  compressData(data) {
    const compressed = { ...data };

    // 移除base64图片数据，只保留引用
    if (compressed.textures) {
      compressed.textures = compressed.textures.map(texture => ({
        ...texture,
        image: texture.image ? '[IMAGE_DATA_REMOVED]' : null
      }));
    }

    return compressed;
  }

  /**
   * 数据解压
   */
  decompressData(compressedData) {
    // 实际实现中可能需要重新加载图片等资源
    return { ...compressedData };
  }

  /**
   * 生成项目缩略图
   */
  generateThumbnail(data) {
    // 生成项目缩略图（简化实现）
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    // 绘制简单预览
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 100, 100);

    // 如果有骨骼，绘制简单示意
    if (data.skeleton && data.skeleton.bones) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      // 简单绘制骨骼树
    }

    return canvas.toDataURL('image/png');
  }
}
```

### 5. UI组件模块设计

```javascript
/**
 * UI组件模块
 * 使用说明：提供可复用的UI组件
 */
class UIComponents {
  constructor() {
    this.components = new Map();
  }

  /**
   * 创建时间轴组件
   */
  createTimeline(options = {}) {
    const timeline = {
      element: document.createElement('div'),
      config: {
        fps: options.fps || 24,
        totalFrames: options.totalFrames || 60,
        currentFrame: options.currentFrame || 0,
        height: options.height || 120
      },
      render() {
        // 渲染时间轴
        this.element.className = 'timeline-component';
        this.element.innerHTML = `
          <div class="timeline-header">
            <span>时间轴</span>
            <div class="timeline-controls">
              <button class="zoom-in">🔍+</button>
              <button class="zoom-out">🔍-</button>
              <span>FPS: <input type="number" value="${this.config.fps}" min="1" max="60"></span>
            </div>
          </div>
          <div class="timeline-body">
            <div class="timeline-ruler"></div>
            <div class="timeline-playhead"></div>
            <div class="timeline-tracks"></div>
          </div>
        `;

        // 添加事件监听
        this.setupEventListeners();
      },
      setupEventListeners() {
        // 实现时间轴事件处理
      },
      update(currentFrame) {
        this.config.currentFrame = currentFrame;
        // 更新播放头位置
      }
    };

    timeline.render();
    return timeline;
  }

  /**
   * 创建骨骼树组件
   */
  createBoneTree(skeletonData) {
    const boneTree = {
      element: document.createElement('div'),
      skeleton: skeletonData,
      selectedBone: null,
      render() {
        this.element.className = 'bone-tree-component';
        this.element.innerHTML = `
          <div class="bone-tree-header">
            <h4>骨骼层级</h4>
            <div class="bone-tree-controls">
              <button class="add-bone">➕ 添加骨骼</button>
              <button class="delete-bone">🗑️ 删除</button>
            </div>
          </div>
          <div class="bone-tree-body">
            <ul class="bone-tree-list">
              ${this.renderBoneList(this.skeleton.rootBones)}
            </ul>
          </div>
        `;

        this.setupEventListeners();
      },
      renderBoneList(bones, level = 0) {
        let html = '';
        for (const bone of bones) {
          const indent = '  '.repeat(level);
          const hasChildren = bone.children && bone.children.length > 0;

          html += `
            <li class="bone-item ${this.selectedBone === bone.id ? 'selected' : ''}"
                data-bone-id="${bone.id}">
              <div class="bone-item-content">
                <span class="bone-toggle">${hasChildren ? '▶' : '•'}</span>
                <span class="bone-name">${bone.name}</span>
                <span class="bone-actions">
                  <button class="rename-bone" title="重命名">✏️</button>
                  <button class="mirror-bone" title="镜像">🪞</button>
                </span>
              </div>
              ${hasChildren ? `
                <ul class="bone-children">
                  ${this.renderBoneList(bone.children, level + 1)}
                </ul>
              ` : ''}
            </li>
          `;
        }
        return html;
      },
      setupEventListeners() {
        // 实现骨骼树事件处理
      }
    };

    boneTree.render();
    return boneTree;
  }

  /**
   * 创建属性编辑器组件
   */
  createPropertyEditor(selectedObject) {
    const propertyEditor = {
      element: document.createElement('div'),
      target: selectedObject,
      render() {
        this.element.className = 'property-editor-component';

        if (!this.target) {
          this.element.innerHTML = '<p>未选择任何对象</p>';
          return;
        }

        let properties = [];

        if (this.target.type === 'bone') {
          properties = [
            { label: '名称', type: 'text', key: 'name', value: this.target.name },
            { label: '位置 X', type: 'number', key: 'x', value: this.target.x, step: 0.1 },
            { label: '位置 Y', type: 'number', key: 'y', value: this.target.y, step: 0.1 },
            { label: '旋转', type: 'number', key: 'rotation', value: this.target.rotation, step: 0.1, unit: '°' },
            { label: '缩放 X', type: 'number', key: 'scaleX', value: this.target.scaleX, step: 0.1 },
            { label: '缩放 Y', type: 'number', key: 'scaleY', value: this.target.scaleY, step: 0.1 }
          ];
        } else if (this.target.type === 'keyframe') {
          properties = [
            { label: '帧号', type: 'number', key: 'frame', value: this.target.frame, min: 0 },
            { label: '插值类型', type: 'select', key: 'interpolation', value: this.target.interpolation,
              options: ['linear', 'easeInOut', 'step'] }
          ];
        }

        this.element.innerHTML = `
          <div class="property-editor-header">
            <h4>属性编辑</h4>
            <span class="property-target">${this.target.name || this.target.type}</span>
          </div>
          <div class="property-editor-body">
            <form class="property-form">
              ${properties.map(prop => this.renderPropertyField(prop)).join('')}
            </form>
          </div>
        `;

        this.setupEventListeners();
      },
      renderPropertyField(prop) {
        let inputHtml = '';

        switch (prop.type) {
          case 'text':
            inputHtml = `<input type="text" value="${prop.value}" data-key="${prop.key}">`;
            break;
          case 'number':
            inputHtml = `
              <input type="number"
                     value="${prop.value}"
                     data-key="${prop.key}"
                     ${prop.step ? `step="${prop.step}"` : ''}
                     ${prop.min !== undefined ? `min="${prop.min}"` : ''}
                     ${prop.max !== undefined ? `max="${prop.max}"` : ''}>
              ${prop.unit ? `<span class="property-unit">${prop.unit}</span>` : ''}
            `;
            break;
          case 'select':
            const options = prop.options.map(opt =>
              `<option value="${opt}" ${opt === prop.value ? 'selected' : ''}>${opt}</option>`
            ).join('');
            inputHtml = `<select data-key="${prop.key}">${options}</select>`;
            break;
        }

        return `
          <div class="property-field">
            <label>${prop.label}</label>
            <div class="property-input">
              ${inputHtml}
            </div>
          </div>
        `;
      },
      setupEventListeners() {
        // 实现属性编辑事件处理
      }
    };

    propertyEditor.render();
    return propertyEditor;
  }
}
```

## 风险与权衡

### 风险1：性能问题
**风险**：复杂的骨骼动画和实时渲染可能导致性能问题。
**缓解措施**：
- 使用离屏Canvas预渲染
- 实现插值结果缓存
- 限制同时显示的骨骼数量
- 添加性能监控和警告

### 风险2：浏览器兼容性
**风险**：某些功能（如GIF编码）可能在不同浏览器中表现不一致。
**缓解措施**：
- 使用广泛支持的Web API
- 为高级功能提供降级方案
- 进行多浏览器测试
- 提供功能检测和提示

### 风险3：数据丢失
**风险**：localStorage有大小限制，复杂项目可能无法完全保存。
**缓解措施**：
- 实现数据压缩和清理
- 提供项目文件导出功能
- 添加存储空间警告
- 实现增量保存

### 风险4：用户体验复杂性
**风险**：功能过多可能导致界面复杂，用户难以学习。
**缓解措施**：
- 提供逐步引导教程
- 实现界面简化模式
- 添加工具提示和帮助文档
- 进行用户测试和反馈收集

## 迁移计划

### 步骤1：基础集成
1. 修改 `create-game-asset.html`，添加菜单项和面板
2. 创建基础编辑器框架
3. 集成现有的骨骼动画核心模块

### 步骤2：功能开发
1. 实现骨骼编辑和帧管理基础功能
2. 添加动画预览和播放控制
3. 实现资源导入导出功能

### 步骤3：进阶功能
1. 添加本地存储和项目管理
2. 实现精准编辑工具
3. 完善错误处理和用户体验

### 步骤4：优化和测试
1. 进行性能优化
2. 编写测试用例
3. 进行兼容性测试
4. 收集用户反馈并改进

### 回滚计划
如果遇到严重问题：
1. 恢复 `create-game-asset.html` 到原始状态
2. 移除新增的JavaScript文件
3. 清理localStorage中的测试数据
4. 验证原有功能正常工作

## 开放问题

1. **GIF编码性能**：内置GIF编码器可能性能较差，是否需要使用Web Worker？
2. **纹理管理**：大量高分辨率纹理可能导致内存问题，如何优化？
3. **撤销重做粒度**：应该记录哪些操作的撤销重做？操作粒度如何定义？
4. **协作编辑**：未来是否需要支持多用户实时协作？如何设计架构？

## 扩展说明

### 如何添加新的插值方式
1. 在 `FrameManager` 类中添加新的插值方法
2. 在 `interpolate` 方法中添加对新插值类型的支持
3. 在UI中提供新的插值选项
4. 更新序列化和反序列化逻辑

示例：
```javascript
// 添加弹性插值
elasticInterpolation(a, b, t) {
  const c = 5; // 弹性系数
  const ts = t * t;
  const tc = ts * t;
  const easeT = tc * ts + c * (tc - ts);
  return this.linearInterpolation(a, b, easeT);
}
```

### 如何添加新的导出格式
1. 在 `ResourceManager` 类中添加新的导出方法
2. 实现格式特定的编码逻辑
3. 在UI中添加导出选项
4. 更新导出进度和错误处理

### 如何扩展骨骼约束系统
1. 在骨骼数据模型中添加约束属性
2. 在变换计算中应用约束
3. 创建约束编辑UI
4. 更新序列化和预览逻辑

