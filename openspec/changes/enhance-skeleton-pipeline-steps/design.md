# Design: enhance-skeleton-pipeline-steps

## 一、现状分析

### 现有问题

`EnhancedSkeletonAssetService` 的 8 步流水线目前使用内存 Map 存储所有任务状态：

```java
// 全部在内存，服务重启即丢失
private final Map<String, SkeletonGenerationResponse> taskResults = new ConcurrentHashMap<>();

private void updateProgress(String taskId, int progress, String message) {
    SkeletonGenerationResponse response = taskResults.get(taskId);
    if (response != null) {
        response.setProgress(progress);       // 只有一个百分比
        response.setProgressMessage(message); // 只有文字描述
        response.setStatus("PROCESSING");
    }
}
```

**8个步骤均无中间结果落库**：
- 步骤1：`skeletonLineImageBase64` — 内存变量，用完即弃
- 步骤2：`controlNetProcessedImage` — 内存变量，用完即弃
- 步骤3：`ipAdapterFeatures` — 内存变量，用完即弃
- 步骤4：`fullImageBase64` — 内存变量，用完即弃
- 步骤5：`transparentImageBase64` — 内存变量，用完即弃
- 步骤6：`parts`（Map<String, String>）— 内存变量，步骤8 才落文件存储
- 步骤7：`bindingData` — 内存变量，步骤8 才落文件存储
- 步骤8：最终结果通过 `fileStorageService` 落本地磁盘，URL 存入内存 Map

---

## 二、数据库表设计

### 2.1 主任务表 `skeleton_pipeline_task`

```sql
CREATE TABLE IF NOT EXISTS skeleton_pipeline_task (
    id            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id       VARCHAR(64)   NOT NULL COMMENT '任务唯一标识，如 enhanced_skeleton_1710000000000',
    user_id       VARCHAR(64)   COMMENT '用户ID',
    -- 请求参数快照
    style         VARCHAR(50)   COMMENT '生成风格：anime/realistic/chibi/cartoon/pixel',
    template_type VARCHAR(50)   COMMENT '骨骼模板类型',
    pose          VARCHAR(50)   COMMENT '姿态',
    prompt        TEXT          COMMENT '提示词',
    negative_prompt TEXT        COMMENT '负面提示词',
    width         INT           DEFAULT 512  COMMENT '目标宽度',
    height        INT           DEFAULT 512  COMMENT '目标高度',
    ref_image_url VARCHAR(500)  COMMENT '参考图URL（若有）',
    -- 整体状态
    status        VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                  COMMENT '整体状态：PENDING/PROCESSING/SUCCESS/FAILED',
    progress      INT           DEFAULT 0 COMMENT '整体进度 0-100',
    error_message TEXT          COMMENT '整体错误信息',
    -- 最终结果
    full_image_url        VARCHAR(500) COMMENT '最终完整透明图URL',
    skeleton_json_url     VARCHAR(500) COMMENT '骨骼绑定JSON（通用格式）',
    skeleton_spine_url    VARCHAR(500) COMMENT '骨骼绑定JSON（Spine格式）',
    skeleton_dragonbones_url VARCHAR(500) COMMENT '骨骼绑定JSON（DragonBones格式）',
    parts_json    JSON          COMMENT '各部件URL的JSON映射',
    -- 时间
    started_at    TIMESTAMP     NULL COMMENT '开始处理时间',
    completed_at  TIMESTAMP     NULL COMMENT '完成时间',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_id (task_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='增强骨骼素材生成 - 主任务表';
```

### 2.2 步骤明细表 `skeleton_pipeline_step`

```sql
CREATE TABLE IF NOT EXISTS skeleton_pipeline_step (
    id              BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id         VARCHAR(64) NOT NULL COMMENT '关联的任务ID',
    step_no         INT         NOT NULL COMMENT '步骤序号 1-8',
    step_name       VARCHAR(100) NOT NULL
                    COMMENT '步骤名称，如：生成T-pose骨骼线图',
    step_key        VARCHAR(50)  NOT NULL
                    COMMENT '步骤唯一键：skeleton_line/controlnet/ip_adapter/flux_generate/bg_remove/sam_segment/binding_data/save_result',
    -- 状态
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                    COMMENT 'PENDING/PROCESSING/SUCCESS/FAILED/SKIPPED',
    progress        INT          DEFAULT 0 COMMENT '步骤内进度 0-100',
    error_message   TEXT         COMMENT '步骤错误信息',
    -- 中间产物（步骤完成后填充）
    output_image_url VARCHAR(500) COMMENT '该步骤输出的图片URL（步骤1/2/4/5适用）',
    output_data_json JSON         COMMENT '该步骤输出的结构化数据（步骤3/6/7/8适用）',
    output_file_url  VARCHAR(500) COMMENT '该步骤输出的文件URL（步骤7/8适用）',
    -- 时间
    started_at      TIMESTAMP    NULL COMMENT '步骤开始时间',
    completed_at    TIMESTAMP    NULL COMMENT '步骤完成时间',
    duration_ms     BIGINT       COMMENT '步骤耗时（毫秒）',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_step (task_id, step_no),
    INDEX idx_task_id (task_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='增强骨骼素材生成 - 步骤明细表';
```

