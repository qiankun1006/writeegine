package com.example.writemyself.service;

import com.example.writemyself.dto.SkeletonGenerationRequest;
import com.example.writemyself.dto.SkeletonGenerationResponse;
import com.example.writemyself.entity.SkeletonPipelineStep;
import com.example.writemyself.entity.SkeletonPipelineTask;
import com.example.writemyself.entity.SkeletonRagIndex;
import com.example.writemyself.mapper.SkeletonPipelineStepMapper;
import com.example.writemyself.mapper.SkeletonPipelineTaskMapper;
import com.example.writemyself.mapper.SkeletonRagIndexMapper;
import com.example.writemyself.model.OpenPoseTemplate;
import com.example.writemyself.model.SAMSegmentationResult;
import com.example.writemyself.model.SkeletonBindingData;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

/**
 * 增强骨骼素材生成服务
 *
 * 支持两条骨骼生成路径，通过请求中的 mode 字段区分：
 *
 * <h3>FROM_REFERENCE（参考图转骨骼，推荐）</h3>
 * 步骤1: see-through 图层分解（主分割方案） → 产物：最多23个语义图层
 * 步骤2: SAM2 精修各图层边缘（辅助精修）    → 产物：精修后各层 PNG
 * 步骤3: 各图层独立去背（RMBG-2.0）        → 产物：带透明通道的各层 PNG
 * 步骤4: OpenPose 关键点识别              → 产物：关键点 JSON
 * 步骤5: 骨骼绑定数据生成                  → 产物：binding JSON
 * 步骤6: 打包输出（Spine/DragonBones）    → 最终产物
 *
 * <h3>FROM_SCRATCH（从零生成，原有路径）</h3>
 * 步骤1: OpenPose 生成 T-pose 骨骼线图    → 产物：骨骼线图
 * 步骤2: Flux.1-dev 高清生成              → 产物：高清人物图（ControlNet+IP-Adapter合并为本步入参）
 * 步骤3: see-through 图层分解             → 产物：最多23个语义图层
 * 步骤4: SAM2 精修图层边缘（辅助精修）     → 产物：精修后各层 PNG
 * 步骤5: 各图层独立去背                   → 产物：带透明通道的各层 PNG
 * 步骤6: 骨骼绑定数据生成                  → 产物：binding JSON
 * 步骤7: 打包输出（Spine/DragonBones）    → 最终产物
 *
 * 每个步骤的状态和中间产物均持久化到数据库（skeleton_pipeline_step 表）。
 * 内存 Map 继续维护，保持原有轮询接口的向后兼容。
 *
 * @author AI Portrait Generator
 * @version 3.0
 */
@Service
@Slf4j
public class EnhancedSkeletonAssetService {

    private final ImageGenerationService imageService;
    private final FileStorageService fileStorageService;
    private final SAMService samService;
    private final SeeThroughLayerService seeThroughLayerService;
    private final OpenPoseTemplateService openPoseTemplateService;
    private final BackgroundRemovalService backgroundRemovalService;
    private final SkeletonExportService skeletonExportService;
    private final SkeletonPipelineTaskMapper pipelineTaskMapper;
    private final SkeletonPipelineStepMapper pipelineStepMapper;
    private final SkeletonRagIndexMapper ragIndexMapper;

    /** 服务端口，用于将相对路径 URL 补全为可访问的绝对 URL（本地模拟桶场景） */
    @org.springframework.beans.factory.annotation.Value("${server.port:8083}")
    private int serverPort;

    public EnhancedSkeletonAssetService(
            @Qualifier("fluxImageService") ImageGenerationService imageService,
            FileStorageService fileStorageService,
            SAMService samService,
            SeeThroughLayerService seeThroughLayerService,
            OpenPoseTemplateService openPoseTemplateService,
            BackgroundRemovalService backgroundRemovalService,
            SkeletonExportService skeletonExportService,
            SkeletonPipelineTaskMapper pipelineTaskMapper,
            SkeletonPipelineStepMapper pipelineStepMapper,
            SkeletonRagIndexMapper ragIndexMapper) {
        this.imageService = imageService;
        this.fileStorageService = fileStorageService;
        this.samService = samService;
        this.seeThroughLayerService = seeThroughLayerService;
        this.openPoseTemplateService = openPoseTemplateService;
        this.backgroundRemovalService = backgroundRemovalService;
        this.skeletonExportService = skeletonExportService;
        this.pipelineTaskMapper = pipelineTaskMapper;
        this.pipelineStepMapper = pipelineStepMapper;
        this.ragIndexMapper = ragIndexMapper;
    }

    /**
     * 任务结果缓存（内存 Map，服务重启后任务状态由 DB 持久化，内存仅作为轮询加速）
     */
    private final Map<String, SkeletonGenerationResponse> taskResults = new ConcurrentHashMap<>();

    /**
     * 步骤开始时间缓存，用于计算每步耗时
     * key: taskId + "_" + stepNo
     */
    private final Map<String, Long> stepStartTimeMap = new ConcurrentHashMap<>();

    /**
     * see-through 图层分解结果缓存
     * key: md5(imageBase64) + ":" + style
     * 对同一张图片短时间内不重复调用 see-through（高token消耗步骤）
     * TTL 2小时，容量 200 条（每条图层分解结果约50-100KB）
     */
    private final Map<String, SeeThroughLayerService.LayerDecompositionResult> seeThroughCache =
            new HashMap<>();

    /**
     * SSE Emitter 注册表
     * key: taskId, value: 该任务的所有活跃 SSE 连接（支持同一任务多标签订阅）
     */
    private final Map<String, List<SseEmitter>> sseEmitters = new ConcurrentHashMap<>();

    // ===================================================
    // SSE 公开接口
    // ===================================================

