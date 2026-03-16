# OpenSpec Proposal: 在线粒子效果编辑器

**Change ID**: `add-particle-effect-editor`

**Proposal Status**: 🎯 Ready for Review

**Last Updated**: 2026-03-16

---

## 📋 概览

本 proposal 旨在为 WriteEngine 游戏编辑平台新增一个**完整的在线粒子效果编辑器**，使美术人员和开发者能够在浏览器中实时编辑、预览、导出粒子效果。

### 核心价值
- ✅ **可视化编辑**：实时预览粒子效果（Canvas 绘制）
- ✅ **多格式导出**：支持 LibGDX (.p/.atlas)、PNG、JSON、ZIP 等格式
- ✅ **纹理管理**：上传、合并、裁剪纹理为图集
- ✅ **内置预设**：火焰、雪花、雨水、爆炸等常用预设
- ✅ **高性能**：1000+ 粒子 @ 60 FPS
- ✅ **深色主题**：现代化 UI，支持参数折叠和面板调整

---

## 📁 文档结构

### 根目录文件

```
├── prompt.md              # 原始用户需求（本 proposal 的源头）
├── proposal.md            # 完整提案说明（Why/What/Impact）
├── tasks.md               # 详细的任务分解和依赖关系（7 个 Phase）
├── design.md              # 深度技术设计（架构、数据结构、代码示例）
└── README.md              # 本文件
```

### Specs 子目录

```
specs/
├── particle-editor-core/
│   └── spec.md            # 编辑器核心功能规范
│
├── particle-export/
│   └── spec.md            # 导出系统规范（.p/.atlas/PNG/JSON/ZIP）
│
└── particle-texture-atlas/
    └── spec.md            # 纹理图集管理规范（上传、合并、裁剪）
```

---

## 🎯 关键特性

### 1. 粒子系统核心 (particle-editor-core)
- **实时预览**：Canvas-based 粒子渲染，最多 5000 粒子
- **参数编辑**：参数面板支持分组折叠、拖拽调整
- **预设系统**：火焰、雪花、雨水、爆炸预设一键加载
- **播放控制**：播放/暂停/重置按钮

**需求文档**: [specs/particle-editor-core/spec.md](specs/particle-editor-core/spec.md)

### 2. 文件导出系统 (particle-export)
- **LibGDX .p 格式**：严格遵循官方规范
- **TextureAtlas .atlas 格式**：支持纹理区域映射
- **PNG 高清导出**：支持 1x/2x/3x 分辨率、透明背景
- **JSON 配置导出**：包含所有参数和纹理信息
- **ZIP 批量导出**：一键打包 .p + .atlas + PNG + JSON

**需求文档**: [specs/particle-export/spec.md](specs/particle-export/spec.md)

### 3. 纹理图集管理 (particle-texture-atlas)
- **纹理上传**：支持拖拽上传、批量上传
- **图集合并**：Bin Packing 算法自动排列纹理
- **裁剪和缩放**：支持编辑纹理的大小和位置
- **TextureRegion 映射**：生成标准化纹理坐标

**需求文档**: [specs/particle-texture-atlas/spec.md](specs/particle-texture-atlas/spec.md)

---

## 📊 项目规模和工作量

### 总计
- **文档**：5 个（1 个 proposal + 1 个 design + 3 个 spec）
- **Phase 数量**：7 个
- **预计开发时间**：4-6 周
- **团队规模**：1-2 名前端工程师 + 1 名 QA

### Phase 分解

| Phase | 功能 | 工作量 | 依赖 |
|-------|-----|------|------|
| 1 | 核心编辑器架构 | 1 周 | 无 |
| 2 | 参数面板 | 5 天 | Phase 1 |
| 3 | 预设系统 | 3 天 | Phase 1 |
| 4 | 导出系统 | 1 周 | Phase 1, 3 |
| 5 | 纹理管理 | 1 周 | Phase 1, 4 |
| 6 | UI/UX 优化 | 5 天 | Phase 2-5 并行 |
| 7 | 集成和测试 | 5 天 | 前面 Phase 完成 |

**详细分解**：[tasks.md](tasks.md)

---

## 🏗️ 技术架构

### 整体架构

```
App.vue (主容器)
├── ParticleCanvas.vue (Canvas 渲染区)
│   └── ParticleSystem (核心引擎)
│       ├── Particle (粒子对象)
│       ├── ParticleEmitter (发射器)
│       ├── CanvasRenderer (Canvas 渲染)
│       └── AnimationLoop (帧循环控制)
│
└── RightPanel.vue (右侧控制面板)
    ├── ParamPanel.vue (参数编辑)
    ├── PresetPanel.vue (预设选择)
    ├── ExportPanel.vue (导出)
    └── TextureUploader.vue (纹理管理)
```

