# ai-portrait-image-generation Specification

## Purpose
TBD - created by archiving change add-ai-portrait-backend. Update Purpose after archive.
## Requirements
### Requirement: 生成请求处理

系统 SHALL 接收前端发送的生成请求，验证参数，并创建异步生成任务。

#### Scenario: 创建生成任务
- **WHEN** 前端发送 POST /api/ai/portrait/generate 请求，包含有效的提示词和参数
- **THEN** 系统验证参数 (提示词长度、尺寸为 2 的幂次等)
- **AND** 处理上传的参考图片 (Base64 格式，压缩后保存)
- **AND** 创建 AIPortraitGeneration 和 AIPortraitTask 数据库记录
- **AND** 将任务提交到异步处理队列
- **AND** 返回 200 OK，包含 taskId、估计等待时间和队列位置

#### Scenario: 参数验证失败
- **WHEN** 前端发送的参数无效 (如提示词为空、尺寸无效、文件过大)
- **THEN** 系统返回 400 Bad Request
- **AND** 返回详细的错误信息，指出哪些参数有问题
- **AND** 例如 "提示词不能为空，长度 1-500 字符"

#### Scenario: 参考图片处理
- **WHEN** 前端上传参考图片 (Base64 编码)
- **THEN** 系统验证格式 (PNG/JPG/WEBP)
- **AND** 验证大小 (≤10MB)
- **AND** 前端已压缩，后端接收直接保存
- **AND** 返回存储 URL 用于后续处理

---

### Requirement: 异步生成任务处理

系统 SHALL 后台异步处理生成任务，支持进度跟踪和实时更新。

#### Scenario: 任务队列管理
- **WHEN** 生成任务被提交到队列
- **THEN** 任务初始状态为 QUEUED
- **AND** 系统维护一个优先级队列 (最多 100 个待处理任务)
- **AND** 任务按提交顺序排队，高优先级用户优先
- **AND** 每个任务有一个唯一的 taskId

#### Scenario: 任务处理阶段
- **WHEN** 轮到一个任务处理
- **THEN** 任务状态变为 PROCESSING
- **AND** 系统调用 LangChain4J 调用 AI 模型
- **AND** 处理过程分为 4 个阶段：
  - 0-30%: 准备阶段 (加载模型、准备参数)
  - 30-70%: 生成阶段 (AI 模型执行)
  - 70-95%: 优化阶段 (图片后处理、面部修复)
  - 95-100%: 完成阶段 (保存结果)
- **AND** 实时更新数据库中的进度字段

#### Scenario: 生成成功
- **WHEN** AI 模型成功生成图片
- **THEN** 任务状态变为 COMPLETED
- **AND** 生成的图片 URL 列表保存到数据库
- **AND** 记录生成耗时
- **AND** 任务状态变为 SUCCESS

#### Scenario: 生成失败和重试
- **WHEN** AI 模型调用失败或网络错误
- **THEN** 任务状态变为 FAILED
- **AND** 系统自动重试 (最多 3 次)
- **AND** 每次重试间隔 5-10 秒
- **AND** 如果 3 次都失败，任务最终标记为 FAILED
- **AND** 保存错误代码和错误信息

---

### Requirement: 进度查询 API

系统 SHALL 提供端点让前端实时查询生成进度。

#### Scenario: 查询处理中的任务进度
- **WHEN** 前端发送 GET /api/ai/portrait/progress/{taskId}
- **THEN** 系统返回当前进度 (0-100%)
- **AND** 返回当前阶段 ("准备"/"生成"/"优化"/"完成")
- **AND** 返回估计剩余时间 (秒数)
- **AND** 返回 200 OK JSON 响应

#### Scenario: 查询已完成任务的结果
- **WHEN** 任务状态为 COMPLETED，前端查询进度
- **THEN** 系统返回 progress=100
- **AND** 返回生成的图片 URL 列表
- **AND** 返回总生成耗时 (毫秒)
- **AND** 前端可立即显示结果

