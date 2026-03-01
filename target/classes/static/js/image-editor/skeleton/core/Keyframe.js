/**
 * Keyframe.js - 关键帧类
 *
 * 表示在特定时间点骨骼的变换值
 * 支持不同的插值方式
 */
class Keyframe {
  constructor(frameIndex, bone) {
    this.frameIndex = frameIndex;
    this.bone = {
      position: { ...bone.position },
      rotation: bone.rotation,
      scale: { ...bone.scale }
    };
    this.interpolation = 'linear';  // 'linear' | 'bezier' | 'step'

    // 贝塞尔曲线控制点（可选）
    this.inTangent = { x: 0, y: 0 };   // 前向切线
    this.outTangent = { x: 0, y: 0 };  // 后向切线
  }

  /**
   * 序列化
   */
  serialize() {
    return {
      frameIndex: this.frameIndex,
      bone: this.bone,
      interpolation: this.interpolation,
      inTangent: this.inTangent,
      outTangent: this.outTangent
    };
  }

  /**
   * 反序列化
   */
  static deserialize(data) {
    const kf = new Keyframe(data.frameIndex, data.bone);
    kf.interpolation = data.interpolation || 'linear';
    kf.inTangent = data.inTangent || { x: 0, y: 0 };
    kf.outTangent = data.outTangent || { x: 0, y: 0 };
    return kf;
  }

  /**
   * 复制关键帧
   */
  clone() {
    const cloned = new Keyframe(this.frameIndex, this.bone);
    cloned.interpolation = this.interpolation;
    cloned.inTangent = { ...this.inTangent };
    cloned.outTangent = { ...this.outTangent };
    return cloned;
  }
}

