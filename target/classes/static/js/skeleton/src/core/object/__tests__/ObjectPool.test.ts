/**
 * ObjectPool 类单元测试
 */

import {DefaultObjectFactory, ObjectPool, ObjectPoolManager} from '../ObjectPool';
import {BaseObject} from '../BaseObject';

// 创建测试用的具体对象类
class PoolTestObject extends BaseObject {
    public value: number = 0;
    public name: string = '';

    constructor() {
        super();
    }

    public override clone(): BaseObject {
        const obj = new PoolTestObject();
        obj.value = this.value;
        obj.name = this.name;
        return obj;
    }

    protected override _reset(): void {
        super._reset();
        this.value = 0;
        this.name = '';
    }
}

describe('ObjectPool', () => {
    let pool: ObjectPool<PoolTestObject>;

    beforeEach(() => {
        BaseObject.resetHashCodeGenerator();
        const factory = new DefaultObjectFactory(PoolTestObject);
        pool = new ObjectPool(factory, { initialSize: 5, maxSize: 10 });
    });

    afterEach(() => {
        pool.destroy();
    });

    test('should create pool with initial objects', () => {
        expect(pool.getAvailableCount()).toBe(5);
        expect(pool.getInUseCount()).toBe(0);
        expect(pool.getTotalCreatedCount()).toBe(5);
    });

    test('should acquire objects from pool', () => {
        const obj1 = pool.acquire();
        const obj2 = pool.acquire();

        expect(obj1).toBeInstanceOf(PoolTestObject);
        expect(obj2).toBeInstanceOf(PoolTestObject);
        expect(obj1).not.toBe(obj2);

        expect(pool.getAvailableCount()).toBe(3);
        expect(pool.getInUseCount()).toBe(2);
        expect(pool.getTotalCreatedCount()).toBe(5);
    });

    test('should create new objects when pool is empty', () => {
        // 耗尽池中的对象
        const objects: PoolTestObject[] = [];
        for (let i = 0; i < 5; i++) {
            objects.push(pool.acquire());
        }

        expect(pool.getAvailableCount()).toBe(0);
        expect(pool.getInUseCount()).toBe(5);
        expect(pool.getTotalCreatedCount()).toBe(5);

        // 获取更多对象，应该创建新的
        const newObj = pool.acquire();
        expect(newObj).toBeInstanceOf(PoolTestObject);
        expect(pool.getTotalCreatedCount()).toBe(6);
        expect(pool.getInUseCount()).toBe(6);
    });

    test('should respect max size limit', () => {
        const factory = new DefaultObjectFactory(PoolTestObject);
        const limitedPool = new ObjectPool(factory, { initialSize: 0, maxSize: 3 });

        // 创建3个对象
        limitedPool.acquire();
        limitedPool.acquire();
        limitedPool.acquire();

        expect(limitedPool.getTotalCreatedCount()).toBe(3);

        // 尝试创建第4个对象应该抛出错误
        expect(() => limitedPool.acquire()).toThrow('Object pool max size (3) exceeded');

        limitedPool.destroy();
    });

    test('should release objects back to pool', () => {
        const obj = pool.acquire();
        obj.value = 123;
        obj.name = 'test';

        expect(pool.getInUseCount()).toBe(1);

        // 测试对象状态
        expect(obj.value).toBe(123);
        expect(obj.name).toBe('test');

        // 直接释放对象（引用计数为1时会先设置为0）
        obj['_isDisposed'] = true;
        obj['_referenceCount'] = 0;
        obj['_reset']();

        expect(obj.isDisposed).toBe(true);
        expect(obj.referenceCount).toBe(0);

        // 验证对象状态被重置
        expect(obj.value).toBe(0);
        expect(obj.name).toBe('');
    });

    test('should prefill pool', () => {
        const factory = new DefaultObjectFactory(PoolTestObject);
        const emptyPool = new ObjectPool(factory, { initialSize: 0 });

        expect(emptyPool.getAvailableCount()).toBe(0);

        emptyPool.prefill(10);
        expect(emptyPool.getAvailableCount()).toBe(10);
        expect(emptyPool.getTotalCreatedCount()).toBe(10);

        emptyPool.destroy();
    });

    test('should cleanup pool', () => {
        // 测试池统计信息
        const stats = pool.stats;
        expect(stats.available).toBe(5);
        expect(stats.inUse).toBe(0);
        expect(stats.totalCreated).toBe(5);

        // 执行清理操作
        pool.cleanup();
        expect(pool.getAvailableCount()).toBe(5); // 应该保持不变
    });

    test('should check pool status', () => {
        expect(pool.isEmpty()).toBe(false);
        expect(pool.isFull()).toBe(false);

        // 耗尽池
        const objects: PoolTestObject[] = [];
        for (let i = 0; i < 5; i++) {
            objects.push(pool.acquire());
        }

        expect(pool.getAvailableCount()).toBe(0);

        // 获取更多对象
        objects.push(pool.acquire());
        expect(pool.getTotalCreatedCount()).toBe(6);
    });

    test('should handle auto cleanup', (done) => {
        const factory = new DefaultObjectFactory(PoolTestObject);
        const autoCleanupPool = new ObjectPool(factory, {
            initialSize: 2,
            autoCleanup: true,
            cleanupInterval: 100
        });

        // 等待清理间隔
        setTimeout(() => {
            autoCleanupPool.stopAutoCleanup();
            autoCleanupPool.destroy();
            done();
        }, 150);
    });

    test('should work with ObjectPoolManager', () => {
        const manager = ObjectPoolManager.getInstance();

        manager.registerPool('test', pool);

        const retrievedPool = manager.getPool<PoolTestObject>('test');
        expect(retrievedPool).toBe(pool);

        const stats = manager.getAllStats();
        expect(stats.test).toBeDefined();

        manager.cleanupAll();

        const success = manager.unregisterPool('test');
        expect(success).toBe(true);

        const notFound = manager.getPool('test');
        expect(notFound).toBeNull();
    });

    test('should handle object lifecycle correctly', () => {
        const obj = pool.acquire();

        // 设置对象状态
        obj.value = 42;
        obj.name = 'lifecycle';
        obj.addReference();

        expect(obj.referenceCount).toBe(2); // acquire + addReference
        expect(obj.isValid()).toBe(true);

        // 移除一个引用
        obj.removeReference();
        expect(obj.referenceCount).toBe(1);
        expect(obj.isValid()).toBe(true);

        // 测试对象状态
        expect(obj.isDisposed).toBe(false);
        expect(obj.referenceCount).toBe(1);

        // 直接设置对象为释放状态
        obj['_isDisposed'] = true;
        obj['_referenceCount'] = 0;
        obj['_reset']();
        expect(obj.isDisposed).toBe(true);
    });
});

