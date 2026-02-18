/**
 * transform-test.js - 变换功能测试脚本
 * Phase 4: 变换与3D 功能测试
 */

/**
 * 测试变换功能
 */
function testTransformFunctions() {
  console.log('=== 开始测试变换功能 ===');

  const tests = [
    testTransformToolsExistence,
    testTransformToolRegistration,
    testFreeTransformTool,
    testScaleTool,
    testRotateTool,
    testSkewTool,
    testPerspectiveTool,
    testThreeDTransformTool,
    testTransformCommands
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    try {
      test();
      console.log(`✅ 测试 ${index + 1}: ${test.name} 通过`);
      passed++;
    } catch (error) {
      console.error(`❌ 测试 ${index + 1}: ${test.name} 失败 - ${error.message}`);
      failed++;
    }
  });

  console.log(`\n=== 测试结果: ${passed} 通过, ${failed} 失败 ===`);

  if (failed === 0) {
    console.log('🎉 所有变换功能测试通过！');
    return true;
  } else {
    console.warn('⚠️  部分变换功能测试失败');
    return false;
  }
}

/**
 * 测试变换工具类是否存在
 */
function testTransformToolsExistence() {
  const requiredClasses = [
    'TransformTool',
    'FreeTransformTool',
    'ScaleTool',
    'RotateTool',
    'SkewTool',
    'PerspectiveTool',
    'ThreeDTransformTool',
    'TransformCommand',
    'ScaleCommand',
    'PerspectiveCommand',
    'ThreeDTransformCommand'
  ];

  requiredClasses.forEach(className => {
    if (typeof window[className] === 'undefined') {
      throw new Error(`类 ${className} 未定义`);
    }
  });

  console.log('✅ 所有变换工具类已定义');
}

/**
 * 测试变换工具注册
 */
function testTransformToolRegistration() {
  if (!window.imageEditor || !window.imageEditor.toolManager) {
    throw new Error('ImageEditor 或 ToolManager 未初始化');
  }

  const requiredTools = [
    'free-transform',
    'scale',
    'rotate',
    'skew',
    'perspective',
    '3d-transform'
  ];

  requiredTools.forEach(toolId => {
    const tool = window.imageEditor.toolManager.getTool(toolId);
    if (!tool) {
      throw new Error(`工具 ${toolId} 未注册`);
    }

    if (typeof tool.activate !== 'function') {
      throw new Error(`工具 ${toolId} 缺少 activate 方法`);
    }

    if (typeof tool.deactivate !== 'function') {
      throw new Error(`工具 ${toolId} 缺少 deactivate 方法`);
    }
  });

  console.log('✅ 所有变换工具已正确注册');
}

/**
 * 测试自由变换工具
 */
function testFreeTransformTool() {
  const tool = window.imageEditor.toolManager.getTool('free-transform');
  if (!(tool instanceof FreeTransformTool)) {
    throw new Error('自由变换工具类型不正确');
  }

  // 测试工具属性
  if (tool.id !== 'free-transform') {
    throw new Error('自由变换工具 ID 不正确');
  }

  if (tool.name !== '自由变换') {
    throw new Error('自由变换工具名称不正确');
  }

  console.log('✅ 自由变换工具测试通过');
}

/**
 * 测试缩放工具
 */
function testScaleTool() {
  const tool = window.imageEditor.toolManager.getTool('scale');
  if (!(tool instanceof ScaleTool)) {
    throw new Error('缩放工具类型不正确');
  }

  // 测试工具属性
  if (tool.id !== 'scale') {
    throw new Error('缩放工具 ID 不正确');
  }

  if (tool.name !== '缩放') {
    throw new Error('缩放工具名称不正确');
  }

  // 测试选项
  if (typeof tool.options.preserveAspectRatio === 'undefined') {
    throw new Error('缩放工具缺少 preserveAspectRatio 选项');
  }

  console.log('✅ 缩放工具测试通过');
}

/**
 * 测试旋转工具
 */
