/**
 * AnimationPlayer.js - 动画播放器
 *
 * 控制动画的播放、暂停、停止
 * 计算当前时间对应的骨骼变换
 */
class AnimationPlayer {
  constructor(skeleton, animation) {
    this.skeleton = skeleton;
    this.animation = animation;

    this.isPlaying = false;
    this.currentTime = 0;           // 秒
    this.playSpeed = 1.0;           // 播放速度倍数
    this.loop = animation.loop;

    // 回调
    this.onPlayStateChanged = null;
    this.onTimeChanged = null;
    this.onAnimationFinished = null;
  }

  /**
   * 播放
   */
  play() {
    this.isPlaying = true;
    if (this.onPlayStateChanged) {
      this.onPlayStateChanged('playing');
    }
  }

  /**
   * 暂停
   */
  pause() {
    this.isPlaying = false;
    if (this.onPlayStateChanged) {
      this.onPlayStateChanged('paused');
    }
  }

  /**
   * 停止并重置
   */
  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    this.updateSkeleton();
    if (this.onPlayStateChanged) {
      this.onPlayStateChanged('stopped');
    }
  }

  /**
   * 设置当前时间
   */
  setTime(time) {
    this.currentTime = Math.max(0, Math.min(time, this.animation.duration));
    this.updateSkeleton();

    if (this.onTimeChanged) {
      this.onTimeChanged(this.currentTime);
    }
  }

  /**
   * 设置当前帧
   */
  setFrame(frameIndex) {
    const time = (frameIndex / this.animation.fps);
    this.setTime(time);
  }

  /**
   * 获取当前帧
   */
  getCurrentFrame() {
    return Math.round((this.currentTime / this.animation.duration) * this.animation.frameCount);
  }

  /**
   * 设置播放速度
   */
  setPlaySpeed(speed) {
    if (speed <= 0) {
      console.warn('Play speed must be greater than 0');
      return;
    }
    this.playSpeed = speed;
  }

  /**
   * 更新（每帧调用）
   */
  update(deltaTime) {
    if (!this.isPlaying) return;

    this.currentTime += deltaTime * this.playSpeed;

    if (this.currentTime >= this.animation.duration) {
      if (this.loop) {
        this.currentTime = 0;
      } else {
        this.currentTime = this.animation.duration;
        this.isPlaying = false;

        if (this.onAnimationFinished) {
          this.onAnimationFinished();
        }
        if (this.onPlayStateChanged) {
          this.onPlayStateChanged('finished');
        }
      }
    }

    this.updateSkeleton();

    if (this.onTimeChanged) {
      this.onTimeChanged(this.currentTime);
    }
  }

  /**
   * 更新骨骼变换到当前时间
   */
  updateSkeleton() {
    if (!this.skeleton || !this.animation) return;

    // 对每个有动画的骨骼应用变换
    this.animation.tracks.forEach((track, boneId) => {
      const bone = this.skeleton.getBone(boneId);
      if (bone) {
        const transform = track.evaluate(
          this.currentTime,
          this.animation.duration,
          this.animation.fps
        );

        if (transform) {
          bone.position = { ...transform.position };
          bone.rotation = transform.rotation;
          bone.scale = { ...transform.scale };
        }
      }
    });

    // 更新所有骨骼的世界变换
    this.skeleton.updateWorldTransforms();
  }

  /**
   * 设置循环播放
   */
  setLoop(loop) {
    this.loop = loop;
  }

  /**
   * 前进一帧
   */
  stepForward() {
    const nextFrame = this.getCurrentFrame() + 1;
    if (nextFrame <= this.animation.frameCount) {
      this.setFrame(nextFrame);
    }
  }

  /**
   * 后退一帧
   */
  stepBackward() {
    const prevFrame = this.getCurrentFrame() - 1;
    if (prevFrame >= 0) {
      this.setFrame(prevFrame);
    }
  }

  /**
   * 跳转到起始
   */
  goToStart() {
    this.setTime(0);
  }

  /**
   * 跳转到结束
   */
  goToEnd() {
    this.setTime(this.animation.duration);
  }

  /**
   * 获取播放状态信息
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      currentFrame: this.getCurrentFrame(),
      totalFrames: this.animation.frameCount,
      duration: this.animation.duration,
      playSpeed: this.playSpeed,
      loop: this.loop
    };
  }

  /**
   * 克隆播放器（共享相同的骨骼和动画）
   */
  clone() {
    const cloned = new AnimationPlayer(this.skeleton, this.animation);
    cloned.playSpeed = this.playSpeed;
    cloned.loop = this.loop;
    return cloned;
  }
}

