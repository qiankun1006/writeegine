# Design: enhance-skeleton-asset-generator

## 1. 系统架构设计

### 1.1 整体架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端界面      │───▶│   后端API服务    │───▶│   AI模型服务    │
│ - 参数配置      │    │ - 任务管理      │    │ - OpenPose     │
│ - 进度展示      │◀───│ - 流水线控制    │◀───│ - ControlNet   │
│ - 结果展示      │    │ - 结果处理      │    │ - IP-Adapter   │
└─────────────────┘    └──────────────────┘    │ - Flux.1-dev   │
                                              │ - RMBG-2.0     │
                                              │ - SAM 2        │
                                              └─────────────────┘
```

### 1.2 核心组件

#### 1.2.1 OpenPoseTemplateService
负责生成标准T-pose骨骼线图和模板数据

```java
@Service
public class OpenPoseTemplateService {

    /**
     * 生成OpenPose骨骼模板
     */
    public OpenPoseTemplate generateTemplate(String templateType) {
        // 支持18点和25点模板
        List<OpenPosePoint> points = getTemplatePoints(templateType);
        BufferedImage skeletonImage = drawSkeletonImage(points);
        String skeletonImageBase64 = convertToBase64(skeletonImage);

        return OpenPoseTemplate.builder()
            .templateType(templateType)
            .points(points)
            .skeletonImageBase64(skeletonImageBase64)
            .build();
    }

    /**
     * 获取模板关键点坐标
     */
    private List<OpenPosePoint> getTemplatePoints(String templateType) {
        if ("openpose_18".equals(templateType)) {
            return Arrays.asList(
                new OpenPosePoint(0, "Nose", 0.5f, 0.2f),
                new OpenPosePoint(1, "Neck", 0.5f, 0.3f),
                new OpenPosePoint(2, "RShoulder", 0.6f, 0.3f),
                new OpenPosePoint(3, "RElbow", 0.7f, 0.45f),
                new OpenPosePoint(4, "RWrist", 0.8f, 0.6f),
                new OpenPosePoint(5, "LShoulder", 0.4f, 0.3f),
                new OpenPosePoint(6, "LElbow", 0.3f, 0.45f),
                new OpenPosePoint(7, "LWrist", 0.2f, 0.6f),
                new OpenPosePoint(8, "RHip", 0.55f, 0.5f),
                new OpenPosePoint(9, "RKnee", 0.55f, 0.7f),
                new OpenPosePoint(10, "RAnkle", 0.55f, 0.9f),
                new OpenPosePoint(11, "LHip", 0.45f, 0.5f),
                new OpenPosePoint(12, "LKnee", 0.45f, 0.7f),
                new OpenPosePoint(13, "LAnkle", 0.45f, 0.9f),
                new OpenPosePoint(14, "REye", 0.53f, 0.18f),
                new OpenPosePoint(15, "LEye", 0.47f, 0.18f),
                new OpenPosePoint(16, "REar", 0.57f, 0.2f),
                new OpenPosePoint(17, "LEar", 0.43f, 0.2f)
            );
        } else {
            // 25点模板
            return getOpenPose25Points();
        }
    }
}
```

#### 1.2.2 EnhancedSkeletonAssetService
增强的骨骼素材生成服务，实现完整的8步流水线

```java
@Service
@Slf4j
public class EnhancedSkeletonAssetService {

    private final OpenPoseTemplateService openPoseService;
    private final ControlNetService controlNetService;
    private final IPAdapterService ipAdapterService;
    private final FluxGenerationService fluxService;
    private final BackgroundRemovalService bgRemovalService;
    private final EnhancedSAMService samService;
    private final SkeletonBindingService bindingService;

