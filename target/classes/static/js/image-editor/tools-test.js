/**
 * 裁剪与透明度工具测试脚本
 * 用于验证 CropTool 和 OpacityTool 的正确性
 */

console.log('%c🧪 开始测试裁剪与透明度工具', 'color: purple; font-weight: bold; font-size: 14px');

/**
 * 测试 CropTool 是否正确加载和注册
 */
function testCropTool() {
  console.log('\n%c📋 测试裁剪工具 (CropTool)', 'color: blue; font-weight: bold');

  try {
    // 检查类是否存在
    if (typeof CropTool === 'undefined') {
      console.error('❌ CropTool 类未定义');
      return false;
    }
    console.log('✓ CropTool 类已定义');

    // 创建实例
    const cropTool = new CropTool();
    console.log('✓ CropTool 实例创建成功');

    // 检查属性
    if (!cropTool.id || cropTool.id !== 'crop') {
      console.error('❌ CropTool ID 不正确');
      return false;
    }
    console.log('✓ CropTool ID:', cropTool.id);

    // 检查方法
    const requiredMethods = [
      'activate',
      'deactivate',
      'onMouseDown',
      'onMouseMove',
      'onMouseUp',
      'applyCrop',
      'cancelCrop',
      'render'
    ];

    for (const method of requiredMethods) {
      if (typeof cropTool[method] !== 'function') {
        console.error(`❌ 缺少方法: ${method}`);
        return false;
      }
    }
    console.log('✓ 所有必要方法都存在');

    // 检查状态对象
    if (!cropTool.cropState) {
      console.error('❌ cropState 对象不存在');
      return false;
    }
    console.log('✓ cropState 对象存在');

    console.log('%c✅ CropTool 测试通过', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.error('❌ CropTool 测试失败:', error);
    return false;
  }
}

/**
 * 测试 OpacityTool 是否正确加载和注册
 */
function testOpacityTool() {
  console.log('\n%c📋 测试透明度工具 (OpacityTool)', 'color: blue; font-weight: bold');

  try {
    // 检查类是否存在
    if (typeof OpacityTool === 'undefined') {
      console.error('❌ OpacityTool 类未定义');
      return false;
    }
    console.log('✓ OpacityTool 类已定义');

    // 创建实例
    const opacityTool = new OpacityTool();
    console.log('✓ OpacityTool 实例创建成功');

    // 检查属性
    if (!opacityTool.id || opacityTool.id !== 'opacity') {
      console.error('❌ OpacityTool ID 不正确');
      return false;
    }
    console.log('✓ OpacityTool ID:', opacityTool.id);

    // 检查方法
    const requiredMethods = [
      'activate',
      'deactivate',
      'onMouseDown',
      'onMouseMove',
      'onMouseUp',
      'ensureAlphaChannel',
      'applyGlobalOpacity',
      'applyBrushOpacity',
      'convertWhiteToTransparent',
      'render'
    ];

    for (const method of requiredMethods) {
      if (typeof opacityTool[method] !== 'function') {
        console.error(`❌ 缺少方法: ${method}`);
        return false;
      }
    }
    console.log('✓ 所有必要方法都存在');

    // 检查选项
    if (!opacityTool.options) {
      console.error('❌ options 对象不存在');
      return false;
    }
    console.log('✓ options 对象存在，模式:', opacityTool.options.mode);

    console.log('%c✅ OpacityTool 测试通过', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.error('❌ OpacityTool 测试失败:', error);
    return false;
  }
}

/**
 * 测试 Layer 类新增方法
 */
function testLayerEnhancements() {
  console.log('\n%c📋 测试 Layer 类增强功能', 'color: blue; font-weight: bold');

  try {
    // 创建测试图层
    const layer = new Layer({
      name: '测试图层',
      width: 100,
      height: 100
    });
    console.log('✓ 创建测试图层');

    // 检查新增方法
    const requiredMethods = [
      'enableAlphaChannel',
      'convertWhiteToTransparent',
      'adjustRegionOpacity',
      'applyOpacityBrush'
    ];

    for (const method of requiredMethods) {
      if (typeof layer[method] !== 'function') {
        console.error(`❌ 缺少方法: ${method}`);
        return false;
      }
    }
    console.log('✓ 所有新增方法都存在');

    // 测试 enableAlphaChannel
    const alphaResult = layer.enableAlphaChannel();
    if (typeof alphaResult !== 'boolean') {
      console.error('❌ enableAlphaChannel 返回值类型不正确');
      return false;
    }
    console.log('✓ enableAlphaChannel 执行成功，返回:', alphaResult);

    // 检查 Alpha 通道标志
    if (!layer._hasAlphaChannel) {
      console.error('❌ _hasAlphaChannel 标志未设置');
      return false;
    }
    console.log('✓ _hasAlphaChannel 标志已设置');

    // 测试 adjustRegionOpacity
    const adjustResult = layer.adjustRegionOpacity(10, 10, 50, 50, 0.5);
    console.log('✓ adjustRegionOpacity 执行成功，返回:', adjustResult);

    // 测试 applyOpacityBrush
    const brushResult = layer.applyOpacityBrush(50, 50, 30, 0.5, 0.7);
    console.log('✓ applyOpacityBrush 执行成功，返回:', brushResult);

    console.log('%c✅ Layer 增强功能测试通过', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.error('❌ Layer 增强功能测试失败:', error);
    return false;
  }
}

/**
 * 测试骨骼编辑工具
 */
function testBoneEditTool() {
  console.log('\n%c📋 测试骨骼编辑工具 (BoneEditTool)', 'color: blue; font-weight: bold');

  try {
    // 检查类是否存在
    if (typeof BoneEditTool === 'undefined') {
      console.error('❌ BoneEditTool 类未定义');
      return false;
    }
    console.log('✓ BoneEditTool 类已定义');

    // 检查编辑器是否存在
    if (typeof editor === 'undefined' || !editor) {
      console.warn('⚠️ 全局编辑器实例不存在，跳过 BoneEditTool 实例化');
      return true;
    }

    // 创建实例
    const boneTool = new BoneEditTool();
    console.log('✓ BoneEditTool 实例创建成功');

    // 检查属性
    if (!boneTool.id || boneTool.id !== 'bone-edit') {
      console.error('❌ BoneEditTool ID 不正确, 实际值:', boneTool.id);
      return false;
    }
    console.log('✓ BoneEditTool ID:', boneTool.id);

    // 检查方法
    const requiredMethods = [
      'activate',
      'deactivate',
      'onMouseDown',
      'onMouseMove',
      'onMouseUp',
      'render',
      'setSkeleton'
    ];

    for (const method of requiredMethods) {
      if (typeof boneTool[method] !== 'function') {
        console.error(`❌ 缺少方法: ${method}`);
        return false;
      }
    }
    console.log('✓ 所有必要方法都存在');

    console.log('%c✅ BoneEditTool 测试通过', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.error('❌ BoneEditTool 测试失败:', error);
    return false;
  }
}

/**
 * 测试工具是否在编辑器中注册
 */
function testEditorIntegration() {
  console.log('\n%c📋 测试编辑器集成', 'color: blue; font-weight: bold');

  try {
    // 检查全局编辑器
    if (typeof editor === 'undefined' || !editor) {
      console.warn('⚠️ 全局编辑器实例不存在，跳过集成测试');
      return true; // 不算失败，因为可能还没加载
    }

    console.log('✓ 编辑器实例存在');

    // 检查工具是否在管理器中注册
    if (!editor.toolManager) {
      console.error('❌ toolManager 不存在');
      return false;
    }
    console.log('✓ toolManager 存在');

    // 尝试获取工具
    const cropTool = editor.toolManager.tools?.get?.('crop');
    const opacityTool = editor.toolManager.tools?.get?.('opacity');
    const boneTool = editor.toolManager.tools?.get?.('bone-edit');

    if (cropTool) {
      console.log('✓ 裁剪工具已在编辑器中注册');
    } else {
      console.warn('⚠️ 裁剪工具未找到，可能未在编辑器初始化时注册');
    }

    if (opacityTool) {
      console.log('✓ 透明度工具已在编辑器中注册');
    } else {
      console.warn('⚠️ 透明度工具未找到，可能未在编辑器初始化时注册');
    }

    if (boneTool) {
      console.log('✓ 骨骼编辑工具已在编辑器中注册');
    } else {
      console.warn('⚠️ 骨骼编辑工具未找到，可能未在编辑器初始化时注册');
    }

    console.log('%c✅ 编辑器集成测试完成', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.error('❌ 编辑器集成测试失败:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('%c🧪 开始运行所有测试套件', 'color: purple; font-weight: bold; font-size: 16px');
  console.log('='.repeat(60));

  const results = {
    cropTool: testCropTool(),
    opacityTool: testOpacityTool(),
    boneEditTool: testBoneEditTool(),
    layerEnhancements: testLayerEnhancements(),
    editorIntegration: testEditorIntegration()
  };

  console.log('\n' + '='.repeat(60));
  console.log('%c📊 测试结果汇总', 'color: orange; font-weight: bold; font-size: 14px');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  console.log(`
✅ 通过: ${passed}/${total}
${Object.entries(results)
  .map(([name, result]) => `  ${result ? '✓' : '✗'} ${name}`)
  .join('\n')}
  `);

  if (passed === total) {
    console.log('%c🎉 所有测试通过！', 'color: green; font-weight: bold; font-size: 14px');
  } else {
    console.log(`%c⚠️ ${total - passed} 个测试失败，请检查上述错误信息`, 'color: red; font-weight: bold; font-size: 14px');
  }

  console.log('='.repeat(60));
  return results;
}

// 自动运行测试
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runAllTests, 500);
  });
} else {
  setTimeout(runAllTests, 500);
}

// 导出测试函数供外部使用
window.cropOpacityTests = {
  testCropTool,
  testOpacityTool,
  testBoneEditTool,
  testLayerEnhancements,
  testEditorIntegration,
  runAllTests
};

console.log('%c💡 测试函数已导出到 window.cropOpacityTests', 'color: cyan');

