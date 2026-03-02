/**
 * 应用初始化脚本
 */

console.log('%c=== app.js 开始加载 === [时间戳: ' + new Date().getTime() + ']', 'color: red; font-weight: bold; font-size: 14px');

let editor = null;

/**
 * 初始化编辑器
 */
function initializeEditor() {
  console.log('🔧 initializeEditor 开始执行');

  const canvas = document.getElementById('editorCanvas');
  console.log('📍 Canvas 元素:', canvas);

  if (!canvas) {
    console.warn('⚠️ Canvas element not found - 可能这不是图片编辑器页面，跳过初始化');
    return;
  }

  // 计算 Canvas 大小（占满整个可用空间）
  // 左侧面板宽度约 250px，右侧面板宽度约 250px，工具栏高度 50px，菜单栏高度 40px
  const leftPanelWidth = 250;
  const rightPanelWidth = 250;
  const toolbarHeight = 50;
  const menuBarHeight = 40;

  canvas.width = window.innerWidth - leftPanelWidth - rightPanelWidth;
  canvas.height = window.innerHeight - menuBarHeight - toolbarHeight;
  console.log('📐 Canvas 大小设置:', { width: canvas.width, height: canvas.height });

  // 创建编辑器（初始文档尺寸为可用空间大小）
  console.log('🎨 开始创建 ImageEditor...');
  console.log('🔍 ImageEditor 类:', typeof ImageEditor);

  try {
    editor = new ImageEditor(canvas, {
      width: canvas.width,
      height: canvas.height
    });
    // 保存编辑器实例到全局 window 对象（供其他模块访问）
    window.editor = editor;
    console.log('✓ ImageEditor 创建成功');
    console.log('✓ 编辑器已保存到 window.editor');
  } catch (error) {
    console.error('❌ ImageEditor 创建失败:', error);
    return;
  }

  // 初始化文件菜单
  try {
    console.log('🎬 即将调用 initializeFileMenu');
    initializeFileMenu();
    console.log('✓ initializeFileMenu 执行完成');
  } catch (error) {
    console.error('❌ initializeFileMenu 执行失败:', error);
  }

  // 设置事件监听
  try {
    setupEventListeners();
    console.log('✓ setupEventListeners 执行完成');
  } catch (error) {
    console.error('❌ setupEventListeners 执行失败:', error);
  }

  // 初始化 UI
  updateLayersList();
  updateHistoryList();

  // 初始化骨骼动画系统
  try {
    console.log('🦴 初始化骨骼动画系统...');
    if (typeof SkeletonAnimationEditor !== 'undefined') {
      window.skeletonAnimationEditor = new SkeletonAnimationEditor(editor);
      console.log('✓ 骨骼动画编辑器已初始化');
    } else {
      console.warn('⚠️ SkeletonAnimationEditor 类未定义，骨骼动画功能将不可用');
    }
  } catch (error) {
    console.error('❌ 骨骼动画系统初始化失败:', error);
  }

  console.log('Editor initialized successfully');
}

/**
 * 初始化文件菜单 [NEW VERSION - 时间戳: ' + new Date().getTime() + ']
 */
