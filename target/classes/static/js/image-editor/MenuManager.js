/**
 * MenuManager - 菜单管理系统基类
 * 提供可复用的菜单打开/关闭、点击处理、外部点击关闭等功能
 */
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
      console.log('Menu button clicked');
      e.stopPropagation();
      this.toggle();
    });

    // 外部点击关闭
    document.addEventListener('click', (e) => {
      if (!this.button.contains(e.target) && !this.container.contains(e.target)) {
        if (this.isOpen) {
          console.log('Closing menu due to external click');
          this.close();
        }
      }
    });

    // 菜单项点击处理和防止冒泡
    this.container.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Container clicked, target:', e.target);

      const item = e.target.closest('.menu-item');
      if (item) {
        const action = item.dataset.action;
        console.log('Menu item clicked, action:', action);
        this.onMenuItemClick(action);
        this.close();
      }
    });
  }

  toggle() {
    console.log('Toggle menu, current state:', this.isOpen);
    this.isOpen ? this.close() : this.open();
  }

  open() {
    console.log('Opening menu');
    this.container.classList.add('show');
    this.container.style.display = 'block';
    this.isOpen = true;
    this._adjustPosition();
    console.log('Menu opened, container display:', this.container.style.display);
  }

  _adjustPosition() {
    // 检查菜单是否超出视口边界，如果超出则调整位置
    const rect = this.container.getBoundingClientRect();
    console.log('Adjusting menu position, rect:', rect);

    // 检查右边界
    if (rect.right > window.innerWidth) {
      this.container.style.left = 'auto';
      this.container.style.right = '0';
    } else {
      this.container.style.left = '0';
      this.container.style.right = 'auto';
    }

    // 检查下边界
    if (rect.bottom > window.innerHeight) {
      this.container.style.top = 'auto';
      this.container.style.bottom = '100%';
      this.container.style.marginTop = 'auto';
      this.container.style.marginBottom = '2px';
    } else {
      this.container.style.top = '100%';
      this.container.style.bottom = 'auto';
      this.container.style.marginTop = '2px';
      this.container.style.marginBottom = 'auto';
    }
  }

  close() {
    console.log('Closing menu');
    this.container.classList.remove('show');
    this.container.style.display = 'none';
    this.isOpen = false;
  }

  onMenuItemClick(action) {
    // 由子类或事件监听器处理
  }
}

/**
 * FileMenuManager - 文件菜单管理器
 * 继承自 MenuManager，处理文件相关的菜单操作
 */
class FileMenuManager extends MenuManager {
  constructor(menuButton, menuContainer, editor) {
    super(menuButton, menuContainer);
    this.editor = editor;
    this.fileInput = document.getElementById('fileInput');
    this._setupFileInputListener();
  }

