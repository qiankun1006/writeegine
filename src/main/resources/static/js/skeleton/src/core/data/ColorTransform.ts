/**
 * 颜色变换类
 * @author skeleton-animation-system
 */

export class ColorTransform {
    public alphaMultiplier: number = 1;
    public redMultiplier: number = 1;
    public greenMultiplier: number = 1;
    public blueMultiplier: number = 1;

    public alphaOffset: number = 0;
    public redOffset: number = 0;
    public greenOffset: number = 0;
    public blueOffset: number = 0;

    constructor() {}

    /**
     * 从另一个颜色变换复制值
     */
    public copyFrom(colorTransform: ColorTransform): ColorTransform {
        this.alphaMultiplier = colorTransform.alphaMultiplier;
        this.redMultiplier = colorTransform.redMultiplier;
        this.greenMultiplier = colorTransform.greenMultiplier;
        this.blueMultiplier = colorTransform.blueMultiplier;
        this.alphaOffset = colorTransform.alphaOffset;
        this.redOffset = colorTransform.redOffset;
        this.greenOffset = colorTransform.greenOffset;
        this.blueOffset = colorTransform.blueOffset;
        return this;
    }

    /**
     * 清空颜色变换
     */
    public clear(): ColorTransform {
        this.alphaMultiplier = 1;
        this.redMultiplier = 1;
        this.greenMultiplier = 1;
        this.blueMultiplier = 1;
        this.alphaOffset = 0;
        this.redOffset = 0;
        this.greenOffset = 0;
        this.blueOffset = 0;
        return this;
    }

    /**
     * 设置乘数
     */
    public setMultipliers(alpha: number = 1, red: number = 1, green: number = 1, blue: number = 1): ColorTransform {
        this.alphaMultiplier = alpha;
        this.redMultiplier = red;
        this.greenMultiplier = green;
        this.blueMultiplier = blue;
        return this;
    }

    /**
     * 设置偏移
     */
    public setOffsets(alpha: number = 0, red: number = 0, green: number = 0, blue: number = 0): ColorTransform {
        this.alphaOffset = alpha;
        this.redOffset = red;
        this.greenOffset = green;
        this.blueOffset = blue;
        return this;
    }

    /**
     * 应用颜色变换到颜色值
     */
    public applyTo(color: number): number {
        const a = ((color >>> 24) & 0xFF) * this.alphaMultiplier + this.alphaOffset;
        const r = ((color >>> 16) & 0xFF) * this.redMultiplier + this.redOffset;
        const g = ((color >>> 8) & 0xFF) * this.greenMultiplier + this.greenOffset;
        const b = (color & 0xFF) * this.blueMultiplier + this.blueOffset;

        return (Math.max(0, Math.min(255, a)) << 24) |
               (Math.max(0, Math.min(255, r)) << 16) |
               (Math.max(0, Math.min(255, g)) << 8) |
               Math.max(0, Math.min(255, b));
    }

    /**
     * 克隆颜色变换
     */
    public clone(): ColorTransform {
        const result = new ColorTransform();
        result.copyFrom(this);
        return result;
    }

    /**
     * 转换为JSON
     */
    public toJSON(): any {
        return {
            alphaMultiplier: this.alphaMultiplier,
            redMultiplier: this.redMultiplier,
            greenMultiplier: this.greenMultiplier,
            blueMultiplier: this.blueMultiplier,
            alphaOffset: this.alphaOffset,
            redOffset: this.redOffset,
            greenOffset: this.greenOffset,
            blueOffset: this.blueOffset
        };
    }

    /**
     * 从JSON加载
     */
    public fromJSON(json: any): ColorTransform {
        this.alphaMultiplier = json.alphaMultiplier || 1;
        this.redMultiplier = json.redMultiplier || 1;
        this.greenMultiplier = json.greenMultiplier || 1;
        this.blueMultiplier = json.blueMultiplier || 1;
        this.alphaOffset = json.alphaOffset || 0;
        this.redOffset = json.redOffset || 0;
        this.greenOffset = json.greenOffset || 0;
        this.blueOffset = json.blueOffset || 0;
        return this;
    }

    /**
     * 检查是否为单位变换
     */
    public isIdentity(): boolean {
        return this.alphaMultiplier === 1 &&
               this.redMultiplier === 1 &&
               this.greenMultiplier === 1 &&
               this.blueMultiplier === 1 &&
               this.alphaOffset === 0 &&
               this.redOffset === 0 &&
               this.greenOffset === 0 &&
               this.blueOffset === 0;
    }

    /**
     * 转换为字符串
     */
    public toString(): string {
        return `ColorTransform(multipliers: ${this.alphaMultiplier}, ${this.redMultiplier}, ${this.greenMultiplier}, ${this.blueMultiplier}, offsets: ${this.alphaOffset}, ${this.redOffset}, ${this.greenOffset}, ${this.blueOffset})`;
    }
}

