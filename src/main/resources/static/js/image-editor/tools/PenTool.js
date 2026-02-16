/**
 * 钢笔工具 - Pen Tool
 * 创建可编辑的矢量路径
 */
class PenTool extends Tool {
  constructor() {
    super({
      id: 'pen',
      name: '钢笔',
      icon: '✒️',
      cursor: 'crosshair',
      category: 'path',
      options: {
        strokeWidth: 2,
        strokeColor: '#000000',
        fillColor: 'none'
      }
    });

    this.currentPath = [];
    this.paths = [];
    this.isDrawing = false;
  }

  activate(editor) {
    super.activate(editor);
    alert('钢笔工具：点击创建路径点，双击完成路径。Ctrl+点击可以删除点。');
  }

  onMouseDown(e, editor) {
    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);

    // Ctrl+点击删除最后的点
    if (e.ctrlKey && this.currentPath.length > 0) {
      this.currentPath.pop();
      this._drawPaths(editor);
      return;
    }

    // 添加新的路径点
    this.currentPath.push({
      x: coords.x,
      y: coords.y,
      control1: null,
      control2: null
    });

    this.isDrawing = true;
    this._drawPaths(editor);
  }

  onMouseMove(e, editor) {
    // 实时显示预览
    this._drawPaths(editor);
  }

  onDoubleClick(e, editor) {
    // 完成当前路径
    if (this.currentPath.length > 0) {
      this.paths.push([...this.currentPath]);
      this.currentPath = [];
      this._drawPaths(editor);
    }
  }

  /**
   * 绘制所有路径
   */
  _drawPaths(editor) {
    const ctx = editor.renderer.ctx;
    ctx.save();

    // 应用视口变换
    ctx.translate(editor.renderer.viewport.x, editor.renderer.viewport.y);
    ctx.scale(editor.renderer.viewport.scale, editor.renderer.viewport.scale);

    // 绘制已完成的路径
    this.paths.forEach(path => this._drawPath(ctx, path, true));

    // 绘制当前路径
    if (this.currentPath.length > 0) {
      this._drawPath(ctx, this.currentPath, false);
    }

    ctx.restore();
  }

  /**
   * 绘制单条路径
   */
  _drawPath(ctx, path, finished) {
    if (path.length === 0) return;

    ctx.strokeStyle = this.options.strokeColor;
    ctx.lineWidth = this.options.strokeWidth;
    ctx.fillStyle = this.options.fillColor;
    ctx.setLineDash(finished ? [] : [5, 5]);

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
      if (path[i].control1) {
        ctx.bezierCurveTo(
          path[i].control1.x, path[i].control1.y,
          path[i].control2.x, path[i].control2.y,
          path[i].x, path[i].y
        );
      } else {
        ctx.lineTo(path[i].x, path[i].y);
      }
    }

    if (finished) {
      ctx.closePath();
      ctx.stroke();
      if (this.options.fillColor !== 'none') {
        ctx.fill();
      }
    } else {
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // 绘制控制点
    path.forEach(point => {
      ctx.fillStyle = '#0099ff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * 将路径转换为选区
   */
  pathToSelection(editor) {
    if (this.currentPath.length < 3) {
      alert('需要至少 3 个点来创建选区');
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.currentPath.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    editor.renderer.setSelection(minX, minY, width, height);
    editor.render();

    eventBus.emit('pathToSelectionComplete');
  }
}

/**
 * 选区操作助手 - Selection Operations Helper
 * 处理选区的添加、减去、相交等操作
 */
class SelectionOperations {
  /**
   * 选区操作模式
   */
  static MODES = {
    REPLACE: 'replace',      // 替换
    ADD: 'add',              // 添加
    SUBTRACT: 'subtract',    // 减去
    INTERSECT: 'intersect'   // 相交
  };

  /**
   * 合并两个选区
   */
  static mergeSelections(selection1, selection2, mode) {
    if (!selection1 || !selection2) return selection1 || selection2;

    switch (mode) {
      case this.MODES.REPLACE:
        return selection2;

      case this.MODES.ADD:
        // 取两个选区的并集
        return {
          x: Math.min(selection1.x, selection2.x),
          y: Math.min(selection1.y, selection2.y),
          width: Math.max(selection1.x + selection1.width, selection2.x + selection2.width) - Math.min(selection1.x, selection2.x),
          height: Math.max(selection1.y + selection1.height, selection2.y + selection2.height) - Math.min(selection1.y, selection2.y)
        };

      case this.MODES.SUBTRACT:
        // 从第一个选区中减去第二个
        // 这是一个简化的实现
        return selection1;

      case this.MODES.INTERSECT:
        // 取两个选区的交集
        const left = Math.max(selection1.x, selection2.x);
        const top = Math.max(selection1.y, selection2.y);
        const right = Math.min(selection1.x + selection1.width, selection2.x + selection2.width);
        const bottom = Math.min(selection1.y + selection1.height, selection2.y + selection2.height);

        if (left < right && top < bottom) {
          return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
          };
        }
        return null;

      default:
        return selection1;
    }
  }

  /**
   * 羽化选区（使选区边缘柔和）
   */
  static featherSelection(selection, radius) {
    if (!selection || radius <= 0) return selection;

    // 这里应该对选区的边缘进行羽化处理
    // 简化实现：扩大选区半径
    return {
      x: selection.x - radius,
      y: selection.y - radius,
      width: selection.width + radius * 2,
      height: selection.height + radius * 2
    };
  }

  /**
   * 反向选区
   */
  static invertSelection(selection, canvasWidth, canvasHeight) {
    if (!selection) {
      // 全选反向变为无选区
      return null;
    }

    // 返回整个画布减去当前选区
    // 简化实现
    return {
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight
    };
  }

  /**
   * 扩展选区
   */
  static expandSelection(selection, amount) {
    if (!selection || amount === 0) return selection;

    return {
      x: selection.x - amount,
      y: selection.y - amount,
      width: selection.width + amount * 2,
      height: selection.height + amount * 2
    };
  }

  /**
   * 收缩选区
   */
  static shrinkSelection(selection, amount) {
    if (!selection || amount === 0) return selection;

    const newX = selection.x + amount;
    const newY = selection.y + amount;
    const newWidth = Math.max(0, selection.width - amount * 2);
    const newHeight = Math.max(0, selection.height - amount * 2);

    if (newWidth === 0 || newHeight === 0) return null;

    return {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    };
  }
}

