/**
 * Tool - 工具基类
 *
 * 所有编辑工具都应继承此类，定义工具的行为和接口
 */
class Tool {
  constructor(options = {}) {
    this.id = options.id;
    this.name = options.name || 'Tool';
    this.icon = options.icon;
    this.cursor = options.cursor || 'default';
    this.hotkey = options.hotkey;

    // 工具选项（子类可覆盖）
    this.options = {};

    // 状态
    this.isActive = false;
    this.isDragging = false;
  }

  /**
   * 获取工具信息
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      cursor: this.cursor,
      hotkey: this.hotkey
    };
  }

  /**
   * 激活工具
   */
  activate(editor) {
    this.isActive = true;

    // 设置光标
    if (editor && editor.canvas) {
      editor.canvas.style.cursor = this.cursor;
    }

    if (window.eventBus) {
      window.eventBus.emit('toolActivated', { tool: this });
    }
  }

  /**
   * 停用工具
   */
  deactivate(editor) {
    this.isActive = false;
    this.isDragging = false;

    if (editor && editor.canvas) {
      editor.canvas.style.cursor = 'default';
    }

    if (window.eventBus) {
      window.eventBus.emit('toolDeactivated', { tool: this });
    }
  }

  /**
   * 鼠标按下
   */
  onMouseDown(e, editor) {
    this.isDragging = true;
  }

  /**
   * 鼠标移动
   */
  onMouseMove(e, editor) {
    // 由子类实现
  }

  /**
   * 鼠标释放
   */
  onMouseUp(e, editor) {
    this.isDragging = false;
  }

  /**
   * 鼠标进入画布
   */
  onMouseEnter(e, editor) {
    // 由子类实现
  }

  /**
   * 鼠标离开画布
   */
  onMouseLeave(e, editor) {
    this.isDragging = false;
  }

  /**
   * 键盘按下
   */
  onKeyDown(e, editor) {
    // 由子类实现
  }

  /**
   * 键盘释放
   */
  onKeyUp(e, editor) {
    // 由子类实现
  }

  /**
   * 双击
   */
  onDoubleClick(e, editor) {
    // 由子类实现
  }

  /**
   * 工具选项改变
   */
  onOptionChange(option, value) {
    this.options[option] = value;

    if (window.eventBus) {
      window.eventBus.emit('toolOptionChanged', {
        tool: this.id,
        option,
        value
      });
    }
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
   * 取消操作（ESC 键）
   */
  cancel(editor) {
    this.isDragging = false;
  }

  /**
   * 完成操作
   */
  finalize(editor) {
    // 由子类实现
  }
}

/**
 * ToolManager - 工具管理器
 *
 * 管理所有可用的工具，负责工具的注册、激活和切换
 */
class ToolManager {
  constructor(editor) {
    this.editor = editor;
    this.tools = new Map();
    this.activeTool = null;
  }

  /**
   * 注册工具
   */
  register(tool) {
    if (!tool.id) {
      throw new Error('Tool must have an id');
    }
    this.tools.set(tool.id, tool);
    return this;
  }

  /**
   * 注销工具
   */
  unregister(toolId) {
    if (this.activeTool && this.activeTool.id === toolId) {
      this.activeTool = null;
    }
    return this.tools.delete(toolId);
  }

  /**
   * 获取工具
   */
  getTool(toolId) {
    return this.tools.get(toolId);
  }

  /**
   * 获取所有工具
   */
  getAllTools() {
    return Array.from(this.tools.values());
  }

  /**
   * 激活工具
   */
  activate(toolId) {
    const tool = this.tools.get(toolId);

    if (!tool) {
      console.warn(`Tool '${toolId}' not found`);
      return false;
    }

    // 停用当前工具
    if (this.activeTool && this.activeTool !== tool) {
      this.activeTool.deactivate(this.editor);
    }

    // 激活新工具
    tool.activate(this.editor);
    this.activeTool = tool;

    return true;
  }

  /**
   * 获取当前活动工具
   */
  getActiveTool() {
    return this.activeTool;
  }

  /**
   * 获取工具列表（用于 UI）
   */
  getToolList() {
    return this.getAllTools().map(tool => ({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      hotkey: tool.hotkey,
      active: this.activeTool === tool
    }));
  }

  /**
   * 获取工具选项
   */
  getActiveToolOptions() {
    return this.activeTool ? this.activeTool.getOptions() : {};
  }

  /**
   * 设置工具选项
   */
  setActiveToolOption(option, value) {
    if (this.activeTool) {
      this.activeTool.onOptionChange(option, value);
    }
  }

  /**
   * 按快捷键激活工具
   */
  activateByHotkey(key) {
    const tool = this.getAllTools().find(t => t.hotkey === key);
    if (tool) {
      return this.activate(tool.id);
    }
    return false;
  }

  /**
   * 处理鼠标事件
   */
  handleMouseDown(e) {
    if (this.activeTool) {
      this.activeTool.onMouseDown(e, this.editor);
    }
  }

  handleMouseMove(e) {
    if (this.activeTool) {
      this.activeTool.onMouseMove(e, this.editor);
    }
  }

  handleMouseUp(e) {
    if (this.activeTool) {
      this.activeTool.onMouseUp(e, this.editor);
    }
  }

  handleMouseEnter(e) {
    if (this.activeTool) {
      this.activeTool.onMouseEnter(e, this.editor);
    }
  }

  handleMouseLeave(e) {
    if (this.activeTool) {
      this.activeTool.onMouseLeave(e, this.editor);
    }
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(e) {
    if (this.activeTool) {
      this.activeTool.onKeyDown(e, this.editor);
    }
  }

  handleKeyUp(e) {
    if (this.activeTool) {
      this.activeTool.onKeyUp(e, this.editor);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Tool, ToolManager };
}

