# 设计文档：文件菜单下拉系统

## 上下文

图片编辑器当前具有完整的编辑功能（绘画、变换、滤镜等），但缺少基础的文件操作菜单。菜单栏已有结构但功能未实现。

目标是快速实现文件菜单功能，同时建立一个可扩展的菜单系统架构，便于未来添加其他菜单（编辑、图像、图层、选择、滤镜、查看）。

## 目标与非目标

### 目标
- 实现完整的文件菜单下拉界面
- 支持导入、保存、导出图片等基础文件操作
- 创建可复用的菜单管理系统基础
- 提供良好的用户交互体验（下拉动画、外部点击关闭等）

### 非目标
- 实现其他菜单（编辑、图像等） - 后续任务
- 云存储或在线协作功能 - Phase 5 的功能
- 复杂的文件格式支持（当前仅支持 JSON 和 PNG/JPG）

## 技术决策

### 1. 菜单 HTML 结构
```html
<div class="file-menu-dropdown" id="fileMenuDropdown" style="display: none;">
  <button class="menu-item" data-action="import" id="importMenuItem">📁 导入</button>
  <button class="menu-item" data-action="save" id="saveMenuItem">💾 保存</button>
  <button class="menu-item" data-action="saveas" id="saveasMenuItem">💾 另存为</button>
  <div class="menu-separator"></div>
  <button class="menu-item" data-action="export-png" id="exportPngMenuItem">📤 导出为 PNG</button>
  <button class="menu-item" data-action="export-jpg" id="exportJpgMenuItem">📤 导出为 JPG</button>
</div>

<!-- 隐藏的文件输入控件 -->
<input type="file" id="fileInput" accept="image/*,.json" style="display: none;">
```

### 2. CSS 样式与动画
- 菜单使用绝对定位，相对于菜单栏定位
- 使用 CSS transitions 实现显示/隐藏动画（opacity + transform）
- z-index 确保菜单在最上方
- 支持主题颜色（深色模式）

```css
.file-menu-dropdown {
  position: absolute;
  top: 40px;
  left: 0;
  background: #3a3a3a;
  border: 1px solid #555;
  border-radius: 4px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all 0.2s ease-out;
  z-index: 1000;
}

.file-menu-dropdown.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #ddd;
  text-align: left;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #4a4a4a;
}

.menu-separator {
  height: 1px;
  background: #555;
  margin: 4px 0;
}
```

### 3. JavaScript 菜单管理类
创建一个可复用的菜单管理系统：

```javascript
class MenuManager {
  constructor(menuButton, menuContainer) {
    this.button = menuButton;
    this.container = menuContainer;
    this.isOpen = false;
    this._setupListeners();
  }

  _setupListeners() {
    // 菜单按钮点击切换
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // 外部点击关闭
    document.addEventListener('click', (e) => {
      if (!this.button.contains(e.target) && !this.container.contains(e.target)) {
        this.close();
      }
    });

    // 菜单项点击
    this.container.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (item) {
        e.stopPropagation();
        const action = item.dataset.action;
        this.onMenuItemClick(action);
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.container.classList.add('show');
    this.isOpen = true;
  }

  close() {
    this.container.classList.remove('show');
    this.isOpen = false;
  }

  onMenuItemClick(action) {
    // 由子类或事件监听器处理
  }
}

class FileMenuManager extends MenuManager {
  constructor(menuButton, menuContainer, editor) {
    super(menuButton, menuContainer);
    this.editor = editor;
    this.fileInput = document.getElementById('fileInput');
  }

  onMenuItemClick(action) {
    switch (action) {
      case 'import':
        this.handleImport();
        break;
      case 'save':
        this.handleSave();
        break;
      case 'saveas':
        this.handleSaveAs();
        break;
      case 'export-png':
        this.handleExport('png');
        break;
      case 'export-jpg':
        this.handleExport('jpg');
        break;
    }
  }

  handleImport() {
    this.fileInput.click();
  }

  handleSave() {
    const json = this.editor.document.toJSON();
    this._downloadFile(json, 'document.json', 'application/json');
  }

  handleSaveAs() {
    const filename = prompt('请输入文件名:', 'document.json');
    if (filename) {
      const json = this.editor.document.toJSON();
      this._downloadFile(json, filename, 'application/json');
    }
  }

  handleExport(format) {
    const canvas = this.editor.canvas;
    const filename = `export.${format}`;
    canvas.toBlob((blob) => {
      this._downloadFile(blob, filename);
    }, `image/${format === 'jpg' ? 'jpeg' : 'png'}`);
  }

  _downloadFile(data, filename, mimeType = 'application/octet-stream') {
    const blob = data instanceof Blob ? data : new Blob([JSON.stringify(data)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
```

### 4. 文件输入处理
```javascript
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const result = event.target.result;

      // 如果是 JSON 文件，加载为文档
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(result);
        await editor.loadDocument(json);
      }
      // 如果是图片文件，作为新图层加载
      else {
        const img = new Image();
        img.onload = () => {
          // 创建新图层并绘制图片
          editor.canvas.width = img.width;
          editor.canvas.height = img.height;
          const ctx = editor.canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          editor.render();
        };
        img.src = result;
      }
    } catch (error) {
      console.error('文件加载失败:', error);
      alert('文件加载失败，请检查文件格式');
    }
  };

  reader.readAsText(file);
});
```

### 5. 后端支持（可选）
当前实现主要依赖浏览器 API（File、Blob、URL）进行文件处理，无需后端支持。但为了支持更复杂的功能（如服务器端保存、协作编辑），可考虑添加后端接口：

```java
@PostMapping("/api/editor/upload")
public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
    // 验证文件类型和大小
    // 保存文件到服务器
    // 返回文件 URL
}

@GetMapping("/api/editor/download")
public ResponseEntity<?> downloadDocument(@RequestParam("id") String documentId) {
    // 从服务器获取文档
    // 返回文件
}
```

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|--------|
| 文件大小过大导致浏览器内存溢出 | 用户无法加载大文件 | 添加文件大小限制（>100MB 提示），支持增量加载 |
| 浏览器兼容性问题（文件 API） | 部分用户无法使用 | 测试主流浏览器（Chrome、Firefox、Safari、Edge） |
| 用户误操作覆盖文件 | 数据丢失 | 另存为功能提供新文件名选项，保存前提示 |
| 菜单定位偏移（特殊窗口大小） | 菜单显示位置不对 | 添加动态位置调整，检测视口边界 |

## 迁移计划

- 第一阶段：实现基础菜单样式和导入/导出功能（浏览器端）
- 第二阶段：添加保存功能，集成 LocalStorage 或后端存储
- 第三阶段：优化菜单系统，创建可复用的菜单管理基类
- 第四阶段：基于此架构实现其他菜单（编辑、图像等）

## 开放性问题

- 是否需要支持云端文件保存？（目前仅本地下载）
- 是否需要支持拖放文件到编辑器？（后续可添加）
- 文件大小限制应该设置为多少？（建议 100MB）
- 是否需要文件版本控制？（Phase 5 功能）

