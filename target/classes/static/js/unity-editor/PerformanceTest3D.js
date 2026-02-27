/**
 * 3D 编辑器性能测试工具
 * 用于测试 3D 射击编辑器的性能表现
 */

class PerformanceTest3D {
  constructor(options = {}) {
    this.renderer = options.renderer;
    this.scene = options.scene;
    this.camera = options.camera;
    this.performanceMonitor = options.performanceMonitor;

    this.testResults = {};
    this.benchmarks = {
      targetLoadTime: 1500, // 目标加载时间（ms）
      targetFPS: 60, // 目标帧率
      targetMemory: 200, // 目标内存（MB）
      acceptableMemoryIncrease: 60 // 可接受的内存增长（%）
    };
  }

  /**
   * 运行所有性能测试
   */
  async runAllTests() {
    console.group('%c🎯 3D 编辑器性能测试', 'color: #ff9800; font-weight: bold; font-size: 14px');
    console.log(`测试时间: ${new Date().toLocaleString()}`);

    await this.testInitialLoadTime();
    await this.testFPSStability();
    await this.testMemoryUsage();
    await this.testRenderingPerformance();
    await this.testLightingPerformance();
    await this.testParticlePerformance();
    await this.testRaycastingPerformance();

    this.printSummary();
    console.groupEnd();

    return this.testResults;
  }

  /**
   * 测试首屏加载时间
   */
  async testInitialLoadTime() {
    console.group('⏱️  首屏加载时间测试');

    const testName = '首屏加载时间';
    const result = {
      testName,
      status: 'PASS',
      actualValue: 0,
      targetValue: this.benchmarks.targetLoadTime,
      details: {}
    };

    try {
      // 获取性能监控器的总加载时间
      const loadTime = this.performanceMonitor ?
        parseFloat(this.performanceMonitor.getTotalLoadTime()) :
        performance.timing.loadEventEnd - performance.timing.navigationStart;

      result.actualValue = loadTime;
      result.details = {
        '页面加载': performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        'DOM解析': performance.timing.domComplete - performance.timing.domContentLoadedEventEnd,
        '资源加载': performance.timing.loadEventEnd - performance.timing.domComplete
      };

      result.status = loadTime <= this.benchmarks.targetLoadTime ? 'PASS' : 'WARN';
      result.diff = loadTime - this.benchmarks.targetLoadTime;

      const icon = result.status === 'PASS' ? '✅' : '⚠️';
      console.log(`${icon} ${testName}: ${loadTime.toFixed(2)}ms (目标: ${this.benchmarks.targetLoadTime}ms)`);

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      console.error(`❌ ${testName} 失败:`, error);
    }

    console.groupEnd();
    this.testResults.initialLoad = result;
    return result;
  }

  /**
   * 测试 FPS 稳定性
   */
  async testFPSStability() {
    console.group('📊 FPS 稳定性测试');

    const testName = 'FPS 稳定性';
    const result = {
      testName,
      status: 'PASS',
      avgFPS: 0,
      minFPS: 0,
      maxFPS: 0,
      fpsSamples: [],
      targetValue: this.benchmarks.targetFPS
    };

    try {
      // 收集 5 秒的 FPS 数据
      const sampleDuration = 5000; // 5秒
      const sampleInterval = 100; // 每100ms采样一次
      const samples = [];

      for (let i = 0; i < sampleDuration / sampleInterval; i++) {
        const fps = this.performanceMonitor ?
          parseFloat(this.performanceMonitor.getAverageFPS()) :
          this.measureCurrentFPS();

        samples.push(fps);
        await this.sleep(sampleInterval);
      }

      result.fpsSamples = samples;
      result.avgFPS = samples.reduce((a, b) => a + b, 0) / samples.length;
      result.minFPS = Math.min(...samples);
      result.maxFPS = Math.max(...samples);

      // 计算 FPS 标准差（稳定性指标）
      const variance = samples.reduce((sum, val) => sum + Math.pow(val - result.avgFPS, 2), 0) / samples.length;
      result.stdDev = Math.sqrt(variance);

      // 如果平均 FPS 低于目标或标准差过大，则警告
      result.status = result.avgFPS >= this.benchmarks.targetFPS * 0.9 ? 'PASS' : 'WARN';
      if (result.stdDev > 10) {
        result.status = 'WARN';
      }

      const icon = result.status === 'PASS' ? '✅' : '⚠️';
      console.log(`${icon} 平均 FPS: ${result.avgFPS.toFixed(1)} (最小: ${result.minFPS.toFixed(1)}, 最大: ${result.maxFPS.toFixed(1)})`);
      console.log(`标准差: ${result.stdDev.toFixed(2)} (值越小越稳定)`);

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      console.error(`❌ ${testName} 失败:`, error);
    }

    console.groupEnd();
    this.testResults.fpsStability = result;
    return result;
  }

