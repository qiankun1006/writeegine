/**
 * BoneEditTool.js - 骨骼编辑工具
 *
 * 允许用户在画布上选择、移动和旋转骨骼
 */
class BoneEditTool extends Tool {
  constructor() {
    super({
      id: 'bone-edit',
      name: '骨骼编辑',
      icon: '🦴',
      cursor: 'crosshair',
      category: 'animation',
      options: {}
    });
    this.skeleton = null;

    // 操作状态
    this.selectedBone = null;
    this.isDragging = false;
    this.isRotating = false;
    this.dragMode = null;  // 'move', 'rotate', 'scale'

    // 鼠标初始位置
    this.startMouseX = 0;
    this.startMouseY = 0;

    // 骨骼初始状态
    this.initialBonePos = { x: 0, y: 0 };
    this.initialBoneRot = 0;

    // 常量
    this.jointRadius = 8;      // 关节圆点半径
    this.pickRadius = 12;      // 鼠标拾取半径
    this.rotateModeThreshold = 20; // 旋转模式激活距离
  }

  setSkeleton(skeleton) {
    this.skeleton = skeleton;
  }

  /**
   * 激活工具
   */
  activate(editor) {
    super.activate(editor);
    console.log('🦴 骨骼编辑工具已激活');
  }

  /**
   * 停用工具
   */
  deactivate() {
    super.deactivate();
    console.log('🦴 骨骼编辑工具已停用');
  }

  /**
   * 鼠标按下
   */
  onMouseDown(e, editor) {
    if (!this.skeleton) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const worldX = coords.x || coords[0];
    const worldY = coords.y || coords[1];

    // 尝试拾取骨骼
    const bone = this.skeleton.pickBoneAtPosition(worldX, worldY, this.pickRadius);

    if (bone) {
      this.selectedBone = bone;
      this.skeleton.selectBone(bone.id);

      this.isDragging = true;
      this.startMouseX = worldX;
      this.startMouseY = worldY;

      // 保存初始状态
      this.initialBonePos = { ...bone.position };
      this.initialBoneRot = bone.rotation;

      // 判断模式：距离关节近时为移动，远时为旋转
      const dx = worldX - bone.worldPosition.x;
      const dy = worldY - bone.worldPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      this.dragMode = dist < this.rotateModeThreshold ? 'move' : 'rotate';

      editor.render();
    } else {
      this.selectedBone = null;
      this.skeleton.deselectBone();
    }
  }

  /**
   * 鼠标移动
   */
  onMouseMove(e, editor) {
    if (!this.skeleton || !this.isDragging || !this.selectedBone) return;

    const coords = editor.renderer.screenToWorldCoords(e.clientX, e.clientY);
    const worldX = coords.x || coords[0];
    const worldY = coords.y || coords[1];

    if (this.dragMode === 'move') {
      // 移动骨骼
      const dx = worldX - this.startMouseX;
      const dy = worldY - this.startMouseY;

      this.skeleton.setBonePosition(
        this.selectedBone.id,
        this.initialBonePos.x + dx,
        this.initialBonePos.y + dy
      );
    } else if (this.dragMode === 'rotate') {
      // 旋转骨骼
      const cx = this.selectedBone.worldPosition.x;
      const cy = this.selectedBone.worldPosition.y;

      // 初始角度
      const angle1 = Math.atan2(
        this.startMouseY - cy,
        this.startMouseX - cx
      );

      // 当前角度
      const angle2 = Math.atan2(
        worldY - cy,
        worldX - cx
      );

      // 旋转增量
      const deltaRot = angle2 - angle1;

      this.skeleton.setBoneRotation(
        this.selectedBone.id,
        this.initialBoneRot + deltaRot
      );
    }

    editor.render();
  }

  /**
   * 鼠标抬起
   */
  onMouseUp(e, editor) {
    if (this.isDragging && this.selectedBone) {
      // 创建撤销命令
      if (this.dragMode === 'move') {
        const newPos = this.selectedBone.position;
        if (newPos.x !== this.initialBonePos.x || newPos.y !== this.initialBonePos.y) {
          const cmd = new SetBonePositionCommand(
            this.skeleton,
            this.selectedBone.id,
            newPos,
            this.initialBonePos
          );
          editor.history.execute(cmd);
        }
      } else if (this.dragMode === 'rotate') {
        const newRot = this.selectedBone.rotation;
        if (newRot !== this.initialBoneRot) {
          const cmd = new SetBoneRotationCommand(
            this.skeleton,
            this.selectedBone.id,
            newRot,
            this.initialBoneRot
          );
          editor.history.execute(cmd);
        }
      }
    }

    this.isDragging = false;
    this.dragMode = null;
  }

