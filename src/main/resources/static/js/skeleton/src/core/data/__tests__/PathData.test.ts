/**
 * PathData 类单元测试
 */

import {PathData, PositionMode, RotateMode, SpacingMode} from '../PathData';

describe('PathData', () => {
    test('should create path data with default values', () => {
        const pathData = new PathData('testPath');
        expect(pathData.name).toBe('testPath');
        expect(pathData.positionMode).toBe(PositionMode.Percent);
        expect(pathData.spacingMode).toBe(SpacingMode.Length);
        expect(pathData.rotateMode).toBe(RotateMode.Tangent);
        expect(pathData.offsetRotation).toBe(0);
        expect(pathData.position).toBe(0);
        expect(pathData.spacing).toBe(0);
        expect(pathData.rotate).toBe(0);
        expect(pathData.getBoneCount()).toBe(0);
    });

    test('should add and remove bones', () => {
        const pathData = new PathData('testPath');

        pathData.addBone('bone1');
        expect(pathData.getBoneCount()).toBe(1);

        pathData.addBone('bone2');
        expect(pathData.getBoneCount()).toBe(2);

        // 添加重复骨骼
        pathData.addBone('bone1');
        expect(pathData.getBoneCount()).toBe(2);

        const removed = pathData.removeBone('bone1');
        expect(removed).toBe(true);
        expect(pathData.getBoneCount()).toBe(1);

        const notRemoved = pathData.removeBone('nonexistent');
        expect(notRemoved).toBe(false);
    });

    test('should set position mode', () => {
        const pathData = new PathData('testPath');
        pathData.setPositionMode(PositionMode.Fixed);
        expect(pathData.positionMode).toBe(PositionMode.Fixed);
    });

    test('should set spacing mode', () => {
        const pathData = new PathData('testPath');
        pathData.setSpacingMode(SpacingMode.Fixed);
        expect(pathData.spacingMode).toBe(SpacingMode.Fixed);
    });

    test('should set rotate mode', () => {
        const pathData = new PathData('testPath');
        pathData.setRotateMode(RotateMode.Chain);
        expect(pathData.rotateMode).toBe(RotateMode.Chain);
    });

    test('should set offset rotation', () => {
        const pathData = new PathData('testPath');
        pathData.setOffsetRotation(45);
        expect(pathData.offsetRotation).toBe(45);
    });

    test('should set position', () => {
        const pathData = new PathData('testPath');
        pathData.setPosition(0.5);
        expect(pathData.position).toBe(0.5);
    });

    test('should set spacing', () => {
        const pathData = new PathData('testPath');
        pathData.setSpacing(10);
        expect(pathData.spacing).toBe(10);
    });

    test('should set rotate', () => {
        const pathData = new PathData('testPath');
        pathData.setRotate(90);
        expect(pathData.rotate).toBe(90);
    });

    test('should clear all bones', () => {
        const pathData = new PathData('testPath');
        pathData.addBone('bone1');
        pathData.addBone('bone2');
        pathData.addBone('bone3');
        expect(pathData.getBoneCount()).toBe(3);

        pathData.clearBones();
        expect(pathData.getBoneCount()).toBe(0);
    });

    test('should clone path data', () => {
        const pathData1 = new PathData('testPath');
        pathData1.positionMode = PositionMode.Fixed;
        pathData1.spacingMode = SpacingMode.Percent;
        pathData1.rotateMode = RotateMode.ChainScale;
        pathData1.offsetRotation = 30;
        pathData1.position = 0.3;
        pathData1.spacing = 5;
        pathData1.rotate = 45;
        pathData1.addBone('bone1');
        pathData1.addBone('bone2');
        pathData1.order = 1;
        pathData1.weight = 0.8;
        pathData1.target = 'targetPath';
        pathData1.bone = 'sourceBone';

        const pathData2 = pathData1.clone();

        expect(pathData2.name).toBe('testPath');
        expect(pathData2.positionMode).toBe(PositionMode.Fixed);
        expect(pathData2.spacingMode).toBe(SpacingMode.Percent);
        expect(pathData2.rotateMode).toBe(RotateMode.ChainScale);
        expect(pathData2.offsetRotation).toBe(30);
        expect(pathData2.position).toBe(0.3);
        expect(pathData2.spacing).toBe(5);
        expect(pathData2.rotate).toBe(45);
        expect(pathData2.getBoneCount()).toBe(2);
        expect(pathData2.order).toBe(1);
        expect(pathData2.weight).toBe(0.8);
        expect(pathData2.target).toBe('targetPath');
        expect(pathData2.bone).toBe('sourceBone');
        expect(pathData2).not.toBe(pathData1);
    });

    test('should convert to and from JSON', () => {
        const pathData = new PathData('testPath');
        pathData.positionMode = PositionMode.Fixed;
        pathData.spacingMode = SpacingMode.Percent;
        pathData.rotateMode = RotateMode.Fixed;
        pathData.offsetRotation = 60;
        pathData.position = 0.7;
        pathData.spacing = 15;
        pathData.rotate = 120;
        pathData.addBone('bone1');
        pathData.addBone('bone2');
        pathData.order = 3;
        pathData.weight = 0.6;
        pathData.target = 'targetPath';
        pathData.bone = 'sourceBone';

        const json = pathData.toJSON();
        const newPathData = new PathData('');
        newPathData.fromJSON(json);

        expect(newPathData.name).toBe('testPath');
        expect(newPathData.positionMode).toBe(PositionMode.Fixed);
        expect(newPathData.spacingMode).toBe(SpacingMode.Percent);
        expect(newPathData.rotateMode).toBe(RotateMode.Fixed);
        expect(newPathData.offsetRotation).toBe(60);
        expect(newPathData.position).toBe(0.7);
        expect(newPathData.spacing).toBe(15);
        expect(newPathData.rotate).toBe(120);
        expect(newPathData.getBoneCount()).toBe(2);
        expect(newPathData.order).toBe(3);
        expect(newPathData.weight).toBe(0.6);
        expect(newPathData.target).toBe('targetPath');
        expect(newPathData.bone).toBe('sourceBone');
    });

    test('should reset data', () => {
        const pathData = new PathData('testPath');
        pathData.positionMode = PositionMode.Fixed;
        pathData.spacingMode = SpacingMode.Percent;
        pathData.rotateMode = RotateMode.Chain;
        pathData.offsetRotation = 90;
        pathData.position = 0.8;
        pathData.spacing = 20;
        pathData.rotate = 180;
        pathData.addBone('bone1');
        pathData.addBone('bone2');
        pathData.order = 4;
        pathData.weight = 0.4;
        pathData.target = 'targetPath';
        pathData.bone = 'sourceBone';

        pathData.reset();

        expect(pathData.positionMode).toBe(PositionMode.Percent);
        expect(pathData.spacingMode).toBe(SpacingMode.Length);
        expect(pathData.rotateMode).toBe(RotateMode.Tangent);
        expect(pathData.offsetRotation).toBe(0);
        expect(pathData.position).toBe(0);
        expect(pathData.spacing).toBe(0);
        expect(pathData.rotate).toBe(0);
        expect(pathData.getBoneCount()).toBe(0);
        expect(pathData.order).toBe(0);
        expect(pathData.weight).toBe(1);
        expect(pathData.target).toBe('');
        expect(pathData.bone).toBe('');
    });
});

