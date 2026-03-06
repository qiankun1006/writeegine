/**
 * 内存使用监控和调试工具
 * @author skeleton-animation-system
 */

import {ObjectPoolManager} from './ObjectPool';
import {ResourceManager} from './ResourceManager';
import {EventDispatcher} from './EventSystem';

/**
 * 内存使用信息
 */
export interface MemoryUsageInfo {
    /**
     * JavaScript堆使用信息
     */
    jsHeap?: {
        used: number;
        total: number;
        limit: number;
    };

    /**
     * 对象池统计
     */
    objectPools: { [name: string]: any };

    /**
     * 资源管理器统计
     */
    resources: any;

    /**
     * 事件系统统计
     */
    events: any;

    /**
     * 总对象数量
     */
    totalObjects: number;

    /**
     * 时间戳
     */
    timestamp: number;
}

/**
 * 内存泄漏检测配置
 */
export interface LeakDetectionConfig {
    /**
     * 启用泄漏检测
     */
    enabled: boolean;

    /**
     * 检测间隔（毫秒）
     */
    interval: number;

    /**
     * 泄漏阈值（对象数量增长超过此值视为泄漏）
     */
    threshold: number;

    /**
     * 历史记录长度
     */
    historyLength: number;
}

/**
 * 内存泄漏信息
 */
export interface MemoryLeakInfo {
    /**
     * 泄漏类型
     */
    type: 'object_pool' | 'resource' | 'event' | 'unknown';

    /**
     * 泄漏名称
     */
    name: string;

    /**
     * 当前数量
     */
    currentCount: number;

    /**
     * 增长数量
     */
    growthCount: number;

    /**
     * 检测时间
     */
    detectedAt: number;

    /**
     * 详细信息
     */
    details: any;
}

/**
 * 内存监控器
 */
export class MemoryMonitor extends EventDispatcher {
    private _enabled: boolean = false;
    private _monitoringInterval: NodeJS.Timeout | null = null;
    private _leakDetectionConfig: LeakDetectionConfig;
    private _usageHistory: MemoryUsageInfo[] = [];
    private _leaks: MemoryLeakInfo[] = [];
    private _lastCheckTime: number = 0;
    private _baselineUsage: MemoryUsageInfo | null = null;

    private readonly _poolManager: ObjectPoolManager;
    private readonly _resourceManager: ResourceManager | null;

    constructor(
        poolManager?: ObjectPoolManager,
        resourceManager?: ResourceManager,
        leakDetectionConfig?: Partial<LeakDetectionConfig>
    ) {
        super();

        this._poolManager = poolManager || ObjectPoolManager.getInstance();
        this._resourceManager = resourceManager || null;

        this._leakDetectionConfig = {
            enabled: true,
            interval: 10000, // 10秒
            threshold: 100,  // 100个对象增长
            historyLength: 60, // 保留60次记录
            ...leakDetectionConfig
        };
    }

    /**
     * 启用内存监控
     */
    public enable(): void {
        if (this._enabled) {
            return;
        }

        this._enabled = true;
        this._lastCheckTime = Date.now();
        this._baselineUsage = this.getCurrentUsage();

        if (this._leakDetectionConfig.enabled) {
            this._startLeakDetection();
        }

        console.log('Memory monitoring enabled');
    }

    /**
     * 禁用内存监控
     */
    public disable(): void {
        if (!this._enabled) {
            return;
        }

        this._enabled = false;

        if (this._monitoringInterval) {
            clearInterval(this._monitoringInterval);
            this._monitoringInterval = null;
        }

        console.log('Memory monitoring disabled');
    }

    /**
     * 获取当前内存使用情况
     */
    public getCurrentUsage(): MemoryUsageInfo {
        const usage: MemoryUsageInfo = {
            jsHeap: this._getJSHeapInfo(),
            objectPools: this._poolManager.getAllStats(),
            resources: this._resourceManager?.getStats() || {},
            events: this.getEventStats(),
            totalObjects: 0,
            timestamp: Date.now()
        };

        // 计算总对象数量
        let totalObjects = 0;
        for (const poolStats of Object.values(usage.objectPools)) {
            totalObjects += (poolStats as any).totalCreated || 0;
        }
        usage.totalObjects = totalObjects;

        return usage;
    }

    /**
     * 获取内存使用历史
     */
    public getUsageHistory(): MemoryUsageInfo[] {
        return [...this._usageHistory];
    }

