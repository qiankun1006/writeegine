/**
 * Animation.js - 动画类
 *
 * 管理整个动画，包括关键帧、时间轴、播放参数等
 */
class Animation {
  constructor(name = 'Animation', fps = 24, frameCount = 60) {
    this.name = name;
    this.fps = fps;                 // 帧速率
    this.frameCount = frameCount;   // 总帧数
    this.duration = frameCount / fps; // 持续时间（秒）

    this.tracks = new Map();        // boneId → Track

    this.loop = true;               // 循环播放
    this.autoPlay = false;
  }

  /**
   * 为骨骼获取或创建轨道
   */
  getOrCreateTrack(boneId) {
    if (!this.tracks.has(boneId)) {
      this.tracks.set(boneId, new Track(boneId));
    }
    return this.tracks.get(boneId);
  }

  /**
   * 获取轨道
   */
  getTrack(boneId) {
    return this.tracks.get(boneId);
  }

  /**
   * 移除轨道
   */
  removeTrack(boneId) {
    return this.tracks.delete(boneId);
  }

  /**
   * 在指定帧设置关键帧
   */
  setKeyframe(boneId, frameIndex, bone) {
    const track = this.getOrCreateTrack(boneId);
    return track.setKeyframe(frameIndex, bone);
  }

  /**
   * 移除关键帧
   */
  removeKeyframe(boneId, frameIndex) {
    const track = this.tracks.get(boneId);
    if (track) {
      return track.removeKeyframe(frameIndex);
    }
    return false;
  }

  /**
   * 检查某一帧是否有关键帧
   */
  hasKeyframeAt(boneId, frameIndex) {
    const track = this.tracks.get(boneId);
    if (track) {
      return track.hasKeyframeAt(frameIndex);
    }
    return false;
  }

  /**
   * 获取指定时间的骨骼变换
   */
  evaluateBone(boneId, time) {
    const track = this.tracks.get(boneId);
    if (!track) return null;
    return track.evaluate(time, this.duration, this.fps);
  }

  /**
   * 获取指定帧的骨骼变换
   */
  evaluateBoneAtFrame(boneId, frameIndex) {
    const time = (frameIndex / this.fps);
    return this.evaluateBone(boneId, time);
  }

  /**
   * 修改帧速率（会改变总时长）
   */
  setFPS(fps) {
    if (fps <= 0) {
      console.warn('FPS must be greater than 0');
      return false;
    }
    this.fps = fps;
    this.duration = this.frameCount / fps;
    return true;
  }

  /**
   * 修改帧数（会改变总时长）
   */
  setFrameCount(frameCount) {
    if (frameCount <= 0) {
      console.warn('Frame count must be greater than 0');
      return false;
    }
    this.frameCount = frameCount;
    this.duration = frameCount / this.fps;
    return true;
  }

  /**
   * 获取所有有关键帧的骨骼 ID
   */
  getBoneIds() {
    return Array.from(this.tracks.keys());
  }

  /**
   * 获取动画的总时间范围
   */
  getTimeRange() {
    if (this.tracks.size === 0) {
      return { start: 0, end: 0 };
    }

    let start = Infinity;
    let end = -Infinity;

    this.tracks.forEach(track => {
      const range = track.getTimeRange();
      if (range.start < start) start = range.start;
      if (range.end > end) end = range.end;
    });

    return {
      start: isFinite(start) ? start : 0,
      end: isFinite(end) ? end : 0
    };
  }

  /**
   * 序列化
   */
  serialize() {
    return {
      name: this.name,
      fps: this.fps,
      frameCount: this.frameCount,
      duration: this.duration,
      loop: this.loop,
      autoPlay: this.autoPlay,
      tracks: Object.fromEntries(
        Array.from(this.tracks.entries()).map(([boneId, track]) => [
          boneId,
          track.serialize()
        ])
      )
    };
  }

  /**
   * 反序列化
   */
  static deserialize(data) {
    const animation = new Animation(data.name, data.fps, data.frameCount);
    animation.loop = data.loop;
    animation.autoPlay = data.autoPlay;

    if (data.tracks) {
      Object.entries(data.tracks).forEach(([boneId, trackData]) => {
        const track = Track.deserialize(trackData);
        animation.tracks.set(boneId, track);
      });
    }

    return animation;
  }

  /**
   * 复制动画
   */
  clone() {
    const cloned = new Animation(this.name, this.fps, this.frameCount);
    cloned.loop = this.loop;
    cloned.autoPlay = this.autoPlay;

    this.tracks.forEach((track, boneId) => {
      cloned.tracks.set(boneId, track.clone());
    });

    return cloned;
  }

  /**
   * 清除所有关键帧
   */
  clear() {
    this.tracks.forEach(track => track.clear());
    this.tracks.clear();
  }

  /**
   * 对所有轨道中的所有关键帧执行操作
   */
  forEachKeyframe(callback) {
    this.tracks.forEach(track => {
      track.getKeyframes().forEach(kf => {
        callback(kf);
      });
    });
  }

  /**
   * 获取指定帧数附近的关键帧
   */
  getNearestKeyframes(frameIndex, radius = 5) {
    const result = [];

    this.tracks.forEach(track => {
      const kf = track.getNearestKeyframe(frameIndex, radius);
      if (kf) {
        result.push({
          boneId: track.boneId,
          keyframe: kf
        });
      }
    });

    return result;
  }
}

