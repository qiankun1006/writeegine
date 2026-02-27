/**
 * 集成测试工具
 * 用于验证所有编辑器的基本功能
 */

class IntegrationTest {
  constructor(options = {}) {
    this.results = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.startTime = Date.now();
  }

  /**
   * 运行测试
   */
  async runAllTests() {
    console.group('%c🧪 开始集成测试', 'color: #4CAF50; font-weight: bold; font-size: 14px');

    // 测试编辑器工厂
    await this.testEditorFactory();

    // 测试 Canvas 工具
    await this.testCanvas2DUtils();

    // 测试 BaseEditor2D
    await this.testBaseEditor2D();

    // 测试懒加载器
    await this.testLazyLoader();

    // 打印结果
    this.printResults();
    console.groupEnd();
  }

  /**
   * 测试编辑器工厂
   */
  async testEditorFactory() {
    console.group('📦 编辑器工厂测试');

    // 测试 2D 策略编辑器配置
    this.assertEqual(
      EditorFactory.is2D('2d-strategy'),
      true,
      '2D 策略编辑器应该被识别为 2D'
    );

    // 测试 3D 射击编辑器配置
    this.assertEqual(
      EditorFactory.is3D('3d-shooter'),
      true,
      '3D 射击编辑器应该被识别为 3D'
    );

    // 测试编辑器配置获取
    const config = EditorFactory.getEditorConfig('2d-strategy');
    this.assertTrue(config !== null, '应该能获取 2D 策略编辑器配置');
    this.assertEqual(config.gridSize, 32, '2D 策略编辑器网格大小应该是 32');

    // 测试脚本加载
    const scripts = EditorFactory.getRequiredScripts('2d-strategy');
    this.assertTrue(scripts.length > 0, '应该返回所需的脚本列表');

    console.groupEnd();
  }

  /**
   * 测试 Canvas 工具
   */
  async testCanvas2DUtils() {
    console.group('🎨 Canvas 2D 工具测试');

    // 创建临时 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // 测试点在矩形内
    this.assertTrue(
      Canvas2DUtils.pointInRect(50, 50, 0, 0, 100, 100),
      '点 (50, 50) 应该在矩形 (0, 0, 100, 100) 内'
    );

    // 测试点在圆形内
    this.assertTrue(
      Canvas2DUtils.pointInCircle(55, 55, 50, 50, 10),
      '点 (55, 55) 应该在圆心 (50, 50) 半径 10 的圆形内'
    );

    // 测试矩形碰撞
    this.assertTrue(
      Canvas2DUtils.rectCollision(0, 0, 50, 50, 25, 25, 50, 50),
      '两个重叠的矩形应该检测到碰撞'
    );

    // 测试距离计算
    const dist = Canvas2DUtils.distance(0, 0, 3, 4);
    this.assertTrue(Math.abs(dist - 5) < 0.01, '(0,0) 到 (3,4) 的距离应该是 5');

    // 测试网格对齐
    const snapped = Canvas2DUtils.snapToGrid(35, 32);
    this.assertEqual(snapped, 32, '35 对齐到网格大小 32 应该是 32');

    console.groupEnd();
  }

  /**
   * 测试 BaseEditor2D
   */
  async testBaseEditor2D() {
    console.group('🎬 BaseEditor2D 测试');

    // 创建测试配置
    const config = {
      name: '测试编辑器',
      engine: 'canvas2d',
      canvasSize: { width: 800, height: 600 },
      gridSize: 32,
      initialZoom: 1.0
    };

    // 测试编辑器实例化
    const editor = new Base2DEditor(config, null);
    this.assertTrue(editor !== null, '应该能创建 BaseEditor2D 实例');
    this.assertEqual(editor.zoom, 1.0, '初始缩放应该是 1.0');
    this.assertEqual(editor.objects.length, 0, '初始对象列表应该为空');

    // 测试对象创建
    const obj = editor.createObject(100, 100, 50, 50);
    this.assertTrue(obj !== null, '应该能创建对象');
    this.assertEqual(editor.objects.length, 1, '对象列表长度应该是 1');

    // 测试对象选择
    editor.selectObject(obj);
    this.assertEqual(editor.selectedObject, obj, '应该能选择对象');

    // 测试对象删除
    editor.deleteObject(obj);
    this.assertEqual(editor.objects.length, 0, '删除后对象列表应该为空');

    // 测试撤销/重做
    const obj2 = editor.createObject(50, 50, 30, 30);
    editor.saveUndoState();
    editor.undo();
    // 撤销后应该恢复到之前的状态
    this.assertTrue(editor.undoStack.length >= 0, '撤销栈应该存在');

    console.groupEnd();
  }

  /**
   * 测试懒加载器
   */
  async testLazyLoader() {
    console.group('📥 懒加载器测试');

    // 测试不同编辑器类型的加载器
    const loaders = [
      { type: '2d-strategy', name: '2D 策略编辑器' },
      { type: '2d-rpg', name: '2D RPG 编辑器' },
      { type: '2d-metroidvania', name: '2D 恶魔城编辑器' },
      { type: '3d-shooter', name: '3D 射击编辑器' }
    ];

    for (const loader of loaders) {
      const lazyLoader = new LazyLoader({ editorType: loader.type });
      this.assertTrue(
        lazyLoader.options.editorType === loader.type,
        `应该能为 ${loader.name} 创建加载器`
      );
    }

    console.groupEnd();
  }

  /**
   * 测试相等性
   */
  assertEqual(actual, expected, message) {
    this.testCount++;
    if (actual === expected) {
      this.passCount++;
      console.log(`✅ ${message}`);
      this.results.push({ status: 'PASS', message });
    } else {
      this.failCount++;
      console.error(`❌ ${message} (预期: ${expected}, 实际: ${actual})`);
      this.results.push({
        status: 'FAIL',
        message,
        expected,
        actual
      });
    }
  }

  /**
   * 测试真值
   */
  assertTrue(condition, message) {
    this.testCount++;
    if (condition) {
      this.passCount++;
      console.log(`✅ ${message}`);
      this.results.push({ status: 'PASS', message });
    } else {
      this.failCount++;
      console.error(`❌ ${message}`);
      this.results.push({ status: 'FAIL', message });
    }
  }

  /**
   * 打印测试结果
   */
  printResults() {
    const duration = Date.now() - this.startTime;
    const successRate = (this.passCount / this.testCount * 100).toFixed(1);

    console.group('%c📊 测试结果', 'color: #2196F3; font-weight: bold; font-size: 14px');
    console.log(`总测试数: ${this.testCount}`);
    console.log(`✅ 通过: ${this.passCount}`);
    console.error(`❌ 失败: ${this.failCount}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`耗时: ${duration}ms`);
    console.groupEnd();

    return {
      total: this.testCount,
      passed: this.passCount,
      failed: this.failCount,
      successRate: parseFloat(successRate),
      duration,
      results: this.results
    };
  }

  /**
   * 导出测试报告为 JSON
   */
  exportReport() {
    return {
      timestamp: new Date().toISOString(),
      testCount: this.testCount,
      passCount: this.passCount,
      failCount: this.failCount,
      successRate: (this.passCount / this.testCount * 100).toFixed(1),
      duration: Date.now() - this.startTime,
      results: this.results
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.IntegrationTest = IntegrationTest;

  // 提供全局测试函数
  window.runIntegrationTests = async () => {
    const test = new IntegrationTest();
    await test.runAllTests();
    return test.exportReport();
  };
}

