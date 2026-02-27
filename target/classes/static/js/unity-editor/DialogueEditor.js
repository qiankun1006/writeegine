/**
 * 对话编辑器 - 用于 RPG 游戏编辑器
 * 提供对话节点编辑、分支管理和条件判断功能
 */

class DialogueEditor {
  constructor() {
    this.dialogues = new Map(); // 对话树集合
    this.selectedDialogue = null;
    this.selectedNode = null;
    this.nodeCounter = 0;
  }

  /**
   * 创建对话
   */
  createDialogue(config) {
    const dialogue = {
      id: config.id || `dialogue_${Date.now()}`,
      name: config.name || '对话',
      rootNodeId: null,
      nodes: new Map(),
      variables: config.variables || {}
    };

    this.dialogues.set(dialogue.id, dialogue);

    // 创建根节点
    if (!config.nodes) {
      const rootNode = this.createNode(dialogue, {
        text: config.initialText || '你好！',
        speaker: config.speaker || 'NPC'
      });
      dialogue.rootNodeId = rootNode.id;
    }

    return dialogue;
  }

  /**
   * 创建对话节点
   */
  createNode(dialogue, config) {
    const node = {
      id: config.id || `node_${dialogue.id}_${this.nodeCounter++}`,
      text: config.text || '',
      speaker: config.speaker || 'NPC',
      choices: config.choices || [],
      conditions: config.conditions || [],
      actions: config.actions || [],
      keywords: config.keywords || [],
      nextNodeId: config.nextNodeId || null,
      position: config.position || { x: 100, y: 100 }
    };

    dialogue.nodes.set(node.id, node);
    return node;
  }

  /**
   * 添加选择分支
   */
  addChoice(dialogueId, nodeId, choice) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return null;

    const node = dialogue.nodes.get(nodeId);
    if (!node) return null;

    const choiceObj = {
      id: choice.id || `choice_${Date.now()}`,
      text: choice.text || '选项',
      nextNodeId: choice.nextNodeId || null,
      conditions: choice.conditions || [],
      keywords: choice.keywords || []
    };

