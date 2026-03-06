/**
 * 反向动力学约束数据类
 * @author skeleton-animation-system
 */

import {ConstraintData, ConstraintType} from './ConstraintData';

export class IKData extends ConstraintData {
    public bendPositive: boolean = true;
    public chain: number = 0;
    public soft: boolean = false;
    public stretch: boolean = false;
    public compress: boolean = false;

    constructor(name: string = "") {
        super(name, ConstraintType.IK);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.bendPositive = true;
        this.chain = 0;
        this.soft = false;
        this.stretch = false;
        this.compress = false;
    }

    /**
     * 设置弯曲方向
     */
    public setBendDirection(positive: boolean): IKData {
        this.bendPositive = positive;
        return this;
    }

    /**
     * 设置链长度
     */
    public setChainLength(chain: number): IKData {
        this.chain = Math.max(0, chain);
        return this;
    }

    /**
     * 设置软约束
     */
    public setSoftConstraint(soft: boolean): IKData {
        this.soft = soft;
        return this;
    }

    /**
     * 设置拉伸
     */
    public setStretch(stretch: boolean): IKData {
        this.stretch = stretch;
        return this;
    }

    /**
     * 设置压缩
     */
    public setCompress(compress: boolean): IKData {
        this.compress = compress;
        return this;
    }

    /**
     * 克隆IK数据
     */
    public override clone(): IKData {
        const ikData = new IKData(this.name);

        ikData.order = this.order;
        ikData.weight = this.weight;
        ikData.target = this.target;
        ikData.bone = this.bone;
        ikData.bendPositive = this.bendPositive;
        ikData.chain = this.chain;
        ikData.soft = this.soft;
        ikData.stretch = this.stretch;
        ikData.compress = this.compress;
        ikData.userData = this.userData;

        return ikData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.bendPositive = this.bendPositive;
        json.chain = this.chain;
        json.soft = this.soft;
        json.stretch = this.stretch;
        json.compress = this.compress;
        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): IKData {
        super.fromJSON(json);
        this.bendPositive = json.bendPositive !== undefined ? json.bendPositive : true;
        this.chain = json.chain || 0;
        this.soft = json.soft || false;
        this.stretch = json.stretch || false;
        this.compress = json.compress || false;
        return this;
    }

    /**
     * 检查是否为单链IK
     */
    public isSingleChain(): boolean {
        return this.chain <= 1;
    }

    /**
     * 检查是否允许拉伸
     */
    public canStretch(): boolean {
        return this.stretch;
    }

    /**
     * 检查是否允许压缩
     */
    public canCompress(): boolean {
        return this.compress;
    }
}