function initializeFileMenu() {
  console.log('%c🎯 initializeFileMenu 被调用了 [版本: 2025]', 'color: purple; font-weight: bold; font-size: 16px');

  const menuFileBtn = document.getElementById('menuFile');
  const menuFileDropdown = document.getElementById('fileMenuDropdown');

  console.log('%c菜单初始化 - 调试信息:', 'color: purple; font-weight: bold');
  console.log('menuFileBtn:', menuFileBtn);
  console.log('menuFileDropdown:', menuFileDropdown);
  console.log('FileMenuManager class:', typeof FileMenuManager);
  console.log('editor object:', !!editor);

  if (menuFileBtn && menuFileDropdown) {
    console.log('%c✅ 菜单元素都存在', 'color: green; font-weight: bold');

    if (typeof FileMenuManager !== 'undefined') {
      console.log('%c✅ FileMenuManager 类已加载', 'color: green; font-weight: bold');
      try {
        window.fileMenuManager = new FileMenuManager(menuFileBtn, menuFileDropdown, editor);
        console.log('%c✓✓✓ 文件菜单初始化成功！✓✓✓', 'color: green; font-weight: bold; font-size: 14px');
        console.log('%c点击【文件】按钮应该现在可以工作了', 'color: green; font-weight: bold');
      } catch (error) {
        console.error('%c❌ FileMenuManager 初始化出错:', 'color: red; font-weight: bold', error);
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
      }
    } else {
      console.error('%c❌ FileMenuManager 类未定义', 'color: red; font-weight: bold');
      console.log('可用的全局对象:', Object.keys(window).filter(k => k.includes('Menu') || k.includes('File')));
    }
  } else {
    console.warn('%c❌ 菜单元素缺失:', 'color: red; font-weight: bold', {
      menuFileBtn: !!menuFileBtn,
      menuFileDropdown: !!menuFileDropdown
    });
    console.log('页面上所有按钮:', document.querySelectorAll('button').map(b => ({id: b.id, text: b.textContent})));
  }
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
  // 工具栏按钮
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const toolId = e.target.dataset.tool;
      if (toolId === 'shadow') {
        // 特殊处理阴影滤镜按钮
        showShadowFilterDialog();
        return;
      }
      if (toolId === 'ground-shadow') {
        // 特殊处理地面阴影滤镜按钮
        showGroundShadowFilterDialog();
        return;
      }
      if (toolId) {
        editor.activateTool(toolId);
        // 更新按钮状态
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // 图层面板
  document.getElementById('addLayerBtn').addEventListener('click', () => {
    editor.createLayer(`Layer ${editor.document.layers.length + 1}`);
    updateLayersList();
  });

  document.getElementById('deleteLayerBtn').addEventListener('click', () => {
    const selected = editor.document.selectedLayerId;
    if (selected) {
      editor.deleteLayer(selected);
      updateLayersList();
    }
  });

  // 历史记录按钮
  document.getElementById('undoBtn').addEventListener('click', () => {
    editor.undo();
  });

  document.getElementById('redoBtn').addEventListener('click', () => {
    editor.redo();
  });

  // 导出按钮
  document.getElementById('exportBtn').addEventListener('click', (e) => {
    const menu = document.getElementById('exportMenu');
    menu.style.left = e.target.offsetLeft + 'px';
    menu.style.top = (e.target.offsetTop + e.target.offsetHeight) + 'px';
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  // 导出菜单选项
  document.querySelectorAll('#exportMenu .menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const format = e.target.dataset.format;
      if (format === 'png') {
        editor.exportPNG();
      } else if (format === 'jpg') {
        editor.exportJPG();
      }
      document.getElementById('exportMenu').style.display = 'none';
    });
  });

  // 保存按钮
  document.getElementById('saveBtn').addEventListener('click', () => {
    editor.saveDocument();
  });

  // 缩放控制
  document.getElementById('zoomOut').addEventListener('click', () => {
    editor.renderer.zoom(0.9, editor.canvas.width / 2, editor.canvas.height / 2);
    updateZoomDisplay();
    editor.render();
  });

  document.getElementById('zoomIn').addEventListener('click', () => {
    editor.renderer.zoom(1.1, editor.canvas.width / 2, editor.canvas.height / 2);
    updateZoomDisplay();
    editor.render();
  });

  document.getElementById('fitWindow').addEventListener('click', () => {
    editor.renderer.fitToWindow(editor.document);
    updateZoomDisplay();
    editor.render();
  });

  document.getElementById('zoomLevel').addEventListener('change', (e) => {
    const percent = parseInt(e.target.value) / 100;
    editor.renderer.viewport.scale = percent;
    editor.render();
  });

  // 颜色选择器
  document.getElementById('foregroundColor').addEventListener('change', (e) => {
    const tool = editor.toolManager.getActiveTool();
    if (tool && tool.options) {
      tool.onOptionChange('color', e.target.value);
    }
  });

  // 事件总线监听
  eventBus.on('layerAdded', () => {
    updateLayersList();
  });

  eventBus.on('layerRemoved', () => {
    updateLayersList();
  });

  eventBus.on('layerSelected', () => {
    updateLayersList();
  });

  eventBus.on('historyChanged', () => {
    updateHistoryList();
    updateUndoRedoButtons();
  });

  eventBus.on('toolActivated', ({ tool }) => {
    updateToolOptions(tool);
  });

  // 窗口大小改变
  window.addEventListener('resize', () => {
    editor.canvas.width = window.innerWidth - 300;
    editor.canvas.height = window.innerHeight - 120;
    editor.render();
  });

  // 隐藏导出菜单
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('exportMenu');
    const exportBtn = document.getElementById('exportBtn');
    if (e.target !== exportBtn && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // 防止右键菜单
  editor.canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 骨骼编辑工具按钮
  const boneEditBtn = document.getElementById('bone-edit-btn');
  if (boneEditBtn) {
    boneEditBtn.addEventListener('click', () => {
      editor.activateTool('bone-edit');
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      boneEditBtn.classList.add('active');
      console.log('✓ 骨骼编辑工具已激活');
    });
  }

  // 切换动画编辑器按钮
  const toggleAnimationPanelBtn = document.getElementById('toggle-animation-panel-btn');
  if (toggleAnimationPanelBtn) {
    toggleAnimationPanelBtn.addEventListener('click', () => {
      if (window.skeletonAnimationEditor) {
        window.skeletonAnimationEditor.toggle();
        console.log('✓ 骨骼动画编辑器已切换');
      } else {
        console.warn('⚠️ 骨骼动画编辑器尚未初始化');
        // 尝试初始化
        if (typeof SkeletonAnimationEditor !== 'undefined') {
          window.skeletonAnimationEditor = new SkeletonAnimationEditor(editor);
          window.skeletonAnimationEditor.show();
          console.log('✓ 骨骼动画编辑器已初始化并显示');
        }
      }
    });
  }

  // 菜单栏按钮 - 编辑菜单
  document.getElementById('menuEdit').addEventListener('click', () => {
    alert('编辑菜单 - 功能开发中');
  });
  document.getElementById('menuImage').addEventListener('click', () => {
    alert('图像菜单 - 功能开发中');
  });
  document.getElementById('menuLayer').addEventListener('click', () => {
    alert('图层菜单 - 功能开发中');
  });
  document.getElementById('menuSelect').addEventListener('click', () => {
    alert('选择菜单 - 功能开发中');
  });
  document.getElementById('menuFilter').addEventListener('click', () => {
    showFilterMenu();
  });
  document.getElementById('menuAnimation').addEventListener('click', () => {
    alert('动画菜单 - 包含骨骼动画编辑器、补间动画等工具\n\n💡 提示：点击工具栏的🎬按钮打开骨骼动画编辑器');
  });
  document.getElementById('menuView').addEventListener('click', () => {
    alert('查看菜单 - 功能开发中');
  });
}

/**
 * 显示滤镜菜单
 */
function showFilterMenu() {
  const filters = editor.getAvailableFilters();
  const message = `可用滤镜 (${filters.length}):\n\n` +
    '基础滤镜:\n' +
    '- blur (模糊)\n' +
    '- sharpen (锐化)\n' +
    '- emboss (浮雕)\n' +
    '- edge-detect (边界检测)\n\n' +
    '色彩调整:\n' +
    '- brightness-contrast (亮度/对比度)\n' +
    '- hue-saturation (色相/饱和度)\n' +
    '- saturation (饱和度)\n' +
    '- grayscale (黑白)\n' +
    '- invert (反色)\n' +
    '- temperature (色温)\n\n' +
    '高级滤镜:\n' +
    '- pixelate (像素化)\n' +
    '- oil-paint (油画)\n' +
    '- motion-blur (运动模糊)\n' +
    '- radial-blur (径向模糊)\n\n' +
    '效果滤镜:\n' +
    '- clouds (云彩)\n' +
    '- lighting (光照)\n' +
    '- mirror (镜像)\n' +
      '- shadow (落地阴影) ✨\n' +
      '- ground-shadow (地面阴影/快速投影) ✨ 新增\n\n' +
      '示例:\n' +
      'editor.applyFilter(\'shadow\', {offsetX: 5, offsetY: 10, blurRadius: 8, opacity: 0.4})\n' +
      'editor.applyFilter(\'ground-shadow\', {projectionMethod: \'perspective\', lightX: 0.5, lightY: 0, lightHeight: 200, shadowWidth: 60, shadowLength: 40, blurRadius: 12, opacity: 0.5})';

  alert(message);
}

/**
 * 应用示例滤镜的便捷函数
 */
function applyFilterQuick(filterId, params = {}) {
  editor.applyFilter(filterId, params);
}

/**
 * 快速应用落地阴影滤镜
 */
function applyShadowFilter() {
  const params = {
    offsetX: 5,
    offsetY: 10,
    blurRadius: 8,
    opacity: 0.4,
    scaleX: 0.8,
    fadeDirection: 'bottom'
  };
  editor.applyFilter('shadow', params);
}

/**
 * 显示阴影滤镜设置对话框
 */
function showShadowFilterDialog() {
  const params = {
    offsetX: 5,
    offsetY: 10,
    blurRadius: 8,
    opacity: 0.4,
    scaleX: 0.8,
    fadeDirection: 'bottom'
  };

  const dialogHTML = `
    <div class="dialog-overlay" id="shadowDialog">
      <div class="dialog-content" style="min-width: 400px;">
        <h3 style="margin: 0 0 20px 0; padding: 15px; background: #f0f0f0; border-radius: 4px 4px 0 0;">
          🌑 落地阴影设置
        </h3>
        <div style="padding: 20px;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              水平偏移 (X): <span id="offsetXValue">${params.offsetX}</span>px
            </label>
            <input type="range" id="shadowOffsetX" min="-50" max="50" value="${params.offsetX}" step="1"
                   style="width: 100%;" onchange="document.getElementById('offsetXValue').textContent = this.value">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              垂直偏移 (Y): <span id="offsetYValue">${params.offsetY}</span>px
            </label>
            <input type="range" id="shadowOffsetY" min="-50" max="50" value="${params.offsetY}" step="1"
                   style="width: 100%;" onchange="document.getElementById('offsetYValue').textContent = this.value">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              模糊半径: <span id="blurRadiusValue">${params.blurRadius}</span>px
            </label>
            <input type="range" id="shadowBlurRadius" min="0" max="30" value="${params.blurRadius}" step="0.5"
                   style="width: 100%;" onchange="document.getElementById('blurRadiusValue').textContent = this.value">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              不透明度: <span id="opacityValue">${params.opacity}</span>
            </label>
            <input type="range" id="shadowOpacity" min="0.1" max="0.8" value="${params.opacity}" step="0.05"
                   style="width: 100%;" onchange="document.getElementById('opacityValue').textContent = this.value">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              水平缩放: <span id="scaleXValue">${params.scaleX}</span>
            </label>
            <input type="range" id="shadowScaleX" min="0.5" max="1.0" value="${params.scaleX}" step="0.05"
                   style="width: 100%;" onchange="document.getElementById('scaleXValue').textContent = this.value">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              近实远虚方向:
            </label>
            <select id="shadowFadeDirection" style="width: 100%; padding: 8px;">
              <option value="bottom" ${params.fadeDirection === 'bottom' ? 'selected' : ''}>底部清晰，顶部模糊</option>
              <option value="top" ${params.fadeDirection === 'top' ? 'selected' : ''}>顶部清晰，底部模糊</option>
              <option value="right" ${params.fadeDirection === 'right' ? 'selected' : ''}>右侧清晰，左侧模糊</option>
              <option value="left" ${params.fadeDirection === 'left' ? 'selected' : ''}>左侧清晰，右侧模糊</option>
              <option value="none" ${params.fadeDirection === 'none' ? 'selected' : ''}>不应用</option>
            </select>
          </div>
        </div>

        <div style="padding: 15px; background: #f0f0f0; border-radius: 0 0 4px 4px; text-align: right;">
          <button onclick="document.getElementById('shadowDialog').remove()" style="margin-right: 10px; padding: 8px 20px;">
            取消
          </button>
          <button onclick="applyShadowFilterFromDialog()" style="padding: 8px 20px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">
            应用阴影
          </button>
        </div>
      </div>
    </div>
  `;

  // 添加对话框到页面
  const overlay = document.createElement('div');
  overlay.innerHTML = dialogHTML;
  document.body.appendChild(overlay.firstElementChild);
}

/**
 * 从对话框应用阴影滤镜
 */
function applyShadowFilterFromDialog() {
  const params = {
    offsetX: parseInt(document.getElementById('shadowOffsetX').value),
    offsetY: parseInt(document.getElementById('shadowOffsetY').value),
    blurRadius: parseFloat(document.getElementById('shadowBlurRadius').value),
    opacity: parseFloat(document.getElementById('shadowOpacity').value),
    scaleX: parseFloat(document.getElementById('shadowScaleX').value),
    fadeDirection: document.getElementById('shadowFadeDirection').value
  };

  console.log('应用阴影滤镜参数:', params);
  editor.applyFilter('shadow', params);

  // 关闭对话框
  document.getElementById('shadowDialog').remove();
}

/**
 * 显示地面阴影滤镜设置对话框（快速投影法）
 */
function showGroundShadowFilterDialog() {
  const params = {
    // 光源位置（百分比）
    lightX: 50,        // 光源 X 位置（0-100，50=中心）
    lightY: 0,         // 光源 Y 位置（0-100，0=顶部）
    lightHeight: 200,  // 光源高度（像素）

    // 阴影参数
    shadowWidth: 60,   // 阴影宽度（像素）
    shadowLength: 40,  // 阴影长度（像素）
    blurRadius: 12,    // 模糊半径
    opacity: 0.5,      // 不透明度

    // 投影方式
    projectionMethod: 'perspective'  // 'radial'（放射状）或 'perspective'（透视）
  };

  const dialogHTML = `
    <div class="dialog-overlay" id="groundShadowDialog">
      <div class="dialog-content" style="min-width: 500px; max-width: 600px;">
        <h3 style="margin: 0 0 20px 0; padding: 15px; background: #f0f0f0; border-radius: 4px 4px 0 0;">
          ⚫ 地面阴影设置（快速投影法）
        </h3>
        <div style="padding: 20px;">
          <!-- 投影方式选择 -->
          <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px;">
            <label style="display: block; margin-bottom: 10px; font-weight: 600;">
              🎨 投影方式：
            </label>
            <div style="display: flex; gap: 20px;">
              <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="radio" name="projectionMethod" value="perspective" checked
                       onchange="document.getElementById('perspectiveOptions').style.display='block'; document.getElementById('radialOptions').style.display='none';"
                       style="margin-right: 8px;">
                <span>🌤️ 透视投影（推荐）</span>
              </label>
              <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="radio" name="projectionMethod" value="radial"
                       onchange="document.getElementById('perspectiveOptions').style.display='none'; document.getElementById('radialOptions').style.display='block';"
                       style="margin-right: 8px;">
                <span>☀️ 放射状投影</span>
              </label>
            </div>
            <small style="display: block; margin-top: 8px; color: #666;">
              透视投影：根据光源位置自动计算阴影方向和长度<br>
              放射状投影：简单的椭圆形阴影，不计算光源位置
            </small>
          </div>

          <!-- 透视投影参数 -->
          <div id="perspectiveOptions">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                光源水平位置: <span id="lightXValue">${params.lightX}</span>%
              </label>
              <input type="range" id="lightX" min="0" max="100" value="${params.lightX}" step="1"
                     style="width: 100%;" onchange="document.getElementById('lightXValue').textContent = this.value">
              <small style="color: #666;">0%=左, 50%=中, 100%=右。光源在左边，阴影向右偏</small>
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                光源垂直位置: <span id="lightYValue">${params.lightY}</span>%
              </label>
              <input type="range" id="lightY" min="-50" max="100" value="${params.lightY}" step="5"
                     style="width: 100%;" onchange="document.getElementById('lightYValue').textContent = this.value">
              <small style="color: #666;">0%=顶部, 100%=底部。负值=在图像上方</small>
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                光源高度: <span id="lightHeightValue">${params.lightHeight}</span>px
              </label>
              <input type="range" id="lightHeight" min="50" max="500" value="${params.lightHeight}" step="10"
                     style="width: 100%;" onchange="document.getElementById('lightHeightValue').textContent = this.value">
              <small style="color: #666;">光源越高，阴影越长、越淡</small>
            </div>
          </div>

          <!-- 放射状投影参数 -->
          <div id="radialOptions" style="display: none;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                放射源 X 位置: <span id="radialCenterXValue">50</span>%
              </label>
              <input type="range" id="radialCenterX" min="0" max="100" value="50" step="1"
                     style="width: 100%;" onchange="document.getElementById('radialCenterXValue').textContent = this.value">
              <small style="color: #666;">放射源在图像中的水平位置（0%=左, 50%=中, 100%=右）</small>
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                放射源 Y 位置: <span id="radialCenterYValue">80</span>%
              </label>
              <input type="range" id="radialCenterY" min="0" max="100" value="80" step="1"
                     style="width: 100%;" onchange="document.getElementById('radialCenterYValue').textContent = this.value">
              <small style="color: #666;">放射源在图像中的垂直位置（0%=顶, 100%=底，通常设置在人物脚下）</small>
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                放射半径: <span id="radialRadiusValue">60</span>px
              </label>
              <input type="range" id="radialRadius" min="20" max="150" value="60" step="5"
                     style="width: 100%;" onchange="document.getElementById('radialRadiusValue').textContent = this.value">
              <small style="color: #666;">从放射源中心向外的阴影范围</small>
            </div>

            <div style="padding: 10px; background: #f5f5f5; border-radius: 4px; border-left: 3px solid #999; margin-top: 10px;">
              <small style="color: #666;">
                💡 放射源：在指定位置产生均匀向外扩散的阴影，类似光源直接照射的效果
              </small>
            </div>
          </div>

          <!-- 通用阴影参数 -->
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              阴影宽度: <span id="shadowWidthValue">${params.shadowWidth}</span>px
            </label>
            <input type="range" id="shadowWidth" min="20" max="150" value="${params.shadowWidth}" step="5"
                   style="width: 100%;" onchange="document.getElementById('shadowWidthValue').textContent = this.value">
            <small style="color: #666;">阴影的横向宽度</small>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              阴影长度: <span id="shadowLengthValue">${params.shadowLength}</span>px
            </label>
            <input type="range" id="shadowLength" min="10" max="100" value="${params.shadowLength}" step="5"
                   style="width: 100%;" onchange="document.getElementById('shadowLengthValue').textContent = this.value">
            <small style="color: #666;">阴影的纵向长度（透视投影时会被光源高度影响）</small>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              模糊半径: <span id="groundBlurRadiusValue">${params.blurRadius}</span>px
            </label>
            <input type="range" id="groundBlurRadius" min="0" max="30" value="${params.blurRadius}" step="1"
                   style="width: 100%;" onchange="document.getElementById('groundBlurRadiusValue').textContent = this.value">
            <small style="color: #666;">阴影边缘的模糊程度</small>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">
              不透明度: <span id="groundOpacityValue">${params.opacity}</span>
            </label>
            <input type="range" id="groundOpacity" min="0.1" max="0.9" value="${params.opacity}" step="0.05"
                   style="width: 100%;" onchange="document.getElementById('groundOpacityValue').textContent = this.value">
            <small style="color: #666;">阴影的深浅程度</small>
          </div>

          <div style="padding: 15px; background: #e3f2fd; border-radius: 4px; border-left: 4px solid #2196f3;">
            <strong>💡 快速投影法说明：</strong>
            <ul style="margin: 8px 0 0 20px; font-size: 12px; color: #666;">
              <li>调整光源位置来控制阴影方向（光源在左，阴影向右）</li>
              <li>调整光源高度来控制阴影长度（光源高→阴影长且淡）</li>
              <li>适合快速创建自然的人物落地阴影</li>
              <li>透视投影模式支持"近实远虚"效果</li>
            </ul>
          </div>
        </div>

        <div style="padding: 15px; background: #f0f0f0; border-radius: 0 0 4px 4px; text-align: right;">
          <button onclick="document.getElementById('groundShadowDialog').remove()" style="margin-right: 10px; padding: 8px 20px;">
            取消
          </button>
          <button onclick="applyGroundShadowFilterFromDialog()" style="padding: 8px 20px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">
            应用阴影
          </button>
        </div>
      </div>
    </div>
  `;

  // 添加对话框到页面
  const overlay = document.createElement('div');
  overlay.innerHTML = dialogHTML;
  document.body.appendChild(overlay.firstElementChild);
}

/**
 * 从对话框应用地面阴影滤镜（快速投影法）
 */
function applyGroundShadowFilterFromDialog() {
  // 获取投影方式
  const projectionMethod = document.querySelector('input[name="projectionMethod"]:checked').value;

  // 构建参数
  const params = {
    projectionMethod: projectionMethod
  };

  // 透视投影参数
  if (projectionMethod === 'perspective') {
    params.lightX = parseInt(document.getElementById('lightX').value) / 100;
    params.lightY = parseInt(document.getElementById('lightY').value) / 100;
    params.lightHeight = parseInt(document.getElementById('lightHeight').value);
  }

  // 放射状投影参数
  if (projectionMethod === 'radial') {
    params.radialCenterX = parseInt(document.getElementById('radialCenterX').value) / 100;
    params.radialCenterY = parseInt(document.getElementById('radialCenterY').value) / 100;
    params.radialRadius = parseInt(document.getElementById('radialRadius').value);
  }

  // 通用参数
  params.shadowWidth = parseInt(document.getElementById('shadowWidth').value);
  params.shadowLength = parseInt(document.getElementById('shadowLength').value);
  params.blurRadius = parseInt(document.getElementById('groundBlurRadius').value);
  params.opacity = parseFloat(document.getElementById('groundOpacity').value);

  console.log('应用地面阴影滤镜参数（快速投影法）:', params);
  editor.applyFilter('ground-shadow', params);

  // 关闭对话框
  document.getElementById('groundShadowDialog').remove();
}

/**
 * 更新图层列表 UI
 */
function updateLayersList() {
  const layersList = document.getElementById('layersList');
  layersList.innerHTML = '';

  editor.document.layers.forEach((layer, index) => {
    const layerDiv = document.createElement('div');
    layerDiv.className = `layer-item ${layer.id === editor.document.selectedLayerId ? 'selected' : ''}`;
    layerDiv.innerHTML = `
      <span class="layer-visibility">
        <input type="checkbox" ${layer.visible ? 'checked' : ''}
               onchange="toggleLayerVisibility('${layer.id}', this.checked)">
      </span>
      <span class="layer-name">${layer.name}</span>
      <span class="layer-opacity">
        <input type="range" min="0" max="100" value="${layer.opacity * 100}"
               onchange="setLayerOpacity('${layer.id}', this.value / 100)">
      </span>
    `;

    layerDiv.addEventListener('click', () => {
      editor.selectLayer(layer.id);
      updateLayersList();
    });

    layersList.appendChild(layerDiv);
  });
}

/**
 * 更新历史记录 UI
 */
function updateHistoryList() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';

  const history = editor.history.getHistory();
  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = `history-item ${item.isCurrent ? 'current' : ''}`;
    historyItem.textContent = item.description;
    historyItem.addEventListener('click', () => {
      editor.history.jumpToIndex(item.index);
      editor.render();
    });
    historyList.appendChild(historyItem);
  });
}

