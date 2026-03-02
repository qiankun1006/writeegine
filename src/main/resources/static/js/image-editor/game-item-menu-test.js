/**
 * game-item-menu-test.js - 物品菜单工具测试脚本
 * 验证物品菜单工具的基本功能
 */

console.log('%c🎮 游戏物品菜单工具测试开始', 'color: green; font-weight: bold; font-size: 14px');

/**
 * 测试 1: 验证类是否正确加载
 */
function testClassesLoaded() {
  console.log('\n📋 测试 1: 验证类加载');

  const tests = [
    { name: 'ItemMenuRenderer', cls: typeof ItemMenuRenderer },
    { name: 'ItemMenuLayoutEngine', cls: typeof ItemMenuLayoutEngine },
    { name: 'ItemMenuStylePresets', cls: typeof ItemMenuStylePresets },
    { name: 'GameItemMenuTool', cls: typeof GameItemMenuTool }
  ];

  tests.forEach(test => {
    const status = test.cls === 'function' ? '✓' : '✗';
    console.log(`  ${status} ${test.name}: ${test.cls}`);
  });
}

/**
 * 测试 2: 验证风格预设
 */
function testStylePresets() {
  console.log('\n📋 测试 2: 验证风格预设');

  const presets = new ItemMenuStylePresets();
  const styles = ['pixel', 'dark', 'cartoon', 'scifi'];

  styles.forEach(style => {
    const preset = presets.getPreset(style);
    const hasPreset = preset && preset.style_name === style;
    console.log(`  ${hasPreset ? '✓' : '✗'} ${style}: ${hasPreset ? '✓ 预设完整' : '✗ 预设缺失'}`);
  });
}

/**
 * 测试 3: 验证布局引擎
 */
function testLayoutEngine() {
  console.log('\n📋 测试 3: 验证布局引擎');

  const engine = new ItemMenuLayoutEngine();
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    icon: '⚔️',
    name: `Item ${i + 1}`,
    quantity: i + 1,
    disabled: false
  }));

  const layouts = ['grid', 'list', 'sidebar'];
  const layoutParams = {
    rows: 4,
    cols: 3,
    item_width: 60,
    item_height: 60,
    gap: 8,
    padding: 10,
    grid_cols: 5,
    grid_gap: 4,
    sidebar_width: 180,
    item_height_sidebar: 40,
  };

  layouts.forEach(layout => {
    const positions = engine.calculate(items, layout, layoutParams);
    const success = positions && positions.length === items.length;
    console.log(`  ${success ? '✓' : '✗'} ${layout}布局: ${positions.length}个物品位置`);
  });
}

/**
 * 测试 4: 验证菜单工具初始化
 */
function testToolInitialization() {
  console.log('\n📋 测试 4: 验证菜单工具初始化');

  try {
    const tool = new GameItemMenuTool();
    console.log(`  ✓ 工具实例创建成功`);
    console.log(`    - 工具ID: ${tool.id}`);
    console.log(`    - 工具名称: ${tool.name}`);
    console.log(`    - 工具图标: ${tool.icon}`);
    console.log(`    - 工具选项: ${JSON.stringify(tool.options)}`);
  } catch (error) {
    console.log(`  ✗ 工具初始化失败: ${error.message}`);
  }
}

/**
 * 测试 5: 验证菜单渲染器
 */
function testMenuRenderer() {
  console.log('\n📋 测试 5: 验证菜单渲染器');

  try {
    const renderer = new ItemMenuRenderer();
    renderer.init();
    console.log(`  ✓ 渲染器初始化成功`);
    console.log(`    - 渲染器状态: ${renderer.initialized ? '已初始化' : '未初始化'}`);
    renderer.destroy();
    console.log(`  ✓ 渲染器销毁成功`);
  } catch (error) {
    console.log(`  ✗ 渲染器操作失败: ${error.message}`);
  }
}

/**
 * 测试 6: 验证菜单配置
 */
function testMenuConfig() {
  console.log('\n📋 测试 6: 验证菜单配置');

  try {
    const tool = new GameItemMenuTool();

    // 模拟激活（但不实际调用 activate 因为需要编辑器实例）
    // 检查默认配置
    const layoutParams = tool.getDefaultLayoutParams();
    console.log(`  ✓ 默认布局参数:`);
    console.log(`    - 行数: ${layoutParams.rows}`);
    console.log(`    - 列数: ${layoutParams.cols}`);
    console.log(`    - 物品大小: ${layoutParams.item_width}x${layoutParams.item_height}`);
    console.log(`    - 间隙: ${layoutParams.gap}px`);

    // 测试生成示例物品
    const items = tool.generateSampleItems(12);
    console.log(`  ✓ 生成的示例物品: ${items.length}个`);
    console.log(`    - 第一个物品: ${items[0].icon} ${items[0].name}`);
    console.log(`    - 最后一个物品: ${items[items.length - 1].icon} ${items[items.length - 1].name}`);
  } catch (error) {
    console.log(`  ✗ 菜单配置测试失败: ${error.message}`);
  }
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.clear();
  console.log('%c╔════════════════════════════════════════════════════════════╗', 'color: green; font-weight: bold');
  console.log('%c║     🎮 游戏物品菜单工具 - 集成测试                        ║', 'color: green; font-weight: bold');
  console.log('%c╚════════════════════════════════════════════════════════════╝', 'color: green; font-weight: bold');

  testClassesLoaded();
  testStylePresets();
  testLayoutEngine();
  testToolInitialization();
  testMenuRenderer();
  testMenuConfig();

  console.log('\n%c✅ 所有基础测试完成！', 'color: green; font-weight: bold; font-size: 14px');
  console.log('%c💡 提示: 启动图片编辑器后，点击工具栏中的 🎮 按钮激活物品菜单工具', 'color: blue; font-style: italic');
}

// 页面加载完成后运行测试
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  // 延迟运行以确保所有脚本都已加载
  setTimeout(runAllTests, 100);
}

