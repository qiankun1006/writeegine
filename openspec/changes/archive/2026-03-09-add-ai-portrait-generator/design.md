# 设计文档：AI 人物立绘生成工具

## 上下文

### 当前状态
- 现有的 character-portrait.html 是一个手绘编辑工具，支持基础的画布绘制功能
- 使用原生 JavaScript + HTML5 Canvas 实现
- 缺乏与后端 AI 服务的集成

### 需求驱动
- 游戏创作者需要快速生成高质量二次元人物立绘
- 需要支持文本到图像生成的完整流程
- 需要丰富的参数调整能力，同时保持用户界面友好

### 技术约束
- 现有项目使用 Spring Boot + Thymeleaf
- 已有 Element Plus 集成在其他页面
- 需要保持与现有项目结构的一致性

## 目标 / 非目标

### 目标
- ✅ 构建现代化、高交互体验的 AI 立绘生成前端页面
- ✅ 支持所有指定的参数和交互方式
- ✅ 实现优雅的加载动画和进度反馈
- ✅ 确保响应式设计满足多设备需求
- ✅ 提供科技感 + 极简美学的设计

### 非目标
- ❌ 实现后端 AI 服务（假定后端已有或即将有）
- ❌ 创建通用 UI 组件库
- ❌ 支持 IE 11 及更早版本浏览器
- ❌ 替换 Spring Boot 框架

## 技术方案

### 1. 前端框架选择

**Vue 3 + Vite + TypeScript**

理由：
- Vue 3 Composition API 提供更好的代码组织和复用
- Vite 提供快速的开发体验和构建性能
- TypeScript 提供类型安全和更好的 IDE 支持
- 相比原生 JavaScript 更易维护复杂的 UI 逻辑

### 2. UI 组件库

**Element Plus**

理由：
- 提供丰富的组件（Slider、Input、Select、Upload、Dialog 等）
- 支持主题定制，与项目现有使用保持一致
- 开箱即用的无障碍支持
- 文档完整，社区活跃

### 3. 样式方案

**SCSS + CSS 变量 + 响应式布局**

核心色彩系统：
```scss
// 主色调
$primary-purple: #6C5CE7;
$secondary-blue: #00C4FF;
$neutral-gray: #2D3748;
$light-gray: #F8F9FA;
$white: #FFFFFF;

// 扩展色彩
$success: #52C41A;
$warning: #FAAD14;
$error: #F5222D;

// 响应式断点
$bp-mobile: 480px;
$bp-tablet: 768px;
$bp-desktop: 1024px;
$bp-wide: 1440px;
```

布局采用 CSS Grid/Flexbox，确保：
- PC (1440px+)：三栏布局（参数 + 画布 + 结果）
- 平板 (768px-1439px)：两栏或堆叠布局
- 手机 (<768px)：单栏堆叠布局

### 4. 页面结构

```
AI 立绘生成器
├── 顶部导航区 (NavigationBar)
│   ├── 左侧：品牌名称
│   └── 右侧：用户中心占位
│
├── 主体区域 (MainContainer)
│   ├── 左侧：核心参数区 (CoreParamsPanel)
│   │   ├── 提示词输入 (PromptInput)
│   │   ├── 负面提示词输入 (NegativePromptInput)
│   │   ├── 参考图片上传 (ReferenceImageUpload)
│   │   ├── 模型权重滑块 (ModelWeightSlider)
│   │   ├── 尺寸选择 (SizeSelector)
│   │   ├── 高级参数折叠面板 (AdvancedParamsCollapse)
│   │   └── 生成按钮 (GenerateButton)
│   │
│   └── 右侧：结果展示区 (ResultsPanel)
│       ├── 加载动画 (LoadingAnimation)
│       ├── 进度条 (ProgressBar)
│       └── 生成结果卡片 (ResultCard)
│           ├── 图片预览 (ImagePreview)
│           ├── 导出按钮组 (ExportButtons)
│           └── 历史记录 (HistoryList)
```

### 5. 组件设计细节

#### 5.1 PromptInput 组件
```typescript
interface PromptInputProps {
  modelValue: string;
  placeholder?: string;
  maxLength?: number;
  showCounter?: boolean;
  focusGlow?: boolean; // 聚焦发光效果
}

// 功能：
// - 实时字数统计
// - 聚焦时边框发光动效
// - 支持快速模板插入
// - 自动保存到 localStorage
```

#### 5.2 ReferenceImageUpload 组件
```typescript
interface ReferenceImageUploadProps {
  maxSize: number; // 10MB
  acceptFormats: string[]; // ['png', 'jpg', 'webp']
  onUpload: (file: File, preview: string) => void;
  onRemove: () => void;
}

// 功能：
// - 拖拽上传
// - 点击选择
// - 缩略图预览 (200x200)
// - 文件验证 (格式、大小)
// - 加载状态反馈
```

#### 5.3 SizeSelector 组件
```typescript
interface SizeSelectorProps {
  presets: Array<{label: string; width: number; height: number}>;
  allowCustom: boolean;
  minSize: number;
  maxSize: number;
}

// 功能：
// - 预设尺寸快速选择
// - 自定义尺寸输入（2的幂次验证）
// - 实时尺寸信息显示
// - 长宽比计算
```

