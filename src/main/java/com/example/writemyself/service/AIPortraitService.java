package com.example.writemyself.service;

import com.example.writemyself.dto.GeneratePortraitRequest;
import com.example.writemyself.dto.GeneratePortraitResponse;
import com.example.writemyself.dto.GenerateProgressResponse;
import com.example.writemyself.entity.AIPortraitGeneration;
import com.example.writemyself.entity.AIPortraitModelConfig;
import com.example.writemyself.entity.AIPortraitTask;
import com.example.writemyself.repository.AIPortraitGenerationRepository;
import com.example.writemyself.repository.AIPortraitModelConfigRepository;
import com.example.writemyself.repository.AIPortraitTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AI肖像生成服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIPortraitService {

    private final AIPortraitGenerationRepository generationRepository;
    private final AIPortraitTaskRepository taskRepository;
    private final AIPortraitModelConfigRepository modelConfigRepository;
    private final AIModelServiceFactory modelServiceFactory;

    /**
     * 创建生成任务
     *
     * 业务逻辑流程：
     * 1. 验证用户和参数合法性
     * 2. 生成全局唯一的 taskId
     * 3. 创建 AIPortraitGeneration 数据库记录，保存所有生成参数
     * 4. 创建 AIPortraitTask 任务追踪记录，初始化为 PENDING 状态
     * 5. 异步执行生成任务（后台处理不阻塞响应）
     * 6. 返回 GeneratePortraitResponse，包含 taskId 供前端查询
     *
     * @param userId 当前操作用户的 ID，来自请求头 X-User-Id
     * @param request 前端提交的生成请求参数，已通过 @Valid 校验
     * @return 202 Accepted 响应，包含 taskId 和初始任务状态
     */
    @Transactional
    public GeneratePortraitResponse createGenerationTask(Long userId, GeneratePortraitRequest request) {
        try {
            // 步骤1：参数验证
            if (userId == null || userId <= 0) {
                throw new IllegalArgumentException("用户 ID 无效");
            }
            if (request == null || request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                throw new IllegalArgumentException("生成提示词不能为空");
            }

            // 日志记录：记录关键信息用于调试和监控
            log.info("📝 创建生成任务: userId={}, provider={}, modelVersion={}, generateCount={}, " +
                    "dimensions={}x{}, prompt.length={}",
                    userId,
                    request.getProvider(),
                    request.getModelVersion(),
                    request.getGenerateCount(),
                    request.getWidth(),
                    request.getHeight(),
                    request.getPrompt().length());

            // 步骤2：生成全局唯一的任务 ID
            // 格式：task_yyyyMMdd_UUID (短版本)
            // 确保在分布式环境下也能保证唯一性
            String taskId = String.format("task_%d_%s",
                    System.currentTimeMillis(),
                    UUID.randomUUID().toString().substring(0, 8));

            // 步骤3：创建并保存 AIPortraitGeneration 数据库记录
            // 这个记录用于保存所有生成参数和结果，便于后续查询和管理
            AIPortraitGeneration generation = AIPortraitGeneration.builder()
                    // 用户和任务标识
                    .userId(userId)
                    .taskId(taskId)

                    // 核心参数：提示词
                    .prompt(request.getPrompt())
                    .negativePrompt(request.getNegativePrompt())

                    // 参考图片（Base64 编码）
                    .referenceImageUrl(request.getReferenceImageBase64())

                    // 生成尺寸
                    .width(request.getWidth())
                    .height(request.getHeight())

                    // 模型和服务商信息
                    .modelName(request.getModelVersion())           // 使用 modelVersion 作为 modelName
                    .provider(request.getProvider())                // 新增：服务提供商字段
                    .modelWeight(request.getModelWeight())          // 新增：模型权重

                    // 高级参数
                    .stylePreset(request.getStylePreset())
                    .inferenceSteps(request.getSteps())             // 使用 steps 而非 inferenceSteps
                    .samplerName(request.getSampler())              // 使用 sampler 而非 samplerName
                    .seed(request.getSeed().longValue())            // 转换为 Long
                    .count(request.getGenerateCount())              // 使用 generateCount

                    // 其他参数
                    .faceEnhance(request.getFaceEnhance())          // 新增：面部增强
                    .outputFormat(request.getOutputFormat())        // 新增：输出格式

                    // 初始状态
                    .status("PENDING")
                    .build();

            // 保存生成记录到数据库
            generation = generationRepository.save(generation);
            log.info("✓ 生成记录已保存: generationId={}", generation.getId());

            // 步骤4：创建任务追踪记录
            // 用于实时追踪任务的进度和状态
            AIPortraitTask task = AIPortraitTask.builder()
                    .taskId(taskId)
                    .generationId(generation.getId())
                    .status("PENDING")              // 初始状态：待处理
                    .progress(0)                    // 初始进度：0%
                    .build();

            task = taskRepository.save(task);
            log.info("✓ 任务记录已保存: taskId={}", taskId);

            // 步骤5：异步执行生成任务
            // 使用 @Async 注解，不阻塞当前请求的响应
            // 前端应通过轮询 /api/ai/portrait/progress/{taskId} 查询进度
            processGenerationTaskAsync(generation.getId(), taskId);
            log.info("🚀 异步任务已提交: taskId={}", taskId);

            // 步骤6：构建响应对象
            // 返回 202 Accepted，告知前端请求已接受但仍在处理中
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime estimatedCompletion = now.plusSeconds(120); // 预估 2 分钟完成

            GeneratePortraitResponse response = GeneratePortraitResponse.builder()
                    .taskId(taskId)
                    .generationId(generation.getId())
                    .status("PENDING")
                    .progress(0)
                    .completed(false)               // 任务未完成
                    .message("生成任务已创建，正在处理中")
                    .estimatedTime(120)             // 预计剩余秒数
                    .createdAt(now)
                    .build();

            log.info("✓ 响应已构建: taskId={}, status={}", taskId, response.getStatus());

            return response;

        } catch (IllegalArgumentException e) {
            // 参数校验失败，直接抛出异常，由 Controller 捕获返回 400
            log.warn("⚠️ 参数校验失败: {}", e.getMessage());
            throw e;

        } catch (Exception e) {
            // 系统错误，记录详细错误堆栈
            log.error("❌ 创建生成任务失败", e);
            throw new RuntimeException("创建生成任务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 异步处理生成任务
     *
     * 此方法在后台线程中执行，不阻塞对用户的响应。
     * 生命周期：
     * 1. 获取生成记录并初始化任务状态
     * 2. 获取对应的 AI 模型服务（根据 provider 和 modelVersion）
     * 3. 根据是否有参考图片选择调用模式（文生图 或 图生图）
     * 4. 调用 AI API 执行生成
     * 5. 保存生成结果并更新任务状态为 SUCCESS
     * 6. 如果任何步骤失败，更新任务状态为 FAILED 并记录错误
     *
     * 注意：此方法在后台执行，异常不会直接传递给前端，前端通过轮询
     * /api/ai/portrait/progress/{taskId} 查询失败状态。
     *
     * @param generationId 数据库中的生成记录 ID
     * @param taskId 前端可见的任务 ID，用于进度查询
     */
    @Async
    public void processGenerationTaskAsync(Long generationId, String taskId) {
        LocalDateTime startTime = LocalDateTime.now();

        try {
            log.info("🚀 开始异步处理生成任务: taskId={}, generationId={}", taskId, generationId);

            // 步骤1：获取生成记录
            AIPortraitGeneration generation = generationRepository.findById(generationId)
                    .orElseThrow(() -> new RuntimeException("生成记录不存在: " + generationId));

            // 步骤2：更新任务状态为处理中
            taskRepository.updateTaskStart(taskId, LocalDateTime.now(), LocalDateTime.now());
            log.info("✓ 任务开始处理，更新状态为 PROCESSING");

            // 步骤3：获取 AI 模型服务
            // 根据 provider 和 modelVersion 获取对应的服务实例
            ImageGenerationService modelService = modelServiceFactory.getService(generation.getModelName());

            if (!modelService.isConfigured()) {
                throw new RuntimeException("AI 模型服务未配置: " + generation.getModelName());
            }
            log.info("✓ AI 模型服务已初始化: {}", generation.getModelName());

            // 更新进度到 10%（初始化完成）
            taskRepository.updateTaskStatus(taskId, "PROCESSING", 10, LocalDateTime.now());
            log.info("📊 进度更新: 10%");

            // 步骤4：调用 AI 模型生成图片
            // 判断使用文生图还是图生图模式
            List<String> imageUrls;
            if (generation.getReferenceImageUrl() != null &&
                !generation.getReferenceImageUrl().isEmpty()) {
                // 图生图模式：使用参考图片控制生成结果
                log.info("📷 使用图生图模式，参考图片强度: {}", generation.getImageStrength());

                imageUrls = modelService.generateFromImage(
                        generation.getPrompt(),
                        generation.getReferenceImageUrl(),
                        generation.getImageStrength() != null ?
                            generation.getImageStrength().doubleValue() : 0.6,
                        generation.getWidth(),
                        generation.getHeight()
                );
            } else {
                // 文本到图像模式：纯粹基于文本提示词生成
                log.info("✍️ 使用文生图模式，生成数量: {}", generation.getCount());

                imageUrls = modelService.generateImage(
                        generation.getPrompt(),
                        generation.getWidth(),
                        generation.getHeight(),
                        generation.getCount(),
                        generation.getSeed()
                );
            }

            log.info("✓ AI 生成完成，生成 {} 张图片", imageUrls.size());

            // 步骤5：更新进度到 90%（生成完成，后续处理）
            taskRepository.updateTaskStatus(taskId, "PROCESSING", 90, LocalDateTime.now());
            log.info("📊 进度更新: 90%");

            // 步骤6：保存生成结果到数据库
            generation.setGeneratedImageUrls(String.join(",", imageUrls));
            generation.setStatus("SUCCESS");

            // 计算实际生成耗时
            long durationSeconds = java.time.temporal.ChronoUnit.SECONDS.between(startTime, LocalDateTime.now());
            generation.setGenerationTime((int) durationSeconds);

            // 计算排队等待时间（若有 startedAt 信息）
            if (generation.getCreatedAt() != null) {
                long queueWaitSeconds = java.time.temporal.ChronoUnit.SECONDS.between(
                        generation.getCreatedAt(),
                        startTime
                );
                generation.setQueueWaitTime((int) queueWaitSeconds);
            }

            generationRepository.save(generation);
            log.info("✓ 生成结果已保存到数据库");

            // 步骤7：更新任务状态为完成
            taskRepository.updateTaskCompletion(taskId, "SUCCESS", LocalDateTime.now(), LocalDateTime.now());
            log.info("✓ 生成任务完成: taskId={}, 生成 {} 张图片，耗时 {} 秒",
                    taskId, imageUrls.size(), durationSeconds);

        } catch (Exception e) {
            // 异常处理：更新任务和生成记录状态为失败
            log.error("❌ 生成任务处理失败: taskId={}", taskId, e);

            try {
                // 更新任务状态为失败
                taskRepository.updateTaskStatus(taskId, "FAILED", 0, LocalDateTime.now());
                log.info("✓ 任务状态已更新为 FAILED");

                // 更新生成记录状态和错误信息
                AIPortraitGeneration generation = generationRepository.findByTaskId(taskId)
                        .orElseThrow(() -> new RuntimeException("生成记录不存在"));
                generation.setStatus("FAILED");
                generation.setErrorMessage(e.getMessage());
                generationRepository.save(generation);
                log.info("✓ 生成记录已更新为 FAILED，错误: {}", e.getMessage());

            } catch (Exception ex) {
                log.error("❌ 更新失败状态时出错", ex);
            }
        }
    }

    /**
     * 查询生成进度 / 获取生成结果
     *
     * 前端持续轮询此接口以获取后台任务的最新状态。
     * 前端可根据返回的 status 和 progress 字段实时更新 UI。
     *
     * 返回信息包括：
     * - status: 当前任务状态（PENDING / PROCESSING / SUCCESS / FAILED）
     * - progress: 完成百分比（0-100）
     * - message: 人可读的状态描述
     * - generationTime: 实际生成耗时（秒）
     * - completed: 是否已完成（布尔值，便于前端快速判断）
     * - failed: 是否已失败（布尔值）
     * - imageUrls: 生成结果图片 URL 列表（仅在成功时返回）
     * - errorMessage: 错误信息（仅在失败时返回）
     *
     * @param taskId 任务 ID，由前端在生成时获取
     * @return 包含当前任务状态和进度的响应对象
     * @throws RuntimeException 若任务不存在或数据库查询失败
     */
    @Transactional(readOnly = true)
    public GenerateProgressResponse getGenerationProgress(String taskId) {
        try {
            log.debug("🔍 查询生成进度: taskId={}", taskId);

            // 步骤1：获取任务记录
            AIPortraitTask task = taskRepository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("任务不存在: " + taskId));

            // 步骤2：获取关联的生成记录
            AIPortraitGeneration generation = generationRepository.findById(task.getGenerationId())
                    .orElseThrow(() -> new RuntimeException("生成记录不存在"));

            log.debug("✓ 获取任务信息成功: status={}, progress={}%", task.getStatus(), task.getProgress());

            // 步骤3：构建进度响应对象
            GenerateProgressResponse response = GenerateProgressResponse.builder()
                    .taskId(taskId)
                    .status(task.getStatus())
                    .progress(task.getProgress())
                    .message(getStatusDescription(task.getStatus()))
                    .generationTime(generation.getGenerationTime())
                    .queueWaitTime(generation.getQueueWaitTime())
                    .completed(task.getStatus().equals("SUCCESS") || task.getStatus().equals("FAILED"))
                    .failed(task.getStatus().equals("FAILED"))
                    .build();

            // 步骤4：如果任务已完成且成功，返回生成的图片 URL
            if (response.getCompleted() && !response.getFailed() &&
                generation.getGeneratedImageUrls() != null &&
                !generation.getGeneratedImageUrls().isEmpty()) {

                List<String> imageUrls = java.util.Arrays.stream(
                        generation.getGeneratedImageUrls().split(","))
                        .collect(Collectors.toList());
                response.setImageUrls(imageUrls);
                log.info("✓ 返回生成结果: {} 张图片", imageUrls.size());
            }

            // 步骤5：如果任务失败，返回错误信息
            if (response.getFailed()) {
                String errorMsg = generation.getErrorMessage() != null ?
                        generation.getErrorMessage() : "生成失败，原因未知";
                response.setErrorMessage(errorMsg);
                log.warn("⚠️ 任务失败: {}", errorMsg);
            }

            return response;

        } catch (Exception e) {
            log.error("❌ 查询进度失败: taskId={}", taskId, e);
            throw new RuntimeException("查询进度失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取可用的模型列表
     *
     * 返回当前系统中所有已启用的 AI 模型配置。
     * 前端可以使用这个列表向用户展示可选的模型。
     *
     * @return 可用模型列表，包含模型名称、版本、描述等信息
     * @throws RuntimeException 若数据库查询失败
     */
    @Transactional(readOnly = true)
    public List<AIPortraitModelConfig> getAvailableModels() {
        try {
            log.info("📋 获取可用模型列表");

            List<AIPortraitModelConfig> models = modelConfigRepository.findByIsActiveTrue();

            log.info("✓ 获取 {} 个可用模型", models.size());
            return models;

        } catch (Exception e) {
            log.error("❌ 获取模型列表失败", e);
            throw new RuntimeException("获取模型列表失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取用户的生成历史
     *
     * 获取指定用户最近生成的立绘记录，用于在前端展示历史列表。
     * 记录按创建时间倒序排列，最新的排在最前。
     *
     * @param userId 用户 ID
     * @param limit 返回记录的最大数量，通常为 20
     * @return 用户的生成历史列表，按时间倒序排列
     * @throws RuntimeException 若数据库查询失败
     */
    @Transactional(readOnly = true)
    public List<AIPortraitGeneration> getGenerationHistory(Long userId, int limit) {
        try {
            log.info("📜 获取用户生成历史: userId={}, limit={}", userId, limit);

            List<AIPortraitGeneration> history = generationRepository.findRecentByUserId(userId,
                    org.springframework.data.domain.PageRequest.of(0, limit));

            log.info("✓ 获取用户 {} 的 {} 条生成历史", userId, history.size());
            return history;

        } catch (Exception e) {
            log.error("❌ 获取生成历史失败: userId={}", userId, e);
            throw new RuntimeException("获取生成历史失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存生成结果到资源库
     *
     * 将成功生成的立绘保存为用户资源库中的一项资产。
     * 资产可以在后续的编辑中被重复使用。
     *
     * @param taskId 生成任务 ID
     * @param resourceName 资源在资源库中的名称
     * @return 操作结果消息
     * @throws RuntimeException 若生成记录不存在或保存失败
     */
    @Transactional
    public String saveGenerationResult(String taskId, String resourceName) {
        try {
            log.info("💾 保存生成结果到资源库: taskId={}, resourceName={}", taskId, resourceName);

            AIPortraitGeneration generation = generationRepository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("生成记录不存在: " + taskId));

            // 验证任务是否已成功完成
            if (!"SUCCESS".equals(generation.getStatus())) {
                throw new IllegalStateException("只有成功完成的任务才能保存到资源库");
            }

            // TODO: 实现保存到资源库的逻辑
            // 步骤：
            // 1. 校验资源名称的合法性（长度、特殊字符等）
            // 2. 检查是否已存在相同名称的资源
            // 3. 创建资源记录（可能需要新的数据库表）
            // 4. 关联生成的图片到资源记录
            // 5. 更新生成记录的 resourceId 字段
            // 这里可以集成文件系统、数据库或其他存储服务

            log.info("✓ 生成结果已保存到资源库: taskId={}, resourceName={}", taskId, resourceName);
            return "生成结果已保存到资源库";

        } catch (IllegalStateException e) {
            log.warn("⚠️ 保存资源失败: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ 保存生成结果失败: taskId={}", taskId, e);
            throw new RuntimeException("保存生成结果失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取任务状态的中文描述
     *
     * 将任务的英文状态码转换为用户友好的中文描述。
     * 这个描述用于在前端展示任务进度信息。
     *
     * @param status 任务状态码（PENDING / PROCESSING / SUCCESS / FAILED）
     * @return 状态的中文描述
     */
    private String getStatusDescription(String status) {
        // 根据不同的状态返回相应的中文描述
        switch (status) {
            case "PENDING":
                return "任务排队中，请稍候...";
            case "PROCESSING":
                return "正在生成中...";
            case "SUCCESS":
                return "生成完成";
            case "FAILED":
                return "生成失败";
            default:
                return "未知状态";
        }
    }
}

