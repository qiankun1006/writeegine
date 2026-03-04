# AI 人物立绘生成器 - 部署指南

## 项目概述

这是一个基于 Vue 3 + Vite + TypeScript 的现代化前端应用，用于生成 AI 人物立绘。

## 快速开始

### 1. 开发环境

#### 前置要求
- Node.js 16+
- npm 或 yarn
- 现代浏览器（Chrome、Firefox、Safari、Edge）

#### 安装依赖
```bash
cd src/main/resources/static/ai-portrait-generator
npm install
```

#### 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:5173` 启动

### 2. 生产构建

#### 构建应用
```bash
npm run build
```

构建产物将输出到 `dist/` 目录

#### 验证构建
```bash
npm run preview
```

## 与 Spring Boot 集成

### 文件结构

```
writeengine/
├── src/main/resources/
│   ├── templates/
│   │   └── asset-editors/
│   │       └── character-portrait.html      # Thymeleaf 模板（用户界面）
│   └── static/
│       └── ai-portrait-generator/           # Vue 应用所在目录
│           ├── src/                         # 源代码
│           │   ├── components/              # Vue 组件
│           │   ├── stores/                  # Pinia 状态管理
│           │   ├── styles/                  # 样式文件
│           │   ├── utils/                   # 工具函数
│           │   ├── App.vue                  # 根组件
│           │   └── main.ts                  # 入口文件
│           ├── dist/                        # 构建输出（生产）
│           ├── index.html                   # HTML 模板
│           ├── package.json                 # 项目配置
│           ├── vite.config.ts              # Vite 配置
│           └── tsconfig.json               # TypeScript 配置
├── pom.xml                                  # Maven 配置
└── ...
```

### 部署步骤

#### 步骤 1: 构建 Vue 应用
```bash
cd src/main/resources/static/ai-portrait-generator
npm install
npm run build
```

#### 步骤 2: 验证构建产物
确保 `dist/` 目录包含以下文件：
- `assets/` - 编译后的 JS、CSS 和资源文件
- `index.html` - HTML 文件（不会直接使用，因为我们用 Thymeleaf）

#### 步骤 3: 启动 Spring Boot 应用
```bash
# 从项目根目录
mvn spring-boot:run

# 或使用 Maven 构建
mvn clean package
java -jar target/writeMyself-0.0.1-SNAPSHOT.jar
```

#### 步骤 4: 访问应用
打开浏览器访问：
```
http://localhost:8083/create-game/asset/character-portrait
```

## 路由配置

### Spring Boot Controller
编辑 `src/main/java/com/example/writemyself/controller/HomeController.java`：

```java
@GetMapping("/create-game/asset/character-portrait")
public String characterPortrait(Model model) {
    model.addAttribute("title", "AI 人物立绘生成器");
    return "asset-editors/character-portrait";
}
```

### Thymeleaf 模板
文件：`src/main/resources/templates/asset-editors/character-portrait.html`

模板会自动加载编译后的 Vue 应用。

## 后端 API 集成

### 生成图像 API

当用户点击"生成"按钮时，前端会调用后端 API。

**端点：** `POST /api/ai/portrait/generate`

**请求体：**
```json
{
  "prompt": "日系二次元少女，长发粉发...",
  "negativePrompt": "低质量, 模糊...",
  "referenceImage": "Base64编码的图片数据（可选）",
  "modelWeight": 0.8,
  "width": 512,
  "height": 768,
  "imageStrength": 0.6,
  "generateCount": 1,
  "sampler": "euler",
  "steps": 30,
  "stylePreset": "anime",
  "seed": -1,
  "faceEnhance": true,
  "outputFormat": "png"
}
```

**响应：**
```json
{
  "taskId": "abc123def456",
  "estimatedTime": 120
}
```

### 查询进度 API

**端点：** `GET /api/ai/portrait/progress/{taskId}`

**响应：**
```json
{
  "status": "processing",
  "progress": 50,
  "message": "生成中...",
  "results": null
}
```

生成完成时：
```json
{
  "status": "completed",
  "progress": 100,
  "results": [
    {
      "id": "result1",
      "url": "https://..../image.png",
      "generatedAt": "2024-03-04T10:30:00Z"
    }
  ]
}
```

## 环境变量配置

### 开发环境 (`.env.local`)
```
VITE_API_BASE_URL=http://localhost:8083/api
VITE_ENABLE_DEBUG=true
```

### 生产环境 (`.env.production`)
```
VITE_API_BASE_URL=/api
VITE_ENABLE_DEBUG=false
```

## 常见问题

### Q: 应用无法加载，显示"应用加载失败"
**A:**
1. 检查 `dist/` 目录是否存在和包含正确的文件
2. 验证 Vue 应用是否成功构建：`npm run build`
3. 查看浏览器控制台中的错误信息
4. 确保 Spring Boot 应用正在运行

### Q: 样式没有应用
**A:**
1. 清除浏览器缓存
2. 重新构建：`npm run build`
3. 检查 Vite 配置中的 CSS 处理是否正确

### Q: 上传图片显示"文件过大"
**A:**
前端会自动压缩图片到 1MB 以下。如果仍然失败：
1. 确保上传的文件确实 ≤10MB
2. 尝试其他格式（PNG、JPG、WEBP）
3. 检查浏览器控制台中的错误信息

### Q: 生成按钮被禁用
**A:**
检查以下条件是否满足：
1. 提示词不为空且长度 1-500 字符
2. 生成尺寸为 2 的幂次（256、512、1024、2048）
3. 没有正在进行的生成任务

## 性能优化

### 代码分割
Vite 会自动进行代码分割，大型应用会被分成多个 chunk。

### 图片优化
- 参考图片在前端自动压缩
- 结果图片使用懒加载
- 支持 WebP 格式

### 缓存策略
- 参数自动保存到 localStorage
- API 响应可配置缓存时间

## 故障排除

### 构建失败
```bash
# 清除 node_modules 和缓存
rm -rf node_modules dist
npm cache clean --force

# 重新安装和构建
npm install
npm run build
```

### 开发服务器无响应
```bash
# 检查端口占用
lsof -i :5173

# 如果端口被占用，修改 vite.config.ts 中的端口或杀死占用进程
pkill -f "vite"
```

### Spring Boot 应用无法找到静态文件
1. 验证 `application.properties` 中的静态资源配置
2. 检查文件权限
3. 确保 `dist/` 目录在 `src/main/resources/static/` 下

## 监控和日志

### 前端日志
打开浏览器开发者工具 (F12) 查看控制台输出。

关键日志：
- `🎨 AI 人物立绘生成器已就绪` - 应用启动成功
- `生成参数:` - 显示发送给后端的参数

### 后端日志
在 Spring Boot 启动时查看日志，检查：
- 路由是否正确配置
- 静态资源是否可访问
- API 端点是否正常

## 版本信息

- Vue 3.3.4
- Vite 5.0.8
- TypeScript 5.3.3
- Element Plus 2.5.0
- Pinia 2.1.7

## 更新日志

### v1.0.0 (2024-03-04)
- 初始版本发布
- 完整的 UI 组件
- 参数验证和管理
- 响应式设计

## 许可证

MIT

## 联系方式

如有问题或建议，请联系开发团队。

