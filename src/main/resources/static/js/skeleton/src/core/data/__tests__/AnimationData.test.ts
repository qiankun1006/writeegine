/**
 * AnimationData 类单元测试
 */

import {AnimationData} from '../AnimationData';
import {TimelineData, TimelineType} from '../TimelineData';
import {FrameData} from '../FrameData';

describe('AnimationData', () => {
    test('should create animation data with default values', () => {
        const animationData = new AnimationData('testAnimation');
        expect(animationData.name).toBe('testAnimation');
        expect(animationData.duration).toBe(0);
        expect(animationData.playTimes).toBe(1);
        expect(animationData.fadeInTime).toBe(0);
        expect(animationData.speed).toBe(1);
        expect(animationData.scale).toBe(1);
        expect(animationData.loop).toBe(0);
        expect(animationData.autoTween).toBe(false);
        expect(animationData.timelines.size).toBe(0);
    });

    test('should add and get timeline data', () => {
        const animationData = new AnimationData('testAnimation');
        const timelineData = new TimelineData('boneTimeline');
        timelineData.setType(TimelineType.Bone);

        animationData.addTimelineData(timelineData);
        expect(animationData.timelines.size).toBe(1);

        const retrieved = animationData.getTimelineData('boneTimeline');
        expect(retrieved).toBe(timelineData);
        expect(retrieved?.type).toBe(TimelineType.Bone);
    });

    test('should remove timeline data', () => {
        const animationData = new AnimationData('testAnimation');
        const timelineData = new TimelineData('boneTimeline');

         animationData.addTimelineData(timelineData);
         expect(animationData.timelines.size).toBe(1);

         const removed = animationData.removeTimelineData('boneTimeline');
         expect(removed).toBe(true);
         expect(animationData.timelines.size).toBe(0);

        const notFound = animationData.getTimelineData('boneTimeline');
        expect(notFound).toBeNull();
    });

    test('should calculate total frames', () => {
        const animationData = new AnimationData('testAnimation');
        animationData.duration = 1000; // 1 second

        expect(animationData.getTotalFrames(24)).toBe(24); // 24 fps
        expect(animationData.getTotalFrames(30)).toBe(30); // 30 fps
        expect(animationData.getTotalFrames(60)).toBe(60); // 60 fps
    });

    test('should check if animation is loop', () => {
        const animationData = new AnimationData('testAnimation');

        expect(animationData.isLoop()).toBe(false);

        animationData.loop = 1;
        expect(animationData.isLoop()).toBe(true);

        animationData.loop = 0;
        animationData.playTimes = 3;
        expect(animationData.isLoop()).toBe(true);
    });

    test('should get actual play times', () => {
        const animationData = new AnimationData('testAnimation');

        expect(animationData.getPlayTimes()).toBe(1);

        animationData.playTimes = 5;
        expect(animationData.getPlayTimes()).toBe(5);

        animationData.playTimes = 0;
        expect(animationData.getPlayTimes()).toBe(1);
    });

    test('should clone animation data', () => {
        const animationData1 = new AnimationData('testAnimation');
        animationData1.duration = 2000;
        animationData1.playTimes = 3;
        animationData1.speed = 1.5;

        const timelineData = new TimelineData('boneTimeline');
        timelineData.setType(TimelineType.Bone);
        animationData1.addTimelineData(timelineData);

        const animationData2 = animationData1.clone();

        expect(animationData2.name).toBe('testAnimation');
        expect(animationData2.duration).toBe(2000);
        expect(animationData2.playTimes).toBe(3);
        expect(animationData2.speed).toBe(1.5);
         expect(animationData2.timelines.size).toBe(1);
        expect(animationData2).not.toBe(animationData1); // Different objects
    });

    test('should convert to and from JSON', () => {
        const animationData = new AnimationData('testAnimation');
        animationData.duration = 1500;
        animationData.playTimes = 2;
        animationData.speed = 0.8;
        animationData.loop = 1;
        animationData.autoTween = true;

        const timelineData = new TimelineData('boneTimeline');
        timelineData.setType(TimelineType.Bone);
        timelineData.setOffset(10);

        const frameData = FrameData.createKeyFrame(0, 500, { x: 10, y: 20 });
        timelineData.addFrameData(frameData);

        animationData.addTimelineData(timelineData);

        const json = animationData.toJSON();
        const newAnimationData = new AnimationData();
        newAnimationData.fromJSON(json);

        expect(newAnimationData.name).toBe('testAnimation');
        expect(newAnimationData.duration).toBe(1500);
        expect(newAnimationData.playTimes).toBe(2);
        expect(newAnimationData.speed).toBe(0.8);
        expect(newAnimationData.loop).toBe(1);
        expect(newAnimationData.autoTween).toBe(true);
         expect(newAnimationData.timelines.size).toBe(1);

        const newTimeline = newAnimationData.getTimelineData('boneTimeline');
        expect(newTimeline?.type).toBe(TimelineType.Bone);
        expect(newTimeline?.offset).toBe(10);
        expect(newTimeline?.getFrameCount()).toBe(1);
    });

    test('should set loop properties', () => {
        const animationData = new AnimationData('testAnimation');
        animationData.setLoop(2, 3);

        expect(animationData.loop).toBe(2);
        expect(animationData.playTimes).toBe(3);
    });

    test('should set speed', () => {
        const animationData = new AnimationData('testAnimation');
        animationData.setSpeed(2.0);

        expect(animationData.speed).toBe(2.0);
    });

    test('should set fade in time', () => {
        const animationData = new AnimationData('testAnimation');
        animationData.setFadeInTime(0.5);

        expect(animationData.fadeInTime).toBe(0.5);
    });
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeCloseTo(actual: number, precision?: number): R;
        }
    }
}

