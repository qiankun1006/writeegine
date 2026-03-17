# 粒子效果编辑器 - OpenSpec 提案总结

**提案 ID**: `add-particle-effect-editor`
**提案日期**: 2026-03-16
**状态**: 🎯 Ready for Review

---

## 快速导航

### 📖 文档清单

| 文件 | 内容 | 阅读时长 |
|-----|------|--------|
| **[README.md](README.md)** | 提案总览、快速开始 | 5 分钟 |
| **[proposal.md](proposal.md)** | 完整提案（Why/What/Impact） | 10 分钟 |
| **[design.md](design.md)** | 深度技术设计、架构、代码示例 | 20 分钟 |
| **[tasks.md](tasks.md)** | 详细任务分解（7 个 Phase） | 15 分钟 |
| **[prompt.md](prompt.md)** | 原始用户需求 | 3 分钟 |

### 📋 功能规范

| Spec | 功能模块 | 工作量 |
|-----|---------|--------|
| **[particle-editor-core](specs/particle-editor-core/spec.md)** | 编辑器核心（实时预览、参数面板、预设） | 1 周 |
| **[particle-export](specs/particle-export/spec.md)** | 导出系统（.p/.atlas/PNG/JSON/ZIP） | 1 周 |
| **[particle-texture-atlas](specs/particle-texture-atlas/spec.md)** | 纹理管理（上传、合并、裁剪） | 1 周 |

---

## 🎯 核心价值主张

### 用户问题
> "我无法在线编辑游戏粒子效果，必须使用外部工具，效率低下"

### 解决方案
✅ **在线粒子编辑器** - 在浏览器中实时编辑、预览、导出粒子效果
✅ **多格式支持** - 导出 LibGDX、PNG、JSON、ZIP 等格式
✅ **纹理管理** - 上传、合并、裁剪纹理为标准图集
✅ **预设库** - 火焰、雪花、雨水、爆炸等常用预设
✅ **高性能** - 1000+ 粒子 @ 60 FPS

### 影响范围
- **直接受益者**：美术团队、游戏开发者
- **间接受益者**：项目经理（效率提升）、测试人员（易验证）
- **平台增强**：WriteEngine 功能补全

---

## 📊 项目规模一览

### 技术栈
```
┌─────────────────────────────────────┐
│ Vue 3 + Vite + TypeScript           │  现代化前端框架
├─────────────────────────────────────┤
│ Element Plus (深色主题)              │  UI 组件库
├─────────────────────────────────────┤
│ Canvas 2D + OffscreenCanvas          │  渲染引擎
├─────────────────────────────────────┤
│ jszip + file-saver                  │  文件导出
├─────────────────────────────────────┤
│ 对象池 + 纹理缓存 (性能优化)         │  高性能实现
└─────────────────────────────────────┘
```

### 代码量估计
- **核心引擎**：~1500 行 (Particle, ParticleEmitter, ParticleSystem)
- **UI 组件**：~2000 行 (ParamPanel, PresetPanel, ExportPanel 等)
- **导出工具**：~1500 行 (LibGDXExporter, PNGExporter 等)
- **纹理管理**：~1000 行 (TextureAtlasGenerator, Bin Packing)
- **工具函数**：~500 行
- **总计**：~6500 行 (注：不含测试、文档)

### 时间投入
| 活动 | 时间 | 备注 |
|-----|-----|------|
| 需求分析 | 1 天 | 已完成 ✓ |
| 技术设计 | 2 天 | 已完成 ✓ |
| 实现 (7 Phase) | 4-6 周 | 待批准 |
| 测试 | 1-2 周 | 待批准 |
| 集成部署 | 3-5 天 | 待批准 |
| **总计** | **6-8 周** | 1-2 名工程师 |

---

