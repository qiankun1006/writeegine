/**
 * Skin.js - 皮肤网格类
 *
 * 管理顶点绑定到骨骼的权重系统
 * 实现权重的蒙皮顶点变换
 */

class Skin {
  constructor() {
    this.vertices = [];           // 顶点数组 {x, y, u, v}
    this.indices = [];            // 三角形索引数组
    this.weights = [];            // 权重数组 [{vertexIndex, boneId, weight}]
    this.boneIndices = new Map(); // vertexIndex -> [{boneId, weight}]

    // 渲染相关的缓存
    this.transformedVertices = []; // 变换后的顶点
    this.needsUpdate = true;
  }

  /**
   * 添加顶点
   */
  addVertex(x, y, u = 0, v = 0) {
    const index = this.vertices.length;
    this.vertices.push({ x, y, u, v });
    this.transformedVertices.push({ x, y, u, v });
    return index;
  }

  /**
   * 添加三角形索引
   */
  addTriangle(a, b, c) {
    this.indices.push(a, b, c);
  }

  /**
   * 绑定顶点到骨骼
   */
  bindVertex(vertexIndex, boneId, weight) {
    if (!this.boneIndices.has(vertexIndex)) {
      this.boneIndices.set(vertexIndex, []);
    }

    const bindings = this.boneIndices.get(vertexIndex);
    bindings.push({ boneId, weight });

    // 按权重排序（可选）
    bindings.sort((a, b) => b.weight - a.weight);

    this.needsUpdate = true;
  }

  /**
   * 获取顶点的骨骼绑定
   */
  getVertexBindings(vertexIndex) {
    return this.boneIndices.get(vertexIndex) || [];
  }

  /**
   * 更新皮肤变换
   */
  update(skeleton) {
    if (!skeleton) return;

    // 对每个顶点应用骨骼变换
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      const bindings = this.getVertexBindings(i);

      if (bindings.length === 0) {
        // 没有绑定的顶点保持原位
        this.transformedVertices[i] = { ...vertex };
        continue;
      }

      // 应用加权变换
      let x = 0;
      let y = 0;
      let totalWeight = 0;

      for (const binding of bindings) {
        const bone = skeleton.getBone(binding.boneId);
        if (bone) {
          const weight = binding.weight;
          totalWeight += weight;

          // 应用骨骼的世界变换
          const transformed = bone.worldMatrix.transform(vertex.x, vertex.y);
          x += transformed[0] * weight;
          y += transformed[1] * weight;
        }
      }

      // 归一化（防止权重和不为1）
      if (totalWeight > 0) {
        x /= totalWeight;
        y /= totalWeight;
      }

      this.transformedVertices[i] = {
        x: x,
        y: y,
        u: vertex.u,
        v: vertex.v
      };
    }

