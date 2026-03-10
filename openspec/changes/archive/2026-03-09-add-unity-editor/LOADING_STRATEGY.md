# Unity 编辑器加载策略优化方案

## 1. 当前加载架构

### 1.1 必需的库和资源

| 资源 | 类型 | 大小(估计) | 目的 |
|------|------|----------|------|
| Three.js | CDN | ~600KB | 3D 渲染引擎 |
| OrbitControls | CDN | ~15KB | 摄像机控制 |
| Ammo.js | CDN | ~200KB | 物理引擎（可选） |
| unity-editor.css | 本地 | ~50KB | 样式表 |
| UnityRenderer.js | 本地 | ~100KB | 渲染模块 |
| UnityEditor.js | 本地 | ~80KB | 编辑器核心 |
| UnityUI.js | 本地 | ~100KB | UI 管理 |
| UnityPhysics.js | 本地 | ~50KB | 物理集成（可选） |
| **总计** | | **~1195KB** | |

### 1.2 当前加载流程

```
页面加载
    ↓
CDN 加载 Three.js (阻塞)
    ↓
CDN 加载 OrbitControls (阻塞)
    ↓
CDN 加载 Ammo.js (阻塞) ← 即使不需要也会加载
    ↓
本地 CSS 加载 (阻塞)
    ↓
JavaScript 脚本按序加载 (阻塞)
    ↓
DOM ready
    ↓
执行 app.js 初始化
    ↓
编辑器启动完成
```

**问题**：
- 所有资源必须加载完才能启动
- 物理引擎 Ammo.js 即使不需要也会加载
- 总加载时间较长（通常 3-5 秒）

---

## 2. 优化方案：分阶段懒加载

### 2.1 加载阶段划分

#### 阶段 1: 关键路径加载（0-1 秒）
```javascript
// 必需且不可延迟的资源
- HTML 页面结构
- CSS 样式表
- Three.js 库（CDN）
- OrbitControls（CDN）

// 目标：显示编辑器框架和加载进度条
```

#### 阶段 2: 编辑器初始化（1-2 秒）
```javascript
// 编辑器核心模块
- UnityRenderer.js
- UnityEditor.js
- UnityUI.js
- app.js

// 目标：编辑器可用，显示 3D 场景
```

#### 阶段 3: 可选功能后台加载（2+ 秒）
```javascript
// 根据需要后台加载
- Ammo.js (物理引擎)
- UnityPhysics.js
- AnimationSystem.js (动画系统)
- ParticleSystem.js (粒子系统)
- ScriptEditor.js (脚本编辑器)
- AssetLibrary.js (资源库)

// 加载方式：requestIdleCallback（浏览器空闲时）
```

### 2.2 优化的加载时间表

```
时间轴:
0ms   ├─ HTML + CSS 加载 (同步)
      │
100ms ├─ Three.js + OrbitControls (并行 CDN 加载)
      │
1000ms├─ ✅ 编辑器可见 (加载进度条 100%)
      │  ├─ UnityRenderer.js
      │  ├─ UnityEditor.js
      │  ├─ UnityUI.js
      │  └─ app.js 初始化完成
      │
1500ms├─ 📦 后台加载可选模块开始
      │  ├─ requestIdleCallback → Ammo.js
      │  ├─ requestIdleCallback → AnimationSystem
      │  └─ ...
      │
3000ms└─ 所有模块加载完成

期望结果：
- 首屏显示时间: ~1000ms ✅
- 完全加载时间: ~3000ms
- 性能提升: 50% ⬆️
```

### 2.3 装置配置

用户可在编辑器启动时指定需要的功能：

```javascript
// 仅加载必需功能（最快）
new UnityEditor({
  enablePhysics: false,
  enableAnimations: false,
  enableParticles: false,
  enableScripting: false,
  preloadAssets: false
});

// 完整功能（较慢）
new UnityEditor({
  enablePhysics: true,
  enableAnimations: true,
  enableParticles: true,
  enableScripting: true,
  preloadAssets: true
});
```

---

## 3. 实现方案

### 3.1 修改后的 HTML 结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unity 编辑器</title>

  <!-- 关键 CSS（内联以减少请求） -->
  <link rel="stylesheet" href="/static/css/unity-editor.css">