function testRotateTool() {
  const tool = window.imageEditor.toolManager.getTool('rotate');
  if (!(tool instanceof RotateTool)) {
    throw new Error('旋转工具类型不正确');
  }

  // 测试工具属性
  if (tool.id !== 'rotate') {
    throw new Error('旋转工具 ID 不正确');
  }

  if (tool.name !== '旋转') {
    throw new Error('旋转工具名称不正确');
  }

  console.log('✅ 旋转工具测试通过');
}

/**
 * 测试倾斜工具
 */
function testSkewTool() {
  const tool = window.imageEditor.toolManager.getTool('skew');
  if (!(tool instanceof SkewTool)) {
    throw new Error('倾斜工具类型不正确');
  }

  // 测试工具属性
  if (tool.id !== 'skew') {
    throw new Error('倾斜工具 ID 不正确');
  }

  if (tool.name !== '倾斜') {
    throw new Error('倾斜工具名称不正确');
  }

  console.log('✅ 倾斜工具测试通过');
}

/**
 * 测试透视变换工具
 */
function testPerspectiveTool() {
  const tool = window.imageEditor.toolManager.getTool('perspective');
  if (!(tool instanceof PerspectiveTool)) {
    throw new Error('透视变换工具类型不正确');
  }

  // 测试工具属性
  if (tool.id !== 'perspective') {
    throw new Error('透视变换工具 ID 不正确');
  }

  if (tool.name !== '透视变换') {
    throw new Error('透视变换工具名称不正确');
  }

  // 测试透视状态
  if (!tool.perspectiveState) {
    throw new Error('透视变换工具缺少 perspectiveState');
  }

  console.log('✅ 透视变换工具测试通过');
}

/**
 * 测试 3D 变换工具
 */
function testThreeDTransformTool() {
  const tool = window.imageEditor.toolManager.getTool('3d-transform');
  if (!(tool instanceof ThreeDTransformTool)) {
    throw new Error('3D 变换工具类型不正确');
  }

  // 测试工具属性
  if (tool.id !== '3d-transform') {
    throw new Error('3D 变换工具 ID 不正确');
  }

  if (tool.name !== '3D 变换') {
    throw new Error('3D 变换工具名称不正确');
  }

  // 测试 3D 状态
  if (!tool.threeDState) {
    throw new Error('3D 变换工具缺少 threeDState');
  }

  console.log('✅ 3D 变换工具测试通过');
}

/**
 * 测试变换命令
 */
function testTransformCommands() {
  // 测试 TransformCommand
  const transformCommand = new TransformCommand(null, {});
  if (typeof transformCommand.execute !== 'function') {
    throw new Error('TransformCommand 缺少 execute 方法');
  }
  if (typeof transformCommand.undo !== 'function') {
    throw new Error('TransformCommand 缺少 undo 方法');
  }
  if (typeof transformCommand.redo !== 'function') {
    throw new Error('TransformCommand 缺少 redo 方法');
  }

  // 测试 ScaleCommand
  const scaleCommand = new ScaleCommand(null, 100, 100, 200, 200);
  if (typeof scaleCommand.execute !== 'function') {
    throw new Error('ScaleCommand 缺少 execute 方法');
  }
  if (typeof scaleCommand.undo !== 'function') {
    throw new Error('ScaleCommand 缺少 undo 方法');
  }

  // 测试 PerspectiveCommand
  const perspectiveCommand = new PerspectiveCommand(null, [], []);
  if (typeof perspectiveCommand.execute !== 'function') {
    throw new Error('PerspectiveCommand 缺少 execute 方法');
  }
  if (typeof perspectiveCommand.undo !== 'function') {
    throw new Error('PerspectiveCommand 缺少 undo 方法');
  }

  // 测试 ThreeDTransformCommand
  const threeDCommand = new ThreeDTransformCommand(null, {});
  if (typeof threeDCommand.execute !== 'function') {
    throw new Error('ThreeDTransformCommand 缺少 execute 方法');
  }
  if (typeof threeDCommand.undo !== 'function') {
    throw new Error('ThreeDTransformCommand 缺少 undo 方法');
  }

  console.log('✅ 所有变换命令测试通过');
}

/**
 * 测试工具激活/停用
 */
