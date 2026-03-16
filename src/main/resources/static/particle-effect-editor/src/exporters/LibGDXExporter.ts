import type {EmitterConfig, SystemConfig} from '../types/particle'

export class LibGDXExporter {
  /**
   * 导出为 LibGDX .p 格式
   */
  static export(config: SystemConfig): string {
    let content = ''

    for (let i = 0; i < config.emitters.length; i++) {
      const emitter = config.emitters[i]
      content += this.exportEmitter(emitter, i)
    }

    return content
  }

  private static exportEmitter(config: EmitterConfig, index: number): string {
    let emitterContent = `name: emitter_${index}\n`

    // Delay（延迟）
    emitterContent += `- Delay\n`
    emitterContent += `  active: false\n`
    emitterContent += `  lowMin: 0.0\n`
    emitterContent += `  lowMax: 0.0\n\n`

    // Life（寿命）
    emitterContent += `- Life\n`
    emitterContent += `  lowMin: ${config.particleConfig.lifespan}\n`
    emitterContent += `  lowMax: ${config.particleConfig.lifespan}\n\n`

    // Emission（发射率）
    emitterContent += `- Emission\n`
    emitterContent += `  lowMin: ${Math.round(config.emissionRate)}\n`
    emitterContent += `  lowMax: ${Math.round(config.emissionRate)}\n\n`

    // Count（粒子数量）
    emitterContent += `- Count\n`
    emitterContent += `  lowMin: ${Math.round(config.emissionBurst)}\n`
    emitterContent += `  lowMax: ${Math.round(config.emissionBurst)}\n\n`

    // Delay（延迟时间）
    emitterContent += `- Delay\n`
    emitterContent += `  lowMin: 0.0\n`
    emitterContent += `  lowMax: 0.0\n\n`

    // Duration（持续时间）
    emitterContent += `- Duration\n`
    emitterContent += `  lowMin: 60000.0\n`
    emitterContent += `  lowMax: 60000.0\n\n`

    // X 坐标
    emitterContent += `- X\n`
    emitterContent += `  lowMin: ${config.position.x}\n`
    emitterContent += `  lowMax: ${config.position.x}\n\n`

    // Y 坐标
    emitterContent += `- Y\n`
    emitterContent += `  lowMin: ${config.position.y}\n`
    emitterContent += `  lowMax: ${config.position.y}\n\n`

    // 发射角度
    emitterContent += `- Angle\n`
    emitterContent += `  lowMin: ${config.angle - config.angleVariance / 2}\n`
    emitterContent += `  lowMax: ${config.angle + config.angleVariance / 2}\n\n`

    // 粒子速度
    emitterContent += `- Speed\n`
    emitterContent += `  lowMin: ${config.speed - config.speedVariance / 2}\n`
    emitterContent += `  lowMax: ${config.speed + config.speedVariance / 2}\n\n`

    // 粒子重力
    emitterContent += `- Gravity\n`
    emitterContent += `  lowMin: 0.0\n`
    emitterContent += `  lowMax: 0.0\n\n`

    // 粒子色调
    emitterContent += `- Tint\n`
    const startColor = config.particleConfig.color
    emitterContent += `  colors: ${startColor.startR / 255}, ${startColor.startG / 255}, ${startColor.startB / 255}\n`
    emitterContent += `  colors: ${startColor.endR / 255}, ${startColor.endG / 255}, ${startColor.endB / 255}\n\n`

    // 粒子透明度
    emitterContent += `- Transparency\n`
    emitterContent += `  timeline: 0.0, 1.0, 1.0\n`
    emitterContent += `  scaling: ${config.particleConfig.alphaStart}, ${config.particleConfig.alphaEnd}, ${config.particleConfig.alphaEnd}\n\n`

    // 粒子缩放
    emitterContent += `- Scale\n`
    emitterContent += `  lowMin: ${config.particleConfig.scale.start * 32}\n`
    emitterContent += `  lowMax: ${config.particleConfig.scale.start * 32}\n\n`

    // 粒子旋转
    emitterContent += `- Rotation\n`
    emitterContent += `  lowMin: ${config.particleConfig.rotation.start}\n`
    emitterContent += `  lowMax: ${config.particleConfig.rotation.end}\n\n`

    // 粒子混合模式
    emitterContent += `- Options\n`
    emitterContent += `  attached: false\n`
    emitterContent += `  continuous: true\n`
    emitterContent += `  additive: true\n`
    emitterContent += `  aligned: false\n\n`

    return emitterContent
  }

  /**
   * 下载 .p 文件
   */
  static download(config: SystemConfig, filename: string = 'particle_effect.p'): void {
    const content = this.export(config)
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
}

