# 游戏进度条组件使用说明

## 概述

游戏进度条组件是一个基于Vue3 + Composition API开发的UI组件库，提供了6种游戏场景常用的进度条效果。该组件库完全独立，不会影响现有的游戏素材创作系统。

## 特性

### 6种进度条效果
1. **极简纯色款** - 纯色背景和填充，支持自定义颜色和边框
2. **游戏血条款** - 线性渐变，血滴纹理，受损闪烁动画，低血量警示
3. **能量条款** - 径向渐变，流光动画，充能脉冲效果
4. **加载进度款** - 条纹动效，进度数字显示，状态图标
5. **复古像素款** - 8bit像素边框，阶梯式填充，像素字体
6. **玻璃拟态款** - 毛玻璃背景，半透明填充，模糊边框

### 核心功能
- ✅ 完整的配置选项（颜色、尺寸、边框、动画速度等）
- ✅ 平滑过渡动画（0.2s-1s可调）
- ✅ 拖拽交互功能
- ✅ 悬停tooltip显示
- ✅ 状态切换（加载中/完成/失败）
- ✅ 响应式适配
- ✅ 血条编辑功能（拖拽调整、颜色配置、低血量警示）

## 安装和使用

### 1. 引入组件库

```html
<!-- 在HTML中引入 -->
<link rel="stylesheet" href="/static/ui-components/styles/base.css">
<link rel="stylesheet" href="/static/ui-components/styles/animations.css">
<link rel="stylesheet" href="/static/ui-components/styles/types/simple.css">
<link rel="stylesheet" href="/static/ui-components/styles/types/health.css">
<link rel="stylesheet" href="/static/ui-components/styles/types/energy.css">
<link rel="stylesheet" href="/static/ui-components/styles/types/loading.css">
<link rel="stylesheet" href="/static/ui-components/styles/types/pixel.css">
<link rel="stylesheet" href="/static/ui-components/styles/types/glass.css">

<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="/static/ui-components/index.js"></script>
```

### 2. 基本使用

```vue
<template>
  <ProgressBar
    :value="50"
    :max="100"
    type="health"
    :show-value="true"
    :animate="true"
    :animation-speed="0.3"
    status="idle"
    @change="handleChange"
    @drag-start="handleDragStart"
    @drag-end="handleDragEnd"
  />
</template>

<script setup>
import { ProgressBar } from '/static/ui-components/index.js'

const handleChange = (value) => {
  console.log('进度变化:', value)
}

const handleDragStart = (value) => {
  console.log('开始拖拽:', value)
}

const handleDragEnd = (value) => {
  console.log('结束拖拽:', value)
}
</script>
```

## API文档

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | String | 'simple' | 进度条类型：'simple', 'health', 'energy', 'loading', 'pixel', 'glass' |
| value | Number | 0 | 当前进度值（0-100） |
| max | Number | 100 | 最大值 |
| showValue | Boolean | true | 是否显示数值 |
| unit | String | '' | 数值单位 |
| backgroundColor | String | '#f0f0f0' | 背景颜色 |
| fillColor | String | '#1890ff' | 填充颜色 |
| borderColor | String | '#d9d9d9' | 边框颜色 |
| borderWidth | Number | 1 | 边框宽度 |
| borderRadius | Number | 4 | 边框圆角 |
| healthStartColor | String | '#8b0000' | 血条起始颜色 |
| healthEndColor | String | '#ff0000' | 血条结束颜色 |
| showBloodDrops | Boolean | true | 是否显示血滴效果 |
| lowHealthThreshold | Number | 20 | 低血量阈值 |
| showLowHealthWarning | Boolean | true | 是否显示低血量警告 |
| energyStartColor | String | '#1890ff' | 能量条起始颜色 |
| energyEndColor | String | '#722ed1' | 能量条结束颜色 |
| animate | Boolean | true | 是否启用动画 |
| animationSpeed | Number | 0.3 | 动画速度（0.2-1秒） |
| status | String | 'idle' | 状态：'idle', 'loading', 'success', 'error' |
| tooltip | String | '' | 自定义tooltip内容 |
| assetName | String | '' | 资产名称（显示在tooltip中） |
| apiStatus | String | '' | API状态（显示在tooltip中） |
| width | String/Number | '100%' | 宽度 |
| height | String/Number | 24 | 高度 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:value | value | 进度值更新 |
| change | value | 进度变化 |
| drag-start | value | 开始拖拽 |
| drag-end | value | 结束拖拽 |
| mouse-enter | value | 鼠标进入 |
| mouse-leave | value | 鼠标离开 |

