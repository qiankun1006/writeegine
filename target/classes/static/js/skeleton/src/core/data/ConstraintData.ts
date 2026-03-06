/**
 * 约束数据基类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';

export abstract class ConstraintData extends BaseData {
    public order: number = 0;
    public weight: number = 1;
    public target: string = "";
    public bone: string = "";

    constructor(name: string, type: ConstraintType) {
        super(name);
        this.userData = { type };
    }

    /**
     * 获取约束类型
     */
    public get type(): ConstraintType {
        return this.userData?.type || ConstraintType.IK;
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.order = 0;
        this.weight = 1;
        this.target = "";
        this.bone = "";
    }

    /**
     * 设置约束权重
     */
    public setWeight(weight: number): ConstraintData {
        this.weight = Math.max(0, Math.min(1, weight));
        return this;
    }

    /**
     * 设置约束顺序
     */
    public setOrder(order: number): ConstraintData {
        this.order = order;
        return this;
    }

    /**
     * 设置目标
     */
    public setTarget(target: string): ConstraintData {
        this.target = target;
        return this;
    }

    /**
     * 设置骨骼
     */
    public setBone(bone: string): ConstraintData {
        this.bone = bone;
        return this;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.order = this.order;
        json.weight = this.weight;
        json.target = this.target;
        json.bone = this.bone;
        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): ConstraintData {
        super.fromJSON(json);
        this.order = json.order || 0;
        this.weight = json.weight || 1;
        this.target = json.target || "";
        this.bone = json.bone || "";
        return this;
    }
}

/**
 * 约束类型枚举
 */
export enum ConstraintType {
    IK = "ik",
    Path = "path",
    Transform = "transform",
    Physics = "physics"
}

