/**
 * 应用初始化脚本
 */

let editor = null;

/**
 * 初始化编辑器
 */
function initializeEditor() {
  const canvas = document.getElementById('editorCanvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // 设置 Canvas 大小
  canvas.width = window.innerWidth - 300; // 减去左右边栏
  canvas.height = window.innerHeight - 120; // 减去菜单栏和状态栏

  // 创建编辑器
  editor = new ImageEditor(canvas, {
    width: 800,
    height: 600
  });

  // 设置事件监听
  setupEventListeners();

  // 初始化 UI
  updateLayersList();
  updateHistoryList();

  console.log('Editor initialized successfully');
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

  // 菜单栏按钮（暂时显示提示）
  document.getElementById('menuFile').addEventListener('click', () => {
    alert('文件菜单 - 功能开发中');
  });
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
    alert('滤镜菜单 - 功能开发中');
  });
  document.getElementById('menuView').addEventListener('click', () => {
    alert('查看菜单 - 功能开发中');
  });
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
document.addEventListener('DOMContentLoaded', () => {
  initializeEditor();
});

