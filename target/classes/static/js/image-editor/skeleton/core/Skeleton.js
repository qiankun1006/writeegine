/**
 * Skeleton.js - 骨骼系统
 *
 * 管理整个骨骼树，包括创建、删除、编辑骨骼
 * 处理骨骼的世界变换更新
 */
class Skeleton {
  constructor(name = 'Skeleton') {
    this.name = name;
    this.bones = new Map();        // ID → Bone 对象
    this.rootBones = [];           // 根骨骼列表
    this.selectedBone = null;      // 当前选中的骨骼

    // 统计
    this.boneCount = 0;            // 用于生成唯一 ID
  }

  /**
   * 创建新骨骼
   */
  createBone(name = null, parentBoneId = null) {
    const id = `bone_${this.boneCount++}`;
    const boneName = name || `Bone ${this.boneCount}`;
    const bone = new Bone(id, boneName);

    this.addBone(bone, parentBoneId);
    return bone;
  }

  /**
   * 添加骨骼到系统
   */
  addBone(bone, parentBoneId = null) {
    if (this.bones.has(bone.id)) {
      console.warn(`Bone with id ${bone.id} already exists`);
      return false;
    }

    this.bones.set(bone.id, bone);

    if (parentBoneId) {
      const parent = this.bones.get(parentBoneId);
      if (parent) {
        parent.addChild(bone);
        bone.parent = parent;
      } else {
        console.warn(`Parent bone ${parentBoneId} not found`);
        this.rootBones.push(bone);
      }
    } else {
      this.rootBones.push(bone);
    }

    return true;
  }

  /**
   * 移除骨骼
   */
  removeBone(boneId) {
    const bone = this.bones.get(boneId);
    if (!bone) return false;

    // 移除从父骨骼
    if (bone.parent) {
      bone.parent.removeChild(bone);
    } else {
      const idx = this.rootBones.indexOf(bone);
      if (idx > -1) {
        this.rootBones.splice(idx, 1);
      }
    }

    // 移除所有子骨骼
    const children = bone.getAllChildren();
    children.forEach(child => {
      this.bones.delete(child.id);
    });

    // 移除自己
    this.bones.delete(boneId);

    // 清除选中
    if (this.selectedBone === bone) {
      this.selectedBone = null;
    }

    return true;
  }

  /**
   * 获取骨骼
   */
  getBone(boneId) {
    return this.bones.get(boneId);
  }

  /**
   * 选择骨骼
   */
  selectBone(boneId) {
    const bone = this.bones.get(boneId);
    if (bone) {
      this.selectedBone = bone;
      return true;
    }
    return false;
  }

  /**
   * 取消选择
   */
  deselectBone() {
    this.selectedBone = null;
  }

  /**
   * 设置骨骼位置
   */
  setBonePosition(boneId, x, y) {
    const bone = this.bones.get(boneId);
    if (bone) {
      bone.position = { x, y };
      this.updateWorldTransforms();
      return true;
    }
    return false;
  }

  /**
   * 设置骨骼旋转
   */
  setBoneRotation(boneId, rotation) {
    const bone = this.bones.get(boneId);
    if (bone) {
      bone.rotation = rotation;
      this.updateWorldTransforms();
      return true;
    }
    return false;
  }

  /**
   * 设置骨骼缩放
   */
  setBoneScale(boneId, scaleX, scaleY) {
    const bone = this.bones.get(boneId);
    if (bone) {
      bone.scale = { x: scaleX, y: scaleY };
      this.updateWorldTransforms();
      return true;
    }
    return false;
  }

  /**
   * 更新所有骨骼的世界变换
   */
  updateWorldTransforms() {
    this.rootBones.forEach(bone => {
      bone.updateWorldTransform();
    });
  }

  /**
   * 从屏幕坐标找到最近的骨骼
   * (用于鼠标拾取)
   */
  pickBoneAtPosition(x, y, pickRadius = 10) {
    let nearestBone = null;
    let minDistance = pickRadius;

    this.bones.forEach((bone, _id) => {
      // 检查关节（骨骼起点）
      const dx1 = bone.worldPosition.x - x;
      const dy1 = bone.worldPosition.y - y;
      const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

      if (dist1 < minDistance) {
        nearestBone = bone;
        minDistance = dist1;
      }

      // 检查骨骼末端
      const end = bone.getEndPosition();
      const dx2 = end.x - x;
      const dy2 = end.y - y;
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      if (dist2 < minDistance) {
        nearestBone = bone;
        minDistance = dist2;
      }
    });

    return nearestBone;
  }

  /**
   * 设置骨骼的父骨骼
   */
  setParent(boneId, parentBoneId) {
    const bone = this.bones.get(boneId);
    const parent = parentBoneId ? this.bones.get(parentBoneId) : null;

    if (!bone) return false;

    // 防止循环依赖
    if (parent && parent.getAllChildren().includes(bone)) {
      console.warn('Cannot set parent: would create a cycle');
      return false;
    }

    // 移除旧的父子关系
    if (bone.parent) {
      bone.parent.removeChild(bone);
    } else {
      const idx = this.rootBones.indexOf(bone);
      if (idx > -1) {
        this.rootBones.splice(idx, 1);
      }
    }

    // 设置新的父子关系
    if (parent) {
      parent.addChild(bone);
    } else {
      this.rootBones.push(bone);
    }

    this.updateWorldTransforms();
    return true;
  }

  /**
   * 序列化整个骨骼系统
   */
  serialize() {
    return {
      name: this.name,
      boneCount: this.boneCount,
      bones: this.rootBones.map(bone => bone.serialize())
    };
  }

  /**
   * 反序列化骨骼系统
   */
  static deserialize(data) {
    const skeleton = new Skeleton(data.name);
    skeleton.boneCount = data.boneCount || 0;

    if (data.bones && data.bones.length > 0) {
      data.bones.forEach(boneData => {
        const bone = Bone.deserialize(boneData);
        skeleton.addBone(bone);
      });
    }

    skeleton.updateWorldTransforms();
    return skeleton;
  }

  /**
   * 复制骨骼系统
   */
  clone() {
    const cloned = new Skeleton(this.name);
    cloned.boneCount = this.boneCount;

    this.rootBones.forEach(bone => {
      const clonedBone = bone.clone();
      cloned.addBone(clonedBone);
    });

    cloned.updateWorldTransforms();
    return cloned;
  }

  /**
   * 获取所有骨骼的列表（平铺，用于迭代）
   */
  getAllBones() {
    const result = [];
    const traverse = (bone) => {
      result.push(bone);
      bone.children.forEach(child => traverse(child));
    };
    this.rootBones.forEach(bone => traverse(bone));
    return result;
  }

  /**
   * 删除所有骨骼
   */
  clear() {
    this.bones.clear();
    this.rootBones = [];
    this.selectedBone = null;
    this.boneCount = 0;
  }
}

