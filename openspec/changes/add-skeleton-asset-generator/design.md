# Design: add-skeleton-asset-generator

## 概述

骨骼素材生成功能将在现有 AI 人物立绘生成器中新增一个素材类型「骨骼素材生成」，核心价值是：
- **一次性生成**完整人体骨骼部件
- **自动分割**为独立肢体 PNG
- **风格统一**可用于骨骼动画制作

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (Vue 3 + TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  AssetTypeSelector.vue  │  SkeletonAssetPanel.vue          │
│  (添加骨骼选项)          │  (骨骼专用参数面板)              │
├─────────────────────────────────────────────────────────────┤
│                    portraitStore.ts                        │
│              (添加骨骼相关状态管理)                          │
├─────────────────────────────────────────────────────────────┤
│                      后端 (Spring Boot)                    │
├─────────────────────────────────────────────────────────────┤
│  AIPortraitController  │  SkeletonAssetService           │
│  (路由分发)               │  (骨骼生成核心服务)              │
├─────────────────────────────────────────────────────────────┤
│                   AI 模型服务层                             │
├─────────────────────────────────────────────────────────────┤
│  Flux.1-dev + LoRA   │  OpenPose    │    SAM 分割模型    │
│  (生成全身图)          │  (结构控制)    │    (自动分割肢体)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 前端设计

### 1.1 修改 AssetTypeSelector.vue

在「一、角色相关」分组中添加骨骼素材选项：

```typescript
// 在 assetGroups.character 数组中添加
const assetGroups = reactive({
  character: [
    // ... 现有选项 ...
    { id: 'character-skeleton', name: '骨骼素材生成', description: '生成可拆分肢体部件', icon: '🦴' },
  ],
})
```

### 1.2 新增 SkeletonAssetPanel.vue

骨骼素材专用参数面板：

```vue
<!-- SkeletonAssetPanel.vue -->
<template>
  <div class="skeleton-asset-panel">
    <!-- 风格选择 -->
    <div class="param-section">
      <label class="section-label">风格选择</label>
      <el-select v-model="selectedStyle" placeholder="请选择风格">
        <el-option label="日系二次元" value="anime" />
        <el-option label="写实人体" value="realistic" />
        <el-option label="Q版卡通" value="chibi" />
        <el-option label="美式卡通" value="cartoon" />
        <el-option label="像素风" value="pixel" />
      </el-select>
    </div>

    <!-- 骨骼模板选择 -->
    <div class="param-section">
      <label class="section-label">骨骼模板</label>
      <el-radio-group v-model="skeletonTemplate">
        <el-radio label="standard">人体标准骨骼</el-radio>
        <el-radio label="animation">动画骨骼</el-radio>
      </el-radio-group>
    </div>

    <!-- 参考图上传 -->
    <div class="param-section">
      <label class="section-label">参考图（保持人物一致性）</label>
      <ReferenceImageUpload
        v-model="referenceImage"
        placeholder="上传角色参考图"
      />
    </div>

    <!-- 输出部件预览 -->
    <div class="param-section">
      <label class="section-label">输出部件</label>
      <div class="parts-preview">
        <div class="part-item">头</div>
        <div class="part-item">躯干</div>
        <div class="part-item">左臂</div>
        <div class="part-item">右臂</div>
        <div class="part-item">左腿</div>
        <div class="part-item">右腿</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ReferenceImageUpload from './ReferenceImageUpload.vue'

const selectedStyle = ref('anime')
const skeletonTemplate = ref('standard')
const referenceImage = ref<string | null>(null)

// 导出参数
const getSkeletonParams = () => ({
  style: selectedStyle.value,
  template: skeletonTemplate.value,
  referenceImage: referenceImage.value,
})
</script>

<style scoped>
.skeleton-asset-panel {
  padding: 16px;
}

.param-section {
  margin-bottom: 16px;
}

.parts-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.part-item {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
}
</style>
```

### 1.3 修改 portraitStore.ts

```typescript
// portraitStore.ts 新增状态

interface SkeletonParams {
  style: 'anime' | 'realistic' | 'chibi' | 'cartoon' | 'pixel'
  template: 'standard' | 'animation'
  referenceImage: string | null
  pose: string
  outputParts: string[]  // ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg']
}

interface GenerationResult {
  id: string
  imageUrl: string
  parts?: {
    head: string
    torso: string
    leftArm: string
    rightArm: string
    leftLeg: string
    rightLeg: string
  }
  generatedAt: string
}

// Store 新增状态
const skeletonParams = reactive<SkeletonParams>({
  style: 'anime',
  template: 'standard',
  referenceImage: null,
  pose: 'standing',
  outputParts: ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
})

// Store 新增方法
const generateSkeletonAssets = async () => {
  isGenerating.value = true
  try {
    const response = await fetch('/api/ai/portrait/skeleton/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        ...skeletonParams,
      }),
    })
    const data = await response.json()
    if (data.parts) {
      addResult({
        id: data.taskId,
        imageUrl: data.fullImageUrl,
        parts: data.parts,
      })
    }
  } finally {
    isGenerating.value = false
  }
}
```

---

## 2. 后端设计

### 2.1 新增 Controller

```java
// SkeletonAssetController.java
@RestController
@RequestMapping("/api/ai/portrait/skeleton")
public class SkeletonAssetController {

    @Autowired
    private SkeletonAssetService skeletonService;

    /**
     * 生成骨骼素材
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateSkeletonAssets(
            @RequestBody SkeletonGenerationRequest request,
            @RequestHeader("X-User-Id") String userId) {

        log.info("骨骼素材生成请求: userId={}, style={}, template={}",
                userId, request.getStyle(), request.getTemplate());

        String taskId = skeletonService.submitGenerationTask(request, userId);

        return ResponseEntity.accepted().body(Map.of(
                "taskId", taskId,
                "status", "PENDING"
        ));
    }

    /**
     * 查询生成结果
     */
    @GetMapping("/result/{taskId}")
    public ResponseEntity<Map<String, Object>> getGenerationResult(
            @PathVariable String taskId,
            @RequestHeader("X-User-Id") String userId) {

        SkeletonGenerationResult result = skeletonService.getResult(taskId);

        if (result.getStatus() == GenerationStatus.PROCESSING) {
            return ResponseEntity.status(202).body(Map.of(
                    "status", "PROCESSING",
                    "progress", result.getProgress()
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", result.getStatus(),
                "fullImageUrl", result.getFullImageUrl(),
                "parts", result.getParts()
        ));
    }
}
```

### 2.2 新增 Service

```java
// SkeletonAssetService.java
@Service
public class SkeletonAssetService {

    @Autowired
    private ImageGenerationService imageService;

    @Autowired
    private AsyncTaskService asyncTaskService;

    /**
     * 提交骨骼素材生成任务
     */
    public String submitGenerationTask(SkeletonGenerationRequest request, String userId) {
        String taskId = "skeleton_" + System.currentTimeMillis();

        // 异步执行
        asyncTaskService.submitTask(() -> {
            try {
                // 阶段1: 生成全身图 (0-70%)
                updateProgress(taskId, 10, "正在生成全身图...");
                String fullImage = imageService.generateWithOpenPose(
                        request.getPrompt(),
                        request.getStyle(),
                        request.getPose()
                );
                updateProgress(taskId, 70, "全身图生成完成");

                // 阶段2: 分割肢体 (70-95%)
                updateProgress(taskId, 75, "正在分割肢体...");
                Map<String, String> parts = segmentLimbs(fullImage);
                updateProgress(taskId, 95, "分割完成");

                // 阶段3: 返回结果
                saveResult(taskId, parts, fullImage);
                updateProgress(taskId, 100, "完成");

            } catch (Exception e) {
                log.error("骨骼素材生成失败: taskId={}", taskId, e);
                saveError(taskId, e.getMessage());
            }
        });

        return taskId;
    }

    /**
     * 使用 SAM 模型分割肢体
     */
    private Map<String, String> segmentLimbs(String fullImageUrl) {
        // 调用 SAM 模型进行分割
        // 返回各部位的 Base64 或 URL
        Map<String, String> parts = new HashMap<>();

        // TODO: 实现 SAM 分割逻辑
        // parts.put("head", ...);
        // parts.put("torso", ...);
        // parts.put("leftArm", ...);
        // parts.put("rightArm", ...);
        // parts.put("leftLeg", ...);
        // parts.put("rightLeg", ...);

        return parts;
    }
}
```

### 2.3 请求/响应 DTO

```java
// SkeletonGenerationRequest.java
public class SkeletonGenerationRequest {
    private String prompt;                    // 正面提示词
    private String negativePrompt;            // 负面提示词
    private String style;                    // 风格: anime/realistic/chibi/cartoon/pixel
    private String template;                 // 骨骼模板: standard/animation
    private String referenceImageBase64;     // 参考图
    private String pose;                     // 姿态
    private int width;                       // 宽度
    private int height;                      // 高度
}

// SkeletonGenerationResult.java
public class SkeletonGenerationResult {
    private String taskId;
    private GenerationStatus status;
    private int progress;
    private String fullImageUrl;             // 完整人体图
    private Map<String, String> parts;       // 分离的部件
    private String errorMessage;
}
```

---

## 3. API 设计

### 3.1 生成骨骼素材

```
POST /api/ai/portrait/skeleton/generate

Request:
{
  "prompt": "日系二次元少女角色立绘",
  "negativePrompt": "低质量, 变形",
  "style": "anime",
  "template": "standard",
  "referenceImageBase64": "...",
  "pose": "standing",
  "width": 1024,
  "height": 1024
}

Response (202 Accepted):
{
  "taskId": "skeleton_1712345678900",
  "status": "PENDING"
}
```

### 3.2 查询生成结果

```
GET /api/ai/portrait/skeleton/result/{taskId}

Response (200 OK - 完成):
{
  "status": "SUCCESS",
  "fullImageUrl": "https://xxx/full.png",
  "parts": {
    "head": "https://xxx/head.png",
    "torso": "https://xxx/torso.png",
    "leftArm": "https://xxx/leftArm.png",
    "rightArm": "https://xxx/rightArm.png",
    "leftLeg": "https://xxx/leftLeg.png",
    "rightLeg": "https://xxx/rightLeg.png"
  }
}

Response (202 Accepted - 处理中):
{
  "status": "PROCESSING",
  "progress": 75
}
```

---

## 4. 数据模型

### 4.1 数据库表 (可选)

```sql
CREATE TABLE skeleton_generation_task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    prompt TEXT,
    style VARCHAR(32),
    template VARCHAR(32),
    status VARCHAR(16) DEFAULT 'PENDING',
    full_image_url VARCHAR(512),
    head_url VARCHAR(512),
    torso_url VARCHAR(512),
    left_arm_url VARCHAR(512),
    right_arm_url VARCHAR(512),
    left_leg_url VARCHAR(512),
    right_leg_url VARCHAR(512),
    error_message TEXT,
    progress INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_id (task_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

---

## 5. 实现优先级

### Phase 1: MVP (最小可行产品)
1. 基础 UI：添加骨骼素材选项
2. 全身图生成（调用现有 AI 服务）
3. 手动分割工具（半自动）
4. 结果展示和下载

### Phase 2: 自动化
1. SAM 模型集成（自动分割）
2. OpenPose 结构控制
3. 多种风格 LoRA

### Phase 3: 增强
1. IP-Adapter 参考图一致性
2. 骨骼绑定模板导出
3. Spine/DragonBones 格式导出

---

## 6. 文件清单

### 新增文件

| 文件路径 | 说明 |
|---------|------|
| `src/main/resources/static/ai-portrait-generator/src/components/SkeletonAssetPanel.vue` | 骨骼素材参数面板 |
| `src/main/java/com/example/writemyself/controller/SkeletonAssetController.java` | 骨骼素材 Controller |
| `src/main/java/com/example/writemyself/service/SkeletonAssetService.java` | 骨骼素材服务 |
| `src/main/java/com/example/writemyself/dto/SkeletonGenerationRequest.java` | 请求 DTO |
| `src/main/java/com/example/writemyself/dto/SkeletonGenerationResult.java` | 响应 DTO |

### 修改文件

| 文件路径 | 说明 |
|---------|------|
| `src/main/resources/static/ai-portrait-generator/src/components/AssetTypeSelector.vue` | 添加骨骼素材选项 |
| `src/main/resources/static/ai-portrait-generator/src/stores/portraitStore.ts` | 添加骨骼状态管理 |
| `src/main/resources/static/ai-portrait-generator/src/components/CoreParamsPanel.vue` | 集成骨骼面板 |

