/**
 * 颜色工具函数
 * 用于进度条组件的颜色处理和转换
 */

/**
 * 将十六进制颜色转换为RGBA
 * @param {string} hex - 十六进制颜色值，如 '#ff0000' 或 '#f00'
 * @param {number} alpha - 透明度，0-1之间
 * @returns {string} RGBA颜色字符串
 */
export function hexToRgba(hex, alpha = 1) {
  // 移除#号
  hex = hex.replace('#', '')

  // 处理缩写格式
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }

  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 生成线性渐变字符串
 * @param {string} startColor - 起始颜色
 * @param {string} endColor - 结束颜色
 * @param {number} angle - 渐变角度，默认90度（从左到右）
 * @returns {string} 线性渐变CSS字符串
 */
export function createLinearGradient(startColor, endColor, angle = 90) {
  return `linear-gradient(${angle}deg, ${startColor}, ${endColor})`
}

/**
 * 生成径向渐变字符串
 * @param {string} startColor - 起始颜色
 * @param {string} endColor - 结束颜色
 * @param {string} position - 渐变中心位置，默认'center'
 * @returns {string} 径向渐变CSS字符串
 */
export function createRadialGradient(startColor, endColor, position = 'center') {
  return `radial-gradient(circle at ${position}, ${startColor}, ${endColor})`
}

/**
 * 生成重复线性渐变字符串
 * @param {string} color1 - 第一种颜色
 * @param {string} color2 - 第二种颜色
 * @param {number} angle - 渐变角度，默认45度
 * @param {number} stripeWidth - 条纹宽度，默认10px
 * @returns {string} 重复线性渐变CSS字符串
 */
export function createRepeatingLinearGradient(color1, color2, angle = 45, stripeWidth = 10) {
  return `repeating-linear-gradient(${angle}deg, ${color1}, ${color1} ${stripeWidth}px, ${color2} ${stripeWidth}px, ${color2} ${stripeWidth * 2}px)`
}

/**
 * 调整颜色亮度
 * @param {string} color - 原始颜色（十六进制）
 * @param {number} percent - 亮度调整百分比，正数变亮，负数变暗
 * @returns {string} 调整后的十六进制颜色
 */
export function adjustBrightness(color, percent) {
  // 移除#号
  color = color.replace('#', '')

  // 处理缩写格式
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('')
  }

  // 解析RGB值
  let r = parseInt(color.substring(0, 2), 16)
  let g = parseInt(color.substring(2, 4), 16)
  let b = parseInt(color.substring(4, 6), 16)

  // 调整亮度
  r = Math.max(0, Math.min(255, Math.round(r * (1 + percent / 100))))
  g = Math.max(0, Math.min(255, Math.round(g * (1 + percent / 100))))
  b = Math.max(0, Math.min(255, Math.round(b * (1 + percent / 100))))

  // 转换回十六进制
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * 调整颜色饱和度
 * @param {string} color - 原始颜色（十六进制）
 * @param {number} percent - 饱和度调整百分比，正数增加，负数减少
 * @returns {string} 调整后的十六进制颜色
 */
export function adjustSaturation(color, percent) {
  // 移除#号
  color = color.replace('#', '')

  // 处理缩写格式
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('')
  }

  // 解析RGB值
  let r = parseInt(color.substring(0, 2), 16) / 255
  let g = parseInt(color.substring(2, 4), 16) / 255
  let b = parseInt(color.substring(4, 6), 16) / 255

  // 计算灰度
  const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b

  // 调整饱和度
  r = gray + (r - gray) * (1 + percent / 100)
  g = gray + (g - gray) * (1 + percent / 100)
  b = gray + (b - gray) * (1 + percent / 100)

  // 限制在0-1范围内
  r = Math.max(0, Math.min(1, r))
  g = Math.max(0, Math.min(1, g))
  b = Math.max(0, Math.min(1, b))

  // 转换回0-255并转十六进制
  r = Math.round(r * 255)
  g = Math.round(g * 255)
  b = Math.round(b * 255)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * 生成颜色渐变数组
 * @param {string} startColor - 起始颜色
 * @param {string} endColor - 结束颜色
 * @param {number} steps - 渐变步数
 * @returns {string[]} 颜色数组
 */
