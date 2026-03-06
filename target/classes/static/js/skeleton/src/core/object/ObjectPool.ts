/**
 * 对象池实现 - 用于高效管理对象生命周期
 * @author skeleton-animation-system
 */

import {BaseObject} from './BaseObject';

/**
 * 对象创建工厂接口
 */
export interface ObjectFactory<T extends BaseObject> {
    create(): T;
}

/**
 * 默认对象工厂
 */
export class DefaultObjectFactory<T extends BaseObject> implements ObjectFactory<T> {
    private readonly _constructor: new () => T;

    constructor(constructor: new () => T) {
        this._constructor = constructor;
    }

    public create(): T {
        return new this._constructor();
    }
}

/**
 * 对象池配置
 */
export interface ObjectPoolConfig {
    /**
     * 初始对象数量
     */
    initialSize: number;

    /**
     * 最大对象数量（0表示无限制）
     */
    maxSize: number;

    /**
     * 对象回收时的清理延迟（毫秒）
     */
    cleanupDelay: number;

    /**
     * 是否启用自动清理
     */
    autoCleanup: boolean;

    /**
     * 清理间隔（毫秒）
     */
    cleanupInterval: number;
}

/**
 * 默认对象池配置
 */
const DEFAULT_POOL_CONFIG: ObjectPoolConfig = {
    initialSize: 10,
    maxSize: 1000,
    cleanupDelay: 100,
    autoCleanup: true,
    cleanupInterval: 5000
};

/**
 * 对象池类
 */
export class ObjectPool<T extends BaseObject> {
    private readonly _factory: ObjectFactory<T>;
    private readonly _config: ObjectPoolConfig;
    private readonly _available: T[] = [];
    private readonly _inUse: Set<T> = new Set();
    private _totalCreated: number = 0;
    private _cleanupTimer: NodeJS.Timeout | null = null;

    constructor(factory: ObjectFactory<T>, config: Partial<ObjectPoolConfig> = {}) {
        this._factory = factory;
        this._config = { ...DEFAULT_POOL_CONFIG, ...config };

        // 预创建对象
        this._initializePool();

        // 启动自动清理
        if (this._config.autoCleanup) {
            this._startAutoCleanup();
        }
    }

    /**
     * 获取池统计信息
     */
    public get stats() {
        return {
            available: this._available.length,
            inUse: this._inUse.size,
            totalCreated: this._totalCreated,
            maxSize: this._config.maxSize
        };
    }

    /**
     * 从池中获取对象
     */
    public acquire(): T {
        let object: T;

        if (this._available.length > 0) {
            // 从可用列表中获取
            object = this._available.pop()!;
        } else {
            // 创建新对象
            if (this._config.maxSize > 0 && this._totalCreated >= this._config.maxSize) {
                throw new Error(`Object pool max size (${this._config.maxSize}) exceeded`);
            }

            object = this._factory.create();
            object.pool = this as any;
            this._totalCreated++;
        }

        // 重置对象状态
        object['_isDisposed'] = false;
        object['_referenceCount'] = 1;

        this._inUse.add(object);

        return object;
    }

    /**
     * 将对象释放回池中
     */
    public release(object: T): void {
        if (!this._inUse.has(object)) {
            return; // 对象不属于此池
        }

        if (!object.isDisposed) {
            return; // 对象未被释放
        }

        this._inUse.delete(object);

        // 重置对象状态
        this._resetObject(object);

        // 添加到可用列表
        if (this._config.maxSize === 0 || this._totalCreated <= this._config.maxSize) {
            this._available.push(object);
        }
    }

    /**
     * 预填充对象池
     */
    public prefill(count: number): void {
        if (this._config.maxSize > 0) {
            const maxAvailable = this._config.maxSize - this._inUse.size;
            count = Math.min(count, maxAvailable - this._available.length);
        }

        for (let i = 0; i < count; i++) {
            const object = this._factory.create();
            object.pool = this as any;
            this._resetObject(object);
            this._available.push(object);
            this._totalCreated++;
        }
    }

