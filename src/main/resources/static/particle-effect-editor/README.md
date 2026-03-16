# 粒子效果编辑器

一个基于 Vue3 + TypeScript 的在线粒子效果编辑器，支持实时预览、多种格式导出和 LibGDX 兼容性。

## 功能特性

- 🎨 实时粒子效果预览
- ⚙️ 丰富的参数调节面板
- 📦 多种格式导出（.p, PNG, JSON, ZIP）
- 🎯 LibGDX 兼容性
- 🎪 内置预设（火焰、雪花、雨水、爆炸）
- 🖼️ 纹理上传和管理
- 🌙 深色主题 UI

## 技术栈

- Vue 3 + TypeScript
- Vite 构建工具
- Element Plus UI 组件库
- Canvas 2D 渲染
- JSZip 文件打包

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 项目结构

```
particle-effect-editor/
├── src/
│   ├── core/              # 核心引擎
│   │   ├── Particle.ts     # 粒子类
│   │   ├── ParticleEmitter.ts # 发射器类
│   │   ├── ParticleSystem.ts # 粒子系统类
│   │   ├── CanvasRenderer.ts # Canvas 渲染器
│   │   ├── AnimationLoop.ts # 动画循环
│   │   └── ObjectPool.ts   # 对象池
│   │
│   ├── components/        # Vue 组件
│   │   ├── ParamPanel.vue   # 参数面板
│   │   ├── PresetPanel.vue  # 预设面板
│   │   ├── ExportPanel.vue  # 导出面板
│   │   └── TextureUploader.vue # 纹理上传
│   │
│   ├── exporters/         # 导出器
│   │   ├── LibGDXExporter.ts # LibGDX 格式导出
│   │   ├── PNGExporter.ts   # PNG 导出
│   │   ├── JSONExporter.ts  # JSON 导出
│   │   └── ZIPExporter.ts   # ZIP 打包导出
│   │
│   ├── types/             # TypeScript 类型定义
│   │   └── particle.ts      # 粒子相关类型
│   │
│   ├── utils/             # 工具函数
│   │   ├── PresetManager.ts # 预设管理
│   │   └── paramHints.ts    # 参数提示
│   │
│   └── assets/            # 静态资源
│       └── presets/       # 预设配置
│
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目配置
```

## 使用指南

### 1. 参数调节

- **基础参数**: 调节发射率、角度、速度等
- **物理参数**: 设置重力、粒子寿命等
- **外观参数**: 调整颜色、透明度、缩放等

### 2. 预设使用

点击预设面板中的预设项，快速应用常见效果：
- 🔥 火焰效果
- ❄️ 雪花效果
- 🌧️ 雨水效果
- 💥 爆炸效果

### 3. 文件导出

支持多种导出格式：
- **LibGDX (.p)**: 游戏引擎兼容格式
- **PNG**: 高清截图
- **JSON**: 配置文件
- **ZIP**: 完整资源包

### 4. 纹理管理

- 拖拽或点击上传纹理图片
- 支持多文件批量上传
- 预览上传的纹理

## 性能优化

- ✅ 对象池技术减少 GC
- ✅ Canvas 高 DPI 支持
- ✅ 批量绘制优化
- ✅ 60 FPS 稳定运行

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 开发计划

### Phase 1 ✅
- [x] 核心粒子系统
- [x] Canvas 渲染引擎
- [x] 参数编辑面板
- [x] 预设系统

### Phase 2 🚧
- [ ] 纹理图集生成
- [ ] 高级导出选项
- [ ] 性能监控面板

### Phase 3 📋
- [ ] 3D 粒子支持
- [ ] AI 辅助生成
- [ ] 粒子效果市场

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

