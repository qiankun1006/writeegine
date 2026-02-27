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
    console.error('❌ Canvas element not found');
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
    '- mirror (镜像)\n\n' +
    '示例: editor.applyFilter(\'blur\', {radius: 5})';

  alert(message);
}

/**
 * 应用示例滤镜的便捷函数
 */
function applyFilterQuick(filterId, params = {}) {
  editor.applyFilter(filterId, params);
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

  if (tool && tool.options) {
    Object.entries(tool.options).forEach(([key, value]) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'tool-option';

      let inputHTML = '';
      if (typeof value === 'number') {
        if (key === 'opacity' || key === 'hardness') {
          inputHTML = `<input type="range" min="0" max="1" step="0.1" value="${value}"
                              onchange="editor.setToolOption('${key}', parseFloat(this.value))">`;
        } else {
          inputHTML = `<input type="number" value="${value}"
                              onchange="editor.setToolOption('${key}', parseInt(this.value))">`;
        }
      } else if (typeof value === 'string') {
        inputHTML = `<input type="text" value="${value}"
                            onchange="editor.setToolOption('${key}', this.value)">`;
      }

      optionDiv.innerHTML = `
        <label>${key}:</label>
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

