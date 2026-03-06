/**
 * 骨骼数据类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';
import {Transform} from '../geom/Transform';

export class BoneData extends BaseData {
    public parent: string = "";
    public length: number = 0;
    public transform: Transform = new Transform();
    public inheritTranslation: boolean = true;
    public inheritRotation: boolean = true;
    public inheritScale: boolean = true;
    public inheritReflection: boolean = false;

    constructor(name: string = "") {
        super(name);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.parent = "";
        this.length = 0;
        this.transform.clear();
        this.inheritTranslation = true;
        this.inheritRotation = true;
        this.inheritScale = true;
        this.inheritReflection = false;
    }

    /**
     * 克隆骨骼数据
     */
    public override clone(): BoneData {
        const boneData = new BoneData(this.name);
        boneData.parent = this.parent;
        boneData.length = this.length;
        boneData.transform.copyFrom(this.transform);
        boneData.inheritTranslation = this.inheritTranslation;
        boneData.inheritRotation = this.inheritRotation;
        boneData.inheritScale = this.inheritScale;
        boneData.inheritReflection = this.inheritReflection;
        boneData.userData = this.userData;
        return boneData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.parent = this.parent;
        json.length = this.length;
        json.transform = {
            x: this.transform.x,
            y: this.transform.y,
            skewX: this.transform.skewX,
            skewY: this.transform.skewY,
            scaleX: this.transform.scaleX,
            scaleY: this.transform.scaleY
        };
        json.inheritTranslation = this.inheritTranslation;
        json.inheritRotation = this.inheritRotation;
        json.inheritScale = this.inheritScale;
        json.inheritReflection = this.inheritReflection;
        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): BoneData {
        super.fromJSON(json);
        this.parent = json.parent || "";
        this.length = json.length || 0;

        if (json.transform) {
            this.transform.setTo(
                json.transform.x || 0,
                json.transform.y || 0,
                json.transform.skewX || 0,
                json.transform.skewY || 0,
                json.transform.scaleX || 1,
                json.transform.scaleY || 1
            );
        }

        this.inheritTranslation = json.inheritTranslation !== undefined ? json.inheritTranslation : true;
        this.inheritRotation = json.inheritRotation !== undefined ? json.inheritRotation : true;
        this.inheritScale = json.inheritScale !== undefined ? json.inheritScale : true;
        this.inheritReflection = json.inheritReflection !== undefined ? json.inheritReflection : false;

        return this;
    }

    /**
     * 检查是否继承变换
     */
    public isInheritTransform(): boolean {
        return this.inheritTranslation && this.inheritRotation && this.inheritScale;
    }

    /**
     * 设置继承属性
     */
    public setInherit(translation: boolean, rotation: boolean, scale: boolean, reflection: boolean = false): BoneData {
        this.inheritTranslation = translation;
        this.inheritRotation = rotation;
        this.inheritScale = scale;
        this.inheritReflection = reflection;
        return this;
    }
}

