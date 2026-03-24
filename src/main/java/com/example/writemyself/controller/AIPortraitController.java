package com.example.writemyself.controller;

import com.example.writemyself.dto.GeneratePortraitRequest;
import com.example.writemyself.dto.GeneratePortraitResponse;
import com.example.writemyself.dto.GenerateProgressResponse;
import com.example.writemyself.dto.SaveResultRequest;
import com.example.writemyself.model.AIPortraitGeneration;
import com.example.writemyself.model.AIPortraitModelConfig;
import com.example.writemyself.service.AIPortraitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI 立绘生成 REST API Controller
 */
@RestController
@RequestMapping("/api/ai/portrait")
@RequiredArgsConstructor
@Slf4j
public class AIPortraitController {

    private final AIPortraitService aiPortraitService;

    /**
     * 创建生成任务
     *
     * POST /api/ai/portrait/generate
     *
     * 前端在用户点击"开始生成"按钮后调用此接口。
     * 接口会验证参数、创建生成任务、将任务放入队列进行处理。
     * 返回 202 Accepted 和任务 ID，前端可通过 taskId 查询进度和结果。
     *
     * 前后端数据流：
     * 前端 Vue Store 参数 → GeneratePortraitRequest DTO
     * → 后端参数验证 → AIPortraitService.createGenerationTask()
     * → 创建任务并放入队列 → 返回 GeneratePortraitResponse (202)
     *
     * @param userId 用户 ID，从请求头 X-User-Id 中获取
     * @param request 生成请求参数，包含所有用户在前端配置的参数
     * @return ResponseEntity 包含 taskId 和初始状态的 202 Accepted 响应
     */
    @PostMapping("/generate")
    public ResponseEntity<GeneratePortraitResponse> generate(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody GeneratePortraitRequest request) {
        try {
            // 记录详细的请求日志，用于调试
            log.info("收到生成请求: userId={}, prompt={}, provider={}, modelVersion={}",
                    userId,
                    request.getPrompt().substring(0, Math.min(50, request.getPrompt().length())),
                    request.getProvider(),
                    request.getModelVersion());

            // 调试日志：记录所有参数
            log.debug("生成请求参数详情: \n" +
                    "  - prompt: {} (长度: {})\n" +
                    "  - negativePrompt: {} (长度: {})\n" +
                    "  - referenceImageBase64: {}\n" +
                    "  - modelWeight: {} (类型: {})\n" +
                    "  - width: {}, height: {}\n" +
                    "  - provider: {}, modelVersion: {}\n" +
                    "  - imageStrength: {}\n" +
                    "  - generateCount: {}\n" +
                    "  - sampler: {}, steps: {}\n" +
                    "  - stylePreset: {}\n" +
                    "  - seed: {} (类型: {})\n" +
                    "  - faceEnhance: {}\n" +
                    "  - outputFormat: {}",
                    request.getPrompt(), request.getPrompt().length(),
                    request.getNegativePrompt(),
                    request.getNegativePrompt() != null ? request.getNegativePrompt().length() : 0,
                    request.getReferenceImageBase64() != null ? "有" : "无",
                    request.getModelWeight(), request.getModelWeight() != null ? request.getModelWeight().getClass().getName() : "null",
                    request.getWidth(), request.getHeight(),
                    request.getProvider(), request.getModelVersion(),
                    request.getImageStrength(),
                    request.getGenerateCount(),
                    request.getSampler(), request.getSteps(),
                    request.getStylePreset(),
                    request.getSeed(), request.getSeed() != null ? request.getSeed().getClass().getName() : "null",
                    request.getFaceEnhance(),
                    request.getOutputFormat());

            // 调用服务层创建生成任务
            GeneratePortraitResponse response = aiPortraitService.createGenerationTask(userId, request);

            // 返回 202 Accepted 状态码
            // 表示请求已被接受，但任务还在处理中
            // 前端应该根据返回的 taskId 轮询查询进度
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);

        } catch (IllegalArgumentException e) {
            // 参数校验失败，返回 400 Bad Request
            log.warn("生成请求参数校验失败: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (Exception e) {
            // 系统错误，返回 500 Internal Server Error
            log.error("生成请求处理失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 查询生成进度
     * GET /api/ai/portrait/progress/{taskId}
     */
    @GetMapping("/progress/{taskId}")
    public ResponseEntity<GenerateProgressResponse> getProgress(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String taskId) {
        try {
            log.info("查询进度: userId={}, taskId={}", userId, taskId);

            GenerateProgressResponse response = aiPortraitService.getGenerationProgress(taskId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("查询进度失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 查询生成结果
     * GET /api/ai/portrait/result/{taskId}
     *
     * 前端轮询此接口以获取生成任务的最终结果。
     * 由于生成图片耗时较长，此接口采用异步查询模式：
     * 1. 如果任务还在处理中（PENDING/PROCESSING），返回 202 Accepted 和当前进度
     * 2. 如果任务已完成（SUCCESS），返回 200 OK 和生成的图片 URL
     * 3. 如果任务失败（FAILED），返回 200 OK 和错误信息
     *
     * 前端轮询策略：
     * 1. 用户点击"开始生成"后，获取 taskId
     * 2. 每 1-3 秒调用此接口查询结果
     * 3. 根据返回的状态码和结果更新 UI
     *    - 202: 继续轮询，显示进度条
     *    - 200 + imageUrls: 显示生成的图片
     *    - 200 + errorMessage: 显示错误信息
     *
     * @param userId 用户 ID，从请求头 X-User-Id 中获取
     * @param taskId 任务 ID，由 /generate 接口返回
     * @return ResponseEntity 包含任务状态和结果
     */
    @GetMapping("/result/{taskId}")
    public ResponseEntity<GenerateProgressResponse> getGenerationResult(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String taskId) {
        try {
            log.info("查询生成结果: userId={}, taskId={}", userId, taskId);

            GenerateProgressResponse response = aiPortraitService.getGenerationProgress(taskId);

            // 如果任务还未完成，返回 202 Accepted（继续轮询）
            if (!response.getCompleted()) {
                log.debug("任务未完成，返回 202 Accepted: taskId={}, status={}, progress={}%",
                        taskId, response.getStatus(), response.getProgress());
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
            }

            // 任务已完成
            log.info("任务已完成: taskId={}, status={}, imageCount={}",
                    taskId, response.getStatus(),
                    response.getImageUrls() != null ? response.getImageUrls().size() : 0);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // 任务不存在等业务异常
            log.warn("查询结果失败（业务异常）: userId={}, taskId={}, error={}", userId, taskId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        } catch (Exception e) {
            // 系统错误
            log.error("查询结果失败（系统错误）: userId={}, taskId={}", userId, taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 保存生成结果到资源库
     * POST /api/ai/portrait/save
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> save(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SaveResultRequest request) {
        try {
            log.info("保存结果: userId={}, taskId={}, name={}", userId, request.getTaskId(), request.getName());

            String result = aiPortraitService.saveGenerationResult(request.getTaskId(), request.getName());

            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            response.put("taskId", request.getTaskId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("保存结果失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 获取生成历史
     * GET /api/ai/portrait/history
     */
    @GetMapping("/history")
    public ResponseEntity<List<AIPortraitGeneration>> getHistory(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            log.info("获取历史: userId={}, limit={}", userId, limit);

            List<AIPortraitGeneration> history = aiPortraitService.getGenerationHistory(userId, limit);

            return ResponseEntity.ok(history);

        } catch (Exception e) {
            log.error("获取历史失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 获取可用模型列表
     * GET /api/ai/portrait/models
     */
    @GetMapping("/models")
    public ResponseEntity<List<AIPortraitModelConfig>> getModels() {
        try {
            log.info("获取模型列表");

            List<AIPortraitModelConfig> models = aiPortraitService.getAvailableModels();

            return ResponseEntity.ok(models);

        } catch (Exception e) {
            log.error("获取模型列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 健康检查端点
     * GET /api/ai/portrait/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "AI Portrait Generator");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
}

