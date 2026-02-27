/**
 * 碰撞体编辑器 - 用于恶魔城/横版游戏编辑器
 * 提供碰撞体创建、编辑和可视化功能
 */

class CollisionBodyEditor {
  constructor(gridSystem) {
    this.gridSystem = gridSystem;
    this.collisionBodies = []; // 碰撞体数组
    this.selectedBody = null;
    this.isCreating = false;
    this.createType = 'box'; // box, circle, polygon
    this.tempPoints = []; // 创建多边形时的临时点
    this.showColliders = true;
    this.colliderColor = 'rgba(255, 193, 7, 0.5)';
    this.colliderBorder = 'rgba(255, 193, 7, 1)';
  }

  /**
   * 创建碰撞体
   */
  createCollisionBody(config) {
    const body = {
      id: `collider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: config.type || 'box',
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 32,
      height: config.height || 32,
      radius: config.radius || 16,
      points: config.points || [], // 多边形顶点
      isTrigger: config.isTrigger || false,
      physicsMaterial: config.physicsMaterial || {
        friction: 0.5,
        restitution: 0.2,
        density: 1.0
      }
    };

    this.collisionBodies.push(body);
    return body;
  }

  /**
   * 删除碰撞体
   */
  deleteCollisionBody(bodyId) {
    const index = this.collisionBodies.findIndex(b => b.id === bodyId);
    if (index > -1) {
      if (this.selectedBody === this.collisionBodies[index]) {
        this.selectedBody = null;
      }
      this.collisionBodies.splice(index, 1);
    }
  }

  /**
   * 选择碰撞体
   */
  selectCollisionBody(bodyId) {
    this.selectedBody = this.collisionBodies.find(b => b.id === bodyId);
  }

  /**
   * 获取指定位置的碰撞体
   */
  getCollisionBodyAt(x, y) {
    for (let i = this.collisionBodies.length - 1; i >= 0; i--) {
      const body = this.collisionBodies[i];
      if (this.isPointInCollisionBody(x, y, body)) {
        return body;
      }
    }
    return null;
  }

  /**
   * 检查点是否在碰撞体内
   */
  isPointInCollisionBody(x, y, body) {
    switch (body.type) {
      case 'box':
        return Canvas2DUtils.pointInRect(x, y, body.x, body.y, body.width, body.height);
      case 'circle':
        return Canvas2DUtils.pointInCircle(x, y, body.x, body.y, body.radius);
      case 'polygon':
        return this.isPointInPolygon(x, y, body.points);
      default:
        return false;
    }
  }

  /**
   * 检查点是否在多边形内（射线法）
   */
  isPointInPolygon(x, y, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * 更新碰撞体属性
   */
  updateCollisionBody(bodyId, updates) {
    const body = this.collisionBodies.find(b => b.id === bodyId);
    if (body) {
      Object.assign(body, updates);
    }
  }

  /**
   * 绘制所有碰撞体
   */
  draw(ctx) {
    if (!this.showColliders) return;

    ctx.save();

    for (const body of this.collisionBodies) {
      const isSelected = body === this.selectedBody;

      // 设置样式
      ctx.fillStyle = this.colliderColor;
      ctx.strokeStyle = isSelected ? '#2196f3' : this.colliderBorder;
      ctx.lineWidth = isSelected ? 3 : 2;

      // 绘制碰撞体
      switch (body.type) {
        case 'box':
          this.drawBoxCollider(ctx, body);
          break;
        case 'circle':
          this.drawCircleCollider(ctx, body);
          break;
        case 'polygon':
          this.drawPolygonCollider(ctx, body);
          break;
      }

      // 绘制触发器标识
      if (body.isTrigger) {
        ctx.fillStyle = '#ff5722';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('T', body.x + (body.width || body.radius) / 2, body.y + (body.height || body.radius) / 2 + 4);
      }
    }

    ctx.restore();
  }

  /**
   * 绘制盒子碰撞体
   */
  drawBoxCollider(ctx, body) {
    ctx.fillRect(body.x, body.y, body.width, body.height);
    ctx.strokeRect(body.x, body.y, body.width, body.height);

    // 绘制角点
    ctx.fillStyle = '#fff';
    const corners = [
      { x: body.x, y: body.y },
      { x: body.x + body.width, y: body.y },
      { x: body.x + body.width, y: body.y + body.height },
      { x: body.x, y: body.y + body.height }
    ];
    for (const corner of corners) {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 绘制圆形碰撞体
   */
  drawCircleCollider(ctx, body) {
    ctx.beginPath();
    ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 绘制圆心和半径线
    ctx.beginPath();
    ctx.arc(body.x, body.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(body.x, body.y);
    ctx.lineTo(body.x + body.radius, body.y);
    ctx.strokeStyle = this.colliderBorder;
    ctx.stroke();
  }

  /**
   * 绘制多边形碰撞体
   */
  drawPolygonCollider(ctx, body) {
    if (body.points.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(body.points[0].x, body.points[0].y);
    for (let i = 1; i < body.points.length; i++) {
      ctx.lineTo(body.points[i].x, body.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制顶点
    ctx.fillStyle = '#fff';
    for (const point of body.points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 设置碰撞体类型
   */
  setCreateType(type) {
    this.createType = type;
  }

  /**
   * 切换碰撞体显示
   */
  toggleColliders() {
    this.showColliders = !this.showColliders;
    return this.showColliders;
  }

  /**
   * 清除所有碰撞体
   */
  clearColliders() {
    this.collisionBodies = [];
    this.selectedBody = null;
  }

  /**
   * 导出碰撞体数据
   */
  exportData() {
    return this.collisionBodies.map(b => ({
      ...b,
      physicsMaterial: { ...b.physicsMaterial }
    }));
  }

  /**
   * 导入碰撞体数据
   */
  importData(data) {
    this.collisionBodies = data.map(b => ({
      ...b,
      physicsMaterial: { ...b.physicsMaterial }
    }));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const boxCount = this.collisionBodies.filter(b => b.type === 'box').length;
    const circleCount = this.collisionBodies.filter(b => b.type === 'circle').length;
    const polygonCount = this.collisionBodies.filter(b => b.type === 'polygon').length;
    const triggerCount = this.collisionBodies.filter(b => b.isTrigger).length;

    return {
      total: this.collisionBodies.length,
      box: boxCount,
      circle: circleCount,
      polygon: polygonCount,
      triggers: triggerCount
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.CollisionBodyEditor = CollisionBodyEditor;
}

