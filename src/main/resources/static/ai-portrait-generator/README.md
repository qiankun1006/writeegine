# 🎨 AI 人物立绘生成器

[![Vue 3](https://img.shields.io/badge/Vue-3.3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/ElementPlus-2.5.0-409EFF?logo=javascript)](https://element-plus.org/)

一个现代化的 AI 驱动人物立绘生成工具前端应用，基于 Vue 3 + Vite + TypeScript 构建。

## 📋 目录

- [特性](#特性)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [故障排查](#故障排查)
- [许可证](#许可证)

## ✨ 特性

### 核心功能
- 🎯 **智能提示词输入** - 支持字数统计，实时反馈
- 🖼️ **参考图片上传** - 支持拖拽和点击，自动压缩
- 🎛️ **高级参数控制** - 折叠面板，丰富的参数选项
- 📊 **实时生成状态** - 进度条和加载动画
- 🎴 **结果展示卡片** - 操作丰富，交互流畅

### 设计特点
- 🌈 **现代化UI设计** - 遵循极简主义美学
- 📱 **完全响应式** - 适配移动设备、平板和桌面
- ⚡ **高性能优化** - 代码分割、资源缓存
- 🎭 **丰富动效** - 平滑的过渡和加载动画
- 🔧 **易于定制** - 完整的主题变量系统

### 技术优势
- 💪 **现代框架** - Vue 3 Composition API
- 🚀 **极速构建** - 基于 Vite 的闪电构建
- 📦 **类型安全** - 完整的 TypeScript 支持
- 🎨 **UI 组件库** - Element Plus 企业级组件
- 💾 **状态管理** - Pinia 轻量级状态管理

## 🚀 快速开始

### 前置要求
- Node.js ≥ 16.0.0
- npm ≥ 8.0.0
- Git

### 安装步骤

1. **进入项目目录**
   ```bash
   cd src/main/resources/static/ai-portrait-generator
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式**
   ```bash
   npm run dev
   ```
   应用将在 `http://localhost:5173` 启动

4. **生产构建**
   ```bash
   npm run build
   ```
   构建产物位于 `dist/` 目录

5. **访问应用**
   ```
   http://localhost:8083/create-game/asset/character-portrait
   ```

## 📁 项目结构

```
ai-portrait-generator/
├── src/
│   ├── components/                 # Vue 组件
│   │   ├── NavigationBar.vue       # 顶部导航栏
│   │   ├── CoreParamsPanel.vue     # 核心参数面板
│   │   ├── ReferenceImageUpload.vue # 参考图片上传
│   │   ├── AdvancedParamsPanel.vue # 高级参数面板
│   │   ├── ResultsPanel.vue        # 结果展示面板
│   │   └── ResultCard.vue          # 单个结果卡片
│   ├── stores/
│   │   └── portraitStore.ts        # Pinia 状态管理
│   ├── utils/
│   │   ├── imageCompressor.ts      # 图片压缩工具
│   │   └── api.ts                  # API 调用工具
│   ├── styles/
│   │   ├── theme.scss              # 主题变量和 mixin
│   │   └── global.scss             # 全局样式
│   ├── App.vue                     # 根组件
│   └── main.ts                     # 应用入口
├── dist/                           # 构建输出（自动生成）
├── package.json                    # 项目依赖
├── vite.config.ts                  # Vite 配置
├── tsconfig.json                   # TypeScript 配置
├── index.html                      # HTML 入口模板
├── QUICK_START.md                  # 快速开始指南
├── BUILD_CHECKLIST.md              # 构建检查清单
└── TROUBLESHOOTING.md              # 故障排查指南
```

## 🛠️ 技术栈

### 核心依赖
| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.3.4 | 前端框架 |
| vite | ^5.0.8 | 构建工具 |
| typescript | ^5.3.3 | 类型系统 |
| element-plus | ^2.5.0 | UI 组件库 |
| pinia | ^2.1.7 | 状态管理 |
| sass | ^1.69.5 | 样式预处理 |
| axios | ^1.6.2 | HTTP 客户端 |

### 开发工具
- @vitejs/plugin-vue - Vue 3 SFC 支持
- eslint & eslint-plugin-vue - 代码检查
- terser - JavaScript 最小化

## 📚 开发指南

### 项目命令

```bash
# 开发服务器（带热更新）
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

### 代码规范

#### Vue 组件编写
```vue
<template>
  <div class="component-root">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'

// 定义 Props
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()

// 定义 Emits
const emit = defineEmits<{
  update: [value: string]
}>()

// 响应式数据
const isLoading = ref(false)
</script>

<style scoped lang="scss">
// 使用 SCSS 变量
.component-root {
  padding: $spacing-md;
  border-radius: $radius-lg;
}
</style>
```

#### 状态管理（Pinia）
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('my-store', () => {
  // State
  const count = ref(0)

  // Getters
  const doubleCount = computed(() => count.value * 2)

  // Actions
  const increment = () => {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

#### API 调用
```typescript
// 在 api.ts 中定义
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export const portraitAPI = {
  generate: (params: GenerateParams) => api.post('/ai/portrait/generate', params),
  getProgress: (taskId: string) => api.get(`/ai/portrait/progress/${taskId}`),
  getHistory: () => api.get('/ai/portrait/history'),
}
```

### 主题定制

编辑 `src/styles/theme.scss` 自定义主题：

```scss
// 颜色
$primary-purple: #6C5CE7;
$secondary-blue: #00C4FF;

// 尺寸
$spacing-md: 16px;
$radius-lg: 12px;

// 动画
$transition-base: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
```

## 🚢 部署指南

### 预编译构建

```bash
# 1. 安装依赖
npm install

# 2. 构建应用
npm run build

# 3. 验证 dist 目录
ls -la dist/
```

### Spring Boot 集成

1. **构建产物位置**
   ```
   src/main/resources/static/ai-portrait-generator/dist/
   ```

2. **模板配置**
   - 位置：`src/main/resources/templates/asset-editors/character-portrait.html`
   - 模板使用动态脚本加载，自动适应文件名变化

3. **启动应用**
   ```bash
   mvn spring-boot:run
   ```

4. **访问地址**
   ```
   http://localhost:8083/create-game/asset/character-portrait
   ```

### 生产环境优化

- ✅ 已启用 Terser JavaScript 最小化
- ✅ 已启用 gzip 压缩（由 Spring Boot 处理）
- ✅ 已配置资源缓存（文件哈希值）
- ✅ 已优化 CSS 和 JavaScript 分割

## 🐛 故障排查

### 常见问题

**Q: 页面加载显示"应用加载失败"**
A: 这通常表示 dist 目录不存在或文件未生成。请运行 `npm install` 和 `npm run build`。详见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Q: CSS 样式没有应用**
A: 检查 `dist/assets/` 目录是否包含 CSS 文件。如果缺失，请重新构建应用。

**Q: 图片上传失败**
A: 检查浏览器控制台的错误信息，确保 API 端点已配置。

更多问题解答见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📖 相关文档

- [快速开始指南](./QUICK_START.md) - 详细的部署步骤
- [API 集成指南](./API_INTEGRATION_GUIDE.md) - 后端 API 文档
- [部署指南](./DEPLOYMENT_GUIDE.md) - 生产部署说明
- [实现总结](./IMPLEMENTATION_SUMMARY.md) - 功能实现详情
- [构建清单](./BUILD_CHECKLIST.md) - 完整的功能检查表

## 🔗 相关链接

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 📊 项目统计

- **代码行数**：~2000+ 行
- **组件数量**：6 个主要组件
- **支持语言**：TypeScript + Vue 3
- **构建大小**：~363 KB (gzipped)
- **首次加载时间**：< 2s (3G 网络)

## 🎓 学习资源

### 推荐阅读
- Vue 3 Composition API 最佳实践
- Vite 性能优化指南
- Pinia 状态管理模式
- TypeScript 类型系统深入指南

### 在线课程
- Vue 3 从入门到精通
- Vite 现代前端构建工具完全指南
- TypeScript 高级类型系统

## 🤝 贡献指南

欢迎提交问题和拉取请求！

### 提交步骤
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启拉取请求

## 📝 更新日志

### v1.0.0 (2026-03-04)
- ✅ 初始版本发布
- ✅ 核心功能实现
- ✅ 完整文档编写
- ✅ 生产构建优化

## 📜 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👨‍💻 作者

**WriteEngine Team**
- 主页：https://writeengine.example.com
- 文档：https://docs.writeengine.example.com
- 报告问题：https://issues.writeengine.example.com

## 🙏 致谢

感谢以下项目的贡献：
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Element Plus](https://element-plus.org/) - 基于 Vue 3 的 UI 组件库
- [Pinia](https://pinia.vuejs.org/) - Vue Store

---

**最后更新**：2026年3月4日
**当前版本**：v1.0.0
**状态**：✅ 生产就绪

