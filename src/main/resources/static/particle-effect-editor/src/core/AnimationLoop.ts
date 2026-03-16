export class AnimationLoop {
  private callback: (deltaTime: number) => void;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private fps: number = 0;
  private fpsUpdateTime: number = 0;
  private frameCount: number = 0;

  constructor(callback: (deltaTime: number) => void) {
    this.callback = callback;
  }

  /**
   * 启动动画循环
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * 暂停动画
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * 继续动画
   */
  resume(): void {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  /**
   * 停止动画循环
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 主循环
   */
  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      // 计算帧时间（毫秒）
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      // 更新 FPS 统计
      this.updateFPS(currentTime);

      // 调用回调函数
      this.callback(deltaTime);
    }

    // 请求下一帧
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * 更新 FPS 统计
   */
  private updateFPS(currentTime: number): void {
    this.frameCount++;

    // 每秒更新一次 FPS
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * 获取当前 FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * 检查是否正在运行
   */
  isAnimating(): boolean {
    return this.isRunning && !this.isPaused;
  }

  /**
   * 检查是否暂停
   */
  isAnimationPaused(): boolean {
    return this.isPaused;
  }
}