## 🏗️ 架构简图

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.vue (主容器)                        │
├─────────────────────────────┬──────────────────────────────────┤
│                             │                                  │
│  ┌─────────────────────┐   │  ┌──────────────────────────────┐│
│  │  ParticleCanvas     │   │  │  RightPanel                  ││
│  │  (Canvas 渲染区)    │   │  │  (控制面板)                  ││
│  │                     │   │  ├──────────────────────────────┤│
│  │ ┌──────────────────┐│   │  │ ParamPanel - 参数编辑        ││
│  │ │ ParticleSystem   ││   │  │ PresetPanel - 预设选择       ││
│  │ │                  ││   │  │ ExportPanel - 文件导出       ││
│  │ │ ┌──────────────┐ ││   │  │ TextureUploader - 纹理管理   ││
│  │ │ │ Particle[]   │ ││   │  │                              ││
│  │ │ ├──────────────┤ ││   │  │ Tabs 式布局 (Element Plus)   ││
│  │ │ │ Emitter[]    │ ││   │  │                              ││
│  │ │ ├──────────────┤ ││   │  │ 深色主题样式                 ││
│  │ │ │ Renderer     │ ││   │  └──────────────────────────────┘│
│  │ │ ├──────────────┤ ││   │                                  │
│  │ │ │ AnimLoop @ 60fps
│  │ │ └──────────────┘ ││   │                                  │
│  │ └──────────────────┘│   │                                  │
│  │                     │   │                                  │
│  │ FPS: 60  粒子: 1000│   │                                  │
│  └─────────────────────┘   │                                  │
│         ▲◄────► 可拖拽分割线 ◄─────────┐ │
│                             │          │ │
└─────────────────────────────┴──────────┼─┘
                              │          │
                    面板宽度比例可调整（localStorage）
```

---

## 📦 核心功能分解

### 1️⃣ 编辑器核心 (particle-editor-core)

**关键功能**：
- ✅ 实时粒子预览（Canvas 2D）
- ✅ 参数编辑面板（分组折叠、范围验证）
- ✅ 播放控制（播放/暂停/重置）
- ✅ 内置预设（火焰、雪花、雨水、爆炸）
- ✅ 统计信息显示（粒子数、FPS）

**性能目标**：
- 1000+ 粒子 @ 60 FPS
- 参数变化 ≤ 300ms 反映

---

### 2️⃣ 导出系统 (particle-export)

**支持的导出格式**：

| 格式 | 文件 | 用途 |
|-----|------|------|
| LibGDX | `.p` | 粒子配置（游戏引擎原生） |
| TextureAtlas | `.atlas` | 纹理区域映射（Libgdx 标准） |
| PNG 截图 | `.png` | 效果预览（1x/2x/3x 分辨率） |
| JSON | `.json` | 配置备份、版本控制 |
| ZIP | `.zip` | 完整项目包（.p + .atlas + PNG + JSON） |

**文件命名规则**：
```
particle_effect_20260316_143052.p          # LibGDX
texture_atlas_20260316_143052.atlas        # TextureAtlas
particle_effect_screenshot_20260316.png    # 效果截图
particle_config_20260316_143052.json       # 配置备份
particle_project_20260316_143052.zip       # 项目包
```

---

### 3️⃣ 纹理管理 (particle-texture-atlas)

**关键功能**：
- ✅ 纹理上传（拖拽/选择、批量）
- ✅ 图集合并（Bin Packing 算法，排列紧凑）
- ✅ 纹理裁剪（矩形选择）
- ✅ 纹理缩放（百分比调整）
- ✅ TextureRegion 映射管理

**Bin Packing 算法**：
- 使用 FFD（首次适应递减）
- 排列有效率 > 70%
- 支持自定义图集尺寸

---

## 💡 关键设计亮点

### 1. 性能优化

```typescript
// 对象池 - 避免频繁创建/销毁 Particle
class ObjectPool<T> {
  get(): T | null { return this.pool.pop()!; }
  return(obj: T): void { this.pool.push(obj); }
}

// 纹理缓存 - 避免重复加载
class TextureCache {
  get(id: string): ImageData | undefined { ... }
  set(id: string, data: ImageData): void { ... }
}

