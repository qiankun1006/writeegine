/**
 * 物理预览 - 用于恶魔城/横版游戏编辑器
 * 提供基础物理模拟、刚体编辑和跳跃预览功能
 */

class PhysicsPreview {
  constructor(gridSystem) {
    this.gridSystem = gridSystem;
    this.gravity = 9.8; // 重力加速度 (pixels/s²)
    this.enablePhysics = false; // 是否启用物理模拟
    this.rigidBodies = []; // 刚体数组
    this.selectedBody = null;
    this.platforms = []; // 平台数组
    this.previewCharacter = null; // 预览角色
    this.simulationTime = 0;
    this.lastFrameTime = 0;
    this.timeStep = 1 / 60; // 物理时间步长
  }

  /**
   * 创建刚体
   */
  createRigidBody(config) {
    const body = {
      id: `rigidbody_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: config.type || 'box', // box, circle
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 32,
      height: config.height || 32,
      radius: config.radius || 16,
      rotation: config.rotation || 0,
      velocity: { x: config.velocityX || 0, y: config.velocityY || 0 },
      angularVelocity: config.angularVelocity || 0,
      mass: config.mass || 1.0,
      friction: config.friction || 0.5,
      restitution: config.restitution || 0.2,
      isStatic: config.isStatic || false,
      isSleeping: false
    };

    this.rigidBodies.push(body);
    return body;
  }

  /**
   * 创建平台
   */
  createPlatform(config) {
    const platform = {
      id: `platform_${Date.now()}`,
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 128,
      height: config.height || 16,
      type: config.type || 'solid', // solid, one-way, moving, breakable
      movingAxis: config.movingAxis || 'horizontal', // horizontal, vertical
      movingRange: config.movingRange || 0,
      movingSpeed: config.movingSpeed || 50,
      initialX: config.x || 0,
      initialY: config.y || 0,
      timeOffset: 0
    };

    this.platforms.push(platform);
    return platform;
  }

  /**
   * 创建预览角色
   */
  createPreviewCharacter(x, y) {
    this.previewCharacter = {
      x: x,
      y: y,
      width: 24,
      height: 40,
      velocity: { x: 0, y: 0 },
      isGrounded: false,
      jumpForce: -300,
      moveSpeed: 150,
      jumpCount: 0,
      maxJumps: 2
    };
  }

  /**
   * 启动物理模拟
   */
  startSimulation() {
    this.enablePhysics = true;
    this.lastFrameTime = performance.now();
    console.log('▶️ 物理模拟已启动');
  }

  /**
   * 停止物理模拟
   */
  stopSimulation() {
    this.enablePhysics = false;
    console.log('⏸️ 物理模拟已停止');
  }

  /**
   * 切换物理模拟
   */
  toggleSimulation() {
    if (this.enablePhysics) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
    return this.enablePhysics;
  }

  /**
   * 重置物理模拟
   */
  resetSimulation() {
    this.enablePhysics = false;
    this.simulationTime = 0;

    // 重置刚体速度
    for (const body of this.rigidBodies) {
      body.velocity.x = 0;
      body.velocity.y = 0;
      body.angularVelocity = 0;
      body.isSleeping = false;
    }

    // 重置平台位置
    for (const platform of this.platforms) {
      platform.x = platform.initialX;
      platform.y = platform.initialY;
    }

    // 重置角色
    if (this.previewCharacter) {
      this.previewCharacter.velocity.x = 0;
      this.previewCharacter.velocity.y = 0;
      this.previewCharacter.isGrounded = false;
      this.previewCharacter.jumpCount = 0;
    }
  }

  /**
   * 更新物理模拟
   */
  update(deltaTime) {
    if (!this.enablePhysics) return;

    this.simulationTime += deltaTime;

    // 更新移动平台
    this.updatePlatforms(deltaTime);

    // 更新刚体物理
    this.updateRigidBodies(deltaTime);

    // 更新角色物理
    if (this.previewCharacter) {
      this.updateCharacter(deltaTime);
    }
  }

  /**
   * 更新平台移动
   */
  updatePlatforms(deltaTime) {
    for (const platform of this.platforms) {
      if (platform.movingRange > 0) {
        const time = this.simulationTime + platform.timeOffset;
        const offset = Math.sin(time * platform.movingSpeed * 0.01) * platform.movingRange;

        if (platform.movingAxis === 'horizontal') {
          platform.x = platform.initialX + offset;
        } else {
          platform.y = platform.initialY + offset;
        }
      }
    }
  }

  /**
   * 更新刚体物理
   */
  updateRigidBodies(deltaTime) {
    const dt = this.timeStep;

    for (const body of this.rigidBodies) {
      if (body.isStatic || body.isSleeping) continue;

      // 应用重力
      body.velocity.y += this.gravity * dt;

      // 更新位置
      body.x += body.velocity.x * dt;
      body.y += body.velocity.y * dt;

      // 更新旋转
      body.rotation += body.angularVelocity * dt;

      // 应用摩擦力
      body.velocity.x *= (1 - body.friction * dt);
      body.angularVelocity *= (1 - body.friction * dt);

      // 地面碰撞检测（简单版）
      if (body.y > 1000) {
        body.y = 1000;
        body.velocity.y = 0;
      }

      // 平台碰撞检测
      this.checkPlatformCollision(body);
    }
  }

  /**
   * 检查平台碰撞
   */
  checkPlatformCollision(body) {
    for (const platform of this.platforms) {
      if (this.checkBoxCollision(
        body.x, body.y, body.width, body.height,
        platform.x, platform.y, platform.width, platform.height
      )) {
        // 简单的碰撞响应
        if (body.velocity.y > 0 && body.y + body.height / 2 < platform.y) {
          body.y = platform.y - body.height / 2;
          body.velocity.y = 0;
          body.velocity.x *= platform.friction || 1;
        }
      }
    }
  }

  /**
   * 检查盒子碰撞
   */
  checkBoxCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (
      x1 - w1 / 2 < x2 + w2 / 2 &&
      x1 + w1 / 2 > x2 - w2 / 2 &&
      y1 - h1 / 2 < y2 + h2 / 2 &&
      y1 + h1 / 2 > y2 - h2 / 2
    );
  }

  /**
   * 更新角色物理
   */
  updateCharacter(deltaTime) {
    const dt = this.timeStep;
    const char = this.previewCharacter;

    // 应用重力
    char.velocity.y += this.gravity * dt;

    // 更新位置
    char.x += char.velocity.x * dt;
    char.y += char.velocity.y * dt;

    // 地面检测
    let grounded = false;
    for (const platform of this.platforms) {
      if (this.checkBoxCollision(
        char.x, char.y, char.width, char.height,
        platform.x, platform.y, platform.width, platform.height
      )) {
        if (char.velocity.y > 0 && char.y + char.height / 2 < platform.y) {
          char.y = platform.y - char.height / 2;
          char.velocity.y = 0;
          grounded = true;
          char.jumpCount = 0;
        }
      }
    }
    char.isGrounded = grounded;

    // 边界检查
    if (char.y > 1000) {
      char.y = 100;
      char.velocity.y = 0;
    }
  }

  /**
   * 角色跳跃
   */
  characterJump() {
    if (!this.previewCharacter) return;

    if (this.previewCharacter.jumpCount < this.previewCharacter.maxJumps) {
      this.previewCharacter.velocity.y = this.previewCharacter.jumpForce;
      this.previewCharacter.jumpCount++;
      console.log('🦘 跳跃');
    }
  }

  /**
   * 角色移动
   */
  characterMove(direction) {
    if (!this.previewCharacter) return;
    this.previewCharacter.velocity.x = direction * this.previewCharacter.moveSpeed;
  }

  /**
   * 绘制物理预览
   */
  draw(ctx) {
    // 绘制平台
    for (const platform of this.platforms) {
      ctx.fillStyle = this.getPlatformColor(platform.type);
      ctx.fillRect(
        platform.x - platform.width / 2,
        platform.y - platform.height / 2,
        platform.width,
        platform.height
      );

      // 平台边框
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        platform.x - platform.width / 2,
        platform.y - platform.height / 2,
        platform.width,
        platform.height
      );
    }

    // 绘制刚体
    for (const body of this.rigidBodies) {
      ctx.save();
      ctx.translate(body.x, body.y);
      ctx.rotate(body.rotation);

      if (body.type === 'box') {
        ctx.fillStyle = body.isStatic ? '#555' : '#4caf50';
        ctx.fillRect(-body.width / 2, -body.height / 2, body.width, body.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(-body.width / 2, -body.height / 2, body.width, body.height);
      } else if (body.type === 'circle') {
        ctx.fillStyle = body.isStatic ? '#555' : '#2196f3';
        ctx.beginPath();
        ctx.arc(0, 0, body.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 绘制旋转指示器
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(body.radius || body.width / 2, 0);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    // 绘制预览角色
    if (this.previewCharacter) {
      const char = this.previewCharacter;

      // 角色身体
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(
        char.x - char.width / 2,
        char.y - char.height / 2,
        char.width,
        char.height
      );

      // 角色头部
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(char.x, char.y - char.height / 2 - 8, 10, 0, Math.PI * 2);
      ctx.fill();

      // 眼睛
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(char.x - 3, char.y - char.height / 2 - 10, 2, 0, Math.PI * 2);
      ctx.arc(char.x + 3, char.y - char.height / 2 - 10, 2, 0, Math.PI * 2);
      ctx.fill();

      // 地面指示
      if (char.isGrounded) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(char.x - char.width / 2, char.y + char.height / 2, char.width, 4);
      }
    }
  }

  /**
   * 获取平台颜色
   */
  getPlatformColor(type) {
    switch (type) {
      case 'solid': return '#888';
      case 'one-way': return '#aaa';
      case 'moving': return '#666';
      case 'breakable': return '#d32f2f';
      default: return '#888';
    }
  }

  /**
   * 导出配置
   */
  exportConfig() {
    return {
      gravity: this.gravity,
      rigidBodies: this.rigidBodies.map(b => ({ ...b })),
      platforms: this.platforms.map(p => ({ ...p }))
    };
  }

  /**
   * 导入配置
   */
  importConfig(config) {
    if (config.gravity !== undefined) this.gravity = config.gravity;
    if (config.rigidBodies) {
      this.rigidBodies = config.rigidBodies.map(b => ({ ...b }));
    }
    if (config.platforms) {
      this.platforms = config.platforms.map(p => ({ ...p }));
    }
  }

  /**
   * 清除所有物理对象
   */
  clearAll() {
    this.stopSimulation();
    this.rigidBodies = [];
    this.platforms = [];
    this.previewCharacter = null;
    this.selectedBody = null;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      gravity: this.gravity,
      rigidBodies: this.rigidBodies.length,
      staticBodies: this.rigidBodies.filter(b => b.isStatic).length,
      dynamicBodies: this.rigidBodies.filter(b => !b.isStatic).length,
      platforms: this.platforms.length,
      simulationActive: this.enablePhysics,
      simulationTime: this.simulationTime.toFixed(2) + 's'
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.PhysicsPreview = PhysicsPreview;
}

