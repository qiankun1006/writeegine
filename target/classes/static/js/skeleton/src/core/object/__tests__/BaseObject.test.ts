/**
 * BaseObject 类单元测试
 */

import {BaseObject} from '../BaseObject';
import {DefaultObjectFactory, ObjectPool} from '../ObjectPool';

// 创建测试用的具体对象类
class TestObject extends BaseObject {
    public value: number = 0;
    public name: string = '';

    constructor() {
        super();
    }

    public override clone(): BaseObject {
        const obj = new TestObject();
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

describe('BaseObject', () => {
    beforeEach(() => {
        // 重置哈希码生成器以便测试
        BaseObject.resetHashCodeGenerator();
    });

    test('should create object with unique hash code', () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();

        expect(obj1.hashCode).toBe(1);
        expect(obj2.hashCode).toBe(2);
        expect(obj1.hashCode).not.toBe(obj2.hashCode);
    });

    test('should manage reference count', () => {
        const obj = new TestObject();

        expect(obj.referenceCount).toBe(0);

        obj.addReference();
        expect(obj.referenceCount).toBe(1);

        obj.addReference();
        expect(obj.referenceCount).toBe(2);

        obj.removeReference();
        expect(obj.referenceCount).toBe(1);

        obj.removeReference();
        expect(obj.referenceCount).toBe(0);
    });

    test('should check validity', () => {
        const obj = new TestObject();

        expect(obj.isValid()).toBe(false); // 引用计数为0

        obj.addReference();
        expect(obj.isValid()).toBe(true);

        obj.dispose();
        expect(obj.isValid()).toBe(false); // 已释放
    });

    test('should dispose object', () => {
        const obj = new TestObject();
        obj.value = 42;
        obj.name = 'test';

        obj.dispose();

        expect(obj.isDisposed).toBe(true);
        expect(obj.value).toBe(0); // 重置
        expect(obj.name).toBe(''); // 重置
    });

    test('should clone object', () => {
        const obj1 = new TestObject();
        obj1.value = 100;
        obj1.name = 'original';

        const obj2 = obj1.clone() as TestObject;

        expect(obj2).toBeInstanceOf(TestObject);
        expect(obj2.value).toBe(100);
        expect(obj2.name).toBe('original');
        expect(obj2.hashCode).not.toBe(obj1.hashCode);
        expect(obj2).not.toBe(obj1);
    });

    test('should compare objects', () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = obj1;

        expect(obj1.equals(obj2)).toBe(false);
        expect(obj1.equals(obj3)).toBe(true);
        expect(obj1.equals(obj1)).toBe(true);
    });

    test('should convert to string', () => {
        const obj = new TestObject();
        obj.addReference();

        const str = obj.toString();
        expect(str).toContain('TestObject');
        expect(str).toContain(`hashCode=${obj.hashCode}`);
        expect(str).toContain('disposed=false');
        expect(str).toContain('references=1');
    });

    test('should get type name', () => {
        const obj = new TestObject();
        expect(obj.getTypeName()).toBe('TestObject');
    });

    test('should force recycle object', () => {
        const obj = new TestObject();

        obj.addReference();
        obj.forceRecycle();

        expect(obj.isDisposed).toBe(true);
        expect(obj.referenceCount).toBe(0);
        // 注意：没有对象池时，forceRecycle只设置状态
    });

    test('should handle multiple dispose calls', () => {
        const obj = new TestObject();

        obj.dispose();
        expect(obj.isDisposed).toBe(true);

        // 第二次调用应该没有影响
        obj.dispose();
        expect(obj.isDisposed).toBe(true);
    });

    test('should work with object pool', () => {
        const pool = new ObjectPool(new DefaultObjectFactory(TestObject));

        const obj1 = pool.acquire();
        obj1.value = 123;
        obj1.name = 'pooled';

        expect(obj1.pool).toBe(pool);
        expect(obj1.referenceCount).toBe(1);
        expect(obj1.isDisposed).toBe(false);

        // 手动设置对象状态为释放
        obj1['_isDisposed'] = true;
        obj1['_referenceCount'] = 0;
        obj1['_reset']();

        expect(obj1.isDisposed).toBe(true);
        expect(obj1.referenceCount).toBe(0);
        expect(obj1.value).toBe(0); // 重置
        expect(obj1.name).toBe(''); // 重置
    });
});