// 批量渲染 - 减少 Canvas 调用
ctx.globalCompositeOperation = 'lighter'; // 加法混合
```

### 2. LibGDX 兼容性

严格遵循 LibGDX 1.9 官方规范：
- .p 文件格式（ParticleEffect）
- .atlas 文件格式（TextureAtlas）
- TextureRegion 标准化坐标（0-1）

### 3. UI 用户体验

- **深色主题**：现代化、护眼
- **参数分组折叠**：减少视觉复杂度
- **可拖拽面板**：灵活的工作区布局
- **实时预览**：参数变化即时反映
- **丰富提示**：Hover 时显示参数说明

---

## ✅ 验收标准

### 功能验收

- [ ] 粒子实时预览正常
- [ ] 导出的 .p 文件可被 LibGDX 加载
- [ ] PNG 导出透明背景完整
- [ ] 预设系统可正常使用
- [ ] 纹理合并排列紧凑
- [ ] 所有导出格式可用

### 性能验收

- [ ] 1000 粒子 FPS ≥ 55
- [ ] 参数更新延迟 ≤ 300ms
- [ ] PNG 2x 导出 ≤ 2 秒
- [ ] ZIP 打包 ≤ 5 秒
- [ ] 内存占用 ≤ 100 MB

### 兼容性验收

- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

### 代码质量验收

- [ ] TypeScript 严格模式通过
- [ ] ESLint 无错误
- [ ] 单元测试覆盖 ≥ 80%
- [ ] JSDoc 注释完善
- [ ] 无 console.log 遗留

---

## 🚀 建议的下一步

### 短期（本 Proposal）
1. ✅ 技术负责人审核 proposal
2. ✅ 团队讨论和反馈
3. ✅ 确认工时和资源分配
4. ✅ 批准进入实现阶段

### 中期（实现阶段）
1. 按 Phase 顺序实现（参考 [tasks.md](tasks.md)）
2. 单元测试和集成测试
3. 性能优化和调优
4. 用户反馈和迭代

### 长期（后续规划）
1. **Phase 2**：后端 API（配置保存、版本管理）
2. **Phase 3**：高级功能（3D、AI 生成、协作编辑）

---

## 📚 文档导读指南

### 快速了解（5 分钟）
→ 阅读本文件 + [README.md](README.md)

### 深入理解（30 分钟）
→ 按顺序阅读：
1. [proposal.md](proposal.md) - 完整提案
2. [design.md](design.md) - 技术设计

### 详细规范（1 小时）
→ 阅读具体功能规范：
1. [specs/particle-editor-core/spec.md](specs/particle-editor-core/spec.md)
2. [specs/particle-export/spec.md](specs/particle-export/spec.md)
3. [specs/particle-texture-atlas/spec.md](specs/particle-texture-atlas/spec.md)

### 任务规划（20 分钟）
→ 阅读 [tasks.md](tasks.md) - Phase 分解和时间表

---

## 📞 沟通和反馈

### 审核者清单
- [ ] 技术负责人
- [ ] 架构师
- [ ] UI/UX 设计师
- [ ] QA 负责人
- [ ] 项目经理

### 反馈通道
1. 在 Proposal 下评论
2. 提出 Issue
3. 直接讨论

---

## 📝 版本追踪

| 版本 | 日期 | 作者 | 变化 |
|-----|-----|------|------|
| 1.0 | 2026-03-16 | CatPaw AI | 初始提案版本 |

---

## 🎓 参考资源

### 官方文档
- [LibGDX 粒子系统](https://github.com/libgdx/libgdx/wiki/Particle-Effects)
- [Vite 官方指南](https://vitejs.dev/)
- [Vue 3 指南](https://vuejs.org/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 示例项目
- LibGDX 粒子编辑器示例
- Unity 粒子系统参考
- 其他在线编辑工具

---

**Proposal 状态**: 🎯 Ready for Review
**最后更新**: 2026-03-16
**作者**: CatPaw AI Assistant

---

**相关链接**：
- 提案目录：`/openspec/changes/add-particle-effect-editor/`
- 项目根目录：`/src/main/resources/static/particle-effect-editor/`（待创建）
- 集成路径：`/create-game/asset` 页面