### 2.3 各步骤落库内容详解

| 步骤 | step_key | output_image_url | output_data_json | output_file_url |
|------|----------|-----------------|-----------------|----------------|
| 1. T-pose骨骼线图 | `skeleton_line` | 骨骼线图PNG的URL | — | — |
| 2. ControlNet处理图 | `controlnet` | ControlNet输出PNG的URL | — | — |
| 3. IP-Adapter特征 | `ip_adapter` | — | `{"weight":0.6,"begin":0,"end":1000}` 摘要 | — |
| 4. Flux高清人体图 | `flux_generate` | Flux输出PNG的URL（2048px） | — | — |
| 5. 背景去除透明图 | `bg_remove` | 透明PNG的URL | — | — |
| 6. SAM分割部件 | `sam_segment` | — | `{"head":"url","torso":"url",...}` | — |
| 7. 骨骼绑定数据 | `binding_data` | — | 骨骼绑定JSON摘要 | 通用格式JSON文件URL |
| 8. 保存最终结果 | `save_result` | — | `{"fullImage":"url","parts":{...},"skeletonUrls":{...}}` | — |

---

## 三、后端改造方案

### 3.1 任务初始化时批量插入步骤记录

```java
// EnhancedSkeletonAssetService.java

public String submitEnhancedGenerationTask(SkeletonGenerationRequest request, String userId) {
    String taskId = "enhanced_skeleton_" + System.currentTimeMillis();

    // 1. 写主任务到 DB
    SkeletonPipelineTask task = buildTask(taskId, request, userId);
    pipelineTaskMapper.insert(task);

    // 2. 批量写8条步骤记录（均为 PENDING）
    List<SkeletonPipelineStep> steps = buildInitialSteps(taskId);
    pipelineStepMapper.batchInsert(steps);

    // 3. 内存缓存保持向后兼容（现有轮询接口）
    taskResults.put(taskId, SkeletonGenerationResponse.builder()
        .taskId(taskId).status("PENDING").progress(0).build());

    processEnhancedSkeletonGeneration(taskId, request, userId);
    return taskId;
}

// 8个步骤的初始定义
private List<SkeletonPipelineStep> buildInitialSteps(String taskId) {
    return Arrays.asList(
        step(taskId, 1, "生成T-pose骨骼线图",    "skeleton_line"),
        step(taskId, 2, "应用ControlNet姿势约束", "controlnet"),
        step(taskId, 3, "提取IP-Adapter特征",    "ip_adapter"),
        step(taskId, 4, "Flux.1-dev高清生成",    "flux_generate"),
        step(taskId, 5, "背景去除",              "bg_remove"),
        step(taskId, 6, "SAM 2肢体分割",         "sam_segment"),
        step(taskId, 7, "骨骼绑定数据生成",      "binding_data"),
        step(taskId, 8, "保存最终结果",          "save_result")
    );
}
```

### 3.2 每步骤的状态更新模式

```java
// 通用模式：开始 → 执行 → 完成/失败

// 步骤1示例
private String generateSkeletonLineImage(String taskId, String template) {
    // 步骤开始
    stepStart(taskId, 1);
    try {
        OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);
        BufferedImage skeletonImage = openPoseTemplateService.generateSkeletonImage(openPoseTemplate, 512, 512);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(skeletonImage, "PNG", baos);
        String base64 = Base64.getEncoder().encodeToString(baos.toByteArray());

        // 保存中间图片到文件系统
        String imageUrl = fileStorageService.saveImageFromBase64(base64, taskId + "_step1_skeleton_line.png");

        // 步骤完成，记录产物
        stepSuccess(taskId, 1, imageUrl, null, null);
        return base64;
    } catch (Exception e) {
        stepFailed(taskId, 1, e.getMessage());
        throw e;
    }
}

// 辅助方法
private void stepStart(String taskId, int stepNo) {
    pipelineStepMapper.updateStatusToProcessing(taskId, stepNo, LocalDateTime.now());
}

private void stepSuccess(String taskId, int stepNo,
                          String imageUrl, String dataJson, String fileUrl) {
    long durationMs = computeDuration(taskId, stepNo);
    pipelineStepMapper.updateStatusToSuccess(taskId, stepNo,
        imageUrl, dataJson, fileUrl, LocalDateTime.now(), durationMs);
}

private void stepFailed(String taskId, int stepNo, String errorMessage) {
    pipelineStepMapper.updateStatusToFailed(taskId, stepNo,
        errorMessage, LocalDateTime.now());
    pipelineTaskMapper.updateStatusToFailed(taskId, errorMessage);
}
```

