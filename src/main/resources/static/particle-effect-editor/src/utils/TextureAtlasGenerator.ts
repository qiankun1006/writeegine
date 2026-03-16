export interface TextureInfo {
  id: string
  name: string
  width: number
  height: number
  image: HTMLImageElement
}

export interface AtlasRegion {
  textureId: string
  x: number
  y: number
  width: number
  height: number
}

export interface TextureAtlas {
  width: number
  height: number
  regions: AtlasRegion[]
  imageData: ImageData
}

export class TextureAtlasGenerator {
  /**
   * 生成纹理图集
   */
  static async generateAtlas(
    textures: TextureInfo[],
    maxWidth: number = 2048,
    maxHeight: number = 2048
  ): Promise<TextureAtlas> {
    // 使用简单的装箱算法
    const packedTextures = this.packTextures(textures, maxWidth, maxHeight)

    // 创建图集 Canvas
    const canvas = document.createElement('canvas')
    canvas.width = maxWidth
    canvas.height = maxHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // 绘制所有纹理到图集
    const regions: AtlasRegion[] = []

    for (const packed of packedTextures) {
      ctx.drawImage(
        packed.texture.image,
        packed.x,
        packed.y,
        packed.width,
        packed.height
      )

      regions.push({
        textureId: packed.texture.id,
        x: packed.x,
        y: packed.y,
        width: packed.width,
        height: packed.height
      })
    }

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, maxWidth, maxHeight)

    return {
      width: maxWidth,
      height: maxHeight,
      regions,
      imageData
    }
  }

  /**
   * 简单的纹理装箱算法（首次适应递减）
   */
  private static packTextures(
    textures: TextureInfo[],
    maxWidth: number,
    maxHeight: number
  ): Array<{ texture: TextureInfo; x: number; y: number; width: number; height: number }> {
    // 按面积从大到小排序
    const sortedTextures = [...textures].sort((a, b) =>
      (b.width * b.height) - (a.width * a.height)
    )

    const packed: Array<{ texture: TextureInfo; x: number; y: number; width: number; height: number }> = []
    const occupiedSpaces: Array<{ x: number; y: number; width: number; height: number }> = []

    for (const texture of sortedTextures) {
      const position = this.findBestPosition(
        texture,
        maxWidth,
        maxHeight,
        occupiedSpaces
      )

      if (position) {
        packed.push({
          texture,
          x: position.x,
          y: position.y,
          width: texture.width,
          height: texture.height
        })

        occupiedSpaces.push({
          x: position.x,
          y: position.y,
          width: texture.width,
          height: texture.height
        })
      } else {
        console.warn(`无法为纹理 ${texture.name} 找到合适位置`)
      }
    }

    return packed
  }

  /**
   * 寻找最佳位置（使用简单的底部左对齐策略）
   */
  private static findBestPosition(
    texture: TextureInfo,
    maxWidth: number,
    maxHeight: number,
    occupiedSpaces: Array<{ x: number; y: number; width: number; height: number }>
  ): { x: number; y: number } | null {
    // 尝试从左到右，从下到上寻找位置
    for (let y = 0; y <= maxHeight - texture.height; y += 1) {
      for (let x = 0; x <= maxWidth - texture.width; x += 1) {
        const candidateRect = {
          x,
          y,
          width: texture.width,
          height: texture.height
        }

        // 检查是否与已有空间重叠
        const overlaps = occupiedSpaces.some(space =>
          this.rectanglesOverlap(candidateRect, space)
        )

        if (!overlaps) {
          return { x, y }
        }
      }
    }

    return null
  }

  /**
   * 检查两个矩形是否重叠
   */
  private static rectanglesOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      rect1.x >= rect2.x + rect2.width ||
      rect1.x + rect1.width <= rect2.x ||
      rect1.y >= rect2.y + rect2.height ||
      rect1.y + rect1.height <= rect2.y
    )
  }

  /**
   * 生成 .atlas 文件内容
   */
  static generateAtlasFile(atlas: TextureAtlas, textureName: string = 'particle_atlas'): string {
    let content = `${textureName}.png\n`
    content += `format: RGBA8888\n`
    content += `filter: Linear,Linear\n`
    content += `repeat: none\n`

    for (const region of atlas.regions) {
      content += `${region.textureId}\n`
      content += `  rotate: false\n`
      content += `  xy: ${region.x}, ${region.y}\n`
      content += `  size: ${region.width}, ${region.height}\n`
      content += `  orig: ${region.width}, ${region.height}\n`
      content += `  offset: 0, 0\n`
      content += `  index: -1\n`
    }

    return content
  }

  /**
   * 下载纹理图集
   */
  static async downloadAtlas(
    atlas: TextureAtlas,
    baseName: string = 'particle_atlas'
  ): Promise<void> {
    // 创建图集图片
    const canvas = document.createElement('canvas')
    canvas.width = atlas.width
    canvas.height = atlas.height
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.putImageData(atlas.imageData, 0, 0)

      // 下载 PNG
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${baseName}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    }

    // 下载 .atlas 文件
    const atlasContent = this.generateAtlasFile(atlas, baseName)
    const atlasBlob = new Blob([atlasContent], { type: 'text/plain' })
    const atlasUrl = URL.createObjectURL(atlasBlob)
    const atlasA = document.createElement('a')
    atlasA.href = atlasUrl
    atlasA.download = `${baseName}.atlas`
    document.body.appendChild(atlasA)
    atlasA.click()
    document.body.removeChild(atlasA)
    URL.revokeObjectURL(atlasUrl)
  }
}

