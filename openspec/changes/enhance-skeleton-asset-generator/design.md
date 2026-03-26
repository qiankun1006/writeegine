# Design: enhance-skeleton-asset-generator

## 概述

增强骨骼素材生成功能，实现真正的肢体自动分割、透明底导出和用户友好的结果展示。

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (Vue 3 + TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  SkeletonAssetPanel.vue  │  SkeletonResultPanel.vue       │
│  (参数配置)               │  (结果展示和下载)              │
├─────────────────────────────────────────────────────────────┤
│                    portraitStore.ts                        │
│              (状态管理和进度轮询)                          │
├─────────────────────────────────────────────────────────────┤
│                      后端 (Spring Boot)                    │
├─────────────────────────────────────────────────────────────┤
│  SkeletonAssetController │  SkeletonAssetService          │
│  (API 路由)               │  (核心业务逻辑)                │
├─────────────────────────────────────────────────────────────┤
│                   AI 模型服务层                             │
├─────────────────────────────────────────────────────────────┤
│  Flux.1-dev + LoRA   │  SAM 分割模型  │  透明底处理      │
│  (生成全身图)          │  (自动分割)    │  (Alpha 通道)     │
└─────────────────────────────────────────────────────────────┘
```

## 1. SAM 分割集成设计

### 1.1 SAM 服务封装

```java
// SAMService.java
@Service
@Slf4j
public class SAMService {

    @Value("${sam.api.url:http://localhost:8080/sam/predict}")
    private String samApiUrl;

    @Value("${sam.api.key:}")
    private String samApiKey;

    /**
     * 调用 SAM 模型进行图像分割
     * @param imageBase64 输入图像 Base64
     * @param points 可选的点提示（用于指定分割区域）
     * @return 分割结果（包含 masks）
     */
    public SAMSegmentationResult segmentImage(String imageBase64, List<Point> points) {
        try {
            // 构建 SAM 请求
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("image", imageBase64);
            requestBody.put("points", points);
            requestBody.put("return_json", true);

            // 发送请求到 SAM 服务
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (samApiKey != null && !samApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + samApiKey);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(samApiUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return parseSegmentationResult(response.getBody());
            } else {
                throw new RuntimeException("SAM API 调用失败: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("SAM 分割失败", e);
            throw new RuntimeException("图像分割失败: " + e.getMessage(), e);
        }
    }

    /**
     * 解析 SAM 响应结果
     */
    private SAMSegmentationResult parseSegmentationResult(String responseBody) {
        // 解析 JSON 响应，提取 masks 和 scores
        // 返回结构化的分割结果
        return new SAMSegmentationResult();
    }
}
```

### 1.2 肢体分割算法

```java
// SkeletonAssetService.java - 增强的 segmentLimbs 方法
private Map<String, String> segmentLimbs(String fullImageBase64, String template) {
    try {
        log.info("开始 SAM 分割: template={}", template);

        // 步骤1: 调用 SAM 进行初步分割
        SAMSegmentationResult samResult = samService.segmentImage(fullImageBase64, null);

        // 步骤2: 根据人体关键点识别肢体区域
        Map<String, BoundingBox> limbBoxes = detectLimbBoundingBoxes(fullImageBase64);

        // 步骤3: 对每个肢体区域进行精确分割
        Map<String, String> parts = new HashMap<>();

        for (Map.Entry<String, BoundingBox> entry : limbBoxes.entrySet()) {
            String partName = entry.getKey();
            BoundingBox box = entry.getValue();

            // 使用 bounding box 作为提示进行精确分割
            List<Point> promptPoints = Arrays.asList(
                new Point(box.getCenterX(), box.getCenterY())
            );

            SAMSegmentationResult partResult = samService.segmentImage(
                fullImageBase64, promptPoints
            );

            // 步骤4: 从原图中裁剪出部件
            String partBase64 = cropPartFromImage(
                fullImageBase64, partResult.getBestMask(), box
            );

            // 步骤5: 添加透明背景
            String transparentPart = addAlphaChannel(partBase64);

            parts.put(partName, transparentPart);
        }

        log.info("SAM 分割完成: parts={}", parts.keySet());
        return parts;

    } catch (Exception e) {
        log.error("肢体分割失败", e);
        throw new RuntimeException("肢体分割失败: " + e.getMessage(), e);
    }
}

/**
 * 检测肢体边界框
 */
private Map<String, BoundingBox> detectLimbBoundingBoxes(String imageBase64) {
    Map<String, BoundingBox> boxes = new HashMap<>();

    // 基于人体比例预设的边界框（可根据模板调整）
    if ("animation".equals(template)) {
        // 动画骨骼比例
        boxes.put("head", new BoundingBox(0.4, 0.1, 0.6, 0.3));
        boxes.put("torso", new BoundingBox(0.3, 0.3, 0.7, 0.6));
        boxes.put("leftArm", new BoundingBox(0.1, 0.35, 0.35, 0.7));
        boxes.put("rightArm", new BoundingBox(0.65, 0.35, 0.9, 0.7));
        boxes.put("leftLeg", new BoundingBox(0.35, 0.6, 0.5, 0.95));
        boxes.put("rightLeg", new BoundingBox(0.5, 0.6, 0.65, 0.95));
    } else {
        // 标准人体比例
        boxes.put("head", new BoundingBox(0.4, 0.1, 0.6, 0.25));
        boxes.put("torso", new BoundingBox(0.3, 0.25, 0.7, 0.55));
        boxes.put("leftArm", new BoundingBox(0.1, 0.3, 0.35, 0.7));
        boxes.put("rightArm", new BoundingBox(0.65, 0.3, 0.9, 0.7));
        boxes.put("leftLeg", new BoundingBox(0.35, 0.55, 0.5, 0.95));
        boxes.put("rightLeg", new BoundingBox(0.5, 0.55, 0.65, 0.95));
    }

    return boxes;
}
```

## 2. 透明底导出设计

### 2.1 Alpha 通道处理

```java
/**
 * 为部件添加透明背景
 */
private String addAlphaChannel(String imageBase64) {
    try {
        // 解码 Base64
        byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));

        // 创建带 Alpha 通道的图像
        BufferedImage transparentImage = new BufferedImage(
            image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB
        );

        Graphics2D g2d = transparentImage.createGraphics();
        g2d.drawImage(image, 0, 0, null);
        g2d.dispose();

        // 处理边缘抗锯齿
        transparentImage = applyAntiAliasing(transparentImage);

        // 转换回 Base64
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(transparentImage, "PNG", baos);
        return Base64.getEncoder().encodeToString(baos.toByteArray());

    } catch (Exception e) {
        log.error("透明底处理失败", e);
        return imageBase64; // 失败时返回原图
    }
}

/**
 * 应用抗锯齿处理
 */
private BufferedImage applyAntiAliasing(BufferedImage image) {
    // 实现边缘平滑算法
    // 可以使用形态学操作或高斯模糊
    return image;
}
```

## 3. 前端结果展示设计

### 3.1 SkeletonResultPanel.vue

```vue
<!-- SkeletonResultPanel.vue -->
<template>
  <div class="skeleton-result-panel">
    <!-- 完整图预览 -->
    <div class="full-image-section">
      <h4>完整人体图</h4>
      <div class="image-preview">
        <img :src="result.fullImageUrl" alt="完整图" />
        <el-button size="small" @click="downloadFullImage">下载完整图</el-button>
      </div>
    </div>

    <!-- 部件网格 -->
    <div class="parts-section">
      <h4>分离的肢体部件</h4>
      <div class="parts-grid">
        <div
          v-for="(partUrl, partName) in result.parts"
          :key="partName"
          class="part-item"
          @mouseover="highlightPart(partName)"
          @mouseleave="clearHighlight"
        >
          <div class="part-preview">
            <img :src="partUrl" :alt="getPartDisplayName(partName)" />
          </div>
          <div class="part-info">
            <span class="part-name">{{ getPartDisplayName(partName) }}</span>
            <el-button size="small" @click="downloadPart(partName, partUrl)">
              下载
            </el-button>
          </div>
        </div>
      </div>

      <!-- 批量下载 -->
      <div class="batch-actions">
        <el-button type="primary" @click="downloadAllParts">
          批量下载所有部件 (ZIP)
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface Props {
  result: {
    fullImageUrl: string
    parts: Record<string, string>
  }
}

const props = defineProps<Props>()

// 部件显示名称映射
const partDisplayNames: Record<string, string> = {
  head: '头部',
  torso: '躯干',
  leftArm: '左臂',
  rightArm: '右臂',
  leftLeg: '左腿',
  rightLeg: '右腿'
}

const getPartDisplayName = (partName: string) => {
  return partDisplayNames[partName] || partName
}

// 下载单个部件
const downloadPart = async (partName: string, partUrl: string) => {
  try {
    const response = await fetch(partUrl)
    const blob = await response.blob()
    saveAs(blob, `skeleton_${partName}.png`)
  } catch (error) {
    console.error('下载部件失败:', error)
  }
}

// 下载完整图
const downloadFullImage = async () => {
  try {
    const response = await fetch(props.result.fullImageUrl)
    const blob = await response.blob()
    saveAs(blob, 'skeleton_full.png')
  } catch (error) {
    console.error('下载完整图失败:', error)
  }
}

// 批量下载所有部件
const downloadAllParts = async () => {
  try {
    const zip = new JSZip()

    // 添加完整图
    const fullImageResponse = await fetch(props.result.fullImageUrl)
    const fullImageBlob = await fullImageResponse.blob()
    zip.file('skeleton_full.png', fullImageBlob)

    // 添加所有部件
    for (const [partName, partUrl] of Object.entries(props.result.parts)) {
      const partResponse = await fetch(partUrl)
      const partBlob = await partResponse.blob()
      zip.file(`skeleton_${partName}.png`, partBlob)
    }

    // 生成并下载 ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'skeleton_assets.zip')

  } catch (error) {
    console.error('批量下载失败:', error)
  }
}

// 高亮显示部件
const highlightPart = (partName: string) => {
  // 实现高亮逻辑
}

const clearHighlight = () => {
  // 清除高亮
}
</script>

<style scoped lang="scss">
.skeleton-result-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

.full-image-section {
  .image-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    img {
      max-width: 300px;
      max-height: 400px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
    }
  }
}

