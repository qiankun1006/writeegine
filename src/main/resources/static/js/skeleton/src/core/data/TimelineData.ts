/**
 * 时间轴数据类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';
import {FrameData} from './FrameData';

export class TimelineData extends BaseData {
    public type: TimelineType = TimelineType.Bone;
    public offset: number = 0;
    public readonly frames: FrameData[] = [];

    constructor(name: string = "") {
        super(name);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.type = TimelineType.Bone;
        this.offset = 0;
        this.frames.length = 0;
    }

    /**
     * 添加帧数据
     */
    public addFrameData(frameData: FrameData): void {
        this.frames.push(frameData);
        // 保持帧按时间顺序排列
        this.frames.sort((a, b) => a.position - b.position);
    }

    /**
     * 获取帧数据
     */
    public getFrameData(index: number): FrameData | null {
        if (index >= 0 && index < this.frames.length) {
            return this.frames[index];
        }
        return null;
    }

    /**
     * 移除帧数据
     */
    public removeFrameData(index: number): boolean {
        if (index >= 0 && index < this.frames.length) {
            this.frames.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * 获取帧数量
     */
    public getFrameCount(): number {
        return this.frames.length;
    }

    /**
     * 获取指定时间的帧
     */
    public getFrameAtTime(time: number): FrameData | null {
        if (this.frames.length === 0) return null;

        // 二分查找
        let left = 0;
        let right = this.frames.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const frame = this.frames[mid];

            if (frame.position === time) {
                return frame;
            } else if (frame.position < time) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        // 返回最接近的帧
        if (right < 0) return this.frames[0];
        if (left >= this.frames.length) return this.frames[this.frames.length - 1];

        // 返回时间上更接近的帧
        const leftFrame = this.frames[right];
        const rightFrame = this.frames[left];

        return (time - leftFrame.position) <= (rightFrame.position - time) ? leftFrame : rightFrame;
    }

    /**
     * 获取指定时间范围内的帧
     */
    public getFramesInRange(startTime: number, endTime: number): FrameData[] {
        const result: FrameData[] = [];
        for (const frame of this.frames) {
            if (frame.position >= startTime && frame.position <= endTime) {
                result.push(frame);
            }
        }
        return result;
    }

    /**
     * 克隆时间轴数据
     */
    public override clone(): TimelineData {
        const timelineData = new TimelineData(this.name);

        timelineData.type = this.type;
        timelineData.offset = this.offset;

        // 克隆帧数据
        for (const frame of this.frames) {
            timelineData.addFrameData(frame.clone());
        }

        timelineData.userData = this.userData;

        return timelineData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.type = this.type;
        json.offset = this.offset;

        // 帧数据
        json.frames = this.frames.map(frame => frame.toJSON());

        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): TimelineData {
        super.fromJSON(json);
        this.type = json.type || TimelineType.Bone;
        this.offset = json.offset || 0;

        // 加载帧数据
        if (json.frames) {
            for (const frameJson of json.frames) {
                const frameData = new FrameData();
                frameData.fromJSON(frameJson);
                this.addFrameData(frameData);
            }
        }

        return this;
    }

    /**
     * 设置时间轴类型
     */
    public setType(type: TimelineType): TimelineData {
        this.type = type;
        return this;
    }

    /**
     * 设置偏移量
     */
    public setOffset(offset: number): TimelineData {
        this.offset = offset;
        return this;
    }

    /**
     * 清空所有帧
     */
    public clearFrames(): TimelineData {
        this.frames.length = 0;
        return this;
    }
}

/**
 * 时间轴类型枚举
 */
export enum TimelineType {
    Bone = "bone",
    Slot = "slot",
    Constraint = "constraint",
    Animation = "animation"
}

