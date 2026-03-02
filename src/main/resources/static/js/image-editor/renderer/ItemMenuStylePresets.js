/**
 * ItemMenuStylePresets.js - 物品菜单风格预设
 * 定义四种内置风格：像素、暗黑、卡通、科幻
 */

/**
 * ItemMenuStylePresets - 风格预设管理器
 * 管理和提供各种风格的参数预设
 */
class ItemMenuStylePresets {
  constructor() {
    this.presets = {
      'pixel': this.getPixelPreset(),
      'dark': this.getDarkPreset(),
      'cartoon': this.getCartoonPreset(),
      'scifi': this.getSciFiPreset(),
    };
  }

  /**
   * 获取指定风格的预设
   */
  getPreset(styleName) {
    return this.presets[styleName] || this.presets['pixel'];
  }

  /**
   * 获取像素风格预设
   * 特点：鲜艳、纯色、8-bit 配色
   */
  getPixelPreset() {
    return {
      style_name: 'pixel',
      bg_color: '#1a1a1a',           // 背景色
      border_color: '#ffff00',        // 边框色
      border_width: 2,                // 边框宽度
      item_bg: '#333333',             // 物品背景
      item_hover_bg: '#ffaa00',       // 物品悬停背景
      item_selected_bg: '#ffff00',    // 物品选中背景
      item_border_color: '#aaaaaa',   // 物品边框色
      text_color: '#ffffff',          // 文字色
      text_disabled_color: '#666666', // 禁用文字色
      quantity_color: '#ffff00',      // 数量颜色
      font_family: 'monospace',       // 字体
      highlight_effect: 'color-invert', // 高亮效果
    };
  }

  /**
   * 获取暗黑风格预设
   * 特点：深红、紫、黑、金，压抑感
   */
  getDarkPreset() {
    return {
      style_name: 'dark',
      bg_color: '#0a0a0a',           // 背景色
      border_color: '#990000',        // 边框色
      border_width: 1.5,              // 边框宽度
      item_bg: '#2a0000',             // 物品背景
      item_hover_bg: 'rgba(255, 100, 0, 0.3)', // 物品悬停背景
      item_selected_bg: '#660000',    // 物品选中背景
      item_border_color: '#660000',   // 物品边框色
      text_color: '#ffcccc',          // 文字色
      text_disabled_color: '#550000', // 禁用文字色
      accent_color: '#ff6400',        // 强调色
      glow_color: 'rgba(255, 100, 0, 0.6)', // 光晕色
      font_family: 'serif',           // 字体
      highlight_effect: 'glow-orange', // 高亮效果
    };
  }

  /**
   * 获取卡通风格预设
   * 特点：饱和、明亮、多彩，活泼感
   */
  getCartoonPreset() {
    return {
      style_name: 'cartoon',
      bg_color: '#e6f2ff',           // 背景色
      border_color: '#333333',        // 边框色
      border_width: 2.5,              // 边框宽度
      item_bg: '#66ccff',             // 物品背景
      item_hover_bg: '#ffdd66',       // 物品悬停背景
      item_selected_bg: '#ffff66',    // 物品选中背景
      item_border_color: '#333333',   // 物品边框色
      text_color: '#ffffff',          // 文字色
      text_disabled_color: '#999999', // 禁用文字色
      quantity_color: '#ff3333',      // 数量颜色
      corner_radius: 6,               // 圆角半径
      font_family: 'sans-serif',      // 字体
      highlight_effect: 'scale-shadow', // 高亮效果
    };
  }

  /**
   * 获取科幻风格预设
   * 特点：冷色、霓虹、发光，未来感
   */
  getSciFiPreset() {
    return {
      style_name: 'scifi',
      bg_color: '#0a1a2a',           // 背景色
      border_color: '#0088ff',        // 边框色
      border_width: 1,                // 边框宽度
      item_bg: '#0a1a2a',             // 物品背景
      item_hover_bg: 'rgba(0, 255, 255, 0.1)', // 物品悬停背景
      item_selected_bg: '#002244',    // 物品选中背景
      item_border_color: '#0088ff',   // 物品边框色
      text_color: '#00ff00',          // 文字色 (绿色)
      text_hover_color: '#00ffff',    // 悬停文字色 (青色)
      text_disabled_color: '#004488', // 禁用文字色
      neon_color: '#00ffff',          // 霓虹色
      scanline_color: 'rgba(0, 255, 255, 0.2)', // 扫描线色
      font_family: 'monospace',       // 字体
      highlight_effect: 'scanline', // 高亮效果
    };
  }

  /**
   * 列出所有可用风格
   */
  getAvailableStyles() {
    return Object.keys(this.presets);
  }

  /**
   * 验证风格名称是否存在
   */
  isValidStyle(styleName) {
    return styleName in this.presets;
  }

  /**
   * 注册自定义风格
   */
  registerCustomStyle(styleName, styleParams) {
    this.presets[styleName] = {
      style_name: styleName,
      ...styleParams,
    };
    console.log(`✓ 已注册自定义风格: ${styleName}`);
  }

  /**
   * 获取风格的默认参数
   */
  getStyleDefaults() {
    return {
      bg_color: '#1a1a1a',
      border_color: '#ffffff',
      border_width: 1,
      item_bg: '#333333',
      item_hover_bg: '#555555',
      item_selected_bg: '#777777',
      text_color: '#ffffff',
      text_disabled_color: '#666666',
      font_family: 'monospace',
    };
  }

  /**
   * 合并风格参数(用于自定义覆盖)
   */
  mergePreset(baseStyleName, overrides = {}) {
    const base = this.presets[baseStyleName];
    if (!base) {
      console.warn(`❌ 风格 ${baseStyleName} 不存在`);
      return base;
    }
    return { ...base, ...overrides };
  }
}

