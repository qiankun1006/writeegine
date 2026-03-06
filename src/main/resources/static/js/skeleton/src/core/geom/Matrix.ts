/**
 * 2D变换矩阵类
 * @author skeleton-animation-system
 */

import {Point} from './Point';

export class Matrix {
    public a: number = 1;
    public b: number = 0;
    public c: number = 0;
    public d: number = 1;
    public tx: number = 0;
    public ty: number = 0;

    constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }

    /**
     * 从另一个矩阵复制值
     */
    public copyFrom(matrix: Matrix): Matrix {
        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;
        return this;
    }

    /**
     * 设置矩阵值
     */
    public setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    /**
     * 矩阵相乘（连接）
     */
    public concat(matrix: Matrix): Matrix {
        const a: number = this.a * matrix.a + this.b * matrix.c;
        const b: number = this.a * matrix.b + this.b * matrix.d;
        const c: number = this.c * matrix.a + this.d * matrix.c;
        const d: number = this.c * matrix.b + this.d * matrix.d;
        const tx: number = this.tx * matrix.a + this.ty * matrix.c + matrix.tx;
        const ty: number = this.tx * matrix.b + this.ty * matrix.d + matrix.ty;

        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    /**
     * 变换点坐标
     */
    public transformPoint(point: Point): Point {
        const x: number = point.x;
        const y: number = point.y;
        point.x = this.a * x + this.c * y + this.tx;
        point.y = this.b * x + this.d * y + this.ty;
        return point;
    }

    /**
     * 变换点坐标（不修改原點）
     */
    public transformPointTo(point: Point, result?: Point): Point {
        if (!result) {
            result = new Point();
        }
        result.x = this.a * point.x + this.c * point.y + this.tx;
        result.y = this.b * point.x + this.d * point.y + this.ty;
        return result;
    }

    /**
     * 求逆矩阵
     */
    public invert(): Matrix {
        const det = this.a * this.d - this.b * this.c;
        if (det === 0) {
            // 矩阵不可逆，返回单位矩阵
            this.identity();
            return this;
        }

        const a = this.d / det;
        const b = -this.b / det;
        const c = -this.c / det;
        const d = this.a / det;
        const tx = (this.c * this.ty - this.d * this.tx) / det;
        const ty = (this.b * this.tx - this.a * this.ty) / det;

        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    /**
     * 设置为单位矩阵
     */
    public identity(): Matrix {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;
        return this;
    }

    /**
     * 平移变换
     */
    public translate(tx: number, ty: number): Matrix {
        this.tx += this.a * tx + this.c * ty;
        this.ty += this.b * tx + this.d * ty;
        return this;
    }

    /**
     * 旋转变换
     */
    public rotate(angle: number): Matrix {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const a = this.a * cos - this.b * sin;
        const b = this.a * sin + this.b * cos;
        const c = this.c * cos - this.d * sin;
        const d = this.c * sin + this.d * cos;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        return this;
    }

    /**
     * 缩放变换
     */
    public scale(sx: number, sy: number): Matrix {
        this.a *= sx;
        this.b *= sy;
        this.c *= sx;
        this.d *= sy;
        return this;
    }

    /**
     * 克隆矩阵
     */
    public clone(): Matrix {
        return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }

    /**
     * 转换为字符串
     */
    public toString(): string {
        return `Matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.tx}, ${this.ty})`;
    }

    /**
     * 检查是否相等
     */
    public equals(matrix: Matrix, tolerance: number = 0.001): boolean {
        return Math.abs(this.a - matrix.a) < tolerance &&
               Math.abs(this.b - matrix.b) < tolerance &&
               Math.abs(this.c - matrix.c) < tolerance &&
               Math.abs(this.d - matrix.d) < tolerance &&
               Math.abs(this.tx - matrix.tx) < tolerance &&
               Math.abs(this.ty - matrix.ty) < tolerance;
    }

    /**
     * 静态方法：创建单位矩阵
     */
    public static createIdentity(): Matrix {
        return new Matrix(1, 0, 0, 1, 0, 0);
    }

    /**
     * 静态方法：创建平移矩阵
     */
    public static createTranslation(tx: number, ty: number): Matrix {
        return new Matrix(1, 0, 0, 1, tx, ty);
    }

    /**
     * 静态方法：创建旋转矩阵
     */
    public static createRotation(angle: number): Matrix {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Matrix(cos, sin, -sin, cos, 0, 0);
    }

    /**
     * 静态方法：创建缩放矩阵
     */
    public static createScale(sx: number, sy: number): Matrix {
        return new Matrix(sx, 0, 0, sy, 0, 0);
    }
}