    node.choices.push(choiceObj);
    return choiceObj;
  }

  /**
   * 添加条件判断
   */
  addCondition(dialogueId, nodeId, condition) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return null;

    const node = dialogue.nodes.get(nodeId);
    if (!node) return null;

    const conditionObj = {
      variable: condition.variable,
      operator: condition.operator || '==',
      value: condition.value,
      type: condition.type || 'variable' // variable, item, quest
    };

    node.conditions.push(conditionObj);
    return conditionObj;
  }

  /**
   * 连接节点
   */
  connectNodes(dialogueId, fromNodeId, toNodeId, choiceIndex = -1) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return false;

    const fromNode = dialogue.nodes.get(fromNodeId);
    if (!fromNode) return false;

    if (choiceIndex >= 0 && choiceIndex < fromNode.choices.length) {
      fromNode.choices[choiceIndex].nextNodeId = toNodeId;
    } else {
      fromNode.nextNodeId = toNodeId;
    }

    return true;
  }

  /**
   * 删除节点
   */
  deleteNode(dialogueId, nodeId) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return false;

    // 如果是根节点，需要特殊处理
    if (dialogue.rootNodeId === nodeId) {
      dialogue.rootNodeId = null;
    }

    // 删除节点
    dialogue.nodes.delete(nodeId);

    // 清理指向该节点的连接
    for (const node of dialogue.nodes.values()) {
      if (node.nextNodeId === nodeId) {
        node.nextNodeId = null;
      }
      for (const choice of node.choices) {
        if (choice.nextNodeId === nodeId) {
          choice.nextNodeId = null;
        }
      }
    }

    return true;
  }

  /**
   * 删除选择
   */
  deleteChoice(dialogueId, nodeId, choiceIndex) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return false;

    const node = dialogue.nodes.get(nodeId);
    if (!node || choiceIndex < 0 || choiceIndex >= node.choices.length) {
      return false;
    }

    node.choices.splice(choiceIndex, 1);
    return true;
  }

  /**
   * 删除对话
   */
  deleteDialogue(dialogueId) {
    return this.dialogues.delete(dialogueId);
  }

  /**
   * 获取对话
   */
  getDialogue(dialogueId) {
    return this.dialogues.get(dialogueId);
  }

  /**
   * 选择对话
   */
  selectDialogue(dialogueId) {
    this.selectedDialogue = this.dialogues.get(dialogueId);
    this.selectedNode = null;
  }

  /**
   * 选择节点
   */
  selectNode(dialogueId, nodeId) {
    const dialogue = this.dialogues.get(dialogueId);
    if (dialogue) {
      this.selectedDialogue = dialogue;
      this.selectedNode = dialogue.nodes.get(nodeId);
    }
  }

  /**
   * 更新节点
   */
  updateNode(dialogueId, nodeId, updates) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return false;

    const node = dialogue.nodes.get(nodeId);
    if (!node) return false;

    Object.assign(node, updates);
    return true;
  }

  /**
   * 更新选择
   */
  updateChoice(dialogueId, nodeId, choiceIndex, updates) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return false;

    const node = dialogue.nodes.get(nodeId);
    if (!node || choiceIndex < 0 || choiceIndex >= node.choices.length) {
      return false;
    }

    Object.assign(node.choices[choiceIndex], updates);
    return true;
  }

  /**
   * 绘制对话节点图
   */
  drawNodeGraph(ctx, width, height) {
    if (!this.selectedDialogue) return;

    const dialogue = this.selectedDialogue;
    ctx.save();

    // 绘制节点
    for (const node of dialogue.nodes.values()) {
      this.drawNode(ctx, node);
    }

    // 绘制连接线
    for (const node of dialogue.nodes.values()) {
      this.drawConnections(ctx, node, dialogue.nodes);
    }

    ctx.restore();
  }

  /**
   * 绘制单个节点
   */
  drawNode(ctx, node) {
    const isSelected = node === this.selectedNode;
    const x = node.position.x;
    const y = node.position.y;
    const nodeWidth = 200;
    const nodeHeight = 80;

    // 绘制节点背景
    ctx.fillStyle = isSelected ? '#fff9c4' : '#fff';
    ctx.strokeStyle = isSelected ? '#ffeb3b' : '#999';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.fillRect(x, y, nodeWidth, nodeHeight);
    ctx.strokeRect(x, y, nodeWidth, nodeHeight);

    // 绘制标题栏
    ctx.fillStyle = isSelected ? '#ffeb3b' : '#f0f0f0';
    ctx.fillRect(x, y, nodeWidth, 25);

    // 绘制节点 ID 和说话者
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${node.speaker}`, x + 5, y + 17);

    // 绘制对话文本（截断）
    ctx.font = '10px Arial';
    ctx.fillStyle = '#666';
    const truncatedText = node.text.length > 20 ? node.text.substring(0, 20) + '...' : node.text;
    ctx.fillText(truncatedText, x + 5, y + 40);

    // 绘制选择数量
    if (node.choices.length > 0) {
      ctx.fillStyle = '#2196f3';
      ctx.fillText(`📊 ${node.choices.length} 选项`, x + 5, y + 55);
    } else if (node.nextNodeId) {
      ctx.fillStyle = '#4caf50';
      ctx.fillText('➡️ 继续', x + 5, y + 55);
    }

    // 绘制条件标识
    if (node.conditions.length > 0) {
      ctx.fillStyle = '#ff9800';
      ctx.fillText('⚠️ ' + node.conditions.length + ' 条件', x + 100, y + 55);
    }
  }

  /**
   * 绘制连接线
   */
  drawConnections(ctx, node, nodes) {
    const x = node.position.x;
    const y = node.position.y;
    const nodeWidth = 200;
    const nodeHeight = 80;
    const centerBottom = { x: x + nodeWidth / 2, y: y + nodeHeight };

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;

    // 绘制到下一个节点的连接
    if (node.nextNodeId) {
      const nextNode = nodes.get(node.nextNodeId);
      if (nextNode) {
        const nextCenterTop = { x: nextNode.position.x + 100, y: nextNode.position.y };
        this.drawArrow(ctx, centerBottom, nextCenterTop);
      }
    }

    // 绘制到选择的连接
    for (let i = 0; i < node.choices.length; i++) {
      const choice = node.choices[i];
      if (choice.nextNodeId) {
        const nextNode = nodes.get(choice.nextNodeId);
        if (nextNode) {
          const choiceX = x + (i + 1) * (nodeWidth / (node.choices.length + 1));
          const choicePoint = { x: choiceX, y: centerBottom.y };
          const nextCenterTop = { x: nextNode.position.x + 100, y: nextNode.position.y };

          ctx.strokeStyle = '#2196f3';
          this.drawArrow(ctx, choicePoint, nextCenterTop);
          ctx.strokeStyle = '#999';
        }
      }
    }
  }

  /**
   * 绘制箭头
   */
  drawArrow(ctx, from, to) {
    const headlen = 10;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  /**
   * 导出对话数据
   */
  exportDialogue(dialogueId) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return null;

    return {
      id: dialogue.id,
      name: dialogue.name,
      rootNodeId: dialogue.rootNodeId,
      nodes: Array.from(dialogue.nodes.values()).map(node => ({
        ...node,
        choices: node.choices.map(c => ({ ...c })),
        conditions: node.conditions.map(c => ({ ...c }))
      })),
      variables: { ...dialogue.variables }
    };
  }

  /**
   * 导入对话数据
   */
  importDialogue(data) {
    const dialogue = {
      id: data.id,
      name: data.name,
      rootNodeId: data.rootNodeId,
      nodes: new Map(),
      variables: { ...data.variables }
    };

    for (const nodeData of data.nodes) {
      const node = {
        ...nodeData,
        choices: nodeData.choices.map(c => ({ ...c })),
        conditions: nodeData.conditions.map(c => ({ ...c }))
      };
      dialogue.nodes.set(node.id, node);
    }

    this.dialogues.set(dialogue.id, dialogue);
    return dialogue;
  }

  /**
   * 获取所有对话列表
   */
  getDialogueList() {
    return Array.from(this.dialogues.values()).map(d => ({
      id: d.id,
      name: d.name,
      nodeCount: d.nodes.size
    }));
  }

  /**
   * 获取统计信息
   */
  getStats(dialogueId) {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue) return null;

    let totalChoices = 0;
    let totalConditions = 0;

    for (const node of dialogue.nodes.values()) {
      totalChoices += node.choices.length;
      totalConditions += node.conditions.length;
    }

    return {
      nodeCount: dialogue.nodes.size,
      totalChoices: totalChoices,
      totalConditions: totalConditions,
      averageChoicesPerNode: (totalChoices / dialogue.nodes.size).toFixed(2)
    };
  }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
  window.DialogueEditor = DialogueEditor;
}

