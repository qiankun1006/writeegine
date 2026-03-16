export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.initialize();
  }

  /**
   * 初始化 Canvas（处理高 DPI）
   */
  initialize(): void {
    // 物理尺寸 = 逻辑尺寸 * DPI
    this.canvas.width = this.canvas.clientWidth * this.dpr;
    this.canvas.height = this.canvas.clientHeight * this.dpr;

    // 缩放上下文以匹配逻辑尺寸
    this.ctx.scale(this.dpr, this.dpr);

    // 设置 Canvas 样式
    this.canvas.style.width = this.canvas.clientWidth + 'px';
    this.canvas.style.height = this.canvas.clientHeight + 'px';
  }

  /**
   * 清空 Canvas
   */
  clear(backgroundColor: string = '#000000'): void {
    // 填充背景色
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  }

  /**
   * 获取 Canvas 上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 提交渲染（目前为空，可用于 WebGL 等）
   */
  present(): void {
    // Canvas2D 不需要显式提交
  }

  /**
   * 调整 Canvas 大小
   */
  resize(): void {
    this.initialize();
  }

  /**
   * 获取设备像素比
   */
  getDevicePixelRatio(): number {
    return this.dpr;
  }
}