### 3.3 查询接口新增 steps 字段

```java
// SkeletonGenerationResponse.java 新增字段
@Data
@Builder
public class SkeletonGenerationResponse {
    // 现有字段...
    private String taskId;
    private String status;
    private int progress;
    private String progressMessage;
    // ...

    // 新增
    private List<StepStatus> steps;  // 步骤状态列表

    @Data
    @Builder
    public static class StepStatus {
        private int stepNo;
        private String stepName;
        private String stepKey;
        private String status;      // PENDING / PROCESSING / SUCCESS / FAILED
        private int progress;       // 步骤内进度 0-100
        private String outputImageUrl;
        private String startedAt;
        private String completedAt;
        private Long durationMs;
        private String errorMessage;
    }
}
```

---

## 四、前端组件设计

### 4.1 EnhancedGenerationProgress.vue 改造

```vue
<template>
  <div class="pipeline-progress">
    <div class="pipeline-steps">
      <div
        v-for="step in steps"
        :key="step.stepNo"
        class="step-item"
        :class="['step-' + step.status.toLowerCase()]"
        @click="toggleStepDetail(step)"
      >
        <!-- 状态图标 -->
        <div class="step-icon">
          <span v-if="step.status === 'SUCCESS'"  class="icon-success">✓</span>
          <span v-if="step.status === 'PROCESSING'" class="icon-spinning">⟳</span>
          <span v-if="step.status === 'PENDING'"   class="icon-pending">○</span>
          <span v-if="step.status === 'FAILED'"    class="icon-failed">✗</span>
        </div>

        <!-- 步骤信息 -->
        <div class="step-info">
          <span class="step-name">步骤{{ step.stepNo }}: {{ step.stepName }}</span>
          <span v-if="step.durationMs" class="step-duration">{{ formatDuration(step.durationMs) }}</span>
          <span v-if="step.status === 'FAILED'" class="step-error">{{ step.errorMessage }}</span>
        </div>

        <!-- 中间结果缩略图（可展开） -->
        <div v-if="step.outputImageUrl && expandedStep === step.stepNo" class="step-preview">
          <img :src="step.outputImageUrl" :alt="step.stepName + ' 中间结果'" />
        </div>
      </div>
    </div>

    <!-- 整体进度条 -->
    <div class="overall-progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      <span>{{ progress }}%</span>
    </div>
  </div>
</template>
```

### 4.2 CSS 三态视觉

```scss
.step-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &.step-pending {
    opacity: 0.4;
    .step-icon { color: #999; }
  }

  &.step-processing {
    background: rgba(59, 130, 246, 0.1);
    .step-icon { color: #3b82f6; }
    .icon-spinning {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
  }

  &.step-success {
    .step-icon { color: #22c55e; }
    background: rgba(34, 197, 94, 0.08);
  }

  &.step-failed {
    .step-icon { color: #ef4444; }
    background: rgba(239, 68, 68, 0.08);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

### 4.3 轮询逻辑

每 2 秒轮询 `GET /api/ai/portrait/skeleton/enhanced-status/{taskId}`，
取响应中的 `steps` 数组更新组件状态。任务完成（status=SUCCESS/FAILED）后停止轮询。

```typescript
// portraitStore.ts 或组件内
async pollEnhancedStatus(taskId: string) {
  this.pollingTimer = setInterval(async () => {
    const res = await api.get(`/api/ai/portrait/skeleton/enhanced-status/${taskId}`)
    this.steps = res.data.steps || []
    this.overallProgress = res.data.progress

    if (['SUCCESS', 'FAILED'].includes(res.data.status)) {
      clearInterval(this.pollingTimer)
      // 如果成功，加载完整结果（含 outputImageUrl）
      if (res.data.status === 'SUCCESS') {
        await this.loadFinalResult(taskId)
      }
    }
  }, 2000)
}
```

---

## 五、关键设计决策

### 决策1：中间图片如何存储？

选择：**先保存到文件系统（`fileStorageService`），再把URL写入DB**。
- 优点：DB存URL轻量，图片二进制不占MySQL空间
- 步骤1~5的中间图片均先调用 `fileStorageService.saveImageFromBase64` 落文件，再把返回URL写入 `output_image_url`
- 步骤3（IP-Adapter特征）不是图片，只存参数摘要JSON

### 决策2：是否废弃内存Map？

**不废弃，双写兼容**。原内存Map继续维护，DB是附加持久化，不修改现有查询接口签名，只在 `enhanced-status` 接口的响应体中追加 `steps` 字段。

### 决策3：前端轮询频率

2秒一次。生成流水线总时长约2~5分钟，2秒轮询不会产生明显压力。任务完成后停止轮询。

