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
    if (!this.fileInput) return;

    this.fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      console.log('📂 文件选择变化，文件:', file);
      if (!file) {
        console.warn('❌ 没有选择文件');
        return;
      }

      console.log('📄 开始读取文件:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target.result;
          console.log('✓ FileReader 读取完成，结果长度:', result.length);

          // 如果是 JSON 文件，加载为文档
          if (file.name.endsWith('.json')) {
            console.log('🔄 检测到 JSON 文件，开始解析');
            const json = JSON.parse(result);
            if (this.editor.loadDocument) {
              await this.editor.loadDocument(json);
              console.log('✓ JSON 文档加载完成');
            } else {
              console.warn('Editor does not support loadDocument method');
            }
          }
          // 如果是图片文件，加载图片
          else if (file.type.startsWith('image/')) {
            console.log('🖼️ 检测到图片文件，开始加载');
            const img = new Image();

            img.onload = () => {
              console.log('✓ 图片加载成功:', {
                width: img.width,
                height: img.height,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
              });

              // 检查编辑器是否存在
              if (!this.editor || !this.editor.document) {
                console.error('❌ 编辑器或文档不存在');
                alert('编辑器初始化失败，请刷新页面');
                return;
              }

              // 关键：先更新文档尺寸，再添加图片图层
              console.log('📐 更新文档尺寸:', { width: img.width, height: img.height });
              this.editor.document.width = img.width;
              this.editor.document.height = img.height;

              // 更新 canvas 尺寸以匹配文档
              if (this.editor.canvas) {
                this.editor.canvas.width = img.width;
                this.editor.canvas.height = img.height;
                console.log('✓ Canvas 尺寸已更新');
              }

              // 创建一个新的图层用于放置导入的图片
              console.log('🎨 创建新图层用于放置导入的图片');
              const newLayer = new Layer({
                name: file.name || 'Imported Image',
                width: img.width,
                height: img.height
              });

              // 在新图层的 canvas 上绘制图片
              const layerCtx = newLayer.getContext();
              if (!layerCtx) {
                console.error('❌ 无法获取图层 context');
                alert('图层初始化失败');
                return;
              }

              layerCtx.drawImage(img, 0, 0);
              console.log('✓ 图片已绘制到新图层');

              // 将新图层添加到文档中，替换背景层
              if (this.editor.document.layers.length > 0) {
                // 如果已有图层，添加到最上面
                this.editor.document.addLayer(newLayer);
              } else {
                // 否则作为第一个图层
                this.editor.document.addLayer(newLayer);
              }
              console.log('✓ 新图层已添加到文档');

              // 渲染编辑器
              if (this.editor.render) {
                console.log('🎨 调用 editor.render()');
                this.editor.render();
              } else {
                console.warn('⚠️ 编辑器没有 render 方法');
              }

              // 更新编辑器状态
              if (this.editor.isDirty !== undefined) {
                this.editor.isDirty = true;
                console.log('✓ 编辑器状态标记为脏数据');
              }

              console.log('%c✓✓✓ 图片导入完成！✓✓✓', 'color: green; font-weight: bold; font-size: 14px');
            };

            img.onerror = (error) => {
              console.error('❌ 图片加载失败:', {
                error: error,
                src: img.src ? img.src.substring(0, 100) : 'N/A'
              });
              alert('图片加载失败，请检查文件');
            };

            img.onabort = () => {
              console.warn('⚠️ 图片加载被中止');
            };

            console.log('🔗 开始设置图片源 (Data URL)');
            img.src = result;
            console.log('✓ 图片源已设置，等待加载...');
          } else {
            console.warn('⚠️ 不支持的文件类型:', file.type);
            alert('不支持的文件类型，请选择图片或 JSON 文件');
          }
        } catch (error) {
          console.error('❌ 文件加载失败:', error);
          console.error('错误堆栈:', error.stack);
          alert('文件加载失败，请检查文件格式');
        }
      };

      reader.onerror = (error) => {
        console.error('❌ FileReader 读取失败:', error);
        alert('文件读取失败，请重试');
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          console.log(`📊 文件读取进度: ${percent}%`);
        }
      };

      // 根据文件类型选择读取方式
      if (file.name.endsWith('.json')) {
        console.log('📖 以文本方式读取文件');
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        console.log('🔍 以 Data URL 方式读取图片');
        reader.readAsDataURL(file);
      } else {
        console.warn('⚠️ 不支持的文件，跳过读取');
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
}