function testToolActivation() {
  console.log('=== 测试工具激活/停用 ===');

  const tools = [
    'free-transform',
    'scale',
    'rotate',
    'skew',
    'perspective',
    '3d-transform'
  ];

  tools.forEach(toolId => {
    try {
      console.log(`测试激活工具: ${toolId}`);
      window.imageEditor.toolManager.activate(toolId, window.imageEditor);

      const activeTool = window.imageEditor.toolManager.getActiveTool();
      if (!activeTool || activeTool.id !== toolId) {
        throw new Error(`工具 ${toolId} 激活失败`);
      }

      console.log(`✅ 工具 ${toolId} 激活成功`);
    } catch (error) {
      console.error(`❌ 工具 ${toolId} 激活失败: ${error.message}`);
    }
  });

  // 重新激活画笔工具
  window.imageEditor.toolManager.activate('brush', window.imageEditor);
  console.log('✅ 工具激活/停用测试完成');
}

/**
 * 测试变换功能集成
 */
function testTransformIntegration() {
  console.log('=== 测试变换功能集成 ===');

  // 检查 ImageEditor 是否支持变换功能
  if (!window.imageEditor) {
    throw new Error('ImageEditor 未初始化');
  }

  // 检查工具管理器
  if (!window.imageEditor.toolManager) {
    throw new Error('ToolManager 未初始化');
  }

  // 检查历史记录
  if (!window.imageEditor.history) {
    throw new Error('CommandHistory 未初始化');
  }

  // 检查文档
  if (!window.imageEditor.document) {
    throw new Error('Document 未初始化');
  }

  console.log('✅ 变换功能集成测试通过');
}

/**
 * 运行所有测试
 */
function runAllTransformTests() {
  console.log('🚀 开始运行所有变换功能测试');
  console.log('='.repeat(50));

  const results = {
    functions: testTransformFunctions(),
    integration: testTransformIntegration()
  };

  console.log('='.repeat(50));
  console.log('📊 测试总结:');
  console.log(`- 功能测试: ${results.functions ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- 集成测试: ${results.integration ? '✅ 通过' : '❌ 失败'}`);

  if (results.functions && results.integration) {
    console.log('🎉 所有变换功能测试通过！Phase 4 实现完成。');
    return true;
  } else {
    console.warn('⚠️  部分测试失败，请检查实现。');
    return false;
  }
}

/**
 * 快速测试
 */
function quickTransformTest() {
  console.log('🔍 快速测试变换功能...');

  try {
    // 测试基本类
    if (typeof FreeTransformTool === 'undefined') {
      throw new Error('FreeTransformTool 未定义');
    }

    if (typeof ScaleTool === 'undefined') {
      throw new Error('ScaleTool 未定义');
    }

    if (typeof RotateTool === 'undefined') {
      throw new Error('RotateTool 未定义');
    }

    if (typeof PerspectiveTool === 'undefined') {
      throw new Error('PerspectiveTool 未定义');
    }

    if (typeof ThreeDTransformTool === 'undefined') {
      throw new Error('ThreeDTransformTool 未定义');
    }

    console.log('✅ 所有变换工具类已定义');

    // 测试工具注册
    if (window.imageEditor && window.imageEditor.toolManager) {
      const tools = ['free-transform', 'scale', 'rotate', 'perspective', '3d-transform'];
      const missingTools = tools.filter(toolId => !window.imageEditor.toolManager.getTool(toolId));

      if (missingTools.length > 0) {
        throw new Error(`以下工具未注册: ${missingTools.join(', ')}`);
      }

      console.log('✅ 所有变换工具已注册');
    }

    console.log('🎉 快速测试通过！');
    return true;
  } catch (error) {
    console.error('❌ 快速测试失败:', error.message);
    return false;
  }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testTransformFunctions,
    testToolActivation,
    testTransformIntegration,
    runAllTransformTests,
    quickTransformTest
  };
}

// 自动运行测试（如果直接加载）
if (typeof window !== 'undefined' && window.location.href.includes('create-game-image')) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('🔄 自动运行变换功能测试...');
      quickTransformTest();
    }, 2000);
  });
}