#### Scenario: 查询失败任务
- **WHEN** 任务状态为 FAILED，前端查询进度
- **THEN** 系统返回 progress=当前进度
- **AND** 返回错误代码和错误信息
- **AND** 返回 200 OK (而不是 500 错误，因为查询本身成功)

#### Scenario: 轮询间隔
- **WHEN** 前端不断轮询查询进度
- **THEN** 系统应该支持每 500ms 一次的轮询频率
- **AND** 响应时间应该 < 100ms
- **AND** 不对单个任户的轮询频率进行限制

---

### Requirement: LangChain4J 模型集成

系统 SHALL 通过 LangChain4J 调用多种 AI 模型进行图片生成。

#### Scenario: OpenAI DALL-E 集成
- **WHEN** 模型配置为 DALL-E
- **THEN** 系统使用 LangChain4J OpenAI SDK
- **AND** 调用 /images/generations 端点
- **AND** 传递提示词、尺寸、数量、质量等参数
- **AND** 获取生成的图片 URL
- **AND** 返回给前端

#### Scenario: Stable Diffusion 集成
- **WHEN** 模型配置为 Stable Diffusion
- **THEN** 系统使用 Ollama 或本地 API
- **AND** 调用本地 API: http://localhost:7860
- **AND** 支持参考图片 (img2img 功能)
- **AND** 支持图生图强度参数 (0-1)
- **AND** 返回生成的图片

#### Scenario: 模型参数映射
- **WHEN** 前端发送参数 (采样器、步数、种子等)
- **THEN** 系统映射到对应的 AI 模型参数
- **AND** 例如: Euler 采样器 → model 参数
- **AND** 例如: 迭代步数 30 → num_inference_steps
- **AND** 例如: 种子 12345 → seed 参数

#### Scenario: 错误处理
- **WHEN** AI API 返回错误 (如配额超出)
- **THEN** 系统捕获异常
- **AND** 返回用户友好的错误信息
- **AND** 例如: "API 配额已超出，请稍后重试"
- **AND** 触发重试机制

---

### Requirement: 图片后处理

系统 SHALL 对生成的图片进行后处理和质量优化。

#### Scenario: 面部修复
- **WHEN** 用户启用面部修复选项
- **THEN** 系统使用面部修复模型
- **AND** 改善生成图片中人物的面部质量
- **AND** 处理耗时通常 5-10 秒
- **AND** 面部修复出现在进度条的优化阶段 (70-95%)

#### Scenario: 输出格式转换
- **WHEN** 用户选择输出格式 (PNG 或 JPG)
- **THEN** 系统根据选择进行格式转换
- **AND** PNG: 保留透明度
- **AND** JPG: 压缩以减小文件大小
- **AND** 两种格式都支持原始分辨率下载

#### Scenario: 图片压缩和优化
- **WHEN** 图片生成完成后
- **THEN** 系统生成缩略图 (200x200)
- **AND** 缩略图用于前端预览
- **AND** 原始图片保存用于下载
- **AND** 缓存优化版本 (800x1200) 用于快速预览

---

### Requirement: 生成结果存储

系统 SHALL 安全地存储生成的图片和元数据。

#### Scenario: 图片存储
- **WHEN** 生成完成，获得图片 URL
- **THEN** 系统下载图片到本地或 OSS
- **AND** 存储路径: /ai-portraits/generated/{userId}/{taskId}/
- **AND** 生成的文件:
  - image_0.png (原始)
  - thumb_0.png (缩略图)
  - optimized_0.png (优化版)
- **AND** 图片 URL 保存到数据库

#### Scenario: 元数据记录
- **WHEN** 生成完成
- **THEN** 系统记录以下元数据:
  - 生成耗时
  - 队列等待时间
  - AI 模型名称和版本
  - 最终使用的所有参数快照
  - 生成完成时间戳

#### Scenario: 过期数据清理
- **WHEN** 生成结果超过 30 天
- **THEN** 系统可定期清理过期数据
- **AND** 先删除对应的图片文件
- **AND** 再删除数据库记录
- **AND** 建议在业务低谷期进行清理

---

