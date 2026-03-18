/**
 * 动画工具函数
 * 用于进度条组件的动画效果处理
 */

/**
 * 创建CSS动画关键帧
 * @param {string} name - 动画名称
 * @param {Object} keyframes - 关键帧对象，如 { '0%': { opacity: 0 }, '100%': { opacity: 1 } }
 * @returns {string} CSS关键帧字符串
 */
export function createKeyframes(name, keyframes) {
  const frames = Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ')
      return `${key} { ${styleString} }`
    })
    .join(' ')

  return `@keyframes ${name} { ${frames} }`
}

/**
 * 应用CSS动画
 * @param {HTMLElement} element - DOM元素
 * @param {string} animationName - 动画名称
 * @param {Object} options - 动画选项
 * @param {number} options.duration - 动画时长（毫秒）
 * @param {string} options.timingFunction - 时间函数，默认'ease'
 * @param {number} options.delay - 延迟时间（毫秒）
 * @param {number} options.iterationCount - 重复次数，默认1，'infinite'表示无限
 * @param {string} options.direction - 方向，默认'normal'
 * @param {string} options.fillMode - 填充模式，默认'forwards'
 */
export function applyAnimation(element, animationName, options = {}) {
  const {
    duration = 1000,
    timingFunction = 'ease',
    delay = 0,
    iterationCount = 1,
    direction = 'normal',
    fillMode = 'forwards'
  } = options

  element.style.animation = `${animationName} ${duration}ms ${timingFunction} ${delay}ms ${iterationCount} ${direction} ${fillMode}`
}

/**
 * 移除CSS动画
 * @param {HTMLElement} element - DOM元素
 */
export function removeAnimation(element) {
  element.style.animation = ''
}

/**
 * 创建脉冲动画
 * @param {HTMLElement} element - DOM元素
 * @param {Object} options - 动画选项
 */
export function createPulseAnimation(element, options = {}) {
  const {
    duration = 1500,
    minOpacity = 0.7,
    maxOpacity = 1,
    timingFunction = 'ease-in-out',
    iterationCount = 'infinite'
  } = options

  const animationName = `pulse-${Date.now()}`
  const keyframes = {
    '0%, 100%': { opacity: maxOpacity },
    '50%': { opacity: minOpacity }
  }

  // 创建并注入关键帧
  const style = document.createElement('style')
  style.textContent = createKeyframes(animationName, keyframes)
  document.head.appendChild(style)

  // 应用动画
  applyAnimation(element, animationName, {
    duration,
    timingFunction,
    iterationCount
  })

  // 返回清理函数
  return () => {
    removeAnimation(element)
    document.head.removeChild(style)
  }
}

/**
 * 创建流光动画
 * @param {HTMLElement} element - DOM元素
 * @param {Object} options - 动画选项
 */
export function createFlowAnimation(element, options = {}) {
  const {
    duration = 2000,
    gradientWidth = 200,
    color = 'rgba(255, 255, 255, 0.4)',
    timingFunction = 'linear',
    iterationCount = 'infinite'
  } = options

  const animationName = `flow-${Date.now()}`
  const keyframes = {
    '0%': { backgroundPosition: `-${gradientWidth}px 0` },
    '100%': { backgroundPosition: `${gradientWidth}px 0` }
  }

  // 设置背景渐变
  element.style.background = `linear-gradient(90deg, transparent, ${color}, transparent)`
  element.style.backgroundSize = `${gradientWidth}px 100%`

  // 创建并注入关键帧
  const style = document.createElement('style')
  style.textContent = createKeyframes(animationName, keyframes)
  document.head.appendChild(style)

  // 应用动画
  applyAnimation(element, animationName, {
    duration,
    timingFunction,
    iterationCount
  })

  // 返回清理函数
  return () => {
    removeAnimation(element)
    element.style.background = ''
    element.style.backgroundSize = ''
    document.head.removeChild(style)
  }
}

/**
 * 创建条纹动画
 * @param {HTMLElement} element - DOM元素
 * @param {Object} options - 动画选项
 */
export function createStripeAnimation(element, options = {}) {
  const {
    duration = 1000,
    stripeWidth = 20,
    color1 = 'rgba(255, 255, 255, 0.3)',
    color2 = 'transparent',
    angle = 45,
    timingFunction = 'linear',
    iterationCount = 'infinite'
  } = options

  const animationName = `stripe-${Date.now()}`
  const keyframes = {
    '0%': { backgroundPosition: '0 0' },
    '100%': { backgroundPosition: `${stripeWidth * 2}px 0` }
  }

  // 计算条纹背景
  const stripeSize = Math.sqrt(2) * stripeWidth
  element.style.background = `repeating-linear-gradient(${angle}deg, ${color1}, ${color1} ${stripeWidth}px, ${color2} ${stripeWidth}px, ${color2} ${stripeWidth * 2}px)`
  element.style.backgroundSize = `${stripeSize}px ${stripeSize}px`

  // 创建并注入关键帧
  const style = document.createElement('style')
  style.textContent = createKeyframes(animationName, keyframes)
  document.head.appendChild(style)

  // 应用动画
  applyAnimation(element, animationName, {
    duration,
    timingFunction,
    iterationCount
  })

  // 返回清理函数
  return () => {
    removeAnimation(element)
    element.style.background = ''
    element.style.backgroundSize = ''
    document.head.removeChild(style)
  }
}

/**
 * 创建充能脉冲动画
 * @param {HTMLElement} element - DOM元素
 * @param {Object} options - 动画选项
 */
