/**
 * 任务系统 - 用于 RPG 游戏编辑器
 * 提供任务创建、目标配置和奖励设置功能
 */

class QuestSystem {
  constructor() {
    this.quests = new Map(); // 任务集合
    this.questChains = new Map(); // 任务链集合
    this.selectedQuest = null;
    this.questCounter = 0;
  }

  /**
   * 创建任务
   */
  createQuest(config) {
    const quest = {
      id: config.id || `quest_${this.questCounter++}`,
      name: config.name || '新任务',
      description: config.description || '',
      type: config.type || 'main', // main, side, daily, repeatable
      difficulty: config.difficulty || 1, // 1-5
      minLevel: config.minLevel || 1,
      autoAccept: config.autoAccept || false,
      objectives: config.objectives || [],
      rewards: config.rewards || [],
      prerequisites: config.prerequisites || [],
      triggers: config.triggers || [],
      onComplete: config.onComplete || null,
      onFail: config.onFail || null,
      timeLimit: config.timeLimit || 0,
      retryable: config.retryable || true,
      chainId: config.chainId || null,
      position: config.position || 0
    };

    this.quests.set(quest.id, quest);
    return quest;
  }

  /**
   * 创建任务目标
   */
  createObjective(config) {
    return {
      id: config.id || `obj_${Date.now()}`,
      type: config.type || 'collect', // collect, kill, talk, explore, craft
      targetId: config.targetId || null,
      targetName: config.targetName || '',
      requiredAmount: config.requiredAmount || 1,
      currentAmount: config.currentAmount || 0,
      description: config.description || '',
      optional: config.optional || false,
      hidden: config.hidden || false
    };
  }

  /**
   * 添加目标到任务
   */
  addObjective(questId, objective) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    if (!objective.id) {
      objective.id = `obj_${questId}_${quest.objectives.length}`;
    }

