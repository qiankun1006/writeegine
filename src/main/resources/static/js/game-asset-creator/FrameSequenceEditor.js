/**
 * FrameSequenceEditor.js - 骨骼动画帧序列编辑器初始化
 *
 * 这个文件负责在游戏素材创作页面中初始化骨骼动画编辑器
 */

(function() {
  'use strict';

  /**
   * 简单的图像编辑器适配器
   * 用于为骨骼动画编辑器提供必要的接口
   */
  class ImageEditorAdapter {
    constructor(canvasId) {
      // 初始化工具管理器
      this.toolManager = {
        tools: {},
        register: function(name, tool) {
          this.tools[name] = tool;
        },
        getTool: function(name) {
          return this.tools[name];
        }
      };
      this.tools = this.toolManager;

      // 初始化渲染器
      this.renderer = {
        render: () => {
          // 骨骼动画编辑器会自己处理渲染
          if (window.skeletonEditor && window.skeletonEditor._renderCanvas) {
            window.skeletonEditor._renderCanvas();
          }
        }
      };

      // 如果提供了 canvasId，则尝试获取 canvas
      if (canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
          console.error('Canvas not found:', canvasId);
          return;
        }
        this.ctx = this.canvas.getContext('2d');
      }
    }
  }

  /**
   * 初始化骨骼动画帧序列编辑器
   */
  function initFrameSequenceEditor() {
    console.log('🎬 初始化骨骼动画帧序列编辑器...');

    // 检查必要的类是否已加载
    if (typeof SkeletonAnimationEditor === 'undefined') {
      console.error('❌ SkeletonAnimationEditor 类未找到，请确保骨骼动画系统脚本已正确加载');
      return;
    }

    // 检查容器是否存在
    const container = document.getElementById('skeleton-animation-editor');
    if (!container) {
      console.error('❌ 骨骼动画编辑器容器不存在');
      return;
    }

    // 创建适配器
    const adapter = new ImageEditorAdapter(null);

    // 创建骨骼动画编辑器实例
    try {
      window.skeletonEditor = new SkeletonAnimationEditor(adapter);

      // 修改编辑器的初始化行为，使其不在 body 中创建容器
      // 而是使用我们提供的容器
      window.skeletonEditor._createPanelContainer = function() {
        // 清空现有容器
        this.panelContainer = container;

        // 创建编辑器UI结构
        container.innerHTML = `
          <div class="skeleton-editor-toolbar">
            <div class="toolbar-group">
              <button id="skeleton-new-bone" title="新建骨骼">🦴 新建骨骼</button>
              <button id="skeleton-delete-bone" title="删除骨骼">🗑️ 删除</button>
              <button id="skeleton-mirror-horizontal" title="水平镜像">↔️ 水平镜像</button>
              <button id="skeleton-mirror-vertical" title="垂直镜像">↕️ 垂直镜像</button>
            </div>
            <div class="toolbar-group">
              <button id="skeleton-export-json" title="导出JSON">📄 导出JSON</button>
              <button id="skeleton-export-png" title="导出PNG序列">🖼️ 导出PNG</button>
            </div>
            <div class="toolbar-group">
              <button id="skeleton-save-project" title="保存项目">💾 保存</button>
              <button id="skeleton-load-project" title="加载项目">📂 加载</button>
            </div>
          </div>
          <div class="skeleton-editor-main">
            <div class="skeleton-editor-left">
              <div class="panel-header">骨骼层级</div>
              <div id="skeleton-hierarchy-panel"></div>
            </div>
            <div class="skeleton-editor-center">
              <canvas id="skeleton-canvas" width="800" height="600"></canvas>
              <div class="canvas-controls">
                <button id="zoom-in">➕ 放大</button>
                <button id="zoom-out">➖ 缩小</button>
                <button id="zoom-reset">↺ 重置</button>
              </div>
            </div>
            <div class="skeleton-editor-right">
              <div class="panel-header">骨骼属性</div>
              <div id="skeleton-property-panel"></div>
            </div>
          </div>
          <div class="skeleton-editor-bottom">
            <div class="panel-header">时间轴</div>
            <div id="skeleton-timeline-panel"></div>
          </div>
        `;

        // 重新初始化编辑器，使用新的容器结构
        this._initializeComponents();
      };

      // 添加组件初始化方法
      window.skeletonEditor._initializeComponents = function() {
        // 确保骨骼编辑工具已初始化
        if (!this.boneEditTool) {
          this.boneEditTool = new BoneEditTool();
          this.boneEditTool.setSkeleton(this.skeleton);
        }

        // 创建骨骼层级面板
        this.hierarchyPanel = new BoneHierarchyPanel(this.skeleton);
        this.hierarchyPanel.init('#skeleton-hierarchy-panel');
        this.hierarchyPanel.onBoneSelected = (boneId) => {
          this.propertyPanel.selectBone(boneId);
        };

        // 创建属性编辑面板
        this.propertyPanel = new BonePropertyPanel(this.skeleton);
        this.propertyPanel.init('#skeleton-property-panel');
        this.propertyPanel.onChange = () => {
          this.hierarchyPanel.render();
          this._renderCanvas();
        };

        // 创建时间轴
        this.timeline = new Timeline(this.animation, this.skeleton);
        this.timeline.init('#skeleton-timeline-panel');
        this.timeline.onTimeChanged = (time) => {
          this.animationPlayer.setTime(time);
          this._renderCanvas();
        };
        this.timeline.onPlayClick = () => this.animationPlayer.play();
        this.timeline.onPauseClick = () => this.animationPlayer.pause();
        this.timeline.onStopClick = () => this.animationPlayer.stop();

        // 设置动画播放器回调
        this.animationPlayer.onTimeChanged = (time) => {
          this.timeline.setTime(time);
          this._renderCanvas();
        };

        // 初始化画布
        this._initCanvas();

        // 绑定工具栏事件
        this._bindToolbarEvents();

        // 添加自动保存
        this._initAutoSave();
      };

      // 添加画布初始化方法
      window.skeletonEditor._initCanvas = function() {
        this.canvas = document.getElementById('skeleton-canvas');
        if (!this.canvas) {
          console.error('❌ 骨骼画布未找到');
          return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        // 渲染循环变量
        this.lastFrameTime = 0;
        this.isRendering = false;
        this.animationFrameId = null;

        // 性能监控变量
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        this.renderTime = 0;  // 每帧渲染时间（毫秒）
        this.lastRenderTime = 0;

        // 绑定画布事件
        this._bindCanvasEvents();

        // 初始化渲染循环
        this._initRenderLoop();

        // 初始渲染
        this._renderCanvas();
      };

      // 添加画布事件绑定方法
      window.skeletonEditor._bindCanvasEvents = function() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          lastX = e.clientX - rect.left;
          lastY = e.clientY - rect.top;
          isDragging = true;
        });

        this.canvas.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const rect = this.canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          this.offsetX += x - lastX;
          this.offsetY += y - lastY;
          lastX = x;
          lastY = y;
          this._renderCanvas();
        });

        this.canvas.addEventListener('mouseup', () => {
          isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
          isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          this.zoom = Math.max(0.1, Math.min(5, this.zoom * delta));
          this._renderCanvas();
        });
      };

      // 添加渲染方法
      window.skeletonEditor._renderCanvas = function() {
        if (!this.ctx || !this.canvas) return;

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 保存状态
        this.ctx.save();

        // 应用缩放和平移
        this.ctx.translate(this.canvas.width / 2 + this.offsetX, this.canvas.height / 2 + this.offsetY);
        this.ctx.scale(this.zoom, this.zoom);

        // 绘制网格
        this._drawGrid();

        // 如果动画正在播放，确保骨骼变换是最新的
        if (this.animationPlayer && this.animationPlayer.isPlaying) {
          // 动画播放器会自动更新骨骼变换
        }

        // 如果有皮肤网格，先更新并渲染皮肤
        if (this.skin && this.skeleton) {
          this.skin.update(this.skeleton);
          this.skin.render(this.ctx);
        }

        // 绘制骨骼（在皮肤之上）
        if (this.boneEditTool && this.boneEditTool.render) {
          this.boneEditTool.render(this.ctx, this.imageEditor);
        } else {
          // 如果工具不存在，手动绘制骨骼
          this._drawSkeleton();
        }

        // 恢复状态
        this.ctx.restore();

        // 在动画播放时显示性能信息
        if (this.animationPlayer && this.animationPlayer.isPlaying && this.fps > 0) {
          this._drawPerformanceInfo();
        }
      };

      // 添加性能信息显示方法
      window.skeletonEditor._drawPerformanceInfo = function() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 150, 60);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textBaseline = 'top';

        this.ctx.fillText(`FPS: ${this.fps}`, 20, 15);
        this.ctx.fillText(`渲染: ${this.renderTime.toFixed(2)}ms`, 20, 30);
        if (this.animationPlayer) {
          this.ctx.fillText(`时间: ${this.animationPlayer.currentTime.toFixed(2)}s`, 20, 45);
        }

        this.ctx.restore();
      };

      // 添加网格绘制方法
      window.skeletonEditor._drawGrid = function() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5 / this.zoom;

        const gridSize = 50;
        const startX = -this.canvas.width / this.zoom;
        const startY = -this.canvas.height / this.zoom;
        const endX = this.canvas.width / this.zoom;
        const endY = this.canvas.height / this.zoom;

        this.ctx.beginPath();
        for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
          this.ctx.moveTo(x, startY);
          this.ctx.lineTo(x, endY);
        }
        for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
          this.ctx.moveTo(startX, y);
          this.ctx.lineTo(endX, y);
        }
        this.ctx.stroke();
      };

      // 添加骨骼绘制方法
      window.skeletonEditor._drawSkeleton = function() {
        const bones = this.skeleton.bones;
        bones.forEach(bone => {
          // 绘制骨骼
          this.ctx.strokeStyle = bone.id === this.hierarchyPanel?.selectedBoneId ? '#ff0' : '#fff';
          this.ctx.lineWidth = 2;

          this.ctx.beginPath();
          this.ctx.moveTo(bone.x, bone.y);
          this.ctx.lineTo(
            bone.x + Math.cos(bone.rotation) * bone.length,
            bone.y + Math.sin(bone.rotation) * bone.length
          );
          this.ctx.stroke();

          // 绘制端点
          this.ctx.fillStyle = '#fff';
          this.ctx.beginPath();
          this.ctx.arc(bone.x, bone.y, 5, 0, Math.PI * 2);
          this.ctx.fill();
        });
      };

      // 添加工具栏事件绑定方法
      window.skeletonEditor._bindToolbarEvents = function() {
        document.getElementById('skeleton-new-bone').addEventListener('click', () => {
          this.createBone();
          this._renderCanvas();
        });

        document.getElementById('skeleton-delete-bone').addEventListener('click', () => {
          if (this.hierarchyPanel.selectedBoneId) {
            this.deleteBone(this.hierarchyPanel.selectedBoneId);
            this._renderCanvas();
          }
        });

        document.getElementById('skeleton-mirror-horizontal').addEventListener('click', () => {
          const bones = this.skeleton.bones;
          bones.forEach(bone => {
            bone.y = -bone.y;
            bone.rotation = -bone.rotation;
          });
          this._renderCanvas();
        });

        document.getElementById('skeleton-mirror-vertical').addEventListener('click', () => {
          const bones = this.skeleton.bones;
          bones.forEach(bone => {
            bone.x = -bone.x;
            bone.rotation = Math.PI - bone.rotation;
          });
          this._renderCanvas();
        });

        document.getElementById('skeleton-export-json').addEventListener('click', () => {
          if (typeof ExportManager !== 'undefined') {
            ExportManager.exportJSON(this.skeleton, this.animation);
          }
        });

        document.getElementById('skeleton-export-png').addEventListener('click', () => {
          if (typeof ExportManager !== 'undefined') {
            ExportManager.exportPNGSequence(this.skeleton, this.animation, this.ctx);
          }
        });

        document.getElementById('skeleton-save-project').addEventListener('click', () => {
          this._saveProject();
        });

        document.getElementById('skeleton-load-project').addEventListener('click', () => {
          this._loadProject();
        });

        // 缩放控制
        document.getElementById('zoom-in').addEventListener('click', () => {
          this.zoom = Math.min(5, this.zoom * 1.2);
          this._renderCanvas();
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
          this.zoom = Math.max(0.1, this.zoom / 1.2);
          this._renderCanvas();
        });

        document.getElementById('zoom-reset').addEventListener('click', () => {
          this.zoom = 1;
          this.offsetX = 0;
          this.offsetY = 0;
          this._renderCanvas();
        });
      };

      // 添加渲染循环初始化方法
      window.skeletonEditor._initRenderLoop = function() {
        // 开始渲染循环
        this.isRendering = true;
        this.lastFrameTime = performance.now();
        this._renderLoop();
      };

      // 添加渲染循环方法
      window.skeletonEditor._renderLoop = function() {
        if (!this.isRendering) return;

        const currentTime = performance.now();

        // 计算帧率
        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
          this.frameCount = 0;
          this.fpsUpdateTime = currentTime;

          // 每秒输出一次性能信息
          if (this.animationPlayer && this.animationPlayer.isPlaying) {
            console.log(`[性能] FPS: ${this.fps}, 渲染时间: ${this.renderTime.toFixed(2)}ms`);
          }
        }

        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // 转换为秒
        this.lastFrameTime = currentTime;

        // 更新动画播放器
        if (this.animationPlayer && this.animationPlayer.isPlaying) {
          this.animationPlayer.update(deltaTime);
        }

        // 渲染画布（测量渲染时间）
        const renderStart = performance.now();
        this._renderCanvas();
        const renderEnd = performance.now();
        this.renderTime = renderEnd - renderStart;

        // 请求下一帧
        this.animationFrameId = requestAnimationFrame(() => {
          this._renderLoop();
        });
      };

      // 添加停止渲染循环方法
      window.skeletonEditor._stopRenderLoop = function() {
        this.isRendering = false;
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      };

      // 添加自动保存方法
      window.skeletonEditor._initAutoSave = function() {
        setInterval(() => {
          this._saveProject(true);
        }, 30000); // 30秒自动保存
      };

      // 添加保存项目方法
      window.skeletonEditor._saveProject = function(silent = false) {
        try {
          const data = this.serialize();
          localStorage.setItem('skeleton-animation-autosave', JSON.stringify(data));
          if (!silent) {
            alert('✅ 项目已保存');
          }
        } catch (e) {
          console.error('保存失败:', e);
          if (!silent) {
            alert('❌ 保存失败: ' + e.message);
          }
        }
      };

      // 添加加载项目方法
      window.skeletonEditor._loadProject = function() {
        try {
          const json = localStorage.getItem('skeleton-animation-autosave');
          if (json) {
            const data = JSON.parse(json);
            if (data.skeleton) {
              this.skeleton = Skeleton.deserialize(data.skeleton);
            }
            if (data.animation) {
              this.animation = Animation.deserialize(data.animation);
              this.animationPlayer.animation = this.animation;
            }
            // 重新初始化组件
            this._initializeComponents();
            alert('✅ 项目已加载');
          } else {
            alert('❌ 没有找到保存的项目');
          }
        } catch (e) {
          console.error('加载失败:', e);
          alert('❌ 加载失败: ' + e.message);
        }
      };

      // 初始化编辑器
      window.skeletonEditor.init();

      // 标记骨骼动画编辑器容器已初始化，用于 CSS 显示
      const container = document.getElementById('skeleton-animation-editor');
      if (container) {
        container.classList.add('initialized');
      }

      console.log('✅ 骨骼动画帧序列编辑器初始化完成');

    } catch (e) {
      console.error('❌ 初始化骨骼动画编辑器失败:', e);
    }
  }

  // 等待 DOM 加载完成后注册初始化函数
  // 只在用户点击"动画帧序列"菜单项时才初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // 注册初始化函数到全局作用域，供菜单点击事件调用
      window.initFrameSequenceEditor = initFrameSequenceEditor;
    });
  } else {
    // 注册初始化函数到全局作用域，供菜单点击事件调用
    window.initFrameSequenceEditor = initFrameSequenceEditor;
  }

})();