    /**
     * 执行完整的骨骼素材生成流水线
     */
    @Async("skeletonTaskExecutor")
    public void processEnhancedSkeletonGeneration(String taskId,
            SkeletonGenerationRequest request, String userId) {
        try {
            // 步骤1: 生成OpenPose骨骼模板
            updateProgress(taskId, 5, "生成OpenPose骨骼模板...");
            OpenPoseTemplate template = openPoseService.generateTemplate(request.getTemplate());

            // 步骤2: ControlNet姿势约束
            updateProgress(taskId, 10, "应用ControlNet姿势约束...");
            ControlNetCondition controlNetCondition = controlNetService
                .createOpenPoseCondition(template.getSkeletonImageBase64());

            // 步骤3: IP-Adapter特征提取
            updateProgress(taskId, 15, "提取参考图特征...");
            IPAdapterCondition ipAdapterCondition = null;
            if (request.getReferenceImageBase64() != null) {
                ipAdapterCondition = ipAdapterService
                    .extractFeatures(request.getReferenceImageBase64());
            }

            // 步骤4: Flux.1-dev高清人体生成
            updateProgress(taskId, 25, "生成高清人体图...");
            String fullPrompt = buildEnhancedPrompt(request, template);
            String generatedImageBase64 = fluxService.generateImage(
                fullPrompt, request.getNegativePrompt(),
                controlNetCondition, ipAdapterCondition,
                request.getWidth(), request.getHeight()
            );

            // 步骤5: 背景去除
            updateProgress(taskId, 50, "去除背景...");
            String transparentImageBase64 = bgRemovalService
                .removeBackground(generatedImageBase64);

            // 步骤6: SAM 2肢体分割
            updateProgress(taskId, 70, "分割肢体部件...");
            Map<String, String> limbParts = samService.segmentLimbsWithGuidance(
                transparentImageBase64, template.getPoints()
            );

            // 步骤7: 骨骼绑定数据生成
            updateProgress(taskId, 85, "生成骨骼绑定数据...");
            SkeletonBindingData bindingData = bindingService
                .generateBindingData(template, limbParts.keySet());

            // 步骤8: 保存结果
            updateProgress(taskId, 95, "保存生成结果...");
            saveEnhancedResults(taskId, transparentImageBase64, limbParts, bindingData);

            updateProgress(taskId, 100, "生成完成");

        } catch (Exception e) {
            log.error("增强骨骼素材生成失败: taskId={}", taskId, e);
            saveError(taskId, e.getMessage());
        }
    }
}
```

#### 1.2.3 EnhancedSAMService
增强的SAM分割服务，支持关键点引导的精确分割

```java
@Service
public class EnhancedSAMService {

    /**
     * 使用OpenPose关键点引导的肢体分割
     */
    public Map<String, String> segmentLimbsWithGuidance(
            String imageBase64, List<OpenPosePoint> keyPoints) {

        Map<String, String> parts = new HashMap<>();

        // 基于关键点定义肢体区域
        Map<String, LimbRegion> limbRegions = defineLimbRegions(keyPoints);

        for (Map.Entry<String, LimbRegion> entry : limbRegions.entrySet()) {
            String partName = entry.getKey();
            LimbRegion region = entry.getValue();

            // 使用区域中心点作为SAM提示
            Point promptPoint = region.getCenterPoint();

            // 调用SAM进行精确分割
            SAMSegmentationResult result = samService.segmentWithPoint(
                imageBase64, promptPoint, region.getBoundingBox()
            );

            if (result.isSuccess()) {
                // 提取分割结果并添加透明背景
                String partImageBase64 = extractPartWithAlpha(
                    imageBase64, result.getMask(), region
                );
                parts.put(partName, partImageBase64);
            }
        }

        return parts;
    }

