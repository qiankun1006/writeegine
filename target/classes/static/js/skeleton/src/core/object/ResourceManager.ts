/**
 * 资源管理器 - 负责资源的加载、缓存和释放
 * @author skeleton-animation-system
 */

import {BaseObject} from './BaseObject';

/**
 * 资源状态枚举
 */
export enum ResourceState {
    Unloaded = "unloaded",
    Loading = "loading",
    Loaded = "loaded",
    Error = "error",
    Disposed = "disposed"
}

/**
 * 资源加载选项
 */
export interface ResourceLoadOptions {
    /**
     * 资源路径
     */
    path: string;

    /**
     * 资源类型
     */
    type?: string;

    /**
     * 是否缓存资源
     */
    cache?: boolean;

    /**
     * 加载优先级
     */
    priority?: number;

    /**
     * 超时时间（毫秒）
     */
    timeout?: number;

    /**
     * 重试次数
     */
    retryCount?: number;
}

/**
 * 资源信息接口
 */
export interface ResourceInfo {
    /**
     * 资源唯一标识
     */
    id: string;

    /**
     * 资源路径
     */
    path: string;

    /**
     * 资源类型
     */
    type: string;

    /**
     * 资源状态
     */
    state: ResourceState;

    /**
     * 资源数据
     */
    data: any;

    /**
     * 资源大小（字节）
     */
    size: number;

    /**
     * 加载时间
     */
    loadTime: number;

    /**
     * 最后访问时间
     */
    lastAccessTime: number;

    /**
     * 引用计数
     */
    referenceCount: number;

    /**
     * 错误信息
     */
    error?: string;
}

/**
 * 资源加载器接口
 */
export interface ResourceLoader {
    /**
     * 支持的文件类型
     */
    supportedTypes: string[];

    /**
     * 加载资源
     */
    load(path: string, options?: ResourceLoadOptions): Promise<any>;

    /**
     * 卸载资源
     */
    unload(resource: ResourceInfo): void;
}

/**
 * 基础资源加载器
 */
export class BaseResourceLoader implements ResourceLoader {
    public readonly supportedTypes: string[] = ['*'];

    public async load(path: string, options?: ResourceLoadOptions): Promise<any> {
        // 基础实现 - 子类应该重写此方法
        throw new Error(`BaseResourceLoader.load() not implemented for path: ${path}`);
    }

    public unload(resource: ResourceInfo): void {
        // 基础实现 - 子类可以重写此方法
        if (resource.data && typeof resource.data.dispose === 'function') {
            resource.data.dispose();
        }
    }
}

/**
 * 资源管理器类
 */
export class ResourceManager extends BaseObject {
    private readonly _resources: Map<string, ResourceInfo> = new Map();
    private readonly _loaders: Map<string, ResourceLoader> = new Map();
    private readonly _loadingQueue: Map<string, Promise<ResourceInfo>> = new Map();
    private readonly _cacheSize: number;
    private readonly _autoCleanup: boolean;

    private _totalMemoryUsage: number = 0;
    private _maxMemoryUsage: number = 0;

    constructor(cacheSize: number = 100, autoCleanup: boolean = true) {
        super();
        this._cacheSize = cacheSize;
        this._autoCleanup = autoCleanup;

        // 注册默认加载器
        this.registerLoader('*', new BaseResourceLoader());
    }

    /**
     * 注册资源加载器
     */
    public registerLoader(type: string, loader: ResourceLoader): void {
        this._loaders.set(type, loader);
    }

    /**
     * 注销资源加载器
     */
    public unregisterLoader(type: string): boolean {
        return this._loaders.delete(type);
    }

    /**
     * 加载资源
     */
    public async loadResource(options: ResourceLoadOptions): Promise<ResourceInfo> {
        const { path, type = this._getFileType(path), cache = true } = options;
        const resourceId = this._generateResourceId(path, type);

        // 检查是否已在缓存中
        const cachedResource = this._resources.get(resourceId);
        if (cachedResource && cachedResource.state === ResourceState.Loaded) {
            cachedResource.lastAccessTime = Date.now();
            cachedResource.referenceCount++;
            return cachedResource;
        }

        // 检查是否正在加载中
        const loadingPromise = this._loadingQueue.get(resourceId);
        if (loadingPromise) {
            return loadingPromise;
        }

        // 创建加载任务
        const loadPromise = this._loadResourceInternal(resourceId, options);
        this._loadingQueue.set(resourceId, loadPromise);

        try {
            const resource = await loadPromise;

            if (cache) {
                this._resources.set(resourceId, resource);
                this._updateMemoryUsage(resource.size);

                if (this._autoCleanup) {
                    this._cleanupIfNeeded();
                }
            }

            return resource;
        } finally {
            this._loadingQueue.delete(resourceId);
        }
    }

    /**
     * 获取资源
     */
    public getResource(id: string): ResourceInfo | null {
        const resource = this._resources.get(id);
        if (resource && resource.state === ResourceState.Loaded) {
            resource.lastAccessTime = Date.now();
            return resource;
        }
        return null;
    }

