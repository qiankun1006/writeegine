/**
 * 动画数据类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';
import {TimelineData} from './TimelineData';

export class AnimationData extends BaseData {
    public duration: number = 0;
    public playTimes: number = 1;
    public fadeInTime: number = 0;
    public speed: number = 1;
    public scale: number = 1;
    public loop: number = 0;
    public autoTween: boolean = false;

    public readonly timelines: Map<string, TimelineData> = new Map();
    public timelineMap: { [key: string]: string[] } = {};

    constructor(name: string = "") {
        super(name);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.duration = 0;
        this.playTimes = 1;
        this.fadeInTime = 0;
        this.speed = 1;
        this.scale = 1;
        this.loop = 0;
        this.autoTween = false;
        this.timelines.clear();
        this.timelineMap = {};
    }

    /**
     * 添加时间轴数据
     */
    public addTimelineData(timelineData: TimelineData): void {
        if (timelineData.name && !this.timelines.has(timelineData.name)) {
            this.timelines.set(timelineData.name, timelineData);
        }
    }

    /**
     * 获取时间轴数据
     */
    public getTimelineData(name: string): TimelineData | null {
        return this.timelines.get(name) || null;
    }

    /**
     * 移除时间轴数据
     */
    public removeTimelineData(name: string): boolean {
        return this.timelines.delete(name);
    }

    /**
     * 获取时间轴数量
     */
    public getTimelineCount(): number {
        return this.timelines.size;
    }

    /**
     * 获取动画总帧数（基于帧率）
     */
    public getTotalFrames(frameRate: number = 24): number {
        if (frameRate <= 0) return 0;
        return Math.ceil(this.duration * frameRate / 1000);
    }

    /**
     * 检查是否为循环动画
     */
    public isLoop(): boolean {
        return this.loop > 0 || this.playTimes > 1;
    }

    /**
     * 获取实际播放次数
     */
    public getPlayTimes(): number {
        return this.playTimes > 0 ? this.playTimes : 1;
    }

    /**
     * 克隆动画数据
     */
    public override clone(): AnimationData {
        const animationData = new AnimationData(this.name);

        animationData.duration = this.duration;
        animationData.playTimes = this.playTimes;
        animationData.fadeInTime = this.fadeInTime;
        animationData.speed = this.speed;
        animationData.scale = this.scale;
        animationData.loop = this.loop;
        animationData.autoTween = this.autoTween;

        // 克隆时间轴数据
        for (const timeline of this.timelines.values()) {
            animationData.addTimelineData(timeline.clone());
        }

        animationData.timelineMap = { ...this.timelineMap };
        animationData.userData = this.userData;

        return animationData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.duration = this.duration;
        json.playTimes = this.playTimes;
        json.fadeInTime = this.fadeInTime;
        json.speed = this.speed;
        json.scale = this.scale;
        json.loop = this.loop;
        json.autoTween = this.autoTween;

        // 时间轴数据
        json.timelines = {};
        for (const [name, timeline] of this.timelines) {
            json.timelines[name] = timeline.toJSON();
        }

        json.timelineMap = this.timelineMap;

        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): AnimationData {
        super.fromJSON(json);
        this.duration = json.duration || 0;
        this.playTimes = json.playTimes || 1;
        this.fadeInTime = json.fadeInTime || 0;
        this.speed = json.speed || 1;
        this.scale = json.scale || 1;
        this.loop = json.loop || 0;
        this.autoTween = json.autoTween || false;

        // 加载时间轴数据
        if (json.timelines) {
            for (const [name, timelineJson] of Object.entries(json.timelines)) {
                const timelineData = new TimelineData(name);
                timelineData.fromJSON(timelineJson);
                this.addTimelineData(timelineData);
            }
        }

        this.timelineMap = json.timelineMap || {};

        return this;
    }

    /**
     * 设置循环属性
     */
    public setLoop(loop: number, playTimes: number = 0): AnimationData {
        this.loop = loop;
        this.playTimes = playTimes;
        return this;
    }

    /**
     * 设置播放速度
     */
    public setSpeed(speed: number): AnimationData {
        this.speed = speed;
        return this;
    }

    /**
     * 设置淡入时间
     */
    public setFadeInTime(fadeInTime: number): AnimationData {
        this.fadeInTime = fadeInTime;
        return this;
    }
}

