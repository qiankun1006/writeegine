export interface ParamHint {
  label: string
  description: string
  unit?: string
  recommended?: string
}

export const paramHints: Record<string, ParamHint> = {
  emissionRate: {
    label: '发射率',
    description: '每秒发射的粒子数量',
    unit: '粒子/秒',
    recommended: '10-100'
  },
  emissionBurst: {
    label: '爆发发射',
    description: '单次发射的粒子数量（用于爆炸等效果）',
    unit: '粒子',
    recommended: '0-50'
  },
  angle: {
    label: '发射角度',
    description: '粒子的发射方向',
    unit: '度',
    recommended: '0-360'
  },
  angleVariance: {
    label: '角度变化',
    description: '发射角度的随机变化范围',
    unit: '±度',
    recommended: '0-45'
  },
  speed: {
    label: '发射速度',
    description: '粒子的初始速度',
    unit: '像素/秒',
    recommended: '50-300'
  },
  speedVariance: {
    label: '速度变化',
    description: '发射速度的随机变化范围',
    unit: '±像素/秒',
    recommended: '0-100'
  },
  lifespan: {
    label: '粒子寿命',
    description: '粒子从生成到消失的时间',
    unit: '毫秒',
    recommended: '500-3000'
  },
  gravityX: {
    label: '重力 X',
    description: '水平方向的重力加速度',
    unit: '像素/秒²',
    recommended: '-100-100'
  },
  gravityY: {
    label: '重力 Y',
    description: '垂直方向的重力加速度',
    unit: '像素/秒²',
    recommended: '0-200'
  },
  alphaStart: {
    label: '起始透明度',
    description: '粒子生成时的透明度',
    unit: '0-1',
    recommended: '0.5-1'
  },
  alphaEnd: {
    label: '结束透明度',
    description: '粒子消失时的透明度',
    unit: '0-1',
    recommended: '0-0.5'
  },
  scaleStart: {
    label: '起始缩放',
    description: '粒子生成时的大小倍数',
    unit: '倍数',
    recommended: '0.5-2'
  },
  scaleEnd: {
    label: '结束缩放',
    description: '粒子消失时的大小倍数',
    unit: '倍数',
    recommended: '0.1-1'
  },
  rotationSpeed: {
    label: '旋转速度',
    description: '粒子的旋转速度',
    unit: '度/秒',
    recommended: '0-360'
  }
}

/**
 * 获取参数提示信息
 */
export function getParamHint(key: string): ParamHint | undefined {
  return paramHints[key]
}

/**
 * 获取所有参数提示
 */
export function getAllParamHints(): Record<string, ParamHint> {
  return paramHints
}

