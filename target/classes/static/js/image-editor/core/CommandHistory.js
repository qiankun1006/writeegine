/**
 * Command - 命令基类
 *
 * 所有编辑操作都应继承此类以支持撤销/重做功能
 */
class Command {
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
   * 重做命令（默认调用 execute）
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
 * CommandHistory - 撤销/重做系统
 *
 * 管理命令历史栈，支持撤销、重做和历史查询
 */
class CommandHistory {
  constructor(maxSize = 100) {
    this.history = [];      // 命令历史栈
    this.currentIndex = -1; // 当前位置
    this.maxSize = maxSize; // 最大历史数量
  }

  /**
   * 执行命令
   * @param {Command} command - 要执行的命令
   */
  execute(command) {
    try {
      // 执行命令
      command.execute();

      // 移除当前索引之后的所有命令（因为有新的命令了）
      this.history = this.history.slice(0, this.currentIndex + 1);

      // 添加到历史
      this.history.push(command);
      this.currentIndex++;

      // 限制历史大小
      if (this.history.length > this.maxSize) {
        this.history.shift();
        this.currentIndex--;
      }

      // 触发历史改变事件
      if (window.eventBus) {
        window.eventBus.emit('historyChanged', {
          canUndo: this.canUndo(),
          canRedo: this.canRedo(),
          history: this.getHistory()
        });
      }
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  /**
   * 撤销上一步
   */
  undo() {
    if (!this.canUndo()) {
      return;
    }

    try {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;

      if (window.eventBus) {
        window.eventBus.emit('historyChanged', {
          canUndo: this.canUndo(),
          canRedo: this.canRedo(),
          history: this.getHistory()
        });
      }
    } catch (error) {
      console.error('Error undoing command:', error);
      throw error;
    }
  }

  /**
   * 重做
   */
  redo() {
    if (!this.canRedo()) {
      return;
    }

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.redo();

      if (window.eventBus) {
        window.eventBus.emit('historyChanged', {
          canUndo: this.canUndo(),
          canRedo: this.canRedo(),
          history: this.getHistory()
        });
      }
    } catch (error) {
      console.error('Error redoing command:', error);
      throw error;
    }
  }

  /**
   * 判断是否可以撤销
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * 判断是否可以重做
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
      active: index === this.currentIndex
    }));
  }

  /**
   * 清空历史
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;

    if (window.eventBus) {
      window.eventBus.emit('historyChanged', {
        canUndo: false,
        canRedo: false,
        history: []
      });
    }
  }

  /**
   * 获取历史栈大小
   */
  size() {
    return this.history.length;
  }

  /**
   * 获取当前位置
   */
  getCurrentIndex() {
    return this.currentIndex;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Command, CommandHistory };
}