/**
 * 更新工具选项 UI
 */
function updateToolOptions(tool) {
  const optionsContainer = document.getElementById('toolOptions');
  optionsContainer.innerHTML = '';

  // 参数说明字典
  const paramHints = {
    radiusX: '椭圆的水平半径，单位像素',
    radiusY: '椭圆的垂直半径，单位像素',
    feather: '边缘羽化（模糊）的宽度，值越大边缘越柔和',
    opacity: '阴影的透明度，0=完全透明，1=完全不透明，推荐0.6-0.8',
    hardness: '阴影中心的硬度，0=完全羽化（只有边缘），1=硬边界（中心完全不透明）',
    color: '阴影的颜色，支持任意RGB色彩',
    size: '圆的大小（直径）',
    layout: '菜单布局类型：grid（网格）/ list（列表）/ sidebar（侧栏）',
    style: '菜单风格：pixel（像素）/ dark（暗黑）/ cartoon（卡通）/ scifi（科幻）',
    item_count: '菜单中的物品数量（1-12个）',
    enable_animation: '是否启用菜单动画效果',
  };

  if (tool && tool.options) {
    Object.entries(tool.options).forEach(([key, value]) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'tool-option';
      optionDiv.title = paramHints[key] || '';

      let inputHTML = '';

      // 特殊处理菜单工具的选项
      if (key === 'layout') {
        inputHTML = `
          <select onchange="editor.toolManager.getActiveTool().onOptionChange('${key}', this.value); editor.render();" title="${paramHints[key] || ''}">
            <option value="grid" ${value === 'grid' ? 'selected' : ''}>网格布局</option>
            <option value="list" ${value === 'list' ? 'selected' : ''}>列表布局</option>
            <option value="sidebar" ${value === 'sidebar' ? 'selected' : ''}>侧栏布局</option>
          </select>
        `;
      } else if (key === 'style') {
        inputHTML = `
          <select onchange="editor.toolManager.getActiveTool().onOptionChange('${key}', this.value); editor.render();" title="${paramHints[key] || ''}">
            <option value="pixel" ${value === 'pixel' ? 'selected' : ''}>像素风</option>
            <option value="dark" ${value === 'dark' ? 'selected' : ''}>暗黑风</option>
            <option value="cartoon" ${value === 'cartoon' ? 'selected' : ''}>卡通风</option>
            <option value="scifi" ${value === 'scifi' ? 'selected' : ''}>科幻风</option>
          </select>
        `;
      } else if (key === 'item_count') {
        inputHTML = `<input type="number" min="1" max="12" value="${value}"
                              onchange="editor.toolManager.getActiveTool().onOptionChange('${key}', parseInt(this.value)); editor.render();"
                              title="${paramHints[key] || ''}">`;
      } else if (key === 'enable_animation') {
        inputHTML = `<input type="checkbox" ${value ? 'checked' : ''}
                              onchange="editor.toolManager.getActiveTool().onOptionChange('${key}', this.checked); editor.render();"
                              title="${paramHints[key] || ''}">`;
      } else if (typeof value === 'number') {
        if (key === 'opacity' || key === 'hardness') {
          // 0-1 范围的参数使用滑块
          inputHTML = `<input type="range" min="0" max="1" step="0.05" value="${value}"
                                onchange="editor.setToolOption('${key}', parseFloat(this.value))"
                                title="${paramHints[key] || ''}">`;
        } else if (key === 'feather') {
          // feather 是像素值 (0-50)
          inputHTML = `<input type="range" min="0" max="50" step="1" value="${value}"
                                onchange="editor.setToolOption('${key}', parseInt(this.value))"
                                title="${paramHints[key] || ''}">`;
        } else {
          // 其他数字参数 (radiusX, radiusY 等)
          inputHTML = `<input type="number" min="5" max="200" step="5" value="${value}"
                              onchange="editor.setToolOption('${key}', parseInt(this.value))"
                              title="${paramHints[key] || ''}">`;
        }
      } else if (typeof value === 'string') {
        // 字符串参数：如果看起来是颜色，使用颜色选择器
        if (key === 'color' || value.startsWith('#')) {
          inputHTML = `<input type="color" value="${value}"
                            onchange="editor.setToolOption('${key}', this.value)"
                            title="${paramHints[key] || ''}">`;
        } else {
          inputHTML = `<input type="text" value="${value}"
                            onchange="editor.setToolOption('${key}', this.value)"
                            title="${paramHints[key] || ''}">`;
        }
      }

      optionDiv.innerHTML = `
        <label title="${paramHints[key] || ''}">${key}:</label>
        ${inputHTML}
      `;

      optionsContainer.appendChild(optionDiv);
    });
  }
}

