# Proposal: enhance-skeleton-pipeline-steps

## Why

当前 `EnhancedSkeletonAssetService` 的8步骨骼生成流水线存在两个关键缺陷：

1. **中间结果未持久化**：8个环节的中间产物（骨骼线图、ControlNet处理图、Flux生成图、去背景图、各部件分割图、骨骼绑定JSON）全部只存在于 JVM 内存的 `ConcurrentHashMap<taskId, SkeletonGenerationResponse>` 中。服务重启即丢失，无法追溯调试，无法断点续算。

2. **前端无法感知具体步骤**：现有进度接口只返回 `progress`（0-100的百分比数字）和 `progressMessage`（文字描述），前端无法渲染"已完成✓ / 进行中⟳ / 未开始○"的分步骤状态视图。

## What Changes

### 变更一：新增 MySQL 持久化表，存储每步中间结果

新增两张表：
- `skeleton_pipeline_task`：主任务表，记录整体任务元信息（userId、请求参数、整体状态）
- `skeleton_pipeline_step`：步骤明细表，每一步对应一行，记录步骤状态、开始/完成时间、中间产物URL

8个步骤的中间产物存储策略：

| 步骤 | 中间产物类型 | 存储字段 |
|------|------------|---------|
| 步骤1：T-pose骨骼线图 | PNG图片（base64→文件） | `output_image_url` |
| 步骤2：ControlNet处理图 | PNG图片 | `output_image_url` |
| 步骤3：IP-Adapter特征 | 特征向量（JSON摘要） | `output_data_json` |
| 步骤4：Flux高清人体图 | PNG图片（高分辨率） | `output_image_url` |
| 步骤5：背景去除透明图 | PNG图片（透明底） | `output_image_url` |
| 步骤6：SAM分割部件图 | 多张PNG（JSON存URL列表） | `output_data_json` |
| 步骤7：骨骼绑定数据 | JSON文件 | `output_data_json` + `output_file_url` |
| 步骤8：打包最终结果 | 多URL（JSON） | `output_data_json` |

### 变更二：新增前端步骤状态组件

在 AI 立绘生成器 Vue 应用（`EnhancedGenerationProgress.vue`）中，渲染分步骤进度视图：
- **已完成**：绿色✓图标
- **进行中**：旋转加载圈⟳图标（动画）
- **未开始**：灰色○图标

接口新增 `steps` 字段，后端 `enhanced-status/{taskId}` 接口返回各步骤的详细状态。

## Impact

- Affected specs: skeleton-animation-core（新增 pipeline-steps 能力）、新增 `skeleton-pipeline-steps` spec
- Affected code:
  - 新增迁移脚本 `V3__create_skeleton_pipeline_tables.sql`
  - `EnhancedSkeletonAssetService.java`（每步完成后写入 MySQL）
  - `SkeletonAssetController.java`（`enhanced-status` 接口增加 `steps` 字段）
  - `SkeletonGenerationResponse.java`（新增 `steps` 字段）
  - `static/ai-portrait-generator/src/components/EnhancedGenerationProgress.vue`（步骤状态UI）
  - 新增 Mapper/Repository：`SkeletonPipelineTaskMapper`、`SkeletonPipelineStepMapper`

