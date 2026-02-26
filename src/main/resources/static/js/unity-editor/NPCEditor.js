/**
 * NPC 编辑器 - 用于 RPG 游戏编辑器
 * 提供 NPC 创建、编辑和管理功能
 */

class NPCEditor {
  constructor(gridSystem) {
    this.gridSystem = gridSystem;
    this.npcs = []; // NPC 数组
    this.selectedNPC = null;
    this.showNPCs = true;
    this.npcTemplates = [
      { name: '村民', type: 'villager', color: '#4caf50', width: 32, height: 48 },
      { name: '商人', type: 'merchant', color: '#ff9800', width: 32, height: 48 },
      { name: '守卫', type: 'guard', color: '#2196f3', width: 32, height: 56 },
      { name: '敌人', type: 'enemy', color: '#f44336', width: 32, height: 48 },
      { name: 'BOSS', type: 'boss', color: '#9c27b0', width: 64, height: 80 }
    ];
  }

  /**
   * 创建 NPC
   */
  createNPC(config) {
    const template = this.npcTemplates.find(t => t.type === config.type) || this.npcTemplates[0];

    const npc = {
      id: config.id || `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: config.type || 'villager',
      name: config.name || 'NPC',
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || template.width,
      height: config.height || template.height,
      color: config.color || template.color,
      sprite: config.sprite || null,
      dialogueId: config.dialogueId || null,
      questId: config.questId || null,
      behavior: config.behavior || {
        type: 'idle',
        patrolPath: [],
        moveSpeed: 100,
        aggroRange: 100,
        attackRange: 30
      },
      stats: config.stats || {
        hp: 100,
        attack: 10,
        defense: 5,
        level: 1
      }
    };

    this.npcs.push(npc);
    return npc;
  }

  /**
   * 删除 NPC
   */
  deleteNPC(npcId) {
    const index = this.npcs.findIndex(n => n.id === npcId);
    if (index > -1) {
      if (this.selectedNPC === this.npcs[index]) {
        this.selectedNPC = null;
      }
      this.npcs.splice(index, 1);
    }
  }

  /**
   * 选择 NPC
   */
  selectNPC(npcId) {
    this.selectedNPC = this.npcs.find(n => n.id === npcId);
  }

  /**
   * 获取指定位置的 NPC
   */
  getNPCAt(x, y) {
    for (let i = this.npcs.length - 1; i >= 0; i--) {
      const npc = this.npcs[i];
      if (Canvas2DUtils.pointInRect(x, y, npc.x - npc.width / 2, npc.y - npc.height / 2, npc.width, npc.height)) {
        return npc;
      }
    }
    return null;
  }

  /**
   * 更新 NPC 属性
   */
  updateNPC(npcId, updates) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      Object.assign(npc, updates);
    }
  }

  /**
   * 为 NPC 添加对话
   */
  setDialogue(npcId, dialogueId) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      npc.dialogueId = dialogueId;
    }
  }

  /**
   * 为 NPC 添加任务
   */
  setQuest(npcId, questId) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      npc.questId = questId;
    }
  }

  /**
   * 设置 NPC 行为
   */
  setBehavior(npcId, behavior) {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      npc.behavior = { ...npc.behavior, ...behavior };
    }
  }

  /**
   * 绘制所有 NPC
   */
  draw(ctx, tileSize) {
    if (!this.showNPCs) return;

    for (const npc of this.npcs) {
      const isSelected = npc === this.selectedNPC;
      const x = npc.x - npc.width / 2;
      const y = npc.y - npc.height / 2;

      // 绘制 NPC 身体
      ctx.fillStyle = npc.color;
      ctx.fillRect(x, y, npc.width, npc.height);

      // 绘制选中高亮
      if (isSelected) {
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 2, y - 2, npc.width + 4, npc.height + 4);
      }

      // 绘制 NPC 头部
      ctx.fillStyle = this.lightenColor(npc.color, 30);
      ctx.beginPath();
      ctx.arc(npc.x, y + 10, 12, 0, Math.PI * 2);
      ctx.fill();

      // 绘制眼睛
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(npc.x - 4, y + 10, 3, 0, Math.PI * 2);
      ctx.arc(npc.x + 4, y + 10, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(npc.x - 4, y + 10, 1.5, 0, Math.PI * 2);
      ctx.arc(npc.x + 4, y + 10, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 绘制 NPC 名称
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, npc.x, y - 8);

      // 绘制 NPC 类型标识
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.fillText(npc.type, npc.x, y + npc.height + 12);

      // 绘制对话/任务指示器
      if (npc.dialogueId || npc.questId) {
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.moveTo(npc.x, y - 18);
        ctx.lineTo(npc.x - 6, y - 24);
        ctx.lineTo(npc.x + 6, y - 24);
        ctx.closePath();
        ctx.fill();
      }

      // 绘制巡逻路径
      if (npc.behavior.patrolPath && npc.behavior.patrolPath.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(npc.x, npc.y);
        for (const point of npc.behavior.patrolPath) {
          ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制路径点
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (const point of npc.behavior.patrolPath) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  /**
   * 颜色变亮
   */
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
  }

  /**
   * 切换 NPC 显示
   */
  toggleNPCs() {
    this.showNPCs = !this.showNPCs;
    return this.showNPCs;
  }

  /**
   * 清除所有 NPC
   */
  clearNPCs() {
    this.npcs = [];
    this.selectedNPC = null;
  }

  /**
   * 按类型获取 NPC
   */
  getNPCsByType(type) {
    return this.npcs.filter(n => n.type === type);
  }

  /**
   * 导出 NPC 数据
   */
  exportData() {
    return this.npcs.map(npc => ({
      ...npc,
      behavior: { ...npc.behavior },
      stats: { ...npc.stats }
    }));
  }

  /**
   * 导入 NPC 数据
   */
  importData(data) {
    this.npcs = data.map(npc => ({
      ...npc,
      behavior: { ...npc.behavior },
      stats: { ...npc.stats }
    }));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const typeStats = {};
    for (const template of this.npcTemplates) {
      typeStats[template.type] = this.npcs.filter(n => n.type === template.type).length;
    }

    return {
      total: this.npcs.length,
      withDialogue: this.npcs.filter(n => n.dialogueId).length,
      withQuests: this.npcs.filter(n => n.questId).length,
      byType: typeStats
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.NPCEditor = NPCEditor;
}

