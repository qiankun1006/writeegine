/**
 * FilterPipeline - 滤镜管道系统
 * 管理滤镜的应用、预览和撤销
 */
class FilterPipeline {
  constructor() {
    this.filters = new Map();
    this.history = [];
    this.currentIndex = -1;
    this.previewActive = false;
  }

  /**
   * 注册滤镜
   */
  registerFilter(id, filterClass) {
    if (typeof filterClass !== 'function') {
      console.warn(`Filter ${id} must be a class or function`);
      return;
    }
    this.filters.set(id, filterClass);
  }

  /**
   * 获取注册的滤镜
   */
  getFilter(id) {
    return this.filters.get(id);
  }

  /**
   * 获取所有滤镜
   */
  getAllFilters() {
    return Array.from(this.filters.keys());
  }

  /**
   * 应用滤镜
   */
  applyFilter(filterId, imageData, params = {}) {
    const FilterClass = this.filters.get(filterId);
    if (!FilterClass) {
      console.error(`Filter ${filterId} not found`);
      return null;
    }

    try {
      const filter = new FilterClass(params);
      return filter.apply(imageData);
    } catch (error) {
      console.error(`Error applying filter ${filterId}:`, error);
      return null;
    }
  }

  /**
   * 应用滤镜链（多个滤镜顺序应用）
   */
  applyFilterChain(filterIds, imageData, paramsList = []) {
    let result = imageData;

    for (let i = 0; i < filterIds.length; i++) {
      const filterId = filterIds[i];
      const params = paramsList[i] || {};
      result = this.applyFilter(filterId, result, params);

      if (!result) {
        console.error(`Filter chain broke at ${filterId}`);
        return null;
      }
    }

    return result;
  }

  /**
   * 添加滤镜到历史
   */
  addToHistory(filterId, params, imageData) {
    // 移除当前索引之后的所有项
    this.history = this.history.slice(0, this.currentIndex + 1);

    this.history.push({
      filterId,
      params,
      timestamp: Date.now()
    });

    this.currentIndex++;

    // 限制历史大小
    if (this.history.length > 50) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * 获取滤镜历史
   */
  getHistory() {
    return this.history.map((item, index) => ({
      ...item,
      isCurrent: index === this.currentIndex
    }));
  }

  /**
   * 撤销滤镜
   */
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * 重做滤镜
   */
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
}

// 创建全局滤镜管道
const filterPipeline = new FilterPipeline();

/**
 * Filter 基类
 */
class Filter {
  constructor(params = {}) {
    this.params = params;
  }

  /**
   * 应用滤镜（子类实现）
   */
  apply(imageData) {
    throw new Error('Subclass must implement apply method');
  }

  /**
   * 获取参数的默认值
   */
  getDefaultParams() {
    return {};
  }

  /**
   * 验证参数
   */
  validateParams() {
    // 子类可以重写此方法来验证参数
    return true;
  }

  /**
   * 复制 ImageData
   */
  copyImageData(imageData) {
    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    return newImageData;
  }

  /**
   * 获取像素索引
   */
  getPixelIndex(x, y, width) {
    return (y * width + x) * 4;
  }
}