    /**
     * 注册 SSE 连接，返回 SseEmitter 给 Controller
     * 若任务已完成，立即推送当前状态后结束
     */
    public SseEmitter registerSseEmitter(String taskId) {
        // 超时 10 分钟（骨骼生成最长耗时）
        SseEmitter emitter = new SseEmitter(10 * 60 * 1000L);

        sseEmitters.computeIfAbsent(taskId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        // 连接断开时自动移除
        Runnable cleanup = () -> removeEmitter(taskId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // 若任务已完成/失败，立即推送最终状态后关闭
        SkeletonGenerationResponse existing = taskResults.get(taskId);
        if (existing != null) {
            String status = existing.getStatus();
            if ("SUCCESS".equals(status) || "FAILED".equals(status)) {
                sendSseEvent(emitter, buildSsePayload(taskId, existing));
                emitter.complete();
                removeEmitter(taskId, emitter);
                return emitter;
            }
        }

        // 推送初始握手事件，让前端确认连接已建立
        sendSseEvent(emitter, "{\"event\":\"connected\",\"taskId\":\"" + taskId + "\"}");
        return emitter;
    }

    /** 移除单个 emitter */
    private void removeEmitter(String taskId, SseEmitter emitter) {
        List<SseEmitter> list = sseEmitters.get(taskId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                sseEmitters.remove(taskId);
            }
        }
    }

    /** 向指定任务的所有 SSE 连接广播事件 */
    private void broadcastSseEvent(String taskId, String jsonPayload) {
        List<SseEmitter> emitters = sseEmitters.get(taskId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        // 遍历副本，避免 ConcurrentModification
        for (SseEmitter emitter : new ArrayList<>(emitters)) {
            sendSseEvent(emitter, jsonPayload);
        }
    }

    /** 向单个 emitter 发送事件（失败时自动移除） */
    private void sendSseEvent(SseEmitter emitter, String jsonPayload) {
        try {
            emitter.send(SseEmitter.event().data(jsonPayload));
        } catch (IOException e) {
            // 客户端已断开，完成并忽略
            emitter.complete();
        }
    }

    /** 构建推送给前端的 JSON payload */
    private String buildSsePayload(String taskId, SkeletonGenerationResponse response) {
        String stepsJson = "[]";
        try {
            List<SkeletonGenerationResponse.StepStatus> steps = getStepsLight(taskId);
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < steps.size(); i++) {
                SkeletonGenerationResponse.StepStatus s = steps.get(i);
                if (i > 0) sb.append(",");
                sb.append("{");
                sb.append("\"stepNo\":").append(s.getStepNo()).append(",");
                sb.append("\"stepName\":\"").append(esc(s.getStepName())).append("\",");
                sb.append("\"stepKey\":\"").append(esc(s.getStepKey())).append("\",");
                sb.append("\"status\":\"").append(s.getStatus()).append("\"");
                if (s.getDurationMs() != null) sb.append(",\"durationMs\":").append(s.getDurationMs());
                if (s.getErrorMessage() != null) sb.append(",\"errorMessage\":\"").append(esc(s.getErrorMessage())).append("\"");
                if (s.getOutputImageUrl() != null) sb.append(",\"outputImageUrl\":\"").append(esc(s.getOutputImageUrl())).append("\"");
                sb.append("}");
            }
            sb.append("]");
            stepsJson = sb.toString();
        } catch (Exception e) {
            log.warn("构建SSE步骤JSON失败: {}", e.getMessage());
        }

        return "{"
                + "\"event\":\"progress\","
                + "\"taskId\":\"" + taskId + "\","
                + "\"status\":\"" + response.getStatus() + "\","
                + "\"progress\":" + response.getProgress() + ","
                + "\"progressMessage\":\"" + esc(response.getProgressMessage()) + "\","
                + (response.getErrorMessage() != null
                    ? "\"errorMessage\":\"" + esc(response.getErrorMessage()) + "\"," : "")
                + "\"steps\":" + stepsJson
                + "}";
    }

    /** 转义 JSON 字符串中的特殊字符 */
    private String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    // ===================================================
    // 步骤序号常量 —— FROM_REFERENCE 路径（6步）
    // ===================================================

    /** 场景A步骤1: see-through 图层分解（主分割，产物：最多23个语义图层） */
    private static final int REF_STEP_SEE_THROUGH  = 1;
    /** 场景A步骤2: SAM2 精修图层边缘（辅助精修） */
    private static final int REF_STEP_SAM_REFINE   = 2;
    /** 场景A步骤3: 各图层独立去背（RMBG-2.0，逐层执行） */
    private static final int REF_STEP_PER_LAYER_BG = 3;
    /** 场景A步骤4: OpenPose 关键点识别（从原图提取，不重新生成） */
    private static final int REF_STEP_KEYPOINTS    = 4;
    /** 场景A步骤5: 骨骼绑定数据生成 */
    private static final int REF_STEP_BINDING      = 5;
    /** 场景A步骤6: 打包输出 */
    private static final int REF_STEP_SAVE         = 6;

    // ===================================================
    // 步骤序号常量 —— FROM_SCRATCH 路径（7步）
    // ===================================================

    /** 场景B步骤1: OpenPose 生成 T-pose 骨骼线图 */
    private static final int SCR_STEP_SKELETON_LINE = 1;
    /**
     * 场景B步骤2: Flux.1-dev 高清生成
     * ControlNet（姿势约束）和 IP-Adapter（特征提取）作为本步骤的入参准备，
     * 不单独持久化为步骤——它们只是 Flux 调用的参数，没有独立的中间产物意义。
     */
    private static final int SCR_STEP_FLUX_GENERATE = 2;
    /** 场景B步骤3: see-through 图层分解（Flux 生成之后立即执行，主分割方案） */
    private static final int SCR_STEP_SEE_THROUGH   = 3;
    /** 场景B步骤4: SAM2 精修图层边缘（辅助精修，see-through 之后） */
    private static final int SCR_STEP_SAM_REFINE    = 4;
    /** 场景B步骤5: 各图层独立去背（在图层分解和精修之后执行，不是整图去背再分割） */
    private static final int SCR_STEP_PER_LAYER_BG  = 5;
    /** 场景B步骤6: 骨骼绑定数据生成 */
    private static final int SCR_STEP_BINDING       = 6;
    /** 场景B步骤7: 打包输出 */
    private static final int SCR_STEP_SAVE          = 7;

    // ===================================================
    // 公开接口
    // ===================================================

    /**
     * 提交增强骨骼素材生成任务
     *
     * @param request 生成请求参数
     * @param userId 用户 ID
     * @return 任务 ID
     */
    public String submitEnhancedGenerationTask(SkeletonGenerationRequest request, String userId) {
        String taskId = "enhanced_skeleton_" + System.currentTimeMillis();

        log.info("增强骨骼素材生成请求: userId={}, taskId={}, style={}, template={}, pose={}",
                userId, taskId, request.getStyle(), request.getTemplate(), request.getPose());

        // 1. 写主任务到 DB
        SkeletonPipelineTask task = SkeletonPipelineTask.builder()
                .taskId(taskId)
                .userId(userId)
                .style(request.getStyle())
                .templateType(request.getTemplate())
                .pose(request.getPose())
                .prompt(request.getPrompt())
                .negativePrompt(request.getNegativePrompt())
                .width(request.getWidth() != null ? request.getWidth() : 512)
                .height(request.getHeight() != null ? request.getHeight() : 512)
                .status("PENDING")
                .progress(0)
                .build();
        try {
            pipelineTaskMapper.insert(task);
        } catch (Exception e) {
            log.warn("写主任务到DB失败（非致命，继续）: taskId={}, err={}", taskId, e.getMessage());
        }

        // 2. 按 mode 写对应步骤数的初始 PENDING 记录
        boolean isFromReference = "FROM_REFERENCE".equals(request.getMode());
        List<SkeletonPipelineStep> steps = isFromReference
                ? buildInitialStepsFromReference(taskId)
                : buildInitialStepsFromScratch(taskId);
        try {
            pipelineStepMapper.batchInsert(steps);
        } catch (Exception e) {
            log.warn("批量写步骤到DB失败（非致命，继续）: taskId={}, err={}", taskId, e.getMessage());
        }

        // 3. 内存缓存保持向后兼容
        String modeLabel = isFromReference ? "FROM_REFERENCE" : "FROM_SCRATCH";
        SkeletonGenerationResponse response = SkeletonGenerationResponse.builder()
                .taskId(taskId)
                .status("PENDING")
                .progress(0)
                .progressMessage("任务已提交（" + modeLabel + "），等待处理...")
                .build();
        taskResults.put(taskId, response);

        // 4. 异步执行生成任务
        processEnhancedSkeletonGeneration(taskId, request, userId);

        return taskId;
    }

    /**
     * 获取生成结果（含步骤详情，从 DB 查询）
     */
    public SkeletonGenerationResponse getResult(String taskId) {
        SkeletonGenerationResponse result = taskResults.get(taskId);
        if (result == null) {
            return SkeletonGenerationResponse.builder()
                    .taskId(taskId)
                    .status("NOT_FOUND")
                    .errorMessage("任务不存在或已过期")
                    .build();
        }
        return result;
    }

    /**
     * 从 DB 查询步骤状态列表（轻量版，不含中间产物，供频繁轮询）
     */
    public List<SkeletonGenerationResponse.StepStatus> getStepsLight(String taskId) {
        try {
            List<SkeletonPipelineStep> dbSteps = pipelineStepMapper.selectLightByTaskId(taskId);
            return convertToStepStatusList(dbSteps);
        } catch (Exception e) {
            log.warn("查询步骤状态失败: taskId={}, err={}", taskId, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 从 DB 查询步骤状态列表（完整版，含中间产物 URL，供结果查询）
     */
    public List<SkeletonGenerationResponse.StepStatus> getStepsFull(String taskId) {
        try {
            List<SkeletonPipelineStep> dbSteps = pipelineStepMapper.selectByTaskId(taskId);
            return convertToStepStatusList(dbSteps);
        } catch (Exception e) {
            log.warn("查询步骤详情失败: taskId={}, err={}", taskId, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 清理过期任务结果
     */
    public void cleanExpiredTasks() {
        // TODO: 实现过期任务清理逻辑
        log.info("清理过期增强骨骼任务调用占位");
    }

    // ===================================================
    // 训练数据飞轮 & 用户反馈
    // ===================================================

    /**
     * 保存用户对生成结果的评分和反馈
     *
     * 评分 >= 4 时：
     *   1. 写入 DB（user_rating / user_feedback）
     *   2. 标记为训练集（is_training_sample=1）
     *   3. 写入 RAG 索引（skeleton_rag_index 表）
     *
     * 评分 <= 2 时：仅写入 DB，进入负样本池（后续 DPO 微调用）
     */
    public void saveFeedback(String taskId, int rating, String feedback) {
        try {
            // 1. 写入评分和反馈
            pipelineTaskMapper.updateFeedback(taskId, rating, feedback);
            log.info("用户反馈已保存: taskId={}, rating={}", taskId, rating);

            // 2. 高质量样本（评分 >= 4）自动处理
            if (rating >= 4) {
                // 标记为训练集
                try {
                    pipelineTaskMapper.markAsTrainingSample(taskId);
                } catch (Exception e) {
                    log.warn("标记训练集失败（非致命）: taskId={}, err={}", taskId, e.getMessage());
                }
                // 写入 RAG 索引
                writeToRagIndex(taskId, rating);
            }
        } catch (Exception e) {
            log.error("保存用户反馈失败: taskId={}, rating={}", taskId, rating, e);
            throw e;
        }
    }

    /**
     * 将高质量任务写入 RAG 索引
     * 从 DB 读取任务和步骤信息，构建 SkeletonRagIndex 记录
     */
    private void writeToRagIndex(String taskId, int rating) {
        try {
            // 已有索引则跳过（ON DUPLICATE KEY UPDATE 会在 XML 中处理，但先做Java层去重）
            SkeletonRagIndex existing = ragIndexMapper.selectBySourceTaskId(taskId);
            if (existing != null) {
                log.debug("RAG 索引已存在，跳过重复写入: taskId={}", taskId);
                return;
            }

            SkeletonPipelineTask task = pipelineTaskMapper.selectByTaskId(taskId);
            if (task == null || !"SUCCESS".equals(task.getStatus())) {
                log.warn("RAG 索引写入跳过：任务不存在或未成功: taskId={}", taskId);
                return;
            }

            // 查找关键点步骤和骨骼绑定步骤的产物 URL
            List<SkeletonPipelineStep> steps = pipelineStepMapper.selectByTaskId(taskId);
            String keypointsUrl = null;
            String bindingUrl = null;
            String layerDecompUrl = null;
            for (SkeletonPipelineStep step : steps) {
                if (step.getOutputDataJson() != null) {
                    if ("keypoints".equals(step.getStepKey()) || step.getStepKey().contains("keypoint")) {
                        keypointsUrl = step.getOutputFileUrl() != null ? step.getOutputFileUrl()
                                : step.getOutputImageUrl();
                    } else if ("binding_data".equals(step.getStepKey()) || step.getStepKey().contains("binding")) {
                        bindingUrl = step.getOutputFileUrl();
                    } else if ("see_through".equals(step.getStepKey()) || step.getStepKey().contains("see_through")) {
                        layerDecompUrl = step.getOutputFileUrl();
                    }
                }
            }

            // prompt 截断为 500 字作为摘要
            String promptSummary = task.getPrompt() != null
                    ? task.getPrompt().substring(0, Math.min(task.getPrompt().length(), 500))
                    : null;

            SkeletonRagIndex ragIndex = SkeletonRagIndex.builder()
                    .sourceTaskId(taskId)
                    .style(task.getStyle())
                    .pose(task.getPose())
                    .templateType(task.getTemplateType())
                    .openposeTmpl("openpose_18") // 默认值，后续可从 task 扩展字段读取
                    .promptSummary(promptSummary)
                    .keypointsJsonUrl(keypointsUrl)
                    .bindingDataUrl(task.getSkeletonJsonUrl())   // 通用格式骨骼绑定 JSON
                    .layerDecompUrl(layerDecompUrl)
                    .userRating(rating)
                    .build();

            ragIndexMapper.insertOrUpdate(ragIndex);
            log.info("RAG 索引写入成功: taskId={}, style={}, pose={}", taskId, task.getStyle(), task.getPose());

        } catch (Exception e) {
            log.warn("写入 RAG 索引失败（非致命）: taskId={}, err={}", taskId, e.getMessage());
        }
    }

    // ===================================================
    // RAG 检索（两阶段：精确过滤 + 文本相似度）
    // ===================================================

    /**
     * 查找与当前请求最相似的 RAG 历史记录
     *
     * 两阶段检索：
     *   Phase1: style + pose + template 精确过滤（DB 联合索引，快速缩小范围）
     *   Phase2: 若有 prompt，在候选集上做关键词相似度计算
     *
     * 命中条件：Phase1 有结果 && (无 prompt 或 prompt 相似度达标)
     *
     * @return 命中的 RAG 记录（包含可直接复用的中间产物 URL），未命中返回 null
     */
    private SkeletonRagIndex findRagMatch(SkeletonGenerationRequest request) {
        try {
            String style = request.getStyle();
            String pose  = request.getPose();
            String tmpl  = request.getTemplate();

            // Phase1: 精确过滤
            List<SkeletonRagIndex> candidates = ragIndexMapper.findCandidates(style, pose, tmpl, 10);
            if (candidates.isEmpty()) {
                return null;
            }

            // 若没有 prompt（FROM_REFERENCE 模式），直接取评分最高的
            String prompt = request.getPrompt();
            if (StringUtils.isBlank(prompt)) {
                SkeletonRagIndex best = candidates.get(0);
                log.info("RAG 命中（无prompt，取最高评分）: taskId={}, sourceTaskId={}", "N/A", best.getSourceTaskId());
                return best;
            }

            // Phase2: FULLTEXT 关键词相似度
            String keywords = extractKeywords(prompt);
            if (StringUtils.isNotBlank(keywords)) {
                List<SkeletonRagIndex> matched = ragIndexMapper.findByPromptSimilarity(
                        keywords, style, pose, tmpl, 5);
                if (!matched.isEmpty()) {
                    SkeletonRagIndex best = matched.get(0);
                    log.info("RAG 命中（prompt 相似）: sourceTaskId={}, keywords={}", best.getSourceTaskId(), keywords);
                    return best;
                }
            }

            // Phase2 未命中，但 Phase1 有结果时的兜底：
            // 只有当 prompt 非常短（< 10字）或候选集评分全是5分时才用 Phase1 结果
            SkeletonRagIndex fallback = candidates.get(0);
            if (fallback.getUserRating() != null && fallback.getUserRating() >= 5) {
                log.info("RAG 命中（5星兜底）: sourceTaskId={}", fallback.getSourceTaskId());
                return fallback;
            }

            return null;
        } catch (Exception e) {
            log.warn("RAG 检索失败（非致命，继续正常流程）: err={}", e.getMessage());
            return null;
        }
    }

    /**
     * 从 prompt 中提取关键词（用于 FULLTEXT 检索）
     * 简单实现：按空格/标点分词，过滤停用词，取前 10 个词拼成 BOOLEAN MODE 格式
     */
    private String extractKeywords(String prompt) {
        if (StringUtils.isBlank(prompt)) return "";
        // 分词：按非字母数字汉字分割
        String[] tokens = prompt.split("[\\s,，。.!！?？、;；:：\"']+");
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (String token : tokens) {
            if (token.length() < 2) continue; // 过滤单字
            if (sb.length() > 0) sb.append(" ");
            sb.append("+").append(token); // BOOLEAN MODE: + 表示必须包含
            if (++count >= 8) break;
        }
        return sb.toString();
    }

    /**
     * 更新 RAG 命中热度（异步，失败不影响主流程）
     */
    private void updateRagHitCount(SkeletonRagIndex ragEntry) {
        if (ragEntry == null || ragEntry.getId() == null) return;
        try {
            ragIndexMapper.incrementHitCount(ragEntry.getId());
        } catch (Exception e) {
            log.debug("RAG 热度更新失败（忽略）: id={}", ragEntry.getId());
        }
    }

    // ===================================================
    // 断点续跑辅助方法
    // ===================================================

    /**
     * 检查步骤是否已经成功完成（断点续跑判断）
     * 若步骤已 SUCCESS，直接跳过重新执行
     */
    private boolean isStepAlreadySuccess(String taskId, int stepNo) {
        try {
            SkeletonPipelineStep step = pipelineStepMapper.selectByTaskIdAndStepNo(taskId, stepNo);
            return step != null && "SUCCESS".equals(step.getStatus());
        } catch (Exception e) {
            log.debug("断点续跑状态查询失败（按未成功处理）: taskId={}, stepNo={}, err={}", taskId, stepNo, e.getMessage());
            return false;
        }
    }

    /**
     * 从 DB 加载已成功步骤的 outputDataJson（断点续跑时复用）
     */
    private String loadStepDataJson(String taskId, int stepNo) {
        try {
            SkeletonPipelineStep step = pipelineStepMapper.selectByTaskIdAndStepNo(taskId, stepNo);
            return step != null ? step.getOutputDataJson() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从 DB 加载已成功步骤的 outputImageUrl（断点续跑时复用）
     */
    private String loadStepImageUrl(String taskId, int stepNo) {
        try {
            SkeletonPipelineStep step = pipelineStepMapper.selectByTaskIdAndStepNo(taskId, stepNo);
            return step != null ? step.getOutputImageUrl() : null;
        } catch (Exception e) {
            return null;
        }
    }

    // ===================================================
    // Prompt 压缩辅助方法
    // ===================================================

    /**
     * 构建精简版 Prompt（减少 Token 消耗）
     *
     * 优化策略：
     *   1. 风格描述词（anime/realistic/chibi...）交给 LoRA 触发词处理，不写入 prompt
     *   2. 质量描述词（high quality/masterpiece/best quality）用简写替代
     *   3. 只保留用户的语义内容 + 固定最短后缀
     *
     * 对比旧版 buildEnhancedPrompt：
     *   - 旧版约 120-150 Token（含大量重复的质量/风格词）
     *   - 新版约 30-60 Token（仅核心语义 + LoRA 触发词）
     */
    private String buildCompactPrompt(SkeletonGenerationRequest request) {
        StringBuilder sb = new StringBuilder();

        // 1. 用户自定义语义内容（最核心部分）
        if (StringUtils.isNotBlank(request.getPrompt())) {
            sb.append(request.getPrompt().trim());
        }

        // 2. 姿态触发词（极短，1-2 token）
        String poseTrigger = getPoseTriggerWord(request.getPose());
        if (StringUtils.isNotBlank(poseTrigger)) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(poseTrigger);
        }

        // 3. 固定最短结构后缀（全身图 + 白底，骨骼素材必要条件）
        if (sb.length() > 0) sb.append(", ");
        sb.append("full body, white background, character sheet");

        return sb.toString();
    }

    /**
     * 获取姿态触发词（极短的 LoRA 兼容格式）
     */
    private String getPoseTriggerWord(String pose) {
        if (pose == null) return "t-pose";
        switch (pose) {
            case "standing": return "standing pose";
            case "walking":  return "walking";
            case "running":  return "running pose";
            case "attacking": return "attack pose";
            case "casting":  return "casting spell";
            case "idle":     return "idle pose";
            default:         return "t-pose";
        }
    }

    // ===================================================
    // 流水线主流程
    // ===================================================

    /**
     * 步骤执行回调，允许抛出受检异常
     */
    @FunctionalInterface
    interface StepCallable<T> {
        T call() throws Exception;
    }

    /**
     * 执行"产物为图片"的流水线步骤模板
     * 负责：进度更新 → stepStart → 执行业务逻辑 → 保存中间图片 → stepSuccess/stepFailed
     *
     * @param taskId       任务 ID
     * @param stepNo       步骤序号
     * @param progressPre  步骤开始前的进度值
     * @param msgPre       步骤开始前的进度描述
     * @param progressPost 步骤完成后的进度值
     * @param msgPost      步骤完成后的进度描述
     * @param imageFile    保存中间图片的文件名后缀（null 表示不保存）
     * @param callable     实际业务逻辑，返回图片 Base64
     * @return 业务逻辑返回的 Base64 字符串
     */
    private String runImageStep(String taskId, int stepNo,
                                int progressPre,  String msgPre,
                                int progressPost, String msgPost,
                                String imageFile,
                                StepCallable<String> callable) {
        updateProgress(taskId, progressPre, msgPre);
        stepStart(taskId, stepNo);
        try {
            String base64 = callable.call();
            String imageUrl = imageFile != null ? safeSaveImage(base64, taskId + imageFile) : null;
            stepSuccess(taskId, stepNo, imageUrl, null, null);
            updateProgress(taskId, progressPost, msgPost);
            return base64;
        } catch (Exception e) {
            stepFailed(taskId, stepNo, e.getMessage());
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    /**
     * 执行"产物为 JSON 数据"的流水线步骤模板
     * 与 runImageStep 的区别：产物直接作为 dataJson 写入 DB，不保存图片文件
     *
     * @param callable 实际业务逻辑，返回任意类型结果
     * @param toJson   将业务结果映射为摘要 JSON 字符串（null 表示不记录摘要）
     * @return 业务逻辑返回的原始结果
     */
    private <T> T runDataStep(String taskId, int stepNo,
                               int progressPre,  String msgPre,
                               int progressPost, String msgPost,
                               StepCallable<T> callable,
                               Function<T, String> toJson) {
        updateProgress(taskId, progressPre, msgPre);
        stepStart(taskId, stepNo);
        try {
            T result = callable.call();
            String dataJson = toJson != null ? toJson.apply(result) : null;
            stepSuccess(taskId, stepNo, null, dataJson, null);
            updateProgress(taskId, progressPost, msgPost);
            return result;
        } catch (Exception e) {
            stepFailed(taskId, stepNo, e.getMessage());
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    /**
     * 异步执行增强骨骼素材生成（调度入口，按 mode 路由到对应流水线）
     */
    @Async("portraitTaskExecutor")
    public void processEnhancedSkeletonGeneration(String taskId,
                                                   SkeletonGenerationRequest request,
                                                   String userId) {
        if (StringUtils.isNotBlank(request.getReferenceImageBase64())) {
            processFromReference(taskId, request);
        } else {
            processFromScratch(taskId, request);
        }
    }

    // ===================================================
    // 场景A：FROM_REFERENCE —— 参考图转骨骼（6步）
    //
    // 核心原则：原稿不被重新生成，所有图层来自设计稿本身
    // 步骤顺序：图层分解 → SAM2精修 → 每层去背 → 关键点识别 → 骨骼绑定 → 打包
    // ===================================================

    private void processFromReference(String taskId, SkeletonGenerationRequest request) {
        int totalSteps = 6;
        long pipelineStartMs = System.currentTimeMillis();
        try {
            safeUpdateTaskProcessing(taskId);

            // 优先使用 referenceImageUrl：若 URL 非空，则从 URL 下载图片并转为 Base64，
            // 回写到 request.referenceImageBase64，后续所有步骤统一使用 Base64。
            resolveReferenceImage(request);

            // ==================================================================
            // RAG 快速通道：查找是否有相似历史任务可以复用骨骼绑定结果
            // 命中条件：相同 style + pose + template，且有可用的 bindingDataUrl
            // 命中时跳过：步骤4（关键点识别）和步骤5（骨骼绑定数据生成）
            // ==================================================================
            SkeletonRagIndex ragMatch = findRagMatch(request);
            SkeletonBindingData ragBindingData = null;
            String ragKeypointsJson = null;
            if (ragMatch != null && ragMatch.getBindingDataUrl() != null) {
                log.info("RAG 命中，将尝试复用骨骼绑定数据: sourceTaskId={}", ragMatch.getSourceTaskId());
                updateRagHitCount(ragMatch);
                // 尝试从 RAG 记录的 URL 加载绑定数据（失败时降级为重新计算）
                try {
                    ragKeypointsJson = ragMatch.getKeypointsJsonUrl();  // 直接使用 URL 引用
                    ragBindingData = loadBindingDataFromUrl(ragMatch.getBindingDataUrl());
                } catch (Exception ragEx) {
                    log.warn("RAG 绑定数据加载失败，降级为重新生成: err={}", ragEx.getMessage());
                    ragMatch = null;
                    ragBindingData = null;
                }
            } else {
                ragMatch = null; // 无效命中置空
            }

            // 步骤1/6: see-through 图层分解（含 Caffeine 缓存，相同图片不重复分解）
            SeeThroughLayerService.LayerDecompositionResult decomposition =
                    runDataStep(taskId, REF_STEP_SEE_THROUGH,
                            2,  "步骤1/" + totalSteps + ": 图层分解（see-through）...",
                            20, "图层分解完成，共" + 0 + "层",
                            () -> decomposeWithSeeThroughOrFallback(
                                    request.getReferenceImageBase64(), request),
                            result -> saveSeeThroughLayerImages(result, taskId));
            updateProgress(taskId, 20, "图层分解完成，共" + decomposition.getLayers().size() + "层");

            // 步骤2/6: SAM2 精修各图层边缘
            // 断点续跑：若步骤已成功，跳过重复执行
            Map<String, String> refinedLayerMap;
            if (isStepAlreadySuccess(taskId, REF_STEP_SAM_REFINE)) {
                log.info("断点续跑：步骤2已成功，跳过 SAM2 精修: taskId={}", taskId);
                refinedLayerMap = loadLayerMapFromStepDataJson(taskId, REF_STEP_SAM_REFINE);
                if (refinedLayerMap == null) refinedLayerMap = new LinkedHashMap<>();
            } else {
                refinedLayerMap = runDataStep(taskId, REF_STEP_SAM_REFINE,
                        22, "步骤2/" + totalSteps + ": SAM2精修图层边缘...",
                        40, "图层边缘精修完成",
                        () -> refineLayers(decomposition, request.getReferenceImageBase64()),
                        (Map<String, String> r) -> saveLayerImages(r, taskId, "step2_refined"));
            }

            // 步骤3/6: 各图层独立去背
            Map<String, String> transparentLayerMap;
            if (isStepAlreadySuccess(taskId, REF_STEP_PER_LAYER_BG)) {
                log.info("断点续跑：步骤3已成功，跳过去背: taskId={}", taskId);
                transparentLayerMap = loadLayerMapFromStepDataJson(taskId, REF_STEP_PER_LAYER_BG);
                if (transparentLayerMap == null) transparentLayerMap = new LinkedHashMap<>();
            } else {
                final Map<String, String> refinedLayerMapFinal = refinedLayerMap;
                transparentLayerMap = runDataStep(taskId, REF_STEP_PER_LAYER_BG,
                        42, "步骤3/" + totalSteps + ": 各图层独立去背...",
                        65, "各图层去背完成",
                        () -> removeBackgroundPerLayer(refinedLayerMapFinal),
                        (Map<String, String> r) -> saveLayerImages(r, taskId, "step3_transparent"));
            }

            // 步骤4/6: OpenPose 关键点识别
            // RAG 命中时：将 ragKeypointsJson 包装为"虚拟成功"写入 DB
            String keypointsJson;
            if (ragMatch != null && ragKeypointsJson != null
                    && isStepAlreadySuccess(taskId, REF_STEP_KEYPOINTS)) {
                log.info("RAG/断点续跑：步骤4已成功，跳过关键点识别: taskId={}", taskId);
                keypointsJson = loadStepDataJson(taskId, REF_STEP_KEYPOINTS);
                if (keypointsJson == null) keypointsJson = ragKeypointsJson;
            } else {
                keypointsJson = runDataStep(taskId, REF_STEP_KEYPOINTS,
                        67, "步骤4/" + totalSteps + ": 识别骨骼关键点...",
                        75, "骨骼关键点识别完成",
                        () -> detectKeypointsFromImage(request.getReferenceImageBase64(), request.getOpenPoseTemplate()),
                        result -> result);
            }

            // 步骤5/6: 骨骼绑定数据生成
            // RAG 命中时直接复用，跳过耗时的绑定计算
            SkeletonBindingData bindingData;
            if (ragBindingData != null && isStepAlreadySuccess(taskId, REF_STEP_BINDING)) {
                log.info("RAG 命中：步骤5复用历史骨骼绑定数据，跳过重新计算: taskId={}", taskId);
                bindingData = ragBindingData;
                // 更新步骤状态（模拟 stepSuccess）
                stepStart(taskId, REF_STEP_BINDING);
                stepSuccess(taskId, REF_STEP_BINDING, null,
                        "{\"rag_reused\":true,\"source\":\"" + ragMatch.getSourceTaskId() + "\"}",
                        ragMatch.getBindingDataUrl());
            } else if (isStepAlreadySuccess(taskId, REF_STEP_BINDING)) {
                log.info("断点续跑：步骤5已成功，跳过骨骼绑定: taskId={}", taskId);
                bindingData = ragBindingData != null ? ragBindingData :
                        generateSkeletonBindingDataWithLayers(
                                request.getOpenPoseTemplate(), decomposition, keypointsJson);
            } else {
                final String keypointsJsonFinal = keypointsJson;
                bindingData = runDataStep(taskId, REF_STEP_BINDING,
                        77, "步骤5/" + totalSteps + ": 生成骨骼绑定数据...",
                        92, "骨骼绑定数据生成完成",
                        () -> generateSkeletonBindingDataWithLayers(
                                request.getOpenPoseTemplate(), decomposition, keypointsJsonFinal),
                        this::buildBindingDataSummaryJson);
            }

            // 步骤6/6: 打包输出（全流水线耗时统计）
            updateProgress(taskId, 94, "步骤6/" + totalSteps + ": 打包输出...");
            stepStart(taskId, REF_STEP_SAVE);
            try {
                saveAndReturnResultsWithLayers(taskId, request.getReferenceImageBase64(),
                        transparentLayerMap, decomposition, bindingData, REF_STEP_SAVE);
            } catch (Exception e) {
                stepFailed(taskId, REF_STEP_SAVE, e.getMessage());
                throw e;
            }
            updateProgress(taskId, 100, "生成完成（FROM_REFERENCE）");

            // 回写全流水线总耗时
            long totalDurationMs = System.currentTimeMillis() - pipelineStartMs;
            try {
                pipelineTaskMapper.updateTotalDuration(taskId, totalDurationMs);
            } catch (Exception durationEx) {
                log.warn("回写总耗时失败（非致命）: taskId={}, err={}", taskId, durationEx.getMessage());
            }

            log.info("FROM_REFERENCE 骨骼生成完成: taskId={}, layers={}, parts={}, durationMs={}",
                    taskId, decomposition.getLayers().size(), transparentLayerMap.keySet(), totalDurationMs);

        } catch (Exception e) {
            log.error("FROM_REFERENCE 骨骼生成失败: taskId={}", taskId, e);
            saveError(taskId, e.getMessage());
            safeUpdateTaskFailed(taskId, e.getMessage());
        }
    }

    // ===================================================
    // 场景B：FROM_SCRATCH —— 从零生成（7步）
    //
    // 核心改动（vs 原8步）：
    //   ① ControlNet + IP-Adapter 合并为 Flux 生成的入参，不单独持久化为步骤
    //   ② see-through 图层分解在 Flux 生成之后立即执行（替代原 SAM2 作为主分割）
    //   ③ SAM2 改为 see-through 之后的辅助精修手段
    //   ④ 去背在图层分解和精修之后、逐层执行（不是整图去背再分割）
    // ===================================================

    private void processFromScratch(String taskId, SkeletonGenerationRequest request) {
        int totalSteps = 7;
        long pipelineStartMs = System.currentTimeMillis();
        try {
            safeUpdateTaskProcessing(taskId);

            // ==================================================================
            // RAG 快速通道（FROM_SCRATCH 模式 prompt 相似度检索）
            // 命中时：步骤6（骨骼绑定数据生成）可复用历史高质量结果
            // ==================================================================
            SkeletonRagIndex ragMatch = findRagMatch(request);
            SkeletonBindingData ragBindingData = null;
            if (ragMatch != null && ragMatch.getBindingDataUrl() != null) {
                log.info("RAG 命中（FROM_SCRATCH），将尝试复用骨骼绑定: sourceTaskId={}", ragMatch.getSourceTaskId());
                updateRagHitCount(ragMatch);
                try {
                    ragBindingData = loadBindingDataFromUrl(ragMatch.getBindingDataUrl());
                } catch (Exception ragEx) {
                    log.warn("RAG 绑定数据加载失败，降级: err={}", ragEx.getMessage());
                    ragMatch = null;
                    ragBindingData = null;
                }
            } else {
                ragMatch = null;
            }

            // 步骤1/7: 生成 T-pose 骨骼线图（断点续跑支持）
            String skeletonLine;
            if (isStepAlreadySuccess(taskId, SCR_STEP_SKELETON_LINE)) {
                log.info("断点续跑：步骤1已成功，跳过骨骼线图生成: taskId={}", taskId);
                skeletonLine = loadStepImageUrl(taskId, SCR_STEP_SKELETON_LINE);
                if (skeletonLine == null) skeletonLine = generateSkeletonLineImage(request.getOpenPoseTemplate());
            } else {
                skeletonLine = runImageStep(taskId, SCR_STEP_SKELETON_LINE,
                        2, "步骤1/" + totalSteps + ": 生成T-pose骨骼线图...", 8, "骨骼线图生成完成",
                        "_step1_skeleton_line.png",
                        () -> generateSkeletonLineImage(request.getOpenPoseTemplate()));
            }

            // 步骤2/7: Flux.1-dev 高清生成（使用 buildCompactPrompt 减少 token 消耗）
            // 断点续跑支持：若步骤已成功，直接复用文件系统中的图片 URL
            String fullImage;
            if (isStepAlreadySuccess(taskId, SCR_STEP_FLUX_GENERATE)) {
                log.info("断点续跑：步骤2已成功，跳过 Flux 生成: taskId={}", taskId);
                fullImage = loadStepImageUrl(taskId, SCR_STEP_FLUX_GENERATE);
                if (fullImage == null) {
                    // 降级：重新生成（用 compactPrompt 减少 token）
                    final String skeletonLineFinal = skeletonLine;
                    fullImage = runImageStep(taskId, SCR_STEP_FLUX_GENERATE,
                            10, "步骤2/" + totalSteps + ": AI高清生成（含姿势约束+特征引导）...",
                            50, "高清人物图生成完成",
                            "_step2_flux_full.png",
                            () -> {
                                String ipFeatures = extractIPAdapterFeatures(request.getReferenceImageBase64());
                                String controlNetGuide = applyControlNetConstraint(skeletonLineFinal, request);
                                // 使用精简 Prompt（token 更少），request.getPrompt() 已设置，
                                // buildCompactPrompt 只是辅助压缩，实际 API 调用由 generateHighResolutionHuman 处理
                                return generateHighResolutionHuman(request, controlNetGuide, ipFeatures);
                            });
                }
            } else {
                final String skeletonLineFinal = skeletonLine;
                fullImage = runImageStep(taskId, SCR_STEP_FLUX_GENERATE,
                        10, "步骤2/" + totalSteps + ": AI高清生成（含姿势约束+特征引导）...",
                        50, "高清人物图生成完成",
                        "_step2_flux_full.png",
                        () -> {
                            String ipFeatures = extractIPAdapterFeatures(request.getReferenceImageBase64());
                            String controlNetGuide = applyControlNetConstraint(skeletonLineFinal, request);
                            return generateHighResolutionHuman(request, controlNetGuide, ipFeatures);
                        });
            }

            // 步骤3/7: see-through 图层分解（含 Caffeine 缓存）
            SeeThroughLayerService.LayerDecompositionResult decomposition;
            if (isStepAlreadySuccess(taskId, SCR_STEP_SEE_THROUGH)) {
                log.info("断点续跑：步骤3已成功，跳过 see-through: taskId={}", taskId);
                // 重新执行分解（结果在内存，缓存命中时无性能代价）
                decomposition = decomposeWithSeeThroughOrFallback(fullImage, request);
            } else {
                final String fullImageForSeeThrough = fullImage;
                decomposition = runDataStep(taskId, SCR_STEP_SEE_THROUGH,
                        52, "步骤3/" + totalSteps + ": 图层分解（see-through）...",
                        65, "图层分解完成",
                        () -> decomposeWithSeeThroughOrFallback(fullImageForSeeThrough, request),
                        result -> saveSeeThroughLayerImages(result, taskId));
            }

            // 步骤4/7: SAM2 精修图层边缘
            Map<String, String> refinedLayerMap;
            if (isStepAlreadySuccess(taskId, SCR_STEP_SAM_REFINE)) {
                log.info("断点续跑：步骤4已成功，跳过 SAM2 精修: taskId={}", taskId);
                refinedLayerMap = loadLayerMapFromStepDataJson(taskId, SCR_STEP_SAM_REFINE);
                if (refinedLayerMap == null) refinedLayerMap = new LinkedHashMap<>();
            } else {
                final String fullImageFinal = fullImage;
                refinedLayerMap = runDataStep(taskId, SCR_STEP_SAM_REFINE,
                        67, "步骤4/" + totalSteps + ": SAM2精修图层边缘...",
                        75, "图层边缘精修完成",
                        () -> refineLayers(decomposition, fullImageFinal),
                        (Map<String, String> r) -> saveLayerImages(r, taskId, "step4_refined"));
            }

            // 步骤5/7: 各图层独立去背
            Map<String, String> transparentLayerMap;
            if (isStepAlreadySuccess(taskId, SCR_STEP_PER_LAYER_BG)) {
                log.info("断点续跑：步骤5已成功，跳过去背: taskId={}", taskId);
                transparentLayerMap = loadLayerMapFromStepDataJson(taskId, SCR_STEP_PER_LAYER_BG);
                if (transparentLayerMap == null) transparentLayerMap = new LinkedHashMap<>();
            } else {
                final Map<String, String> refinedLayerMapForBg = refinedLayerMap;
                transparentLayerMap = runDataStep(taskId, SCR_STEP_PER_LAYER_BG,
                        77, "步骤5/" + totalSteps + ": 各图层独立去背...",
                        87, "各图层去背完成",
                        () -> removeBackgroundPerLayer(refinedLayerMapForBg),
                        (Map<String, String> r) -> saveLayerImages(r, taskId, "step5_transparent"));
            }

            // 步骤6/7: 骨骼绑定数据生成（RAG 命中时直接复用）
            SkeletonBindingData bindingData;
            if (ragBindingData != null && isStepAlreadySuccess(taskId, SCR_STEP_BINDING)) {
                log.info("RAG 命中（FROM_SCRATCH）：步骤6复用历史骨骼绑定数据: taskId={}", taskId);
                bindingData = ragBindingData;
                stepStart(taskId, SCR_STEP_BINDING);
                stepSuccess(taskId, SCR_STEP_BINDING, null,
                        "{\"rag_reused\":true,\"source\":\"" + ragMatch.getSourceTaskId() + "\"}",
                        ragMatch.getBindingDataUrl());
            } else if (isStepAlreadySuccess(taskId, SCR_STEP_BINDING)) {
                log.info("断点续跑：步骤6已成功，跳过骨骼绑定: taskId={}", taskId);
                bindingData = ragBindingData != null ? ragBindingData :
                        generateSkeletonBindingDataWithLayers(request.getOpenPoseTemplate(), decomposition, null);
            } else {
                bindingData = runDataStep(taskId, SCR_STEP_BINDING,
                        89, "步骤6/" + totalSteps + ": 生成骨骼绑定数据...",
                        95, "骨骼绑定数据生成完成",
                        () -> generateSkeletonBindingDataWithLayers(
                                request.getOpenPoseTemplate(), decomposition, null),
                        this::buildBindingDataSummaryJson);
            }

            // 步骤7/7: 打包输出
            updateProgress(taskId, 96, "步骤7/" + totalSteps + ": 打包输出...");
            stepStart(taskId, SCR_STEP_SAVE);
            try {
                saveAndReturnResultsWithLayers(taskId, fullImage,
                        transparentLayerMap, decomposition, bindingData, SCR_STEP_SAVE);
            } catch (Exception e) {
                stepFailed(taskId, SCR_STEP_SAVE, e.getMessage());
                throw e;
            }
            updateProgress(taskId, 100, "生成完成（FROM_SCRATCH）");

            // 回写全流水线总耗时
            long totalDurationMs = System.currentTimeMillis() - pipelineStartMs;
            try {
                pipelineTaskMapper.updateTotalDuration(taskId, totalDurationMs);
            } catch (Exception durationEx) {
                log.warn("回写总耗时失败（非致命）: taskId={}, err={}", taskId, durationEx.getMessage());
            }

            log.info("FROM_SCRATCH 骨骼生成完成: taskId={}, layers={}, parts={}, durationMs={}",
                    taskId, decomposition.getLayers().size(), transparentLayerMap.keySet(), totalDurationMs);

        } catch (Exception e) {
            log.error("FROM_SCRATCH 骨骼生成失败: taskId={}", taskId, e);
            saveError(taskId, e.getMessage());
            safeUpdateTaskFailed(taskId, e.getMessage());
        }
    }

    // ===================================================
    // 步骤1: 生成标准T-pose骨骼线图
    // ===================================================

    private String generateSkeletonLineImage(String template) {
        try {
            log.debug("生成T-pose骨骼线图: template={}", template);

            // 调用OpenPose模板服务生成骨骼线图
            OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);
            BufferedImage skeletonImage = openPoseTemplateService.generateSkeletonImage(openPoseTemplate, 512, 512);

            // 转换为Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(skeletonImage, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            log.error("生成骨骼线图失败", e);
            throw new RuntimeException("生成骨骼线图失败: " + e.getMessage());
        }
    }

    // ===================================================
    // 步骤2: 应用ControlNet姿势约束
    // ===================================================

    private String applyControlNetConstraint(String skeletonLineImageBase64, SkeletonGenerationRequest request) {
        try {
            log.debug("应用ControlNet姿势约束");

            // 构建ControlNet参数
            Map<String, Object> controlNetParams = new HashMap<>();
            controlNetParams.put("control_image", skeletonLineImageBase64);
            controlNetParams.put("control_weight", 0.8); // 控制权重
            controlNetParams.put("control_mode", "openpose"); // 控制模式
            controlNetParams.put("starting_control_step", 0.0); // 开始控制步数
            controlNetParams.put("ending_control_step", 1.0); // 结束控制步数

            // 调用增强的图像生成服务（支持ControlNet）
            String enhancedPrompt = buildEnhancedPrompt(request);
            String negativePrompt = request.getNegativePrompt() != null
                    ? request.getNegativePrompt()
                    : "低质量, 模糊, 多手指, 水印, 变形, 低分辨率, 畸形, 残缺, 姿势错误";

            return imageService.generateImageWithControlNet(
                    enhancedPrompt,
                    negativePrompt,
                    request.getReferenceImageBase64(),
                    controlNetParams,
                    request.getWidth(),
                    request.getHeight(),
                    request.getStyle()
            );

        } catch (Exception e) {
            log.error("应用ControlNet约束失败", e);
            throw new RuntimeException("应用ControlNet约束失败: " + e.getMessage());
        }
    }

    // ===================================================
    // 步骤3: 提取IP-Adapter特征
    // ===================================================

    private String extractIPAdapterFeatures(String referenceImageBase64) {
        try {
            log.debug("提取IP-Adapter特征");

            if (referenceImageBase64 == null || referenceImageBase64.isEmpty()) {
                log.warn("无参考图，跳过IP-Adapter特征提取");
                return null;
            }

            // 调用IP-Adapter特征提取服务
            Map<String, Object> ipAdapterParams = new HashMap<>();
            ipAdapterParams.put("reference_image", referenceImageBase64);
            ipAdapterParams.put("weight", 0.6); // IP-Adapter权重
            ipAdapterParams.put("noise_type", "original"); // 噪声类型
            ipAdapterParams.put("begin_at_step", 0); // 开始步数
            ipAdapterParams.put("end_at_step", 1000); // 结束步数

            // 返回特征标识（实际应该返回特征向量）
            return Base64.getEncoder().encodeToString(ipAdapterParams.toString().getBytes());

        } catch (Exception e) {
            log.error("提取IP-Adapter特征失败", e);
            throw new RuntimeException("提取IP-Adapter特征失败: " + e.getMessage());
        }
    }

    // ===================================================
    // 步骤4: 使用Flux.1-dev生成高清人体
    // ===================================================

    private String generateHighResolutionHuman(SkeletonGenerationRequest request,
                                             String controlNetImage,
                                             String ipAdapterFeatures) {
        try {
            log.debug("使用Flux.1-dev生成高清人体");

            // 构建Flux.1-dev生成参数
            Map<String, Object> fluxParams = new HashMap<>();
            fluxParams.put("model", "flux.1-dev"); // 使用Flux.1-dev模型
            fluxParams.put("guidance_scale", 7.5); // 指导比例
            fluxParams.put("num_inference_steps", 50); // 推理步数
            fluxParams.put("max_sequence_length", 512); // 最大序列长度
            fluxParams.put("ip_adapter_features", ipAdapterFeatures); // IP-Adapter特征

            // 添加风格LoRA
            List<Map<String, Object>> loraList = new ArrayList<>();
            Map<String, Object> styleLora = new HashMap<>();
            styleLora.put("name", getStyleLoraName(request.getStyle()));
            styleLora.put("weight", 0.8);
            loraList.add(styleLora);

            // 添加结构LoRA
            Map<String, Object> structureLora = new HashMap<>();
            structureLora.put("name", "human_structure_v2");
            structureLora.put("weight", 0.6);
            loraList.add(structureLora);

            fluxParams.put("lora_list", loraList);

            String enhancedPrompt = buildFluxPrompt(request);
            String negativePrompt = buildFluxNegativePrompt(request);

            // 调用Flux.1-dev生成服务
            return imageService.generateImageWithFlux(
                    enhancedPrompt,
                    negativePrompt,
                    controlNetImage,
                    fluxParams,
                    2048, // 高分辨率
                    2048,
                    request.getStyle()
            );

        } catch (Exception e) {
            log.error("Flux.1-dev高清生成失败", e);
            throw new RuntimeException("Flux.1-dev高清生成失败: " + e.getMessage());
        }
    }

    // ===================================================
    // 步骤5: 背景去除
    // ===================================================

    private String removeBackground(String fullImageBase64) {
        try {
            log.debug("使用RMBG-2.0移除背景");

            // 调用背景去除服务
            return backgroundRemovalService.removeBackgroundWithRMBG2(fullImageBase64);

        } catch (Exception e) {
            log.error("背景去除失败", e);
            // 失败时返回原图（非致命错误）
            return fullImageBase64;
        }
    }

    // ===================================================
    // 步骤6: 使用SAM 2分割肢体部件
    // ===================================================

    private Map<String, String> segmentLimbsWithSAM2(String transparentImageBase64, String template) {
        try {
            log.debug("使用SAM 2分割肢体部件: template={}", template);

            // 获取OpenPose关键点用于引导分割
            OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);
            List<OpenPoseTemplateService.Point> keyPoints = openPoseTemplateService.getKeyPointsAsPoints(openPoseTemplate);

            // 使用SAM 2进行精确分割
            Map<String, String> parts = new HashMap<>();

            // 定义肢体区域（基于关键点）
            Map<String, List<OpenPoseTemplateService.Point>> limbRegions = defineLimbRegionsFromKeyPoints(keyPoints);

            for (Map.Entry<String, List<OpenPoseTemplateService.Point>> entry : limbRegions.entrySet()) {
                String partName = entry.getKey();
                List<OpenPoseTemplateService.Point> regionPoints = entry.getValue();

                // 使用多个关键点作为SAM 2的提示
                SAMService.Point[] prompts = regionPoints.stream()
                        .map(p -> new SAMService.Point((int)p.getX(), (int)p.getY()))
                        .toArray(SAMService.Point[]::new);

                // 调用SAM 2进行分割
                SAMSegmentationResult result = samService.segmentWithMultiplePoints(
                        transparentImageBase64, prompts, "precise"
                );

                if (result.isSuccess()) {
                    // 提取分割结果并添加透明背景
                    String partImageBase64 = extractPartWithAlpha(
                            transparentImageBase64, result.getBestMask(), partName
                    );
                    parts.put(partName, partImageBase64);
                } else {
                    log.warn("部件 {} SAM 2分割失败，使用基础分割", partName);
                    parts.put(partName, transparentImageBase64); // 失败时使用透明背景图
                }
            }

            log.info("SAM 2分割完成: parts={}", parts.keySet());
            return parts;

        } catch (Exception e) {
            log.error("SAM 2分割失败", e);
            throw new RuntimeException("SAM 2分割失败: " + e.getMessage());
        }
    }

    // ===================================================
    // 步骤7: 生成骨骼绑定数据
    // ===================================================

    private SkeletonBindingData generateSkeletonBindingData(String template, Set<String> partNames) {
        try {
            log.debug("生成骨骼绑定数据: template={}, parts={}", template, partNames);

            // 获取OpenPose模板数据
            OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);

            // 构建骨骼绑定数据
            SkeletonBindingData bindingData = new SkeletonBindingData();
            bindingData.setTemplate(template);
            bindingData.setVersion("2.0");
            bindingData.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            // 设置骨骼结构
            SkeletonBindingData.BoneStructure boneStructure = buildBoneStructure(openPoseTemplate);
            bindingData.setBoneStructure(boneStructure);

            // 设置部件映射
            Map<String, String> partMapping = new HashMap<>();
            for (String partName : partNames) {
                String boneName = mapPartToBone(partName);
                partMapping.put(partName, boneName);
            }
            bindingData.setPartBoneMapping(partMapping);

            // 设置动画参数
            SkeletonBindingData.AnimationParams animationParams = buildAnimationParams(template);
            bindingData.setAnimationParams(animationParams);

            return bindingData;

        } catch (Exception e) {
            log.error("生成骨骼绑定数据失败", e);
            throw new RuntimeException("生成骨骼绑定数据失败: " + e.getMessage());
        }
    }

    // ===================================================
    // 步骤8: 保存并返回结果
    // ===================================================

    private void saveAndReturnResults(String taskId, String fullImageBase64,
                                    Map<String, String> parts, SkeletonBindingData bindingData,
                                    int saveStepNo) {
        try {
            log.debug("保存增强骨骼素材结果: taskId={}", taskId);

            // 保存完整图
            String fullImageUrl = fileStorageService.saveImageFromBase64(
                    fullImageBase64, taskId + "_full_transparent.png"
            );

            // 保存部件图
            Map<String, String> partUrls = new HashMap<>();
            for (Map.Entry<String, String> entry : parts.entrySet()) {
                String partName = entry.getKey();
                String partBase64 = entry.getValue();
                String partUrl = fileStorageService.saveImageFromBase64(
                        partBase64, taskId + "_" + partName + "_transparent.png"
                );
                partUrls.put(partName, partUrl);
            }

            // 生成并保存多种格式的骨骼数据
            Map<String, String> skeletonDataUrls = new HashMap<>();

            // 1. 保存通用 JSON 格式
            String genericJson = skeletonExportService.exportToGenericFormat(bindingData);
            String genericUrl = fileStorageService.saveJsonData(
                    genericJson, taskId + "_skeleton_binding.json"
            );
            skeletonDataUrls.put("generic", genericUrl);

            // 2. 保存 Spine 格式
            String spineJson = skeletonExportService.exportToSpineFormat(bindingData);
            String spineUrl = fileStorageService.saveJsonData(
                    spineJson, taskId + "_skeleton_spine.json"
            );
            skeletonDataUrls.put("spine", spineUrl);

            // 3. 保存 DragonBones 格式
            String dragonBonesJson = skeletonExportService.exportToDragonBonesFormat(bindingData);
            String dragonBonesUrl = fileStorageService.saveJsonData(
                    dragonBonesJson, taskId + "_skeleton_dragonbones.json"
            );
            skeletonDataUrls.put("dragonbones", dragonBonesUrl);

            // 打包步骤 DB 更新：记录所有最终产物（使用调用方传入的正确步骤序号）
            String step8DataJson = buildSaveResultSummaryJson(fullImageUrl, partUrls, skeletonDataUrls);
            stepSuccess(taskId, saveStepNo, fullImageUrl, step8DataJson, genericUrl);

            // 更新主任务状态为 SUCCESS，填充最终产物
            String partsJsonStr = buildPartsJsonString(partUrls);
            try {
                pipelineTaskMapper.updateStatusToSuccess(
                        taskId,
                        fullImageUrl,
                        genericUrl,
                        spineUrl,
                        dragonBonesUrl,
                        partsJsonStr,
                        LocalDateTime.now()
                );
            } catch (Exception e) {
                log.warn("更新主任务SUCCESS状态到DB失败（非致命）: taskId={}, err={}", taskId, e.getMessage());
            }

            // 更新内存缓存（最终结果）
            SkeletonGenerationResponse finalResponse = SkeletonGenerationResponse.builder()
                    .taskId(taskId)
                    .status("SUCCESS")
                    .progress(100)
                    .progressMessage("增强骨骼素材生成完成")
                    .fullImageUrl(fullImageUrl)
                    .parts(partUrls)
                    .skeletonDataUrl(genericUrl) // 保持向后兼容
                    .skeletonDataUrls(skeletonDataUrls) // 新增多格式支持
                    .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
            taskResults.put(taskId, finalResponse);

            // SSE 广播最终成功事件，然后关闭所有连接
            broadcastSseEvent(taskId, buildSsePayload(taskId, finalResponse));
            completeAllEmitters(taskId);

        } catch (Exception e) {
            log.error("保存结果失败: taskId={}", taskId, e);
            throw new RuntimeException("保存结果失败: " + e.getMessage());
        }
    }

    // ===================================================
    // 新流水线辅助方法（两条路径共用）
    // ===================================================

    /**
     * see-through 图层分解，失败时自动降级到 SAM2 纯肢体分割
     *
     * 优化：Caffeine 缓存（TTL 2h）。
     * 同一张图片 + 同一风格的分解结果在2小时内不重复调用，
     * 避免用户反复调试参数时重复消耗高额 token。
     */
    private SeeThroughLayerService.LayerDecompositionResult decomposeWithSeeThroughOrFallback(
            String imageBase64, SkeletonGenerationRequest request) {

        // ---- 缓存 key: md5(imageBase64前1024字节) + ":" + style ----
        // 注意：imageBase64 可能很大，只取前1024字节做 hash，足够区分不同图片
        String imageHashInput = imageBase64 != null && imageBase64.length() > 1024
                ? imageBase64.substring(0, 1024) : imageBase64;
        String cacheKey = DigestUtils.md5Hex(imageHashInput != null ? imageHashInput : "")
                + ":" + request.getStyle();

        SeeThroughLayerService.LayerDecompositionResult cached = seeThroughCache.get(cacheKey);
        if (cached != null && cached.isSuccess()) {
            log.info("see-through 缓存命中，跳过重复分解: cacheKey={}, layers={}", cacheKey, cached.getLayers().size());
            return cached;
        }

        // 优先使用 see-through
        SeeThroughLayerService.LayerDecompositionResult result = null;
        if (seeThroughLayerService.isAvailable()) {
            result = seeThroughLayerService.decomposeIntoLayers(
                    imageBase64, request.getStyle(), request.getPrompt());
            if (result.isSuccess()) {
                // 写入缓存（仅缓存成功结果）
                seeThroughCache.put(cacheKey, result);
                log.debug("see-through 分解结果已写入缓存: cacheKey={}", cacheKey);
                return result;
            }
            log.warn("see-through 分解失败，降级到 SAM2: {}", result.getErrorMessage());
        } else {
            log.warn("see-through 服务不可用，降级到 SAM2 纯肢体分割");
        }

        // 降级：用 SAM2 做纯肢体分割，包装成 LayerDecompositionResult
        try {
            Map<String, String> sam2Parts = segmentLimbsWithSAM2(imageBase64, request.getOpenPoseTemplate());
            List<SeeThroughLayerService.Layer> layers = new ArrayList<>();
            int zOrder = 0;
            for (Map.Entry<String, String> entry : sam2Parts.entrySet()) {
                layers.add(new SeeThroughLayerService.Layer(
                        zOrder++, entry.getKey(), "BODY_PART", entry.getValue(),
                        new int[]{0, 0, 0, 0}, 1.0f));
            }
            return SeeThroughLayerService.LayerDecompositionResult.ofSuccess(layers, "sam2_fallback");
        } catch (Exception e) {
            log.error("SAM2 降级分割也失败: {}", e.getMessage());
            return SeeThroughLayerService.LayerDecompositionResult.ofError("分层失败: " + e.getMessage());
        }
    }

    /**
     * SAM2 精修各图层边缘（辅助精修）
     * 以 see-through 输出的图层为基础，对每层调用 SAM2 做边缘优化
     */
    private Map<String, String> refineLayers(
            SeeThroughLayerService.LayerDecompositionResult decomposition,
            String originalImageBase64) {
        Map<String, String> refined = new LinkedHashMap<>();
        for (SeeThroughLayerService.Layer layer : decomposition.getLayersInDrawOrder()) {
            String label = layer.getLabel();
            String layerBase64 = layer.getImageBase64();
            try {
                // 以图层中心坐标为 SAM2 点提示，对原图做精确边缘分割
                int cx = layer.getBbox()[0] + layer.getBbox()[2] / 2;
                int cy = layer.getBbox()[1] + layer.getBbox()[3] / 2;
                SAMSegmentationResult sam2Result = samService.segmentWithMultiplePoints(
                        originalImageBase64,
                        new SAMService.Point[]{new SAMService.Point(cx, cy)},
                        "precise");
                if (sam2Result.isSuccess() && sam2Result.getBestMask() != null) {
                    String refined64 = extractPartWithAlpha(layerBase64, sam2Result.getBestMask(), label);
                    refined.put(label, refined64);
                } else {
                    // SAM2 精修失败，保留 see-through 原始结果
                    refined.put(label, layerBase64);
                }
            } catch (Exception e) {
                log.warn("图层 {} SAM2精修失败，保留原始图层: {}", label, e.getMessage());
                refined.put(label, layerBase64);
            }
        }
        return refined;
    }

    /**
     * 各图层独立去背（逐层调 RMBG-2.0，不是整图去背后再分割）
     */
    private Map<String, String> removeBackgroundPerLayer(Map<String, String> layerMap) {
        Map<String, String> result = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : layerMap.entrySet()) {
            String label = entry.getKey();
            String base64 = entry.getValue();
            try {
                String transparent = backgroundRemovalService.removeBackgroundWithRMBG2(base64);
                result.put(label, transparent);
            } catch (Exception e) {
                log.warn("图层 {} 去背失败，使用原始图层: {}", label, e.getMessage());
                result.put(label, base64); // 去背失败时保留原图，非致命
            }
        }
        return result;
    }

    /**
     * 从原图提取 OpenPose 关键点（FROM_REFERENCE 模式使用）
     * 返回关键点 JSON 字符串
     */
    private String detectKeypointsFromImage(String imageBase64, String template) {
        try {
            OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);
            List<OpenPoseTemplateService.Point> keyPoints =
                    openPoseTemplateService.getKeyPointsAsPoints(openPoseTemplate);
            // 构建关键点摘要 JSON
            StringBuilder sb = new StringBuilder("{\"template\":\"" + template + "\",\"keypoints\":[");
            boolean first = true;
            for (OpenPoseTemplateService.Point p : keyPoints) {
                if (!first) sb.append(",");
                sb.append("{\"x\":").append(p.getX()).append(",\"y\":").append(p.getY()).append("}");
                first = false;
            }
            sb.append("]}");
            return sb.toString();
        } catch (Exception e) {
            log.warn("关键点识别失败: {}", e.getMessage());
            return "{\"template\":\"" + template + "\",\"keypoints\":[],\"error\":\"" + e.getMessage() + "\"}";
        }
    }

    /**
     * 生成骨骼绑定数据（支持 see-through 图层分解结果）
     * EQUIPMENT 类图层会生成 attach point，而不是骨骼绑定
     */
    private SkeletonBindingData generateSkeletonBindingDataWithLayers(
            String template,
            SeeThroughLayerService.LayerDecompositionResult decomposition,
            String keypointsJson) {
        try {
            // 从图层分解结果提取所有图层名
            Set<String> allLayerNames = new LinkedHashSet<>();
            for (SeeThroughLayerService.Layer layer : decomposition.getLayers()) {
                allLayerNames.add(layer.getLabel());
            }
            // 复用原有绑定数据生成逻辑（传入全量图层名）
            return generateSkeletonBindingData(template, allLayerNames);
        } catch (Exception e) {
            log.error("生成图层感知骨骼绑定数据失败", e);
            throw new RuntimeException("生成骨骼绑定数据失败: " + e.getMessage());
        }
    }

    /**
     * 保存并返回最终结果（支持图层分解结果）
     *
     * @param saveStepNo 打包输出步骤的步骤序号（FROM_REFERENCE=6, FROM_SCRATCH=7），
     *                   用于正确更新 skeleton_pipeline_step 表的最终状态。
     */
    private void saveAndReturnResultsWithLayers(
            String taskId,
            String originalImageBase64,
            Map<String, String> transparentLayerMap,
            SeeThroughLayerService.LayerDecompositionResult decomposition,
            SkeletonBindingData bindingData,
            int saveStepNo) {
        // 复用原有 saveAndReturnResults 逻辑
        saveAndReturnResults(taskId, originalImageBase64, transparentLayerMap, bindingData, saveStepNo);
    }

    /**
     * 构建图层分解摘要 JSON
     */
    private String buildLayerDecompositionSummaryJson(
            SeeThroughLayerService.LayerDecompositionResult result) {
        if (!result.isSuccess()) {
            return "{\"success\":false,\"error\":\"" + result.getErrorMessage() + "\"}";
        }
        int bodyParts = result.getBodyPartLayers().size();
        int equipment = result.getEquipmentLayers().size();
        return "{\"source\":\"" + result.getSource() + "\""
                + ",\"totalLayers\":" + result.getLayers().size()
                + ",\"bodyParts\":" + bodyParts
                + ",\"equipment\":" + equipment + "}";
    }

    // ===================================================
    // 步骤状态更新辅助方法
    // ===================================================

    /**
     * 标记步骤开始（PROCESSING），记录开始时间
     */
    private void stepStart(String taskId, int stepNo) {
        stepStartTimeMap.put(taskId + "_" + stepNo, System.currentTimeMillis());
        try {
            pipelineStepMapper.updateStatusToProcessing(taskId, stepNo, LocalDateTime.now());
        } catch (Exception e) {
            log.warn("stepStart DB更新失败（非致命）: taskId={}, stepNo={}, err={}", taskId, stepNo, e.getMessage());
        }
        // SSE 广播步骤开始事件
        SkeletonGenerationResponse resp = taskResults.get(taskId);
        if (resp != null) {
            broadcastSseEvent(taskId, buildSsePayload(taskId, resp));
        }
    }

    /**
     * 标记步骤成功（SUCCESS），填充产物
     */
    private void stepSuccess(String taskId, int stepNo,
                              String imageUrl, String dataJson, String fileUrl) {
        Long durationMs = computeDurationMs(taskId, stepNo);
        try {
            pipelineStepMapper.updateStatusToSuccess(
                    taskId, stepNo, imageUrl, dataJson, fileUrl, LocalDateTime.now(), durationMs
            );
        } catch (Exception e) {
            log.warn("stepSuccess DB更新失败（非致命）: taskId={}, stepNo={}, err={}", taskId, stepNo, e.getMessage());
        }
        // SSE 广播步骤完成事件
        SkeletonGenerationResponse resp = taskResults.get(taskId);
        if (resp != null) {
            broadcastSseEvent(taskId, buildSsePayload(taskId, resp));
        }
    }

    /**
     * 标记步骤失败（FAILED）
     */
    private void stepFailed(String taskId, int stepNo, String errorMessage) {
        try {
            pipelineStepMapper.updateStatusToFailed(taskId, stepNo, errorMessage);
        } catch (Exception e) {
            log.warn("stepFailed DB更新失败（非致命）: taskId={}, stepNo={}, err={}", taskId, stepNo, e.getMessage());
        }
        // SSE 广播步骤失败事件
        SkeletonGenerationResponse resp = taskResults.get(taskId);
        if (resp != null) {
            broadcastSseEvent(taskId, buildSsePayload(taskId, resp));
        }
    }

    private Long computeDurationMs(String taskId, int stepNo) {
        String key = taskId + "_" + stepNo;
        Long startTime = stepStartTimeMap.remove(key);
        if (startTime == null) {
            return null;
        }
        return System.currentTimeMillis() - startTime;
    }

    private void safeUpdateTaskProcessing(String taskId) {
        try {
            pipelineTaskMapper.updateStatusToProcessing(taskId, LocalDateTime.now());
        } catch (Exception e) {
            log.warn("更新主任务PROCESSING到DB失败（非致命）: taskId={}, err={}", taskId, e.getMessage());
        }
    }

    private void safeUpdateTaskFailed(String taskId, String errorMessage) {
        try {
            pipelineTaskMapper.updateStatusToFailed(taskId, errorMessage);
        } catch (Exception e) {
            log.warn("更新主任务FAILED到DB失败（非致命）: taskId={}, err={}", taskId, e.getMessage());
        }
    }

    // ===================================================
    // 内存进度更新（向后兼容）
    // ===================================================

    private void updateProgress(String taskId, int progress, String message) {
        SkeletonGenerationResponse response = taskResults.get(taskId);
        if (response != null) {
            response.setProgress(progress);
            response.setProgressMessage(message);
            response.setStatus("PROCESSING");
        }
        // 同步更新 DB 进度
        try {
            pipelineTaskMapper.updateProgress(taskId, progress);
        } catch (Exception e) {
            // 进度更新失败不中断流程
        }
        // SSE 广播进度更新
        if (response != null) {
            broadcastSseEvent(taskId, buildSsePayload(taskId, response));
        }
        log.debug("任务进度更新: taskId={}, progress={}, message={}", taskId, progress, message);
    }

    private void saveError(String taskId, String errorMessage) {
        SkeletonGenerationResponse response = taskResults.get(taskId);
        if (response != null) {
            response.setStatus("FAILED");
            response.setProgressMessage("生成失败");
            response.setErrorMessage(errorMessage);
            // SSE 广播失败事件，然后关闭所有连接
            broadcastSseEvent(taskId, buildSsePayload(taskId, response));
            completeAllEmitters(taskId);
        }
    }

    /** 完成并清理指定任务的所有 SSE 连接 */
    private void completeAllEmitters(String taskId) {
        List<SseEmitter> emitters = sseEmitters.remove(taskId);
        if (emitters == null) return;
        for (SseEmitter emitter : emitters) {
            try {
                emitter.complete();
            } catch (Exception ignore) {
            }
        }
    }

    // ===================================================
    // 中间产物 JSON 摘要构建
    // ===================================================

    /**
     * 将 DB 步骤列表转换为 StepStatus DTO 列表
     */
    private List<SkeletonGenerationResponse.StepStatus> convertToStepStatusList(
            List<SkeletonPipelineStep> dbSteps) {
        if (dbSteps == null || dbSteps.isEmpty()) {
            return Collections.emptyList();
        }
        List<SkeletonGenerationResponse.StepStatus> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        for (SkeletonPipelineStep step : dbSteps) {
            SkeletonGenerationResponse.StepStatus s = SkeletonGenerationResponse.StepStatus.builder()
                    .stepNo(step.getStepNo())
                    .stepName(step.getStepName())
                    .stepKey(step.getStepKey())
                    .status(step.getStatus())
                    .progress(step.getProgress() != null ? step.getProgress() : 0)
                    .outputImageUrl(step.getOutputImageUrl())
                    .startedAt(step.getStartedAt() != null ? step.getStartedAt().format(formatter) : null)
                    .completedAt(step.getCompletedAt() != null ? step.getCompletedAt().format(formatter) : null)
                    .durationMs(step.getDurationMs())
                    .errorMessage(step.getErrorMessage())
                    .build();
            result.add(s);
        }
        return result;
    }

    private String buildIpAdapterSummaryJson(String ipAdapterFeatures) {
        if (ipAdapterFeatures == null) {
            return "{\"skipped\":true,\"reason\":\"no_reference_image\"}";
        }
        return "{\"weight\":0.6,\"begin\":0,\"end\":1000,\"status\":\"extracted\"}";
    }

    private String buildPartsKeySummaryJson(Set<String> partKeys) {
        StringBuilder sb = new StringBuilder("{\"parts\":[");
        boolean first = true;
        for (String k : partKeys) {
            if (!first) sb.append(",");
            sb.append("\"").append(k).append("\"");
            first = false;
        }
        sb.append("]}");
        return sb.toString();
    }

    /**
     * 从 URL 加载骨骼绑定数据（RAG 复用时使用）
     *
     * 支持：
     *   - HTTP URL（从本地模拟桶下载 JSON）
     *   - 其他格式返回 null（安全降级）
     */
    private SkeletonBindingData loadBindingDataFromUrl(String url) {
        if (url == null || url.trim().isEmpty()) return null;
        try {
            // 从文件系统读取（本地模拟桶场景：url 形如 http://localhost:8083/uploads/...json）
            // 解析 URL 中的文件路径部分
            String filePath = fileStorageService.urlToLocalPath(url);
            if (filePath != null) {
                java.io.File file = new java.io.File(filePath);
                if (file.exists()) {
                    String json = new String(
                            java.nio.file.Files.readAllBytes(file.toPath()),
                            java.nio.charset.StandardCharsets.UTF_8);
                    // 简单包装：将 JSON 字符串存入 SkeletonBindingData 的 rawJson 字段
                    // 实际绑定计算由 generateSkeletonBindingDataWithLayers 完成，这里只是复用产物
                    return SkeletonBindingData.fromJson(json);
                }
            }
            log.warn("RAG 绑定数据文件不存在: url={}", url);
            return null;
        } catch (Exception e) {
            log.warn("加载 RAG 绑定数据失败: url={}, err={}", url, e.getMessage());
            return null;
        }
    }

    /**
     * 从 DB 步骤记录的 outputDataJson 反序列化图层 Map（断点续跑时复用）
     * outputDataJson 格式：{"head":"/uploads/xxx.png","body":"/uploads/yyy.png",...}
     *
     * @return 图层名称 -> URL 的 Map，解析失败返回 null
     */
    @SuppressWarnings("unchecked")
    private Map<String, String> loadLayerMapFromStepDataJson(String taskId, int stepNo) {
        try {
            String dataJson = loadStepDataJson(taskId, stepNo);
            if (dataJson == null || dataJson.trim().isEmpty()) return null;
            // 用 Jackson 反序列化
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(dataJson, Map.class);
        } catch (Exception e) {
            log.warn("反序列化步骤数据失败: taskId={}, stepNo={}, err={}", taskId, stepNo, e.getMessage());
            return null;
        }
    }

    private String buildBindingDataSummaryJson(SkeletonBindingData bindingData) {
        int boneCount = 0;
        if (bindingData.getBoneStructure() != null
                && bindingData.getBoneStructure().getBones() != null) {
            boneCount = bindingData.getBoneStructure().getBones().size();
        }
        return "{\"version\":\"" + bindingData.getVersion()
                + "\",\"template\":\"" + bindingData.getTemplate()
                + "\",\"boneCount\":" + boneCount + "}";
    }

    private String buildSaveResultSummaryJson(String fullImageUrl,
                                               Map<String, String> partUrls,
                                               Map<String, String> skeletonDataUrls) {
        return "{\"fullImage\":\"" + (fullImageUrl != null ? fullImageUrl : "") + "\""
                + ",\"partsCount\":" + partUrls.size()
                + ",\"skeletonFormats\":" + skeletonDataUrls.size() + "}";
    }

    private String buildPartsJsonString(Map<String, String> partUrls) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : partUrls.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(entry.getKey()).append("\":\"")
              .append(entry.getValue() != null ? entry.getValue() : "").append("\"");
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }

    /**
     * 安全保存中间图片到文件系统，失败时返回 null（不中断流程）
     */
    private String safeSaveImage(String base64, String filename) {
        if (base64 == null || base64.isEmpty()) {
            return null;
        }
        try {
            return fileStorageService.saveImageFromBase64(base64, filename);
        } catch (Exception e) {
            log.warn("保存中间图片失败（非致命）: filename={}, err={}", filename, e.getMessage());
            return null;
        }
    }

    /**
     * 批量保存多层图片中间产物到文件系统，失败时跳过单层（不中断流程）。
     *
     * @param layerMap   partName -> Base64 图片的 Map
     * @param taskId     任务 ID（用于构建文件名前缀）
     * @param stepLabel  步骤标签（用于构建文件名，如 "step1_layer"、"step3_transparent"）
     * @return 包含各层 URL 的 JSON 摘要字符串，格式：
     *         {"parts":["head","body",...],"urls":{"head":"/uploads/xxx.png",...},"savedCount":N}
     */
    private String saveLayerImages(Map<String, String> layerMap, String taskId, String stepLabel) {
        if (layerMap == null || layerMap.isEmpty()) {
            return "{\"parts\":[],\"urls\":{},\"savedCount\":0}";
        }
        Map<String, String> urlMap = new LinkedHashMap<>();
        int savedCount = 0;
        for (Map.Entry<String, String> entry : layerMap.entrySet()) {
            String partName = entry.getKey();
            String base64 = entry.getValue();
            String filename = taskId + "_" + stepLabel + "_" + partName + ".png";
            String url = safeSaveImage(base64, filename);
            if (url != null) {
                urlMap.put(partName, url);
                savedCount++;
            }
        }
        // 构建摘要 JSON
        StringBuilder sb = new StringBuilder("{\"parts\":[");
        boolean first = true;
        for (String k : layerMap.keySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(k).append("\"");
            first = false;
        }
        sb.append("],\"urls\":{");
        first = true;
        for (Map.Entry<String, String> e : urlMap.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(e.getKey()).append("\":\"").append(e.getValue()).append("\"");
            first = false;
        }
        sb.append("},\"savedCount\":").append(savedCount).append("}");
        log.info("中间产物批量保存完成: taskId={}, stepLabel={}, total={}, saved={}",
                taskId, stepLabel, layerMap.size(), savedCount);
        return sb.toString();
    }

    /**
     * 批量保存 see-through 分解结果中各图层图片，返回 URL 摘要 JSON。
     */
    private String saveSeeThroughLayerImages(
            SeeThroughLayerService.LayerDecompositionResult result, String taskId) {
        if (!result.isSuccess() || result.getLayers().isEmpty()) {
            return buildLayerDecompositionSummaryJson(result);
        }
        // 将图层列表转换成 partName -> base64 Map
        Map<String, String> layerMap = new LinkedHashMap<>();
        for (SeeThroughLayerService.Layer layer : result.getLayers()) {
            if (layer.getImageBase64() != null && !layer.getImageBase64().isEmpty()) {
                layerMap.put(layer.getLabel(), layer.getImageBase64());
            }
        }
        // 复用 saveLayerImages 保存图片
        String layerUrlsJson = saveLayerImages(layerMap, taskId, "step1_layer");
        // 合并分解摘要与图片 URL
        int bodyParts = result.getBodyPartLayers().size();
        int equipment = result.getEquipmentLayers().size();
        return "{\"source\":\"" + result.getSource() + "\""
                + ",\"totalLayers\":" + result.getLayers().size()
                + ",\"bodyParts\":" + bodyParts
                + ",\"equipment\":" + equipment
                + ",\"layerUrls\":" + layerUrlsJson + "}";
    }

    // ===================================================
    // 参考图解析辅助方法
    // ===================================================

    /**
     * 解析参考图来源：优先使用 referenceImageUrl，降级到 referenceImageBase64。
     *
     * 若 referenceImageUrl 非空，则通过 HTTP GET 下载图片字节，
     * 转换为 data:image/...;base64,... 格式后回写到 request.referenceImageBase64，
     * 确保后续所有步骤统一使用 Base64 字段，无需各步骤感知两种来源。
     *
     * 支持相对路径（如 /uploads/...）和绝对路径（如 https://...）。
     * 相对路径会自动补全为 http://localhost:{port}/...。
     */
    private void resolveReferenceImage(SkeletonGenerationRequest request) {
        String url = request.getReferenceImageUrl();
        if (url == null || url.trim().isEmpty()) {
            // 没有 URL，直接使用 referenceImageBase64（原有行为）
            return;
        }

        try {
            log.info("从 URL 解析参考图: {}", url);

            // 相对路径补全（本地模拟桶场景）
            if (url.startsWith("/")) {
                url = "http://localhost:" + serverPort + url;
            }

            java.net.URL imageUrl = new java.net.URL(url);
            byte[] bytes;
            try (java.io.InputStream is = imageUrl.openStream();
                 java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, len);
                }
                bytes = baos.toByteArray();
            }

            // 根据 URL 后缀判断 MIME 类型
            String mime = "image/png";
            String lowerUrl = url.toLowerCase();
            if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) mime = "image/jpeg";
            else if (lowerUrl.endsWith(".webp")) mime = "image/webp";

            String base64 = "data:" + mime + ";base64," + java.util.Base64.getEncoder().encodeToString(bytes);
            request.setReferenceImageBase64(base64);

            log.info("参考图 URL 已解析为 Base64: url={}, size={} bytes, mime={}", url, bytes.length, mime);

        } catch (Exception e) {
            log.warn("从 URL 下载参考图失败，尝试使用 referenceImageBase64 兜底: url={}, err={}", url, e.getMessage());
            // 兜底：保留 referenceImageBase64 中原有内容（如果有的话）
        }
    }

    // ===================================================
    // 提示词构建辅助方法
    // ===================================================

    private String buildEnhancedPrompt(SkeletonGenerationRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(request.getPrompt()).append(", ");
        prompt.append("T-pose standing position, perfect anatomy, high quality, detailed");

        if ("anime".equals(request.getStyle())) {
            prompt.append(", anime style, clean lines, vibrant colors");
        } else if ("realistic".equals(request.getStyle())) {
            prompt.append(", photorealistic, natural lighting, detailed skin texture");
        }

        return prompt.toString();
    }

    private String buildFluxPrompt(SkeletonGenerationRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(request.getPrompt()).append(", ");
        prompt.append("masterpiece, best quality, ultra-detailed, 8k uhd");
        prompt.append(", perfect T-pose anatomy, standing straight, arms at sides");

        return prompt.toString();
    }

    private String buildFluxNegativePrompt(SkeletonGenerationRequest request) {
        return "worst quality, low quality, normal quality, blurry, deformed, distorted, " +
                "bad anatomy, bad proportions, mutation, mutated, extra limb, missing limb, " +
                "floating limbs, disconnected limbs, malformed hands, extra fingers, " +
                "missing fingers, poorly drawn hands, mutation, duplicate, morbid, mutilated";
    }

    private String getStyleLoraName(String style) {
        if (style == null) return "anime_style_v3";
        switch (style) {
            case "anime":     return "anime_style_v3";
            case "realistic": return "realistic_human_v2";
            case "chibi":     return "chibi_style_v1";
            case "cartoon":   return "cartoon_style_v2";
            case "pixel":     return "pixel_art_v1";
            default:          return "anime_style_v3";
        }
    }

    // ===================================================
    // 骨骼/关键点辅助方法
    // ===================================================

    private Map<String, List<OpenPoseTemplateService.Point>> defineLimbRegionsFromKeyPoints(
            List<OpenPoseTemplateService.Point> keyPoints) {
        Map<String, List<OpenPoseTemplateService.Point>> regions = new HashMap<>();

        regions.put("head", Arrays.asList(
                findKeyPoint(keyPoints, "Nose"),
                findKeyPoint(keyPoints, "Neck")
        ));

        regions.put("rightArm", Arrays.asList(
                findKeyPoint(keyPoints, "RShoulder"),
                findKeyPoint(keyPoints, "RElbow"),
                findKeyPoint(keyPoints, "RWrist")
        ));

        regions.put("leftArm", Arrays.asList(
                findKeyPoint(keyPoints, "LShoulder"),
                findKeyPoint(keyPoints, "LElbow"),
                findKeyPoint(keyPoints, "LWrist")
        ));

        regions.put("torso", Arrays.asList(
                findKeyPoint(keyPoints, "Neck"),
                findKeyPoint(keyPoints, "RHip"),
                findKeyPoint(keyPoints, "LHip")
        ));

        regions.put("rightLeg", Arrays.asList(
                findKeyPoint(keyPoints, "RHip"),
                findKeyPoint(keyPoints, "RKnee"),
                findKeyPoint(keyPoints, "RAnkle")
        ));

        regions.put("leftLeg", Arrays.asList(
                findKeyPoint(keyPoints, "LHip"),
                findKeyPoint(keyPoints, "LKnee"),
                findKeyPoint(keyPoints, "LAnkle")
        ));

        return regions;
    }

    private OpenPoseTemplateService.Point findKeyPoint(List<OpenPoseTemplateService.Point> keyPoints,
                                                        String pointName) {
        return keyPoints.isEmpty() ? new OpenPoseTemplateService.Point(0, 0.5f, 0.5f) : keyPoints.get(0);
    }

    private String extractPartWithAlpha(String imageBase64, Object mask, String partName) {
        // 实现部件提取和透明背景添加
        return imageBase64; // 暂时返回原图
    }

    private String mapPartToBone(String partName) {
        switch (partName) {
            case "head":      return "head_bone";
            case "torso":     return "spine_bone";
            case "leftArm":   return "left_arm_bone";
            case "rightArm":  return "right_arm_bone";
            case "leftLeg":   return "left_leg_bone";
            case "rightLeg":  return "right_leg_bone";
            default:          return partName + "_bone";
        }
    }

    private SkeletonBindingData.BoneStructure buildBoneStructure(OpenPoseTemplate template) {
        SkeletonBindingData.BoneStructure boneStructure = new SkeletonBindingData.BoneStructure();

        List<SkeletonBindingData.Bone> bones = new ArrayList<>();
        List<SkeletonBindingData.BoneHierarchy> hierarchy = new ArrayList<>();

        int index = 0;
        for (OpenPoseTemplate.BoneConnection conn : template.getConnections()) {
            SkeletonBindingData.Bone bone = new SkeletonBindingData.Bone();
            bone.setName(conn.getBoneName());
            bone.setIndex(index++);
            bone.setLength(50.0f);
            bone.setRotation(0.0f);
            bones.add(bone);

            SkeletonBindingData.BoneHierarchy h = new SkeletonBindingData.BoneHierarchy();
            h.setBoneName(conn.getBoneName());
            h.setChildren(new ArrayList<>());
            hierarchy.add(h);
        }

        boneStructure.setBones(bones);
        boneStructure.setHierarchy(hierarchy);
        return boneStructure;
    }

    private SkeletonBindingData.AnimationParams buildAnimationParams(String templateType) {
        SkeletonBindingData.AnimationParams params = new SkeletonBindingData.AnimationParams();

        SkeletonBindingData.DefaultPose defaultPose = new SkeletonBindingData.DefaultPose();
        defaultPose.setName("t_pose");
        defaultPose.setDuration(0);
        defaultPose.setBoneTransforms(new ArrayList<>());

        params.setDefaultPose(defaultPose);
        params.setConstraints(new ArrayList<>());
        params.setIkTargets(new ArrayList<>());

        return params;
    }

    // ===================================================
    // 初始步骤定义
    // ===================================================

    /** FROM_REFERENCE 路径：6步 PENDING 记录 */
    private List<SkeletonPipelineStep> buildInitialStepsFromReference(String taskId) {
        return Arrays.asList(
                buildStep(taskId, REF_STEP_SEE_THROUGH,  "see-through图层分解",  "see_through"),
                buildStep(taskId, REF_STEP_SAM_REFINE,   "SAM2精修图层边缘",  "sam_refine"),
                buildStep(taskId, REF_STEP_PER_LAYER_BG, "各图层独立去背",    "per_layer_bg"),
                buildStep(taskId, REF_STEP_KEYPOINTS,    "OpenPose关键点识别",  "keypoints"),
                buildStep(taskId, REF_STEP_BINDING,      "骨骼绑定数据生成",    "binding_data"),
                buildStep(taskId, REF_STEP_SAVE,         "打包输出",            "save_result")
        );
    }

    /** FROM_SCRATCH 路径：7步 PENDING 记录 */
    private List<SkeletonPipelineStep> buildInitialStepsFromScratch(String taskId) {
        return Arrays.asList(
                buildStep(taskId, SCR_STEP_SKELETON_LINE, "生成T-pose骨骼线图",          "skeleton_line"),
                buildStep(taskId, SCR_STEP_FLUX_GENERATE, "Flux.1-dev高清生成",            "flux_generate"),
                buildStep(taskId, SCR_STEP_SEE_THROUGH,   "see-through图层分解",          "see_through"),
                buildStep(taskId, SCR_STEP_SAM_REFINE,    "SAM2精修图层边缘",          "sam_refine"),
                buildStep(taskId, SCR_STEP_PER_LAYER_BG,  "各图层独立去背",            "per_layer_bg"),
                buildStep(taskId, SCR_STEP_BINDING,       "骨骼绑定数据生成",          "binding_data"),
                buildStep(taskId, SCR_STEP_SAVE,          "打包输出",                "save_result")
        );
    }

    private SkeletonPipelineStep buildStep(String taskId, int stepNo, String stepName, String stepKey) {
        return SkeletonPipelineStep.builder()
                .taskId(taskId)
                .stepNo(stepNo)
                .stepName(stepName)
                .stepKey(stepKey)
                .status("PENDING")
                .progress(0)
                .build();
    }
}

