/**
 * SkeletonCommands.js - 骨骼编辑命令集
 *
 * 提供支持撤销重做的各种骨骼编辑操作
 */

/**
 * 添加骨骼命令
 */
class AddBoneCommand extends Command {
  constructor(skeleton, bone, parentId = null) {
    super();
    this.skeleton = skeleton;
    this.bone = bone;
    this.parentId = parentId;
  }

  execute() {
    this.skeleton.addBone(this.bone, this.parentId);
    return true;
  }

  undo() {
    this.skeleton.removeBone(this.bone.id);
    return true;
  }
}

/**
 * 删除骨骼命令
 */
class RemoveBoneCommand extends Command {
  constructor(skeleton, boneId) {
    super();
    this.skeleton = skeleton;
    this.boneId = boneId;
    this.bone = null;
    this.parent = null;
    this.parentIndex = -1;

    // 保存骨骼及其树结构
    const bone = skeleton.getBone(boneId);
    if (bone) {
      this.bone = bone.clone();
      this.parent = bone.parent;
      if (!this.parent) {
        this.parentIndex = skeleton.rootBones.indexOf(bone);
      }
    }
  }

  execute() {
    return this.skeleton.removeBone(this.boneId);
  }

  undo() {
    if (this.bone) {
      const parentId = this.parent ? this.parent.id : null;
      this.skeleton.addBone(this.bone, parentId);
      return true;
    }
    return false;
  }
}

/**
 * 设置骨骼位置命令
 */
class SetBonePositionCommand extends Command {
  constructor(skeleton, boneId, newPos, oldPos) {
    super();
    this.skeleton = skeleton;
    this.boneId = boneId;
    this.newPos = { ...newPos };
    this.oldPos = { ...oldPos };
  }

  execute() {
    return this.skeleton.setBonePosition(this.boneId, this.newPos.x, this.newPos.y);
  }

  undo() {
    return this.skeleton.setBonePosition(this.boneId, this.oldPos.x, this.oldPos.y);
  }
}

/**
 * 设置骨骼旋转命令
 */
class SetBoneRotationCommand extends Command {
  constructor(skeleton, boneId, newRotation, oldRotation) {
    super();
    this.skeleton = skeleton;
    this.boneId = boneId;
    this.newRotation = newRotation;
    this.oldRotation = oldRotation;
  }

  execute() {
    return this.skeleton.setBoneRotation(this.boneId, this.newRotation);
  }

  undo() {
    return this.skeleton.setBoneRotation(this.boneId, this.oldRotation);
  }
}

/**
 * 设置骨骼缩放命令
 */
class SetBoneScaleCommand extends Command {
  constructor(skeleton, boneId, newScale, oldScale) {
    super();
    this.skeleton = skeleton;
    this.boneId = boneId;
    this.newScale = { ...newScale };
    this.oldScale = { ...oldScale };
  }

  execute() {
    return this.skeleton.setBoneScale(this.boneId, this.newScale.x, this.newScale.y);
  }

  undo() {
    return this.skeleton.setBoneScale(this.boneId, this.oldScale.x, this.oldScale.y);
  }
}

/**
 * 重命名骨骼命令
 */
class RenameBoneCommand extends Command {
  constructor(bone, newName, oldName) {
    super();
    this.bone = bone;
    this.newName = newName;
    this.oldName = oldName;
  }

  execute() {
    this.bone.name = this.newName;
    return true;
  }

  undo() {
    this.bone.name = this.oldName;
    return true;
  }
}

/**
 * 设置骨骼父级命令
 */
class SetBoneParentCommand extends Command {
  constructor(skeleton, boneId, newParentId, oldParentId) {
    super();
    this.skeleton = skeleton;
    this.boneId = boneId;
    this.newParentId = newParentId;
    this.oldParentId = oldParentId;
  }

  execute() {
    return this.skeleton.setParent(this.boneId, this.newParentId);
  }

  undo() {
    return this.skeleton.setParent(this.boneId, this.oldParentId);
  }
}

/**
 * 设置关键帧命令
 */
class SetKeyframeCommand extends Command {
  constructor(animation, boneId, frameIndex, newBone, oldBone) {
    super();
    this.animation = animation;
    this.boneId = boneId;
    this.frameIndex = frameIndex;
    this.newBone = { ...newBone };
    this.oldBone = oldBone ? { ...oldBone } : null;
    this.hadKeyframe = oldBone !== null;
  }

  execute() {
    const bone = this.animation.skeleton.getBone(this.boneId);
    if (bone) {
      this.animation.setKeyframe(this.boneId, this.frameIndex, this.newBone);
      return true;
    }
    return false;
  }

  undo() {
    if (this.hadKeyframe && this.oldBone) {
      const bone = this.animation.skeleton.getBone(this.boneId);
      if (bone) {
        this.animation.setKeyframe(this.boneId, this.frameIndex, this.oldBone);
        return true;
      }
    } else {
      return this.animation.removeKeyframe(this.boneId, this.frameIndex);
    }
    return false;
  }
}

/**
 * 删除关键帧命令
 */
class RemoveKeyframeCommand extends Command {
  constructor(animation, boneId, frameIndex, bone) {
    super();
    this.animation = animation;
    this.boneId = boneId;
    this.frameIndex = frameIndex;
    this.bone = bone ? { ...bone } : null;
  }

  execute() {
    return this.animation.removeKeyframe(this.boneId, this.frameIndex);
  }

  undo() {
    if (this.bone) {
      this.animation.setKeyframe(this.boneId, this.frameIndex, this.bone);
      return true;
    }
    return false;
  }
}