    /**
     * 定义基于关键点的肢体区域
     */
    private Map<String, LimbRegion> defineLimbRegions(List<OpenPosePoint> keyPoints) {
        Map<String, LimbRegion> regions = new HashMap<>();

        // 头部区域（基于鼻子和眼睛）
        Point nose = findPoint(keyPoints, "Nose");
        Point neck = findPoint(keyPoints, "Neck");
        if (nose != null && neck != null) {
            regions.put("head", new LimbRegion(
                new Point(nose.x, nose.y - (neck.y - nose.y) * 0.8),
                new Point(nose.x, neck.y),
                0.3, 0.4
            ));
        }

        // 右臂区域
        Point rShoulder = findPoint(keyPoints, "RShoulder");
        Point rElbow = findPoint(keyPoints, "RElbow");
        Point rWrist = findPoint(keyPoints, "RWrist");
        if (rShoulder != null && rElbow != null && rWrist != null) {
            regions.put("rightArm", createLimbRegionFromPoints(
                rShoulder, rElbow, rWrist
            ));
        }

        // 左臂区域
        Point lShoulder = findPoint(keyPoints, "LShoulder");
        Point lElbow = findPoint(keyPoints, "LElbow");
        Point lWrist = findPoint(keyPoints, "LWrist");
        if (lShoulder != null && lElbow != null && lWrist != null) {
            regions.put("leftArm", createLimbRegionFromPoints(
                lShoulder, lElbow, lWrist
            ));
        }

        // 躯干区域
        if (rShoulder != null && lShoulder != null) {
            Point rHip = findPoint(keyPoints, "RHip");
            Point lHip = findPoint(keyPoints, "LHip");
            if (rHip != null && lHip != null) {
                regions.put("torso", new LimbRegion(
                    new Point((lShoulder.x + rShoulder.x) / 2,
                             (lShoulder.y + rShoulder.y) / 2),
                    new Point((lHip.x + rHip.x) / 2,
                             (lHip.y + rHip.y) / 2),
                    0.6, 0.4
                ));
            }
        }

        // 腿部区域
        Point rHip = findPoint(keyPoints, "RHip");
        Point rKnee = findPoint(keyPoints, "RKnee");
        Point rAnkle = findPoint(keyPoints, "RAnkle");
        if (rHip != null && rKnee != null && rAnkle != null) {
            regions.put("rightLeg", createLimbRegionFromPoints(
                rHip, rKnee, rAnkle
            ));
        }

        Point lHip = findPoint(keyPoints, "LHip");
        Point lKnee = findPoint(keyPoints, "LKnee");
        Point lAnkle = findPoint(keyPoints, "LAnkle");
        if (lHip != null && lKnee != null && lAnkle != null) {
            regions.put("leftLeg", createLimbRegionFromPoints(
                lHip, lKnee, lAnkle
            ));
        }

        return regions;
    }
}
```

#### 1.2.4 SkeletonBindingService
骨骼绑定数据生成服务

```java
@Service
public class SkeletonBindingService {

    /**
     * 生成骨骼绑定数据
     */
    public SkeletonBindingData generateBindingData(
            OpenPoseTemplate template, Set<String> partNames) {

        // 创建骨骼树结构
        SkeletonTree skeletonTree = createSkeletonTree(template.getPoints());

        // 创建部件映射
        Map<String, BoneMapping> boneMappings = createBoneMappings(
            template.getPoints(), partNames
        );

        // 生成Spine兼容数据
        SpineSkeletonData spineData = generateSpineData(skeletonTree, boneMappings);

        // 生成DragonBones兼容数据
        DragonBonesSkeletonData dbData = generateDragonBonesData(
            skeletonTree, boneMappings
        );

        return SkeletonBindingData.builder()
            .skeletonTree(skeletonTree)
            .boneMappings(boneMappings)
            .spineData(spineData)
            .dragonBonesData(dbData)
            .build();
    }

    /**
     * 创建骨骼树结构
     */
    private SkeletonTree createSkeletonTree(List<OpenPosePoint> points) {
        SkeletonTree tree = new SkeletonTree();

        // 创建根骨骼（骨盆）
        Bone rootBone = tree.createBone("root", null);
        rootBone.setPosition(0, 0);

        // 创建脊椎骨骼
        Bone spineBone = tree.createBone("spine", rootBone.getId());
        Point neck = findPoint(points, "Neck");
        Point hip = findAveragePoint(points, "LHip", "RHip");
        if (neck != null && hip != null) {
            spineBone.setPosition(0, neck.y - hip.y);
            spineBone.setLength(Math.abs(neck.y - hip.y));
        }

        // 创建头部骨骼
        Bone headBone = tree.createBone("head", spineBone.getId());
        Point nose = findPoint(points, "Nose");
        if (nose != null && neck != null) {
            headBone.setPosition(0, neck.y - nose.y);
            headBone.setLength(Math.abs(neck.y - nose.y));
        }

        // 创建手臂骨骼
        createArmBones(tree, points, spineBone.getId(), "right");
        createArmBones(tree, points, spineBone.getId(), "left");

        // 创建腿部骨骼
        createLegBones(tree, points, rootBone.getId(), "right");
        createLegBones(tree, points, rootBone.getId(), "left");

        return tree;
    }

