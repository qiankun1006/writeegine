package com.example.writemyself.controller;

import com.example.writemyself.model.OpenPoseTemplate;
import com.example.writemyself.service.OpenPoseTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * OpenPose骨骼模板 REST API Controller
 *
 * 提供骨骼模板生成和查询的API接口
 */
@RestController
@RequestMapping("/api/ai/skeleton/template")
@RequiredArgsConstructor
@Slf4j
public class OpenPoseTemplateController {

    private final OpenPoseTemplateService openPoseTemplateService;

    /**
     * 生成OpenPose骨骼模板
     *
     * POST /api/ai/skeleton/template/generate
     *
     * 根据指定的模板类型生成完整的骨骼模板，包括关键点坐标和骨骼线图
     *
     * @param request 模板生成请求
     * @return 完整的骨骼模板数据
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateTemplate(
            @RequestBody TemplateGenerationRequest request) {
        try {
            log.info("收到骨骼模板生成请求: type={}", request.getTemplateType());

            // 验证模板类型
            if (!openPoseTemplateService.isTemplateTypeSupported(request.getTemplateType())) {
                log.warn("不支持的模板类型: {}", request.getTemplateType());
                return ResponseEntity.badRequest().body(
                    createErrorResponse("不支持的模板类型: " + request.getTemplateType() +
                        "，支持的类型: openpose_18, openpose_25")
                );
            }

            // 生成模板
            OpenPoseTemplate template = openPoseTemplateService.generateTemplate(request.getTemplateType());

            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("templateType", template.getTemplateType());
            response.put("pointCount", template.getPoints().size());
            response.put("connectionCount", template.getConnections().size());
            response.put("skeletonImageBase64", template.getSkeletonImageBase64());
            response.put("metadata", template.getMetadata());

            log.info("骨骼模板生成成功: type={}, points={}",
                template.getTemplateType(), template.getPoints().size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("骨骼模板生成失败", e);
            return ResponseEntity.internalServerError().body(
                createErrorResponse("模板生成失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取骨骼模板预览
     *
     * GET /api/ai/skeleton/template/preview?type=openpose_18
     *
     * 生成骨骼模板的预览图，用于前端展示
     *
     * @param templateType 模板类型
     * @return 骨骼预览图数据
     */
    @GetMapping("/preview")
    public ResponseEntity<Map<String, Object>> getTemplatePreview(
            @RequestParam String type) {
        try {
            log.debug("获取骨骼模板预览: type={}", type);

            if (!openPoseTemplateService.isTemplateTypeSupported(type)) {
                return ResponseEntity.badRequest().body(
                    createErrorResponse("不支持的模板类型: " + type)
                );
            }

            OpenPoseTemplate template = openPoseTemplateService.generateTemplate(type);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("previewUrl", template.getSkeletonImageBase64());
            response.put("templateType", template.getTemplateType());
            response.put("description", template.getDescription());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("获取模板预览失败", e);
            return ResponseEntity.internalServerError().body(
                createErrorResponse("获取预览失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取可用的模板类型列表
     *
     * GET /api/ai/skeleton/template/types
     *
     * 返回系统支持的所有骨骼模板类型
     *
     * @return 模板类型列表
     */
    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getAvailableTemplateTypes() {
        try {
            log.debug("获取可用模板类型列表");

            List<String> types = openPoseTemplateService.getAvailableTemplateTypes();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("templateTypes", types);
            response.put("count", types.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("获取模板类型列表失败", e);
            return ResponseEntity.internalServerError().body(
                createErrorResponse("获取模板类型失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取模板详细信息
     *
     * GET /api/ai/skeleton/template/info?type=openpose_18
     *
     * 返回指定模板类型的详细信息（不包含图像数据）
     *
     * @param templateType 模板类型
     * @return 模板详细信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getTemplateInfo(
            @RequestParam String type) {
        try {
            log.debug("获取模板信息: type={}", type);

            Map<String, Object> info = openPoseTemplateService.getTemplateInfo(type);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("templateInfo", info);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("获取模板信息失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                createErrorResponse(e.getMessage())
            );
        } catch (Exception e) {
            log.error("获取模板信息失败", e);
            return ResponseEntity.internalServerError().body(
                createErrorResponse("获取模板信息失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取所有模板信息列表
     *
     * GET /api/ai/skeleton/template/list
     *
     * 返回所有可用模板的详细信息列表
     *
     * @return 所有模板信息列表
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllTemplateInfo() {
        try {
            log.debug("获取所有模板信息列表");

            List<String> types = openPoseTemplateService.getAvailableTemplateTypes();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("templates", types.stream()
                .map(openPoseTemplateService::getTemplateInfo)
                .toArray());
            response.put("count", types.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("获取模板列表失败", e);
            return ResponseEntity.internalServerError().body(
                createErrorResponse("获取模板列表失败: " + e.getMessage())
            );
        }
    }

    /**
     * 创建错误响应
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        return error;
    }

    /**
     * 模板生成请求DTO
     */
    public static class TemplateGenerationRequest {
        private String templateType;
        private Integer imageWidth;
        private Integer imageHeight;

        // Getters and Setters
        public String getTemplateType() {
            return templateType;
        }

        public void setTemplateType(String templateType) {
            this.templateType = templateType;
        }

        public Integer getImageWidth() {
            return imageWidth;
        }

        public void setImageWidth(Integer imageWidth) {
            this.imageWidth = imageWidth;
        }

        public Integer getImageHeight() {
            return imageHeight;
        }

        public void setImageHeight(Integer imageHeight) {
            this.imageHeight = imageHeight;
        }
    }
}

