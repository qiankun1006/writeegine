/**
 * IKData 类单元测试
 */

import {IKData} from '../IKData';

describe('IKData', () => {
    test('should create IK data with default values', () => {
        const ikData = new IKData('testIK');
        expect(ikData.name).toBe('testIK');
        expect(ikData.bendPositive).toBe(true);
        expect(ikData.chain).toBe(0);
        expect(ikData.soft).toBe(false);
        expect(ikData.stretch).toBe(false);
        expect(ikData.compress).toBe(false);
    });

    test('should set bend direction', () => {
        const ikData = new IKData('testIK');
        ikData.setBendDirection(false);
        expect(ikData.bendPositive).toBe(false);

        ikData.setBendDirection(true);
        expect(ikData.bendPositive).toBe(true);
    });

    test('should set chain length', () => {
        const ikData = new IKData('testIK');
        ikData.setChainLength(3);
        expect(ikData.chain).toBe(3);

        ikData.setChainLength(-1);
        expect(ikData.chain).toBe(0);
    });

    test('should set soft constraint', () => {
        const ikData = new IKData('testIK');
        ikData.setSoftConstraint(true);
        expect(ikData.soft).toBe(true);
    });

    test('should set stretch', () => {
        const ikData = new IKData('testIK');
        ikData.setStretch(true);
        expect(ikData.stretch).toBe(true);
    });

    test('should set compress', () => {
        const ikData = new IKData('testIK');
        ikData.setCompress(true);
        expect(ikData.compress).toBe(true);
    });

    test('should check if single chain', () => {
        const ikData = new IKData('testIK');
        expect(ikData.isSingleChain()).toBe(true);

        ikData.setChainLength(1);
        expect(ikData.isSingleChain()).toBe(true);

        ikData.setChainLength(2);
        expect(ikData.isSingleChain()).toBe(false);
    });

    test('should check stretch capability', () => {
        const ikData = new IKData('testIK');
        expect(ikData.canStretch()).toBe(false);

        ikData.setStretch(true);
        expect(ikData.canStretch()).toBe(true);
    });

    test('should check compress capability', () => {
        const ikData = new IKData('testIK');
        expect(ikData.canCompress()).toBe(false);

        ikData.setCompress(true);
        expect(ikData.canCompress()).toBe(true);
    });

    test('should clone IK data', () => {
        const ikData1 = new IKData('testIK');
        ikData1.bendPositive = false;
        ikData1.chain = 2;
        ikData1.soft = true;
        ikData1.stretch = true;
        ikData1.compress = true;
        ikData1.order = 1;
        ikData1.weight = 0.8;
        ikData1.target = 'targetBone';
        ikData1.bone = 'sourceBone';

        const ikData2 = ikData1.clone();

        expect(ikData2.name).toBe('testIK');
        expect(ikData2.bendPositive).toBe(false);
        expect(ikData2.chain).toBe(2);
        expect(ikData2.soft).toBe(true);
        expect(ikData2.stretch).toBe(true);
        expect(ikData2.compress).toBe(true);
        expect(ikData2.order).toBe(1);
        expect(ikData2.weight).toBe(0.8);
        expect(ikData2.target).toBe('targetBone');
        expect(ikData2.bone).toBe('sourceBone');
        expect(ikData2).not.toBe(ikData1);
    });

    test('should convert to and from JSON', () => {
        const ikData = new IKData('testIK');
        ikData.bendPositive = false;
        ikData.chain = 3;
        ikData.soft = true;
        ikData.stretch = true;
        ikData.compress = true;
        ikData.order = 2;
        ikData.weight = 0.7;
        ikData.target = 'targetBone';
        ikData.bone = 'sourceBone';

        const json = ikData.toJSON();
        const newIKData = new IKData('');
        newIKData.fromJSON(json);

        expect(newIKData.name).toBe('testIK');
        expect(newIKData.bendPositive).toBe(false);
        expect(newIKData.chain).toBe(3);
        expect(newIKData.soft).toBe(true);
        expect(newIKData.stretch).toBe(true);
        expect(newIKData.compress).toBe(true);
        expect(newIKData.order).toBe(2);
        expect(newIKData.weight).toBe(0.7);
        expect(newIKData.target).toBe('targetBone');
        expect(newIKData.bone).toBe('sourceBone');
    });

    test('should reset data', () => {
        const ikData = new IKData('testIK');
        ikData.bendPositive = false;
        ikData.chain = 5;
        ikData.soft = true;
        ikData.stretch = true;
        ikData.compress = true;
        ikData.order = 3;
        ikData.weight = 0.5;
        ikData.target = 'targetBone';
        ikData.bone = 'sourceBone';

        ikData.reset();

        expect(ikData.bendPositive).toBe(true);
        expect(ikData.chain).toBe(0);
        expect(ikData.soft).toBe(false);
        expect(ikData.stretch).toBe(false);
        expect(ikData.compress).toBe(false);
        expect(ikData.order).toBe(0);
        expect(ikData.weight).toBe(1);
        expect(ikData.target).toBe('');
        expect(ikData.bone).toBe('');
    });
});