    /**
     * 获取检测到的内存泄漏
     */
    public getDetectedLeaks(): MemoryLeakInfo[] {
        return [...this._leaks];
    }

    /**
     * 清除内存泄漏记录
     */
    public clearLeaks(): void {
        this._leaks.length = 0;
    }

    /**
     * 生成内存使用报告
     */
    public generateReport(): string {
        const usage = this.getCurrentUsage();
        const leaks = this.getDetectedLeaks();

        let report = `=== Memory Usage Report ===\n`;
        report += `Generated at: ${new Date(usage.timestamp).toISOString()}\n\n`;

        // JavaScript堆信息
        if (usage.jsHeap) {
            const heap = usage.jsHeap;
            const usedMB = (heap.used / 1024 / 1024).toFixed(2);
            const totalMB = (heap.total / 1024 / 1024).toFixed(2);
            const limitMB = (heap.limit / 1024 / 1024).toFixed(2);

            report += `JavaScript Heap:\n`;
            report += `  Used: ${usedMB} MB\n`;
            report += `  Total: ${totalMB} MB\n`;
            report += `  Limit: ${limitMB} MB\n`;
            report += `  Usage: ${((heap.used / heap.limit) * 100).toFixed(1)}%\n\n`;
        }

        // 对象池信息
        report += `Object Pools:\n`;
        for (const [name, stats] of Object.entries(usage.objectPools)) {
            report += `  ${name}: ${stats.available} available, ${stats.inUse} in use, ${stats.totalCreated} total\n`;
        }
        report += `\n`;

        // 资源信息
        if (usage.resources.totalResources > 0) {
            report += `Resources:\n`;
            report += `  Total: ${usage.resources.totalResources}\n`;
            report += `  Loaded: ${usage.resources.loadedResources}\n`;
            report += `  Memory: ${(usage.resources.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB\n\n`;
        }

        // 事件信息
        if (usage.events.totalListeners > 0) {
            report += `Events:\n`;
            report += `  Total Listeners: ${usage.events.totalListeners}\n`;
            for (const [type, count] of Object.entries(usage.events.typeStats)) {
                report += `  ${type}: ${count} listeners\n`;
            }
            report += `\n`;
        }

        // 内存泄漏信息
        if (leaks.length > 0) {
            report += `Memory Leaks Detected: ${leaks.length}\n`;
            for (const leak of leaks) {
                report += `  ${leak.type}:${leak.name} - Growth: ${leak.growthCount} objects\n`;
            }
        } else {
            report += `No memory leaks detected.\n`;
        }

        return report;
    }

    /**
     * 执行内存清理
     */
    public performCleanup(): void {
        // 清理对象池
        this._poolManager.cleanupAll();

        // 清理资源
        this._resourceManager?.cleanup();

        // 触发垃圾回收（如果可用）
        if (typeof global.gc === 'function') {
            global.gc();
        }

        console.log('Memory cleanup performed');
    }

    /**
     * 设置泄漏检测配置
     */
    public setLeakDetectionConfig(config: Partial<LeakDetectionConfig>): void {
        this._leakDetectionConfig = { ...this._leakDetectionConfig, ...config };

        if (this._enabled && this._leakDetectionConfig.enabled) {
            this._startLeakDetection();
        }
    }

