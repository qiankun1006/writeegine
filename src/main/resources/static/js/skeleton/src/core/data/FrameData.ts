/**
 * 帧数据类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';

export class FrameData extends BaseData {
    public position: number = 0;
    public duration: number = 0;
    public value: any = null;
    public curve: number[] | null = null;
    public easing: number = 0;
    public offset: number = 0;

    constructor() {
        super("");
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.position = 0;
        this.duration = 0;
        this.value = null;
        this.curve = null;
        this.easing = 0;
        this.offset = 0;
    }

    /**
     * 设置帧位置（时间）
     */
    public setPosition(position: number): FrameData {
        this.position = position;
        return this;
    }

    /**
     * 设置帧持续时间
     */
    public setDuration(duration: number): FrameData {
        this.duration = duration;
        return this;
    }

    /**
     * 设置帧值
     */
    public setValue(value: any): FrameData {
        this.value = value;
        return this;
    }

    /**
     * 设置缓动曲线
     */
    public setEasing(easing: number): FrameData {
        this.easing = easing;
        return this;
    }

    /**
     * 设置自定义曲线
     */
    public setCurve(curve: number[] | null): FrameData {
        this.curve = curve;
        return this;
    }

    /**
     * 设置偏移量
     */
    public setOffset(offset: number): FrameData {
        this.offset = offset;
        return this;
    }

    /**
     * 检查是否为关键帧
     */
    public isKeyFrame(): boolean {
        return this.duration > 0;
    }

    /**
     * 获取结束时间
     */
    public getEndTime(): number {
        return this.position + this.duration;
    }

    /**
     * 检查时间是否在此帧范围内
     */
    public containsTime(time: number): boolean {
        return time >= this.position && time < this.getEndTime();
    }

    /**
     * 获取时间在此帧中的进度（0-1）
     */
    public getProgress(time: number): number {
        if (this.duration <= 0) return 0;
        const progress = (time - this.position) / this.duration;
        return Math.max(0, Math.min(1, progress));
    }

    /**
     * 克隆帧数据
     */
    public override clone(): FrameData {
        const frameData = new FrameData();

        frameData.position = this.position;
        frameData.duration = this.duration;
        frameData.value = this.value; // 浅拷贝，复杂对象可能需要深拷贝
        frameData.curve = this.curve ? [...this.curve] : null;
        frameData.easing = this.easing;
        frameData.offset = this.offset;
        frameData.userData = this.userData;

        return frameData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.position = this.position;
        json.duration = this.duration;
        json.value = this.value;
        json.easing = this.easing;
        json.offset = this.offset;

        if (this.curve) {
            json.curve = this.curve;
        }

        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): FrameData {
        super.fromJSON(json);
        this.position = json.position || 0;
        this.duration = json.duration || 0;
        this.value = json.value || null;
        this.easing = json.easing || 0;
        this.offset = json.offset || 0;

        if (json.curve) {
            this.curve = [...json.curve];
        }

        return this;
    }

    /**
     * 创建关键帧
     */
    public static createKeyFrame(position: number, duration: number, value: any = null): FrameData {
        const frame = new FrameData();
        frame.position = position;
        frame.duration = duration;
        frame.value = value;
        return frame;
    }

    /**
     * 创建空帧
     */
    public static createEmptyFrame(position: number): FrameData {
        const frame = new FrameData();
        frame.position = position;
        return frame;
    }

    /**
     * 创建缓动帧
     */
    public static createEasingFrame(position: number, duration: number, easing: number, value: any = null): FrameData {
        const frame = new FrameData();
        frame.position = position;
        frame.duration = duration;
        frame.easing = easing;
        frame.value = value;
        return frame;
    }

    /**
     * 创建曲线帧
     */
    public static createCurveFrame(position: number, duration: number, curve: number[], value: any = null): FrameData {
        const frame = new FrameData();
        frame.position = position;
        frame.duration = duration;
        frame.curve = curve;
        frame.value = value;
        return frame;
    }
}

