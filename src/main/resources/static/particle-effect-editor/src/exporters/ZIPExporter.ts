import JSZip from 'jszip'
import type {SystemConfig} from '../types/particle'
import {LibGDXExporter} from './LibGDXExporter'
import {PNGExporter} from './PNGExporter'

export class ZIPExporter {
  /**
   * 导出完整资源包
   */
  static async exportBundle(
    config: SystemConfig,
    canvas: HTMLCanvasElement,
    filename: string = 'particle_bundle.zip'
  ): Promise<void> {
    const zip = new JSZip()

    // 添加 .p 文件
    const pContent = LibGDXExporter.export(config)
    zip.file('particle_effect.p', pContent)

    // 添加 PNG 截图
    try {
      const pngBlob = await PNGExporter.exportEffectScreenshot(canvas, 2)
      zip.file('particle_effect.png', pngBlob)
    } catch (error) {
      console.warn('PNG 导出失败，跳过:', error)
    }

    // 添加配置文件
    const configContent = JSON.stringify(config, null, 2)
    zip.file('config.json', configContent)

    // 添加 README
    const readme = this.generateReadme(config)
    zip.file('README.txt', readme)

    // 生成并下载 ZIP
    const content = await zip.generateAsync({ type: 'blob' })
    this.downloadBlob(content, filename)
  }

  /**
   * 生成 README 文件
   */
  private static generateReadme(config: SystemConfig): string {
    const emitters = config.emitters.length
    const totalParticles = config.maxParticles

    return `粒子效果资源包
==================

生成时间: ${new Date().toLocaleString('zh-CN')}

文件说明:
- particle_effect.p: LibGDX 粒子效果文件
- particle_effect.png: 效果预览图 (2x 分辨率)
- config.json: 完整配置文件

配置信息:
- 发射器数量: ${emitters}
- 最大粒子数: ${totalParticles}
- 背景色: ${config.backgroundColor}
- 渲染模式: ${config.renderMode}

使用方法:
1. 将 .p 文件放入 LibGDX 项目的 assets 目录
2. 在代码中使用 ParticleEffect.load() 加载
3. 参考 LibGDX 官方文档进行使用

注意: 确保项目中包含相应的纹理文件。
`
  }

  /**
   * 下载 Blob 文件
   */
  private static downloadBlob(blob: Blob, filename: string): void {
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
   * 导出轻量包（仅 .p 文件）
   */
  static async exportLightBundle(
    config: SystemConfig,
    filename: string = 'particle_light.zip'
  ): Promise<void> {
    const zip = new JSZip()

    // 仅添加 .p 文件
    const pContent = LibGDXExporter.export(config)
    zip.file('particle_effect.p', pContent)

    const content = await zip.generateAsync({ type: 'blob' })
    this.downloadBlob(content, filename)
  }

  /**
   * 获取预估文件大小
   */
  static async estimateSize(
    config: SystemConfig,
    canvas: HTMLCanvasElement
  ): Promise<{ pFile: number; pngFile: number; total: number }> {
    // 估算 .p 文件大小
    const pContent = LibGDXExporter.export(config)
    const pFileSize = new Blob([pContent]).size

    // 估算 PNG 文件大小（简化估算）
    const pngSize = canvas.width * canvas.height * 4 // RGBA

    return {
      pFile: pFileSize,
      pngFile: pngSize,
      total: pFileSize + pngSize
    }
  }
}