  _setupFileInputListener() {
    if (!this.fileInput) {
      console.error('❌ 文件输入控件未找到');
      return;
    }

    this.fileInput.addEventListener('change', async (e) => {
      console.log('📂 文件选择变化');

      try {
        // 阶段1：文件选择
        const file = e.target.files[0];
        console.log('📄 选择的文件:', file);

        if (!file) {
          console.warn('❌ 没有选择文件');
          this._showError('请选择一个文件');
          return;
        }

        // 阶段2：文件读取
        const fileData = await this._readFile(file);

        // 阶段3：处理文件
        await this._processFile(file, fileData);

        console.log('%c✓✓✓ 文件导入完成！✓✓✓', 'color: green; font-weight: bold; font-size: 14px');
      } catch (error) {
        console.error('❌ 文件导入失败:', error);
        this._showError(`导入失败: ${error.message}`);
      } finally {
        // 重置文件输入，允许选择同一个文件
        this.fileInput.value = '';
      }
    });
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
      default:
        console.warn(`Unknown file menu action: ${action}`);
    }
  }

  handleImport() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  handleSave() {
    try {
      let documentData;

      // 如果编辑器有 toJSON 方法，使用它
      if (this.editor.document && this.editor.document.toJSON) {
        documentData = this.editor.document.toJSON();
      } else if (this.editor.toJSON) {
        documentData = this.editor.toJSON();
      } else {
        // 备用方案：导出基本信息
        documentData = {
          width: this.editor.canvas.width,
          height: this.editor.canvas.height,
          timestamp: new Date().toISOString()
        };
      }

      const json = JSON.stringify(documentData, null, 2);
      this._downloadFile(json, 'document.json', 'application/json');
    } catch (error) {
      console.error('保存文档失败:', error);
      alert('保存文档失败，请重试');
    }
  }

  handleSaveAs() {
    const filename = prompt('请输入文件名 (默认: document.json):', 'document.json');
    if (filename) {
      try {
        let documentData;

        if (this.editor.document && this.editor.document.toJSON) {
          documentData = this.editor.document.toJSON();
        } else if (this.editor.toJSON) {
          documentData = this.editor.toJSON();
        } else {
          documentData = {
            width: this.editor.canvas.width,
            height: this.editor.canvas.height,
            timestamp: new Date().toISOString()
          };
        }

        const json = JSON.stringify(documentData, null, 2);
        this._downloadFile(json, filename, 'application/json');
      } catch (error) {
        console.error('另存为失败:', error);
        alert('另存为失败，请重试');
      }
    }
  }

  handleExport(format) {
    try {
      const canvas = this.editor.canvas;
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const filename = `export.${format}`;

      // 转换为 Blob 并下载
      canvas.toBlob((blob) => {
        this._downloadFile(blob, filename);
      }, mimeType, format === 'jpg' ? 0.85 : undefined);
    } catch (error) {
      console.error(`导出 ${format.toUpperCase()} 失败:`, error);
      alert(`导出 ${format.toUpperCase()} 失败，请重试`);
    }
  }

  _downloadFile(data, filename, mimeType = 'application/octet-stream') {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 读取文件内容
   */
  async _readFile(file) {
    return new Promise((resolve, reject) => {
      console.log('📖 开始读取文件:', file.name);

      const reader = new FileReader();

      reader.onload = (event) => {
        console.log('✅ 文件读取完成，数据长度:', event.target.result.length);
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        console.error('❌ 文件读取失败:', error);
        reject(new Error(`文件读取失败: ${error.target.error?.message || '未知错误'}`));
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          console.log(`📊 文件读取进度: ${percent}%`);
          this._showProgress(`正在读取文件... ${percent}%`);
        }
      };

      // 根据文件类型选择读取方式
      if (file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reject(new Error(`不支持的文件格式: ${file.type || '未知'}`));
      }
    });
  }

  /**
   * 处理文件数据
   */
  async _processFile(file, fileData) {
    console.log('🔄 开始处理文件:', file.name);

    // 如果是 JSON 文件，加载为文档
    if (file.name.endsWith('.json')) {
      console.log('📋 检测到 JSON 文件，开始解析');
      const json = JSON.parse(fileData);
      if (this.editor.loadDocument) {
        await this.editor.loadDocument(json);
        console.log('✅ JSON 文档加载完成');
      } else {
        throw new Error('编辑器不支持 loadDocument 方法');
      }
    }
    // 如果是图片文件，加载图片
    else if (file.type.startsWith('image/')) {
      console.log('🖼️ 检测到图片文件，开始加载');
      await this._loadAndAddImage(fileData, file.name);
    } else {
      throw new Error(`不支持的文件类型: ${file.type}`);
    }
  }

  /**
   * 加载图片并添加到文档
   */
  async _loadAndAddImage(dataUrl, filename) {
    return new Promise((resolve, reject) => {
      console.log('🔗 创建图片对象');
      const img = new Image();

      img.onload = () => {
        console.log('✅ 图片加载成功:', {
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });

        try {
          this._addImageToDocument(img, filename);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('❌ 图片加载失败:', error);
        reject(new Error('图片加载失败，文件可能已损坏'));
      };

      img.onabort = () => {
        console.warn('⚠️ 图片加载被中止');
        reject(new Error('图片加载被中止'));
      };

      console.log('🔗 设置图片源');
      img.src = dataUrl;
      console.log('⏳ 等待图片加载...');
    });
  }

  /**
   * 将图片添加到文档
   */
  _addImageToDocument(img, filename) {
    console.log('🎨 开始将图片添加到文档');

    // 检查编辑器是否存在
    if (!this.editor || !this.editor.document) {
      throw new Error('编辑器或文档未初始化');
    }

    // 关键：先更新文档尺寸，再添加图片图层
    console.log('📐 更新文档尺寸:', { width: img.width, height: img.height });
    // 文档保留图片的厚类尺寸，方便后续缩放操作
    this.editor.document.width = img.width;
    this.editor.document.height = img.height;

    // 更新 canvas 尺寸以匹配文档
    if (this.editor.canvas) {
      // 可能需要求符的容器大小
      const canvasArea = this.editor.canvas.parentElement;
      if (canvasArea) {
        const maxWidth = canvasArea.clientWidth;
        const maxHeight = canvasArea.clientHeight;

        console.log('📐 可用容器尺寸:', { maxWidth, maxHeight });
        console.log('📐 图片厚类尺寸:', { width: img.width, height: img.height });

        // 设置为整个可用空间或按比例缩放
        if (img.width <= maxWidth && img.height <= maxHeight) {
          // 图片小于可用空间，直接使用图片尺寸
          this.editor.canvas.width = img.width;
          this.editor.canvas.height = img.height;
          console.log('📐 使用图片实际尺寸');
        } else {
          // 图片大于可用空间，按比例缩放到可用空间
          const scaleX = maxWidth / img.width;
          const scaleY = maxHeight / img.height;
          const scale = Math.min(scaleX, scaleY, 1);

          this.editor.canvas.width = img.width * scale;
          this.editor.canvas.height = img.height * scale;
          console.log('📐 按比例缩放到:', { scale, width: this.editor.canvas.width, height: this.editor.canvas.height });
        }
      } else {
        // 不能找到父元素，使用图片尺寸
        this.editor.canvas.width = img.width;
        this.editor.canvas.height = img.height;
      }
      console.log('✅ Canvas 尺寸已更新:', { width: this.editor.canvas.width, height: this.editor.canvas.height });
    }

    // 创建一个新的图层用于放置导入的图片
    console.log('🎨 创建新图层用于放置导入的图片');
    console.log('📐 图层尺寸参数:', { width: img.width, height: img.height });

    const newLayer = new Layer({
      name: filename || 'Imported Image',
      width: img.width,
      height: img.height
    });

    console.log('✅ 图层创建完成:', {
      id: newLayer.id,
      name: newLayer.name,
      width: newLayer.width,
      height: newLayer.height,
      canvasWidth: newLayer.canvas?.width,
      canvasHeight: newLayer.canvas?.height
    });

    // 在新图层的 canvas 上绘制图片
    console.log('🖌️ 准备在图层上绘制图片');
    const layerCtx = newLayer.getContext();
    if (!layerCtx) {
      console.error('❌ 无法获取图层 context，图层状态:', {
        hasCanvas: !!newLayer.canvas,
        canvasWidth: newLayer.canvas?.width,
        canvasHeight: newLayer.canvas?.height
      });
      throw new Error('图层初始化失败：无法获取绘图上下文');
    }

    console.log('✅ 成功获取图层上下文');

    // 计算缩放比例
    const canvasArea = this.editor.canvas.parentElement;
    let drawWidth = img.width;
    let drawHeight = img.height;

    if (canvasArea) {
      const maxWidth = canvasArea.clientWidth;
      const maxHeight = canvasArea.clientHeight;

      if (img.width > maxWidth || img.height > maxHeight) {
        const scaleX = maxWidth / img.width;
        const scaleY = maxHeight / img.height;
        const scale = Math.min(scaleX, scaleY, 1);

        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        console.log('📐 敬画需要缩放：', { scale, drawWidth, drawHeight });
      }
    }

    // 在图层canvas上缩放绘制图片
    layerCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
    console.log('✅ 图片已绘制到新图层（尺寸: ' + drawWidth + ' x ' + drawHeight + '）');

    // 将新图层添加到文档中
    console.log('📄 将图层添加到文档');
    this.editor.document.addLayer(newLayer);
    console.log('✅ 新图层已添加到文档');

     // 重置渲染器视口以适应新尺寸
     if (this.editor.renderer && this.editor.renderer.viewport) {
       console.log('🔄 重置渲染器视口');
       // 复位视口的位置和缩放
       this.editor.renderer.viewport.x = 0;
       this.editor.renderer.viewport.y = 0;
       this.editor.renderer.viewport.scale = 1.0;
       console.log('✅ 视口已重置');
     }

    // 渲染编辑器
    if (this.editor.render) {
      console.log('🎨 调用 editor.render()');
      console.log('📊 渲染前状态:', {
        documentWidth: this.editor.document?.width,
        documentHeight: this.editor.document?.height,
        canvasWidth: this.editor.canvas?.width,
        canvasHeight: this.editor.canvas?.height,
        layerCount: this.editor.document?.layers?.length
      });
      this.editor.render();
      console.log('✅ render() 调用完成');
    } else {
      console.warn('⚠️ 编辑器没有 render 方法');
    }

    // 更新编辑器状态
    if (this.editor.isDirty !== undefined) {
      this.editor.isDirty = true;
      console.log('✅ 编辑器状态标记为脏数据');
    }

    // 更新UI（始放全局函数的控件）
    if (typeof updateLayersList === 'function') {
      updateLayersList();
      console.log('✅ 图层列表已更新');
    }
  }

  /**
   * 显示错误消息
   */
  _showError(message) {
    console.error('显示错误消息:', message);
    alert(`错误: ${message}`);
  }

  /**
   * 显示进度提示
   */
  _showProgress(message) {
    console.log('进度:', message);
    // 这里可以添加更友好的进度显示，暂时使用控制台日志
  }
}

