/**
 * 矩形类
 * @author skeleton-animation-system
 */

import {Point} from './Point';

export class Rectangle {
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * 从另一个矩形复制值
     */
    public copyFrom(rect: Rectangle): Rectangle {
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
        return this;
    }

    /**
     * 设置矩形值
     */
    public setTo(x: number, y: number, width: number, height: number): Rectangle {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * 获取右边界
     */
    public get right(): number {
        return this.x + this.width;
    }

    /**
     * 获取下边界
     */
    public get bottom(): number {
        return this.y + this.height;
    }

    /**
     * 获取中心点X坐标
     */
    public get centerX(): number {
        return this.x + this.width * 0.5;
    }

    /**
     * 获取中心点Y坐标
     */
    public get centerY(): number {
        return this.y + this.height * 0.5;
    }

    /**
     * 获取中心点
     */
    public get center(): Point {
        return new Point(this.centerX, this.centerY);
    }

    /**
     * 检查点是否在矩形内
     */
    public contains(x: number, y: number): boolean {
        return x >= this.x && x < this.right && y >= this.y && y < this.bottom;
    }

    /**
     * 检查点是否在矩形内（使用Point对象）
     */
    public containsPoint(point: Point): boolean {
        return this.contains(point.x, point.y);
    }

    /**
     * 检查是否与另一个矩形相交
     */
    public intersects(rect: Rectangle): boolean {
        return this.x < rect.right && this.right > rect.x &&
               this.y < rect.bottom && this.bottom > rect.y;
    }

    /**
     * 计算与另一个矩形的交集
     */
    public intersection(rect: Rectangle, result?: Rectangle): Rectangle {
        if (!result) {
            result = new Rectangle();
        }

        const left = Math.max(this.x, rect.x);
        const right = Math.min(this.right, rect.right);
        const top = Math.max(this.y, rect.y);
        const bottom = Math.min(this.bottom, rect.bottom);

        if (left < right && top < bottom) {
            result.setTo(left, top, right - left, bottom - top);
        } else {
            result.setTo(0, 0, 0, 0);
        }

        return result;
    }

    /**
     * 计算与另一个矩形的并集
     */
    public union(rect: Rectangle, result?: Rectangle): Rectangle {
        if (!result) {
            result = new Rectangle();
        }

        const left = Math.min(this.x, rect.x);
        const right = Math.max(this.right, rect.right);
        const top = Math.min(this.y, rect.y);
        const bottom = Math.max(this.bottom, rect.bottom);

        result.setTo(left, top, right - left, bottom - top);
        return result;
    }

    /**
     * 扩展矩形以包含指定点
     */
    public expandToContain(x: number, y: number): Rectangle {
        const left = Math.min(this.x, x);
        const right = Math.max(this.right, x);
        const top = Math.min(this.y, y);
        const bottom = Math.max(this.bottom, y);

        this.x = left;
        this.y = top;
        this.width = right - left;
        this.height = bottom - top;
        return this;
    }

    /**
     * 扩展矩形以包含另一个矩形
     */
    public expandToInclude(rect: Rectangle): Rectangle {
        return this.expandToContain(rect.x, rect.y).expandToContain(rect.right, rect.bottom);
    }

    /**
     * 缩放矩形
     */
    public scale(sx: number, sy: number = sx): Rectangle {
        this.x *= sx;
        this.y *= sy;
        this.width *= sx;
        this.height *= sy;
        return this;
    }

    /**
     * 平移矩形
     */
    public translate(dx: number, dy: number): Rectangle {
        this.x += dx;
        this.y += dy;
        return this;
    }

    /**
     * 克隆矩形
     */
    public clone(): Rectangle {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    /**
     * 清空矩形
     */
    public clear(): Rectangle {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        return this;
    }

    /**
     * 检查是否为空
     */
    public isEmpty(): boolean {
        return this.width <= 0 || this.height <= 0;
    }

    /**
     * 转换为字符串
     */
    public toString(): string {
        return `Rectangle(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
    }

    /**
     * 检查是否相等
     */
    public equals(rect: Rectangle, tolerance: number = 0.001): boolean {
        return Math.abs(this.x - rect.x) < tolerance &&
               Math.abs(this.y - rect.y) < tolerance &&
               Math.abs(this.width - rect.width) < tolerance &&
               Math.abs(this.height - rect.height) < tolerance;
    }

    /**
     * 静态方法：创建空矩形
     */
    public static createEmpty(): Rectangle {
        return new Rectangle(0, 0, 0, 0);
    }

    /**
     * 静态方法：创建单位矩形
     */
    public static createUnit(): Rectangle {
        return new Rectangle(0, 0, 1, 1);
    }

    /**
     * 静态方法：计算包围盒
     */
    public static createBounds(points: Point[]): Rectangle {
        if (points.length === 0) {
            return Rectangle.createEmpty();
        }

        let minX = points[0].x;
        let minY = points[0].y;
        let maxX = points[0].x;
        let maxY = points[0].y;

        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }

        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }
}

