/**
 * Matrix2D.js - 2D 矩阵变换
 *
 * 提供 2D 仿射变换矩阵的计算
 * 格式：[m00 m01 m02]
 *       [m10 m11 m12]
 *       [  0   0   1]
 */
class Matrix2D {
  /**
   * 创建矩阵
   * [m00 m01 m02]     [cos*sx   -sin*sy   tx]
   * [m10 m11 m12]  =  [sin*sx    cos*sy   ty]
   * [  0   0   1]     [   0        0       1 ]
   */
  constructor(m00, m01, m02, m10, m11, m12) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
  }

  /**
   * 单位矩阵
   */
  static identity() {
    return new Matrix2D(1, 0, 0, 0, 1, 0);
  }

  /**
   * 从 TRS（平移、旋转、缩放）创建矩阵
   */
  static fromTRS(position, rotation, scale) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return new Matrix2D(
      cos * scale.x,       // m00
      -sin * scale.x,      // m01
      position.x,          // m02
      sin * scale.y,       // m10
      cos * scale.y,       // m11
      position.y           // m12
    );
  }

  /**
   * 矩阵乘法
   * 结果 = a × b
   */
  static multiply(a, b) {
    return new Matrix2D(
      a.m00 * b.m00 + a.m01 * b.m10,
      a.m00 * b.m01 + a.m01 * b.m11,
      a.m00 * b.m02 + a.m01 * b.m12 + a.m02,
      a.m10 * b.m00 + a.m11 * b.m10,
      a.m10 * b.m01 + a.m11 * b.m11,
      a.m10 * b.m02 + a.m11 * b.m12 + a.m12
    );
  }

  /**
   * 变换点 (x, y)
   * 返回 [x', y']
   */
  transform(x, y) {
    return [
      this.m00 * x + this.m01 * y + this.m02,
      this.m10 * x + this.m11 * y + this.m12
    ];
  }

  /**
   * 变换方向（不考虑平移）
   */
  transformDirection(x, y) {
    return [
      this.m00 * x + this.m01 * y,
      this.m10 * x + this.m11 * y
    ];
  }

  /**
   * 矩阵求逆
   */
  inverse() {
    const det = this.m00 * this.m11 - this.m01 * this.m10;

    if (Math.abs(det) < 1e-10) {
      console.warn('Matrix2D: Determinant is near zero, cannot invert');
      return Matrix2D.identity();
    }

    const invDet = 1 / det;

    return new Matrix2D(
      this.m11 * invDet,
      -this.m01 * invDet,
      (this.m01 * this.m12 - this.m11 * this.m02) * invDet,
      -this.m10 * invDet,
      this.m00 * invDet,
      (this.m10 * this.m02 - this.m00 * this.m12) * invDet
    );
  }

  /**
   * 从矩阵提取 TRS
   */
  extractTRS() {
    // 平移
    const position = { x: this.m02, y: this.m12 };

    // 旋转
    const rotation = Math.atan2(this.m10, this.m00);

    // 缩放
    const scaleX = Math.sqrt(this.m00 * this.m00 + this.m01 * this.m01);
    const scaleY = Math.sqrt(this.m10 * this.m10 + this.m11 * this.m11);

    return {
      position,
      rotation,
      scale: {
        x: Math.abs(scaleX) * (this.m00 < 0 ? -1 : 1),
        y: Math.abs(scaleY) * (this.m11 < 0 ? -1 : 1)
      }
    };
  }

  /**
   * 复制矩阵
   */
  clone() {
    return new Matrix2D(this.m00, this.m01, this.m02, this.m10, this.m11, this.m12);
  }

  /**
   * 转换为字符串（调试用）
   */
  toString() {
    return `Matrix2D(${this.m00.toFixed(2)}, ${this.m01.toFixed(2)}, ${this.m02.toFixed(2)}, ${this.m10.toFixed(2)}, ${this.m11.toFixed(2)}, ${this.m12.toFixed(2)})`;
  }
}

