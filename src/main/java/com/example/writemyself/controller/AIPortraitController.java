package com.example.writemyself.controller;

import com.example.writemyself.dto.GeneratePortraitRequest;
import com.example.writemyself.dto.GeneratePortraitResponse;
import com.example.writemyself.dto.GenerateProgressResponse;
import com.example.writemyself.dto.SaveResultRequest;
import com.example.writemyself.entity.AIPortraitGeneration;
import com.example.writemyself.entity.AIPortraitModelConfig;
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
     * POST /api/ai/portrait/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<GeneratePortraitResponse> generate(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody GeneratePortraitRequest request) {
        try {
            log.info("收到生成请求: userId={}", userId);

            GeneratePortraitResponse response = aiPortraitService.createGenerationTask(userId, request);

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);

        } catch (Exception e) {
            log.error("生成请求处理失败", e);
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
     * 获取生成结果
     * GET /api/ai/portrait/result/{taskId}
     */
    @GetMapping("/result/{taskId}")
    public ResponseEntity<GenerateProgressResponse> getResult(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String taskId) {
        try {
            log.info("获取结果: userId={}, taskId={}", userId, taskId);

            GenerateProgressResponse response = aiPortraitService.getGenerationProgress(taskId);

            // 如果还未完成，返回 202 Accepted
            if (!response.getCompleted()) {
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("获取结果失败", e);
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

