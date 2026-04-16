# skeleton-pipeline-steps Specification

## Purpose

为增强骨骼素材生成流水线（`EnhancedSkeletonAssetService`）的8个步骤提供：
1. 中间产物持久化到 MySQL（可追溯、可重试）
2. 前端可视化步骤进度（三态图标：✓ / ⟳ / ○）

## ADDED Requirements

### Requirement: 步骤中间结果持久化

系统 SHALL 在每个流水线步骤完成时，将该步骤的中间产物URL和状态写入 `skeleton_pipeline_step` 表。

#### Scenario: 步骤1（T-pose骨骼线图）完成
- **GIVEN** 任务 `taskId=enhanced_skeleton_123` 的步骤1已完成
- **WHEN** `generateSkeletonLineImage` 成功返回 base64 图片
- **THEN** 系统调用 `fileStorageService` 将图片保存为文件，返回URL
- **AND** `skeleton_pipeline_step` 中 `task_id=enhanced_skeleton_123, step_no=1` 记录的 `status` 更新为 `SUCCESS`
- **AND** `output_image_url` 字段填入骨骼线图文件URL
- **AND** `completed_at` 填入当前时间，`duration_ms` 填入步骤耗时

#### Scenario: 步骤6（SAM分割）完成
- **GIVEN** 任务步骤6完成，返回 `Map<String, String> parts`（键为部件名，值为base64）
- **WHEN** 各部件图片已保存为文件
- **THEN** `skeleton_pipeline_step` 中 step_no=6 的 `output_data_json` 填入格式如下的JSON：
  `{"head":"http://.../head.png","torso":"http://.../torso.png","leftArm":"...","rightArm":"...","leftLeg":"...","rightLeg":"..."}`

#### Scenario: 步骤中途失败
- **GIVEN** 任务步骤4（Flux生成）调用外部API抛出异常
- **WHEN** 异常被捕获
- **THEN** `skeleton_pipeline_step` 中 step_no=4 的 `status` 更新为 `FAILED`
- **AND** `error_message` 填入异常信息
- **AND** `skeleton_pipeline_task` 的整体 `status` 更新为 `FAILED`
- **AND** 后续步骤5~8 保持 `PENDING` 状态不变

### Requirement: 主任务记录持久化

系统 SHALL 在任务提交时创建主任务记录，在任务完成时更新最终结果URL。

#### Scenario: 任务提交
- **GIVEN** 用户调用 `POST /api/ai/portrait/skeleton/enhanced-generate`
- **WHEN** `submitEnhancedGenerationTask` 执行
- **THEN** `skeleton_pipeline_task` 中插入一条新记录，`status=PENDING`，`progress=0`
- **AND** 同时批量插入8条 `skeleton_pipeline_step` 记录，全部 `status=PENDING`

#### Scenario: 任务成功完成
- **GIVEN** 步骤8（保存最终结果）执行完毕
- **WHEN** `saveAndReturnResults` 成功返回
- **THEN** `skeleton_pipeline_task` 的 `status` 更新为 `SUCCESS`，`progress=100`
- **AND** `full_image_url`、`skeleton_json_url`、`parts_json` 字段填充最终结果

### Requirement: 步骤状态接口

系统 SHALL 在现有 `GET /api/ai/portrait/skeleton/enhanced-status/{taskId}` 接口的响应体中新增 `steps` 字段。

#### Scenario: 前端轮询步骤状态
- **GIVEN** 任务正在处理中，已完成步骤1~3，步骤4正在处理，步骤5~8未开始
- **WHEN** 前端调用 `GET /api/ai/portrait/skeleton/enhanced-status/{taskId}`
- **THEN** 响应体包含 `steps` 数组，共8项
- **AND** steps[0~2].status = "SUCCESS"（步骤1~3）
- **AND** steps[3].status = "PROCESSING"（步骤4）
- **AND** steps[4~7].status = "PENDING"（步骤5~8）
- **AND** 每项包含 `stepNo`、`stepName`、`status`、`startedAt`、`completedAt`、`durationMs`
- **AND** 轻量版接口（status）中 `outputImageUrl` 字段为 null，不返回图片URL

### Requirement: 前端分步骤进度渲染

前端 SHALL 渲染8步流水线的分步状态，每步显示三态图标。

#### Scenario: 渲染进行中的步骤
- **GIVEN** 接口返回 `steps[3].status = "PROCESSING"`
- **WHEN** `EnhancedGenerationProgress.vue` 渲染该步骤
- **THEN** 该步骤显示蓝色旋转动画图标（CSS `animation: spin 1s linear infinite`）
- **AND** 步骤名称文字正常显示，不置灰

#### Scenario: 渲染已完成的步骤（含中间结果缩略图）
- **GIVEN** 用户点击已完成的步骤1（`status=SUCCESS`，`outputImageUrl` 不为空）
- **WHEN** 点击步骤行展开
- **THEN** 显示该步骤的中间结果缩略图（`<img :src="step.outputImageUrl" />`）

#### Scenario: 渲染未开始的步骤
- **GIVEN** 某步骤 `status = "PENDING"`
- **WHEN** 渲染该步骤
- **THEN** 显示灰色空心圆图标
- **AND** 步骤名称文字透明度降低（opacity: 0.4）

