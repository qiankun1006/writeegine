/**
 * Tool 基类 - 所有工具的基础类
 * 定义工具的生命周期和事件处理接口
 */
class Tool {
  constructor(options = {}) {
    this.id = options.id || 'unknown-tool';
    this.name = options.name || 'Tool';
    this.icon = options.icon || '🔧';
    this.cursor = options.cursor || 'default';
    this.category = options.category || 'other'; // selection, painting, adjustment, transform
    this.options = options.options || {};
  }

  /**
   * 工具激活时调用
   */
  activate(editor) {
    document.body.style.cursor = this.cursor;
    eventBus.emit('toolActivated', { tool: this });
  }

  /**
   * 工具停用时调用
   */
  deactivate() {
    document.body.style.cursor = 'default';
    eventBus.emit('toolDeactivated', { tool: this });
  }

  /**
   * 鼠标按下事件处理
   */
  onMouseDown(e, editor) {
    // 在子类中实现
  }

  /**
   * 鼠标移动事件处理
   */
  onMouseMove(e, editor) {
    // 在子类中实现
  }

  /**
   * 鼠标释放事件处理
   */
  onMouseUp(e, editor) {
    // 在子类中实现
  }

  /**
   * 触摸开始事件处理
   */
  onTouchStart(e, editor) {
    // 默认转换为鼠标事件
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.onMouseDown(mouseEvent, editor);
    }
  }

  /**
   * 触摸移动事件处理
   */
  onTouchMove(e, editor) {
    // 默认转换为鼠标事件
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.onMouseMove(mouseEvent, editor);
    }
  }

  /**
   * 触摸结束事件处理
   */
  onTouchEnd(e, editor) {
    // 默认转换为鼠标事件
    const mouseEvent = new MouseEvent('mouseup', {});
    this.onMouseUp(mouseEvent, editor);
  }

  /**
   * 工具选项改变
   */
  onOptionChange(option, value) {
    this.options[option] = value;
    eventBus.emit('toolOptionChanged', {
      tool: this.id,
      option,
      value
    });
  }

  /**
   * 获取工具选项
   */
  getOptions() {
    return { ...this.options };
  }

  /**
   * 设置工具选项
   */
  setOptions(options) {
    Object.assign(this.options, options);
  }

  /**
   * 获取工具描述
   */
  getDescription() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      category: this.category,
      options: this.options
    };
  }

  /**
   * 快捷键处理
   */
  onKeyDown(e, editor) {
    // 在子类中实现
  }

  onKeyUp(e, editor) {
    // 在子类中实现
  }
}

/**
 * ToolManager - 工具管理器
 * 管理所有可用的工具和当前激活的工具
 */
class ToolManager {
  constructor() {
    this.tools = new Map();
    this.activeTool = null;
    this.editor = null;
  }

  /**
   * 注册工具
   */
  register(tool) {
    if (!(tool instanceof Tool)) {
      throw new Error('Tool must be an instance of Tool class');
    }
    this.tools.set(tool.id, tool);
    eventBus.emit('toolRegistered', { tool });
  }

  /**
   * 注册多个工具
   */
  registerBatch(tools) {
    tools.forEach(tool => this.register(tool));
  }

  /**
   * 激活工具
   */
  activate(toolId, editor = this.editor) {
    if (!this.tools.has(toolId)) {
      console.warn(`Tool ${toolId} not found`);
      return false;
    }

    // 停用当前工具
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // 激活新工具
    const tool = this.tools.get(toolId);
    tool.activate(editor);
    this.activeTool = tool;
    this.editor = editor;

    eventBus.emit('activeToolChanged', {
      toolId,
      tool: tool.getDescription()
    });

    return true;
  }

  /**
   * 获取工具
   */
  getTool(toolId) {
    return this.tools.get(toolId);
  }

  /**
   * 获取激活的工具
   */
  getActiveTool() {
    return this.activeTool;
  }

  /**
   * 获取所有工具
   */
  getTools() {
    return Array.from(this.tools.values());
  }

  /**
   * 获取指定类别的工具
   */
  getToolsByCategory(category) {
    return Array.from(this.tools.values()).filter(t => t.category === category);
  }

  /**
   * 检查工具是否存在
   */
  hasTool(toolId) {
    return this.tools.has(toolId);
  }

  /**
   * 取消注册工具
   */
  unregister(toolId) {
    if (this.activeTool && this.activeTool.id === toolId) {
      this.activeTool.deactivate();
      this.activeTool = null;
    }
    return this.tools.delete(toolId);
  }

  /**
   * 处理鼠标事件
   */
  handleMouseEvent(eventType, e, editor) {
    if (this.activeTool) {
      switch (eventType) {
        case 'mousedown':
          this.activeTool.onMouseDown(e, editor);
          break;
        case 'mousemove':
          this.activeTool.onMouseMove(e, editor);
          break;
        case 'mouseup':
          this.activeTool.onMouseUp(e, editor);
          break;
      }
    }
  }

  /**
   * 处理触摸事件
   */
  handleTouchEvent(eventType, e, editor) {
    if (this.activeTool) {
      switch (eventType) {
        case 'touchstart':
          this.activeTool.onTouchStart(e, editor);
          break;
        case 'touchmove':
          this.activeTool.onTouchMove(e, editor);
          break;
        case 'touchend':
          this.activeTool.onTouchEnd(e, editor);
          break;
      }
    }
  }

  /**
   * 处理键盘事件
   */
  handleKeyEvent(eventType, e, editor) {
    if (this.activeTool) {
      switch (eventType) {
        case 'keydown':
          this.activeTool.onKeyDown(e, editor);
          break;
        case 'keyup':
          this.activeTool.onKeyUp(e, editor);
          break;
      }
    }
  }
}

// 创建全局工具管理器实例
const toolManager = new ToolManager();

