/**
 * 点坐标类
 * @author skeleton-animation-system
 */

export class Point {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 从另一个点复制值
     */
    public copyFrom(point: Point): Point {
        this.x = point.x;
        this.y = point.y;
        return this;
    }

    /**
     * 清空坐标值
     */
    public clear(): Point {
        this.x = 0;
        this.y = 0;
        return this;
    }

    /**
     * 设置坐标值
     */
    public setTo(x: number, y: number): Point {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 计算到另一个点的距离
     */
    public distanceTo(point: Point): number {
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 线性插值
     */
    public lerp(point: Point, t: number): Point {
        this.x = this.x + (point.x - this.x) * t;
        this.y = this.y + (point.y - this.y) * t;
        return this;
    }

    /**
     * 克隆点
     */
    public clone(): Point {
        return new Point(this.x, this.y);
    }

    /**
     * 转换为字符串
     */
    public toString(): string {
        return `Point(${this.x}, ${this.y})`;
    }

    /**
     * 检查是否相等
     */
    public equals(point: Point): boolean {
        return this.x === point.x && this.y === point.y;
    }

    /**
     * 静态方法：创建点
     */
    public static create(x: number = 0, y: number = 0): Point {
        return new Point(x, y);
    }

    /**
     * 静态方法：零點
     */
    public static readonly ZERO: Point = new Point(0, 0);

    /**
     * 静态方法：单位点
     */
    public static readonly ONE: Point = new Point(1, 1);
}

