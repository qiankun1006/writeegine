/**
 * EventBus - 事件系统
 *
 * 提供全局事件发布/订阅能力，实现组件间的解耦通信
 * 支持事件监听、取消监听和事件发送
 */

class EventBus {
  constructor() {
    // Map<eventName, Set<handler>>
    this.events = new Map();
  }

  /**
   * 监听事件
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 配置选项
   * @param {number} options.priority - 优先级（高优先级先执行）
   */
  on(eventName, handler, options = {}) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const handlerObj = {
      handler,
      priority: options.priority || 0,
      once: options.once || false
    };

    const handlers = this.events.get(eventName);
    handlers.push(handlerObj);

    // 按优先级排序（高优先级在前）
    handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 监听一次性事件
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  once(eventName, handler, options = {}) {
    this.on(eventName, handler, { ...options, once: true });
  }

  /**
   * 取消监听事件
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 要移除的处理函数
   */
  off(eventName, handler) {
    if (!this.events.has(eventName)) {
      return;
    }

    const handlers = this.events.get(eventName);
    const index = handlers.findIndex(h => h.handler === handler);

    if (index !== -1) {
      handlers.splice(index, 1);
    }

    // 如果没有监听者了，删除事件
    if (handlers.length === 0) {
      this.events.delete(eventName);
    }
  }

  /**
   * 发送事件
   * @param {string} eventName - 事件名称
   * @param {any} data - 事件数据
   */
  emit(eventName, data) {
    if (!this.events.has(eventName)) {
      return;
    }

    const handlers = this.events.get(eventName);

    // 创建副本以支持在监听器中修改事件列表
    const handlersToCall = [...handlers];

    for (const handlerObj of handlersToCall) {
      try {
        handlerObj.handler(data);
      } catch (error) {
        console.error(`Error in event handler for '${eventName}':`, error);
      }

      // 如果是一次性监听，移除它
      if (handlerObj.once) {
        this.off(eventName, handlerObj.handler);
      }
    }
  }

  /**
   * 清空所有事件监听
   */
  clear() {
    this.events.clear();
  }

  /**
   * 获取指定事件的监听器数量
   * @param {string} eventName - 事件名称
   */
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).length : 0;
  }
}

// 导出单例
const eventBus = new EventBus();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventBus, eventBus };
}

