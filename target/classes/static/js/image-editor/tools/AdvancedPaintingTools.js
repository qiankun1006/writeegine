/**
 * 克隆工具 - Clone Tool (Stamp)
 * 复制图像的一部分到其他位置
 */
class CloneTool extends Tool {
  constructor() {
    super({
      id: 'clone',
      name: '克隆',
      icon: '📋',
      cursor: 'crosshair',
      category: 'painting',
      options: {
        size: 20,
        opacity: 1.0,
        hardness: 100,
        alignMode: 'aligned' // aligned 或 fixed
      }
    });

    this.isDrawing = false;
    this.sourceX = null;
    this.sourceY = null;
    this.sourceSet = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  activate(editor) {
    super.activate(editor);
    alert('克隆工具：先 Alt+点击 设置源点，然后绘制进行克隆');
  }

  onMouseDown(e, editor) {
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    // Alt+点击设置源点
    if (e.altKey) {
      this.sourceX = x;
      this.sourceY = y;
      this.sourceSet = true;
      return;
    }

    if (!this.sourceSet) {
      alert('请先按 Alt+点击 设置克隆源点');
      return;
    }

    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;

    const layer = editor.getSelectedLayer();
    if (layer) {
      this.strokeStartImageData = layer.canvas
        .getContext('2d')
        .getImageData(0, 0, layer.width, layer.height);
    }
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing || !this.sourceSet) return;

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    this._cloneStroke(layer, this.lastX, this.lastY, x, y);

    this.lastX = x;
    this.lastY = y;

    editor.render();
  }

  onMouseUp(e, editor) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const layer = editor.getSelectedLayer();
      if (layer && this.strokeStartImageData) {
        const currentImageData = layer.canvas
          .getContext('2d')
          .getImageData(0, 0, layer.width, layer.height);

        const command = new DrawCommand(layer, currentImageData, this.strokeStartImageData);
        commandHistory.execute(command);
      }

      this.strokeStartImageData = null;
    }
  }

  _cloneStroke(layer, fromX, fromY, toX, toY) {
    const ctx = layer.getContext();
    const source = layer.canvas;

    // 关键修复：将世界坐标转换为图层本地坐标
    const localToX = toX - layer.x;
    const localToY = toY - layer.y;
    const localSourceX = this.sourceX - layer.x;
    const localSourceY = this.sourceY - layer.y;

    const dx = toX - fromX;
    const dy = toY - fromY;

    // 设置笔刷参数
    ctx.globalAlpha = this.options.opacity;
    ctx.globalCompositeOperation = 'source-over';

    // 从源点复制像素
    const sourceData = source.getContext('2d').getImageData(
      Math.round(localSourceX),
      Math.round(localSourceY),
      Math.round(this.options.size),
      Math.round(this.options.size)
    );

    // 绘制到目标位置
    ctx.putImageData(sourceData, Math.round(localToX - this.options.size / 2), Math.round(localToY - this.options.size / 2));

    ctx.globalAlpha = 1.0;

    // 更新源点（aligned 模式）
    if (this.options.alignMode === 'aligned') {
      this.sourceX += dx;
      this.sourceY += dy;
    }
  }
}

/**
 * 修复工具 - Healing Tool
 * 复制源区域并与周围内容混合，实现无缝修复
 */
