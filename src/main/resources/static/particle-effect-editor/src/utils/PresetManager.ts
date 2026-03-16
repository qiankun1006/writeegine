import type {SystemConfig} from '../types/particle'

export interface Preset {
  name: string
  description: string
  config: SystemConfig
}

export class PresetManager {
  private static presets: Map<string, Preset> = new Map()

  /**
   * 加载预设配置
   */
  static async loadPresets(): Promise<void> {
    try {
      // 加载内置预设
      const presetFiles = ['Flame.json', 'Snow.json', 'Rain.json', 'Explosion.json']

      for (const file of presetFiles) {
        const response = await fetch(`/particle-effect-editor/assets/presets/${file}`)
        if (response.ok) {
          const preset = await response.json()
          this.presets.set(preset.name, preset)
        }
      }
    } catch (error) {
      console.error('加载预设失败:', error)
    }
  }

  /**
   * 获取所有预设
   */
  static getPresets(): Preset[] {
    return Array.from(this.presets.values())
  }

  /**
   * 根据名称获取预设
   */
  static getPreset(name: string): Preset | undefined {
    return this.presets.get(name)
  }

  /**
   * 保存用户预设到 localStorage
   */
  static saveUserPreset(name: string, config: SystemConfig, description?: string): void {
    const userPresets = this.getUserPresets()
    userPresets[name] = {
      name,
      description: description || `用户预设: ${name}`,
      config
    }
    localStorage.setItem('particle-user-presets', JSON.stringify(userPresets))
  }

  /**
   * 获取用户保存的预设
   */
  static getUserPresets(): Record<string, Preset> {
    try {
      const stored = localStorage.getItem('particle-user-presets')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('读取用户预设失败:', error)
      return {}
    }
  }

  /**
   * 删除用户预设
   */
  static deleteUserPreset(name: string): void {
    const userPresets = this.getUserPresets()
    delete userPresets[name]
    localStorage.setItem('particle-user-presets', JSON.stringify(userPresets))
  }

  /**
   * 获取所有预设（内置 + 用户）
   */
  static getAllPresets(): Preset[] {
    const builtin = this.getPresets()
    const user = Object.values(this.getUserPresets())
    return [...builtin, ...user]
  }
}