/**
 * 更新缩放显示
 */
function updateZoomDisplay() {
  const percent = Math.round(editor.renderer.viewport.scale * 100);
  document.getElementById('zoomLevel').value = percent;
}

/**
 * 更新撤销/重做按钮状态
 */
function updateUndoRedoButtons() {
  document.getElementById('undoBtn').disabled = !editor.canUndo();
  document.getElementById('redoBtn').disabled = !editor.canRedo();
}

/**
 * 切换图层可见性
 */
function toggleLayerVisibility(layerId, visible) {
  const layer = editor.document.getLayer(layerId);
  if (layer) {
    layer.visible = visible;
    editor.render();
  }
}

/**
 * 设置图层透明度
 */
function setLayerOpacity(layerId, opacity) {
  const layer = editor.document.getLayer(layerId);
  if (layer) {
    layer.opacity = opacity;
    editor.render();
  }
}

// 页面加载完成后初始化编辑器
console.log('📢 注册 DOMContentLoaded 事件监听器');

document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ DOMContentLoaded 事件触发，document.readyState:', document.readyState);
  initializeEditor();
});

// 如果页面已经加载完成，直接初始化
if (document.readyState === 'loading') {
  console.log('📄 页面仍在加载中...');
} else {
  console.log('⏱️ 页面已加载完成，直接初始化');
  // 延迟执行以确保所有脚本都已加载
  setTimeout(() => {
    if (!editor) {
      console.log('⚡ 直接调用 initializeEditor');
      initializeEditor();
    }
  }, 100);
}

