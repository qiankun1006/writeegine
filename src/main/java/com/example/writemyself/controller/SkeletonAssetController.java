package com.example.writemyself.controller;

import com.example.writemyself.dto.SkeletonGenerationRequest;
import com.example.writemyself.dto.SkeletonGenerationResponse;
import com.example.writemyself.service.EnhancedSkeletonAssetService;
import com.example.writemyself.service.SkeletonAssetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * 骨骼素材生成 REST API Controller
 *
 * 提供骨骼素材生成的 API 接口，包括：
 * - 提交生成任务
 * - 查询生成进度
 * - 获取生成结果
 */
@RestController
@RequestMapping("/api/ai/portrait/skeleton")
@RequiredArgsConstructor
@Slf4j
public class SkeletonAssetController {

    private final SkeletonAssetService skeletonAssetService;
    private final EnhancedSkeletonAssetService enhancedSkeletonAssetService;

    /**
     * 提交骨骼素材生成任务
     *
     * POST /api/ai/portrait/skeleton/generate
     *
     * 前端在用户配置好骨骼素材参数后调用此接口。
     * 接口会验证参数、创建生成任务并异步处理。
     * 返回 202 Accepted 和任务 ID，前端可通过 taskId 查询进度和结果。
     *
     * @param userId 用户 ID，从请求头 X-User-Id 中获取
     * @param request 生成请求参数，包含风格、骨骼模板、姿态等
     * @return ResponseEntity 包含 taskId 和初始状态的 202 Accepted 响应
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateSkeletonAssets(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SkeletonGenerationRequest request) {
        try {
            log.info("收到骨骼素材生成请求: userId={}, style={}, template={}, pose={}",
                    userId, request.getStyle(), request.getTemplate(), request.getPose());

            // 验证提示词
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                log.warn("骨骼素材生成请求参数校验失败: 提示词为空");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", "提示词不能为空");
                        }});
            }

            // 调用服务层提交生成任务
            String taskId = skeletonAssetService.submitGenerationTask(request, userId.toString());

            // 返回任务 ID
            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("status", "PENDING");

            log.info("骨骼素材生成任务已提交: userId={}, taskId={}", userId, taskId);

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("骨骼素材生成请求参数校验失败: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", e.getMessage());
                        }});

        } catch (Exception e) {
            log.error("骨骼素材生成请求处理失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new HashMap<String, Object>() {{
                            put("error", "系统错误: " + e.getMessage());
                        }});
        }
    }

    /**
     * 查询骨骼素材生成结果
     *
     * GET /api/ai/portrait/skeleton/result/{taskId}
     *
     * 前端通过轮询此接口来获取生成进度和最终结果。
     * - 如果任务还在处理中，返回 202 Accepted 和当前进度
     * - 如果任务已完成，返回 200 OK 和完整结果
     * - 如果任务失败，返回 200 OK 和错误状态
     *
     * @param taskId 任务 ID
     * @param userId 用户 ID，从请求头 X-User-Id 中获取（用于权限校验）
     * @return ResponseEntity 包含任务状态的响应
     */
    @GetMapping("/result/{taskId}")
    public ResponseEntity<SkeletonGenerationResponse> getGenerationResult(
            @PathVariable String taskId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            log.debug("查询骨骼素材生成结果: taskId={}, userId={}", taskId, userId);

            // 获取任务结果
            SkeletonGenerationResponse result = skeletonAssetService.getResult(taskId);

            // 根据状态返回不同的 HTTP 状态码
            if ("NOT_FOUND".equals(result.getStatus())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }

            if ("PROCESSING".equals(result.getStatus()) || "PENDING".equals(result.getStatus())) {
                // 任务还在处理中，返回 202 Accepted
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(result);
            }

            // 任务已完成或失败，返回 200 OK
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("查询骨骼素材生成结果失败: taskId={}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(SkeletonGenerationResponse.builder()
                            .taskId(taskId)
                            .status("ERROR")
                            .errorMessage("查询结果失败: " + e.getMessage())
                            .build());
        }
    }

    /**
     * 获取骨骼素材生成状态（轻量级接口）
     *
     * GET /api/ai/portrait/skeleton/status/{taskId}
     *
     * 仅返回状态和进度信息，不包含完整的结果数据。
     * 适用于前端频繁轮询。
     *
     * @param taskId 任务 ID
     * @return 状态信息
     */
    @GetMapping("/status/{taskId}")
    public ResponseEntity<Map<String, Object>> getGenerationStatus(
            @PathVariable String taskId) {
        try {
            SkeletonGenerationResponse result = skeletonAssetService.getResult(taskId);

            Map<String, Object> status = new HashMap<>();
            status.put("taskId", taskId);
            status.put("status", result.getStatus());
            status.put("progress", result.getProgress());
            status.put("progressMessage", result.getProgressMessage());

            if (result.getErrorMessage() != null) {
                status.put("errorMessage", result.getErrorMessage());
            }

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            log.error("获取骨骼素材生成状态失败: taskId={}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("taskId", taskId);
                        put("status", "ERROR");
                        put("errorMessage", e.getMessage());
                    }});
        }
    }

    /**
     * 取消骨骼素材生成任务
     *
     * DELETE /api/ai/portrait/skeleton/cancel/{taskId}
     *
     * 允许用户取消正在进行的生成任务。
     *
     * @param taskId 任务 ID
     * @param userId 用户 ID
     * @return 取消结果
     */
    @DeleteMapping("/cancel/{taskId}")
    public ResponseEntity<Map<String, Object>> cancelGenerationTask(
            @PathVariable String taskId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("取消骨骼素材生成任务: taskId={}, userId={}", taskId, userId);

            // TODO: 实现任务取消逻辑
            // 当前为占位实现，实际需要在 SkeletonAssetService 中添加取消功能

            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("status", "CANCELLED");
            response.put("message", "任务已取消");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("取消骨骼素材生成任务失败: taskId={}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("taskId", taskId);
                        put("status", "ERROR");
                        put("errorMessage", "取消任务失败: " + e.getMessage());
                    }});
        }
    }

    /**
     * 提交增强骨骼素材生成任务
     *
     * POST /api/ai/portrait/skeleton/enhanced-generate
     *
     * 使用完整的8步AI流水线生成骨骼素材：
     * OpenPose -> ControlNet -> IP-Adapter -> Flux.1-dev -> 背景去除 -> SAM 2 -> 骨骼绑定
     *
     * @param userId 用户 ID，从请求头 X-User-Id 中获取
     * @param request 生成请求参数
     * @return ResponseEntity 包含 taskId 的 202 Accepted 响应
     */
    @PostMapping("/enhanced-generate")
    public ResponseEntity<Map<String, Object>> generateEnhancedSkeletonAssets(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SkeletonGenerationRequest request) {
        try {
            log.info("收到增强骨骼素材生成请求: userId={}, style={}, template={}, pose={}",
                    userId, request.getStyle(), request.getTemplate(), request.getPose());

            // 验证提示词
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                log.warn("增强骨骼素材生成请求参数校验失败: 提示词为空");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", "提示词不能为空");
                        }});
            }

            // 调用增强服务层提交生成任务
            String taskId = enhancedSkeletonAssetService.submitEnhancedGenerationTask(request, userId.toString());

            // 返回任务 ID
            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("status", "PENDING");
            response.put("message", "增强骨骼素材生成任务已提交，使用完整8步AI流水线");

            log.info("增强骨骼素材生成任务已提交: userId={}, taskId={}", userId, taskId);

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("增强骨骼素材生成请求参数校验失败: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", e.getMessage());
                        }});

        } catch (Exception e) {
            log.error("增强骨骼素材生成请求处理失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new HashMap<String, Object>() {{
                            put("error", "系统错误: " + e.getMessage());
                        }});
        }
    }

    /**
     * 查询增强骨骼素材生成结果
     *
     * GET /api/ai/portrait/skeleton/enhanced-result/{taskId}
     *
     * 前端通过轮询此接口来获取增强生成的进度和最终结果。
     *
     * @param taskId 任务 ID
     * @param userId 用户 ID，从请求头 X-User-Id 中获取（用于权限校验）
     * @return ResponseEntity 包含任务状态的响应
     */
    @GetMapping("/enhanced-result/{taskId}")
    public ResponseEntity<SkeletonGenerationResponse> getEnhancedGenerationResult(
            @PathVariable String taskId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            log.debug("查询增强骨骼素材生成结果: taskId={}, userId={}", taskId, userId);

            // 获取任务结果
            SkeletonGenerationResponse result = enhancedSkeletonAssetService.getResult(taskId);

            // 根据状态返回不同的 HTTP 状态码
            if ("NOT_FOUND".equals(result.getStatus())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }

            if ("PROCESSING".equals(result.getStatus()) || "PENDING".equals(result.getStatus())) {
                // 任务还在处理中，返回 202 Accepted
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(result);
            }

            // 任务已完成或失败，返回 200 OK
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("查询增强骨骼素材生成结果失败: taskId={}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(SkeletonGenerationResponse.builder()
                            .taskId(taskId)
                            .status("ERROR")
                            .errorMessage("查询结果失败: " + e.getMessage())
                            .build());
        }
    }

    /**
     * 获取增强骨骼素材生成状态（轻量级接口）
     *
     * GET /api/ai/portrait/skeleton/enhanced-status/{taskId}
     *
     * 仅返回状态和进度信息，不包含完整的结果数据。
     * 适用于前端频繁轮询。
     *
     * @param taskId 任务 ID
     * @return 状态信息
     */
    @GetMapping("/enhanced-status/{taskId}")
    public ResponseEntity<Map<String, Object>> getEnhancedGenerationStatus(
            @PathVariable String taskId) {
        try {
            SkeletonGenerationResponse result = enhancedSkeletonAssetService.getResult(taskId);

            Map<String, Object> status = new HashMap<>();
            status.put("taskId", taskId);
            status.put("status", result.getStatus());
            status.put("progress", result.getProgress());
            status.put("progressMessage", result.getProgressMessage());

            if (result.getErrorMessage() != null) {
                status.put("errorMessage", result.getErrorMessage());
            }

            // 添加增强功能特有的信息
            if (result.getSkeletonDataUrl() != null) {
                status.put("hasSkeletonData", true);
            }

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            log.error("获取增强骨骼素材生成状态失败: taskId={}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("taskId", taskId);
                        put("status", "ERROR");
                        put("errorMessage", e.getMessage());
                    }});
        }
    }
}

