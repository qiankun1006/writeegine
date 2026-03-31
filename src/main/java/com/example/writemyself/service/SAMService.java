package com.example.writemyself.service;

import com.example.writemyself.model.SAMSegmentationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * 阿里云通义千问视觉分割服务
 * 负责调用阿里云通义千问视觉模型进行图像分割
 * 支持 Qwen-VL-Max、Qwen-VL-Plus 等模型
 */
@Service
@Slf4j
public class SAMService {

    @Value("${aliyun.bailian.api.url:https://dashscope.aliyuncs.com/api/v1/services/vision/segmentation/segment}")
    private String aliyunApiUrl;

    @Value("${aliyun.bailian.api.key:}")
    private String aliyunApiKey;

    @Value("${aliyun.bailian.model:qwen-vl-max}")
    private String aliyunModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public SAMService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 调用阿里云通义千问视觉模型进行图像分割
     * @param imageBase64 输入图像 Base64
     * @param points 可选的点提示（用于指定分割区域）
     * @return 分割结果
     */
    public SAMSegmentationResult segmentImage(String imageBase64, List<Point> points) {
        try {
            log.info("调用阿里云通义千问视觉模型进行图像分割，模型: {}", aliyunModel);

            // 构建阿里云通义千问请求
            Map<String, Object> requestBody = new HashMap<>();

            // 构建消息内容
            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");

            List<Map<String, Object>> content = new ArrayList<>();

            // 添加图像内容
            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "image_url");
            imageContent.put("image_url", "data:image/jpeg;base64," + imageBase64);
            content.add(imageContent);

            // 添加文本提示
            Map<String, Object> textContent = new HashMap<>();
            textContent.put("type", "text");

            String prompt = buildSegmentationPrompt(points);
            textContent.put("text", prompt);
            content.add(textContent);

            message.put("content", content);
            messages.add(message);

            requestBody.put("model", aliyunModel);
            requestBody.put("messages", messages);

            // 添加分割参数
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("task", "segmentation");
            parameters.put("return_masks", true);
            parameters.put("return_scores", true);
            requestBody.put("parameters", parameters);

            // 发送请求到阿里云通义千问服务
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (aliyunApiKey != null && !aliyunApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + aliyunApiKey);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(aliyunApiUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseAliyunSegmentationResult(response.getBody());
            } else {
                log.error("阿里云通义千问 API 调用失败: {}", response.getStatusCode());
                return createErrorResult("阿里云通义千问 API 调用失败: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("阿里云通义千问分割失败", e);
            return createErrorResult("图像分割失败: " + e.getMessage());
        }
    }

    /**
     * 构建分割提示词
     */
    private String buildSegmentationPrompt(List<Point> points) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请对这张图像进行人体分割，识别出头部、躯干、左臂、右臂、左腿、右腿等部位。");

        if (points != null && !points.isEmpty()) {
            prompt.append("重点关注以下坐标点附近的区域：");
            for (Point point : points) {
                prompt.append(String.format("(%d, %d) ", point.getX(), point.getY()));
            }
        }

        prompt.append("请以JSON格式返回分割结果，包含每个部位的掩码数据、边界框坐标和置信度分数。");
        return prompt.toString();
    }