    /**
     * 生成Spine兼容的骨骼数据
     */
    private SpineSkeletonData generateSpineData(
            SkeletonTree tree, Map<String, BoneMapping> mappings) {

        JSONObject spineJson = new JSONObject();

        // 基本信息
        spineJson.put("skeleton", new JSONObject()
            .put("hash", generateHash())
            .put("spine", "3.8.99")
            .put("width", 1024)
            .put("height", 1024)
        );

        // 骨骼数据
        JSONArray bonesArray = new JSONArray();
        for (Bone bone : tree.getAllBones()) {
            JSONObject boneJson = new JSONObject()
                .put("name", bone.getName())
                .put("parent", bone.getParentId())
                .put("x", bone.getPosition().getX())
                .put("y", bone.getPosition().getY())
                .put("rotation", bone.getRotation())
                .put("length", bone.getLength());
            bonesArray.put(boneJson);
        }
        spineJson.put("bones", bonesArray);

        // 插槽数据
        JSONArray slotsArray = new JSONArray();
        for (BoneMapping mapping : mappings.values()) {
            JSONObject slotJson = new JSONObject()
                .put("name", mapping.getPartName())
                .put("bone", mapping.getBoneName())
                .put("attachment", mapping.getPartName());
            slotsArray.put(slotJson);
        }
        spineJson.put("slots", slotsArray);

        // 皮肤数据
        JSONObject skins = new JSONObject();
        JSONObject defaultSkin = new JSONObject();

        for (BoneMapping mapping : mappings.values()) {
            JSONObject attachment = new JSONObject()
                .put("type", "region")
                .put("x", 0)
                .put("y", 0)
                .put("scaleX", 1)
                .put("scaleY", 1)
                .put("rotation", 0)
                .put("width", 200)
                .put("height", 200);
            defaultSkin.put(mapping.getPartName(), attachment);
        }

        skins.put("default", defaultSkin);
        spineJson.put("skins", skins);

        return new SpineSkeletonData(spineJson.toJSONString());
    }
}
```

## 2. 前端设计

### 2.1 增强的骨骼素材参数面板

```vue
<template>
  <div class="enhanced-skeleton-panel">
    <!-- OpenPose模板选择 -->
    <div class="param-section">
      <label class="section-label">
        OpenPose骨骼模板
        <el-tooltip content="选择骨骼关键点模板：18点适合基础动画，25点适合高级动画">
          <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <el-radio-group v-model="openPoseTemplate" size="default">
        <el-radio-button label="openpose_18">OpenPose 18点</el-radio-button>
        <el-radio-button label="openpose_25">OpenPose 25点</el-radio-button>
      </el-radio-group>

      <!-- 骨骼预览 -->
      <div class="skeleton-preview" v-if="skeletonPreviewUrl">
        <img :src="skeletonPreviewUrl" alt="骨骼预览" />
        <div class="preview-label">T-Pose骨骼预览</div>
      </div>
    </div>

    <!-- 风格LoRA选择 -->
    <div class="param-section">
      <label class="section-label">
        风格LoRA
        <el-tooltip content="选择生成风格，不同LoRA会产生不同的艺术效果">
          <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <div class="lora-grid">
        <div
          v-for="lora in availableLoras"
          :key="lora.id"
          class="lora-item"
          :class="{ active: selectedLora === lora.id }"
          @click="selectLora(lora.id)"
        >
          <img :src="lora.previewUrl" :alt="lora.name" />
          <div class="lora-name">{{ lora.name }}</div>
          <div class="lora-description">{{ lora.description }}</div>
        </div>
      </div>
    </div>

    <!-- 高级选项 -->
    <el-collapse v-model="activeAdvancedOptions">
      <el-collapse-item name="advanced">
        <template #title>
          <span class="collapse-title">高级选项</span>
        </template>

        <!-- ControlNet权重 -->
        <div class="param-section">
          <label class="param-label">
            ControlNet权重: {{ controlNetWeight }}
          </label>
          <el-slider
            v-model="controlNetWeight"
            :min="0.1"
            :max="1.0"
            :step="0.1"
          />
          <div class="param-hint">控制姿势约束的强度，值越高越严格遵循T-pose</div>
        </div>

        <!-- IP-Adapter权重 -->
        <div class="param-section">
          <label class="param-label">
            IP-Adapter权重: {{ ipAdapterWeight }}
          </label>
          <el-slider
            v-model="ipAdapterWeight"
            :min="0.1"
            :max="1.0"
            :step="0.1"
          />
          <div class="param-hint">控制参考图特征的影响程度</div>
        </div>

        <!-- 生成质量 -->
        <div class="param-section">
          <label class="param-label">生成质量</label>
          <el-select v-model="generationQuality" size="default">
            <el-option label="标准 (1024x1024)" value="standard" />
            <el-option label="高清 (2048x2048)" value="high" />
            <el-option label="超高清 (4096x4096)" value="ultra" />
          </el-select>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: EnhancedSkeletonParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: EnhancedSkeletonParams): void
}>()

