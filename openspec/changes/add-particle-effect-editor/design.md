# Design: 在线粒子效果编辑器 - 深度技术设计

**Version**: 1.0
**Last Updated**: 2026-03-16
**Status**: Ready for Review

---

## 目录
1. [架构概览](#架构概览)
2. [核心数据结构](#核心数据结构)
3. [粒子系统实现](#粒子系统实现)
4. [导出系统设计](#导出系统设计)
5. [性能优化策略](#性能优化策略)
6. [UI 组件架构](#ui-组件架构)
7. [代码示例](#代码示例)

---

## 架构概览

### 整体架构图

```
┌──────────────────────────────────────────────────────────┐
│  App.vue (主容器)                                         │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────┬─────────────────────────────┐│
│  │ Canvas Viewport        │ Control Panel               ││
│  │ (ParticleCanvas.vue)   │ (RightPanel.vue)           ││
│  │                        │                             ││
│  │ ┌──────────────────┐  │ ┌───────────────────────┐   ││
│  │ │ ParticleSystem   │  │ │ ParamPanel.vue       │   ││
│  │ │ (核心渲染)       │  │ │ (参数编辑)           │   ││
│  │ │                  │  │ │                       │   ││
│  │ │ - Emitter[] []  │  │ │ - 基础参数           │   ││
│  │ │ - Particle[]     │  │ │ - 物理参数           │   ││
│  │ │ - Renderer       │  │ │ - 外观参数           │   ││
│  │ │ - AnimLoop       │  │ │ - 纹理参数           │   ││
│  │ └──────────────────┘  │ │                       │   ││
│  │                        │ └───────────────────────┘   ││
│  │                        │                             ││
│  │                        │ ┌───────────────────────┐   ││
│  │                        │ │ PresetPanel.vue       │   ││
│  │                        │ │ (预设加载)           │   ││
│  │                        │ └───────────────────────┘   ││
│  │                        │                             ││
│  │                        │ ┌───────────────────────┐   ││
│  │                        │ │ ExportPanel.vue       │   ││
│  │                        │ │ (导出)               │   ││
│  │                        │ └───────────────────────┘   ││
│  └────────────────────────┴─────────────────────────────┘│
│                                                            │
│  Divider (可拖拽分割线)                                   │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### 目录结构

```
particle-effect-editor/
├── src/
│   ├── App.vue                          # 主应用
│   ├── main.ts                          # 入口
│   ├── vite-env.d.ts                    # Vite 类型声明
│   │
│   ├── core/                            # 核心引擎
│   │   ├── Particle.ts                  # 单个粒子类
│   │   ├── ParticleEmitter.ts           # 发射器类
│   │   ├── ParticleSystem.ts            # 粒子系统类
│   │   ├── CanvasRenderer.ts            # Canvas 渲染器
│   │   ├── AnimationLoop.ts             # 动画循环
│   │   ├── ObjectPool.ts                # 对象池（性能优化）
│   │   └── TextureRegion.ts             # 纹理区域映射
│   │
│   ├── components/
│   │   ├── ParticleCanvas.vue           # Canvas 显示组件
│   │   ├── ParamPanel.vue               # 参数编辑面板
│   │   ├── PresetPanel.vue              # 预设面板
│   │   ├── ExportPanel.vue              # 导出面板
│   │   ├── TextureUploader.vue          # 纹理上传
│   │   ├── TextureEditor.vue            # 纹理编辑
│   │   └── RightPanel.vue               # 右侧总面板
│   │
│   ├── exporters/                       # 导出器
│   │   ├── LibGDXExporter.ts            # .p 文件导出
│   │   ├── TextureAtlasExporter.ts      # .atlas 文件导出
│   │   ├── PNGExporter.ts               # PNG 导出
│   │   ├── JSONExporter.ts              # JSON 导出
│   │   └── ZIPExporter.ts               # ZIP 打包导出
│   │
│   ├── utils/
│   │   ├── PresetManager.ts             # 预设管理
│   │   ├── TextureAtlasGenerator.ts     # 纹理图集生成
│   │   ├── paramHints.ts                # 参数提示信息
│   │   └── helpers.ts                   # 通用工具函数
│   │
│   ├── types/
│   │   ├── particle.ts                  # 粒子相关类型
│   │   ├── export.ts                    # 导出相关类型
│   │   └── texture.ts                   # 纹理相关类型
│   │
│   ├── stores/
│   │   └── particleStore.ts             # Pinia 状态管理
│   │
│   ├── assets/
│   │   ├── presets/                     # 预设配置
│   │   │   ├── Flame.json
│   │   │   ├── Snow.json
│   │   │   ├── Rain.json
│   │   │   └── Explosion.json
│   │   └── textures/                    # 默认纹理
│   │
│   ├── styles/
│   │   ├── main.scss                    # 全局样式
│   │   ├── dark-theme.scss              # 深色主题
│   │   └── variables.scss               # 主题变量
│   │
│   └── workers/
│       └── pngExporter.worker.ts        # Web Worker（高分辨率导出）
│
├── vite.config.ts                       # Vite 配置
├── tsconfig.json                        # TypeScript 配置
├── package.json                         # 依赖配置
├── index.html                           # HTML 入口
└── README.md                            # 文档

```

---

## 核心数据结构

### 粒子参数类型定义 (types/particle.ts)

```typescript
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
```

---

## 粒子系统实现

### 1. Particle 类 (core/Particle.ts)

```typescript
import type { ParticleConfig, TextureRegion } from '../types/particle';

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
```

### 2. ParticleEmitter 类 (core/ParticleEmitter.ts)

```typescript
import { Particle } from './Particle';
import { ObjectPool } from './ObjectPool';
import type { EmitterConfig } from '../types/particle';

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
```

### 3. ParticleSystem 类 (core/ParticleSystem.ts)

```typescript
import { ParticleEmitter } from './ParticleEmitter';
import { CanvasRenderer } from './CanvasRenderer';
import { AnimationLoop } from './AnimationLoop';
import type { SystemConfig, EmitterConfig } from '../types/particle';

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
}
```

### 4. 对象池实现 (core/ObjectPool.ts)

```typescript
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private maxSize: number;

  constructor(maxSize: number, factory: () => T) {
    this.maxSize = maxSize;
    this.factory = factory;

    // 预填充对象
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * 获取对象
   */
  get(): T | null {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    // 对象池空，创建新对象（超出 maxSize）
    console.warn('ObjectPool exhausted, creating new object');
    return this.factory();
  }

  /**
   * 归还对象
   */
  return(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }

  /**
   * 调整池大小
   */
  resize(newSize: number): void {
    if (newSize > this.maxSize) {
      for (let i = this.pool.length; i < newSize; i++) {
        this.pool.push(this.factory());
      }
    }
    this.maxSize = newSize;
  }

  /**
   * 获取池中对象数量
   */
  size(): number {
    return this.pool.length;
  }
}
```

---

## 导出系统设计

### LibGDX .p 文件格式

```typescript
// 格式参考：LibGDX 官方 ParticleEffect.java
// 完整示例:
//
// name: my_effect
// - Delay
//   active: false
//   - Life
//     lowMin: 1000.0
//     lowMax: 1000.0
// ...

export class LibGDXExporter {
  static export(config: SystemConfig): string {
    let content = '';

    for (let i = 0; i < config.emitters.length; i++) {
      const emitter = config.emitters[i];
      content += this.exportEmitter(emitter, i);
    }

    return content;
  }

  private static exportEmitter(
    config: EmitterConfig,
    index: number
  ): string {
    let emitterContent = `name: emitter_${index}\n`;

    // Delay（延迟）
    emitterContent += `- Delay\n`;
    emitterContent += `  active: false\n`;
    emitterContent += `  - Life\n`;
    emitterContent += `    lowMin: 0.0\n`;
    emitterContent += `    lowMax: 0.0\n\n`;

    // Life（寿命）
    emitterContent += `- Life\n`;
    emitterContent += `  - Life\n`;
    emitterContent += `    lowMin: ${config.particleConfig.lifespan}\n`;
    emitterContent += `    lowMax: ${config.particleConfig.lifespan}\n\n`;

    // Emission（发射率）
    emitterContent += `- Emission\n`;
    emitterContent += `  - Count\n`;
    emitterContent += `    lowMin: ${config.emissionRate}\n`;
    emitterContent += `    lowMax: ${config.emissionRate}\n\n`;

    // ... 其他参数

    return emitterContent;
  }
}
```

### PNG 高清导出

```typescript
export class PNGExporter {
  /**
   * 导出粒子效果截图
   */
  static async exportEffectScreenshot(
    particleSystem: ParticleSystem,
    scale: number = 2 // 2x 分辨率
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // 获取原始 Canvas 尺寸
      const originalCanvas = document.querySelector(
        'canvas'
      ) as HTMLCanvasElement;
      if (!originalCanvas) {
        reject(new Error('Canvas not found'));
        return;
      }

      const width = originalCanvas.width * scale;
      const height = originalCanvas.height * scale;

      // 创建高分辨率 Canvas
      const offscreenCanvas = new OffscreenCanvas(width, height);
      const ctx = offscreenCanvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // 缩放绘制
      ctx.scale(scale, scale);

      // 绘制粒子系统（需要公开绘制方法）
      // particleSystem.render(ctx);

      // 转换为 PNG
      offscreenCanvas.convertToBlob({ type: 'image/png' }).then(resolve);
    });
  }

  /**
   * 导出纹理图片
   */
  static async exportTextureImage(
    image: HTMLImageElement,
    filename: string
  ): Promise<void> {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        this.downloadBlob(blob, filename);
      }
    }, 'image/png');
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

---

## 性能优化策略

### 1. 对象池

```
优势：
- 避免频繁创建/销毁 Particle 对象
- 减少 GC 暂停时间
- 降低内存碎片

配置：
- 初始池大小：max(总粒子数 / 发射器数, 1000)
- 单个粒子大小：~100 bytes
- 1000 粒子 = 100 KB（可接受）
```

### 2. Canvas 优化

```typescript
// 高 DPI 屏幕处理
class CanvasRenderer {
  initialize(canvas: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio || 1;

    // 物理尺寸 = 逻辑尺寸 * DPI
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
  }
}

// 批量绘制（同一纹理）
```

### 3. 纹理缓存

```typescript
class TextureCache {
  private cache: Map<string, ImageData> = new Map();

  get(textureId: string): ImageData | undefined {
    return this.cache.get(textureId);
  }

  set(textureId: string, imageData: ImageData): void {
    this.cache.set(textureId, imageData);
  }
}
```

---

## UI 组件架构

### App.vue 结构

```vue
<template>
  <div class="particle-editor">
    <!-- 左侧 Canvas -->
    <div class="canvas-container">
      <ParticleCanvas ref="canvas" />
      <div class="stats">
        粒子数: {{ totalParticles }} | FPS: {{ fps }}
      </div>
    </div>

    <!-- 分割线 -->
    <div class="divider" @mousedown="startResize" />

    <!-- 右侧控制面板 -->
    <div class="control-panel">
      <el-tabs>
        <el-tab-pane label="参数编辑">
          <ParamPanel />
        </el-tab-pane>
        <el-tab-pane label="预设">
          <PresetPanel />
        </el-tab-pane>
        <el-tab-pane label="导出">
          <ExportPanel />
        </el-tab-pane>
        <el-tab-pane label="纹理">
          <TextureUploader />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.particle-editor {
  display: flex;
  height: 100vh;
  background: #1a1a1a;
}

.canvas-container {
  flex: 1;
  position: relative;
}

.divider {
  width: 4px;
  cursor: col-resize;
  background: #333;

  &:hover {
    background: #666;
  }
}

.control-panel {
  width: 350px;
  background: #222;
  border-left: 1px solid #333;
  overflow-y: auto;
}
</style>
```

---

## 代码示例

### 核心使用流程

```typescript
// main.ts
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import App from './App.vue';
import 'element-plus/dist/index.css';
import './styles/dark-theme.scss';

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');

// App.vue script
import { ref, onMounted } from 'vue';
import { ParticleSystem } from './core/ParticleSystem';
import type { SystemConfig } from './types/particle';

const canvas = ref<HTMLCanvasElement>();
let particleSystem: ParticleSystem;

const defaultConfig: SystemConfig = {
  gravity: { x: 0, y: 100 },
  windForce: { x: 0, y: 0 },
  maxParticles: 5000,
  fps: 60,
  backgroundColor: '#000000',
  renderMode: 'normal',
  emitters: [
    // 默认一个发射器
  ],
};

onMounted(() => {
  if (canvas.value) {
    particleSystem = new ParticleSystem(canvas.value, defaultConfig);
    particleSystem.start();
  }
});
```

---

## 打包和部署

### Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    outDir: '../templates/particle-editor',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },

  server: {
    port: 5173,
    hmr: {
      protocol: 'http',
      host: 'localhost',
      port: 5173,
    },
  },
});
```

---

## 总结

这个设计文档涵盖了粒子编辑器的核心架构：

1. **清晰的模块化设计** - 各功能模块独立，便于开发和测试
2. **高性能实现** - 对象池、纹理缓存、批量绘制
3. **LibGDX 兼容** - 导出格式严格遵循规范
4. **可扩展架构** - 易于添加新预设、导出格式、UI 功能

**下一步**：进入实现阶段，按 tasks.md 的顺序完成各模块。

