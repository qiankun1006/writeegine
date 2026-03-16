// 基础粒子参数
export interface ParticleConfig {
  // 生命周期
  lifespan: number;                   // 毫秒

  // 运动参数
  initialVelocity: {
    x: number;                        // 像素/秒
    y: number;
  };
  acceleration: {
    x: number;                        // 像素/秒²
    y: number;
  };

  // 外观参数
  color: {
    startR: number;                   // 0-255
    startG: number;
    startB: number;
    endR: number;
    endG: number;
    endB: number;
  };
  alphaStart: number;                 // 0-1
  alphaEnd: number;
  scale: {
    start: number;                    // 倍数
    end: number;
  };
  rotation: {
    start: number;                    // 度数
    end: number;
    speed: number;                    // 度数/秒
  };

  // 纹理参数
  textureRegion?: TextureRegion;
}

// 发射器参数
export interface EmitterConfig {
  // 位置
  position: {
    x: number;
    y: number;
  };

  // 发射参数
  emissionRate: number;                // 粒子/秒
  emissionBurst: number;               // 单次发射数量

  // 发射角度
  angle: number;                       // 度数 (0-360)
  angleVariance: number;               // ±度数

  // 发射速度
  speed: number;                       // 像素/秒
  speedVariance: number;               // ±像素/秒

  // 是否启用
  enabled: boolean;

  // 粒子参数
  particleConfig: ParticleConfig;
}

// 粒子系统全局参数
export interface SystemConfig {
  // 物理环境
  gravity: {
    x: number;
    y: number;
  };
  windForce: {
    x: number;
    y: number;
  };

  // 模拟参数
  maxParticles: number;                // 最大粒子数
  fps: number;                         // 帧率

  // 渲染参数
  backgroundColor: string;             // CSS 颜色
  renderMode: 'additive' | 'normal';  // 混合模式

  // 发射器列表
  emitters: EmitterConfig[];
}

// 纹理区域映射
export interface TextureRegion {
  textureId: string;                  // 纹理 ID
  u: number;                          // 标准化坐标 0-1
  v: number;
  width: number;                      // 标准化宽度 0-1
  height: number;
}

