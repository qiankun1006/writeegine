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