  /**
   * 测试内存使用
   */
  async testMemoryUsage() {
    console.group('💾 内存使用测试');

    const testName = '内存使用';
    const result = {
      testName,
      status: 'PASS',
      initialMemory: 0,
      peakMemory: 0,
      finalMemory: 0,
      targetValue: this.benchmarks.targetMemory
    };

    try {
      if (performance.memory) {
        // 记录初始内存
        result.initialMemory = performance.memory.usedJSHeapSize / 1048576;

        // 模拟编辑器操作，收集内存峰值
        const samples = [];
        for (let i = 0; i < 50; i++) {
          const memory = performance.memory.usedJSHeapSize / 1048576;
          samples.push(memory);
          if (memory > result.peakMemory) {
            result.peakMemory = memory;
          }

          // 模拟一些操作
          if (this.scene) {
            this.scene.traverse(obj => {
              if (obj.isMesh) {
                obj.rotation.x += 0.01;
              }
            });
          }
          this.renderer.render(this.scene, this.camera);
          await this.sleep(100);
        }

        result.finalMemory = performance.memory.usedJSHeapSize / 1048576;

        // 计算内存增长
        result.memoryIncrease = ((result.finalMemory - result.initialMemory) / result.initialMemory * 100);

        result.status = result.finalMemory <= this.benchmarks.targetMemory ? 'PASS' : 'WARN';

        const icon = result.status === 'PASS' ? '✅' : '⚠️';
        console.log(`${icon} 初始内存: ${result.initialMemory.toFixed(2)}MB`);
        console.log(`   峰值内存: ${result.peakMemory.toFixed(2)}MB`);
        console.log(`   最终内存: ${result.finalMemory.toFixed(2)}MB`);
        console.log(`   内存增长: ${result.memoryIncrease.toFixed(2)}%`);

      } else {
        console.warn('⚠️ 浏览器不支持内存 API');
        result.status = 'SKIP';
      }

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      console.error(`❌ ${testName} 失败:`, error);
    }

    console.groupEnd();
    this.testResults.memoryUsage = result;
    return result;
  }

  /**
   * 测试渲染性能
   */
  async testRenderingPerformance() {
    console.group('🖼️  渲染性能测试');

    const testName = '渲染性能';
    const result = {
      testName,
      status: 'PASS',
      avgRenderTime: 0,
      frameCount: 0,
      objectCount: 0
    };

    try {
      // 统计场景中的对象数量
      if (this.scene) {
        this.scene.traverse(obj => {
          if (obj.isMesh) result.objectCount++;
        });
      }

      // 测量 100 帧的渲染时间
      const frameCount = 100;
      const renderTimes = [];

      for (let i = 0; i < frameCount; i++) {
        const startTime = performance.now();
        this.renderer.render(this.scene, this.camera);
        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
      }

      result.frameCount = frameCount;
      result.avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / frameCount;
      result.minRenderTime = Math.min(...renderTimes);
      result.maxRenderTime = Math.max(...renderTimes);

      // 目标：平均渲染时间应小于 16.6ms（60fps）
      const targetRenderTime = 1000 / 60;
      result.status = result.avgRenderTime <= targetRenderTime * 1.5 ? 'PASS' : 'WARN';

      const icon = result.status === 'PASS' ? '✅' : '⚠️';
      console.log(`${icon} 对象数量: ${result.objectCount}`);
      console.log(`   平均渲染时间: ${result.avgRenderTime.toFixed(2)}ms`);
      console.log(`   最小渲染时间: ${result.minRenderTime.toFixed(2)}ms`);
      console.log(`   最大渲染时间: ${result.maxRenderTime.toFixed(2)}ms`);

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      console.error(`❌ ${testName} 失败:`, error);
    }

    console.groupEnd();
    this.testResults.rendering = result;
    return result;
  }

