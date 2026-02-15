/**
 * Command 基类 - 命令模式实现
 * 所有可撤销/重做的操作都应该继承此类
 */
class Command {
  constructor() {
    this.timestamp = Date.now();
  }

  /**
   * 执行命令
   */
  execute() {
    throw new Error('Must implement execute method');
  }

  /**
   * 撤销命令
   */
  undo() {
    throw new Error('Must implement undo method');
  }

  /**
   * 重做命令
   */
  redo() {
    this.execute();
  }

  /**
   * 获取命令描述（用于UI显示）
   */
  getDescription() {
    return 'Command';
  }
}

/**
 * CommandHistory - 命令历史管理器
 * 管理命令的执行、撤销、重做
 */
class CommandHistory {
  constructor(maxSize = 100) {
    this.history = [];
    this.currentIndex = -1;
    this.maxSize = maxSize;
  }

  /**
   * 执行命令
   * @param {Command} command - 要执行的命令
   */
  execute(command) {
    // 如果当前位置不在历史末尾，删除之后的所有命令
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // 执行命令
    try {
      command.execute();
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }

    // 添加到历史
    this.history.push(command);
    this.currentIndex++;

    // 限制历史大小
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }

    // 触发历史改变事件
    eventBus.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      historySize: this.history.length
    });
  }

  /**
   * 撤销
   */
  undo() {
    if (!this.canUndo()) {
      console.warn('Cannot undo: already at the beginning of history');
      return false;
    }

    try {
      this.history[this.currentIndex].undo();
      this.currentIndex--;

      eventBus.emit('historyChanged', {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        currentCommand: this.currentIndex >= 0 ? this.history[this.currentIndex].getDescription() : null
      });

      return true;
    } catch (error) {
      console.error('Error undoing command:', error);
      return false;
    }
  }

  /**
   * 重做
   */
  redo() {
    if (!this.canRedo()) {
      console.warn('Cannot redo: already at the end of history');
      return false;
    }

    try {
      this.currentIndex++;
      this.history[this.currentIndex].redo();

      eventBus.emit('historyChanged', {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        currentCommand: this.history[this.currentIndex].getDescription()
      });

      return true;
    } catch (error) {
      console.error('Error redoing command:', error);
      this.currentIndex--;
      return false;
    }
  }

  /**
   * 是否可以撤销
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * 是否可以重做
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 获取历史记录
   */
  getHistory() {
    return this.history.map((cmd, index) => ({
      index,
      description: cmd.getDescription(),
      timestamp: cmd.timestamp,
      isCurrent: index === this.currentIndex
    }));
  }

  /**
   * 跳转到指定的历史状态
   */
  jumpToIndex(index) {
    if (index < -1 || index >= this.history.length) {
      console.warn('Invalid history index');
      return false;
    }

    // 从当前位置回到目标位置
    while (this.currentIndex > index) {
      this.undo();
    }

    // 从当前位置前进到目标位置
    while (this.currentIndex < index) {
      this.redo();
    }

    return true;
  }

  /**
   * 清空历史
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
    eventBus.emit('historyCleared');
  }

  /**
   * 获取历史大小
   */
  getSize() {
    return this.history.length;
  }

  /**
   * 获取当前位置
   */
  getCurrentIndex() {
    return this.currentIndex;
  }
}

// 创建全局命令历史实例
const commandHistory = new CommandHistory(100);