  /**
   * 绘制工具的 UI
   */
  render(ctx, editor) {
    if (!this.skeleton) return;

    // 绘制所有骨骼
    this.skeleton.getAllBones().forEach(bone => {
      if (!bone.visible) return;

      const startX = bone.worldPosition.x;
      const startY = bone.worldPosition.y;
      const end = bone.getEndPosition();

      // 绘制骨骼线
      ctx.strokeStyle = bone === this.selectedBone ? '#ffaa00' : '#0088ff';
      ctx.lineWidth = bone === this.selectedBone ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // 绘制关节（起点）
      ctx.fillStyle = bone === this.selectedBone ? '#ffcc00' : '#00ff66';
      ctx.beginPath();
      ctx.arc(startX, startY, this.jointRadius, 0, Math.PI * 2);
      ctx.fill();

      // 绘制关节边框
      ctx.strokeStyle = bone === this.selectedBone ? '#ff8800' : '#0088ff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 绘制骨骼末端的小圆点
      ctx.fillStyle = bone === this.selectedBone ? '#ffdd00' : '#00dd88';
      ctx.beginPath();
      ctx.arc(end.x, end.y, this.jointRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // 绘制骨骼名称
      ctx.fillStyle = '#ccc';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(bone.name, startX + this.jointRadius + 4, startY - 4);

      // 绘制骨骼轴（调试用）
      this._drawBoneAxes(ctx, bone, startX, startY);

      // 绘制骨骼边界框（调试用）
      this._drawBoneBoundingBox(ctx, bone, startX, startY, end.x, end.y);
    });
  }

  /**
   * 绘制骨骼轴（调试用）
   */
  _drawBoneAxes(ctx, bone, x, y) {
    const axisLength = 30 * this.scale;
    const lineWidth = 2 * this.scale;

    // X 轴（红色）- 表示骨骼的向前方向
    const endX = x + Math.cos(bone.rotation) * axisLength;
    const endY = y + Math.sin(bone.rotation) * axisLength;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // 绘制箭头
    const arrowSize = 5 * this.scale;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(bone.rotation - 0.3),
      endY - arrowSize * Math.sin(bone.rotation - 0.3)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(bone.rotation + 0.3),
      endY - arrowSize * Math.sin(bone.rotation + 0.3)
    );
    ctx.stroke();

    // Y 轴（绿色）- 表示骨骼的向上方向（垂直于 X 轴）
    const perpRotation = bone.rotation + Math.PI / 2;
    const perpEndX = x + Math.cos(perpRotation) * (axisLength * 0.7);
    const perpEndY = y + Math.sin(perpRotation) * (axisLength * 0.7);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(perpEndX, perpEndY);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  /**
   * 绘制骨骼边界框（调试用）
   */
  _drawBoneBoundingBox(ctx, bone, startX, startY, endX, endY) {
    // 计算骨骼的包围盒
    const padding = 5 * this.scale;

    // 找出最小和最大坐标
    const minX = Math.min(startX, endX) - padding;
    const maxX = Math.max(startX, endX) + padding;
    const minY = Math.min(startY, endY) - padding;
    const maxY = Math.max(startY, endY) + padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // 绘制边界框
    ctx.save();
    ctx.strokeStyle = bone === this.selectedBone ? '#ff8800' : '#ffff00';
    ctx.lineWidth = 1 * this.scale;
    ctx.setLineDash([5, 3]); // 虚线
    ctx.strokeRect(minX, minY, width, height);

    // 绘制边界框的角落标记
    const cornerSize = 4 * this.scale;
    ctx.setLineDash([]);

    // 左上角
    ctx.beginPath();
    ctx.moveTo(minX, minY + cornerSize);
    ctx.lineTo(minX, minY);
    ctx.lineTo(minX + cornerSize, minY);
    ctx.stroke();

    // 右上角
    ctx.beginPath();
    ctx.moveTo(maxX - cornerSize, minY);
    ctx.lineTo(maxX, minY);
    ctx.lineTo(maxX, minY + cornerSize);
    ctx.stroke();

    // 右下角
    ctx.beginPath();
    ctx.moveTo(maxX, maxY - cornerSize);
    ctx.lineTo(maxX, maxY);
    ctx.lineTo(maxX - cornerSize, maxY);
    ctx.stroke();

    // 左下角
    ctx.beginPath();
    ctx.moveTo(minX + cornerSize, maxY);
    ctx.lineTo(minX, maxY);
    ctx.lineTo(minX, maxY - cornerSize);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 工具提示
   */
  getHint() {
    return '点击并拖拽骨骼来移动，靠近末端拖拽来旋转。';
  }

  /**
   * 清理资源
   */
  dispose() {
    this.selectedBone = null;
    this.skeleton = null;
  }
}