export function createChargePulseAnimation(element, options = {}) {
  const {
    duration = 2000,
    color = 'rgba(66, 133, 244, 0.7)',
    maxSize = 10,
    timingFunction = 'ease-out',
    iterationCount = 'infinite'
  } = options

  const animationName = `charge-pulse-${Date.now()}`
  const keyframes = {
    '0%': { boxShadow: `0 0 0 0 ${color}` },
    '70%': { boxShadow: `0 0 0 ${maxSize}px ${color.replace(')', ', 0)').replace('rgba', 'rgba')}` },
    '100%': { boxShadow: `0 0 0 0 ${color.replace(')', ', 0)').replace('rgba', 'rgba')}` }
  }

  // 创建并注入关键帧
  const style = document.createElement('style')
  style.textContent = createKeyframes(animationName, keyframes)
  document.head.appendChild(style)

  // 应用动画
  applyAnimation(element, animationName, {
    duration,
    timingFunction,
    iterationCount
  })

  // 返回清理函数
  return () => {
    removeAnimation(element)
    document.head.removeChild(style)
  }
}

/**
 * 创建血滴动画
 * @param {HTMLElement} container - 容器元素
 * @param {Object} options - 动画选项
 */
export function createBloodDropAnimation(container, options = {}) {
  const {
    count = 5,
    dropSize = 4,
    color = 'rgba(255, 0, 0, 0.7)',
    duration = 1500,
    maxHeight = 100
  } = options

  const drops = []
  const cleanupFunctions = []

  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div')
    drop.className = 'blood-drop'

    // 随机位置
    const left = Math.random() * 100
    const delay = Math.random() * 2

    // 设置样式
    drop.style.cssText = `
      position: absolute;
      width: ${dropSize}px;
      height: ${dropSize}px;
      background: radial-gradient(circle, ${color}, ${color.replace('0.7', '0.6')});
      border-radius: 50%;
      left: ${left}%;
      top: -20px;
      animation: blood-drop-fall ${duration}ms ease-in ${delay}s infinite;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    `

    container.appendChild(drop)
    drops.push(drop)

    // 创建关键帧
    const animationName = `blood-drop-fall-${Date.now()}-${i}`
    const keyframes = {
      '0%': {
        transform: 'translateY(-20px) scale(0.8)',
        opacity: '0'
      },
      '20%': {
        opacity: '1'
      },
      '80%': {
        opacity: '1'
      },
      '100%': {
        transform: `translateY(${maxHeight}px) scale(1)`,
        opacity: '0'
      }
    }

    const style = document.createElement('style')
    style.textContent = createKeyframes(animationName, keyframes)
    document.head.appendChild(style)

    drop.style.animation = `${animationName} ${duration}ms ease-in ${delay}s infinite`

    cleanupFunctions.push(() => {
      drop.style.animation = ''
      document.head.removeChild(style)
    })
  }

  // 返回清理函数
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup())
    drops.forEach(drop => drop.remove())
  }
}

/**
 * 创建阶梯动画
 * @param {HTMLElement} element - DOM元素
 * @param {Object} options - 动画选项
 */
export function createStepAnimation(element, options = {}) {
  const {
    duration = 2000,
    steps = 8,
    timingFunction = 'steps(8, end)',
    iterationCount = 1
  } = options

  const animationName = `step-fill-${Date.now()}`
  const keyframes = {}

  // 生成阶梯关键帧
  for (let i = 0; i <= steps; i++) {
    const percentage = (i / steps) * 100
    keyframes[`${percentage}%`] = { width: `${percentage}%` }
  }

  // 创建并注入关键帧
  const style = document.createElement('style')
  style.textContent = createKeyframes(animationName, keyframes)
  document.head.appendChild(style)

  // 应用动画
  applyAnimation(element, animationName, {
    duration,
    timingFunction,
    iterationCount
  })

  // 返回清理函数
  return () => {
    removeAnimation(element)
    document.head.removeChild(style)
  }
}

/**
 * 创建玻璃拟态模糊动画
 * @param {HTMLElement} element - DOM元素
 * @param {Object} options - 动画选项
 */
export function createGlassBlurAnimation(element, options = {}) {
  const {
    duration = 3000,
    minBlur = 8,
    maxBlur = 12,
    timingFunction = 'ease-in-out',
    iterationCount = 'infinite'
  } = options

  const animationName = `glass-blur-${Date.now()}`
  const keyframes = {
    '0%, 100%': { backdropFilter: `blur(${minBlur}px)`, WebkitBackdropFilter: `blur(${minBlur}px)` },
    '50%': { backdropFilter: `blur(${maxBlur}px)`, WebkitBackdropFilter: `blur(${maxBlur}px)` }
  }

  // 创建并注入关键帧
  const style = document.createElement('style')
  style.textContent = createKeyframes(animationName, keyframes)
  document.head.appendChild(style)

  // 应用动画
  applyAnimation(element, animationName, {
    duration,
    timingFunction,
    iterationCount
  })

  // 返回清理函数
  return () => {
    removeAnimation(element)
    document.head.removeChild(style)
  }
}

/**
 * 动画工具默认导出
 */
export default {
  createKeyframes,
  applyAnimation,
  removeAnimation,
  createPulseAnimation,
  createFlowAnimation,
  createStripeAnimation,
  createChargePulseAnimation,
  createBloodDropAnimation,
  createStepAnimation,
  createGlassBlurAnimation
}

