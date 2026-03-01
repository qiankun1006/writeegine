/**
 * Timeline.js - 时间轴编辑器
 *
 * 显示和编辑动画关键帧时间轴
 */
class Timeline {
  constructor(animation, skeleton) {
    this.animation = animation;
    this.skeleton = skeleton;
    this.container = null;
    this.canvas = null;
    this.ctx = null;

    // 时间轴参数
    this.pixelsPerFrame = 10;  // 每帧的像素宽度
    this.currentTime = 0;
    this.selectedKeyframes = new Set();

    // 缩放和滚动
    this.scrollX = 0;
    this.zoomLevel = 1.0;

    // 常量
    this.headerHeight = 30;
    this.trackHeight = 20;
    this.keyframeSize = 8;

    // 回调
    this.onTimeChanged = null;
    this.onKeyframeSelected = null;
  }

  /**
   * 初始化时间轴
   */
  init(parentSelector) {
    this.container = document.querySelector(parentSelector);
    if (!this.container) {
      console.warn(`Timeline: Parent element not found: ${parentSelector}`);
      return;
    }

    this.container.innerHTML = `
      <div class="timeline-header">
        <div class="timeline-controls">
          <button id="play-btn">▶ 播放</button>
          <button id="pause-btn">⏸ 暂停</button>
          <button id="stop-btn">⏹ 停止</button>
        </div>
        <div class="timeline-info">
          <span>时间: <span id="time-display">0.0</span>s</span>
          <span>帧: <span id="frame-display">0</span>/<span id="total-frames">${this.animation.frameCount}</span></span>
          <span>FPS: ${this.animation.fps}</span>
        </div>
      </div>
      <div class="timeline-canvas-wrapper" id="timeline-wrapper">
        <canvas id="timeline-canvas"></canvas>
        <div class="timeline-time-indicator" id="time-indicator"></div>
      </div>
    `;

    this.canvas = this.container.querySelector('#timeline-canvas');
    this.ctx = this.canvas.getContext('2d');

    // 设置画布尺寸
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = 300;

    // 绑定事件
    this._setupEventListeners();

    // 首次渲染
    this.render();
  }

