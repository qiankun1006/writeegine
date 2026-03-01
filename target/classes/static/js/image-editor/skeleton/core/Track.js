/**
 * Track.js - 动画轨道类
 *
 * 代表一个骨骼在整个动画中的变换轨道
 * 包含该骨骼的所有关键帧
 */
class Track {
  constructor(boneId) {
    this.boneId = boneId;
    this.keyframes = new Map();    // frameIndex → Keyframe
  }

  /**
   * 设置关键帧
   */
  setKeyframe(frameIndex, bone) {
    const kf = new Keyframe(frameIndex, bone);
    this.keyframes.set(frameIndex, kf);
    return kf;
  }

  /**
   * 移除关键帧
   */
  removeKeyframe(frameIndex) {
    return this.keyframes.delete(frameIndex);
  }

  /**
   * 获取关键帧
   */
  getKeyframe(frameIndex) {
    return this.keyframes.get(frameIndex);
  }

  /**
   * 获取所有关键帧（排序）
   */
  getKeyframes() {
    return Array.from(this.keyframes.values())
      .sort((a, b) => a.frameIndex - b.frameIndex);
  }

  /**
   * 获取指定时间的插值值
   */
  evaluate(time, duration, fps) {
    if (this.keyframes.size === 0) return null;

    const frameIndex = (time / duration) * fps;
    const keyframes = this.getKeyframes();

    // 找到前后的关键帧
    let kfBefore = null;
    let kfAfter = null;

    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].frameIndex <= frameIndex) {
        kfBefore = keyframes[i];
      }
      if (keyframes[i].frameIndex >= frameIndex && !kfAfter) {
        kfAfter = keyframes[i];
      }
    }

    // 只有一个关键帧或在第一帧之前
    if (!kfBefore && !kfAfter) return null;
    if (!kfBefore) return { ...kfAfter.bone };
    if (!kfAfter) return { ...kfBefore.bone };

    // 两个关键帧相同
    if (kfBefore === kfAfter) {
      return { ...kfBefore.bone };
    }

    // 计算插值比例
    const frameRange = kfAfter.frameIndex - kfBefore.frameIndex;
    const t = (frameIndex - kfBefore.frameIndex) / frameRange;

    // 根据插值方式计算
    return this.interpolate(kfBefore, kfAfter, t);
  }

  /**
   * 在两个关键帧间插值
   */
  interpolate(kfBefore, kfAfter, t) {
    const type = kfBefore.interpolation;

    if (type === 'step') {
      // 步进：不插值，直接取前一帧
      return { ...kfBefore.bone };
    } else if (type === 'bezier') {
      // 贝塞尔曲线插值（高级功能，暂时使用线性）
      return this.linearInterpolate(kfBefore.bone, kfAfter.bone, t);
    } else {
      // 线性插值（默认）
      return this.linearInterpolate(kfBefore.bone, kfAfter.bone, t);
    }
  }

  /**
   * 线性插值
   */
  linearInterpolate(boneA, boneB, t) {
    return {
      position: {
        x: boneA.position.x + (boneB.position.x - boneA.position.x) * t,
        y: boneA.position.y + (boneB.position.y - boneA.position.y) * t
      },
      rotation: this.lerpAngle(boneA.rotation, boneB.rotation, t),
      scale: {
        x: boneA.scale.x + (boneB.scale.x - boneA.scale.x) * t,
        y: boneA.scale.y + (boneB.scale.y - boneA.scale.y) * t
      }
    };
  }

  /**
   * 角度插值（处理 2π 环绕）
   */
  lerpAngle(a, b, t) {
    let delta = b - a;

    // 取最短路径
    if (delta > Math.PI) {
      delta -= 2 * Math.PI;
    } else if (delta < -Math.PI) {
      delta += 2 * Math.PI;
    }

    return a + delta * t;
  }

  /**
   * 序列化
   */
  serialize() {
    return {
      boneId: this.boneId,
      keyframes: Object.fromEntries(
        Array.from(this.keyframes.entries()).map(([frameIdx, kf]) => [
          frameIdx,
          kf.serialize()
        ])
      )
    };
  }

  /**
   * 反序列化
   */
  static deserialize(data) {
    const track = new Track(data.boneId);

    if (data.keyframes) {
      Object.entries(data.keyframes).forEach(([frameIdx, kfData]) => {
        const kf = Keyframe.deserialize(kfData);
        track.keyframes.set(parseInt(frameIdx), kf);
      });
    }

    return track;
  }

  /**
   * 复制轨道
   */
  clone() {
    const cloned = new Track(this.boneId);

    this.keyframes.forEach((kf, frameIdx) => {
      cloned.keyframes.set(frameIdx, kf.clone());
    });

    return cloned;
  }

  /**
   * 获取轨道的时间范围
   */
  getTimeRange() {
    if (this.keyframes.size === 0) {
      return { start: 0, end: 0 };
    }

    const frames = Array.from(this.keyframes.keys());
    return {
      start: Math.min(...frames),
      end: Math.max(...frames)
    };
  }

  /**
   * 检查某一帧是否有关键帧
   */
  hasKeyframeAt(frameIndex) {
    return this.keyframes.has(frameIndex);
  }

  /**
   * 获取最近的关键帧
   */
  getNearestKeyframe(frameIndex, radius = 5) {
    for (let i = frameIndex - radius; i <= frameIndex + radius; i++) {
      if (this.keyframes.has(i)) {
        return this.keyframes.get(i);
      }
    }
    return null;
  }

  /**
   * 清除所有关键帧
   */
  clear() {
    this.keyframes.clear();
  }
}