// 状态
const openPoseTemplate = ref('openpose_18')
const selectedLora = ref('anime_style')
const controlNetWeight = ref(0.8)
const ipAdapterWeight = ref(0.6)
const generationQuality = ref('high')
const activeAdvancedOptions = ref([])
const skeletonPreviewUrl = ref('')

// 可用LoRA列表
const availableLoras = [
  {
    id: 'anime_style',
    name: '日系二次元',
    description: '适合动漫风格角色',
    previewUrl: '/assets/lora-previews/anime.jpg'
  },
  {
    id: 'realistic_style',
    name: '写实风格',
    description: '适合写实风格角色',
    previewUrl: '/assets/lora-previews/realistic.jpg'
  },
  {
    id: 'game_style',
    name: '游戏风格',
    description: '适合游戏角色',
    previewUrl: '/assets/lora-previews/game.jpg'
  }
]

// 监听变化并更新父组件
watch([openPoseTemplate, selectedLora, controlNetWeight, ipAdapterWeight, generationQuality], () => {
  emit('update:modelValue', {
    openPoseTemplate: openPoseTemplate.value,
    selectedLora: selectedLora.value,
    controlNetWeight: controlNetWeight.value,
    ipAdapterWeight: ipAdapterWeight.value,
    generationQuality: generationQuality.value,
    // ... 其他参数
  })
})

// 选择LoRA
const selectLora = (loraId: string) => {
  selectedLora.value = loraId
}

// 加载骨骼预览
const loadSkeletonPreview = async () => {
  try {
    const response = await fetch(`/api/ai/skeleton/template-preview?type=${openPoseTemplate.value}`)
    const data = await response.json()
    skeletonPreviewUrl.value = data.previewUrl
  } catch (error) {
    console.error('加载骨骼预览失败:', error)
  }
}

// 监听模板变化
watch(openPoseTemplate, () => {
  loadSkeletonPreview()
})

