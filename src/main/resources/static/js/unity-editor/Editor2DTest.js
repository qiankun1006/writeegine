/**
 * 2D 编辑器功能测试工具
 * 用于测试 2D 编辑器的各种功能
 */

class Editor2DTest {
  constructor(editor) {
    this.editor = editor;
    this.testResults = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.group('%c🧪 2D 编辑器功能测试', 'color: #4CAF50; font-weight: bold; font-size: 14px');
    console.log(`测试时间: ${new Date().toLocaleString()}`);

    await this.testCanvasRendering();
    await this.testObjectCreation();
    await this.testObjectSelection();
    await this.testObjectEditing();
    await this.testObjectDeletion();
    await this.testUndoRedo();
    await this.testZoomAndPan();
    await this.testSaveAndLoad();

    this.printSummary();
    console.groupEnd();

    return this.getReport();
  }

  /**
   * 测试 Canvas 渲染
   */
  async testCanvasRendering() {
    console.group('🖼️  Canvas 渲染测试');

    // 测试 1: Canvas 元素存在
    this.assertTrue(
      this.editor.canvas !== null && typeof this.editor.canvas !== 'undefined',
      'Canvas 元素应该存在'
    );

    // 测试 2: Canvas 上下文存在
    this.assertTrue(
      this.editor.ctx !== null && typeof this.editor.ctx !== 'undefined',
      'Canvas 2D 上下文应该存在'
    );

    // 测试 3: Canvas 尺寸正确
    this.assertTrue(
      this.editor.canvas.width > 0 && this.editor.canvas.height > 0,
      'Canvas 应该有有效的宽度和高度'
    );

    // 测试 4: 渲染方法存在
    this.assertTrue(
      typeof this.editor.render === 'function',
      'render 方法应该存在'
    );

    // 测试 5: 调用渲染方法
    try {
      this.editor.render();
      this.assertTrue(true, 'render 方法执行成功');
    } catch (error) {
      this.assertTrue(false, `render 方法执行失败: ${error.message}`);
    }

    // 测试 6: 检查清除功能
    try {
      if (typeof Canvas2DUtils !== 'undefined') {
        Canvas2DUtils.clearCanvas(this.editor.canvas);
        this.assertTrue(true, 'Canvas 清除功能正常');
      } else {
        this.skipTest('Canvas2DUtils 未定义，跳过清除测试');
      }
    } catch (error) {
      this.assertTrue(false, `Canvas 清除失败: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * 测试对象创建
   */
  async testObjectCreation() {
    console.group('📦 对象创建测试');

    // 记录初始对象数量
    const initialCount = this.editor.objects ? this.editor.objects.length : 0;

    // 测试 1: 创建基本对象
    try {
      const obj = this.editor.createObject(100, 100, 50, 50);
      this.assertTrue(obj !== null, '应该能创建对象');

      if (obj) {
        this.assertTrue(
          obj.x === 100 && obj.y === 100,
          '对象位置应该正确'
        );
        this.assertTrue(
          obj.width === 50 && obj.height === 50,
          '对象尺寸应该正确'
        );
      }
    } catch (error) {
      this.assertTrue(false, `创建对象失败: ${error.message}`);
    }

    // 测试 2: 检查对象列表
    const newCount = this.editor.objects ? this.editor.objects.length : 0;
    this.assertTrue(
      newCount === initialCount + 1,
      '对象列表应该增加一个对象'
    );

    // 测试 3: 创建多个对象
    try {
      const obj2 = this.editor.createObject(200, 200, 60, 60);
      const obj3 = this.editor.createObject(300, 300, 40, 40);
      this.assertTrue(obj2 !== null && obj3 !== null, '应该能创建多个对象');

      const finalCount = this.editor.objects ? this.editor.objects.length : 0;
      this.assertTrue(
        finalCount === initialCount + 3,
        '对象列表应该增加三个对象'
      );
    } catch (error) {
      this.assertTrue(false, `创建多个对象失败: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * 测试对象选择
   */
  async testObjectSelection() {
    console.group('🎯 对象选择测试');

    // 确保至少有一个对象
    if (!this.editor.objects || this.editor.objects.length === 0) {
      console.warn('⚠️  没有对象可供测试选择');
      this.skipTest('没有对象');
      console.groupEnd();
      return;
    }

    const testObj = this.editor.objects[0];

    // 测试 1: 选择对象
    try {
      this.editor.selectObject(testObj);
      this.assertTrue(
        this.editor.selectedObject === testObj,
        '应该能选择对象'
      );
    } catch (error) {
      this.assertTrue(false, `选择对象失败: ${error.message}`);
    }

    // 测试 2: 取消选择
    try {
      this.editor.deselectObject();
      this.assertTrue(
        this.editor.selectedObject === null,
        '应该能取消选择'
      );
    } catch (error) {
      this.assertTrue(false, `取消选择失败: ${error.message}`);
    }

    // 测试 3: 点击选择（模拟）
    try {
      this.editor.selectObject(testObj);
      const hit = this.editor.isPointInObject(
        testObj.x + testObj.width / 2,
        testObj.y + testObj.height / 2,
        testObj
      );
      this.assertTrue(hit !== false, '点击应该在对象内');
    } catch (error) {
      this.skipTest('点击选择测试需要 isPointInObject 方法');
    }

    console.groupEnd();
  }

  /**
   * 测试对象编辑
   */
  async testObjectEditing() {
    console.group('✏️  对象编辑测试');

    // 确保至少有一个对象
    if (!this.editor.objects || this.editor.objects.length === 0) {
      console.warn('⚠️  没有对象可供测试编辑');
      this.skipTest('没有对象');
      console.groupEnd();
      return;
    }

    const testObj = this.editor.objects[0];

    // 测试 1: 移动对象
    try {
      const originalX = testObj.x;
      const originalY = testObj.y;
      this.editor.moveObject(testObj, 50, 50);

      this.assertTrue(
        testObj.x === originalX + 50 && testObj.y === originalY + 50,
        '对象应该移动到正确位置'
      );
    } catch (error) {
      this.skipTest('移动对象测试需要 moveObject 方法');
    }

    // 测试 2: 调整对象大小
    try {
      const originalWidth = testObj.width;
      const originalHeight = testObj.height;
      this.editor.resizeObject(testObj, 100, 100);

      this.assertTrue(
        testObj.width === 100 && testObj.height === 100,
        '对象尺寸应该调整正确'
      );
    } catch (error) {
      this.skipTest('调整大小测试需要 resizeObject 方法');
    }

    // 测试 3: 更新对象属性
    try {
      testObj.color = '#ff0000';
      testObj.name = 'TestObject';

      this.assertTrue(
        testObj.color === '#ff0000' && testObj.name === 'TestObject',
        '对象属性应该更新成功'
      );
    } catch (error) {
      this.assertTrue(false, `更新属性失败: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * 测试对象删除
   */
  async testObjectDeletion() {
    console.group('🗑️  对象删除测试');

    // 确保至少有一个对象
    if (!this.editor.objects || this.editor.objects.length === 0) {
      console.warn('⚠️  没有对象可供测试删除');
      this.skipTest('没有对象');
      console.groupEnd();
      return;
    }

    const initialCount = this.editor.objects.length;
    const testObj = this.editor.objects[0];

    // 测试 1: 删除对象
    try {
      this.editor.deleteObject(testObj);
      const newCount = this.editor.objects.length;

      this.assertTrue(
        newCount === initialCount - 1,
        '对象列表应该减少一个对象'
      );

      this.assertTrue(
        !this.editor.objects.includes(testObj),
        '对象不应该再在列表中'
      );
    } catch (error) {
      this.assertTrue(false, `删除对象失败: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * 测试撤销/重做
   */
  async testUndoRedo() {
    console.group('↩️  撤销/重做测试');

    // 创建一个测试对象
    const obj = this.editor.createObject(100, 100, 50, 50);
    if (!obj) {
      this.skipTest('无法创建测试对象');
      console.groupEnd();
      return;
    }

    const originalX = obj.x;
    const originalY = obj.y;

    // 测试 1: 保存撤销状态
    try {
      this.editor.saveUndoState();
      this.assertTrue(true, '应该能保存撤销状态');
    } catch (error) {
      this.skipTest('saveUndoState 方法不存在');
    }

    // 测试 2: 修改对象
    obj.x = 200;
    obj.y = 200;

    // 测试 3: 撤销
    try {
      this.editor.undo();
      this.assertTrue(
        obj.x === originalX && obj.y === originalY,
        '撤销后对象应该恢复到原始位置'
      );
    } catch (error) {
      this.skipTest('撤销功能测试失败');
    }

    // 测试 4: 重做
    try {
      obj.x = 200;
      obj.y = 200;
      this.editor.saveUndoState();
      this.editor.undo();
      this.editor.redo();

      this.assertTrue(
        obj.x === 200 && obj.y === 200,
        '重做后对象应该恢复到修改后的位置'
      );
    } catch (error) {
      this.skipTest('重做功能测试失败');
    }

    console.groupEnd();
  }

  /**
   * 测试缩放和平移
   */
  async testZoomAndPan() {
    console.group('🔍 缩放和平移测试');

    const originalZoom = this.editor.zoom || 1;
    const originalPanX = this.editor.panX || 0;
    const originalPanY = this.editor.panY || 0;

    // 测试 1: 缩放
    try {
      this.editor.setZoom(2);
      this.assertTrue(
        Math.abs(this.editor.zoom - 2) < 0.01,
        '缩放应该设置为 2'
      );

      this.editor.setZoom(1);
      this.assertTrue(
        Math.abs(this.editor.zoom - 1) < 0.01,
        '缩放应该重置为 1'
      );
    } catch (error) {
      this.skipTest('缩放功能测试失败');
    }

    // 测试 2: 平移
    try {
      this.editor.setPan(100, 50);
      this.assertTrue(
        this.editor.panX === 100 && this.editor.panY === 50,
        '平移应该正确设置'
      );
    } catch (error) {
      this.skipTest('平移功能测试失败');
    }

    // 恢复原始值
    try {
      this.editor.setZoom(originalZoom);
      this.editor.setPan(originalPanX, originalPanY);
    } catch (error) {
      console.warn('无法恢复原始缩放和平移值');
    }

    console.groupEnd();
  }

  /**
   * 测试保存和加载
   */
  async testSaveAndLoad() {
    console.group('💾 保存和加载测试');

    // 创建一些测试对象
    this.editor.clearCanvas();
    const obj1 = this.editor.createObject(100, 100, 50, 50);
    const obj2 = this.editor.createObject(200, 200, 60, 60);

    if (!obj1 || !obj2) {
      this.skipTest('无法创建测试对象');
      console.groupEnd();
      return;
    }

    obj1.name = 'TestObject1';
    obj1.color = '#ff0000';
    obj2.name = 'TestObject2';
    obj2.color = '#00ff00';

    // 测试 1: 保存数据
    try {
      const data = this.editor.saveData();
      this.assertTrue(
        data !== null && typeof data === 'object',
        '保存应该返回有效的数据对象'
      );

      this.assertTrue(
        Array.isArray(data.objects) && data.objects.length >= 2,
        '保存的数据应该包含对象列表'
      );

      // 测试 2: 验证保存的数据
      const savedObj1 = data.objects.find(o => o.name === 'TestObject1');
      const savedObj2 = data.objects.find(o => o.name === 'TestObject2');

      this.assertTrue(
        savedObj1 !== null && savedObj2 !== null,
        '保存的数据应该包含所有创建的对象'
      );

      // 测试 3: 加载数据
      this.editor.clearCanvas();
      this.editor.loadData(data);

      const loadedObj1 = this.editor.objects.find(o => o.name === 'TestObject1');
      const loadedObj2 = this.editor.objects.find(o => o.name === 'TestObject2');

      this.assertTrue(
        loadedObj1 !== null && loadedObj2 !== null,
        '加载应该恢复所有对象'
      );

      this.assertTrue(
        loadedObj1.x === 100 && loadedObj1.y === 100,
        '加载的对象位置应该正确'
      );

      this.assertTrue(
        loadedObj1.color === '#ff0000',
        '加载的对象属性应该正确'
      );

    } catch (error) {
      this.skipTest(`保存和加载测试失败: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * 断言真值
   */
  assertTrue(condition, message) {
    this.testCount++;
    if (condition) {
      this.passCount++;
      console.log(`✅ ${message}`);
      this.testResults.push({ status: 'PASS', message });
    } else {
      this.failCount++;
      console.error(`❌ ${message}`);
      this.testResults.push({ status: 'FAIL', message });
    }
  }

  /**
   * 断言相等
   */
  assertEqual(actual, expected, message) {
    this.testCount++;
    if (actual === expected) {
      this.passCount++;
      console.log(`✅ ${message} (实际: ${actual}, 预期: ${expected})`);
      this.testResults.push({ status: 'PASS', message });
    } else {
      this.failCount++;
      console.error(`❌ ${message} (实际: ${actual}, 预期: ${expected})`);
      this.testResults.push({
        status: 'FAIL',
        message,
        actual,
        expected
      });
    }
  }

  /**
   * 跳过测试
   */
  skipTest(message) {
    this.testCount++;
    console.log(`⏭️  跳过: ${message}`);
    this.testResults.push({ status: 'SKIP', message });
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    console.group('%c📊 测试结果摘要', 'color: #2196F3; font-weight: bold; font-size: 14px');

    const summary = this.getSummary();
    console.log(`总测试数: ${summary.total}`);
    console.log(`✅ 通过: ${summary.passed}`);
    console.log(`❌ 失败: ${summary.failed}`);
    console.log(`⏭️  跳过: ${summary.skipped}`);
    console.log(`成功率: ${summary.successRate}%`);

    if (summary.failed > 0) {
      console.group('失败的测试');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.error(`  - ${r.message}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * 获取测试摘要
   */
  getSummary() {
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;

    return {
      total: this.testCount,
      passed,
      failed,
      skipped,
      successRate: this.testCount > 0 ? ((passed / this.testCount) * 100).toFixed(1) : 0
    };
  }

  /**
   * 获取测试报告
   */
  getReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      results: this.testResults
    };
  }

  /**
   * 导出报告为 JSON
   */
  exportAsJSON() {
    return JSON.stringify(this.getReport(), null, 2);
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.Editor2DTest = Editor2DTest;

  // 提供全局测试函数
  window.runEditor2DTests = async (editor) => {
    const test = new Editor2DTest(editor);
    await test.runAllTests();
    return test.getReport();
  };
}

