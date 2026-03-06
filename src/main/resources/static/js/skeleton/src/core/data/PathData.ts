/**
 * 路径约束数据类
 * @author skeleton-animation-system
 */

import {ConstraintData, ConstraintType} from './ConstraintData';

export class PathData extends ConstraintData {
    public positionMode: PositionMode = PositionMode.Percent;
    public spacingMode: SpacingMode = SpacingMode.Length;
    public rotateMode: RotateMode = RotateMode.Tangent;
    public offsetRotation: number = 0;
    public position: number = 0;
    public spacing: number = 0;
    public rotate: number = 0;

    public readonly bones: string[] = [];

    constructor(name: string = "") {
        super(name, ConstraintType.Path);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.positionMode = PositionMode.Percent;
        this.spacingMode = SpacingMode.Length;
        this.rotateMode = RotateMode.Tangent;
        this.offsetRotation = 0;
        this.position = 0;
        this.spacing = 0;
        this.rotate = 0;
        this.bones.length = 0;
    }

    /**
     * 添加骨骼
     */
    public addBone(boneName: string): PathData {
        if (boneName && !this.bones.includes(boneName)) {
            this.bones.push(boneName);
        }
        return this;
    }

    /**
     * 移除骨骼
     */
    public removeBone(boneName: string): boolean {
        const index = this.bones.indexOf(boneName);
        if (index >= 0) {
            this.bones.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * 设置位置模式
     */
    public setPositionMode(mode: PositionMode): PathData {
        this.positionMode = mode;
        return this;
    }

    /**
     * 设置间距模式
     */
    public setSpacingMode(mode: SpacingMode): PathData {
        this.spacingMode = mode;
        return this;
    }

    /**
     * 设置旋转模式
     */
    public setRotateMode(mode: RotateMode): PathData {
        this.rotateMode = mode;
        return this;
    }

    /**
     * 设置偏移旋转
     */
    public setOffsetRotation(offsetRotation: number): PathData {
        this.offsetRotation = offsetRotation;
        return this;
    }

    /**
     * 设置位置
     */
    public setPosition(position: number): PathData {
        this.position = position;
        return this;
    }

    /**
     * 设置间距
     */
    public setSpacing(spacing: number): PathData {
        this.spacing = spacing;
        return this;
    }

    /**
     * 设置旋转
     */
    public setRotate(rotate: number): PathData {
        this.rotate = rotate;
        return this;
    }

    /**
     * 克隆路径数据
     */
    public override clone(): PathData {
        const pathData = new PathData(this.name);

        pathData.order = this.order;
        pathData.weight = this.weight;
        pathData.target = this.target;
        pathData.bone = this.bone;
        pathData.positionMode = this.positionMode;
        pathData.spacingMode = this.spacingMode;
        pathData.rotateMode = this.rotateMode;
        pathData.offsetRotation = this.offsetRotation;
        pathData.position = this.position;
        pathData.spacing = this.spacing;
        pathData.rotate = this.rotate;
        pathData.bones.push(...this.bones);
        pathData.userData = this.userData;

        return pathData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.positionMode = this.positionMode;
        json.spacingMode = this.spacingMode;
        json.rotateMode = this.rotateMode;
        json.offsetRotation = this.offsetRotation;
        json.position = this.position;
        json.spacing = this.spacing;
        json.rotate = this.rotate;
        json.bones = [...this.bones];
        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): PathData {
        super.fromJSON(json);
        this.positionMode = json.positionMode || PositionMode.Percent;
        this.spacingMode = json.spacingMode || SpacingMode.Length;
        this.rotateMode = json.rotateMode || RotateMode.Tangent;
        this.offsetRotation = json.offsetRotation || 0;
        this.position = json.position || 0;
        this.spacing = json.spacing || 0;
        this.rotate = json.rotate || 0;

        if (json.bones) {
            this.bones.push(...json.bones);
        }

        return this;
    }

    /**
     * 获取骨骼数量
     */
    public getBoneCount(): number {
        return this.bones.length;
    }

    /**
     * 清空所有骨骼
     */
    public clearBones(): PathData {
        this.bones.length = 0;
        return this;
    }
}

/**
 * 位置模式枚举
 */
export enum PositionMode {
    Fixed = "fixed",
    Percent = "percent"
}

/**
 * 间距模式枚举
 */
export enum SpacingMode {
    Length = "length",
    Fixed = "fixed",
    Percent = "percent"
}

/**
 * 旋转模式枚举
 */
export enum RotateMode {
    Tangent = "tangent",
    Chain = "chain",
    ChainScale = "chainScale",
    Fixed = "fixed"
}

