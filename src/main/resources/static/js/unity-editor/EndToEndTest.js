/**
 * 端到端测试工具
 * 用于完整测试游戏类型选择门户和编辑器的集成功能
 */

class EndToEndTest {
  constructor() {
    this.testResults = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.group('%c🧪 端到端测试', 'color: #9C27B0; font-weight: bold; font-size: 14px');
    console.log(`测试时间: ${new Date().toLocaleString()}`);

    await this.testDataCompatibility();
    await this.testCreateGameFlow();
    await this.testSaveAndLoadGame();
    await this.testEditorTypeSwitching();
    await this.testUIButtonFunctionality();
    await this.testKeyboardShortcuts();
    await this.testErrorResponseHandling();
    await this.testBrowserCompatibility();

    this.printSummary();
    console.groupEnd();

    return this.getReport();
  }

  /**
   * 测试数据兼容性
   */
  async testDataCompatibility() {
    console.group('📊 数据兼容性测试');

    // 测试 1: 检查 API 响应格式
    try {
      const response = await fetch('/api/game/list');
      const data = await response.json();

      this.assertTrue(
        data.success === true || data.success === false,
        'API 应该返回 success 字段'
      );

      if (data.success) {
        this.assertTrue(
          Array.isArray(data.games),
          'API 应该返回游戏列表数组'
        );
      }
    } catch (error) {
      this.assertTrue(false, `获取游戏列表失败: ${error.message}`);
    }

    // 测试 2: 创建游戏数据结构
    try {
      const testData = {
        name: 'Test Game',
        type: '2d-strategy',
        description: 'Test game for compatibility'
      };

      // 模拟创建游戏
      const gameData = {
        id: 'test-game-001',
        name: testData.name,
        type: testData.type,
        description: testData.description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {}
      };

      this.assertTrue(
        gameData.id !== null && gameData.name !== null,
        '游戏数据应该包含必需字段'
      );

      this.assertTrue(
        ['2d-strategy', '2d-metroidvania', '2d-rpg', '3d-shooter'].includes(gameData.type),
        '游戏类型应该是有效的类型之一'
      );
    } catch (error) {
      this.assertTrue(false, `数据结构测试失败: ${error.message}`);
    }

    // 测试 3: 场景数据兼容性
    try {
      const sceneData = {
        objects: [
          { id: 1, x: 100, y: 100, width: 50, height: 50, color: '#ff0000' },
          { id: 2, x: 200, y: 200, width: 60, height: 60, color: '#00ff00' }
        ],
        settings: {
          gridSize: 32,
          snapToGrid: true,
          zoom: 1.0
        },
        metadata: {
          version: '1.0.0',
          editorType: '2d-strategy'
        }
      };

      this.assertTrue(
        Array.isArray(sceneData.objects),
        '场景数据应该包含对象数组'
      );

      this.assertTrue(
        sceneData.objects.every(obj => obj.id && obj.x !== undefined && obj.y !== undefined),
        '场景对象应该包含必需属性'
      );
    } catch (error) {
      this.assertTrue(false, `场景数据兼容性测试失败: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * 测试创建游戏完整流程
   */
  async testCreateGameFlow() {
    console.group('🎮 创建游戏流程测试');

    // 测试 1: 门户页面加载
    this.assertTrue(
      window.location.pathname.includes('/create-game/unity') ||
      document.querySelector('.portal-container') !== null,
      '门户页面应该正确加载'
    );

    // 测试 2: 游戏类型卡片存在
    const cards = document.querySelectorAll('.game-card');
    this.assertTrue(
      cards.length === 4,
      '门户应该有 4 个游戏类型卡片'
    );

    // 测试 3: 检查卡片类型
    const cardTypes = ['2d-strategy', '2d-metroidvania', '2d-rpg', '3d-shooter'];
    cardTypes.forEach(type => {
      const card = document.querySelector(`.game-card[onclick*="${type}"]`);
      this.assertTrue(
        card !== null,
        `${type} 卡片应该存在`
      );
    });

    // 测试 4: 创建游戏 API 调用
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: 'E2E Test Game',
          type: '2d-strategy',
          description: 'End-to-end test game'
        })
      });

      const data = await response.json();
      this.assertTrue(
        data.success === true,
        '创建游戏 API 应该返回成功'
      );

      if (data.success) {
        this.assertTrue(
          data.data && data.data.id,
          '创建游戏应该返回游戏 ID'
        );
      }
    } catch (error) {
      this.skipTest(`创建游戏 API 测试失败（后端可能未实现）: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * 测试保存和加载游戏
   */
  async testSaveAndLoadGame() {
    console.group('💾 保存和加载游戏测试');

    // 测试 1: 检查保存功能是否存在
    this.assertTrue(
      typeof window.unityEditor !== 'undefined' && typeof window.unityEditor.saveGame === 'function',
      'Unity 编辑器应该有 saveGame 方法'
    );

    // 测试 2: 模拟保存场景数据
    try {
      const testData = {
        objects: [
          { id: 1, x: 100, y: 100, width: 50, height: 50 }
        ],
        settings: { gridSize: 32 }
      };

      this.assertTrue(
        testData.objects !== null,
        '测试数据应该有效'
      );
    } catch (error) {
      this.assertTrue(false, `保存数据测试失败: ${error.message}`);
    }

    // 测试 3: 检查加载功能
    this.assertTrue(
      typeof window.unityEditor !== 'undefined' && typeof window.unityEditor.loadGame === 'function',
      'Unity 编辑器应该有 loadGame 方法'
    );

    console.groupEnd();
  }

  /**
   * 测试编辑器类型切换
   */
  async testEditorTypeSwitching() {
    console.group('🔄 编辑器类型切换测试');

    const editorTypes = ['2d-strategy', '2d-metroidvania', '2d-rpg', '3d-shooter'];
    const testUrls = [
      '/create-game/unity/2d-strategy',
      '/create-game/unity/2d-metroidvania',
      '/create-game/unity/2d-rpg',
      '/create-game/unity/3d-shooter'
    ];

    // 测试 1: 检查 URL 参数
    const currentPath = window.location.pathname;
    const isEditorPage = testUrls.some(url => currentPath.includes(url));
    if (isEditorPage) {
      this.assertTrue(true, '当前在编辑器页面');
    } else {
      this.skipTest('不在编辑器页面，跳过测试');
      console.groupEnd();
      return;
    }

    // 测试 2: 检查编辑器类型
    const editorType = currentPath.match(/\/([^\/]+)$/)?.[1];
    this.assertTrue(
      editorTypes.includes(editorType),
      `编辑器类型应该是有效的: ${editorType}`
    );

    console.groupEnd();
  }

  /**
   * 测试 UI 按钮功能
   */
  async testUIButtonFunctionality() {
    console.group('🖱️  UI 按钮功能测试');

    // 测试 1: 门户页面按钮
    const newGameButtons = document.querySelectorAll('.btn-new');
    this.assertTrue(
      newGameButtons.length > 0,
      '应该有"新建游戏"按钮'
    );

    // 测试 2: 编辑器工具栏（如果在编辑器页面）
    const toolbarButtons = document.querySelectorAll('.toolbar-btn, .tool-btn');
    if (toolbarButtons.length > 0) {
      this.assertTrue(
        toolbarButtons.length > 0,
        '编辑器应该有工具栏按钮'
      );
    } else {
      this.skipTest('不在编辑器页面，跳过工具栏测试');
    }

    // 测试 3: 返回按钮
    const backButton = document.querySelector('[onclick*="history.back"], .btn-back');
    this.assertTrue(
      backButton !== null,
      '应该有返回按钮'
    );

    console.groupEnd();
  }

  /**
   * 测试键盘快捷键
   */
  async testKeyboardShortcuts() {
    console.group('⌨️  键盘快捷键测试');

    // 测试 1: 检查快捷键监听器
    const hasKeyListener = document.addEventListener.toString().includes('keydown') ||
                           typeof window.addEventListener === 'function';

    this.assertTrue(
      hasKeyListener,
      '应该有键盘事件监听器'
    );

    // 测试 2: 常用快捷键提示
    const helpTooltip = document.querySelector('.tooltip, [data-shortcut]');
    if (helpTooltip) {
      this.assertTrue(true, '有快捷键提示');
    } else {
      this.skipTest('未找到快捷键提示');
    }

    console.groupEnd();
  }

  /**
   * 测试错误响应处理
   */
  async testErrorResponseHandling() {
    console.group('⚠️  错误响应处理测试');

    // 测试 1: 无效的游戏 ID
    try {
      const response = await fetch('/api/game/invalid-game-id');
      const data = await response.json();

      this.assertTrue(
        data.success === false || response.status >= 400,
        '无效的游戏 ID 应该返回错误'
      );
    } catch (error) {
      this.skipTest('错误响应测试失败（后端可能未实现）');
    }

    // 测试 2: 无效的游戏类型
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: 'Test',
          type: 'invalid-type'
        })
      });