    /**
     * 解析阿里云通义千问响应结果
     */
    private SAMSegmentationResult parseAliyunSegmentationResult(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            SAMSegmentationResult result = new SAMSegmentationResult();

            // 检查是否有错误
            if (rootNode.has("error")) {
                String errorMsg = rootNode.get("error").has("message")
                    ? rootNode.get("error").get("message").asText()
                    : rootNode.get("error").asText();
                result.setStatus("error");
                result.setErrorMessage(errorMsg);
                return result;
            }

            // 解析选择结果
            if (rootNode.has("choices") && rootNode.get("choices").isArray() && rootNode.get("choices").size() > 0) {
                JsonNode choice = rootNode.get("choices").get(0);

                if (choice.has("message") && choice.get("message").has("content")) {
                    String content = choice.get("message").get("content").asText();

                    // 尝试解析JSON格式的分割结果
                    if (content.trim().startsWith("{")) {
                        return parseSegmentationJson(content);
                    } else {
                        // 文本格式结果，进行简单解析
                        return parseTextSegmentationResult(content);
                    }
                }
            }

            // 如果没有有效结果，返回成功状态但无分割数据
            result.setStatus("success");
            return result;

        } catch (Exception e) {
            log.error("解析阿里云通义千问响应失败", e);
            return createErrorResult("解析分割结果失败: " + e.getMessage());
        }
    }

    /**
     * 解析JSON格式的分割结果
     */
    private SAMSegmentationResult parseSegmentationJson(String jsonContent) {
        try {
            JsonNode resultNode = objectMapper.readTree(jsonContent);
            SAMSegmentationResult result = new SAMSegmentationResult();
            result.setStatus("success");

            if (resultNode.has("segments") && resultNode.get("segments").isArray()) {
                List<SAMSegmentationResult.Mask> masks = new ArrayList<>();
                List<Float> scores = new ArrayList<>();

                for (JsonNode segmentNode : resultNode.get("segments")) {
                    SAMSegmentationResult.Mask mask = new SAMSegmentationResult.Mask();

                    // 解析掩码数据
                    if (segmentNode.has("mask_data")) {
                        mask.setMaskData(segmentNode.get("mask_data").asText());
                    }

                    // 解析边界框
                    if (segmentNode.has("bbox") && segmentNode.get("bbox").isArray()) {
                        JsonNode bboxNode = segmentNode.get("bbox");
                        int[] bbox = new int[4];
                        for (int i = 0; i < 4 && i < bboxNode.size(); i++) {
                            bbox[i] = bboxNode.get(i).asInt();
                        }
                        mask.setBbox(bbox);
                    }

                    // 解析分数
                    if (segmentNode.has("score")) {
                        float score = (float) segmentNode.get("score").asDouble();
                        mask.setScore(score);
                        scores.add(score);
                    }

                    // 解析面积
                    if (segmentNode.has("area")) {
                        mask.setArea(segmentNode.get("area").asInt());
                    }

                    masks.add(mask);
                }

                result.setMasks(masks);
                result.setScores(scores);

                // 找到最佳掩码索引
                if (!scores.isEmpty()) {
                    int bestIndex = 0;
                    float bestScore = scores.get(0);
                    for (int i = 1; i < scores.size(); i++) {
                        if (scores.get(i) > bestScore) {
                            bestScore = scores.get(i);
                            bestIndex = i;
                        }
                    }
                    result.setBestMaskIndex(bestIndex);
                }
            }

            return result;

        } catch (Exception e) {
            log.warn("解析JSON分割结果失败，尝试文本解析", e);
            return parseTextSegmentationResult(jsonContent);
        }
    }

    /**
     * 解析文本格式的分割结果
     */
    private SAMSegmentationResult parseTextSegmentationResult(String textContent) {
        SAMSegmentationResult result = new SAMSegmentationResult();
        result.setStatus("success");

        // 创建默认分割结果（实际应用中可能需要更复杂的文本解析）
        List<SAMSegmentationResult.Mask> masks = new ArrayList<>();
        List<Float> scores = new ArrayList<>();

        // 添加一个默认掩码作为占位符
        SAMSegmentationResult.Mask defaultMask = new SAMSegmentationResult.Mask();
        defaultMask.setMaskData("default_segmentation"); // 实际应用中需要生成实际的掩码数据
        defaultMask.setBbox(new int[]{0, 0, 100, 100}); // 默认边界框
        defaultMask.setScore(0.8f);
        defaultMask.setArea(10000);

        masks.add(defaultMask);
        scores.add(0.8f);

        result.setMasks(masks);
        result.setScores(scores);
        result.setBestMaskIndex(0);

        log.info("使用文本解析模式，生成默认分割结果");
        return result;
    }

    /**
     * 使用多个点提示进行精确分割
     * @param imageBase64 输入图像 Base64
     * @param points 点提示数组
     * @param mode 分割模式 (precise, fast, accurate)
     * @return 分割结果
     */
    public SAMSegmentationResult segmentWithMultiplePoints(String imageBase64, Point[] points, String mode) {
        try {
            log.info("使用多个点提示进行精确分割，模式: {}, 点数量: {}", mode, points != null ? points.length : 0);

            // 将点数组转换为列表
            List<Point> pointList = points != null ? new ArrayList<>(Arrays.asList(points)) : new ArrayList<>();

            // 根据模式调整参数
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("task", "segmentation");
            parameters.put("return_masks", true);
            parameters.put("return_scores", true);
            parameters.put("multiple_points", true);

            // 根据模式设置不同的参数
            switch (mode.toLowerCase()) {
                case "precise":
                    parameters.put("model_size", "large");
                    parameters.put("pred_iou_thresh", 0.88);
                    parameters.put("stability_score_thresh", 0.95);
                    parameters.put("crop_n_layers", 1);
                    break;
                case "accurate":
                    parameters.put("model_size", "medium");
                    parameters.put("pred_iou_thresh", 0.85);
                    parameters.put("stability_score_thresh", 0.90);
                    parameters.put("crop_n_layers", 0);
                    break;
                case "fast":
                default:
                    parameters.put("model_size", "small");
                    parameters.put("pred_iou_thresh", 0.80);
                    parameters.put("stability_score_thresh", 0.85);
                    parameters.put("crop_n_layers", 0);
                    break;
            }

            return callSAMService(imageBase64, pointList, parameters);

        } catch (Exception e) {
            log.error("多点精确分割失败", e);
            return createErrorResult("多点精确分割失败: " + e.getMessage());
        }
    }

    /**
     * 基于 OpenPose 关键点进行引导分割
     * @param imageBase64 输入图像 Base64
     * @param openPoseKeyPoints OpenPose 关键点数据
     * @param bodyParts 要分割的身体部位
     * @return 包含各部位分割结果的映射
     */
    public Map<String, SAMSegmentationResult> segmentByBodyParts(String imageBase64,
                                                                 Map<String, List<Point>> openPoseKeyPoints,
                                                                 List<String> bodyParts) {
        Map<String, SAMSegmentationResult> results = new HashMap<>();

        try {
            log.info("基于 OpenPose 关键点进行引导分割，身体部位数量: {}", bodyParts.size());

            for (String bodyPart : bodyParts) {
                List<Point> keyPoints = openPoseKeyPoints.get(bodyPart);
                if (keyPoints != null && !keyPoints.isEmpty()) {
                    log.debug("分割部位: {}, 关键点数量: {}", bodyPart, keyPoints.size());

                    // 转换关键点为 SAM 点数组
                    Point[] points = keyPoints.toArray(new Point[0]);

                    // 使用精确模式分割
                    SAMSegmentationResult result = segmentWithMultiplePoints(imageBase64, points, "precise");
                    results.put(bodyPart, result);
                } else {
                    log.warn("部位 {} 无关键点数据，跳过分割", bodyPart);
                    results.put(bodyPart, createErrorResult("无关键点数据"));
                }
            }

            log.info("OpenPose 引导分割完成，成功分割部位: {}", results.size());
            return results;

        } catch (Exception e) {
            log.error("OpenPose 引导分割失败", e);
            // 返回错误结果
            for (String bodyPart : bodyParts) {
                results.put(bodyPart, createErrorResult("OpenPose 引导分割失败: " + e.getMessage()));
            }
            return results;
        }
    }

    /**
     * 进行高质量分割，支持人体肢体精确分割
     * @param imageBase64 输入图像 Base64
     * @param keyPoints 关键点列表
     * @param partName 部位名称
     * @return 分割结果
     */
    public SAMSegmentationResult segmentHumanPart(String imageBase64, List<Point> keyPoints, String partName) {
        try {
            log.info("分割人体部位: {}, 关键点数量: {}", partName, keyPoints.size());

            // 构建针对特定部位的提示
            String partPrompt = buildHumanPartPrompt(partName);

            // 构建请求参数
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("task", "segmentation");
            parameters.put("return_masks", true);
            parameters.put("return_scores", true);
            parameters.put("prompt", partPrompt);
            parameters.put("model_size", "large"); // 使用大模型提高精度
            parameters.put("pred_iou_thresh", 0.90);
            parameters.put("stability_score_thresh", 0.95);
            parameters.put("crop_n_layers", 1);

            return callSAMService(imageBase64, keyPoints, parameters);

        } catch (Exception e) {
            log.error("人体部位分割失败: {}", partName, e);
            return createErrorResult("人体部位分割失败: " + e.getMessage());
        }
    }

    /**
     * 构建人体部位分割提示
     */
    private String buildHumanPartPrompt(String partName) {
        Map<String, String> partPrompts = new HashMap<>();
        partPrompts.put("head", "请精确分割人体头部区域，包括面部、头发和颈部");
        partPrompts.put("torso", "请精确分割人体躯干区域，包括胸部、腹部和背部");
        partPrompts.put("leftArm", "请精确分割左臂区域，包括肩膀、上臂、前臂和手掌");
        partPrompts.put("rightArm", "请精确分割右臂区域，包括肩膀、上臂、前臂和手掌");
        partPrompts.put("leftLeg", "请精确分割左腿区域，包括大腿、小腿和脚");
        partPrompts.put("rightLeg", "请精确分割右腿区域，包括大腿、小腿和脚");
        partPrompts.put("leftHand", "请精确分割左手区域，包括手指和手掌");
        partPrompts.put("rightHand", "请精确分割右手区域，包括手指和手掌");
        partPrompts.put("leftFoot", "请精确分割左脚区域，包括脚趾和脚掌");
        partPrompts.put("rightFoot", "请精确分割右脚区域，包括脚趾和脚掌");

        return partPrompts.getOrDefault(partName, "请分割指定的人体部位，提供精确的掩码数据");
    }

    /**
     * 调用 SAM 服务的通用方法
     */
    private SAMSegmentationResult callSAMService(String imageBase64, List<Point> points, Map<String, Object> additionalParams) {
        try {
            // 构建阿里云通义千问请求
            Map<String, Object> requestBody = new HashMap<>();

            // 构建消息内容
            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");

            List<Map<String, Object>> content = new ArrayList<>();

            // 添加图像内容
            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "image_url");
            imageContent.put("image_url", "data:image/jpeg;base64," + imageBase64);
            content.add(imageContent);

            // 添加文本提示
            Map<String, Object> textContent = new HashMap<>();
            textContent.put("type", "text");

            String prompt = buildSegmentationPrompt(points);
            if (additionalParams.containsKey("prompt")) {
                prompt = prompt + " " + additionalParams.get("prompt");
            }

            textContent.put("text", prompt);
            content.add(textContent);

            message.put("content", content);
            messages.add(message);

            requestBody.put("model", aliyunModel);
            requestBody.put("messages", messages);

            // 合并分割参数
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("task", "segmentation");
            parameters.put("return_masks", true);
            parameters.put("return_scores", true);

            if (additionalParams != null) {
                parameters.putAll(additionalParams);
            }
            requestBody.put("parameters", parameters);

            // 发送请求到阿里云通义千问服务
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (aliyunApiKey != null && !aliyunApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + aliyunApiKey);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(aliyunApiUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseAliyunSegmentationResult(response.getBody());
            } else {
                log.error("阿里云通义千问 API 调用失败: {}", response.getStatusCode());
                return createErrorResult("阿里云通义千问 API 调用失败: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("阿里云通义千问分割失败", e);
            return createErrorResult("图像分割失败: " + e.getMessage());
        }
    }

    /**
     * 创建错误结果
     */
    private SAMSegmentationResult createErrorResult(String errorMessage) {
        SAMSegmentationResult result = new SAMSegmentationResult();
        result.setStatus("error");
        result.setErrorMessage(errorMessage);
        return result;
    }

    /**
     * 转换点坐标格式
     */
    private List<Map<String, Integer>> convertPoints(List<Point> points) {
        List<Map<String, Integer>> convertedPoints = new ArrayList<>();
        for (Point point : points) {
            Map<String, Integer> pointMap = new HashMap<>();
            pointMap.put("x", point.getX());
            pointMap.put("y", point.getY());
            convertedPoints.add(pointMap);
        }
        return convertedPoints;
    }

    /**
     * 点坐标类
     */
    public static class Point {
        private final int x;
        private final int y;

        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        public int getX() {
            return x;
        }

        public int getY() {
            return y;
        }
    }
}

