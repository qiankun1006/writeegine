# OpenSpec Proposal: 在线粒子效果编辑器

**Change ID**: `add-particle-effect-editor`

**Date**: 2026-03-16

**Status**: 🎯 Proposal Phase

---

## Why

### 现状分析
当前 WriteEngine 游戏编辑平台缺乏**粒子效果编辑工具**。美术人员和开发者无法在线生成、预览、编辑游戏粒子效果（如火焰、灰尘、雪花、爆炸等），必须依赖外部工具或手工编写配置文件，大大降低了游戏开发效率。

### 问题症状
1. **无法可视化编辑粒子**：美术人员无法实时预览粒子效果
2. **导出格式受限**：仅支持 JSON，无法导出 LibGDX 标准格式（.p + .atlas）
3. **纹理管理缺陷**：无法上传和合并多张纹理为图集
4. **工作流割裂**：需要跳转多个工具完成一个功能
5. **预设资源缺乏**：没有内置的火焰、雨雪等常用预设

### 用户期望
- 在 `/create-game/asset` 页面新增"粒子效果编辑器"入口
- 实时预览粒子效果（Canvas 绘制）
- 支持多种格式导出（.p, .atlas, PNG, JSON, ZIP）
- 内置常用预设，一键加载和导出

---

## What Changes

### 新增能力

#### 1. **粒子编辑器核心模块** (`particle-effect-editor`)
- **功能**：基于 Vue3 + Vite + TypeScript 构建的完整粒子编辑工具
- **输出物**：
  - 完整的 Vite 项目配置
  - Vue 3 组件架构（App.vue, ParticleCanvas.vue, ParamPanel.vue, ExportPanel.vue 等）
  - TypeScript 核心类（Particle, ParticleEmitter, ParticleSystem 等）
  - 导出工具类（LibGDXExporter, TextureAtlasGenerator, PNGExporter 等）

#### 2. **粒子渲染引擎** (`particle-renderer`)
- **功能**：Canvas-based 粒子渲染，与 LibGDX 逻辑 1:1 对齐
- **输出物**：
  - 粒子系统核心类（支持生命周期、力学、颜色渐变等）
  - 对象池实现（性能优化）
  - 纹理缓存管理
  - requestAnimationFrame 帧率控制

#### 3. **文件导出系统** (`particle-export`)
- **功能**：支持多种格式导出（.p, .atlas, PNG, JSON, ZIP）
- **输出物**：
  - LibGDX .p 格式导出器
  - TextureAtlas .atlas 格式导出器
  - PNG 高清导出（支持透明背景、自定义分辨率）
  - JSON 配置导出
  - ZIP 批量打包导出

#### 4. **纹理管理系统** (`texture-atlas-manager`)
- **功能**：支持上传、预览、合并纹理为图集
- **输出物**：
  - 纹理上传和预览组件
  - 纹理裁剪和缩放工具
  - 纹理图集合并算法（Bin Packing）
  - TextureRegion 映射管理

#### 5. **预设库** (`particle-presets`)
- **功能**：内置火焰、雪花、雨水、爆炸等预设
- **输出物**：
  - 预设配置文件（JSON）
  - 预设管理器
  - 预设加载和应用逻辑

#### 6. **UI 组件库增强** (Element Plus 集成)
- **功能**：深色主题、参数分组折叠、拖拽面板调整
- **输出物**：
  - 自定义深色主题 CSS
  - 参数面板折叠组件
  - 可拖拽的面板分割器

---

## Impact

### Affected Specs
1. `game-portal` - 新增"粒子效果编辑器"菜单项
2. `game-asset-creator` - 在资产创建门户页面集成粒子编辑器入口
3. `editor-integration` - 编辑器集成框架适配粒子编辑器

### Affected Code
- **前端**:
  - `/src/main/resources/static/particle-effect-editor/` - 新增粒子编辑器完整项目
  - `/src/main/resources/templates/create-game-asset-portal.html` - 添加粒子编辑器菜单项
  - `/src/main/resources/static/ai-portrait-generator/src/` - 参考 Vue3 + Vite 项目结构

- **后端** (可选后续)：
  - `/src/main/java/com/example/writemyself/controller/` - ParticleController（粒子配置保存接口）
  - `/src/main/java/com/example/writemyself/entity/` - ParticleEffect, ParticleEmitterConfig 实体

