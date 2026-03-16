import {Particle} from './Particle';
import {ObjectPool} from './ObjectPool';
import type {EmitterConfig} from '../types/particle';

export class ParticleEmitter {
  private config: EmitterConfig;
  private particlePool: ObjectPool<Particle>;
  private activeParticles: Particle[] = [];
  private emissionAccumulator: number = 0;

  constructor(
    config: EmitterConfig,
    poolSize: number = 1000
  ) {
    this.config = config;

    // 创建对象池
    this.particlePool = new ObjectPool(
      poolSize,
      () => new Particle(config.particleConfig, 0, 0)
    );
  }

  /**
   * 更新发射器和粒子
   */
  update(deltaTime: number, globalGravity: { x: number; y: number }): void {
    if (!this.config.enabled) return;

    // 发射新粒子
    this.emitParticles(deltaTime);

    // 更新所有活跃粒子
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];

      // 应用全局重力
      particle.acceleration.y += globalGravity.y;
      particle.acceleration.x += globalGravity.x;

      // 更新粒子
      particle.update(deltaTime);

      // 移除死亡粒子
      if (!particle.isAlive()) {
        this.particlePool.return(particle);
        this.activeParticles.splice(i, 1);
      }
    }
  }

  /**
   * 发射新粒子
   */
  private emitParticles(deltaTime: number): void {
    const dt = deltaTime / 1000; // 转换为秒

    // 累加发射量
    this.emissionAccumulator +=
      this.config.emissionRate * dt +
      this.config.emissionBurst;

    // 发射粒子
    const particleCount = Math.floor(this.emissionAccumulator);
    this.emissionAccumulator -= particleCount;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.particlePool.get();
      if (!particle) break; // 对象池空

      // 随机角度
      const angle =
        (this.config.angle +
          (Math.random() - 0.5) * this.config.angleVariance) *
        (Math.PI / 180);

      // 随机速度
      const speed =
        this.config.speed +
        (Math.random() - 0.5) * this.config.speedVariance;

      // 设置初速度
      particle.velocity.x = Math.cos(angle) * speed;
      particle.velocity.y = Math.sin(angle) * speed;

      // 设置位置
      particle.position.x = this.config.position.x;
      particle.position.y = this.config.position.y;

      this.activeParticles.push(particle);
    }
  }

  /**
   * 绘制所有粒子
   */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.activeParticles) {
      ctx.save();

      // 设置透明度
      ctx.globalAlpha = particle.alpha;

      // 设置混合模式（可选）
      ctx.globalCompositeOperation = 'lighter'; // 加法混合

      // 绘制粒子（简单圆形或纹理）
      if (particle.textureRegion) {
        // 绘制纹理（暂时简化，实现时需要从纹理图集绘制）
        this.drawTextureParticle(ctx, particle);
      } else {
        // 绘制简单圆形
        ctx.beginPath();
        ctx.fillStyle = `rgb(${Math.round(particle.color.r)}, ${Math.round(
          particle.color.g
        )}, ${Math.round(particle.color.b)})`;
        ctx.arc(
          particle.position.x,
          particle.position.y,
          particle.scale * 5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawTextureParticle(
    ctx: CanvasRenderingContext2D,
    particle: Particle
  ): void {
    // TODO: 实现纹理绘制逻辑
    // 需要获取纹理图集，从中提取 TextureRegion 对应的区域，然后绘制
  }

  /**
   * 获取活跃粒子数
   */
  getActiveParticleCount(): number {
    return this.activeParticles.length;
  }

  /**
   * 重置发射器
   */
  reset(): void {
    for (const particle of this.activeParticles) {
      this.particlePool.return(particle);
    }
    this.activeParticles = [];
    this.emissionAccumulator = 0;
  }

  /**
   * 设置配置
   */
  setConfig(config: EmitterConfig): void {
    this.config = config;
  }
}

