/**
 * BoneData 类单元测试
 */

import {BoneData} from '../BoneData';

describe('BoneData', () => {
    test('should create bone data with default values', () => {
        const boneData = new BoneData('testBone');
        expect(boneData.name).toBe('testBone');
        expect(boneData.parent).toBe('');
        expect(boneData.length).toBe(0);
        expect(boneData.inheritTranslation).toBe(true);
        expect(boneData.inheritRotation).toBe(true);
        expect(boneData.inheritScale).toBe(true);
        expect(boneData.inheritReflection).toBe(false);
    });

    test('should reset bone data', () => {
        const boneData = new BoneData('testBone');
        boneData.parent = 'parentBone';
        boneData.length = 100;
        boneData.inheritTranslation = false;
        boneData.reset();

        expect(boneData.name).toBe('');
        expect(boneData.parent).toBe('');
        expect(boneData.length).toBe(0);
        expect(boneData.inheritTranslation).toBe(true);
        expect(boneData.inheritRotation).toBe(true);
        expect(boneData.inheritScale).toBe(true);
        expect(boneData.inheritReflection).toBe(false);
    });

    test('should clone bone data', () => {
        const boneData1 = new BoneData('testBone');
        boneData1.parent = 'parentBone';
        boneData1.length = 50;
        boneData1.inheritTranslation = false;
        boneData1.transform.x = 10;
        boneData1.transform.y = 20;

        const boneData2 = boneData1.clone();

        expect(boneData2.name).toBe('testBone');
        expect(boneData2.parent).toBe('parentBone');
        expect(boneData2.length).toBe(50);
        expect(boneData2.inheritTranslation).toBe(false);
        expect(boneData2.transform.x).toBe(10);
        expect(boneData2.transform.y).toBe(20);
        expect(boneData2).not.toBe(boneData1); // Different objects
    });

    test('should convert to and from JSON', () => {
        const boneData = new BoneData('testBone');
        boneData.parent = 'parentBone';
        boneData.length = 75;
        boneData.inheritTranslation = false;
        boneData.transform.setTo(5, 15, 0.1, 0.2, 1.1, 0.9);

        const json = boneData.toJSON();
        const newBoneData = new BoneData();
        newBoneData.fromJSON(json);

        expect(newBoneData.name).toBe('testBone');
        expect(newBoneData.parent).toBe('parentBone');
        expect(newBoneData.length).toBe(75);
        expect(newBoneData.inheritTranslation).toBe(false);
        expect(newBoneData.transform.x).toBe(5);
        expect(newBoneData.transform.y).toBe(15);
        expect(newBoneData.transform.skewX).toBeCloseTo(0.1);
        expect(newBoneData.transform.skewY).toBeCloseTo(0.2);
        expect(newBoneData.transform.scaleX).toBeCloseTo(1.1);
        expect(newBoneData.transform.scaleY).toBeCloseTo(0.9);
    });

    test('should check inherit transform', () => {
        const boneData = new BoneData();
        expect(boneData.isInheritTransform()).toBe(true);

        boneData.inheritTranslation = false;
        expect(boneData.isInheritTransform()).toBe(false);

        boneData.inheritTranslation = true;
        boneData.inheritRotation = false;
        expect(boneData.isInheritTransform()).toBe(false);
    });

    test('should set inherit properties', () => {
        const boneData = new BoneData();
        boneData.setInherit(false, true, false, true);

        expect(boneData.inheritTranslation).toBe(false);
        expect(boneData.inheritRotation).toBe(true);
        expect(boneData.inheritScale).toBe(false);
        expect(boneData.inheritReflection).toBe(true);
    });
});