class HealingTool extends Tool {
  constructor() {
    super({
      id: 'healing',
      name: '修复',
      icon: '🏥',
      cursor: 'crosshair',
      category: 'painting',
      options: {
        size: 20,
        opacity: 1.0,
        hardness: 100,
        blendMode: 'normal'
      }
    });

    this.isDrawing = false;
    this.sourceX = null;
    this.sourceY = null;
    this.sourceSet = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  activate(editor) {
    super.activate(editor);
    alert('修复工具：先 Alt+点击 设置源点，然后绘制进行修复');
  }

  onMouseDown(e, editor) {
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    if (e.altKey) {
      this.sourceX = x;
      this.sourceY = y;
      this.sourceSet = true;
      return;
    }

    if (!this.sourceSet) {
      alert('请先按 Alt+点击 设置修复源点');
      return;
    }

    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;

    const layer = editor.getSelectedLayer();
    if (layer) {
      this.strokeStartImageData = layer.canvas
        .getContext('2d')
        .getImageData(0, 0, layer.width, layer.height);
    }
  }

  onMouseMove(e, editor) {
    if (!this.isDrawing || !this.sourceSet) return;

    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;

    this._healStroke(layer, this.lastX, this.lastY, x, y);

    this.lastX = x;
    this.lastY = y;

    editor.render();
  }

  onMouseUp(e, editor) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const layer = editor.getSelectedLayer();
      if (layer && this.strokeStartImageData) {
        const currentImageData = layer.canvas
          .getContext('2d')
          .getImageData(0, 0, layer.width, layer.height);

        const command = new DrawCommand(layer, currentImageData, this.strokeStartImageData);
        commandHistory.execute(command);
      }

      this.strokeStartImageData = null;
    }
  }

  _healStroke(layer, fromX, fromY, toX, toY) {
    const ctx = layer.getContext();
    const size = Math.round(this.options.size);

    // 关键修复：将世界坐标转换为图层本地坐标
    const localToX = toX - layer.x;
    const localToY = toY - layer.y;
    const localSourceX = this.sourceX - layer.x;
    const localSourceY = this.sourceY - layer.y;

    // 获取源区域和目标区域的像素数据
    const sourceImageData = ctx.getImageData(
      Math.round(localSourceX - size / 2),
      Math.round(localSourceY - size / 2),
      size,
      size
    );

    const targetImageData = ctx.getImageData(
      Math.round(localToX - size / 2),
      Math.round(localToY - size / 2),
      size,
      size
    );

    // 计算目标区域的平均颜色
    let avgR = 0, avgG = 0, avgB = 0, count = 0;
    for (let i = 0; i < targetImageData.data.length; i += 4) {
      if (targetImageData.data[i + 3] > 0) {
        avgR += targetImageData.data[i];
        avgG += targetImageData.data[i + 1];
        avgB += targetImageData.data[i + 2];
        count++;
      }
    }

    avgR = Math.round(avgR / count);
    avgG = Math.round(avgG / count);
    avgB = Math.round(avgB / count);

    // 混合源数据和目标背景色
    for (let i = 0; i < sourceImageData.data.length; i += 4) {
      const opacity = this.options.opacity;
      sourceImageData.data[i] = Math.round(sourceImageData.data[i] + (avgR - sourceImageData.data[i]) * (1 - opacity));
      sourceImageData.data[i + 1] = Math.round(sourceImageData.data[i + 1] + (avgG - sourceImageData.data[i + 1]) * (1 - opacity));
      sourceImageData.data[i + 2] = Math.round(sourceImageData.data[i + 2] + (avgB - sourceImageData.data[i + 2]) * (1 - opacity));
    }

    // 绘制修复结果
    ctx.putImageData(sourceImageData, Math.round(localToX - size / 2), Math.round(localToY - size / 2));
  }
}

/**
 * 喷枪工具 - Spray Paint Tool
 * 模拟喷罐效果，产生点状绘制
 */
class SprayTool extends Tool {
  constructor() {
    super({
      id: 'spray',
      name: '喷枪',
      icon: '💨',
      cursor: 'crosshair',
      category: 'painting',
      options: {
        size: 30,
        opacity: 0.3,
        density: 0.6,     // 喷点密度 0-1
        color: '#000000',
        flow: 0.5         // 喷枪流量
      }
    });

    this.isDrawing = false;
    this.sprayInterval = null;
  }

  onMouseDown(e, editor) {
    this.isDrawing = true;

    const layer = editor.getSelectedLayer();
    if (layer) {
      this.strokeStartImageData = layer.canvas
        .getContext('2d')
        .getImageData(0, 0, layer.width, layer.height);
    }

    // 持续喷射
    this.sprayInterval = setInterval(() => {
      if (this.isDrawing) {
        this._spray(editor, e);
      }
    }, 50);
  }

  onMouseMove(e, editor) {
    // 喷枪在按下时自动喷射，移动时更新位置
  }

  onMouseUp(e, editor) {
    clearInterval(this.sprayInterval);
    this.isDrawing = false;

    const layer = editor.getSelectedLayer();
    if (layer && this.strokeStartImageData) {
      const currentImageData = layer.canvas
        .getContext('2d')
        .getImageData(0, 0, layer.width, layer.height);

      const command = new DrawCommand(layer, currentImageData, this.strokeStartImageData);
      commandHistory.execute(command);
    }

    this.strokeStartImageData = null;
  }

  _spray(editor, e) {
    const layer = editor.getSelectedLayer();
    if (!layer) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    // 关键修复：将世界坐标转换为图层本地坐标
    const localX = coords.x - layer.x;
    const localY = coords.y - layer.y;

    const ctx = layer.getContext();

    ctx.fillStyle = this.options.color;
    ctx.globalAlpha = this.options.opacity * this.options.flow;

    const size = this.options.size;
    const density = this.options.density;
    const particleCount = Math.round(size * density);

    // 生成随机喷点
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * size / 2;
      const px = localX + Math.cos(angle) * distance;
      const py = localY + Math.sin(angle) * distance;
      const particleSize = Math.random() * 2 + 0.5;

      ctx.fillRect(px, py, particleSize, particleSize);
    }

    ctx.globalAlpha = 1.0;
    editor.render();
  }
}

