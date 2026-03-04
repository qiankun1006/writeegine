# AI 人物立绘生成器 - 快速开始指南

## 📋 项目概述

这是一个基于 Vue 3 + Vite + TypeScript 的现代前端应用，专为 AI 人物立绘生成功能设计。

## 🚀 快速部署步骤

### 第一步：安装依赖
在项目目录运行：
```bash
npm install
```

### 第二步：构建应用
```bash
npm run build
```

构建完成后，产物将生成在 `dist/` 目录，包含：
- `dist/index.html` - 应用入口 HTML
- `dist/assets/*.js` - 编译后的 JavaScript（含哈希值）
- `dist/assets/*.css` - 编译后的样式文件

### 第三步：重启 Spring Boot 应用
重启后端应用，静态资源会自动被 Spring Boot 提供服务。

### 第四步：验证部署
访问以下 URL：
```
http://localhost:8083/create-game/asset/character-portrait
```

## 📁 项目结构

```
ai-portrait-generator/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── NavigationBar.vue
│   │   ├── CoreParamsPanel.vue
│   │   ├── ReferenceImageUpload.vue
│   │   ├── AdvancedParamsPanel.vue
│   │   ├── ResultsPanel.vue
│   │   └── ResultCard.vue
│   ├── stores/              # Pinia 状态管理
│   │   └── portraitStore.ts
│   ├── utils/               # 工具函数
│   │   ├── imageCompressor.ts
│   │   └── api.ts
│   ├── styles/              # 样式文件
│   │   ├── theme.scss       # 主题变量和 mixin
│   │   └── global.scss      # 全局样式
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── dist/                    # 构建输出（自动生成）
├── package.json
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── index.html               # HTML 模板
```

## 🛠️ 可用命令

```bash
# 开发模式：启动热更新开发服务器
npm run dev

# 生产构建：生成优化后的产物
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 🎨 设计系统

### 色彩主题
- **主色调**：深紫 (#6C5CE7)
- **辅助色**：浅蓝 (#00C4FF)
- **背景色**：浅灰 (#F8F9FA)
- **中性色**：深灰 (#2D3748)

### 响应式设计
- 移动设备：≤480px
- 平板设备：768px - 1023px
- 桌面设备：≥1024px

## 📦 依赖说明

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.3.4 | 核心框架 |
| vite | ^5.0.8 | 构建工具 |
| typescript | ^5.3.3 | 类型系统 |
| element-plus | ^2.5.0 | UI 组件库 |
| pinia | ^2.1.7 | 状态管理 |
| sass | ^1.69.5 | 样式预处理 |
| axios | ^1.6.2 | HTTP 客户端 |

## 🔧 配置说明

### vite.config.ts
- **base**: `/static/ai-portrait-generator/dist/` - 资源基础路径
- **CSS preprocessor**: 全局 SCSS 变量注入
- **Build**: 使用 terser 最小化 JavaScript

### tsconfig.json
- **target**: ES2020 - 现代 JavaScript 特性
- **module**: ESNext - 支持 ES 模块
- **moduleResolution**: bundler - 最新的模块解析策略

## 🐛 常见问题

### Q: 构建后仍看到"应用加载失败"？
A:
1. 确保已执行 `npm run build`
2. 确保 `dist/` 目录存在且包含文件
3. 重启 Spring Boot 应用
4. 清除浏览器缓存（Ctrl+Shift+Del）
5. 检查浏览器控制台的错误信息

### Q: CSS 样式没有正确应用？
A:
1. 确保 vite.config.ts 中配置了 SCSS 全局变量
2. 检查 `src/styles/theme.scss` 是否存在
3. 重新构建应用：`npm run build`

### Q: 如何在开发中进行热更新？
A:
1. 运行 `npm run dev` 启动开发服务器
2. 服务器会在 `http://localhost:5173` 上运行
3. 修改文件时会自动刷新页面

## 📚 相关文档

- [API 集成指南](./API_INTEGRATION_GUIDE.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [实现总结](./IMPLEMENTATION_SUMMARY.md)

## 📞 支持

如有问题，请检查：
1. 浏览器控制台（F12）中的错误信息
2. Spring Boot 应用日志
3. 网络请求（Network 标签页）

---

**最后更新**：2026年3月4日
**版本**：1.0.0

