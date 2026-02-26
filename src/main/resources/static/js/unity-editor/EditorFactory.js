/**
 * 编辑器工厂类
 * 根据游戏类型创建相应的编辑器实例
 */

class EditorFactory {
  /**
   * 创建编辑器实例
   * @param {string} editorType - 编辑器类型 (2d-strategy, 2d-metroidvania, 2d-rpg, 3d-shooter)
   * @param {string} gameId - 游戏 ID
   * @returns {Object} 编辑器实例
   */
  static createEditor(editorType, gameId) {
    console.log(`🎮 创建编辑器: ${editorType}, GameID: ${gameId}`);

    const config = this.getEditorConfig(editorType);

    switch (editorType) {
      case '2d-strategy':
        return new Strategy2DEditor(config, gameId);
      case '2d-metroidvania':
        return new Metroidvania2DEditor(config, gameId);
      case '2d-rpg':
        return new RPG2DEditor(config, gameId);
      case '3d-shooter':
        return new Shooter3DEditor(config, gameId);
      default:
        console.warn(`未知的编辑器类型: ${editorType}`);
        return new Shooter3DEditor(config, gameId);
    }
  }

  /**
   * 获取编辑器配置
   * @param {string} editorType - 编辑器类型
   * @returns {Object} 配置对象
   */
  static getEditorConfig(editorType) {
    const configs = {
      '2d-strategy': {
        name: '2D 策略战棋编辑器',
        engine: 'canvas2d',
        tools: ['grid', 'pathfinding', 'battle-preview'],
        canvasSize: { width: 800, height: 600 },
        gridSize: 32,
        initialZoom: 1.0
      },
      '2d-metroidvania': {
        name: '2D 恶魔城编辑器',
        engine: 'canvas2d',
        tools: ['collision-editor', 'physics-preview', 'platformer'],
        canvasSize: { width: 800, height: 600 },
        gridSize: 16,
        initialZoom: 1.0
      },
      '2d-rpg': {
        name: '2D RPG 编辑器',
        engine: 'canvas2d',
        tools: ['npc-editor', 'dialogue-editor', 'quest-system'],
        canvasSize: { width: 800, height: 600 },
        gridSize: 32,
        initialZoom: 1.0
      },
      '3d-shooter': {
        name: '3D 射击编辑器',
        engine: 'three.js',
        tools: ['lighting', 'particles', 'raycast'],
        canvasSize: { width: 1024, height: 768 },
        initialZoom: 1.0
      }
    };

    return configs[editorType] || configs['3d-shooter'];
  }

  /**
   * 检查编辑器类型是否为 2D
   * @param {string} editorType - 编辑器类型
   * @returns {boolean}
   */
  static is2D(editorType) {
    return editorType.startsWith('2d-');
  }

  /**
   * 检查编辑器类型是否为 3D
   * @param {string} editorType - 编辑器类型
   * @returns {boolean}
   */
  static is3D(editorType) {
    return editorType.startsWith('3d-');
  }

  /**
   * 获取编辑器加载需要的脚本
   * @param {string} editorType - 编辑器类型
   * @returns {Array<string>} 脚本 URL 列表
   */
  static getRequiredScripts(editorType) {
    const baseScripts = [
      '/static/js/unity-editor/Canvas2DUtils.js'
    ];

    if (this.is2D(editorType)) {
      return [
        ...baseScripts,
        '/static/js/unity-editor/BaseEditor2D.js'
      ];
    } else {
      return [
        '/static/js/unity-editor/UnityRenderer.js',
        '/static/js/unity-editor/SelectionSystem.js'
      ];
    }
  }
}

/**
 * 基础 2D 编辑器类
 */
class Base2DEditor {
  constructor(config, gameId) {
    this.config = config;
    this.gameId = gameId;
    this.canvas = null;
    this.ctx = null;
    this.objects = [];
    this.selectedObject = null;
    this.tools = {};
  }

