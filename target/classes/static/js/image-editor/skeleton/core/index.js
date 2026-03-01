/**
 * Skeleton Animation Core - 索引文件
 *
 * 导出所有核心类供外部使用
 */

// 注意：在实际使用中，这些文件会通过 <script> 标签单独引入
// 这个文件仅用于文档和类型提示

// 数学和变换
// - Matrix2D.js

// 骨骼系统
// - Bone.js
// - Skeleton.js

// 动画系统
// - Keyframe.js
// - Track.js
// - Animation.js
// - AnimationPlayer.js

// 命令系统
// - SkeletonCommands.js

// 导出（用于 ES6 模块）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Matrix2D,
    Bone,
    Skeleton,
    Keyframe,
    Track,
    Animation,
    AnimationPlayer,
    AddBoneCommand,
    RemoveBoneCommand,
    SetBonePositionCommand,
    SetBoneRotationCommand,
    SetBoneScaleCommand,
    RenameBoneCommand,
    SetBoneParentCommand,
    SetKeyframeCommand,
    RemoveKeyframeCommand
  };
}

