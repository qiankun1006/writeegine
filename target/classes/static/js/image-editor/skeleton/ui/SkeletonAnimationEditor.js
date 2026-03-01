/**
 * SkeletonAnimationEditor.js - 骨骼动画编辑器主类
 *
 * 集成所有 UI 组件和骨骼系统
 * 作为与主编辑器的接口
 */
class SkeletonAnimationEditor {
  constructor(imageEditor) {
    this.imageEditor = imageEditor;

    // 核心系统
    this.skeleton = new Skeleton('Character');
    this.animation = new Animation('Walk', 24, 60);
    this.animationPlayer = new AnimationPlayer(this.skeleton, this.animation);

    // UI 组件
    this.boneEditTool = null;
    this.hierarchyPanel = null;
    this.propertyPanel = null;
    this.timeline = null;

    // 容器
    this.panelContainer = null;
    this.isVisible = false;

    // 自动初始化
    this._init();
  }

  /**
   * 内部初始化方法
   */
  _init() {
    // 延迟初始化，确保 DOM 准备好
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      // DOM 已准备好，直接初始化
      setTimeout(() => this.init(), 100);
    }
  }

  /**
   * 初始化编辑器
   */
  init() {
    // 获取或创建骨骼编辑工具
    // 首先尝试从工具管理器获取已注册的工具
    if (this.imageEditor && this.imageEditor.toolManager) {
      this.boneEditTool = this.imageEditor.toolManager.getTool('bone-edit');
    }

    // 如果工具管理器中没有，则创建新的
    if (!this.boneEditTool) {
      this.boneEditTool = new BoneEditTool();
    }

    // 设置 skeleton
    this.boneEditTool.setSkeleton(this.skeleton);

    // 初始化 UI 组件
    this._createPanelContainer();

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
      this.imageEditor.renderer.render();
    };

    // 创建时间轴
    this.timeline = new Timeline(this.animation, this.skeleton);
    this.timeline.init('#skeleton-timeline-panel');
    this.timeline.onTimeChanged = (time) => {
      this.animationPlayer.setTime(time);
      this.imageEditor.renderer.render();
    };
    this.timeline.onPlayClick = () => this.animationPlayer.play();
    this.timeline.onPauseClick = () => this.animationPlayer.pause();
    this.timeline.onStopClick = () => this.animationPlayer.stop();

    // 设置动画播放器回调
    this.animationPlayer.onTimeChanged = (time) => {
      this.timeline.setTime(time);
    };
  }

  /**
   * 创建面板容器
   */
  _createPanelContainer() {
    // 在现有 UI 中创建骨骼动画编辑器的面板
    // 这个方法假设页面上有相应的容器
    // 实际应根据项目结构调整

    // 检查是否已存在容器
    let container = document.querySelector('.skeleton-animation-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'skeleton-animation-container';
      container.style.cssText = `
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      `;

      // 主面板区域（分左右两个面板）
      const mainArea = document.createElement('div');
      mainArea.style.cssText = `
        display: flex;
        flex: 1;
        overflow: hidden;
        gap: 4px;
      `;

      // 左侧面板（骨骼层级）
      const leftPanel = document.createElement('div');
      leftPanel.style.cssText = `
        width: 200px;
        border-right: 1px solid #444;
        overflow-y: auto;
        background: #2a2a2a;
      `;
      leftPanel.id = 'skeleton-hierarchy-panel';
      mainArea.appendChild(leftPanel);

      // 中间区域（画布）
      const centerArea = document.createElement('div');
      centerArea.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `;
      mainArea.appendChild(centerArea);

      // 右侧面板（属性）
      const rightPanel = document.createElement('div');
      rightPanel.style.cssText = `
        width: 250px;
        border-left: 1px solid #444;
        overflow-y: auto;
        background: #2a2a2a;
      `;
      rightPanel.id = 'skeleton-property-panel';
      mainArea.appendChild(rightPanel);

      container.appendChild(mainArea);

      // 底部时间轴
      const timelinePanel = document.createElement('div');
      timelinePanel.style.cssText = `
        height: 200px;
        border-top: 1px solid #444;
        overflow: hidden;
        background: #1a1a1a;
      `;
      timelinePanel.id = 'skeleton-timeline-panel';
      container.appendChild(timelinePanel);

      // 添加样式链接
      if (!document.querySelector('link[href*="skeleton-animation.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/css/skeleton-animation.css';
        document.head.appendChild(link);
      }

      document.body.appendChild(container);
    }

    this.panelContainer = container;
  }

  /**
   * 激活骨骼编辑工具
   */
  activateBoneEditTool() {
    if (this.boneEditTool && this.imageEditor.tools) {
      // 注册工具到编辑器
      this.imageEditor.tools.register('bone-edit', this.boneEditTool);
      this.imageEditor.tools.activate('bone-edit');
    }
  }

  /**
   * 创建新骨骼
   */
  createBone(name = null) {
    const bone = this.skeleton.createBone(name);
    this.hierarchyPanel.render();
    return bone;
  }

  /**
   * 删除骨骼
   */
  deleteBone(boneId) {
    this.skeleton.removeBone(boneId);
    this.hierarchyPanel.render();
  }

  /**
   * 创建关键帧
   */
  createKeyframe(boneId, frameIndex) {
    const bone = this.skeleton.getBone(boneId);
    if (bone) {
      this.animation.setKeyframe(boneId, frameIndex, bone);
      this.timeline.render();
    }
  }

  /**
   * 删除关键帧
   */
  deleteKeyframe(boneId, frameIndex) {
    this.animation.removeKeyframe(boneId, frameIndex);
    this.timeline.render();
  }

  /**
   * 更新动画
   */
  update(deltaTime) {
    this.animationPlayer.update(deltaTime);
  }

  /**
   * 渲染
   */
  render(ctx) {
    // 由工具负责渲染骨骼结构
    if (this.boneEditTool && this.boneEditTool.render) {
      this.boneEditTool.render(ctx);
    }
  }

  /**
   * 序列化
   */
  serialize() {
    return {
      skeleton: this.skeleton.serialize(),
      animation: this.animation.serialize()
    };
  }

  /**
   * 反序列化
   */
  static deserialize(data) {
    const editor = new SkeletonAnimationEditor();
    if (data.skeleton) {
      editor.skeleton = Skeleton.deserialize(data.skeleton);
    }
    if (data.animation) {
      editor.animation = Animation.deserialize(data.animation);
      editor.animationPlayer.animation = editor.animation;
    }
    return editor;
  }

  /**
   * 切换编辑器显示/隐藏
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 显示编辑器
   */
  show() {
    if (!this.panelContainer) {
      this.init();
    }
    if (this.panelContainer) {
      this.panelContainer.style.display = 'flex';
      this.isVisible = true;
      console.log('✓ 骨骼动画编辑器已显示');
    }
  }

  /**
   * 隐藏编辑器
   */
  hide() {
    if (this.panelContainer) {
      this.panelContainer.style.display = 'none';
      this.isVisible = false;
      console.log('✓ 骨骼动画编辑器已隐藏');
    }
  }

  /**
   * 清理
   */
  dispose() {
    if (this.boneEditTool) this.boneEditTool.dispose();
    if (this.hierarchyPanel) this.hierarchyPanel.dispose();
    if (this.propertyPanel) this.propertyPanel.dispose();
    if (this.timeline) this.timeline.dispose();

    this.skeleton = null;
    this.animation = null;
    this.animationPlayer = null;
  }
}

