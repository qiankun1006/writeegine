import {ParticleEmitter} from './ParticleEmitter';
import {CanvasRenderer} from './CanvasRenderer';
import {AnimationLoop} from './AnimationLoop';
import type {EmitterConfig, SystemConfig} from '../types/particle';

export class ParticleSystem {
  private emitters: ParticleEmitter[] = [];
  private renderer: CanvasRenderer;
  private animationLoop: AnimationLoop;
  private config: SystemConfig;
  private totalParticles: number = 0;

  constructor(canvas: HTMLCanvasElement, config: SystemConfig) {
    this.config = config;
    this.renderer = new CanvasRenderer(canvas);
    this.animationLoop = new AnimationLoop((deltaTime) =>
      this.update(deltaTime)
    );

    // 创建发射器
    this.createEmitters();
  }

  /**
   * 创建发射器
   */
  private createEmitters(): void {
    this.emitters = this.config.emitters.map(
      (emitterConfig) =>
        new ParticleEmitter(
          emitterConfig,
          Math.ceil(this.config.maxParticles / this.config.emitters.length)
        )
    );
  }

  /**
   * 每帧更新
   */
  private update(deltaTime: number): void {
    // 更新所有发射器
    this.totalParticles = 0;
    for (const emitter of this.emitters) {
      emitter.update(deltaTime, this.config.gravity);
      this.totalParticles += emitter.getActiveParticleCount();
    }

    // 渲染
    this.render();
  }

  /**
   * 渲染
   */
  private render(): void {
    // 清空 Canvas
    this.renderer.clear(this.config.backgroundColor);

    // 绘制所有粒子
    for (const emitter of this.emitters) {
      emitter.draw(this.renderer.getContext());
    }

    // 提交
    this.renderer.present();
  }

  /**
   * 启动动画
   */
  start(): void {
    this.animationLoop.start();
  }

  /**
   * 暂停动画
   */
  pause(): void {
    this.animationLoop.pause();
  }

  /**
   * 继续动画
   */
  resume(): void {
    this.animationLoop.resume();
  }

  /**
   * 重置系统
   */
  reset(): void {
    for (const emitter of this.emitters) {
      emitter.reset();
    }
    this.totalParticles = 0;
  }

  /**
   * 更新系统配置
   */
  setConfig(config: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.emitters) {
      this.createEmitters();
    }
  }

  /**
   * 更新单个发射器配置
   */
  setEmitterConfig(index: number, config: EmitterConfig): void {
    if (this.emitters[index]) {
      this.emitters[index].setConfig(config);
    }
  }

  /**
   * 获取总粒子数
   */
  getTotalParticles(): number {
    return this.totalParticles;
  }

  /**
   * 获取 FPS
   */
  getFPS(): number {
    return this.animationLoop.getFPS();
  }

  /**
   * 获取当前配置
   */
  getConfig(): SystemConfig {
    return { ...this.config };
  }

  /**
   * 获取 Canvas 渲染器
   */
  getRenderer(): CanvasRenderer {
    return this.renderer;
  }
}

