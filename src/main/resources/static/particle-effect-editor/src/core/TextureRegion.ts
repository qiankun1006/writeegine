export interface TextureRegionConfig {
  textureId: string
  u: number        // 标准化坐标 0-1
  v: number
  width: number    // 标准化宽度 0-1
  height: number
}

export class TextureRegion {
  public textureId: string
  public u: number
  public v: number
  public width: number
  public height: number

  constructor(config: TextureRegionConfig) {
    this.textureId = config.textureId
    this.u = Math.max(0, Math.min(1, config.u))
    this.v = Math.max(0, Math.min(1, config.v))
    this.width = Math.max(0, Math.min(1 - this.u, config.width))
    this.height = Math.max(0, Math.min(1 - this.v, config.height))
  }

  /**
   * 获取像素坐标（给定纹理尺寸）
   */
  getPixelCoordinates(textureWidth: number, textureHeight: number): {
    x: number
    y: number
    width: number
    height: number
  } {
    return {
      x: Math.round(this.u * textureWidth),
      y: Math.round(this.v * textureHeight),
      width: Math.round(this.width * textureWidth),
      height: Math.round(this.height * textureHeight)
    }
  }

  /**
   * 获取标准化坐标
   */
  getUVCoordinates(): { u: number; v: number; u2: number; v2: number } {
    return {
      u: this.u,
      v: this.v,
      u2: this.u + this.width,
      v2: this.v + this.height
    }
  }

  /**
   * 检查是否有效
   */
  isValid(): boolean {
    return (
      this.textureId.length > 0 &&
      this.u >= 0 && this.u <= 1 &&
      this.v >= 0 && this.v <= 1 &&
      this.width > 0 && this.width <= 1 &&
      this.height > 0 && this.height <= 1 &&
      this.u + this.width <= 1 &&
      this.v + this.height <= 1
    )
  }

  /**
   * 克隆纹理区域
   */
  clone(): TextureRegion {
    return new TextureRegion({
      textureId: this.textureId,
      u: this.u,
      v: this.v,
      width: this.width,
      height: this.height
    })
  }

  /**
   * 转换为对象
   */
  toObject(): TextureRegionConfig {
    return {
      textureId: this.textureId,
      u: this.u,
      v: this.v,
      width: this.width,
      height: this.height
    }
  }

  /**
   * 从对象创建
   */
  static fromObject(obj: TextureRegionConfig): TextureRegion {
    return new TextureRegion(obj)
  }

  /**
   * 创建全屏纹理区域
   */
  static fullTexture(textureId: string): TextureRegion {
    return new TextureRegion({
      textureId,
      u: 0,
      v: 0,
      width: 1,
      height: 1
    })
  }

  /**
   * 创建子纹理区域
   */
  static subTexture(
    textureId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    textureWidth: number = 512,
    textureHeight: number = 512
  ): TextureRegion {
    return new TextureRegion({
      textureId,
      u: x / textureWidth,
      v: y / textureHeight,
      width: width / textureWidth,
      height: height / textureHeight
    })
  }

  /**
   * 计算面积
   */
  getArea(): number {
    return this.width * this.height
  }

  /**
   * 检查是否包含点
   */
  containsPoint(u: number, v: number): boolean {
    return (
      u >= this.u &&
      u <= this.u + this.width &&
      v >= this.v &&
      v <= this.v + this.height
    )
  }

  /**
   * 获取中心点
   */
  getCenter(): { u: number; v: number } {
    return {
      u: this.u + this.width / 2,
      v: this.v + this.height / 2
    }
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `TextureRegion(${this.textureId}: ${this.u.toFixed(3)},${this.v.toFixed(3)} ${this.width.toFixed(3)}x${this.height.toFixed(3)})`
  }
}

