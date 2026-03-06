/**
 * 事件系统 - 提供事件发布/订阅机制和事件池管理
 * @author skeleton-animation-system
 */

import {BaseObject} from './BaseObject';
import {DefaultObjectFactory, ObjectPool} from './ObjectPool';

/**
 * 事件基类
 */
export abstract class Event extends BaseObject {
    /**
     * 事件类型
     */
    public readonly type: string;

    /**
     * 事件目标
     */
    public target: any = null;

    /**
     * 事件是否已停止传播
     */
    public stopped: boolean = false;

    /**
     * 事件是否已取消默认行为
     */
    public prevented: boolean = false;

    /**
     * 事件时间戳
     */
    public readonly timestamp: number;

    /**
     * 事件是否冒泡
     */
    public bubbles: boolean = true;

    /**
     * 事件是否可取消
     */
    public cancelable: boolean = true;

    constructor(type: string) {
        super();
        this.type = type;
        this.timestamp = Date.now();
    }

    /**
     * 停止事件传播
     */
    public stopPropagation(): void {
        this.stopped = true;
    }

    /**
     * 阻止默认行为
     */
    public preventDefault(): void {
        if (this.cancelable) {
            this.prevented = true;
        }
    }

    /**
     * 停止事件冒泡
     */
    public stopImmediatePropagation(): void {
        this.stopped = true;
        this.bubbles = false;
    }

    /**
     * 重置事件状态
     */
    protected override _reset(): void {
        super._reset();
        this.target = null;
        this.stopped = false;
        this.prevented = false;
        this.bubbles = true;
    }

    /**
     * 克隆事件（子类必须实现）
     */
    public override abstract clone(): Event;
}

/**
 * 自定义事件
 */
export class CustomEvent extends Event {
    /**
     * 事件数据
     */
    public data: any;

    constructor(type: string, data?: any) {
        super(type);
        this.data = data;
        this.cancelable = false; // 自定义事件默认不可取消
    }

    /**
     * 克隆自定义事件
     */
    public override clone(): CustomEvent {
        const event = new CustomEvent(this.type, this.data);
        event.target = this.target;
        event.bubbles = this.bubbles;
        event.cancelable = this.cancelable;
        return event;
    }
}

/**
 * 事件监听器类型
 */
export type EventListener<T extends Event = Event> = (event: T) => void | boolean;

/**
 * 事件监听器包装器
 */
export class EventListenerWrapper {
    public readonly listener: EventListener;
    public readonly context: any;
    public readonly once: boolean;
    public readonly priority: number;
    public readonly id: string;

    private static _idGenerator: number = 0;

    constructor(listener: EventListener, context?: any, once: boolean = false, priority: number = 0) {
        this.listener = listener;
        this.context = context;
        this.once = once;
        this.priority = priority;
        this.id = `listener_${++EventListenerWrapper._idGenerator}`;
    }
}

/**
 * 事件调度器
 */
export class EventDispatcher extends BaseObject {
    private readonly _listeners: Map<string, EventListenerWrapper[]> = new Map();
    private readonly _captureListeners: Map<string, EventListenerWrapper[]> = new Map();
    private _dispatching: boolean = false;
    private _pendingEvents: Event[] = [];

    /**
     * 添加事件监听器
     */
    public addEventListener<T extends Event>(
        type: string,
        listener: EventListener<T>,
        context?: any,
        once: boolean = false,
        priority: number = 0,
        useCapture: boolean = false
    ): string {
        const wrapper = new EventListenerWrapper(listener as EventListener, context, once, priority);
        const listenersMap = useCapture ? this._captureListeners : this._listeners;

        let listeners = listenersMap.get(type);
        if (!listeners) {
            listeners = [];
            listenersMap.set(type, listeners);
        }

        // 按优先级插入
        const insertIndex = listeners.findIndex(l => l.priority < priority);
        if (insertIndex >= 0) {
            listeners.splice(insertIndex, 0, wrapper);
        } else {
            listeners.push(wrapper);
        }

        return wrapper.id;
    }

    /**
     * 移除事件监听器
     */
    public removeEventListener(type: string, listenerOrId: EventListener | string, useCapture: boolean = false): boolean {
        const listenersMap = useCapture ? this._captureListeners : this._listeners;
        const listeners = listenersMap.get(type);

        if (!listeners) {
            return false;
        }

        const index = typeof listenerOrId === 'string'
            ? listeners.findIndex(l => l.id === listenerOrId)
            : listeners.findIndex(l => l.listener === listenerOrId);

        if (index >= 0) {
            listeners.splice(index, 1);

            if (listeners.length === 0) {
                listenersMap.delete(type);
            }

            return true;
        }

        return false;
    }

    /**
     * 添加一次性事件监听器
     */
    public addOnceEventListener<T extends Event>(
        type: string,
        listener: EventListener<T>,
        context?: any,
        priority: number = 0,
        useCapture: boolean = false
    ): string {
        return this.addEventListener(type, listener, context, true, priority, useCapture);
    }

    /**
     * 检查是否有指定类型的事件监听器
     */
    public hasEventListener(type: string, useCapture: boolean = false): boolean {
        const listenersMap = useCapture ? this._captureListeners : this._listeners;
        const listeners = listenersMap.get(type);
        return listeners ? listeners.length > 0 : false;
    }

    /**
     * 移除所有指定类型的事件监听器
     */
    public removeAllEventListeners(type?: string, useCapture: boolean = false): void {
        const listenersMap = useCapture ? this._captureListeners : this._listeners;

        if (type) {
            listenersMap.delete(type);
        } else {
            listenersMap.clear();
        }
    }

