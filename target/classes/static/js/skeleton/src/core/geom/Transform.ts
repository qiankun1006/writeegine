/**
 * 变换信息类
 * @author skeleton-animation-system
 */

import {Matrix} from './Matrix';

export class Transform {
    public x: number = 0;
    public y: number = 0;
    public skewX: number = 0;
    public skewY: number = 0;
    public scaleX: number = 1;
    public scaleY: number = 1;

    public readonly matrix: Matrix = new Matrix();

    constructor() {}

    /**
     * 转换为矩阵
     */
    public toMatrix(): Matrix {
        const matrix = this.matrix;
        matrix.a = this.scaleX * Math.cos(this.skewY);
        matrix.b = this.scaleX * Math.sin(this.skewY);
        matrix.c = -this.scaleY * Math.sin(this.skewX);
        matrix.d = this.scaleY * Math.cos(this.skewX);
        matrix.tx = this.x;
        matrix.ty = this.y;
        return matrix;
    }

    /**
     * 从矩阵提取变换信息
     */
    public fromMatrix(matrix: Matrix): Transform {
        this.x = matrix.tx;
        this.y = matrix.ty;

        // 提取缩放和旋转信息
        const a = matrix.a;
        const b = matrix.b;
        const c = matrix.c;
        const d = matrix.d;

        this.scaleX = Math.sqrt(a * a + b * b);
        this.scaleY = Math.sqrt(c * c + d * d);

        // 处理负缩放的情况
        if (this.scaleX < 0) {
            this.scaleX = -this.scaleX;
            this.skewY = Math.atan2(-b, -a);
        } else {
            this.skewY = Math.atan2(b, a);
        }

        if (this.scaleY < 0) {
            this.scaleY = -this.scaleY;
            this.skewX = Math.atan2(-c, -d);
        } else {
            this.skewX = Math.atan2(c, d);
        }

        return this;
    }

    /**
     * 从另一个变换复制值
     */
    public copyFrom(transform: Transform): Transform {
        this.x = transform.x;
        this.y = transform.y;
        this.skewX = transform.skewX;
        this.skewY = transform.skewY;
        this.scaleX = transform.scaleX;
        this.scaleY = transform.scaleY;
        return this;
    }

    /**
     * 清空变换值
     */
    public clear(): Transform {
        this.x = 0;
        this.y = 0;
        this.skewX = 0;
        this.skewY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        return this;
    }

    /**
     * 设置变换值
     */
    public setTo(x: number, y: number, skewX: number = 0, skewY: number = 0, scaleX: number = 1, scaleY: number = 1): Transform {
        this.x = x;
        this.y = y;
        this.skewX = skewX;
        this.skewY = skewY;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        return this;
    }

    /**
     * 线性插值
     */
    public lerp(transform: Transform, t: number): Transform {
        this.x = this.x + (transform.x - this.x) * t;
        this.y = this.y + (transform.y - this.y) * t;
        this.skewX = this.skewX + (transform.skewX - this.skewX) * t;
        this.skewY = this.skewY + (transform.skewY - this.skewY) * t;
        this.scaleX = this.scaleX + (transform.scaleX - this.scaleX) * t;
        this.scaleY = this.scaleY + (transform.scaleY - this.scaleY) * t;
        return this;
    }

    /**
     * 克隆变换
     */
    public clone(): Transform {
        const result = new Transform();
        result.copyFrom(this);
        return result;
    }

    /**
     * 转换为字符串
     */
    public toString(): string {
        return `Transform(x:${this.x}, y:${this.y}, skewX:${this.skewX}, skewY:${this.skewY}, scaleX:${this.scaleX}, scaleY:${this.scaleY})`;
    }

    /**
     * 检查是否相等
     */
    public equals(transform: Transform, tolerance: number = 0.001): boolean {
        return Math.abs(this.x - transform.x) < tolerance &&
               Math.abs(this.y - transform.y) < tolerance &&
               Math.abs(this.skewX - transform.skewX) < tolerance &&
               Math.abs(this.skewY - transform.skewY) < tolerance &&
               Math.abs(this.scaleX - transform.scaleX) < tolerance &&
               Math.abs(this.scaleY - transform.scaleY) < tolerance;
    }

    /**
     * 静态方法：创建单位变换
     */
    public static createIdentity(): Transform {
        return new Transform();
    }

    /**
     * 静态方法：创建平移变换
     */
    public static createTranslation(x: number, y: number): Transform {
        const transform = new Transform();
        transform.x = x;
        transform.y = y;
        return transform;
    }

    /**
     * 静态方法：创建旋转变换
     */
    public static createRotation(angle: number): Transform {
        const transform = new Transform();
        transform.skewX = angle;
        transform.skewY = angle;
        return transform;
    }

    /**
     * 静态方法：创建缩放变换
     */
    public static createScale(scaleX: number, scaleY: number): Transform {
        const transform = new Transform();
        transform.scaleX = scaleX;
        transform.scaleY = scaleY;
        return transform;
    }
}