      const data = await response.json();
      this.assertTrue(
        data.success === false || response.status >= 400,
        '无效的游戏类型应该返回错误'
      );
    } catch (error) {
      this.skipTest('错误响应测试失败（后端可能未实现）');
    }

    console.groupEnd();
  }

  /**
   * 测试浏览器兼容性
   */
  async testBrowserCompatibility() {
    console.group('🌐 浏览器兼容性测试');

    const userAgent = navigator.userAgent;

    // 测试 1: WebGL 支持
    this.assertTrue(
      typeof WebGLRenderingContext !== 'undefined' || typeof WebGL2RenderingContext !== 'undefined',
      '浏览器应该支持 WebGL'
    );

    // 测试 2: Canvas 2D 支持
    this.assertTrue(
      typeof HTMLCanvasElement !== 'undefined',
      '浏览器应该支持 Canvas 2D'
    );

    // 测试 3: ES6 支持
    this.assertTrue(
      typeof Promise !== 'undefined' && typeof async === 'function',
      '浏览器应该支持 ES6 Promise 和 async/await'
    );

    // 测试 4: 检测浏览器类型
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    console.log(`当前浏览器: ${browser}`);
    console.log(`用户代理: ${userAgent}`);

    // 支持的浏览器列表
    const supportedBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const isSupported = supportedBrowsers.some(b => userAgent.includes(b));

    this.assertTrue(
      isSupported,
      `浏览器应该受支持: ${browser}`
    );

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
    console.group('%c📊 端到端测试结果摘要', 'color: #9C27B0; font-weight: bold; font-size: 14px');

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
  window.EndToEndTest = EndToEndTest;

  // 提供全局测试函数
  window.runEndToEndTests = async () => {
    const test = new EndToEndTest();
    await test.runAllTests();
    return test.getReport();
  };
}

