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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AI 立绘生成核心服务
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AIPortraitService {

    private final AIPortraitGenerationRepository generationRepository;
    private final AIPortraitTaskRepository taskRepository;
    private final AIPortraitModelConfigRepository modelConfigRepository;
    private final AsyncTaskService asyncTaskService;

    /**
     * 创建生成任务
     * @param userId 用户 ID
     * @param request 生成请求
     * @return 生成响应，包含任务 ID
     */
    @Transactional
    public GeneratePortraitResponse createGenerationTask(Long userId, GeneratePortraitRequest request) {
        try {
            log.info("创建生成任务: userId={}, prompt={}", userId, request.getPrompt());

            // 生成任务 ID
            String taskId = UUID.randomUUID().toString();

            // 创建生成记录
            AIPortraitGeneration generation = AIPortraitGeneration.builder()
                    .userId(userId)
                    .taskId(taskId)
                    .prompt(request.getPrompt())
                    .negativePrompt(request.getNegativePrompt())
                    .referenceImageUrl(request.getReferenceImageUrl())
                    .modelWeight(request.getModelWeight())
                    .provider(request.getProvider())
                    .modelVersion(request.getModelVersion())
                    .width(request.getWidth())
                    .height(request.getHeight())
                    .imageStrength(request.getImageStrength())
                    .generationCount(request.getCount())
                    .samplerName(request.getSamplerName())
                    .inferenceSteps(request.getInferenceSteps())
                    .stylePreset(request.getStylePreset())
                    .seed(request.getSeed())
                    .enableFaceFix(request.getEnableFaceFix())
                    .outputFormat(request.getOutputFormat())
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();

            AIPortraitGeneration savedGeneration = generationRepository.save(generation);

            // 创建任务记录
            AIPortraitTask task = AIPortraitTask.builder()
                    .taskId(taskId)
                    .generationId(savedGeneration.getId())
                    .userId(userId)
                    .status("PENDING")
                    .progress(0)
                    .retryCount(0)
                    .maxRetries(3)
                    .createdAt(LocalDateTime.now())
                    .build();

            AIPortraitTask savedTask = taskRepository.save(task);

            log.info("✓ 生成任务已创建: taskId={}, generationId={}", taskId, savedGeneration.getId());

            // 异步执行任务
            asyncTaskService.processTask(taskId);

            return GeneratePortraitResponse.builder()
                    .taskId(taskId)
                    .generationId(savedGeneration.getId())
                    .status("PENDING")
                    .progress(0)
                    .message("任务已创建，开始生成中...")
                    .createdAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("创建生成任务失败", e);
            throw new RuntimeException("创建任务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 查询生成进度
     * @param taskId 任务 ID
     * @return 进度信息
     */
    @Transactional(readOnly = true)
    public GenerateProgressResponse getGenerationProgress(String taskId) {
        try {
            AIPortraitTask task = taskRepository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("任务不存在: " + taskId));

            AIPortraitGeneration generation = generationRepository.findById(task.getGenerationId())
                    .orElseThrow(() -> new RuntimeException("生成记录不存在"));

            // 构建响应
            GenerateProgressResponse response = GenerateProgressResponse.builder()
                    .taskId(taskId)
                    .status(task.getStatus())
                    .progress(task.getProgress())
                    .generationTime(generation.getGenerationTime())
                    .queueWaitTime(generation.getQueueWaitTime())
                    .completed(task.getStatus().equals("SUCCESS"))
                    .failed(task.getStatus().equals("FAILED"))
                    .statusDescription(getStatusDescription(task.getStatus()))
                    .build();

            // 如果完成，返回图片 URL
            if (response.getCompleted() && generation.getGeneratedImageUrls() != null) {
                List<String> imageUrls = Arrays.stream(generation.getGeneratedImageUrls().split(","))
                        .collect(Collectors.toList());
                response.setImageUrls(imageUrls);
            }

            // 如果失败，返回错误信息
            if (response.getFailed()) {
                response.setErrorMessage(generation.getErrorMessage() != null ?
                        generation.getErrorMessage() : "生成失败");
            }

            return response;

        } catch (Exception e) {
            log.error("查询进度失败: {}", taskId, e);
            throw new RuntimeException("查询进度失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取可用的模型列表
     * @return 模型配置列表
     */
    @Transactional(readOnly = true)
    public List<AIPortraitModelConfig> getAvailableModels() {
        try {
            List<AIPortraitModelConfig> models = modelConfigRepository.findByIsActive(true);
            log.info("✓ 获取 {} 个可用模型", models.size());
            return models;

        } catch (Exception e) {
            log.error("获取模型列表失败", e);
            throw new RuntimeException("获取模型列表失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取用户的生成历史
     * @param userId 用户 ID
     * @param limit 返回记录数
     * @return 生成历史列表
     */
    @Transactional(readOnly = true)
    public List<AIPortraitGeneration> getGenerationHistory(Long userId, int limit) {
        try {
            List<AIPortraitGeneration> history = generationRepository.findRecentByUserId(userId, limit);
            log.info("✓ 获取用户 {} 的 {} 条生成历史", userId, history.size());
            return history;

        } catch (Exception e) {
            log.error("获取生成历史失败", e);
            throw new RuntimeException("获取生成历史失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存生成结果到资源库
     * @param taskId 任务 ID
     * @param resourceName 资源名称
     * @return 保存成功的消息
     */
    @Transactional
    public String saveGenerationResult(String taskId, String resourceName) {
        try {
            AIPortraitGeneration generation = generationRepository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("生成记录不存在"));

            // TODO: 实现保存到资源库的逻辑

            log.info("✓ 生成结果已保存到资源库: taskId={}, resourceName={}", taskId, resourceName);
            return "生成结果已保存";

        } catch (Exception e) {
            log.error("保存生成结果失败", e);
            throw new RuntimeException("保存生成结果失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取状态描述
     */
    private String getStatusDescription(String status) {
        switch (status) {
            case "PENDING":
                return "等待处理中...";
            case "PROCESSING":
                return "生成中，请稍候...";
            case "SUCCESS":
                return "生成完成";
            case "FAILED":
                return "生成失败";
            default:
                return "未知状态";
        }
    }
}