  async initialize() {
    console.log(`初始化 ${this.config.name}`);

    // 获取画布
    this.canvas = document.getElementById('canvas');
    if (!this.canvas) {
      console.error('未找到 canvas 元素');
      return false;
    }

    this.ctx = this.canvas.getContext('2d');

    // 设置画布大小
    this.canvas.width = this.config.canvasSize.width;
    this.canvas.height = this.config.canvasSize.height;

    // 初始化工具
    await this.initializeTools();

    // 加载游戏数据
    if (this.gameId) {
      await this.loadGame(this.gameId);
    }

    // 启动渲染循环
    this.startRenderLoop();

    console.log('✅ 编辑器初始化完成');
    return true;
  }

  async initializeTools() {
    // 子类实现
  }

  async loadGame(gameId) {
    try {
      const response = await fetch(`/api/game/${gameId}`);
      const data = await response.json();
      if (data.success) {
        console.log('游戏数据加载成功:', data.data);
        this.currentGame = data.data;
      }
    } catch (error) {
      console.error('加载游戏失败:', error);
    }
  }

  startRenderLoop() {
    const render = () => {
      this.render();
      requestAnimationFrame(render);
    };
    render();
  }

  render() {
    // 清空画布
    Canvas2DUtils.clearCanvas(this.canvas);

    // 绘制网格
    Canvas2DUtils.drawGrid(this.ctx, this.canvas.width, this.canvas.height, 32);

    // 绘制对象
    this.objects.forEach(obj => {
      const isSelected = obj === this.selectedObject;
      Canvas2DUtils.drawRect(
        this.ctx,
        obj.x, obj.y, obj.width, obj.height,
        isSelected ? '#667eea' : obj.color,
        isSelected ? '#333' : null,
        isSelected ? 2 : 0
      );
    });
  }

  selectObject(obj) {
    this.selectedObject = obj;
    this.updateProperties();
  }

  updateProperties() {
    if (!this.selectedObject) return;

    const propX = document.getElementById('propX');
    const propY = document.getElementById('propY');
    const propWidth = document.getElementById('propWidth');
    const propHeight = document.getElementById('propHeight');

    if (propX) propX.value = this.selectedObject.x;
    if (propY) propY.value = this.selectedObject.y;
    if (propWidth) propWidth.value = this.selectedObject.width;
    if (propHeight) propHeight.value = this.selectedObject.height;
  }

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
          metadata: this.config
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ 游戏已保存');
      } else {
        console.error('保存失败:', data.error);
      }
    } catch (error) {
      console.error('保存游戏失败:', error);
    }
  }
}

/**
 * 2D 策略战棋编辑器
 */
class Strategy2DEditor extends Base2DEditor {
  async initializeTools() {
    console.log('初始化策略编辑器工具');
    // 工具初始化
  }
}

/**
 * 2D 恶魔城编辑器
 */
class Metroidvania2DEditor extends Base2DEditor {
  async initializeTools() {
    console.log('初始化恶魔城编辑器工具');
    // 工具初始化
  }
}

/**
 * 2D RPG 编辑器
 */
class RPG2DEditor extends Base2DEditor {
  async initializeTools() {
    console.log('初始化 RPG 编辑器工具');
    // 工具初始化
  }
}

/**
 * 3D 射击编辑器
 */
class Shooter3DEditor {
  constructor(config, gameId) {
    this.config = config;
    this.gameId = gameId;
    console.log('初始化 3D 射击编辑器');
  }

  async initialize() {
    console.log('✅ 3D 射击编辑器已连接到现有 UnityEditor');
    return true;
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.EditorFactory = EditorFactory;
  window.Base2DEditor = Base2DEditor;
  window.Strategy2DEditor = Strategy2DEditor;
  window.Metroidvania2DEditor = Metroidvania2DEditor;
  window.RPG2DEditor = RPG2DEditor;
  window.Shooter3DEditor = Shooter3DEditor;
}