onMounted(() => {
  loadSkeletonPreview()
})
</script>
```

### 2.2 增强的进度展示组件

```vue
<template>
  <div class="enhanced-progress-panel">
    <!-- 整体进度 -->
    <div class="overall-progress">
      <div class="progress-header">
        <h4>骨骼素材生成进度</h4>
        <span class="progress-percent">{{ currentProgress }}%</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: currentProgress + '%' }">
          <div class="progress-particles" v-if="isGenerating">
            <div
              v-for="i in 20"
              :key="i"
              class="particle"
              :style="{
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 2 + 's'
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="progress-info">
        <span class="current-stage">{{ currentStage }}</span>
        <span class="estimated-time" v-if="estimatedTime > 0">
          预计还需 {{ formatTime(estimatedTime) }}
        </span>
      </div>
    </div>

    <!-- 详细步骤 -->
    <div class="detailed-steps">
      <div
        v-for="(step, index) in generationSteps"
        :key="index"
        class="step-item"
        :class="getStepClass(step)"
      >
        <div class="step-icon">
          <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
          <el-icon v-else-if="step.status === 'processing'"><Loading /></el-icon>
          <el-icon v-else-if="step.status === 'error'"><Close /></el-icon>
          <span v-else>{{ index + 1 }}</span>
        </div>

        <div class="step-content">
          <div class="step-name">{{ step.name }}</div>
          <div class="step-description">{{ step.description }}</div>
          <div class="step-progress" v-if="step.status === 'processing'">
            {{ step.progress || 0 }}%
          </div>
        </div>

        <div class="step-time" v-if="step.duration">
          {{ formatTime(step.duration) }}
        </div>
      </div>
    </div>

    <!-- 生成日志 -->
    <div class="generation-logs" v-if="logs.length > 0">
      <h5>生成日志</h5>
      <div class="logs-container">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-entry"
          :class="log.level"
        >
          <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Check, Loading, Close } from '@element-plus/icons-vue'

interface GenerationStep {
  name: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  duration?: number
}

interface LogEntry {
  timestamp: number
  level: 'info' | 'warning' | 'error'
  message: string
}

const props = defineProps<{
  taskId: string
}>()

// 状态
const currentProgress = ref(0)
const currentStage = ref('准备生成...')
const estimatedTime = ref(0)
const isGenerating = ref(false)
const logs = ref<LogEntry[]>([])

// 生成步骤定义
const generationSteps = ref<GenerationStep[]>([
  {
    name: '生成OpenPose骨骼模板',
    description: '创建标准T-pose骨骼线图和关键点数据',
    status: 'pending'
  },
  {
    name: 'ControlNet姿势约束',
    description: '加载骨骼线图作为生成约束',
    status: 'pending'
  },
  {
    name: 'IP-Adapter特征提取',
    description: '提取参考图的人物特征',
    status: 'pending'
  },
  {
    name: 'Flux.1-dev高清生成',
    description: '生成2048x2048分辨率的完整人体',
    status: 'pending'
  },
  {
    name: '背景去除',
    description: '使用RMBG-2.0去除背景，生成透明PNG',
    status: 'pending'
  },
  {
    name: 'SAM 2肢体分割',
    description: '自动分割各肢体部件',
    status: 'pending'
  },
  {
    name: '骨骼绑定数据生成',
    description: '创建骨骼树和部件映射关系',
    status: 'pending'
  },
  {
    name: '结果打包',
    description: '整理生成结果并保存',
    status: 'pending'
  }
])

// 轮询进度
let pollInterval: number | null = null

const startPolling = () => {
  pollInterval = window.setInterval(async () => {
    try {
      const response = await fetch(`/api/ai/portrait/skeleton/status/${props.taskId}`)
      const data = await response.json()

      // 更新进度
      currentProgress.value = data.progress || 0
      currentStage.value = data.progressMessage || '处理中...'

      // 更新步骤状态
      updateStepStatus(data.detailedProgress)

      // 添加日志
      if (data.newLogs && data.newLogs.length > 0) {
        data.newLogs.forEach((log: LogEntry) => {
          logs.value.push(log)
        })
      }

      // 检查是否完成
      if (data.status === 'SUCCESS' || data.status === 'FAILED') {
        isGenerating.value = false
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }

    } catch (error) {
      console.error('轮询进度失败:', error)
    }
  }, 1000)
}

// 更新步骤状态
const updateStepStatus = (detailedProgress: any) => {
  if (!detailedProgress) return

  detailedProgress.forEach((stepProgress: any, index: number) => {
    if (index < generationSteps.value.length) {
      const step = generationSteps.value[index]
      step.status = stepProgress.status
      step.progress = stepProgress.progress
      step.duration = stepProgress.duration
    }
  })
}

// 获取步骤样式类
const getStepClass = (step: GenerationStep) => {
  return {
    'step-pending': step.status === 'pending',
    'step-processing': step.status === 'processing',
    'step-completed': step.status === 'completed',
    'step-error': step.status === 'error'
  }
}

