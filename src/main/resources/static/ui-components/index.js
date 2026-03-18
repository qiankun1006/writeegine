/**
 * UI组件库入口文件
 * 游戏进度条组件库
 */

// 导出ProgressBar组件
export { default as ProgressBar } from './ProgressBar.vue';

// 导出工具函数
export * from './utils/color.js';
export * from './utils/animation.js';

// 导出样式
import './styles/base.css';
import './styles/animations.css';
import './styles/types/simple.css';
import './styles/types/health.css';
import './styles/types/energy.css';
import './styles/types/loading.css';
import './styles/types/pixel.css';
import './styles/types/glass.css';

// 默认导出
export default {
  install(app) {
    app.component('ProgressBar', ProgressBar);
  }
};

