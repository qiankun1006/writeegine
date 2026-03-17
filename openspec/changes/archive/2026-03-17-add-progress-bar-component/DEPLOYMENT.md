# 进度条组件部署指南

## 部署步骤

### 1. 前端构建
```bash
cd src/main/resources/static/ai-portrait-generator
npm run build
```

构建成功后，会在 `dist/` 目录生成以下文件：
- `dist/assets/progressBarDemo-*.js` - 进度条演示应用JavaScript
- `dist/assets/progressBarDemo-*.css` - 进度条演示应用样式

### 2. 后端编译
```bash
mvn clean compile
```

### 3. 运行应用
```bash
mvn spring-boot:run
```

### 4. 访问地址
- 游戏素材创作门户: http://localhost:8083/create-game/asset
- 进度条组件演示: http://localhost:8083/create-game/asset/progress-bar-demo

## 文件结构

### 新增文件
```
src/main/resources/static/ai-portrait-generator/
├── src/components/ui/
│   ├── ProgressBar.vue          # 主进度条组件
│   ├── ProgressBarEditor.vue    # 血条编辑器组件
│   └── README.md                # 组件文档
├── src/types/
│   └── progress-bar.ts          # TypeScript类型定义
├── src/views/
│   └── ProgressBarDemo.vue      # 演示页面组件
├── src/demo/
│   ├── ProgressBarDemoApp.vue   # 演示应用入口
│   └── main.ts                  # 演示应用主文件
└── vite.config.ts               # 更新了多入口配置

src/main/resources/templates/
├── create-game-asset-portal.html    # 更新：添加了进度条功能块
└── progress-bar-demo.html           # 新增：进度条演示页面

src/main/java/com/example/writemyself/controller/
└── GameAssetController.java         # 新增：游戏素材控制器
```

### 修改文件
1. `vite.config.ts` - 添加了多入口配置
2. `create-game-asset-portal.html` - 添加了UI组件工具功能块

## 配置说明

### Vite配置更新
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'src/main.ts'),
      progressBarDemo: path.resolve(__dirname, 'src/demo/main.ts'),
    },
  }
}
```

### HTML模板更新
```html
<!-- progress-bar-demo.html -->
<script type="module" src="/static/ai-portrait-generator/dist/assets/progressBarDemo-pvLL9pvt.js"></script>
<link rel="stylesheet" href="/static/ai-portrait-generator/dist/assets/progressBarDemo-BJI0_asF.css">
```

注意：构建后的文件名会包含hash，需要根据实际构建结果更新。

## 功能验证

### 1. 基础功能验证
- [x] 访问 http://localhost:8083/create-game/asset
- [x] 确认"UI组件工具"功能块显示正常
- [x] 点击"进度条组件"卡片

### 2. 演示页面验证
- [x] 访问 http://localhost:8083/create-game/asset/progress-bar-demo
- [x] 确认6种进度条效果显示正常
- [x] 测试滑块控制功能
- [x] 测试状态切换功能
- [x] 测试血条编辑器功能

### 3. 响应式验证
- [x] PC端显示正常
- [x] 平板端显示正常
- [x] 移动端适配正常

## 常见问题

### 1. 构建失败
**问题**: `npm run build` 失败
**解决**:
- 检查Node.js版本 (>=16)
- 运行 `npm install` 重新安装依赖
- 检查网络连接

### 2. 页面无法访问
**问题**: 访问页面显示404
**解决**:
- 确认Spring Boot应用已启动
- 检查控制器映射是否正确
- 确认HTML模板文件位置正确

### 3. 样式不显示
**问题**: 页面显示但样式异常
**解决**:
- 检查CSS文件路径是否正确
- 确认构建后的CSS文件存在
- 检查浏览器控制台是否有404错误

### 4. JavaScript错误
**问题**: 控制台显示JavaScript错误
**解决**:
- 检查Vue组件导入路径
- 确认TypeScript编译无错误
- 检查浏览器兼容性

## 性能优化建议

### 1. 代码分割
```typescript
// 可以考虑将进度条组件单独打包
const ProgressBar = () => import('@/components/ui/ProgressBar.vue')
```

### 2. 懒加载
```vue
<!-- 在需要时再加载进度条组件 -->
<template>
  <Suspense>
    <template #default>
      <ProgressBar v-if="showProgressBar" />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### 3. 缓存策略
- 配置HTTP缓存头
- 使用CDN加速静态资源
- 启用Gzip压缩

## 监控与维护

### 1. 日志监控
- 查看Spring Boot应用日志
- 监控前端错误日志
- 跟踪用户访问统计

### 2. 性能监控
- 监控页面加载时间
- 跟踪组件渲染性能
- 分析用户交互数据

### 3. 更新维护
- 定期更新依赖包
- 备份配置文件
- 测试新版本兼容性

## 回滚方案

如果部署后出现问题，可以按以下步骤回滚：

1. 恢复修改的文件
2. 重新构建前端
3. 重新编译后端
4. 重启应用

## 联系方式

如有问题，请联系：
- 前端开发团队
- 后端开发团队
- 系统运维团队

