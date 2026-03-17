# Tasks: 在线粒子效果编辑器

**Total Phases**: 5 | **Priority**: 🔴 High | **Complexity**: 🟡 Medium-High

---

## Phase 1: 核心编辑器架构 (Vite + Vue3 项目搭建)

### 1.1 项目初始化
- [x] 创建 Vite + Vue3 + TypeScript 项目骨架
  - 目录：`/src/main/resources/static/particle-effect-editor/`
  - 配置 vite.config.ts（支持 HMR、预构建优化）
  - 安装依赖：vue, typescript, element-plus, vite, file-saver 等
  - **验证**：npm run dev 可正常启动

### 1.2 TypeScript 类型定义
- [x] 定义粒子系统核心类型
  - ParticleConfig（粒子参数接口）
  - EmitterConfig（发射器参数接口）
  - SystemConfig（系统全局参数接口）
  - **文件**：`types/particle.ts`
  - **验证**：类型检查通过（no-implicit-any）

### 1.3 粒子系统核心实现
- [x] 实现 Particle 类
  - 属性：位置、速度、加速度、颜色、透明度、旋转、缩放、寿命
  - 方法：update(), draw(), isAlive()
  - **文件**：`core/Particle.ts`

- [x] 实现 ParticleEmitter 类
  - 属性：位置、发射角度、发射速率、粒子寿命、初速度、加速度
  - 方法：emit(), update(), draw()
  - **文件**：`core/ParticleEmitter.ts`

- [x] 实现 ParticleSystem 类
  - 属性：多个发射器、Canvas 上下文、帧计数器
  - 方法：addEmitter(), update(), render(), reset()
  - **文件**：`core/ParticleSystem.ts`
  - **验证**：单元测试覆盖 80%+

### 1.4 对象池实现（性能优化）
- [x] 实现 ObjectPool<T> 泛型类
  - 方法：get(), return(), resize()
  - 支持自定义对象工厂函数
  - **文件**：`core/ObjectPool.ts`
  - **验证**：内存使用量低于直接创建对象的 50%

### 1.5 Canvas 渲染引擎
- [x] 实现 CanvasRenderer 类
  - 方法：initialize(), clear(), drawParticle(), present()
  - 支持高 DPI 屏幕（devicePixelRatio）
  - **文件**：`core/CanvasRenderer.ts`

- [x] 实现动画循环
  - 使用 requestAnimationFrame
  - 支持暂停/继续/重置
  - **文件**：`core/AnimationLoop.ts`
  - **验证**：60 FPS 稳定运行

---

## Phase 2: 参数编辑面板

### 2.1 参数面板组件
- [x] 创建 ParamPanel.vue 组件
  - 支持参数分组折叠
  - 数值输入、范围滑块、颜色选择器
  - 参数实时预览更新
  - **样式**：深色主题，参考 Element Plus Dark
  - **验证**：参数变化立即反映到 Canvas

### 2.2 参数分组和折叠
- [x] 实现参数分组逻辑
  - 分组：基础参数、物理参数、外观参数、纹理参数
  - 支持单个分组折叠/展开
  - 持久化折叠状态（localStorage）
  - **验证**：全展开时参数面板高度合理，不遮挡 Canvas

### 2.3 拖拽调整面板大小
- [x] 实现可拖拽的分割线（Divider）
  - 支持 Canvas 和参数面板的宽度调整
  - 保存用户偏好（localStorage）
  - **验证**：拖拽流畅，无抖动

### 2.4 参数验证和约束
- [x] 为所有参数添加验证规则
  - 数值范围检查（min/max）
  - 颜色值有效性检查
  - **验证**：输入无效值时显示错误提示

---

## Phase 3: 预设系统

### 3.1 内置预设
- [x] 创建预设配置文件
  - 火焰预设（`Flame.json`）：红黄渐变、上升、快速衰减
  - 雪花预设（`Snow.json`）：白色、缓慢下落、旋转
  - 雨水预设（`Rain.json`）：蓝色、快速下落、直线
  - 爆炸预设（`Explosion.json`）：橙红色、快速散开、快速衰减
  - **目录**：`assets/presets/`
  - **验证**：预设加载正确，视觉效果符合预期

### 3.2 预设管理器
- [x] 实现 PresetManager 类
  - 方法：loadPreset(), listPresets(), saveUserPreset()
  - 支持预设分类和搜索
  - **文件**：`utils/PresetManager.ts`

### 3.3 预设 UI 面板
- [x] 创建 PresetPanel.vue 组件
  - 显示预设列表（缩略图预览）
  - 一键加载预设
  - **验证**：点击预设后，粒子效果立即更新

---

## Phase 4: 文件导出系统

### 4.1 LibGDX .p 格式导出
- [x] 实现 LibGDXExporter 类
  - 方法：export()，返回 .p 文件内容（字符串）
  - 格式规范参考：LibGDX 1.9 官方源码
  - 包含：所有发射器参数、纹理信息、粒子参数
  - **文件**：`exporters/LibGDXExporter.ts`
  - **验证**：导出的 .p 文件可被 LibGDX 游戏引擎加载

### 4.2 TextureAtlas .atlas 格式导出
- [x] 实现 TextureAtlasExporter 类
  - 方法：export()，返回 .atlas 文件内容
  - 包含：纹理区域映射（TextureRegion）信息
  - **文件**：`exporters/TextureAtlasExporter.ts`
  - **验证**：导出的 .atlas 文件格式正确

