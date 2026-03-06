/**
 * 插槽数据类
 * @author skeleton-animation-system
 */

import { BaseData } from './BaseData';
import { ColorTransform } from './ColorTransform';

export class SlotData extends BaseData {
    public parent: string = "";
    public color: ColorTransform = new ColorTransform();
    public displayIndex: number = 0;
    public zIndex: number = 0;
    public blendMode: BlendMode = BlendMode.Normal;

    constructor(name: string = "") {
        super(name);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.parent = "";
        this.color = new ColorTransform();
        this.displayIndex = 0;
        this.zIndex = 0;
        this.blendMode = BlendMode.Normal;
    }

    /**
     * 克隆插槽数据
     */
    public override clone(): SlotData {
        const slotData = new SlotData(this.name);
        slotData.parent = this.parent;
        slotData.color.copyFrom(this.color);
        slotData.displayIndex = this.displayIndex;
        slotData.zIndex = this.zIndex;
        slotData.blendMode = this.blendMode;
        slotData.userData = this.userData;
        return slotData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.parent = this.parent;
        json.color = this.color.toJSON();
        json.displayIndex = this.displayIndex;
        json.zIndex = this.zIndex;
        json.blendMode = this.blendMode;
        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): SlotData {
        super.fromJSON(json);
        this.parent = json.parent || "";

        if (json.color) {
            this.color.fromJSON(json.color);
        }

        this.displayIndex = json.displayIndex || 0;
        this.zIndex = json.zIndex || 0;
        this.blendMode = json.blendMode || BlendMode.Normal;

        return this;
    }

    /**
     * 设置颜色变换
     */
    public setColor(alphaMultiplier: number = 1, redMultiplier: number = 1, greenMultiplier: number = 1, blueMultiplier: number = 1): SlotData {
        this.color.alphaMultiplier = alphaMultiplier;
        this.color.redMultiplier = redMultiplier;
        this.color.greenMultiplier = greenMultiplier;
        this.color.blueMultiplier = blueMultiplier;
        return this;
    }

    /**
     * 设置混合模式
     */
    public setBlendMode(blendMode: BlendMode): SlotData {
        this.blendMode = blendMode;
        return this;
    }
}

/**
 * 混合模式枚举
 */
export enum BlendMode {
    Normal = "normal",
    Add = "add",
    Multiply = "multiply",
    Screen = "screen",
    Overlay = "overlay",
    HardLight = "hardLight",
    Darken = "darken",
    Lighten = "lighten",
    ColorDodge = "colorDodge",
    ColorBurn = "colorBurn",
    SoftLight = "softLight",
    Difference = "difference",
    Exclusion = "exclusion"
}

