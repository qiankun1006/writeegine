/**
 * ExportManager.js - 骨骼动画导出管理器
 *
 * 负责将骨骼动画数据导出为各种格式
 */
class ExportManager {
  constructor() {
    this.exportFormats = {
      json: 'JSON',
      pngSequence: 'PNG Sequence',
      webm: 'WebM Video'
    };
  }

  /**
   * 导出为 JSON 格式
   * @param {Object} data - 骨骼动画数据
   * @param {string} filename - 文件名
   */
  exportToJSON(data, filename = 'skeleton-animation.json') {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      this._downloadFile(jsonStr, filename, 'application/json');
      return true;
    } catch (error) {
      console.error('导出 JSON 失败:', error);
      alert('导出 JSON 失败: ' + error.message);
      return false;
    }
  }

  /**
   * 导出为 PNG 序列帧
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {AnimationPlayer} player - 动画播放器
   * @param {Skeleton} skeleton - 骨骼系统
   * @param {string} filename - 基础文件名
   * @param {Function} onProgress - 进度回调
   */
  async exportToPNGSequence(ctx, player, skeleton, filename = 'frame', onProgress = null) {
    try {
      const frameCount = player.animation.frameCount;
      const frames = [];

      // 保存当前播放状态
      const wasPlaying = player.isPlaying;
      const currentTime = player.currentTime;

      player.pause();

      // 渲染每一帧
      for (let i = 0; i < frameCount; i++) {
        player.setFrame(i);

        // 清空画布
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 渲染骨骼
        this._renderSkeleton(ctx, skeleton);

        // 获取图像数据
        const dataUrl = canvas.toDataURL('image/png');
        frames.push(dataUrl);

        // 更新进度
        if (onProgress) {
          onProgress(i + 1, frameCount);
        }
      }

      // 恢复播放状态
      player.setTime(currentTime);
      if (wasPlaying) {
        player.play();
      }

      // 下载所有帧
      for (let i = 0; i < frames.length; i++) {
        const frameFilename = `${filename}_${String(i).padStart(4, '0')}.png`;
        this._downloadDataUrl(frames[i], frameFilename);

        // 延迟下载以避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return true;
    } catch (error) {
      console.error('导出 PNG 序列失败:', error);
      alert('导出 PNG 序列失败: ' + error.message);
      return false;
    }
  }

  /**
   * 导出为 WebM 视频
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {AnimationPlayer} player - 动画播放器
   * @param {Skeleton} skeleton - 骨骼系统
   * @param {string} filename - 文件名
   * @param {Function} onProgress - 进度回调
   */
  async exportToWebM(ctx, player, skeleton, filename = 'animation.webm', onProgress = null) {
    try {
      const canvas = ctx.canvas;
      const stream = canvas.captureStream(player.animation.fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        if (onProgress) {
          onProgress(100, 100);
        }
      };

      // 保存当前播放状态
      const wasPlaying = player.isPlaying;
      const currentTime = player.currentTime;

      player.pause();
      player.goToStart();

      // 开始录制
      mediaRecorder.start();

      // 播放动画
      player.play();

      // 监听动画完成
      const onAnimationFinished = () => {
        mediaRecorder.stop();
        player.pause();

        // 恢复播放状态
        player.setTime(currentTime);
        if (wasPlaying) {
          player.play();
        }

        player.onAnimationFinished = null;
      };

      player.onAnimationFinished = onAnimationFinished;

      return true;
    } catch (error) {
      console.error('导出 WebM 失败:', error);
      alert('导出 WebM 失败: ' + error.message);
      return false;
    }
  }

  /**
   * 从 JSON 导入骨骼动画
   * @param {File} file - JSON 文件
   * @returns {Promise<Object>} 骨骼动画数据
   */
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            resolve(data);
          } catch (error) {
            reject(new Error('JSON 解析失败: ' + error.message));
          }
        };
        reader.onerror = () => {
          reject(new Error('文件读取失败'));
        };
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 渲染骨骼到画布
   * @private
   */
  _renderSkeleton(ctx, skeleton) {
    skeleton.getAllBones().forEach(bone => {
      if (!bone.visible) return;

      const startX = bone.worldPosition.x;
      const startY = bone.worldPosition.y;
      const end = bone.getEndPosition();

      // 绘制骨骼线
      ctx.strokeStyle = '#0088ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // 绘制关节
      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.arc(startX, startY, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * 下载文件
   * @private
   */
  _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 下载 Data URL
   * @private
   */
  _downloadDataUrl(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }
}

