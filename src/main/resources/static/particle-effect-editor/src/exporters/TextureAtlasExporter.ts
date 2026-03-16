import type {TextureRegion} from '../types/particle'
import {TextureAtlasGenerator, type TextureInfo} from '../utils/TextureAtlasGenerator'

export class TextureAtlasExporter {
  /**
   * 导出纹理图集
   */
  static async exportAtlas(
    textures: TextureInfo[],
    filename: string = 'particle_atlas'
  ): Promise<void> {
    try {
      // 生成图集
      const atlas = await TextureAtlasGenerator.generateAtlas(textures)

      // 下载图集文件
      await TextureAtlasGenerator.downloadAtlas(atlas, filename)

      console.log('纹理图集导出成功')
    } catch (error) {
      console.error('纹理图集导出失败:', error)
    }
  }

  /**
   * 生成 .atlas 文件内容
   */
  static generateAtlasFile(
    regions: Array<{ id: string; x: number; y: number; width: number; height: number }>,
    atlasWidth: number,
    atlasHeight: number,
    textureName: string = 'particle_atlas'
  ): string {
    let content = `${textureName}.png\n`
    content += `format: RGBA8888\n`
    content += `filter: Linear,Linear\n`
    content += `repeat: none\n`
    content += `size: ${atlasWidth}, ${atlasHeight}\n`

    for (const region of regions) {
      content += `${region.id}\n`
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
   * 下载 .atlas 文件
   */
  static downloadAtlasFile(
    content: string,
    filename: string = 'particle.atlas'
  ): void {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 创建简单的纹理图集（用于单个纹理）
   */
  static createSimpleAtlas(texture: HTMLImageElement, textureId: string): string {
    const content = `${textureId}.png\n` +
      `format: RGBA8888\n` +
      `filter: Linear,Linear\n` +
      `repeat: none\n` +
      `${textureId}\n` +
      `  rotate: false\n` +
      `  xy: 0, 0\n` +
      `  size: ${texture.width}, ${texture.height}\n` +
      `  orig: ${texture.width}, ${texture.height}\n` +
      `  offset: 0, 0\n` +
      `  index: -1\n`

    return content
  }

  /**
   * 从 TextureRegion 数组生成 .atlas 文件
   */
  static generateFromRegions(
    regions: TextureRegion[],
    baseTextureName: string = 'particle_texture'
  ): string {
    let content = `${baseTextureName}.png\n`
    content += `format: RGBA8888\n`
    content += `filter: Linear,Linear\n`
    content += `repeat: none\n`

    for (const region of regions) {
      // 将标准化坐标转换为像素坐标（假设纹理大小为 512x512）
      const textureWidth = 512
      const textureHeight = 512

      const x = Math.round(region.u * textureWidth)
      const y = Math.round(region.v * textureHeight)
      const width = Math.round(region.width * textureWidth)
      const height = Math.round(region.height * textureHeight)

      content += `${region.textureId}\n`
      content += `  rotate: false\n`
      content += `  xy: ${x}, ${y}\n`
      content += `  size: ${width}, ${height}\n`
      content += `  orig: ${width}, ${height}\n`
      content += `  offset: 0, 0\n`
      content += `  index: -1\n`
    }

    return content
  }
}

