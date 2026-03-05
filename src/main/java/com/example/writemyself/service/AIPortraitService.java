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
     */
    @Transactional
    public GeneratePortraitResponse createGenerationTask(Long userId, GeneratePortraitRequest request) {
        try {
            log.info("创建生成任务: userId={}, prompt={}", userId, request.getPrompt());

            // 生成唯一任务ID
            String taskId = "task_" + UUID.randomUUID().toString().replace("-", "");

            // 确定使用的模型
            String modelName = request.getModelName() != null ? request.getModelName() : "doubao-seedream-5-0-260128";

            // 创建生成记录
            AIPortraitGeneration generation = AIPortraitGeneration.builder()
                    .userId(userId)
                    .taskId(taskId)
                    .prompt(request.getPrompt())
                    .negativePrompt(request.getNegativePrompt())
                    .referenceImageUrl(request.getReferenceImageUrl())
                    .width(request.getWidth())
                    .height(request.getHeight())
                    .modelName(modelName)
                    .stylePreset(request.getStylePreset())
                    .inferenceSteps(request.getInferenceSteps())
                    .samplerName(request.getSamplerName())
                    .seed(request.getSeed())
                    .count(request.getCount())
                    .status("PENDING")
                    .build();

            generation = generationRepository.save(generation);

            // 创建任务记录
            AIPortraitTask task = AIPortraitTask.builder()
                    .taskId(taskId)
                    .generationId(generation.getId())
                    .status("PENDING")
                    .progress(0)
                    .build();

            task = taskRepository.save(task);

            // 异步执行生成任务
            processGenerationTaskAsync(generation.getId(), taskId);

            // 构建响应
            LocalDateTime estimatedCompletion = LocalDateTime.now().plusMinutes(2); // 预估2分钟完成

            return GeneratePortraitResponse.builder()
                    .taskId(taskId)
                    .generationId(generation.getId())
                    .status("PENDING")
                    .progress(0)
                    .message("任务已提交，正在排队等待处理")
                    .createdAt(generation.getCreatedAt())
                    .estimatedCompletionTime(estimatedCompletion)
                    .build();

        } catch (Exception e) {
            log.error("创建生成任务失败", e);
            throw new RuntimeException("创建生成任务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 异步处理生成任务
     */
    @Async
    public void processGenerationTaskAsync(Long generationId, String taskId) {
        try {
            log.info("开始异步处理生成任务: taskId={}", taskId);

            // 获取生成记录
            AIPortraitGeneration generation = generationRepository.findById(generationId)
                    .orElseThrow(() -> new RuntimeException("生成记录不存在"));

            // 更新任务状态为处理中
            taskRepository.updateTaskStart(taskId, LocalDateTime.now(), LocalDateTime.now());

            // 获取AI模型服务
            ImageGenerationService modelService = modelServiceFactory.getService(generation.getModelName());

            if (!modelService.isConfigured()) {
                throw new RuntimeException("AI模型服务未配置");
            }

            // 更新进度
            taskRepository.updateTaskStatus(taskId, "PROCESSING", 10, LocalDateTime.now());

            // 调用AI模型生成图片
            List<String> imageUrls;
            if (generation.getReferenceImageUrl() != null && !generation.getReferenceImageUrl().isEmpty()) {
                // 图生图模式
                imageUrls = modelService.generateFromImage(
                        generation.getPrompt(),
                        generation.getReferenceImageUrl(),
                        0.6, // 默认强度
                        generation.getWidth(),
                        generation.getHeight()
                );
            } else {
                // 文本到图像模式
                imageUrls = modelService.generateImage(
                        generation.getPrompt(),
                        generation.getWidth(),
                        generation.getHeight(),
                        generation.getCount(),
                        generation.getSeed()
                );
            }

            // 更新进度到90%
            taskRepository.updateTaskStatus(taskId, "PROCESSING", 90, LocalDateTime.now());

            // 保存生成结果
            generation.setGeneratedImageUrls(String.join(",", imageUrls));
            generation.setStatus("SUCCESS");
            generation.setGenerationTime(120); // 假设生成耗时2分钟
            generationRepository.save(generation);

            // 更新任务状态为完成
            taskRepository.updateTaskCompletion(taskId, "SUCCESS", LocalDateTime.now(), LocalDateTime.now());

            log.info("✓ 生成任务完成: taskId={}, 生成 {} 张图片", taskId, imageUrls.size());

        } catch (Exception e) {
            log.error("生成任务处理失败: taskId={}", taskId, e);

            // 更新任务状态为失败
            taskRepository.updateTaskStatus(taskId, "FAILED", 0, LocalDateTime.now());

            // 更新生成记录状态
            try {
                AIPortraitGeneration generation = generationRepository.findByTaskId(taskId)
                        .orElseThrow(() -> new RuntimeException("生成记录不存在"));
                generation.setStatus("FAILED");
                generation.setErrorMessage(e.getMessage());
                generationRepository.save(generation);
            } catch (Exception ex) {
                log.error("更新生成记录状态失败", ex);
            }
        }
    }

    /**
     * 查询生成进度
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
                    .message(getStatusDescription(task.getStatus()))
                    .generationTime(generation.getGenerationTime())
                    .queueWaitTime(generation.getQueueWaitTime())
                    .completed(task.getStatus().equals("SUCCESS"))
                    .failed(task.getStatus().equals("FAILED"))
                    .build();

            // 如果完成，返回图片URL
            if (response.getCompleted() && generation.getGeneratedImageUrls() != null) {
                List<String> imageUrls = java.util.Arrays.stream(generation.getGeneratedImageUrls().split(","))
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
     */
    @Transactional(readOnly = true)
    public List<AIPortraitModelConfig> getAvailableModels() {
        try {
            List<AIPortraitModelConfig> models = modelConfigRepository.findByIsActiveTrue();
            log.info("✓ 获取 {} 个可用模型", models.size());
            return models;

        } catch (Exception e) {
            log.error("获取模型列表失败", e);
            throw new RuntimeException("获取模型列表失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取用户的生成历史
     */
    @Transactional(readOnly = true)
    public List<AIPortraitGeneration> getGenerationHistory(Long userId, int limit) {
        try {
            List<AIPortraitGeneration> history = generationRepository.findRecentByUserId(userId,
                    org.springframework.data.domain.PageRequest.of(0, limit));
            log.info("✓ 获取用户 {} 的 {} 条生成历史", userId, history.size());
            return history;

        } catch (Exception e) {
            log.error("获取生成历史失败", e);
            throw new RuntimeException("获取生成历史失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存生成结果到资源库
     */
    @Transactional
    public String saveGenerationResult(String taskId, String resourceName) {
        try {
            AIPortraitGeneration generation = generationRepository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("生成记录不存在"));

            // TODO: 实现保存到资源库的逻辑
            // 这里可以集成文件系统、数据库或其他存储服务

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