export function generateColorGradient(startColor, endColor, steps) {
  const colors = []

  // 移除#号
  startColor = startColor.replace('#', '')
  endColor = endColor.replace('#', '')

  // 处理缩写格式
  if (startColor.length === 3) {
    startColor = startColor.split('').map(char => char + char).join('')
  }
  if (endColor.length === 3) {
    endColor = endColor.split('').map(char => char + char).join('')
  }

  // 解析RGB值
  const startR = parseInt(startColor.substring(0, 2), 16)
  const startG = parseInt(startColor.substring(2, 4), 16)
  const startB = parseInt(startColor.substring(4, 6), 16)

  const endR = parseInt(endColor.substring(0, 2), 16)
  const endG = parseInt(endColor.substring(2, 4), 16)
  const endB = parseInt(endColor.substring(4, 6), 16)

  // 生成渐变
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)

    const r = Math.round(startR + (endR - startR) * ratio)
    const g = Math.round(startG + (endG - startG) * ratio)
    const b = Math.round(startB + (endB - startB) * ratio)

    colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
  }

  return colors
}

/**
 * 检查颜色对比度是否足够
 * @param {string} color1 - 第一种颜色
 * @param {string} color2 - 第二种颜色
 * @param {number} minContrast - 最小对比度要求，默认4.5（WCAG AA标准）
 * @returns {boolean} 是否满足对比度要求
 */
export function checkColorContrast(color1, color2, minContrast = 4.5) {
  // 计算相对亮度
  const luminance1 = calculateRelativeLuminance(color1)
  const luminance2 = calculateRelativeLuminance(color2)

  // 计算对比度
  const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05)

  return contrast >= minContrast
}

/**
 * 计算颜色的相对亮度
 * @param {string} color - 颜色值
 * @returns {number} 相对亮度（0-1）
 */
function calculateRelativeLuminance(color) {
  // 移除#号
  color = color.replace('#', '')

  // 处理缩写格式
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('')
  }

  // 解析RGB值
  const r = parseInt(color.substring(0, 2), 16) / 255
  const g = parseInt(color.substring(2, 4), 16) / 255
  const b = parseInt(color.substring(4, 6), 16) / 255

  // 应用sRGB转换
  const rSRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gSRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bSRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  // 计算相对亮度
  return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB
}

/**
 * 生成随机颜色
 * @param {string} type - 颜色类型：'vibrant'（鲜艳）、'pastel'（柔和）、'dark'（深色）、'light'（浅色）
 * @returns {string} 随机颜色
 */
export function generateRandomColor(type = 'vibrant') {
  let r, g, b

  switch (type) {
    case 'vibrant':
      // 鲜艳颜色
      r = Math.floor(Math.random() * 128) + 128
      g = Math.floor(Math.random() * 128) + 128
      b = Math.floor(Math.random() * 128) + 128
      break

    case 'pastel':
      // 柔和颜色
      r = Math.floor(Math.random() * 96) + 160
      g = Math.floor(Math.random() * 96) + 160
      b = Math.floor(Math.random() * 96) + 160
      break

    case 'dark':
      // 深色
      r = Math.floor(Math.random() * 128)
      g = Math.floor(Math.random() * 128)
      b = Math.floor(Math.random() * 128)
      break

    case 'light':
      // 浅色
      r = Math.floor(Math.random() * 96) + 160
      g = Math.floor(Math.random() * 96) + 160
      b = Math.floor(Math.random() * 96) + 160
      break

    default:
      // 随机颜色
      r = Math.floor(Math.random() * 256)
      g = Math.floor(Math.random() * 256)
      b = Math.floor(Math.random() * 256)
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * 获取颜色的互补色
 * @param {string} color - 原始颜色
 * @returns {string} 互补色
 */
export function getComplementaryColor(color) {
  // 移除#号
  color = color.replace('#', '')

  // 处理缩写格式
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('')
  }

  // 解析RGB值
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // 计算互补色
  const compR = 255 - r
  const compG = 255 - g
  const compB = 255 - b

  return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`
}

export default {
  hexToRgba,
  createLinearGradient,
  createRadialGradient,
  createRepeatingLinearGradient,
  adjustBrightness,
  adjustSaturation,
  generateColorGradient,
  checkColorContrast,
  generateRandomColor,
  getComplementaryColor
}