    /**
     * 释放资源
     */
    public releaseResource(id: string): boolean {
        const resource = this._resources.get(id);
        if (!resource) {
            return false;
        }

        resource.referenceCount--;

        if (resource.referenceCount <= 0) {
            this._unloadResource(resource);
            this._resources.delete(id);
            this._updateMemoryUsage(-resource.size);
        }

        return true;
    }

    /**
     * 卸载所有资源
     */
    public unloadAll(): void {
        for (const resource of this._resources.values()) {
            this._unloadResource(resource);
        }

        this._resources.clear();
        this._loadingQueue.clear();
        this._totalMemoryUsage = 0;
    }

    /**
     * 获取资源统计信息
     */
    public getStats() {
        return {
            totalResources: this._resources.size,
            loadedResources: Array.from(this._resources.values()).filter(r => r.state === ResourceState.Loaded).length,
            loadingResources: this._loadingQueue.size,
            totalMemoryUsage: this._totalMemoryUsage,
            maxMemoryUsage: this._maxMemoryUsage,
            cacheSize: this._cacheSize
        };
    }

    /**
     * 清理未使用的资源
     */
    public cleanup(): void {
        const now = Date.now();
        const unusedResources: string[] = [];

        for (const [id, resource] of this._resources) {
            if (resource.referenceCount <= 0 && resource.state === ResourceState.Loaded) {
                // 如果资源超过5分钟未被访问，则清理
                if (now - resource.lastAccessTime > 300000) {
                    unusedResources.push(id);
                }
            }
        }

        for (const id of unusedResources) {
            this.releaseResource(id);
        }
    }

    /**
     * 私有方法：内部加载资源
     */
    private async _loadResourceInternal(id: string, options: ResourceLoadOptions): Promise<ResourceInfo> {
        const { path, type = this._getFileType(path), timeout = 30000, retryCount = 3 } = options;

        const resource: ResourceInfo = {
            id,
            path,
            type,
            state: ResourceState.Loading,
            data: null,
            size: 0,
            loadTime: Date.now(),
            lastAccessTime: Date.now(),
            referenceCount: 1
        };

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                // 获取合适的加载器
                const loader = this._getLoader(type);
                if (!loader) {
                    throw new Error(`No loader found for type: ${type}`);
                }

                // 设置超时
                const loadPromise = loader.load(path, options);
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error(`Load timeout after ${timeout}ms`)), timeout);
                });

                const data = await Promise.race([loadPromise, timeoutPromise]);

                resource.data = data;
                resource.state = ResourceState.Loaded;
                resource.size = this._calculateResourceSize(data);

                return resource;

            } catch (error) {
                lastError = error as Error;

                if (attempt < retryCount) {
                    // 等待一段时间后重试
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        // 所有重试都失败
        resource.state = ResourceState.Error;
        resource.error = lastError?.message || 'Unknown error';

        throw lastError;
    }

    /**
     * 私有方法：卸载资源
     */
    private _unloadResource(resource: ResourceInfo): void {
        const loader = this._getLoader(resource.type);
        if (loader) {
            try {
                loader.unload(resource);
            } catch (error) {
                console.warn(`Error unloading resource ${resource.id}:`, error);
            }
        }

        resource.state = ResourceState.Disposed;
        resource.data = null;
    }

    /**
     * 私有方法：获取文件类型
     */
    private _getFileType(path: string): string {
        const extension = path.split('.').pop()?.toLowerCase();
        return extension || 'unknown';
    }

    /**
     * 私有方法：生成资源ID
     */
    private _generateResourceId(path: string, type: string): string {
        return `${type}:${path}`;
    }

    /**
     * 私有方法：获取加载器
     */
    private _getLoader(type: string): ResourceLoader | null {
        // 首先尝试精确匹配
        let loader = this._loaders.get(type);
        if (loader) {
            return loader;
        }

        // 然后尝试通配符匹配
        loader = this._loaders.get('*');
        if (loader) {
            const baseLoader = loader as BaseResourceLoader;
            if (baseLoader.supportedTypes.includes('*') || baseLoader.supportedTypes.includes(type)) {
                return loader;
            }
        }

        return null;
    }

    /**
     * 私有方法：计算资源大小
     */
    private _calculateResourceSize(data: any): number {
        if (!data) return 0;

        try {
            // 简单的JSON序列化大小估算
            const jsonString = JSON.stringify(data);
            return new Blob([jsonString]).size;
        } catch {
            // 如果无法序列化，返回估计值
            return 1024; // 1KB 估计值
        }
    }

    /**
     * 私有方法：更新内存使用统计
     */
    private _updateMemoryUsage(delta: number): void {
        this._totalMemoryUsage += delta;
        this._maxMemoryUsage = Math.max(this._maxMemoryUsage, this._totalMemoryUsage);
    }

    /**
     * 私有方法：根据需要清理
     */
    private _cleanupIfNeeded(): void {
        if (this._resources.size > this._cacheSize) {
            this.cleanup();
        }
    }

    /**
     * 重写clone方法
     */
    public override clone(): ResourceManager {
        const newManager = new ResourceManager(this._cacheSize, this._autoCleanup);

        // 复制加载器
        for (const [type, loader] of this._loaders) {
            newManager.registerLoader(type, loader);
        }

        return newManager;
    }
}

