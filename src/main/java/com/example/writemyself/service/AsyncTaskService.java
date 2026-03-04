package com.example.writemyself.service;

import com.example.writemyself.entity.AIPortraitGeneration;
import com.example.writemyself.entity.AIPortraitTask;
import com.example.writemyself.repository.AIPortraitGenerationRepository;
import com.example.writemyself.repository.AIPortraitTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 异步任务处理服务
 * 管理生成任务的后台执行
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncTaskService {

    private final AIPortraitGenerationRepository generationRepository;
    private final AIPortraitTaskRepository taskRepository;
    private final AliyunTongYiService aliyunTongYiService;
    private final FileStorageService fileStorageService;

    /**
     * 异步处理生成任务
     * @param taskId 任务 ID
     */
    @Async("portraitTaskExecutor")
    @Transactional
    public void processTask(String taskId) {
        try {
            log.info("开始处理任务: {}", taskId);

            // 获取任务信息
            AIPortraitTask task = taskRepository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("任务不存在: " + taskId));

            AIPortraitGeneration generation = generationRepository.findById(task.getGenerationId())
                    .orElseThrow(() -> new RuntimeException("生成记录不存在"));

            // 更新为处理中
            task.setStatus("PROCESSING");
            task.setStartedAt(LocalDateTime.now());
            task.setProgress(10);
            taskRepository.save(task);

            generation.setStatus("PROCESSING");
            generationRepository.save(generation);

            log.info("任务 {} 已开始处理", taskId);

            // 调用模型生成图片
            long startTime = System.currentTimeMillis();

            List<String> imageUrls = aliyunTongYiService.generateImage(
                    generation.getPrompt(),
                    generation.getWidth(),
                    generation.getHeight(),
                    generation.getGenerationCount(),
                    generation.getSeed()
            );

            long generationTime = System.currentTimeMillis() - startTime;

            // 更新进度
            task.setProgress(80);
            taskRepository.save(task);

            // 保存生成的图片 URL（实际应该下载并保存本地）
            String imageUrlsJson = String.join(",", imageUrls);

            generation.setStatus("SUCCESS");
            generation.setGeneratedImageUrls(imageUrlsJson);
            generation.setGenerationTime(generationTime);
            generation.setCompletedAt(LocalDateTime.now());

            generationRepository.save(generation);

            // 更新任务为完成
            task.setStatus("SUCCESS");
            task.setProgress(100);
            task.setCompletedAt(LocalDateTime.now());
            taskRepository.save(task);

            log.info("✓ 任务 {} 已完成，生成耗时: {}ms", taskId, generationTime);

        } catch (Exception e) {
            log.error("任务处理失败: {}", taskId, e);
            handleTaskFailure(taskId, e);
        }
    }

    /**
     * 处理任务失败
     * @param taskId 任务 ID
     * @param exception 异常信息
     */
    @Transactional
    private void handleTaskFailure(String taskId, Exception exception) {
        try {
            AIPortraitTask task = taskRepository.findByTaskId(taskId)
                    .orElse(null);

            if (task == null) {
                log.error("无法找到失败的任务: {}", taskId);
                return;
            }

            task.setLastError(exception.getMessage());
            task.setRetryCount(task.getRetryCount() + 1);

            // 检查是否应该重试
            if (task.getRetryCount() < task.getMaxRetries()) {
                log.info("任务 {} 将进行第 {} 次重试", taskId, task.getRetryCount() + 1);
                task.setStatus("PENDING");
                task.setProgress(0);
                // TODO: 延迟一段时间后重新提交任务
            } else {
                log.error("任务 {} 已达最大重试次数，标记为失败", taskId);
                task.setStatus("FAILED");
                task.setProgress(0);

                // 更新生成记录的状态
                AIPortraitGeneration generation = generationRepository.findById(task.getGenerationId())
                        .orElse(null);
                if (generation != null) {
                    generation.setStatus("FAILED");
                    generation.setErrorMessage(exception.getMessage());
                    generationRepository.save(generation);
                }
            }

            task.setUpdatedAt(LocalDateTime.now());
            taskRepository.save(task);

        } catch (Exception e) {
            log.error("处理任务失败信息时出错", e);
        }
    }

    /**
     * 查询待处理的任务
     */
    public List<AIPortraitTask> getPendingTasks() {
        return taskRepository.findByStatus("PENDING");
    }

    /**
     * 查询需要重试的任务
     */
    public List<AIPortraitTask> getRetryableTasks() {
        return taskRepository.findByStatusAndRetryCountLessThan("FAILED", 3);
    }
}