    /**
     * 清理池中的对象
     */
    public cleanup(): void {
        // 清理可用对象列表中的无效对象
        const validObjects: T[] = [];

        for (const object of this._available) {
            if (this._isValidObject(object)) {
                validObjects.push(object);
            }
        }

        this._available.length = 0;
        this._available.push(...validObjects);
    }

    /**
     * 清空对象池
     */
    public clear(): void {
        this._available.length = 0;
        this._inUse.clear();
        this._totalCreated = 0;

        if (this._cleanupTimer) {
            clearInterval(this._cleanupTimer);
            this._cleanupTimer = null;
        }
    }

    /**
     * 获取可用对象数量
     */
    public getAvailableCount(): number {
        return this._available.length;
    }

    /**
     * 获取使用中对象数量
     */
    public getInUseCount(): number {
        return this._inUse.size;
    }

    /**
     * 获取总创建对象数量
     */
    public getTotalCreatedCount(): number {
        return this._totalCreated;
    }

    /**
     * 检查池是否为空
     */
    public isEmpty(): boolean {
        return this._available.length === 0 && this._inUse.size === 0;
    }

    /**
     * 检查池是否已满
     */
    public isFull(): boolean {
        if (this._config.maxSize === 0) {
            return false;
        }
        return this._totalCreated >= this._config.maxSize;
    }

    /**
     * 私有方法：初始化对象池
     */
    private _initializePool(): void {
        this.prefill(this._config.initialSize);
    }

    /**
     * 私有方法：重置对象状态
     */
    private _resetObject(object: T): void {
        object['_isDisposed'] = false;
        object['_referenceCount'] = 0;

        // 调用对象的_reset方法
        if (typeof object['_reset'] === 'function') {
            object['_reset']();
        }
    }

    /**
     * 私有方法：检查对象是否有效
     */
    private _isValidObject(object: T): boolean {
        return object && !object.isDisposed;
    }

    /**
     * 私有方法：启动自动清理
     */
    private _startAutoCleanup(): void {
        if (this._cleanupTimer) {
            clearInterval(this._cleanupTimer);
        }

        this._cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this._config.cleanupInterval);
    }

    /**
     * 停止自动清理
     */
    public stopAutoCleanup(): void {
        if (this._cleanupTimer) {
            clearInterval(this._cleanupTimer);
            this._cleanupTimer = null;
        }
    }

    /**
     * 销毁对象池
     */
    public destroy(): void {
        this.clear();
    }
}

/**
 * 全局对象池管理器
 */
export class ObjectPoolManager {
    private static _instance: ObjectPoolManager;
    private readonly _pools: Map<string, ObjectPool<any>> = new Map();

    private constructor() {}

    /**
     * 获取单例实例
     */
    public static getInstance(): ObjectPoolManager {
        if (!ObjectPoolManager._instance) {
            ObjectPoolManager._instance = new ObjectPoolManager();
        }
        return ObjectPoolManager._instance;
    }

    /**
     * 注册对象池
     */
    public registerPool<T extends BaseObject>(name: string, pool: ObjectPool<T>): void {
        this._pools.set(name, pool);
    }

    /**
     * 获取对象池
     */
    public getPool<T extends BaseObject>(name: string): ObjectPool<T> | null {
        return this._pools.get(name) || null;
    }

    /**
     * 注销对象池
     */
    public unregisterPool(name: string): boolean {
        return this._pools.delete(name);
    }

    /**
     * 获取所有池的统计信息
     */
    public getAllStats(): { [name: string]: any } {
        const stats: { [name: string]: any } = {};

        for (const [name, pool] of this._pools) {
            stats[name] = pool.stats;
        }

        return stats;
    }

    /**
     * 清理所有对象池
     */
    public cleanupAll(): void {
        for (const pool of this._pools.values()) {
            pool.cleanup();
        }
    }

    /**
     * 销毁所有对象池
     */
    public destroyAll(): void {
        for (const pool of this._pools.values()) {
            pool.destroy();
        }
        this._pools.clear();
    }
}

