/**
 * 滤镜系统测试脚本
 * 测试所有滤镜的可用性和基本功能
 */

function testFilters() {
  console.log('=== 开始滤镜系统测试 ===');

  // 测试 FilterPipeline 是否存在
  if (typeof filterPipeline === 'undefined') {
    console.error('❌ FilterPipeline 未定义');
    return;
  }
  console.log('✓ FilterPipeline 已定义');

  // 测试 LayerStyleManager 是否存在
  if (typeof layerStyleManager === 'undefined') {
    console.error('❌ LayerStyleManager 未定义');
    return;
  }
  console.log('✓ LayerStyleManager 已定义');

  // 获取所有滤镜
  const filters = filterPipeline.getAllFilters();
  console.log(`✓ 找到 ${filters.length} 个滤镜`);

  // 分类显示滤镜
  const categories = {
    '基础滤镜': ['blur', 'sharpen', 'emboss', 'edge-detect'],
    '色彩调整': ['brightness-contrast', 'hue-saturation', 'levels', 'curves', 'saturation', 'grayscale', 'invert', 'temperature'],
    '高级滤镜': ['liquify', 'displace', 'motion-blur', 'radial-blur', 'pixelate', 'oil-paint'],
    '效果滤镜': ['clouds', 'lighting', 'emboss-render', 'bevel-emboss', 'mirror', 'checkerboard']
  };

  console.log('\n === 滤镜分类 ===');
  for (const [category, filterIds] of Object.entries(categories)) {
    const available = filterIds.filter(id => filters.includes(id));
    const status = available.length === filterIds.length ? '✓' : '⚠️';
    console.log(`${status} ${category} (${available.length}/${filterIds.length})`);
    available.forEach(id => console.log(`  ✓ ${id}`));
    const missing = filterIds.filter(id => !filters.includes(id));
    if (missing.length > 0) {
      missing.forEach(id => console.log(`  ✗ ${id}`));
    }
  }

  // 测试 ImageEditor 集成
  if (typeof editor !== 'undefined' && editor) {
    console.log('\n === ImageEditor 集成 ===');

    const editorFilters = editor.getAvailableFilters();
    console.log(`✓ ImageEditor 可用滤镜: ${editorFilters.length}`);

    // 测试应用滤镜方法
    if (typeof editor.applyFilter === 'function') {
      console.log('✓ editor.applyFilter 方法存在');
    } else {
      console.error('❌ editor.applyFilter 方法不存在');
    }

    if (typeof editor.applyFilterChain === 'function') {
      console.log('✓ editor.applyFilterChain 方法存在');
    } else {
      console.error('❌ editor.applyFilterChain 方法不存在');
    }

    if (typeof editor.applyLayerStyle === 'function') {
      console.log('✓ editor.applyLayerStyle 方法存在');
    } else {
      console.error('❌ editor.applyLayerStyle 方法不存在');
    }
  }

  // 测试滤镜类
  console.log('\n === 滤镜类测试 ===');

  const filterClasses = [
    'BlurFilter', 'SharpenFilter', 'EmbossFilter', 'EdgeDetectFilter',
    'BrightnessContrastFilter', 'HueSaturationFilter', 'LevelsFilter', 'CurvesFilter',
    'SaturationFilter', 'GrayscaleFilter', 'InvertFilter', 'TemperatureFilter',
    'LiquifyFilter', 'DisplaceFilter', 'MotionBlurFilter', 'RadialBlurFilter',
    'PixelateFilter', 'OilPaintFilter',
    'CloudsFilter', 'LightingFilter', 'EmbossRenderFilter', 'BevelEmbossFilter',
    'MirrorFilter', 'CheckerboardFilter'
  ];

  filterClasses.forEach(className => {
    if (typeof window[className] !== 'undefined') {
      console.log(`✓ ${className}`);
    } else {
      console.log(`❌ ${className} 未定义`);
    }
  });

  // 测试图层样式类
  console.log('\n === 图层样式类测试 ===');

  const styleClasses = [
    'DropShadowStyle', 'OuterGlowStyle', 'InnerGlowStyle', 'StrokeStyle'
  ];

  styleClasses.forEach(className => {
    if (typeof window[className] !== 'undefined') {
      console.log(`✓ ${className}`);
    } else {
      console.log(`❌ ${className} 未定义`);
    }
  });

  console.log('\n=== 滤镜系统测试完成 ===\n');
}

// 测试示例滤镜应用
function testApplyFilter() {
  console.log('\n=== 测试应用滤镜 ===');

  if (!editor || !editor.getSelectedLayer()) {
    console.error('❌ 编辑器未初始化或没有选中图层');
    return;
  }

  try {
    // 测试应用模糊滤镜
    console.log('应用模糊滤镜...');
    editor.applyFilter('blur', { radius: 5 });
    console.log('✓ 模糊滤镜已应用');

    // 测试应用亮度/对比度
    console.log('应用亮度/对比度...');
    editor.applyFilter('brightness-contrast', { brightness: 20, contrast: 10 });
    console.log('✓ 亮度/对比度已应用');

    // 测试应用黑白滤镜
    console.log('应用黑白滤镜...');
    editor.applyFilter('grayscale');
    console.log('✓ 黑白滤镜已应用');

    console.log('\n✓ 所有测试滤镜都已成功应用');
  } catch (error) {
    console.error('❌ 滤镜应用失败:', error);
  }
}

// 在控制台中运行测试
// 调用 testFilters() 进行完整测试
// 调用 testApplyFilter() 测试滤镜应用

