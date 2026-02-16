/**
 * EventBus - 事件总线系统
 * 提供事件发布/订阅功能，用于组件间的解耦通信
 */
class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 处理函数
   * @param {number} priority - 优先级（数字越大优先级越高，默认0）
   */
  on(eventName, handler, priority = 0) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const handlers = this.events.get(eventName);
    handlers.push({ handler, priority });
    // 按优先级排序
    handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 发送事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  emit(eventName, data) {
    if (this.events.has(eventName)) {
      const handlers = this.events.get(eventName);
      handlers.forEach(({ handler }) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * 取消订阅
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 处理函数
   */
  off(eventName, handler) {
    if (this.events.has(eventName)) {
      const handlers = this.events.get(eventName);
      const index = handlers.findIndex(h => h.handler === handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 订阅事件（仅执行一次）
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 处理函数
   */
  once(eventName, handler) {
    const wrappedHandler = (data) => {
      handler(data);
      this.off(eventName, wrappedHandler);
    };
    this.on(eventName, wrappedHandler);
  }

  /**
   * 清空所有事件监听
   * @param {string} eventName - 事件名称（可选，如果不提供则清空所有）
   */
  clear(eventName = null) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  /**
   * 获取事件的监听器数量
   * @param {string} eventName - 事件名称
   * @returns {number} 监听器数量
   */
  listenerCount(eventName) {
    if (this.events.has(eventName)) {
      return this.events.get(eventName).length;
    }
    return 0;
  }
}

// 导出全局单例
const eventBus = new EventBus();