// 格式化时间
const formatTime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

// 格式化日志时间
const formatLogTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

onMounted(() => {
  isGenerating.value = true
  startPolling()
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>
```

## 3. 数据模型设计

### 3.1 OpenPose模板数据

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenPoseTemplate {
    private String templateType;           // openpose_18, openpose_25
    private List<OpenPosePoint> points;    // 关键点列表
    private String skeletonImageBase64;    // 骨骼线图Base64
    private Map<String, Object> metadata;  // 元数据
}

@Data
public class OpenPosePoint {
    private int id;           // 点ID
    private String name;      // 点名称
    private float x;          // X坐标 (0-1)
    private float y;          // Y坐标 (0-1)
    private float confidence; // 置信度

    public OpenPosePoint(int id, String name, float x, float y) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.confidence = 1.0f;
    }
}
```

### 3.2 骨骼绑定数据

```java
@Data
@Builder
public class SkeletonBindingData {
    private SkeletonTree skeletonTree;              // 骨骼树结构
    private Map<String, BoneMapping> boneMappings;  // 部件映射
    private SpineSkeletonData spineData;            // Spine兼容数据
    private DragonBonesSkeletonData dragonBonesData; // DragonBones兼容数据
    private String bindingJson;                      // 通用JSON格式
}

@Data
public class BoneMapping {
    private String partName;     // 部件名称
    private String boneName;     // 对应骨骼名称
    private Point offset;        // 偏移量
    private float rotation;      // 旋转角度
    private Scale scale;         // 缩放比例
}
```

## 4. API接口设计

### 4.1 增强的生成接口

```
POST /api/ai/portrait/skeleton/enhanced-generate

Request:
{
  "prompt": "日系二次元少女角色立绘",
  "negativePrompt": "低质量, 变形",
  "style": "anime",
  "openPoseTemplate": "openpose_18",
  "selectedLora": "anime_style",
  "controlNetWeight": 0.8,
  "ipAdapterWeight": 0.6,
  "generationQuality": "high",
  "referenceImageBase64": "...",
  "width": 2048,
  "height": 2048
}

Response (202 Accepted):
{
  "taskId": "enhanced_skeleton_1712345678900",
  "status": "PENDING",
  "estimatedTime": 300
}
```

### 4.2 详细进度查询接口

```
GET /api/ai/portrait/skeleton/enhanced-status/{taskId}

Response (200 OK):
{
  "taskId": "enhanced_skeleton_1712345678900",
  "status": "PROCESSING",
  "progress": 65,
  "progressMessage": "正在分割肢体部件...",
  "detailedProgress": [
    {
      "step": "openpose_template",
      "name": "生成OpenPose骨骼模板",
      "status": "completed",
      "progress": 100,
      "duration": 2
    },
    {
      "step": "controlnet_constraint",
      "name": "ControlNet姿势约束",
      "status": "completed",
      "progress": 100,
      "duration": 3
    },
    {
      "step": "sam_segmentation",
      "name": "SAM 2肢体分割",
      "status": "processing",
      "progress": 75,
      "duration": 45
    }
  ],
  "newLogs": [
    {
      "timestamp": 1712345678901,
      "level": "info",
      "message": "开始SAM分割处理"
    }
  ]
}
```

### 4.3 骨骼数据查询接口

```
GET /api/ai/portrait/skeleton/binding-data/{taskId}

Response (200 OK):
{
  "taskId": "enhanced_skeleton_1712345678900",
  "skeletonTree": {
    "bones": [
      {
        "name": "root",
        "parent": null,
        "x": 0,
        "y": 0
      },
      {
        "name": "spine",
        "parent": "root",
        "x": 0,
        "y": -100
      }
    ]
  },
  "boneMappings": {
    "head": {
      "boneName": "head",
      "offset": { "x": 0, "y": 0 }
    }
  },
  "spineData": "{...}", // Spine JSON格式
  "dragonBonesData": "{...}" // DragonBones JSON格式
}