#### 5.4 AdvancedParamsCollapse 组件
```typescript
interface AdvancedParams {
  imageStrength: number; // 0-1, default 0.6
  generateCount: number; // 1-5, default 1
  sampler: 'euler' | 'dpm++' | 'autocfg';
  steps: number; // 10-50, default 30
  stylePreset: string;
  seed: number; // -1 = random
  faceEnhance: boolean;
  outputFormat: 'png' | 'jpg';
}

// 功能：
// - 默认收起状态
// - 平滑展开/收起动画
// - 参数验证和范围限制
// - 参数恢复默认值功能
```

### 6. 交互流程

#### 生成流程
```
用户输入参数
    ↓
验证参数 (前端验证)
    ↓
禁用生成按钮，显示"生成中..."
    ↓
发送请求到后端 API
    ↓
轮询/WebSocket 获取生成进度
    ↓
显示进度条和粒子动效
    ↓
收到结果后，停止加载动画
    ↓
淡入展示生成结果
    ↓
启用导出和其他操作按钮
```

#### 参数处理
```
实时参数验证:
- 提示词长度: 1-500 字符
- 负面提示词: 0-500 字符
- 参考图大小: ≤10MB
- 尺寸: 必须是 2 的幂次 (256-2048)
- 模型权重: 0-1 之间
- 生成数量: 1-5
- 迭代步数: 10-50
- 种子值: -1 或 0-9999999

前端反馈:
- 实时验证提示
- 参数越界时禁用生成按钮
- 尺寸预警信息（生成时间估计）
```

### 7. 加载动画方案

采用两层动效：

1. **进度条动画** (CSS 动画)
```scss
@keyframes progress-fill {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

// 分阶段更新:
// 10% -> 30% (准备阶段)
// 30% -> 60% (生成阶段)
// 60% -> 95% (优化阶段)
// 95% -> 100% (完成)
```

2. **粒子动效** (Canvas 或 CSS)
```
- 生成 10-20 个粒子
- 从底部向上运动
- 随机大小和透明度
- 循环播放，直到生成完成
```

### 8. 响应式断点

| 设备 | 宽度 | 布局 |
|------|------|------|
| 手机纵向 | <480px | 单栏堆叠 |
| 手机横向 | 480-767px | 单栏或两栏 |
| 平板 | 768-1023px | 两栏（参数折叠） |
| 桌面 | 1024-1439px | 三栏（参数折叠） |
| 宽屏 | ≥1440px | 三栏完整展示 |

### 9. 状态管理

使用 Vue 3 Composition API + localStorage：

```typescript
// 核心状态
const state = reactive({
  // 提示词
  prompt: '',
  negativePrompt: 'low quality, blurry',

  // 参考图
  referenceImage: null,
  referenceImagePreview: '',

  // 核心参数
  modelWeight: 0.8,
  width: 768,
  height: 512,

  // 高级参数
  imageStrength: 0.6,
  generateCount: 1,
  sampler: 'euler',
  steps: 30,
  stylePreset: 'none',
  seed: -1,
  faceEnhance: true,
  outputFormat: 'png',

  // 状态标记
  isGenerating: false,
  generationProgress: 0,
  results: [],
});

// 持久化：自动保存核心参数到 localStorage
// 恢复：页面加载时从 localStorage 恢复参数
```

### 10. 后端集成

假设后端提供以下 API：

```typescript
// 1. 生成图像 (立即返回 task ID)
POST /api/ai/portrait/generate
Request: {
  prompt: string,
  negativePrompt?: string,
  referenceImage?: Base64String,
  modelWeight?: number,
  width: number,
  height: number,
  imageStrength?: number,
  generateCount?: number,
  sampler?: string,
  steps?: number,
  stylePreset?: string,
  seed?: number,
  faceEnhance?: boolean,
  outputFormat?: 'png' | 'jpg',
}
Response: {
  taskId: string,
  estimatedTime: number,
}

// 2. 查询进度
GET /api/ai/portrait/progress/:taskId
Response: {
  status: 'pending' | 'processing' | 'completed' | 'error',
  progress: number, // 0-100
  message?: string,
  results?: Array<{
    url: string,
    generatedAt: string,
  }>,
}

// 3. 导出结果
GET /api/ai/portrait/export/:resultId?format=png|jpg
// 直接返回图片文件
```

## 风险 / 权衡

### 风险 1: Vue 3 + Vite 在 Spring Boot 中的集成
**影响**: 构建流程可能复杂
**缓解**:
- 使用 npm/pnpm 和 Vite 独立构建前端
- 将构建产物放在 `src/main/resources/static/ai-portrait-generator/`
- Thymeleaf 页面引用构建后的 JS 和 CSS

### 风险 2: 后端 AI 服务不可用
**影响**: 生成功能无法测试
**缓解**:
- 提供 Mock API 用于开发测试
- 实现客户端错误处理和重试机制

### 风险 3: 大文件上传性能
**影响**: 参考图上传时可能卡顿
**缓解**:
- 前端压缩参考图（最大 1MB）
- 显示上传进度条
- 支持取消上传

## 迁移计划

1. **第一阶段**：开发和测试
   - 搭建 Vue 3 + Vite 开发环境
   - 实现所有 UI 组件
   - 集成 Mock API 进行前端测试

2. **第二阶段**：与后端集成
   - 连接真实后端 API
   - 测试完整的生成流程
   - 性能优化

3. **第三阶段**：上线
   - 部署到生产环境
   - 监控用户反馈
   - 迭代优化

## 开放问题

- [ ] 后端 AI 服务 API 具体格式？
- [ ] 是否需要支持生成历史存储？
- [ ] 生成超时时长如何设置？
- [ ] 是否需要用户配额管理？
- [ ] 如何处理生成失败的错误信息？