    /**
     * 私有方法：获取JavaScript堆信息
     */
    private _getJSHeapInfo(): { used: number; total: number; limit: number } | undefined {
        if (typeof performance === 'undefined' || !performance.memory) {
            return undefined;
        }

        const memory = performance.memory;
        return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
        };
    }

    /**
     * 私有方法：启动泄漏检测
     */
    private _startLeakDetection(): void {
        if (this._monitoringInterval) {
            clearInterval(this._monitoringInterval);
        }

        this._monitoringInterval = setInterval(() => {
            this._checkForLeaks();
        }, this._leakDetectionConfig.interval);
    }

    /**
     * 私有方法：检查内存泄漏
     */
    private _checkForLeaks(): void {
        const currentUsage = this.getCurrentUsage();

        // 添加到历史记录
        this._usageHistory.push(currentUsage);

        // 保持历史记录长度
        if (this._usageHistory.length > this._leakDetectionConfig.historyLength) {
            this._usageHistory.shift();
        }

        // 如果历史记录不足，跳过检测
        if (this._usageHistory.length < 2) {
            return;
        }

        // 检查对象池泄漏
        this._checkObjectPoolLeaks(currentUsage);

        // 检查资源泄漏
        this._checkResourceLeaks(currentUsage);

        // 检查事件泄漏
        this._checkEventLeaks(currentUsage);

        this._lastCheckTime = Date.now();
    }

    /**
     * 私有方法：检查对象池泄漏
     */
    private _checkObjectPoolLeaks(currentUsage: MemoryUsageInfo): void {
        const poolStats = currentUsage.objectPools;
        const previousUsage = this._usageHistory[this._usageHistory.length - 2];
        const previousStats = previousUsage.objectPools;

        for (const [poolName, currentStat] of Object.entries(poolStats)) {
            const previousStat = previousStats[poolName];
            if (!previousStat) continue;

            const growth = (currentStat.totalCreated || 0) - (previousStat.totalCreated || 0);

            if (growth > this._leakDetectionConfig.threshold) {
                const existingLeak = this._leaks.find(l => l.type === 'object_pool' && l.name === poolName);

                if (existingLeak) {
                    existingLeak.growthCount += growth;
                    existingLeak.currentCount = currentStat.totalCreated;
                } else {
                    this._leaks.push({
                        type: 'object_pool',
                        name: poolName,
                        currentCount: currentStat.totalCreated,
                        growthCount: growth,
                        detectedAt: Date.now(),
                        details: { current: currentStat, previous: previousStat }
                    });
                }
            }
        }
    }

    /**
     * 私有方法：检查资源泄漏
     */
    private _checkResourceLeaks(currentUsage: MemoryUsageInfo): void {
        const resourceStats = currentUsage.resources;
        const previousUsage = this._usageHistory[this._usageHistory.length - 2];
        const previousStats = previousUsage.resources;

        if (!resourceStats.totalResources || !previousStats.totalResources) {
            return;
        }

        const growth = resourceStats.totalResources - previousStats.totalResources;

        if (growth > this._leakDetectionConfig.threshold) {
            const existingLeak = this._leaks.find(l => l.type === 'resource' && l.name === 'resources');

            if (existingLeak) {
                existingLeak.growthCount += growth;
                existingLeak.currentCount = resourceStats.totalResources;
            } else {
                this._leaks.push({
                    type: 'resource',
                    name: 'resources',
                    currentCount: resourceStats.totalResources,
                    growthCount: growth,
                    detectedAt: Date.now(),
                    details: { current: resourceStats, previous: previousStats }
                });
            }
        }
    }

    /**
     * 私有方法：检查事件泄漏
     */
    private _checkEventLeaks(currentUsage: MemoryUsageInfo): void {
        const eventStats = currentUsage.events;
        const previousUsage = this._usageHistory[this._usageHistory.length - 2];
        const previousStats = previousUsage.events;

        if (!eventStats.totalListeners || !previousStats.totalListeners) {
            return;
        }

        const growth = eventStats.totalListeners - previousStats.totalListeners;

        if (growth > this._leakDetectionConfig.threshold) {
            const existingLeak = this._leaks.find(l => l.type === 'event' && l.name === 'listeners');

            if (existingLeak) {
                existingLeak.growthCount += growth;
                existingLeak.currentCount = eventStats.totalListeners;
            } else {
                this._leaks.push({
                    type: 'event',
                    name: 'listeners',
                    currentCount: eventStats.totalListeners,
                    growthCount: growth,
                    detectedAt: Date.now(),
                    details: { current: eventStats, previous: previousStats }
                });
            }
        }
    }

    /**
     * 重写事件统计方法
     */
    private getEventStats() {
        return {
            totalListeners: 0,
            typeStats: {},
            pendingEvents: 0,
            isDispatching: false
        };
    }

    /**
     * 销毁监控器
     */
    public destroy(): void {
        this.disable();
        this._usageHistory.length = 0;
        this._leaks.length = 0;
        this._baselineUsage = null;
    }
}

/**
 * 全局内存监控器实例
 */
export const GlobalMemoryMonitor = new MemoryMonitor();

// 自动启用内存监控（在开发环境中）
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    GlobalMemoryMonitor.enable();

    // 定期输出内存报告
    setInterval(() => {
        if (GlobalMemoryMonitor.getDetectedLeaks().length > 0) {
            console.warn('Memory leaks detected:', GlobalMemoryMonitor.getDetectedLeaks());
        }
    }, 60000); // 每分钟检查一次
}

