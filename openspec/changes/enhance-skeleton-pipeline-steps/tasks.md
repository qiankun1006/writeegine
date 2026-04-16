# Tasks: enhance-skeleton-pipeline-steps

## 数据库层

- [x] T1. 新建迁移脚本 `V3__create_skeleton_pipeline_tables.sql`，包含 `skeleton_pipeline_task` 和 `skeleton_pipeline_step` 两张表的建表语句
- [x] T2. 新建 MyBatis Mapper XML：`skeleton_pipeline_task.xml` 和 `skeleton_pipeline_step.xml`，实现 insert、selectByTaskId、updateStatus 等基础 SQL
- [x] T3. 新建 Java 实体类 `SkeletonPipelineTask.java` 和 `SkeletonPipelineStep.java`（与表字段对应）
- [x] T4. 新建 Mapper 接口 `SkeletonPipelineTaskMapper.java` 和 `SkeletonPipelineStepMapper.java`

## 后端服务层

- [x] T5. 修改 `EnhancedSkeletonAssetService`：在任务提交时（`submitEnhancedGenerationTask`），向 `skeleton_pipeline_task` 插入主任务记录，同时批量插入8条 step 记录（状态均为 `PENDING`）
- [x] T6. 修改 `processEnhancedSkeletonGeneration`：每个步骤开始前将对应 step 的 `status` 更新为 `PROCESSING`、`started_at` 填充当前时间
- [x] T7. 修改 `processEnhancedSkeletonGeneration`：每个步骤完成后将对应 step 的 `status` 更新为 `SUCCESS`，填充 `completed_at`，并将中间产物存入 `output_image_url` 或 `output_data_json`
- [x] T8. 修改 `processEnhancedSkeletonGeneration`：步骤出错时将对应 step 的 `status` 更新为 `FAILED`，填充 `error_message`，并将整体任务的 `status` 置为 `FAILED`
- [x] T9. 修改 `getResult` / 新增 `getStepsDetail`：从数据库查询各步骤状态，合并到响应对象中

## 后端接口层

- [x] T10. 修改 `SkeletonGenerationResponse.java`，新增 `List<StepStatus> steps` 字段，`StepStatus` 包含：`stepNo`、`stepName`、`status`（PENDING/PROCESSING/SUCCESS/FAILED）、`progress`（步骤内0-100）、`outputImageUrl`、`startedAt`、`completedAt`、`errorMessage`
- [x] T11. 修改 `SkeletonAssetController` 的 `getEnhancedGenerationStatus` 接口，返回值中包含 `steps` 列表（轻量版：不含 outputImageUrl，只含状态和时间戳）
- [x] T12. 修改 `SkeletonAssetController` 的 `getEnhancedGenerationResult` 接口，返回值中包含完整 `steps`（含各步骤 `outputImageUrl`）

## 前端层

- [x] T13. 修改 `EnhancedGenerationProgress.vue`：按照步骤列表渲染分步进度条，每步显示：状态图标（✓/⟳/○）+ 步骤名称 + 耗时
- [x] T14. 在状态图标区域实现三态视觉：
  - `SUCCESS`：绿色填充圆形 + 白色✓
  - `PROCESSING`：蓝色旋转动画圆圈（CSS animation）
  - `PENDING`：灰色空心圆
  - `FAILED`：红色×
- [x] T15. 修改轮询逻辑（`EnhancedGenerationProgress.vue` 内），从 `enhanced-status/{taskId}` 接口取 `steps` 字段并驱动步骤视图更新
- [x] T16. 已完成的步骤可点击展开，显示该步骤的中间结果缩略图（`outputImageUrl` 不为空时）

## 验收

- [x] T17. 本地启动服务，触发一次增强生成任务，验证数据库中8条 step 记录按顺序创建并正确更新状态
- [x] T18. 打开前端页面，验证步骤状态图标随后端推进正确变化（PENDING→PROCESSING→SUCCESS）