  /**
   * 设置事件监听
   */
  _setupEventListeners() {
    // 播放/暂停/停止按钮
    this.container.querySelector('#play-btn').onclick = () => {
      if (this.onPlayClick) this.onPlayClick();
    };

    this.container.querySelector('#pause-btn').onclick = () => {
      if (this.onPauseClick) this.onPauseClick();
    };

    this.container.querySelector('#stop-btn').onclick = () => {
      if (this.onStopClick) this.onStopClick();
    };

    // 鼠标事件
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));

    // 滚轮缩放
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this._onMouseWheel(e);
    });
  }

  /**
   * 渲染时间轴
   */
  render() {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制时间刻度
    this._drawTimeScale();

    // 绘制关键帧轨道
    this._drawKeyframeTracks();

    // 更新时间指示器
    this._updateTimeIndicator();

    // 更新显示信息
    this._updateDisplay();
  }

  /**
   * 绘制时间刻度
   */
  _drawTimeScale() {
    const headerHeight = this.headerHeight;
    const frameSpacing = this.pixelsPerFrame * this.zoomLevel;

    // 背景
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.canvas.width, headerHeight);

    // 刻度线和数字
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';

    for (let frame = 0; frame <= this.animation.frameCount; frame += 5) {
      const x = frame * frameSpacing - this.scrollX;

      if (x < 0 || x > this.canvas.width) continue;

      // 主刻度线
      this.ctx.beginPath();
      this.ctx.moveTo(x, headerHeight - 5);
      this.ctx.lineTo(x, headerHeight);
      this.ctx.stroke();

      // 数字标签
      if (frame % 10 === 0) {
        this.ctx.fillText(`${frame}f`, x, headerHeight - 8);
      }
    }
  }

  /**
   * 绘制关键帧轨道
   */
  _drawKeyframeTracks() {
    const headerHeight = this.headerHeight;
    const frameSpacing = this.pixelsPerFrame * this.zoomLevel;
    let trackY = headerHeight;

    if (!this.skeleton) return;

    this.skeleton.getAllBones().forEach(bone => {
      const track = this.animation.getTrack(bone.id);

      // 轨道背景
      if (trackY % (this.trackHeight * 2) === 0) {
        this.ctx.fillStyle = '#1a1a1a';
      } else {
        this.ctx.fillStyle = '#262626';
      }
      this.ctx.fillRect(0, trackY, this.canvas.width, this.trackHeight);

      // 绘制关键帧
      if (track) {
        track.getKeyframes().forEach(kf => {
          const x = kf.frameIndex * frameSpacing - this.scrollX;

          if (x >= 0 && x <= this.canvas.width) {
            this.ctx.fillStyle = this.selectedKeyframes.has(`${bone.id}_${kf.frameIndex}`)
              ? '#ffaa00'
              : '#00cc44';
            this.ctx.fillRect(
              x - this.keyframeSize / 2,
              trackY + this.trackHeight / 2 - this.keyframeSize / 2,
              this.keyframeSize,
              this.keyframeSize
            );
          }
        });
      }

      trackY += this.trackHeight;
    });

    // 绘制轨道分割线
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 0.5;
    trackY = headerHeight;
    while (trackY < this.canvas.height) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, trackY);
      this.ctx.lineTo(this.canvas.width, trackY);
      this.ctx.stroke();
      trackY += this.trackHeight;
    }
  }

  /**
   * 更新时间指示器
   */
  _updateTimeIndicator() {
    const frameSpacing = this.pixelsPerFrame * this.zoomLevel;
    const x = this.currentTime / this.animation.duration *
              this.animation.frameCount * frameSpacing - this.scrollX;

    const indicator = this.container.querySelector('#time-indicator');
    if (indicator) {
      indicator.style.left = `${x}px`;
    }
  }

  /**
   * 更新显示信息
   */
  _updateDisplay() {
    const currentFrame = Math.round(this.currentTime / this.animation.duration * this.animation.frameCount);

    this.container.querySelector('#time-display').textContent =
      this.currentTime.toFixed(2);
    this.container.querySelector('#frame-display').textContent =
      currentFrame;
  }

  /**
   * 鼠标按下
   */
  _onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.scrollX;
    const y = e.clientY - rect.top;

    if (y < this.headerHeight) {
      // 点击时间轴头部，移动时间指示器
      const frameSpacing = this.pixelsPerFrame * this.zoomLevel;
      const frame = Math.round(x / frameSpacing);
      const time = (frame / this.animation.frameCount) * this.animation.duration;
      this.setTime(Math.max(0, Math.min(time, this.animation.duration)));
    } else {
      // 点击关键帧
      this._selectKeyframeAt(x, y);
    }
  }

  /**
   * 鼠标移动
   */
  _onMouseMove(e) {
    // 可以扩展为拖拽关键帧
  }

  /**
   * 鼠标抬起
   */
  _onMouseUp(e) {
    // 完成拖拽操作
  }

  /**
   * 鼠标滚轮
   */
  _onMouseWheel(e) {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoomLevel *= delta;
    this.zoomLevel = Math.max(0.5, Math.min(this.zoomLevel, 5));
    this.render();
  }

  /**
   * 选择关键帧
   */
  _selectKeyframeAt(x, y) {
    const frameSpacing = this.pixelsPerFrame * this.zoomLevel;
    const frameX = Math.round(x / frameSpacing);
    const trackIndex = Math.floor((y - this.headerHeight) / this.trackHeight);

    const bones = this.skeleton.getAllBones();
    if (trackIndex >= 0 && trackIndex < bones.length) {
      const bone = bones[trackIndex];
      const keyId = `${bone.id}_${frameX}`;

      if (this.selectedKeyframes.has(keyId)) {
        this.selectedKeyframes.delete(keyId);
      } else {
        this.selectedKeyframes.add(keyId);
      }

      this.render();

      if (this.onKeyframeSelected) {
        this.onKeyframeSelected(bone.id, frameX);
      }
    }
  }

  /**
   * 设置当前时间
   */
  setTime(time) {
    this.currentTime = time;

    if (this.onTimeChanged) {
      this.onTimeChanged(time);
    }

    this.render();
  }

  /**
   * 设置当前帧
   */
  setFrame(frameIndex) {
    const time = (frameIndex / this.animation.frameCount) * this.animation.duration;
    this.setTime(time);
  }

  /**
   * 清理
   */
  dispose() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.animation = null;
    this.skeleton = null;
  }
}