.parts-section {
  .parts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin: 16px 0;
  }

  .part-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fafafa;

    .part-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 120px;
      background: white;
      border-radius: 4px;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .part-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;

      .part-name {
        font-size: 12px;
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .batch-actions {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
}
</style>
```

## 4. 进度轮询设计

### 4.1 前端轮询机制

```typescript
// portraitStore.ts - 增强的进度轮询
const startProgressPolling = (taskId: string) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/ai/portrait/skeleton/status/${taskId}`)
      const status = await response.json()

      // 更新进度
      generationProgress.value = status.progress
      currentStage.value = status.progressMessage

      // 检查是否完成
      if (status.status === 'SUCCESS' || status.status === 'FAILED') {
        clearInterval(pollInterval)
        isGenerating.value = false

        if (status.status === 'SUCCESS') {
          // 获取完整结果
          const resultResponse = await fetch(`/api/ai/portrait/skeleton/result/${taskId}`)
          const result = await resultResponse.json()
          addSkeletonResult(result)
        } else {
          generationError.value = status.errorMessage
        }
      }

    } catch (error) {
      console.error('进度轮询失败:', error)
      clearInterval(pollInterval)
    }
  }, 2000) // 每2秒轮询一次

  return pollInterval
}
```

### 4.2 进度展示组件

```vue
<!-- GenerationProgress.vue -->
<template>
  <div class="generation-progress">
    <div class="progress-header">
      <h4>生成进度</h4>
      <span class="progress-text">{{ progress }}%</span>
    </div>

    <el-progress
      :percentage="progress"
      :status="progressStatus"
      :stroke-width="8"
    />

    <div class="stage-info">
      <p class="current-stage">{{ currentStage }}</p>
      <div class="stage-steps">
        <div
          v-for="(step, index) in stages"
          :key="index"
          class="stage-step"
          :class="{ 'stage-step--completed': progress >= step.progress }"
        >
          <div class="step-indicator">
            <el-icon v-if="progress >= step.progress"><Check /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>

    <el-button
      v-if="canCancel"
      type="danger"
      size="small"
      @click="cancelGeneration"
    >
      取消生成
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortraitStore } from '@/stores/portraitStore'
import { Check } from '@element-plus/icons-vue'

const store = usePortraitStore()

const stages = [
  { label: '生成全身图', progress: 10 },
  { label: '全身图完成', progress: 70 },
  { label: '分割肢体', progress: 75 },
  { label: '透明底处理', progress: 95 },
  { label: '完成', progress: 100 }
]

const progressStatus = computed(() => {
  if (store.generationError) return 'exception'
  if (store.generationProgress === 100) return 'success'
  return 'active'
})

const canCancel = computed(() => {
  return store.isGenerating && store.generationProgress < 100
})

const cancelGeneration = () => {
  // 实现取消生成逻辑
}
</script>
```

## 5. 文件清单

### 新增文件
| 文件路径 | 说明 |
|---------|------|
| `src/main/java/com/example/writemyself/service/SAMService.java` | SAM 模型服务 |
| `src/main/java/com/example/writemyself/model/SAMSegmentationResult.java` | SAM 响应 DTO |
| `src/main/resources/static/ai-portrait-generator/src/components/SkeletonResultPanel.vue` | 结果展示面板 |
| `src/main/resources/static/ai-portrait-generator/src/components/GenerationProgress.vue` | 进度展示组件 |

### 修改文件
| 文件路径 | 说明 |
|---------|------|
| `src/main/java/com/example/writemyself/service/SkeletonAssetService.java` | 集成 SAM 分割 |
| `src/main/resources/static/ai-portrait-generator/src/stores/portraitStore.ts` | 添加进度轮询 |
| `src/main/resources/static/ai-portrait-generator/src/components/CoreParamsPanel.vue` | 集成结果面板 |

