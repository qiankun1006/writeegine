/**
 * 性能监控工具
 * 跟踪编辑器的加载时间、内存使用、FPS 等性能指标
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.logInterval = options.logInterval || 1000;
    this.metrics = {
      loadTimes: {},
      fps: [],
      memory: [],
      networkRequests: [],
      rendering: []
    };
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.frameCount = 0;
  }

  /**
   * 记录加载时间
   */
  recordLoadTime(label, duration) {
    this.metrics.loadTimes[label] = duration;
    console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
  }

  /**
   * 开始测量某个操作
   */
  startMeasure(label) {
    performance.mark(`${label}-start`);
  }

  /**
   * 结束测量
   */
  endMeasure(label) {
    try {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      const measure = performance.getEntriesByName(label)[0];
      this.recordLoadTime(label, measure.duration);

      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    } catch (error) {
      console.error(`测量失败 ${label}:`, error);
    }
  }

  /**
   * 记录 FPS
   */
  recordFrameTime() {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    const fps = 1000 / deltaTime;

    this.metrics.fps.push(fps);
    if (this.metrics.fps.length > 60) {
      this.metrics.fps.shift();
    }

    this.lastFrameTime = now;
    this.frameCount++;
  }

  /**
   * 获取平均 FPS
   */
  getAverageFPS() {
    if (this.metrics.fps.length === 0) return 0;
    const sum = this.metrics.fps.reduce((a, b) => a + b, 0);
    return (sum / this.metrics.fps.length).toFixed(1);
  }

  /**
   * 记录内存使用情况
   */
  recordMemory() {
    if (performance.memory) {
      const memory = {
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize / 1048576, // 转换为 MB
        totalJSHeapSize: performance.memory.totalJSHeapSize / 1048576,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / 1048576
      };
      this.metrics.memory.push(memory);

      if (this.metrics.memory.length > 60) {
        this.metrics.memory.shift();
      }

      return memory;
    }
    return null;
  }

  /**
   * 获取平均内存使用
   */
  getAverageMemory() {
    if (this.metrics.memory.length === 0) return 0;
    const sum = this.metrics.memory.reduce((a, b) => a + b.usedJSHeapSize, 0);
    return (sum / this.metrics.memory.length).toFixed(2);
  }

  /**
   * 记录网络请求
   */
  recordNetworkRequest(url, duration, size = 0) {
    this.metrics.networkRequests.push({
      timestamp: Date.now(),
      url,
      duration,
      size // 字节
    });
  }

  /**
   * 记录渲染时间
   */
  recordRenderingTime(duration) {
    this.metrics.rendering.push({
      timestamp: Date.now(),
      duration
    });

    if (this.metrics.rendering.length > 100) {
      this.metrics.rendering.shift();
    }
  }

  /**
   * 获取总加载时间（从页面开始到当前）
   */
  getTotalLoadTime() {
    return (performance.now() - this.startTime).toFixed(2);
  }

  /**
   * 输出完整性能报告
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalLoadTime: parseFloat(this.getTotalLoadTime()),
      averageFPS: parseFloat(this.getAverageFPS()),
      averageMemory: parseFloat(this.getAverageMemory()),
      loadTimes: this.metrics.loadTimes,
      networkRequests: {
        total: this.metrics.networkRequests.length,
        totalSize: this.metrics.networkRequests.reduce((a, b) => a + b.size, 0),
        totalTime: this.metrics.networkRequests.reduce((a, b) => a + b.duration, 0)
      },
      rendering: {
        frameCount: this.frameCount,
        averageRenderTime: this.getAverageRenderTime()
      }
    };

    return report;
  }

  /**
   * 获取平均渲染时间
   */
  getAverageRenderTime() {
    if (this.metrics.rendering.length === 0) return 0;
    const sum = this.metrics.rendering.reduce((a, b) => a + b.duration, 0);
    return (sum / this.metrics.rendering.length).toFixed(2);
  }

  /**
   * 输出性能报告到控制台
   */
  logReport() {
    const report = this.generateReport();

    console.group('%c📊 性能报告', 'color: #ff9800; font-weight: bold; font-size: 14px');
    console.log(`时间戳: ${report.timestamp}`);
    console.log(`总加载时间: ${report.totalLoadTime}ms`);
    console.log(`平均 FPS: ${report.averageFPS}`);
    console.log(`平均内存: ${report.averageMemory}MB`);

    console.group('加载时间');
    Object.entries(report.loadTimes).forEach(([label, time]) => {
      console.log(`${label}: ${time.toFixed(2)}ms`);
    });
    console.groupEnd();

    console.group('网络请求');
    console.log(`总请求数: ${report.networkRequests.total}`);
    console.log(`总大小: ${(report.networkRequests.totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`总时间: ${report.networkRequests.totalTime.toFixed(2)}ms`);
    console.groupEnd();

    console.group('渲染信息');
    console.log(`帧数: ${report.rendering.frameCount}`);
    console.log(`平均渲染时间: ${report.rendering.averageRenderTime}ms`);
    console.groupEnd();

    console.groupEnd();

    return report;
  }

  /**
   * 导出性能数据为 JSON
   */
  exportAsJSON() {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  /**
   * 导出性能数据为 CSV
   */
  exportAsCSV() {
    const report = this.generateReport();
    let csv = '性能指标,数值,单位\n';

    csv += `总加载时间,${report.totalLoadTime},ms\n`;
    csv += `平均FPS,${report.averageFPS},fps\n`;
    csv += `平均内存,${report.averageMemory},MB\n`;
    csv += `网络请求总数,${report.networkRequests.total},\n`;
    csv += `网络请求总大小,${(report.networkRequests.totalSize / 1024 / 1024).toFixed(2)},MB\n`;
    csv += `平均渲染时间,${report.rendering.averageRenderTime},ms\n`;

    return csv;
  }

  /**
   * 启动实时监控面板
   */
  startRealtimePanel() {
    if (!this.enabled) return;

    // 创建监控面板
    const panel = document.createElement('div');
    panel.id = 'performanceMonitorPanel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      min-width: 200px;
    `;

    // 更新监控数据
    const updatePanel = () => {
      if (navigator.deviceMemory) {
        const memory = this.recordMemory();
        const fps = this.getAverageFPS();

        panel.innerHTML = `
          <div><strong>性能监控</strong></div>
          <div>FPS: ${fps}</div>
          <div>内存: ${memory ? memory.usedJSHeapSize.toFixed(1) : 'N/A'}MB</div>
          <div>已用时间: ${this.getTotalLoadTime()}ms</div>
        `;
      }
    };

    document.body.appendChild(panel);
    setInterval(updatePanel, 1000);
    updatePanel();
  }

  /**
   * 停止实时监控
   */
  stopRealtimePanel() {
    const panel = document.getElementById('performanceMonitorPanel');
    if (panel) {
      panel.remove();
    }
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;

  // 自动创建全局实例
  if (!window.performanceMonitor) {
    window.performanceMonitor = new PerformanceMonitor();
  }
}