### 不涉及的部分
- 数据库设计（暂不保存粒子配置到数据库，本阶段仅支持本地导出）
- 实时协作编辑（单用户编辑模式）
- 物理模拟（支持基础力学，暂不支持复杂碰撞）

---

## 技术设计要点

### 1. 粒子系统架构
```
Particle (单个粒子对象)
  ├── 生命周期管理 (生成 → 更新 → 死亡)
  ├── 物理模型 (加速度、速度、重力)
  ├── 外观变化 (颜色、透明度、旋转、缩放)
  └── 纹理映射 (TextureRegion)

ParticleEmitter (发射器)
  ├── 发射参数 (位置、速率、角度、数量等)
  ├── 粒子参数 (寿命、初速度、加速度等)
  └── 粒子对象池管理

ParticleSystem (粒子系统)
  ├── 多发射器管理
  ├── Canvas 渲染
  └── requestAnimationFrame 帧率控制
```

### 2. LibGDX 兼容性
- 导出格式严格遵循 LibGDX 1.9 官方规范
- .p 文件格式参考：https://github.com/libgdx/libgdx/wiki/Particle-Effects
- .atlas 文件格式参考：TexturePacker 标准

### 3. 性能优化
- **对象池**：复用 Particle 对象，减少 GC 压力
- **纹理缓存**：预加载和缓存纹理，避免重复创建
- **批量绘制**：合并相同纹理的粒子，减少 Canvas 绘制调用
- **帧率控制**：固定 60 FPS（requestAnimationFrame + deltaTime）

### 4. PNG 导出优化
- 使用 OffscreenCanvas（Web Worker）处理高分辨率导出
- Canvas toDataURL('image/png') 获取原始像素数据
- 支持透明背景（RGBA 模式）
- 自动命名：`particle_effect_<timestamp>.png`

---

## 实现分解

### 第一阶段：核心编辑器 ✅
- [ ] 搭建 Vite 项目结构
- [ ] 实现基础粒子系统（Particle, ParticleEmitter, ParticleSystem）
- [ ] Canvas 实时渲染
- [ ] 参数面板（可折叠、可拖拽调整）
- [ ] 预设系统（火焰、雪花、雨水、爆炸）

### 第二阶段：导出系统 ✅
- [ ] LibGDX .p 格式导出
- [ ] TextureAtlas .atlas 格式导出
- [ ] PNG 高清导出（粒子效果截图）
- [ ] JSON 配置导出
- [ ] ZIP 批量打包

### 第三阶段：纹理管理 ✅
- [ ] 纹理上传和预览
- [ ] 纹理裁剪和缩放
- [ ] 纹理图集合并（Bin Packing 算法）
- [ ] TextureRegion 映射

### 第四阶段：UI/UX 优化 ✅
- [ ] 深色主题样式
- [ ] 参数分组折叠
- [ ] 拖拽面板调整
- [ ] 文件大小显示
- [ ] 自定义文件名

### 第五阶段：集成与测试 ✅
- [ ] 集成到 /create-game/asset 页面
- [ ] 导出文件验证（LibGDX 兼容性测试）
- [ ] 性能测试（粒子数量、帧率）
- [ ] 跨浏览器兼容性测试

---

## 后续考虑（不在本阶段）

### Phase 2
- 后端 API：粒子配置保存、加载、版本管理
- 实时协作编辑（多用户）
- 高级物理模拟（碰撞、风力场、重力场）

### Phase 3
- 3D 粒子编辑器（WebGL + Three.js）
- AI 辅助生成粒子效果
- 粒子效果市场（共享和下载预设）

---

## 验证清单

- [ ] 粒子实时预览与 LibGDX 游戏引擎效果一致
- [ ] 导出的 .p 文件可被 LibGDX 游戏正常加载
- [ ] PNG 导出支持透明背景且分辨率可配置
- [ ] 内置预设加载正确并可自定义参数
- [ ] 性能：1000+ 粒子保持 60 FPS
- [ ] 支持主流浏览器（Chrome, Firefox, Safari）

---

**Next Steps**:
1. 获得用户批准
2. 进行 design.md 深度设计
3. 编写 spec.md 详细需求
4. 进入实现阶段

