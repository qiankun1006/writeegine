/**
 * 基础对象类 - 所有运行时对象的基类
 * @author skeleton-animation-system
 */

import {ObjectPool} from './ObjectPool';

export abstract class BaseObject {
    /**
     * 对象唯一标识符
     */
    public readonly hashCode: number;

    /**
     * 对象池引用
     */
    protected _pool: ObjectPool<BaseObject> | null = null;

    /**
     * 对象是否已被释放
     */
    protected _isDisposed: boolean = false;

    /**
     * 对象引用计数
     */
    protected _referenceCount: number = 0;

    /**
     * 静态哈希码生成器
     */
    private static _hashCodeGenerator: number = 0;

    constructor() {
        this.hashCode = ++BaseObject._hashCodeGenerator;
    }

    /**
     * 获取对象池
     */
    public get pool(): ObjectPool<BaseObject> | null {
        return this._pool;
    }

    /**
     * 设置对象池
     */
    public set pool(value: ObjectPool<BaseObject> | null) {
        this._pool = value;
    }

    /**
     * 检查对象是否已被释放
     */
    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    /**
     * 获取引用计数
     */
    public get referenceCount(): number {
        return this._referenceCount;
    }

    /**
     * 增加引用计数
     */
    public addReference(): number {
        return ++this._referenceCount;
    }

    /**
     * 减少引用计数
     */
    public removeReference(): number {
        if (this._referenceCount > 0) {
            --this._referenceCount;
        }

        // 如果引用计数为0且对象已被释放，则回收到对象池
        if (this._referenceCount === 0 && this._isDisposed && this._pool) {
            this._pool.release(this);
        }

        return this._referenceCount;
    }

    /**
     * 释放对象
     */
    public dispose(): void {
        if (this._isDisposed) {
            return;
        }

        this._isDisposed = true;

        // 重置对象状态
        this._reset();

        // 如果引用计数为0，立即回收
        if (this._referenceCount === 0 && this._pool) {
            this._pool.release(this);
        }
    }

    /**
     * 重置对象状态（子类可重写）
     */
    protected _reset(): void {
        this._referenceCount = 0;
        // 子类可以重写此方法来重置特定状态
    }

    /**
     * 克隆对象（子类必须实现）
     */
    public abstract clone(): BaseObject;

    /**
     * 比较两个对象是否相等
     */
    public equals(other: BaseObject): boolean {
        return this === other || this.hashCode === other.hashCode;
    }

    /**
     * 转换为字符串
     */
    public toString(): string {
        return `${this.constructor.name}[hashCode=${this.hashCode}, disposed=${this._isDisposed}, references=${this._referenceCount}]`;
    }

    /**
     * 获取对象类型名称
     */
    public getTypeName(): string {
        return this.constructor.name;
    }

    /**
     * 检查对象是否有效（未被释放且引用计数>0）
     */
    public isValid(): boolean {
        return !this._isDisposed && this._referenceCount > 0;
    }

    /**
     * 强制回收对象（谨慎使用）
     */
    public forceRecycle(): void {
        this._isDisposed = true;
        this._referenceCount = 0;
        this._reset();

        if (this._pool) {
            this._pool.release(this);
        }
    }

    /**
     * 静态方法：获取当前哈希码生成器值（用于调试）
     */
    public static getHashCodeGenerator(): number {
        return BaseObject._hashCodeGenerator;
    }

    /**
     * 静态方法：重置哈希码生成器（仅用于测试）
     */
    public static resetHashCodeGenerator(): void {
        BaseObject._hashCodeGenerator = 0;
    }
}

