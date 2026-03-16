import type {SystemConfig} from '../types/particle'

export class JSONExporter {
  /**
   * 导出为 JSON 格式
   */
  static export(config: SystemConfig, metadata?: any): string {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
      config: config
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 下载 JSON 文件
   */
  static download(
    config: SystemConfig,
    filename: string = 'particle_config.json',
    metadata?: any
  ): void {
    const content = this.export(config, metadata)
    const blob = new Blob([content], { type: 'application/json' })
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
   * 从 JSON 字符串导入配置
   */
  static import(jsonString: string): SystemConfig | null {
    try {
      const data = JSON.parse(jsonString)
      if (data.config) {
        return data.config as SystemConfig
      }
      return data as SystemConfig
    } catch (error) {
      console.error('导入 JSON 失败:', error)
      return null
    }
  }

  /**
   * 验证配置格式
   */
  static validate(config: SystemConfig): boolean {
    // 基本验证逻辑
    if (!config.emitters || !Array.isArray(config.emitters)) {
      return false
    }

    for (const emitter of config.emitters) {
      if (!emitter.particleConfig) {
        return false
      }

      // 验证必要字段
      const requiredFields = [
        'lifespan', 'initialVelocity', 'acceleration',
        'color', 'alphaStart', 'alphaEnd', 'scale', 'rotation'
      ]

      for (const field of requiredFields) {
        if (!(field in emitter.particleConfig)) {
          return false
        }
      }
    }

    return true
  }
}

