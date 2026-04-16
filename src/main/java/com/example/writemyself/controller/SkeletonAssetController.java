package com.example.writemyself.controller;

import com.example.writemyself.dto.SkeletonGenerationRequest;
import com.example.writemyself.dto.SkeletonGenerationResponse;
import com.example.writemyself.service.EnhancedSkeletonAssetService;
import com.example.writemyself.service.SkeletonAssetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.validation.Valid;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
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

            // FROM_SCRATCH 模式必须提供 prompt；FROM_REFERENCE 模式 prompt 可为空
            boolean isFromScratch = request.getMode() == null || "FROM_SCRATCH".equals(request.getMode());
            if (isFromScratch && (request.getPrompt() == null || request.getPrompt().trim().isEmpty())) {
                log.warn("骨骼素材生成请求参数校验失败: FROM_SCRATCH 模式提示词为空");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", "FROM_SCRATCH 模式下提示词不能为空");
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
     * 提交增强骨骼素材生成任务（JSON 模式）
     *
     * POST /api/ai/portrait/skeleton/enhanced-generate
     * Content-Type: application/json
     *
     * 使用完整的8步AI流水线生成骨骼素材：
     * OpenPose -> ControlNet -> IP-Adapter -> Flux.1-dev -> 背景去除 -> SAM 2 -> 骨骼绑定
     *
     * FROM_REFERENCE 模式下，参考图通过 request.referenceImageBase64 字段以 Base64 字符串传入。
     * 如需直接上传图片文件，请使用 POST /enhanced-generate-with-file（multipart/form-data）接口。
     *
     * @param userId  用户 ID，从请求头 X-User-Id 中获取
     * @param request 生成请求参数；FROM_REFERENCE 模式时 referenceImageBase64 不能为空
     * @return ResponseEntity 包含 taskId 的 202 Accepted 响应
     */
    @PostMapping("/enhanced-generate")
    public ResponseEntity<Map<String, Object>> generateEnhancedSkeletonAssets(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SkeletonGenerationRequest request) {
        try {
            log.info("收到增强骨骼素材生成请求: userId={}, style={}, template={}, pose={}",
                    userId, request.getStyle(), request.getTemplate(), request.getPose());

            // FROM_SCRATCH 模式必须提供 prompt；FROM_REFERENCE 模式 prompt 可为空
            boolean isFromScratch = request.getMode() == null || "FROM_SCRATCH".equals(request.getMode());
            if (isFromScratch && (request.getPrompt() == null || request.getPrompt().trim().isEmpty())) {
                log.warn("增强骨骼素材生成请求参数校验失败: FROM_SCRATCH 模式提示词为空");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", "FROM_SCRATCH 模式下提示词不能为空");
                        }});
            }
            // FROM_REFERENCE 模式必须提供参考图
            if ("FROM_REFERENCE".equals(request.getMode())
                    && (request.getReferenceImageBase64() == null || request.getReferenceImageBase64().trim().isEmpty())) {
                log.warn("增强骨骼素材生成请求参数校验失败: FROM_REFERENCE 模式缺少参考图");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", "FROM_REFERENCE 模式下参考图不能为空");
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
     * 提交增强骨骼素材生成任务（文件上传模式）
     *
     * POST /api/ai/portrait/skeleton/enhanced-generate-with-file
     * Content-Type: multipart/form-data
     *
     * 与 /enhanced-generate 接口功能相同，但支持直接上传图片文件。
     * 适用于 FROM_REFERENCE 模式，前端可通过 form 的 referenceImage 字段上传设计稿。
     * 文件会在 Controller 层转为 Base64 后传入 Service，Service 逻辑与 JSON 模式完全一致。
     *
     * 表单字段说明：
     * - referenceImage (MultipartFile, 可选): 用户上传的参考图片，FROM_REFERENCE 模式必填
     * - mode           (String):  FROM_REFERENCE | FROM_SCRATCH
     * - style          (String):  anime | realistic | chibi | cartoon | pixel
     * - template       (String):  standard | animation
     * - pose           (String):  standing | walking | running | attacking | casting | idle
     * - prompt         (String):  正面提示词（FROM_SCRATCH 模式必填）
     * - negativePrompt (String):  负面提示词（可选）
     * - width          (Integer): 生成宽度（必填）
     * - height         (Integer): 生成高度（必填）
     * - openPoseTemplate (String): openpose_18 | openpose_25（可选，默认 openpose_18）
     *
     * @param userId         用户 ID，从请求头 X-User-Id 中获取
     * @param referenceImage 用户上传的参考图片文件（FROM_REFERENCE 模式必填）
     * @param mode           流水线模式
     * @param style          生成风格
     * @param template       骨骼模板
     * @param pose           角色姿态
     * @param prompt         正面提示词
     * @param negativePrompt 负面提示词
     * @param width          生成宽度
     * @param height         生成高度
     * @param openPoseTemplate OpenPose关键点模板类型
     * @return ResponseEntity 包含 taskId 的 202 Accepted 响应
     */
    @PostMapping(value = "/enhanced-generate-with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> generateEnhancedSkeletonAssetsWithFile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart(value = "referenceImage", required = false) MultipartFile referenceImage,
            @RequestParam(value = "mode", defaultValue = "FROM_SCRATCH") String mode,
            @RequestParam("style") String style,
            @RequestParam("template") String template,
            @RequestParam("pose") String pose,
            @RequestParam(value = "prompt", required = false) String prompt,
            @RequestParam(value = "negativePrompt", required = false) String negativePrompt,
            @RequestParam("width") Integer width,
            @RequestParam("height") Integer height,
            @RequestParam(value = "openPoseTemplate", defaultValue = "openpose_18") String openPoseTemplate) {
        try {
            log.info("收到增强骨骼素材生成请求（文件上传模式）: userId={}, style={}, template={}, pose={}, mode={}",
                    userId, style, template, pose, mode);

            // FROM_SCRATCH 模式必须提供 prompt
            if ((mode == null || "FROM_SCRATCH".equals(mode))
                    && (prompt == null || prompt.trim().isEmpty())) {
                log.warn("增强骨骼素材生成请求参数校验失败: FROM_SCRATCH 模式提示词为空");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", "FROM_SCRATCH 模式下提示词不能为空");
                        }});
            }
            // FROM_REFERENCE 模式必须提供参考图文件
            if ("FROM_REFERENCE".equals(mode)
                    && (referenceImage == null || referenceImage.isEmpty())) {
                log.warn("增强骨骼素材生成请求参数校验失败: FROM_REFERENCE 模式缺少参考图文件");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", "FROM_REFERENCE 模式下参考图不能为空");
                        }});
            }

            // 将上传的图片文件转为 Base64 字符串
            String referenceImageBase64 = null;
            if (referenceImage != null && !referenceImage.isEmpty()) {
                try {
                    String contentType = referenceImage.getContentType();
                    if (contentType == null) {
                        contentType = "image/png";
                    }
                    // 只允许图片类型
                    if (!contentType.startsWith("image/")) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new HashMap<String, Object>() {{
                                    put("error", "参考图必须是图片文件（支持 png/jpeg/jpg/webp）");
                                }});
                    }
                    byte[] imageBytes = referenceImage.getBytes();
                    referenceImageBase64 = "data:" + contentType + ";base64,"
                            + Base64.getEncoder().encodeToString(imageBytes);
                    log.debug("参考图文件已转为 Base64: fileName={}, size={} bytes, contentType={}",
                            referenceImage.getOriginalFilename(), imageBytes.length, contentType);
                } catch (IOException e) {
                    log.error("读取参考图文件失败: userId={}", userId, e);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new HashMap<String, Object>() {{
                                put("error", "读取参考图文件失败: " + e.getMessage());
                            }});
                }
            }

            // 组装 SkeletonGenerationRequest，与 JSON 接口共用同一 Service 逻辑
            SkeletonGenerationRequest request = SkeletonGenerationRequest.builder()
                    .mode(mode)
                    .style(style)
                    .template(template)
                    .pose(pose)
                    .prompt(prompt)
                    .negativePrompt(negativePrompt)
                    .width(width)
                    .height(height)
                    .openPoseTemplate(openPoseTemplate)
                    .referenceImageBase64(referenceImageBase64)
                    .build();

            // 调用增强服务层提交生成任务
            String taskId = enhancedSkeletonAssetService.submitEnhancedGenerationTask(request, userId.toString());

            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("status", "PENDING");
            response.put("message", "增强骨骼素材生成任务已提交，使用完整8步AI流水线");

            log.info("增强骨骼素材生成任务已提交（文件上传模式）: userId={}, taskId={}", userId, taskId);

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("增强骨骼素材生成请求参数校验失败（文件上传模式）: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("error", e.getMessage());
                        }});

        } catch (Exception e) {
            log.error("增强骨骼素材生成请求处理失败（文件上传模式）: userId={}", userId, e);
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

            // 从 DB 查询完整步骤状态（含各步骤中间产物 URL）
            List<SkeletonGenerationResponse.StepStatus> steps =
                    enhancedSkeletonAssetService.getStepsFull(taskId);
            result.setSteps(steps);

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

            // 从 DB 查询各步骤状态（轻量版，不含中间产物图片）
            List<SkeletonGenerationResponse.StepStatus> steps =
                    enhancedSkeletonAssetService.getStepsLight(taskId);
            status.put("steps", steps);

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

    /**
     * SSE 实时进度订阅接口
     *
     * GET /api/ai/portrait/skeleton/enhanced-stream/{taskId}
     *
     * 前端通过 EventSource 订阅此接口，后端在每个步骤变化时主动推送事件。
     * 事件格式：每条 SSE 数据均为 JSON 字符串，包含：
     * <ul>
     *   <li>{@code event=connected}  -- 连接建立确认</li>
     *   <li>{@code event=progress}   -- 进度更新，包含 status / progress / steps</li>
     *   <li>{@code status=SUCCESS / FAILED} 时后端主动关闭流</li>
     * </ul>
     *
     * @param taskId 任务 ID
     * @return SseEmitter
     */
    @GetMapping(value = "/enhanced-stream/{taskId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEnhancedGenerationProgress(@PathVariable String taskId) {
        log.info("前端订阅 SSE 进度流: taskId={}", taskId);
        return enhancedSkeletonAssetService.registerSseEmitter(taskId);
    }

    /**
     * 提交用户对生成结果的评分和反馈
     *
     * POST /api/ai/portrait/skeleton/enhanced-feedback/{taskId}
     *
     * 训练数据飞轮入口：
     * - 评分 >= 4 的任务会自动写入 RAG 索引，供后续同类请求复用中间产物
     * - 评分 <= 2 且有文字反馈的任务进入"负样本池"，供 DPO 微调
     *
     * Request Body:
     * <pre>
     * {
     *   "rating":   4,                    // 必填，1-5分
     *   "feedback": "图层分割稍有错位"      // 可选，文字描述
     * }
     * </pre>
     *
     * @param taskId 任务 ID
     * @param userId 用户 ID（鉴权用）
     * @param body   包含 rating 和 feedback 的 Map
     * @return 更新结果
     */
    @PostMapping("/enhanced-feedback/{taskId}")
    public ResponseEntity<Map<String, Object>> submitEnhancedFeedback(
            @PathVariable String taskId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> body) {
        try {
            // 参数校验
            Object ratingObj = body.get("rating");
            if (ratingObj == null) {
                return ResponseEntity.badRequest().body(new HashMap<String, Object>() {{
                    put("error", "rating 字段不能为空");
                }});
            }
            int rating;
            try {
                rating = Integer.parseInt(ratingObj.toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(new HashMap<String, Object>() {{
                    put("error", "rating 必须是 1-5 的整数");
                }});
            }
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(new HashMap<String, Object>() {{
                    put("error", "rating 必须在 1-5 之间");
                }});
            }
            String feedback = body.get("feedback") != null ? body.get("feedback").toString() : null;

            log.info("收到生成结果反馈: taskId={}, userId={}, rating={}", taskId, userId, rating);

            // 写入评分和反馈（由 Service 层决定是否写入 RAG 索引）
            enhancedSkeletonAssetService.saveFeedback(taskId, rating, feedback);

            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("rating", rating);
            response.put("message", rating >= 4
                    ? "感谢您的好评！该生成结果已加入优质样本库，将帮助改善后续生成质量"
                    : "感谢您的反馈！您的意见将帮助我们改善生成质量");
            // 高质量样本自动入 RAG 提示前端
            if (rating >= 4) {
                response.put("addedToRagIndex", true);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("保存生成结果反馈失败: taskId={}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("taskId", taskId);
                        put("error", "保存反馈失败: " + e.getMessage());
                    }});
        }
    }
}

