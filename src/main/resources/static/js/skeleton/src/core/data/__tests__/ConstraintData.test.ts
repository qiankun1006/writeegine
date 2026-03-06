/**
 * ConstraintData 类单元测试
 */

import {ConstraintData, ConstraintType} from '../ConstraintData';

// 创建一个具体的约束数据类用于测试
class TestConstraintData extends ConstraintData {
    constructor(name: string) {
        super(name, ConstraintType.IK);
    }

    public override clone(): TestConstraintData {
        const constraintData = new TestConstraintData(this.name);
        constraintData.order = this.order;
        constraintData.weight = this.weight;
        constraintData.target = this.target;
        constraintData.bone = this.bone;
        constraintData.userData = this.userData;
        return constraintData;
    }
}

describe('ConstraintData', () => {
    test('should create constraint data with default values', () => {
        const constraintData = new TestConstraintData('testConstraint');
        expect(constraintData.name).toBe('testConstraint');
        expect(constraintData.type).toBe(ConstraintType.IK);
        expect(constraintData.order).toBe(0);
        expect(constraintData.weight).toBe(1);
        expect(constraintData.target).toBe('');
        expect(constraintData.bone).toBe('');
    });

    test('should set weight with clamping', () => {
        const constraintData = new TestConstraintData('testConstraint');

        constraintData.setWeight(1.5);
        expect(constraintData.weight).toBe(1);

        constraintData.setWeight(-0.5);
        expect(constraintData.weight).toBe(0);

        constraintData.setWeight(0.7);
        expect(constraintData.weight).toBe(0.7);
    });

    test('should set order', () => {
        const constraintData = new TestConstraintData('testConstraint');
        constraintData.setOrder(5);
        expect(constraintData.order).toBe(5);
    });

    test('should set target', () => {
        const constraintData = new TestConstraintData('testConstraint');
        constraintData.setTarget('targetBone');
        expect(constraintData.target).toBe('targetBone');
    });

    test('should set bone', () => {
        const constraintData = new TestConstraintData('testConstraint');
        constraintData.setBone('sourceBone');
        expect(constraintData.bone).toBe('sourceBone');
    });

    test('should clone constraint data', () => {
        const constraintData1 = new TestConstraintData('testConstraint');
        constraintData1.order = 3;
        constraintData1.weight = 0.8;
        constraintData1.target = 'targetBone';
        constraintData1.bone = 'sourceBone';

        const constraintData2 = constraintData1.clone();

        expect(constraintData2.name).toBe('testConstraint');
        expect(constraintData2.order).toBe(3);
        expect(constraintData2.weight).toBe(0.8);
        expect(constraintData2.target).toBe('targetBone');
        expect(constraintData2.bone).toBe('sourceBone');
        expect(constraintData2.type).toBe(ConstraintType.IK);
        expect(constraintData2).not.toBe(constraintData1);
    });

    test('should convert to and from JSON', () => {
        const constraintData = new TestConstraintData('testConstraint');
        constraintData.order = 2;
        constraintData.weight = 0.6;
        constraintData.target = 'targetBone';
        constraintData.bone = 'sourceBone';

        const json = constraintData.toJSON();
        const newConstraintData = new TestConstraintData('');
        newConstraintData.fromJSON(json);

        expect(newConstraintData.name).toBe('testConstraint');
        expect(newConstraintData.order).toBe(2);
        expect(newConstraintData.weight).toBe(0.6);
        expect(newConstraintData.target).toBe('targetBone');
        expect(newConstraintData.bone).toBe('sourceBone');
    });

    test('should reset data', () => {
        const constraintData = new TestConstraintData('testConstraint');
        constraintData.order = 5;
        constraintData.weight = 0.3;
        constraintData.target = 'targetBone';
        constraintData.bone = 'sourceBone';

        constraintData.reset();

        expect(constraintData.order).toBe(0);
        expect(constraintData.weight).toBe(1);
        expect(constraintData.target).toBe('');
        expect(constraintData.bone).toBe('');
    });
});