  /**
   * 测试光照系统性能
   */
  async testLightingPerformance() {
    console.group('💡 光照系统性能测试');

    const testName = '光照系统性能';
    const result = {
      testName,
      status: 'PASS',
      lightCount: 0,
      avgRenderTime: 0,
      details: {}
    };

    try {
      // 查找场景中的光源
      const lights = [];
      if (this.scene) {
        this.scene.traverse(obj => {
          if (obj.isLight) lights.push(obj);
        });
      }

      result.lightCount = lights.length;
      result.details.byType = {
        ambient: lights.filter(l => l.isAmbientLight).length,
        directional: lights.filter(l => l.isDirectionalLight).length,
        point: lights.filter(l => l.isPointLight).length,
        spot: lights.filter(l => l.isSpotLight).length,
        hemisphere: lights.filter(l => l.isHemisphereLight).length
      };

      // 测量不同光源数量下的渲染时间
      const testCases = [
        { name: '当前配置', count: result.lightCount }
      ];

      for (const testCase of testCases) {
        const renderTimes = [];
        for (let i = 0; i < 50; i++) {
          const startTime = performance.now();
          this.renderer.render(this.scene, this.camera);
          const endTime = performance.now();
          renderTimes.push(endTime - startTime);
        }
        testCase.avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
        result.details[testCase.name] = testCase.avgRenderTime.toFixed(2);
      }

      result.avgRenderTime = testCases[0].avgRenderTime;

      // 如果光源数量过多且渲染时间过长，则警告
      result.status = result.avgRenderTime < 30 ? 'PASS' : 'WARN';

      const icon = result.status === 'PASS' ? '✅' : '⚠️';
      console.log(`${icon} 光源总数: ${result.lightCount}`);
      console.log(`   环境光: ${result.details.byType.ambient}`);
      console.log(`   方向光: ${result.details.byType.directional}`);
      console.log(`   点光源: ${result.details.byType.point}`);
      console.log(`   聚光灯: ${result.details.byType.spot}`);
      console.log(`   半球光: ${result.details.byType.hemisphere}`);
      console.log(`   平均渲染时间: ${result.avgRenderTime.toFixed(2)}ms`);

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      console.error(`❌ ${testName} 失败:`, error);
    }

    console.groupEnd();
    this.testResults.lighting = result;
    return result;
  }

  /**
   * 测试粒子系统性能
   */
  async testParticlePerformance() {
    console.group('✨ 粒子系统性能测试');

    const testName = '粒子系统性能';
    const result = {
      testName,
      status: 'PASS',
      systemCount: 0,
      totalParticles: 0,
      avgUpdateDuration: 0
    };

    try {
      // 查找场景中的粒子系统
      const particleSystems = [];
      if (this.scene) {
        this.scene.traverse(obj => {
          if (obj.isPoints && obj.userData.type) {
            particleSystems.push(obj);
          }
        });
      }

      result.systemCount = particleSystems.length;

      if (particleSystems.length > 0) {
        particleSystems.forEach(system => {
          result.totalParticles += system.userData.config?.particleCount || 0;
        });

        // 测量粒子更新性能
        const updateTimes = [];
        const clock = new THREE.Clock();

        for (let i = 0; i < 50; i++) {
          const startTime = performance.now();
          const delta = clock.getDelta();

          particleSystems.forEach(system => {
            if (system.userData.active) {
              // 模拟粒子更新
              const positions = system.geometry.attributes.position.array;
              for (let j = 0; j < positions.length; j += 3) {
                positions[j + 1] -= delta * 0.1;
              }
              system.geometry.attributes.position.needsUpdate = true;
            }
          });

          const endTime = performance.now();
          updateTimes.push(endTime - startTime);
        }

        result.avgUpdateDuration = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;

        // 如果粒子更新时间过长，则警告
        result.status = result.avgUpdateDuration < 5 ? 'PASS' : 'WARN';

        const icon = result.status === 'PASS' ? '✅' : '⚠️';
        console.log(`${icon} 粒子系统数量: ${result.systemCount}`);
        console.log(`   总粒子数量: ${result.totalParticles}`);
        console.log(`   平均更新时间: ${result.avgUpdateDuration.toFixed(3)}ms`);

      } else {
        console.log('ℹ️  当前场景没有粒子系统');
        result.status = 'SKIP';
      }

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      console.error(`❌ ${testName} 失败:`, error);
    }

    console.groupEnd();
    this.testResults.particles = result;
    return result;
  }

