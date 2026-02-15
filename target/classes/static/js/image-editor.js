/**
 * 主编辑器初始化脚本
 *
 * 负责初始化编辑器实例和绑定 UI 事件
 */

let editor = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeEditor();
  setupUIEventListeners();
  updateUI();
});

/**
 * 初始化编辑器
 */
function initializeEditor() {
  try {
    const canvas = document.getElementById('editorCanvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    // 创建全局事件总线（如果尚未存在）
    if (!window.eventBus) {
      window.eventBus = new EventBus();
    }

    // 初始化编辑器
    editor = new ImageEditor(canvas, {
      width: 800,
      height: 600,
      maxHistorySize: 100,
      renderFPS: 60
    });

    console.log('编辑器初始化成功');

    // 创建默认图层
    createDefaultLayer();

    // 注册工具
    registerTools();

  } catch (error) {
    console.error('编辑器初始化失败:', error);
    showError('编辑器初始化失败：' + error.message);
  }
}

/**
 * 创建默认图层
 */
function createDefaultLayer() {
  if (editor && editor.document.layers.length === 0) {
    const layer = new Layer({
      name: 'Layer 1',
      width: editor.document.width,
      height: editor.document.height
    });
    editor.document.addLayer(layer);
    editor.document.selectLayer(0);
  }
}

/**
 * 注册工具
 */
function registerTools() {
  if (!editor) return;

  try {
    // 注册画笔工具
    if (typeof BrushTool !== 'undefined') {
      editor.toolManager.register(new BrushTool());
      console.log('画笔工具已注册');
    }

    // 其他工具注册位置（待实现）
    // editor.toolManager.register(new PencilTool());
    // editor.toolManager.register(new EraserTool());
    // editor.toolManager.register(new RectSelectTool());
    // 等等...

  } catch (error) {
    console.error('工具注册失败:', error);
  }
}

/**
 * 设置 UI 事件监听
 */
function setupUIEventListeners() {
  // 工具按钮
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const toolId = btn.getAttribute('data-tool');
      if (editor) {
        editor.toolManager.activate(toolId);
        updateToolButtonStates();
      }
    });
  });

  // 颜色选择器
  const fgColor = document.getElementById('foregroundColor');
  const bgColor = document.getElementById('backgroundColor');

  if (fgColor) {
    fgColor.addEventListener('change', (e) => {
      if (editor) {
        const tool = editor.toolManager.getActiveTool();
        if (tool) {
          tool.onOptionChange('color', e.target.value);
        }
      }
    });
  }

  if (bgColor) {
    bgColor.addEventListener('change', (e) => {
      if (editor) {
        editor.document.backgroundColor = e.target.value;
        editor.renderer.markDirty();
      }
    });
  }

  // 图层操作
  const addLayerBtn = document.getElementById('addLayerBtn');
  const deleteLayerBtn = document.getElementById('deleteLayerBtn');

  if (addLayerBtn) {
    addLayerBtn.addEventListener('click', addLayer);
  }

  if (deleteLayerBtn) {
    deleteLayerBtn.addEventListener('click', deleteLayer);
  }

  // 撤销/重做
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (editor) editor.undo();
      updateUI();
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      if (editor) editor.redo();
      updateUI();
    });
  }

  // 视图操作
  const fitWindowBtn = document.getElementById('fitWindowBtn');
  const resetViewBtn = document.getElementById('resetViewBtn');

  if (fitWindowBtn) {
    fitWindowBtn.addEventListener('click', () => {
      if (editor) {
        editor.renderer.fitToWindow();
        updateViewportInfo();
      }
    });
  }

  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', () => {
      if (editor) {
        editor.renderer.resetViewport();
        updateViewportInfo();
      }
    });
  }

  // 事件总线监听
  if (window.eventBus) {
    window.eventBus.on('historyChanged', () => updateUI());
    window.eventBus.on('viewportChanged', updateViewportInfo);
    window.eventBus.on('toolActivated', () => updateToolButtonStates());
  }
}

/**
 * 添加新图层
 */