### 技术栈

| 层 | 技术 | 备注 |
|---|------|------|
| 前端框架 | Vue 3 + Vite + TypeScript | 现代化开发体验 |
| UI 组件 | Element Plus | 深色主题支持 |
| 渲染 | Canvas 2D | 性能优化，支持高 DPI |
| 导出 | jszip + file-saver | 支持多格式导出 |
| 性能优化 | 对象池、纹理缓存 | 1000+ 粒子 @ 60 FPS |

**详细设计**：[design.md](design.md)

---

## 📈 性能指标

### 性能目标

| 指标 | 目标 | 实现方式 |
|-----|------|--------|
| 粒子渲染 | 1000+ 粒子 @ 60 FPS | 对象池 + 批量绘制 |
| 参数更新 | ≤ 300ms 延迟 | React 状态管理 |
| PNG 导出 | 2x 分辨率 ≤ 2 秒 | OffscreenCanvas + Web Worker |
| ZIP 打包 | ≤ 5 秒 | jszip 流式处理 |
| 内存占用 | ≤ 100 MB | 对象池回收 |

---

## 🚀 快速开始

### 安装依赖

```bash
cd src/main/resources/static/particle-effect-editor
npm install
```

### 本地开发

```bash
npm run dev
# 打开 http://localhost:5173
```

### 生产构建

```bash
npm run build
# 输出到 ../templates/particle-editor
```

### 集成到 WriteEngine

1. 修改 `create-game-asset-portal.html`，添加"粒子效果编辑器"菜单项
2. 在 Spring Boot 后端配置路由映射到编辑器 HTML
3. 部署到生产环境

---

## ✅ 验证清单

### 功能验证

- [ ] 粒子实时预览与预期效果一致
- [ ] 导出的 .p 文件可被 LibGDX 游戏引擎正常加载
- [ ] PNG 导出支持透明背景且分辨率可配置
- [ ] 内置预设加载正确并可自定义参数
- [ ] 纹理图集排列紧凑，使用率 > 70%

### 性能验证

- [ ] 1000 粒子运行时 FPS ≥ 55
- [ ] 参数变化 ≤ 300ms 内反映到视觉效果
- [ ] PNG 2x 导出耗时 ≤ 2 秒
- [ ] ZIP 打包耗时 ≤ 5 秒
- [ ] 内存占用 ≤ 100 MB

### 兼容性验证

- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

---

## 📚 相关文档

### 核心设计文档
- [proposal.md](proposal.md) - 完整提案（Why/What/Impact）
- [design.md](design.md) - 深度技术设计
- [tasks.md](tasks.md) - 任务分解和时间表

### 功能规范
- [specs/particle-editor-core/spec.md](specs/particle-editor-core/spec.md) - 编辑器核心
- [specs/particle-export/spec.md](specs/particle-export/spec.md) - 导出系统
- [specs/particle-texture-atlas/spec.md](specs/particle-texture-atlas/spec.md) - 纹理管理

### 外部参考
- [LibGDX 官方文档](https://libgdx.badlogicgames.com/)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## 🤝 团队协作

### 代码审查清单

- [ ] 代码遵循 TypeScript 严格模式
- [ ] 函数和类有清晰的 JSDoc 注释
- [ ] 无 console.log（仅保留 console.error/warn）
- [ ] 所有魔数都有命名常量
- [ ] 单元测试覆盖率 ≥ 80%

### 提交规范

```
feat: 新增粒子编辑器核心功能
fix: 修复参数面板折叠状态不保存
refactor: 优化粒子系统性能
docs: 完善纹理图集生成文档
test: 添加 Bin Packing 算法单元测试
```

---

## 📝 版本历史

| 版本 | 日期 | 变化 |
|-----|------|------|
| 1.0 | 2026-03-16 | 初始提案版本 |

---

## 🎯 后续计划

### Phase 2（未来考虑）
- 后端 API：粒子配置保存、版本管理、云同步
- 实时协作编辑（多用户）
- 高级物理模拟（碰撞、力场）

### Phase 3（远期规划）
- 3D 粒子编辑器（WebGL + Three.js）
- AI 辅助生成粒子效果
- 粒子效果市场（共享库）

---

## 📞 反馈和讨论

如对本 proposal 有任何疑问或建议，欢迎提出 issue 或发起讨论。

---

**Proposal 作者**: CatPaw AI Assistant
**创建日期**: 2026-03-16
**审核状态**: 等待技术负责人审核