### 方法

通过ref调用：

```vue
<template>
  <ProgressBar ref="progressBarRef" :value="progress" />
</template>

<script setup>
import { ref } from 'vue'

const progressBarRef = ref()

// 可以通过ref访问组件实例
// 注意：组件内部方法主要是内部使用，不建议外部直接调用
</script>
```

## 演示页面

### 访问地址
```
http://localhost:8084/create-game/asset/progress-bar-demo
```

### 演示功能
1. **6种效果展示** - 并排展示所有进度条类型
2. **实时控制** - 滑块调整进度和动画速度
3. **类型切换** - 下拉菜单切换进度条类型
4. **状态演示** - 成功/错误/加载状态切换
5. **API模拟** - 模拟异步请求进度更新

## 集成说明

### 独立部署
进度条组件库部署在独立的目录中，不会影响现有系统：
- 组件目录：`/static/ui-components/`
- 演示页面：`/create-game/asset/progress-bar-demo`
- 控制器路由：`HomeController.createProgressBarDemo()`

### 无侵入式集成
- ✅ 不修改现有的`create-game-asset.html`页面结构
- ✅ 不修改现有的JavaScript逻辑和面板切换机制
- ✅ 不修改现有的API接口和数据库结构
- ✅ 通过独立页面访问，不影响现有功能

### 扩展性
组件库设计为可扩展的架构：
1. 可以轻松添加新的进度条类型
2. 样式文件模块化，便于维护
3. 工具函数独立，便于复用

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 性能优化

1. **CSS动画** - 使用硬件加速的CSS动画，性能优异
2. **按需加载** - 样式文件按类型分离，按需加载
3. **响应式设计** - 适配不同屏幕尺寸
4. **内存管理** - 清理动画和事件监听器，避免内存泄漏

## 开发指南

### 添加新的进度条类型
1. 在`ProgressBar.vue`中添加新的type选项
2. 创建对应的样式文件：`styles/types/新类型.css`
3. 在`index.js`中导入新的样式文件
4. 在演示页面中添加新的示例配置

### 自定义样式
可以通过CSS变量自定义样式：

```css
.progress-bar--simple {
  --simple-bg-color: #f0f0f0;
  --simple-fill-color: #1890ff;
  --simple-border-color: #d9d9d9;
}
```

## 故障排除

### 常见问题
1. **组件不显示** - 检查Vue是否正确加载，检查控制台错误
2. **样式异常** - 检查CSS文件是否正确引入
3. **动画不工作** - 检查`animate`属性是否设置为true
4. **拖拽无效** - 检查组件是否被禁用或处于加载状态

### 调试建议
1. 打开浏览器开发者工具
2. 检查网络请求，确保所有资源加载成功
3. 检查控制台是否有JavaScript错误
4. 使用Vue Devtools检查组件状态

## 更新日志

### v1.0.0 (2026-03-17)
- 初始版本发布
- 实现6种进度条效果
- 创建独立演示页面
- 完整的API文档
- 响应式设计支持

## 联系和支持

如有问题或建议，请参考项目文档或联系开发团队。

---

**重要提示**：此组件库完全独立，不会影响现有的游戏素材创作系统。所有修改都遵循无侵入式集成原则。