</head>
<body>
  <div class="unity-editor-container">
    <!-- 编辑器 UI -->
  </div>

  <!-- 加载进度条 -->
  <div id="loadingOverlay" class="loading-overlay">
    <div class="loading-bar">
      <div class="loading-progress" id="loadingProgress"></div>
    </div>
    <p id="loadingStatus">加载中... 0%</p>
  </div>

  <!-- 阶段 1: 必需库（阻塞） -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

  <!-- 阶段 2: 编辑器核心（同步） -->
  <script src="/static/js/unity-editor/UnityRenderer.js"></script>
  <script src="/static/js/unity-editor/UnityEditor.js"></script>
  <script src="/static/js/unity-editor/UnityUI.js"></script>

  <!-- 懒加载管理器 -->
  <script src="/static/js/unity-editor/LazyLoader.js"></script>

  <!-- 应用入口 -->
  <script src="/static/js/unity-editor/app.js"></script>

  <!-- 阶段 3: 可选模块（异步，不阻塞） -->
  <script>
    // 这些在后台异步加载，不阻塞初始化
    document.addEventListener('DOMContentLoaded', function() {
      window.lazyLoader = new LazyLoader({
        enablePhysics: true,      // 根据需要配置
        enableAnimations: false,
        enableParticles: false,
        enableScripting: false,
        preloadAssets: true
      });

      // 后台加载可选模块
      window.lazyLoader.initializeOptionalModules();
    });
  </script>
</body>
</html>
```

### 3.2 修改后的 app.js 初始化

```javascript
// 添加加载进度跟踪
let lazyLoader = null;

function initUnityEditor() {
  console.log('🎮 编辑器初始化开始...');

  try {
    // 检查必需的库
    if (typeof THREE === 'undefined') {
      throw new Error('Three.js 未加载');
    }

    // 创建编辑器实例
    unityEditor = new UnityEditor({
      canvas: document.getElementById('unityCanvas'),
      container: document.querySelector('.unity-editor-container'),
      config: { /* ... */ }
    });

    // 初始化编辑器
    unityEditor.init();
    unityEditor.start();

    console.log('✅ 编辑器启动完成');

    // 隐藏加载进度条
    hideLoadingOverlay();

    // 启动后台加载
    if (window.lazyLoader) {
      window.lazyLoader.initializeOptionalModules();
    }

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    showErrorMessage('编辑器初始化失败', error.message);
  }
}
```

---

## 4. 懒加载管理器用法

### 4.1 基础用法

```javascript
// 创建懒加载管理器
const loader = new LazyLoader({
  enablePhysics: true,
  enableAnimations: false,
  preloadAssets: true
});

// 初始化必需模块（同步）
await loader.initializeEssentialModules();

// 初始化可选模块（异步）
loader.initializeOptionalModules();

// 等待特定模块加载
await loader.waitForModule('unity-physics');

// 获取加载统计
const stats = loader.getLoadingStats();
console.log('加载的模块:', stats.loadedModules);
console.log('正在加载:', stats.loadingModules);
```

### 4.2 动态加载功能

```javascript
// 需要使用物理引擎时
if (userEnabledPhysics) {
  await loader.loadModule('unity-physics');
  // 现在可以使用物理功能
}

// 用户切换到脚本编辑器时
if (userOpenedScriptEditor) {
  await loader.loadModule('script-editor');
  // 脚本编辑器已就绪
}
```

---

## 5. 性能指标

### 5.1 加载时间对比

| 指标 | 优化前 | 优化后 | 改进 |
|------|-------|-------|------|
| 首屏显示时间 | 3-5s | ~1s | 66-70% ⬆️ |
| 完全加载时间 | 3-5s | ~3s | 40% ⬇️ |
| 首屏可交互 | 3-5s | ~1.5s | 60-70% ⬆️ |

### 5.2 资源加载对比

**优化前**：
- 初始加载：~1195KB（全部加载）
- 初始请求数：8+

**优化后**：
- 初始加载：~865KB（必需部分）
- 初始请求数：5
- 后台加载：~330KB（可选部分）

---

## 6. 浏览器兼容性

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| requestIdleCallback | ✅ | ✅ | ✅ | ✅ |
| async/await | ✅ | ✅ | ✅ | ✅ |
| 动态脚本加载 | ✅ | ✅ | ✅ | ✅ |
| 懒加载优化 | ✅ | ✅ | ✅ | ✅ |

---

## 7. 实施建议

1. **立即实施**：
   - 使用 LazyLoader.js 管理模块加载
   - 在 app.js 中集成懒加载逻辑
   - 添加加载进度条 UI

2. **短期优化**（1-2 周）：
   - 将 CSS 内联到 HTML 中
   - 使用 CDN 缓存头优化
   - 压缩 JavaScript 文件

3. **中期优化**（1-2 个月）：
   - 实施代码分割（Webpack）
   - 使用 Service Worker 缓存
   - 实现资源预加载策略

4. **长期优化**（2+ 个月）：
   - 实现渐进式 Web 应用（PWA）
   - 离线编辑支持
   - WebWorker 处理繁重计算

---

## 8. 测试清单

- [ ] 验证必需模块正常加载
- [ ] 验证编辑器在 1.5 秒内可用
- [ ] 验证可选模块后台异步加载
- [ ] 验证没有阻塞主线程
- [ ] 测试各浏览器兼容性
- [ ] 测试网络缓慢场景
- [ ] 验证错误处理机制
- [ ] 检查内存使用情况

