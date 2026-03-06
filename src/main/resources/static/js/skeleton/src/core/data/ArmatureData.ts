/**
 * 骨架数据类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';
import {BoneData} from './BoneData';
import {SlotData} from './SlotData';
import {SkinData} from './SkinData';
import {AnimationData} from './AnimationData';

export class ArmatureData extends BaseData {
    public readonly bones: Map<string, BoneData> = new Map();
    public readonly slots: Map<string, SlotData> = new Map();
    public readonly skins: Map<string, SkinData> = new Map();
    public readonly animations: Map<string, AnimationData> = new Map();

    public frameRate: number = 24;
    public type: ArmatureType = ArmatureType.Armature;
    public defaultSkin: string = "";
    public defaultAnimation: string = "";
    public aabb: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width: 0, height: 0 };

    constructor(name: string = "") {
        super(name);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.bones.clear();
        this.slots.clear();
        this.skins.clear();
        this.animations.clear();
        this.frameRate = 24;
        this.type = ArmatureType.Armature;
        this.defaultSkin = "";
        this.defaultAnimation = "";
        this.aabb = { x: 0, y: 0, width: 0, height: 0 };
    }

    /**
     * 添加骨骼数据
     */
    public addBoneData(boneData: BoneData): void {
        if (boneData.name && !this.bones.has(boneData.name)) {
            this.bones.set(boneData.name, boneData);
        }
    }

    /**
     * 获取骨骼数据
     */
    public getBoneData(name: string): BoneData | null {
        return this.bones.get(name) || null;
    }

    /**
     * 移除骨骼数据
     */
    public removeBoneData(name: string): boolean {
        return this.bones.delete(name);
    }

    /**
     * 添加插槽数据
     */
    public addSlotData(slotData: SlotData): void {
        if (slotData.name && !this.slots.has(slotData.name)) {
            this.slots.set(slotData.name, slotData);
        }
    }

    /**
     * 获取插槽数据
     */
    public getSlotData(name: string): SlotData | null {
        return this.slots.get(name) || null;
    }

    /**
     * 移除插槽数据
     */
    public removeSlotData(name: string): boolean {
        return this.slots.delete(name);
    }

    /**
     * 添加皮肤数据
     */
    public addSkinData(skinData: SkinData): void {
        if (skinData.name && !this.skins.has(skinData.name)) {
            this.skins.set(skinData.name, skinData);
        }
    }

    /**
     * 获取皮肤数据
     */
    public getSkinData(name: string): SkinData | null {
        return this.skins.get(name) || null;
    }

    /**
     * 移除皮肤数据
     */
    public removeSkinData(name: string): boolean {
        return this.skins.delete(name);
    }

    /**
     * 添加动画数据
     */
    public addAnimationData(animationData: AnimationData): void {
        if (animationData.name && !this.animations.has(animationData.name)) {
            this.animations.set(animationData.name, animationData);
        }
    }

    /**
     * 获取动画数据
     */
    public getAnimationData(name: string): AnimationData | null {
        return this.animations.get(name) || null;
    }

    /**
     * 移除动画数据
     */
    public removeAnimationData(name: string): boolean {
        return this.animations.delete(name);
    }

    /**
     * 获取默认皮肤
     */
    public getDefaultSkin(): SkinData | null {
        if (this.defaultSkin) {
            return this.getSkinData(this.defaultSkin);
        }

        // 如果没有设置默认皮肤，返回第一个皮肤
        for (const skin of this.skins.values()) {
            return skin;
        }

        return null;
    }

    /**
     * 获取默认动画
     */
    public getDefaultAnimation(): AnimationData | null {
        if (this.defaultAnimation) {
            return this.getAnimationData(this.defaultAnimation);
        }

        // 如果没有设置默认动画，返回第一个动画
        for (const animation of this.animations.values()) {
            return animation;
        }

        return null;
    }

    /**
     * 获取根骨骼列表
     */
    public getRootBones(): BoneData[] {
        const rootBones: BoneData[] = [];
        for (const bone of this.bones.values()) {
            if (!bone.parent) {
                rootBones.push(bone);
            }
        }
        return rootBones;
    }

    /**
     * 获取骨骼的子骨骼列表
     */
    public getBoneChildren(boneName: string): BoneData[] {
        const children: BoneData[] = [];
        for (const bone of this.bones.values()) {
            if (bone.parent === boneName) {
                children.push(bone);
            }
        }
        return children;
    }

    /**
     * 克隆骨架数据
     */
    public override clone(): ArmatureData {
        const armatureData = new ArmatureData(this.name);

        // 克隆骨骼数据
        for (const bone of this.bones.values()) {
            armatureData.addBoneData(bone.clone());
        }

        // 克隆插槽数据
        for (const slot of this.slots.values()) {
            armatureData.addSlotData(slot.clone());
        }

        // 克隆皮肤数据
        for (const skin of this.skins.values()) {
            armatureData.addSkinData(skin.clone());
        }

        // 克隆动画数据
        for (const animation of this.animations.values()) {
            armatureData.addAnimationData(animation.clone());
        }

        armatureData.frameRate = this.frameRate;
        armatureData.type = this.type;
        armatureData.defaultSkin = this.defaultSkin;
        armatureData.defaultAnimation = this.defaultAnimation;
        armatureData.aabb = { ...this.aabb };
        armatureData.userData = this.userData;

        return armatureData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.frameRate = this.frameRate;
        json.type = this.type;
        json.defaultSkin = this.defaultSkin;
        json.defaultAnimation = this.defaultAnimation;
        json.aabb = this.aabb;

        // 骨骼数据
        json.bones = {};
        for (const [name, bone] of this.bones) {
            json.bones[name] = bone.toJSON();
        }

        // 插槽数据
        json.slots = {};
        for (const [name, slot] of this.slots) {
            json.slots[name] = slot.toJSON();
        }

        // 皮肤数据
        json.skins = {};
        for (const [name, skin] of this.skins) {
            json.skins[name] = skin.toJSON();
        }

        // 动画数据
        json.animations = {};
        for (const [name, animation] of this.animations) {
            json.animations[name] = animation.toJSON();
        }

        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): ArmatureData {
        super.fromJSON(json);
        this.frameRate = json.frameRate || 24;
        this.type = json.type || ArmatureType.Armature;
        this.defaultSkin = json.defaultSkin || "";
        this.defaultAnimation = json.defaultAnimation || "";
        this.aabb = json.aabb || { x: 0, y: 0, width: 0, height: 0 };

        // 加载骨骼数据
        if (json.bones) {
            for (const [name, boneJson] of Object.entries(json.bones)) {
                const boneData = new BoneData(name);
                boneData.fromJSON(boneJson);
                this.addBoneData(boneData);
            }
        }

        // 加载插槽数据
        if (json.slots) {
            for (const [name, slotJson] of Object.entries(json.slots)) {
                const slotData = new SlotData(name);
                slotData.fromJSON(slotJson);
                this.addSlotData(slotData);
            }
        }

        // 加载皮肤数据
        if (json.skins) {
            for (const [name, skinJson] of Object.entries(json.skins)) {
                const skinData = new SkinData(name);
                skinData.fromJSON(skinJson);
                this.addSkinData(skinData);
            }
        }

        // 加载动画数据
        if (json.animations) {
            for (const [name, animationJson] of Object.entries(json.animations)) {
                const animationData = new AnimationData(name);
                animationData.fromJSON(animationJson);
                this.addAnimationData(animationData);
            }
        }

        return this;
    }
}

/**
 * 骨架类型枚举
 */
export enum ArmatureType {
    Armature = "Armature",
    Mesh = "Mesh",
    Path = "Path"
}