    quest.objectives.push(objective);
    return true;
  }

  /**
   * 移除目标
   */
  removeObjective(questId, objectiveId) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    const index = quest.objectives.findIndex(o => o.id === objectiveId);
    if (index > -1) {
      quest.objectives.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 创建任务奖励
   */
  createReward(config) {
    return {
      id: config.id || `reward_${Date.now()}`,
      type: config.type || 'item', // item, exp, gold, skill, title
      itemId: config.itemId || null,
      amount: config.amount || 1,
      description: config.description || ''
    };
  }

  /**
   * 添加奖励到任务
   */
  addReward(questId, reward) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    if (!reward.id) {
      reward.id = `reward_${questId}_${quest.rewards.length}`;
    }

    quest.rewards.push(reward);
    return true;
  }

  /**
   * 移除奖励
   */
  removeReward(questId, rewardId) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    const index = quest.rewards.findIndex(r => r.id === rewardId);
    if (index > -1) {
      quest.rewards.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 添加前置任务
   */
  addPrerequisite(questId, prerequisiteId) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    if (!quest.prerequisites.includes(prerequisiteId)) {
      quest.prerequisites.push(prerequisiteId);
      return true;
    }
    return false;
  }

  /**
   * 移除前置任务
   */
  removePrerequisite(questId, prerequisiteId) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    const index = quest.prerequisites.indexOf(prerequisiteId);
    if (index > -1) {
      quest.prerequisites.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 创建任务链
   */
  createQuestChain(config) {
    const chain = {
      id: config.id || `chain_${Date.now()}`,
      name: config.name || '任务链',
      description: config.description || '',
      questIds: config.questIds || [],
      isLinear: config.isLinear !== undefined ? config.isLinear : true
    };

    this.questChains.set(chain.id, chain);
    return chain;
  }

  /**
   * 添加任务到链
   */
  addQuestToChain(chainId, questId) {
    const chain = this.questChains.get(chainId);
    if (!chain) return false;

    chain.questIds.push(questId);

    // 更新任务的 chainId
    const quest = this.quests.get(questId);
    if (quest) {
      quest.chainId = chainId;
      quest.position = chain.questIds.length - 1;
    }

    return true;
  }

  /**
   * 删除任务
   */
  deleteQuest(questId) {
    // 从任务链中移除
    for (const chain of this.questChains.values()) {
      const index = chain.questIds.indexOf(questId);
      if (index > -1) {
        chain.questIds.splice(index, 1);
      }
    }

    // 移除其他任务的前置任务引用
    for (const quest of this.quests.values()) {
      const prereqIndex = quest.prerequisites.indexOf(questId);
      if (prereqIndex > -1) {
        quest.prerequisites.splice(prereqIndex, 1);
      }
    }

    return this.quests.delete(questId);
  }

  /**
   * 获取任务
   */
  getQuest(questId) {
    return this.quests.get(questId);
  }

  /**
   * 获取任务链
   */
  getQuestChain(chainId) {
    return this.questChains.get(chainId);
  }

  /**
   * 选择任务
   */
  selectQuest(questId) {
    this.selectedQuest = this.quests.get(questId);
  }

  /**
   * 更新任务
   */
  updateQuest(questId, updates) {
    const quest = this.quests.get(questId);
    if (quest) {
      Object.assign(quest, updates);
      return true;
    }
    return false;
  }

  /**
   * 绘制任务流程图
   */
  drawQuestFlow(ctx, width, height) {
    if (this.quests.size === 0) return;

    ctx.save();

    // 简单的网格布局绘制
    const padding = 50;
    const nodeWidth = 200;
    const nodeHeight = 100;
    const horizontalGap = 80;
    const verticalGap = 60;

    // 按层级分组任务
    const levels = new Map();

    for (const quest of this.quests.values()) {
      const level = quest.prerequisites.length;
      if (!levels.has(level)) {
        levels.set(level, []);
      }
      levels.get(level).push(quest);
    }

    // 绘制连接线
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    for (const quest of this.quests.values()) {
      const level = quest.prerequisites.length;
      const levelQuests = levels.get(level);
      const levelIndex = levelQuests.indexOf(quest);

      const x = padding + (levelIndex + (levelQuests.length - 1) / 2) * (nodeWidth + horizontalGap);
      const y = padding + level * (nodeHeight + verticalGap);

      for (const prereqId of quest.prerequisites) {
        const prereq = this.quests.get(prereqId);
        if (prereq) {
          const prereqLevel = prereq.prerequisites.length;
          const prereqLevelQuests = levels.get(prereqLevel);
          const prereqLevelIndex = prereqLevelQuests.indexOf(prereq);

          const prereqX = padding + (prereqLevelIndex + (prereqLevelQuests.length - 1) / 2) * (nodeWidth + horizontalGap);
          const prereqY = padding + prereqLevel * (nodeHeight + verticalGap);

          ctx.beginPath();
          ctx.moveTo(prereqX + nodeWidth / 2, prereqY + nodeHeight);
          ctx.lineTo(x + nodeWidth / 2, y);
          ctx.stroke();
        }
      }
    }

    ctx.setLineDash([]);

    // 绘制任务节点
    for (const quest of this.quests.values()) {
      const level = quest.prerequisites.length;
      const levelQuests = levels.get(level);
      const levelIndex = levelQuests.indexOf(quest);

      const x = padding + (levelIndex + (levelQuests.length - 1) / 2) * (nodeWidth + horizontalGap);
      const y = padding + level * (nodeHeight + verticalGap);

      this.drawQuestNode(ctx, quest, x, y, nodeWidth, nodeHeight);
    }

    ctx.restore();
  }

  /**
   * 绘制任务节点
   */
  drawQuestNode(ctx, quest, x, y, width, height) {
    const isSelected = quest === this.selectedQuest;

    // 根据任务类型设置颜色
    let bgColor = '#fff';
    let borderColor = '#999';

    switch (quest.type) {
      case 'main':
        bgColor = '#e3f2fd';
        borderColor = '#2196f3';
        break;
      case 'side':
        bgColor = '#fff3e0';
        borderColor = '#ff9800';
        break;
      case 'daily':
        bgColor = '#f3e5f5';
        borderColor = '#9c27b0';
        break;
      case 'repeatable':
        bgColor = '#e8f5e9';
        borderColor = '#4caf50';
        break;
    }

    // 绘制节点背景
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = isSelected ? '#ffeb3b' : borderColor;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // 绘制难度星级
    ctx.fillStyle = '#ffc107';
    for (let i = 0; i < quest.difficulty; i++) {
      ctx.fillText('★', x + 10 + i * 12, y + 18);
    }

    // 绘制任务名称
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(quest.name, x + 10, y + 35);

    // 绘制任务类型
    ctx.font = '10px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(quest.type.toUpperCase(), x + 10, y + 50);

    // 绘制目标数量
    ctx.fillStyle = '#2196f3';
    ctx.fillText(`📋 ${quest.objectives.length} 目标`, x + 10, y + 65);

    // 绘制奖励数量
    ctx.fillStyle = '#4caf50';
    ctx.fillText(`🎁 ${quest.rewards.length} 奖励`, x + 100, y + 65);

    // 绘制前置任务标识
    if (quest.prerequisites.length > 0) {
      ctx.fillStyle = '#ff9800';
      ctx.fillText(`🔗 ${quest.prerequisites.length} 前置`, x + 10, y + 80);
    }
  }

  /**
   * 检查任务是否可以接受
   */
  canAcceptQuest(questId, playerQuests = [], playerLevel = 1) {
    const quest = this.quests.get(questId);
    if (!quest) return { canAccept: false, reason: '任务不存在' };

    // 检查等级要求
    if (playerLevel < quest.minLevel) {
      return { canAccept: false, reason: `等级不足，需要 ${quest.minLevel} 级` };
    }

    // 检查前置任务
    for (const prereqId of quest.prerequisites) {
      if (!playerQuests.includes(prereqId)) {
        return { canAccept: false, reason: '未完成前置任务' };
      }
    }

    // 检查是否已接受
    if (playerQuests.includes(questId)) {
      return { canAccept: false, reason: '已接受该任务' };
    }

    return { canAccept: true, reason: '' };
  }

  /**
   * 导出任务数据
   */
  exportQuest(questId) {
    const quest = this.quests.get(questId);
    if (!quest) return null;

    return {
      ...quest,
      objectives: quest.objectives.map(o => ({ ...o })),
      rewards: quest.rewards.map(r => ({ ...r })),
      prerequisites: [...quest.prerequisites],
      triggers: quest.triggers.map(t => ({ ...t }))
    };
  }

  /**
   * 导入任务数据
   */
  importQuest(data) {
    const quest = {
      ...data,
      objectives: data.objectives.map(o => ({ ...o })),
      rewards: data.rewards.map(r => ({ ...r })),
      prerequisites: [...data.prerequisites],
      triggers: data.triggers.map(t => ({ ...t }))
    };

    this.quests.set(quest.id, quest);
    return quest;
  }

  /**
   * 获取所有任务列表
   */
  getQuestList() {
    return Array.from(this.quests.values()).map(q => ({
      id: q.id,
      name: q.name,
      type: q.type,
      difficulty: q.difficulty,
      objectives: q.objectives.length,
      rewards: q.rewards.length
    }));
  }

  /**
   * 按类型获取任务
   */
  getQuestsByType(type) {
    return Array.from(this.quests.values()).filter(q => q.type === type);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const typeStats = {};
    const types = ['main', 'side', 'daily', 'repeatable'];

    for (const type of types) {
      typeStats[type] = this.getQuestsByType(type).length;
    }

    let totalObjectives = 0;
    let totalRewards = 0;

    for (const quest of this.quests.values()) {
      totalObjectives += quest.objectives.length;
      totalRewards += quest.rewards.length;
    }

    return {
      totalQuests: this.quests.size,
      totalChains: this.questChains.size,
      byType: typeStats,
      totalObjectives: totalObjectives,
      totalRewards: totalRewards,
      avgObjectives: (totalObjectives / this.quests.size).toFixed(2),
      avgRewards: (totalRewards / this.quests.size).toFixed(2)
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.QuestSystem = QuestSystem;
}