    this.needsUpdate = false;
  }

  /**
   * 渲染皮肤
   */
  render(ctx, texture = null) {
    if (this.needsUpdate) {
      console.warn('Skin: 需要先调用 update() 方法');
      return;
    }

    const transformed = this.transformedVertices;

    // 绘制三角形
    for (let i = 0; i < this.indices.length; i += 3) {
      const a = this.indices[i];
      const b = this.indices[i + 1];
      const c = this.indices[i + 2];

      if (a >= transformed.length || b >= transformed.length || c >= transformed.length) {
        continue;
      }

      const va = transformed[a];
      const vb = transformed[b];
      const vc = transformed[c];

      ctx.beginPath();
      ctx.moveTo(va.x, va.y);
      ctx.lineTo(vb.x, vb.y);
      ctx.lineTo(vc.x, vc.y);
      ctx.closePath();

      // 填充
      if (texture) {
        // 如果有纹理，使用纹理（这里简化处理）
        ctx.fillStyle = '#0088ff';
      } else {
        ctx.fillStyle = '#0088ff';
      }
      ctx.fill();

      // 描边
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /**
   * 渲染线框模式
   */
  renderWireframe(ctx) {
    if (this.needsUpdate) {
      console.warn('Skin: 需要先调用 update() 方法');
      return;
    }

    const transformed = this.transformedVertices;

    // 绘制三角形线框
    for (let i = 0; i < this.indices.length; i += 3) {
      const a = this.indices[i];
      const b = this.indices[i + 1];
      const c = this.indices[i + 2];

      if (a >= transformed.length || b >= transformed.length || c >= transformed.length) {
        continue;
      }

      const va = transformed[a];
      const vb = transformed[b];
      const vc = transformed[c];

      ctx.beginPath();
      ctx.moveTo(va.x, va.y);
      ctx.lineTo(vb.x, vb.y);
      ctx.lineTo(vc.x, vc.y);
      ctx.closePath();

      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 绘制顶点
    for (const vertex of transformed) {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffaa00';
      ctx.fill();
    }
  }

  /**
   * 渲染顶点（调试用）
   */
  renderVertices(ctx, options = {}) {
    if (this.needsUpdate) {
      console.warn('Skin: 需要先调用 update() 方法');
      return;
    }

    const {
      showIndices = false,
      showCoords = false,
      showBindings = false,
      vertexRadius = 4,
      font = '10px monospace'
    } = options;

    const transformed = this.transformedVertices;

    // 绘制每个顶点
    for (let i = 0; i < transformed.length; i++) {
      const vertex = transformed[i];

      // 绘制顶点圆圈
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, vertexRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6600';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 显示顶点索引
      if (showIndices) {
        ctx.fillStyle = '#ffffff';
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(i.toString(), vertex.x, vertex.y - vertexRadius - 2);
      }

      // 显示顶点坐标
      if (showCoords) {
        ctx.fillStyle = '#ffff00';
        ctx.font = font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`(${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})`, vertex.x + vertexRadius + 2, vertex.y);
      }

      // 显示骨骼绑定信息
      if (showBindings) {
        const bindings = this.getVertexBindings(i);
        if (bindings.length > 0) {
          let bindingText = bindings.map(b => `B${b.boneId}:${(b.weight * 100).toFixed(0)}%`).join(' ');
          ctx.fillStyle = '#00ffff';
          ctx.font = font;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(bindingText, vertex.x + vertexRadius + 2, vertex.y + 12);
        }
      }
    }
  }

  /**
   * 渲染权重颜色可视化（调试用）
   * 根据顶点绑定的骨骼显示不同颜色
   */
  renderWeights(ctx, skeleton, options = {}) {
    if (this.needsUpdate) {
      console.warn('Skin: 需要先调用 update() 方法');
      return;
    }

    const {
      colorByBone = true,  // 是否按骨骼着色
      showWeightValue = false  // 是否显示权重数值
    } = options;

    const transformed = this.transformedVertices;

    // 为每个骨骼分配一个颜色
    const boneColors = new Map();
    const boneList = skeleton.getAllBones();

    boneList.forEach((bone, index) => {
      // 使用 HSL 颜色循环生成不同的颜色
      const hue = (index * 137.5) % 360; // 黄金角度分布
      boneColors.set(bone.id, `hsl(${hue}, 80%, 50%)`);
    });

    // 绘制每个顶点
    for (let i = 0; i < transformed.length; i++) {
      const vertex = transformed[i];
      const bindings = this.getVertexBindings(i);

      if (bindings.length === 0) {
        // 没有绑定的顶点显示为灰色
        ctx.fillStyle = '#666666';
      } else if (colorByBone) {
        // 按主要骨骼的权重着色
        const primaryBinding = bindings[0];
        ctx.fillStyle = boneColors.get(primaryBinding.boneId) || '#ff0000';
      } else {
        // 按权重强度着色（权重越高越亮）
        const weightSum = bindings.reduce((sum, b) => sum + b.weight, 0);
        const intensity = Math.min(1, weightSum);
        ctx.fillStyle = `rgba(255, ${Math.floor(intensity * 255)}, ${Math.floor(intensity * 100)}, 0.8)`;
      }

      // 绘制顶点
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 显示权重数值
      if (showWeightValue && bindings.length > 0) {
        const weightText = bindings.map(b => `B${b.boneId}:${(b.weight * 100).toFixed(0)}%`).join('\n');
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // 多行文本
        const lines = weightText.split('\n');
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, vertex.x + 7, vertex.y + lineIndex * 11);
        });
      }
    }

    // 绘制图例
    this._renderWeightLegend(ctx, boneColors, boneList);
  }

  /**
   * 渲染权重图例（调试用）
   */
  _renderWeightLegend(ctx, boneColors, boneList) {
    const legendX = 20;
    const legendY = 80;
    const itemHeight = 20;
    const itemWidth = 15;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(legendX - 5, legendY - 5, 150, boneList.length * itemHeight + 10);

    boneList.forEach((bone, index) => {
      const y = legendY + index * itemHeight;

      // 颜色块
      ctx.fillStyle = boneColors.get(bone.id) || '#ff0000';
      ctx.fillRect(legendX, y, itemWidth, itemHeight - 2);

      // 骨骼名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(bone.name, legendX + itemWidth + 5, y + itemHeight / 2);
    });

    ctx.restore();
  }

  /**
   * 渲染权重颜色可视化（调试用）
   * 根据顶点绑定的骨骼显示不同颜色
   */
  renderWeights(ctx, skeleton, options = {}) {
    if (this.needsUpdate) {
      console.warn('Skin: 需要先调用 update() 方法');
      return;
    }

    const {
      colorByBone = true,  // 是否按骨骼着色
      showWeightValue = false  // 是否显示权重数值
    } = options;

    const transformed = this.transformedVertices;

    // 为每个骨骼分配一个颜色
    const boneColors = new Map();
    const boneList = skeleton.getAllBones();

    boneList.forEach((bone, index) => {
      // 使用 HSL 颜色循环生成不同的颜色
      const hue = (index * 137.5) % 360; // 黄金角度分布
      boneColors.set(bone.id, `hsl(${hue}, 80%, 50%)`);
    });

    // 绘制每个顶点
    for (let i = 0; i < transformed.length; i++) {
      const vertex = transformed[i];
      const bindings = this.getVertexBindings(i);

      if (bindings.length === 0) {
        // 没有绑定的顶点显示为灰色
        ctx.fillStyle = '#666666';
      } else if (colorByBone) {
        // 按主要骨骼的权重着色
        const primaryBinding = bindings[0];
        ctx.fillStyle = boneColors.get(primaryBinding.boneId) || '#ff0000';
      } else {
        // 按权重强度着色（权重越高越亮）
        const weightSum = bindings.reduce((sum, b) => sum + b.weight, 0);
        const intensity = Math.min(1, weightSum);
        ctx.fillStyle = `rgba(255, ${Math.floor(intensity * 255)}, ${Math.floor(intensity * 100)}, 0.8)`;
      }

      // 绘制顶点
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 显示权重数值
      if (showWeightValue && bindings.length > 0) {
        const weightText = bindings.map(b => `B${b.boneId}:${(b.weight * 100).toFixed(0)}%`).join('\n');
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // 多行文本
        const lines = weightText.split('\n');
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, vertex.x + 7, vertex.y + lineIndex * 11);
        });
      }
    }

    // 绘制图例
    this._renderWeightLegend(ctx, boneColors, boneList);
  }

  /**
   * 渲染权重图例（调试用）
   */
  _renderWeightLegend(ctx, boneColors, boneList) {
    const legendX = 20;
    const legendY = 80;
    const itemHeight = 20;
    const itemWidth = 15;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(legendX - 5, legendY - 5, 150, boneList.length * itemHeight + 10);

    boneList.forEach((bone, index) => {
      const y = legendY + index * itemHeight;

      // 颜色块
      ctx.fillStyle = boneColors.get(bone.id) || '#ff0000';
      ctx.fillRect(legendX, y, itemWidth, itemHeight - 2);

      // 骨骼名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(bone.name, legendX + itemWidth + 5, y + itemHeight / 2);
    });

    ctx.restore();
  }

  /**
   * 序列化
   */
  serialize() {
    return {
      vertices: this.vertices,
      indices: this.indices,
      weights: Array.from(this.boneIndices.entries())
    };
  }

  /**
   * 反序列化
   */
  static deserialize(data) {
    const skin = new Skin();
    skin.vertices = data.vertices || [];
    skin.indices = data.indices || [];

    if (data.weights) {
      for (const [vertexIndex, bindings] of data.weights) {
        skin.boneIndices.set(vertexIndex, bindings);
      }
    }

    skin.needsUpdate = true;
    return skin;
  }

  /**
   * 清空所有数据
   */
  clear() {
    this.vertices = [];
    this.indices = [];
    this.weights = [];
    this.boneIndices.clear();
    this.transformedVertices = [];
    this.needsUpdate = true;
  }

  /**
   * 创建简单的矩形网格（用于测试）
   */
  static createRectangle(x, y, width, height, segmentsX = 1, segmentsY = 1) {
    const skin = new Skin();

    const stepX = width / segmentsX;
    const stepY = height / segmentsY;

    // 创建顶点
    for (let j = 0; j <= segmentsY; j++) {
      for (let i = 0; i <= segmentsX; i++) {
        const vx = x + i * stepX;
        const vy = y + j * stepY;
        const u = i / segmentsX;
        const v = j / segmentsY;
        skin.addVertex(vx, vy, u, v);
      }
    }

    // 创建三角形
    for (let j = 0; j < segmentsY; j++) {
      for (let i = 0; i < segmentsX; i++) {
        const topLeft = j * (segmentsX + 1) + i;
        const topRight = topLeft + 1;
        const bottomLeft = (j + 1) * (segmentsX + 1) + i;
        const bottomRight = bottomLeft + 1;

        // 第一个三角形
        skin.addTriangle(topLeft, bottomLeft, topRight);
        // 第二个三角形
        skin.addTriangle(topRight, bottomLeft, bottomRight);
      }
    }

    return skin;
  }
}