  /**
   * 测试射线检测性能
   */
  async testRaycastingPerformance() {
    console.group('🎯 射线检测性能测试');

    const testName = '射线检测性能';
    const result = {
      testName,
      status: 'PASS',
      intersectableObjects: 0,
      avgRaycastTime: 0,
      raycastsPerSecond: 0
    };

    try {
      // 创建射线检测器
      const raycaster = new THREE.Raycaster();
      raycaster.far = 1000;
      raycaster.near = 0.1;

      // 收集可交互对象
      const objects = [];
      if (this.scene) {
        this.scene.traverse(obj => {
          if (obj.isMesh) {
            objects.push(obj);
          }
        });
      }

      result.intersectableObjects = objects.length;

      if (objects.length > 0) {
        // 测量射线检测性能
        const raycastTimes = [];
        const testCount = 1000;

        for (let i = 0; i < testCount; i++) {
          // 随机射线方向
          const direction = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize();

          const origin = new THREE.Vector3(0, 5, 0);

          const startTime = performance.now();
          raycaster.set(origin, direction);
          raycaster.intersectObjects(objects, true);
          const endTime = performance.now();

          raycastTimes.push(endTime - startTime);
        }

        result.avgRaycastTime = raycastTimes.reduce((a, b) => a + b, 0) / raycastTimes.length;
        result.raycastsPerSecond = 1000 / result.avgRaycastTime;

        // 如果射线检测时间过长，则警告
        result.status = result.avgRaycastTime < 1 ? 'PASS' : 'WARN';

        const icon = result.status === 'PASS' ? '✅' : '⚠️';
        console.log(`${icon} 可交互对象数量: ${result.intersectableObjects}`);
        console.log(`   平均射线检测时间: ${result.avgRaycastTime.toFixed(4)}ms`);
        console.log(`   每秒射线检测数: ${result.raycastsPerSecond.toFixed(0)}`);

      } else {
        console.log('ℹ️  当前场景没有可检测对象');
        result.status = 'SKIP';
      }

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      console.error(`❌ ${testName} 失败:`, error);
    }

    console.groupEnd();
    this.testResults.raycasting = result;
    return result;
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    console.group('%c📊 性能测试摘要', 'color: #2196F3; font-weight: bold; font-size: 14px');

    const summary = {
      total: 0,
      passed: 0,
      warned: 0,
      failed: 0,
      skipped: 0
    };

    Object.entries(this.testResults).forEach(([key, result]) => {
      summary.total++;
      if (result.status === 'PASS') summary.passed++;
      else if (result.status === 'WARN') summary.warned++;
      else if (result.status === 'ERROR') summary.failed++;
      else if (result.status === 'SKIP') summary.skipped++;
    });

    console.log(`总测试数: ${summary.total}`);
    console.log(`✅ 通过: ${summary.passed}`);
    console.log(`⚠️  警告: ${summary.warned}`);
    console.log(`❌ 失败: ${summary.failed}`);
    console.log(`ℹ️  跳过: ${summary.skipped}`);

    // 关键性能指标
    console.group('关键性能指标');

    if (this.testResults.initialLoad) {
      const { actualValue, targetValue, status } = this.testResults.initialLoad;
      const icon = status === 'PASS' ? '✅' : '⚠️';
      console.log(`${icon} 首屏加载: ${actualValue.toFixed(2)}ms / ${targetValue}ms`);
    }

    if (this.testResults.fpsStability) {
      const { avgFPS, status } = this.testResults.fpsStability;
      const icon = status === 'PASS' ? '✅' : '⚠️';
      console.log(`${icon} 平均 FPS: ${avgFPS.toFixed(1)}`);
    }

    if (this.testResults.memoryUsage) {
      const { finalMemory, targetValue, status } = this.testResults.memoryUsage;
      const icon = status === 'PASS' ? '✅' : '⚠️';
      console.log(`${icon} 内存使用: ${finalMemory.toFixed(2)}MB / ${targetValue}MB`);
    }

    console.groupEnd();
    console.groupEnd();
  }

  /**
   * 导出测试报告
   */
  exportReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      benchmarks: this.benchmarks,
      results: this.testResults
    };

    return JSON.stringify(summary, null, 2);
  }

  /**
   * 辅助方法：测量当前 FPS
   */
  measureCurrentFPS() {
    // 简化的 FPS 测量
    let lastTime = performance.now();
    let frames = 0;

    return new Promise((resolve) => {
      const measure = () => {
        frames++;
        const now = performance.now();
        if (now >= lastTime + 1000) {
          resolve(frames);
        } else {
          requestAnimationFrame(measure);
        }
      };
      measure();
    });
  }

  /**
   * 辅助方法：延迟
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.PerformanceTest3D = PerformanceTest3D;

  // 提供全局测试函数
  window.run3DPerformanceTests = async (options) => {
    const test = new PerformanceTest3D(options);
    await test.runAllTests();
    return test.exportReport();
  };
}