    /**
     * 分发事件
     */
    public dispatchEvent<T extends Event>(event: T): boolean {
        if (this._dispatching) {
            // 如果正在分发事件，将事件添加到待处理队列
            this._pendingEvents.push(event);
            return false;
        }

        this._dispatching = true;
        event.target = this;

        try {
            // 分发捕获阶段事件
            if (!this._dispatchEventPhase(event, this._captureListeners, true)) {
                return !event.prevented;
            }

            // 分发冒泡阶段事件
            if (event.bubbles && !this._dispatchEventPhase(event, this._listeners, false)) {
                return !event.prevented;
            }

            return !event.prevented;

        } finally {
            this._dispatching = false;

            // 处理待处理的事件
            if (this._pendingEvents.length > 0) {
                const nextEvent = this._pendingEvents.shift()!;
                setTimeout(() => this.dispatchEvent(nextEvent), 0);
            }
        }
    }

    /**
     * 私有方法：分发事件阶段
     */
    private _dispatchEventPhase(event: Event, listenersMap: Map<string, EventListenerWrapper[]>, isCapture: boolean): boolean {
        const listeners = listenersMap.get(event.type);
        if (!listeners || listeners.length === 0) {
            return true;
        }

        // 创建监听器副本，以防在分发过程中被修改
        const listenersCopy = [...listeners];

        for (const wrapper of listenersCopy) {
            if (event.stopped) {
                break;
            }

            try {
                const result = wrapper.listener.call(wrapper.context, event);

                // 如果监听器返回false，阻止默认行为
                if (result === false) {
                    event.preventDefault();
                }

                // 如果是一次性监听器，移除它
                if (wrapper.once) {
                    const currentListeners = listenersMap.get(event.type);
                    if (currentListeners) {
                        const index = currentListeners.indexOf(wrapper);
                        if (index >= 0) {
                            currentListeners.splice(index, 1);
                        }
                    }
                }

            } catch (error) {
                console.error(`Error in event listener for ${event.type}:`, error);
            }
        }

        return !event.prevented;
    }

    /**
     * 获取事件统计信息
     */
    public getEventStats() {
        let totalListeners = 0;
        const typeStats: { [type: string]: number } = {};

        for (const [type, listeners] of this._listeners) {
            const count = listeners.length;
            typeStats[type] = count;
            totalListeners += count;
        }

        for (const [type, listeners] of this._captureListeners) {
            const count = listeners.length;
            typeStats[type] = (typeStats[type] || 0) + count;
            totalListeners += count;
        }

        return {
            totalListeners,
            typeStats,
            pendingEvents: this._pendingEvents.length,
            isDispatching: this._dispatching
        };
    }

    /**
     * 重置事件调度器
     */
    protected override _reset(): void {
        super._reset();
        this._listeners.clear();
        this._captureListeners.clear();
        this._dispatching = false;
        this._pendingEvents.length = 0;
    }

    /**
     * 克隆事件调度器
     */
    public override clone(): EventDispatcher {
        const dispatcher = new EventDispatcher();

        // 复制监听器（浅拷贝）
        for (const [type, listeners] of this._listeners) {
            dispatcher._listeners.set(type, [...listeners]);
        }

        for (const [type, listeners] of this._captureListeners) {
            dispatcher._captureListeners.set(type, [...listeners]);
        }

        return dispatcher;
    }
}

/**
 * 事件池 - 专门用于管理事件对象
 */
export class EventPool {
    private readonly _pools: Map<string, ObjectPool<Event>> = new Map();
    private readonly _poolManager: ObjectPoolManager;

    constructor() {
        this._poolManager = ObjectPoolManager.getInstance();
    }

    /**
     * 注册事件池
     */
    public registerEventPool<T extends Event>(eventType: string, eventClass: new () => T, config?: any): void {
        const factory = new DefaultObjectFactory(eventClass);
        const pool = new ObjectPool(factory, config);

        this._pools.set(eventType, pool);
        this._poolManager.registerPool(`event_${eventType}`, pool);
    }

    /**
     * 获取事件对象
     */
    public acquire<T extends Event>(eventType: string): T | null {
        const pool = this._pools.get(eventType);
        if (pool) {
            return pool.acquire() as T;
        }
        return null;
    }

    /**
     * 释放事件对象
     */
    public release(event: Event): void {
        const pool = this._pools.get(event.type);
        if (pool) {
            event.dispose();
        }
    }

    /**
     * 获取事件池统计信息
     */
    public getStats() {
        const stats: { [type: string]: any } = {};

        for (const [type, pool] of this._pools) {
            stats[type] = pool.stats;
        }

        return stats;
    }

    /**
     * 清理所有事件池
     */
    public cleanup(): void {
        for (const pool of this._pools.values()) {
            pool.cleanup();
        }
    }

    /**
     * 销毁事件池
     */
    public destroy(): void {
        for (const [eventType, pool] of this._pools) {
            pool.destroy();
            this._poolManager.unregisterPool(`event_${eventType}`);
        }
        this._pools.clear();
    }
}

/**
 * 全局事件池管理器
 */
export const GlobalEventPool = new EventPool();

// 注册常用事件类型
GlobalEventPool.registerEventPool('CustomEvent', CustomEvent, {
    initialSize: 50,
    maxSize: 500,
    autoCleanup: true
});

