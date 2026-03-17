# OpenSpec 提案：AI 人物立绘生成 API

## Why

前端 Vue 应用（character-portrait.html 和 App.vue）已完成了完整的用户界面设计，包括参数输入、参数验证、生成按钮等交互。但后端缺少对应的"开始生成"接口，导致点击生成按钮时无法真正调用生成服务。

需要设计并实现后端 API 来接收前端生成请求，处理参数映射，并返回生成结果。

## What Changes

### 前后端协议设计
- 前端通过 POST `/api/ai/portrait/generate` 发送生成请求
- 请求体包含所有生成所需参数（提示词、负面提示词、参考图片、模型、尺寸、采样器等）
- 后端验证参数、创建生成任务、返回任务 ID 和初始响应
- 前端通过 GET `/api/ai/portrait/progress/{taskId}` 轮询生成进度
- 前端通过 GET `/api/ai/portrait/result/{taskId}` 获取最终结果

### 字段映射
前端 Vue Store 中的参数 → 后端 DTO 映射：

**核心参数**
- `prompt` → `prompt` (正面提示词)
- `negativePrompt` → `negativePrompt` (负面提示词)
- `referenceImage` → `referenceImageBase64` (Base64 编码的参考图片)
- `modelWeight` → `modelWeight` (模型权重)
- `width` × `height` → `width`, `height` (生成尺寸)

**模型选择**
- `provider` → `provider` (阿里云/火山引擎)
- `modelVersion` → `modelVersion` (模型版本)

**高级参数**
- `imageStrength` → `imageStrength` (参考图片强度)
- `generateCount` → `generateCount` (生成数量)
- `sampler` → `sampler` (采样器类型)
- `steps` → `steps` (迭代步数)
- `stylePreset` → `stylePreset` (风格预设)
- `seed` → `seed` (随机种子)
- `faceEnhance` → `faceEnhance` (面部修复)
- `outputFormat` → `outputFormat` (输出格式)

### AIPortraitController 改造
- 保留现有的 `/generate`, `/progress/{taskId}`, `/result/{taskId}` 等接口
- 完善 `GeneratePortraitRequest` DTO 中的字段验证
- 实现前端参数到后端的完整映射

## Impact

Affected specs:
- AI 人物立绘生成 API 协议
- 后端参数处理和验证
- 前后端数据交互

Affected code:
- `AIPortraitController.java` (实现 POST /generate 端点)
- `GeneratePortraitRequest.java` (定义请求 DTO)
- `GeneratePortraitResponse.java` (定义响应 DTO)
- `AIPortraitService.java` (实现业务逻辑)