### 4.3 PNG 高清导出
- [x] 实现 PNGExporter 类
  - 方法：exportEffectScreenshot(), exportTextureImage()
  - 支持自定义分辨率（1x, 2x, 3x 倍率）
  - 支持透明背景 (RGBA)
  - 使用 OffscreenCanvas（Web Worker）处理高分辨率
  - **文件**：`exporters/PNGExporter.ts`
  - **验证**：导出的 PNG 清晰，无模糊或错位

### 4.4 JSON 导出
- [x] 实现 JSONExporter 类
  - 方法：export()，返回完整配置 JSON
  - 包含所有发射器和粒子参数
  - **文件**：`exporters/JSONExporter.ts`
  - **验证**：导出的 JSON 可重新加载

### 4.5 ZIP 批量导出
- [x] 实现 ZIPExporter 类
  - 方法：exportBundle()，包含 .p + .atlas + PNG
  - 使用 jszip 库
  - **文件**：`exporters/ZIPExporter.ts`
  - **验证**：导出的 ZIP 文件完整，可解压

### 4.6 导出面板 UI
- [x] 创建 ExportPanel.vue 组件
  - 显示导出格式选项（.p, .atlas, PNG, JSON, ZIP）
  - 文件大小预览
  - 自定义文件名输入
  - 一键导出按钮
  - **验证**：导出后浏览器下载正确的文件

---

## Phase 5: 纹理管理系统

### 5.1 纹理上传
- [x] 实现纹理上传功能
  - 支持拖拽上传、点击选择文件
  - 支持多文件批量上传
  - 预览上传的纹理
  - **文件**：`components/TextureUploader.vue`
  - **验证**：上传的 PNG 图片可正确显示

### 5.2 纹理图集合并
- [x] 实现 Bin Packing 算法（自动排列纹理）
  - 将多个小纹理合并为一张大纹理
  - 算法：首次适应递减（FFD）或遗传算法
  - **文件**：`utils/TextureAtlasGenerator.ts`
  - **验证**：合并后的纹理紧密排列，无浪费

### 5.3 纹理裁剪和缩放
- [x] 创建 TextureEditor.vue 组件
  - 支持纹理裁剪（拖拽选择区域）
  - 支持缩放（百分比输入）
  - 实时预览
  - **验证**：裁剪后的纹理应用到粒子正确

### 5.4 TextureRegion 映射
- [x] 实现 TextureRegion 类
  - 属性：u, v, width, height（纹理坐标）
  - 方法：getUV()，返回标准化坐标
  - **文件**：`core/TextureRegion.ts`
  - **验证**：粒子使用 TextureRegion 正确渲染

---

## Phase 6: UI/UX 优化

### 6.1 深色主题
- [x] 创建深色主题样式表
  - 配色方案：深灰色背景 (#1a1a1a)，亮色文字
  - 按钮、输入框、滑块等组件深色样式
  - **文件**：`styles/dark-theme.scss`
  - **验证**：界面整体美观，对比度合理

### 6.2 帮助和提示
- [x] 为所有参数添加 hover 提示（title attribute）
  - 说明参数的含义、单位、推荐值
  - **文件**：`utils/paramHints.ts`
  - **验证**：悬停参数标签时显示提示

### 6.3 快捷键支持
- [x] 实现常用快捷键
  - Ctrl+S：保存配置到 localStorage
  - Ctrl+E：打开导出面板
  - Space：暂停/继续动画
  - R：重置所有参数
  - **验证**：快捷键生效

---

## Phase 7: 集成与测试

### 7.1 集成到 /create-game/asset 页面
- [x] 修改 create-game-asset-portal.html
  - 添加"粒子效果编辑器"菜单项
  - 链接到粒子编辑器入口
  - **验证**：菜单项点击可正常跳转

### 7.2 单元测试
- [x] 编写单元测试（Jest 或 Vitest）
  - 粒子系统逻辑测试
  - 导出器格式验证
  - 纹理合并算法测试
  - **覆盖率**：80%+

### 7.3 集成测试
- [x] 测试完整工作流
  - 加载预设 → 编辑参数 → 预览效果 → 导出文件
  - 验证导出文件可被 LibGDX 加载
  - **验证**：每个工作流通过

### 7.4 性能测试
- [x] 性能基准测试
  - 1000 个粒子运行时帧率（目标：60 FPS）
  - 内存使用量
  - 导出 PNG 耗时
  - **验证**：满足性能目标

### 7.5 浏览器兼容性测试
- [x] 跨浏览器测试
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
  - **验证**：主要功能在所有浏览器可用

---

## 依赖关系和并行化机会

```
Phase 1 (完成后开启其他)
├─→ Phase 2 (参数面板)
├─→ Phase 3 (预设系统)
├─→ Phase 4 (导出系统) ← 依赖 Phase 1, 3
└─→ Phase 5 (纹理管理) ← 依赖 Phase 1

Phase 6 (UI/UX) 可与 Phase 2-5 并行
Phase 7 (测试) 在前面阶段完成后进行
```

---

## 定义完成标准

✅ **Phase 完成定义**：
- 所有 [x] 任务标记为 ✓
- 所有验证条件通过
- 代码通过 linter (ESLint + Prettier)
- TypeScript 严格模式无错误
- 无 console 警告（除日志）

✅ **项目完成定义**：
- 所有 7 个 Phase 完成
- 粒子效果在 Canvas 正常预览
- 导出的文件可被 LibGDX 正常使用
- 性能满足目标（1000+ 粒子 @ 60 FPS）
- 用户文档完善

