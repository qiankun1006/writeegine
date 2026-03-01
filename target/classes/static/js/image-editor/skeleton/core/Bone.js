/**
 * Bone.js - 骨骼类
 *
 * 表示一个骨骼对象，包括本地变换和世界变换
 * 支持骨骼树的父子关系和级联变换
 */
class Bone {
  constructor(id, name) {
    this.id = id;
    this.name = name;

    // 本地变换（相对于父骨骼）
    this.position = { x: 0, y: 0 };
    this.rotation = 0;              // 弧度
    this.scale = { x: 1, y: 1 };

    // 世界变换（绝对坐标）
    this.worldMatrix = Matrix2D.identity();
    this.worldPosition = { x: 0, y: 0 };
    this.worldRotation = 0;

    // 树结构
    this.parent = null;
    this.children = [];

    // 可视化
    this.length = 50;               // 骨骼显示长度（像素）
    this.visible = true;
    this.locked = false;            // 锁定防止编辑

    // 骨骼颜色
    this.color = '#0088ff';
  }

  /**
   * 添加子骨骼
   */
  addChild(bone) {
    if (!this.children.includes(bone)) {
      this.children.push(bone);
      bone.parent = this;
    }
  }

  /**
   * 移除子骨骼
   */
  removeChild(bone) {
    const idx = this.children.indexOf(bone);
    if (idx > -1) {
      this.children.splice(idx, 1);
      if (bone.parent === this) {
        bone.parent = null;
      }
    }
  }

  /**
   * 获取所有子骨骼（递归）
   */
  getAllChildren() {
    let result = [];
    this.children.forEach(child => {
      result.push(child);
      result = result.concat(child.getAllChildren());
    });
    return result;
  }

  /**
   * 更新世界变换（级联计算）
   */
  updateWorldTransform() {
    if (this.parent) {
      // 本地矩阵 = TRS 分解
      const localMatrix = Matrix2D.fromTRS(
        this.position,
        this.rotation,
        this.scale
      );
      // 世界矩阵 = 父世界矩阵 × 本地矩阵
      this.worldMatrix = Matrix2D.multiply(
        this.parent.worldMatrix,
        localMatrix
      );
    } else {
      // 根骨骼
      this.worldMatrix = Matrix2D.fromTRS(
        this.position,
        this.rotation,
        this.scale
      );
    }

    // 从矩阵提取世界位置
    const [x, y] = this.worldMatrix.transform(0, 0);
    this.worldPosition = { x, y };

    // 从矩阵提取世界旋转
    this.worldRotation = this.getWorldRotation();

    // 递归更新子骨骼
    this.children.forEach(child => child.updateWorldTransform());
  }

  /**
   * 从矩阵中提取旋转值（弧度）
   */
  getWorldRotation() {
    return Math.atan2(
      this.worldMatrix.m01,
      this.worldMatrix.m00
    );
  }

  /**
   * 获取骨骼末端的世界坐标
   */
  getEndPosition() {
    const endX = this.worldPosition.x +
                 this.length * Math.cos(this.worldRotation);
    const endY = this.worldPosition.y +
                 this.length * Math.sin(this.worldRotation);
    return { x: endX, y: endY };
  }

  /**
   * 序列化骨骼数据
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      position: { ...this.position },
      rotation: this.rotation,
      scale: { ...this.scale },
      length: this.length,
      visible: this.visible,
      locked: this.locked,
      children: this.children.map(c => c.serialize())
    };
  }

  /**
   * 反序列化骨骼数据（静态方法）
   */
  static deserialize(data) {
    const bone = new Bone(data.id, data.name);
    bone.position = { ...data.position };
    bone.rotation = data.rotation;
    bone.scale = { ...data.scale };
    bone.length = data.length;
    bone.visible = data.visible;
    bone.locked = data.locked;

    if (data.children && data.children.length > 0) {
      data.children.forEach(childData => {
        const childBone = Bone.deserialize(childData);
        bone.addChild(childBone);
      });
    }

    return bone;
  }

  /**
   * 复制骨骼（深复制）
   */
  clone(newId = null) {
    const cloned = new Bone(newId || this.id, this.name);
    cloned.position = { ...this.position };
    cloned.rotation = this.rotation;
    cloned.scale = { ...this.scale };
    cloned.length = this.length;
    cloned.visible = this.visible;
    cloned.locked = this.locked;
    cloned.color = this.color;

    // 递归复制子骨骼
    this.children.forEach(child => {
      const clonedChild = child.clone();
      cloned.addChild(clonedChild);
    });

    return cloned;
  }
}

