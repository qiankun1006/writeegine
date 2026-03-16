export class PNGExporter {
  /**
   * 导出粒子效果截图
   */
  static async exportEffectScreenshot(
    canvas: HTMLCanvasElement,
    scale: number = 2
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!canvas) {
        reject(new Error('Canvas not found'))
        return
      }

      const width = canvas.width * scale
      const height = canvas.height * scale

      // 创建高分辨率 Canvas
      const offscreenCanvas = new OffscreenCanvas(width, height)
      const ctx = offscreenCanvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // 缩放绘制
      ctx.scale(scale, scale)

      // 复制原始 Canvas 内容
      ctx.drawImage(canvas, 0, 0)

      // 转换为 PNG
      offscreenCanvas.convertToBlob({ type: 'image/png' }).then(resolve)
    })
  }

  /**
   * 导出纹理图片
   */
  static async exportTextureImage(
    image: HTMLImageElement,
    filename: string
  ): Promise<void> {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(image, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        this.downloadBlob(blob, filename)
      }
    }, 'image/png')
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
   * 下载粒子效果截图
   */
  static async downloadEffectScreenshot(
    canvas: HTMLCanvasElement,
    filename: string = 'particle_effect.png',
    scale: number = 2
  ): Promise<void> {
    try {
      const blob = await this.exportEffectScreenshot(canvas, scale)
      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('导出 PNG 失败:', error)
    }
  }

  /**
   * 创建预览截图（低分辨率）
   */
  static createPreview(
    canvas: HTMLCanvasElement,
    width: number = 200,
    height: number = 150
  ): string {
    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = width
    previewCanvas.height = height

    const ctx = previewCanvas.getContext('2d')
    if (!ctx) return ''

    // 计算缩放比例
    const scaleX = width / canvas.width
    const scaleY = height / canvas.height
    const scale = Math.min(scaleX, scaleY)

    const scaledWidth = canvas.width * scale
    const scaledHeight = canvas.height * scale
    const offsetX = (width - scaledWidth) / 2
    const offsetY = (height - scaledHeight) / 2

    ctx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight)
    return previewCanvas.toDataURL('image/png')
  }
}