function addLayer() {
  if (!editor) return;

  const layerCount = editor.document.layers.length + 1;
  const layer = new Layer({
    name: `Layer ${layerCount}`,
    width: editor.document.width,
    height: editor.document.height
  });

  editor.document.addLayer(layer);
  editor.document.selectLayer(editor.document.layers.length - 1);

  updateLayersPanel();
  editor.renderer.markDirty();
}

/**
 * 删除当前图层
 */
function deleteLayer() {
  if (!editor) return;

  const selectedIndex = editor.document.selectedLayerIndex;
  if (selectedIndex >= 0) {
    editor.document.removeLayer(selectedIndex);
    updateLayersPanel();
    editor.renderer.markDirty();
  }
}

/**
 * 更新图层面板
 */
function updateLayersPanel() {
  if (!editor) return;

  const layersList = document.getElementById('layersList');
  if (!layersList) return;

  layersList.innerHTML = '';

  editor.document.layers.forEach((layer, index) => {
    const layerItem = document.createElement('div');
    layerItem.className = 'layer-item';
    if (index === editor.document.selectedLayerIndex) {
      layerItem.classList.add('selected');
    }

    layerItem.innerHTML = `
      <div class="layer-content">
        <input type="checkbox" class="layer-visibility" ${layer.visible ? 'checked' : ''}>
        <span class="layer-name">${layer.name}</span>
        <input type="range" class="layer-opacity" min="0" max="100" value="${Math.round(layer.opacity * 100)}">
      </div>
    `;

    // 事件绑定
    layerItem.addEventListener('click', () => {
      editor.document.selectLayer(index);
      updateLayersPanel();
      editor.renderer.markDirty();
    });

    const visibilityCheckbox = layerItem.querySelector('.layer-visibility');
    visibilityCheckbox.addEventListener('change', () => {
      layer.visible = visibilityCheckbox.checked;
      editor.renderer.markDirty();
    });

    const opacitySlider = layerItem.querySelector('.layer-opacity');
    opacitySlider.addEventListener('input', () => {
      layer.opacity = opacitySlider.value / 100;
      editor.renderer.markDirty();
    });

    layersList.appendChild(layerItem);
  });
}

/**
 * 更新工具按钮状态
 */
function updateToolButtonStates() {
  if (!editor) return;

  const activeTool = editor.toolManager.getActiveTool();
  document.querySelectorAll('.tool-btn').forEach(btn => {
    const toolId = btn.getAttribute('data-tool');
    if (activeTool && activeTool.id === toolId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * 更新视口信息
 */
function updateViewportInfo() {
  if (!editor) return;

  const info = editor.renderer.getViewportInfo();
  const zoomInfo = document.getElementById('zoomInfo');
  if (zoomInfo) {
    zoomInfo.textContent = info.zoom;
  }
}

/**
 * 更新整体 UI
 */
function updateUI() {
  updateLayersPanel();
  updateToolButtonStates();
  updateViewportInfo();
  updateHistoryPanel();
}

/**
 * 更新历史记录面板
 */
function updateHistoryPanel() {
  if (!editor) return;

  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  const history = editor.history.getHistory();
  historyList.innerHTML = '';

  history.forEach((item) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    if (item.active) {
      historyItem.classList.add('active');
    }

    historyItem.textContent = item.description;
    historyItem.addEventListener('click', () => {
      // 跳转到历史状态
      const currentIndex = editor.history.getCurrentIndex();
      const targetIndex = item.index;

      if (targetIndex < currentIndex) {
        while (editor.history.getCurrentIndex() > targetIndex) {
          editor.history.undo();
        }
      } else if (targetIndex > currentIndex) {
        while (editor.history.getCurrentIndex() < targetIndex) {
          editor.history.redo();
        }
      }

      editor.renderer.markDirty();
      updateUI();
    });

    historyList.appendChild(historyItem);
  });

  // 更新撤销/重做按钮
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  if (undoBtn) {
    undoBtn.disabled = !editor.history.canUndo();
  }

  if (redoBtn) {
    redoBtn.disabled = !editor.history.canRedo();
  }
}

/**
 * 显示错误信息
 */
function showError(message) {
  console.error(message);
  // 可以在这里添加 UI 错误提示
}

// 导出全局函数
window.editor = editor;
window.updateUI = updateUI;

