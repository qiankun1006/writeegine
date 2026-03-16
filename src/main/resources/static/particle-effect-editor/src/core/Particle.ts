import type {ParticleConfig, TextureRegion} from '../types/particle';

export class Particle {
  // 生命周期
  private lifespan: number;            // 毫秒
  private age: number = 0;

  // 位置和运动
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };

  // 外观
  color: { r: number; g: number; b: number };
  alpha: number;
  scale: number;
  rotation: number;                    // 弧度

  // 纹理
  textureRegion?: TextureRegion;

  // 配置
  private config: ParticleConfig;

  constructor(config: ParticleConfig, x: number, y: number) {
    this.config = config;
    this.position = { x, y };
    this.lifespan = config.lifespan;

    // 初始化速度
    this.velocity = { ...config.initialVelocity };
    this.acceleration = { ...config.acceleration };

    // 初始化外观
    this.color = {
      r: config.color.startR,
      g: config.color.startG,
      b: config.color.startB,
    };
    this.alpha = config.alphaStart;
    this.scale = config.scale.start;
    this.rotation = (config.rotation.start * Math.PI) / 180;

    this.textureRegion = config.textureRegion;
  }

  /**
   * 更新粒子状态（每帧调用）
   * @param deltaTime 帧时间（毫秒）
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000; // 转换为秒
    this.age += deltaTime;

    // 检查是否死亡
    if (this.age > this.lifespan) {
      return; // 由系统判断 isAlive()
    }

    const progress = this.age / this.lifespan; // 0-1

    // 更新速度 v = v0 + a*t
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;

    // 更新位置 p = p0 + v*t
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // 线性插值外观参数
    this.color.r = this.lerp(
      this.config.color.startR,
      this.config.color.endR,
      progress
    );
    this.color.g = this.lerp(
      this.config.color.startG,
      this.config.color.endG,
      progress
    );
    this.color.b = this.lerp(
      this.config.color.startB,
      this.config.color.endB,
      progress
    );
    this.alpha = this.lerp(
      this.config.alphaStart,
      this.config.alphaEnd,
      progress
    );
    this.scale = this.lerp(
      this.config.scale.start,
      this.config.scale.end,
      progress
    );

    // 更新旋转
    this.rotation +=
      (this.config.rotation.speed * Math.PI) / 180 * dt;
  }

  /**
   * 判断粒子是否活着
   */
  isAlive(): boolean {
    return this.age <= this.lifespan;
  }

  /**
   * 重置粒子（对象池用）
   */
  reset(config: ParticleConfig, x: number, y: number): void {
    this.config = config;
    this.position = { x, y };
    this.lifespan = config.lifespan;
    this.age = 0;
    this.velocity = { ...config.initialVelocity };
    this.acceleration = { ...config.acceleration };
    this.color = {
      r: config.color.startR,
      g: config.color.startG,
      b: config.color.startB,
    };
    this.alpha = config.alphaStart;
    this.scale = config.scale.start;
    this.rotation = (config.rotation.start * Math.PI) / 180;
    this.textureRegion = config.textureRegion;
  }

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * Math.min(Math.max(t, 0), 1);
  }
}

