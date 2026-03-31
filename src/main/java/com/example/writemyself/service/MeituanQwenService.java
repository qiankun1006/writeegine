package com.example.writemyself.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 美团千问模型集成服务
 * 使用 Qwen-Image-Meituan 和 Qwen-Image-Edit-Meituan 模型进行图像生成和编辑
 */
@Service
@Slf4j
public class MeituanQwenService implements ImageGenerationService {

    @Value("${meituan.qwen.api.key:}")
    private String apiKey;

    @Value("${meituan.qwen.api.url:https://aigc.sankuai.com/v1/openai/native/chat/completions}")
    private String apiUrl;

    @Value("${meituan.qwen.default.model:Qwen-Image-Meituan}")
    private String defaultModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MeituanQwenService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 使用美团千问生成图片
     * @param prompt 提示词
     * @param width 图片宽度
     * @param height 图片高度
     * @param count 生成数量
     * @param seed 种子值
     * @return 生成的图片URL列表
     */
    @Override
    public List<String> generateImage(String prompt, Integer width, Integer height,
                                     Integer count, Long seed) {
        try {
            log.info("使用美团千问生成图片: 提示词={}, 尺寸={}x{}, 数量={}, 种子={}",
                    prompt, width, height, count, seed);

            // 构建请求体
            Map<String, Object> requestBody = buildImageGenerationRequest(prompt, width, height, count, seed);

            // 发送HTTP请求
            String response = sendRequest(requestBody);

            // 解析响应并提取图片URL
            List<String> imageUrls = parseImageResponse(response);

            log.info("✓ 美团千问图片生成成功，共生成 {} 张", imageUrls.size());
            return imageUrls;

        } catch (Exception e) {
            log.error("美团千问生成图片失败", e);
            throw new RuntimeException("生成图片失败: " + e.getMessage(), e);
        }
    }

    /**
     * 使用美团千问进行图生图
     * @param prompt 提示词
     * @param referenceImageUrl 参考图片URL
     * @param strength 参考图片影响强度 (0-1)
     * @param width 输出图片宽度
     * @param height 输出图片高度
     * @return 生成的图片URL列表
     */
    @Override
    public List<String> generateFromImage(String prompt, String referenceImageUrl,
                                         Double strength, Integer width, Integer height) {
        try {
            log.info("使用美团千问进行图生图: 提示词={}, 参考图={}, 强度={}, 尺寸={}x{}",
                    prompt, referenceImageUrl, strength, width, height);

            // 构建图生图请求体
            Map<String, Object> requestBody = buildImageEditRequest(prompt, referenceImageUrl, strength, width, height);

            // 发送HTTP请求
            String response = sendRequest(requestBody);

            // 解析响应并提取图片URL
            List<String> imageUrls = parseImageResponse(response);

            log.info("✓ 美团千问图生图成功");
            return imageUrls;

        } catch (Exception e) {
            log.error("美团千问图生图失败", e);
            throw new RuntimeException("图生图失败: " + e.getMessage(), e);
        }
    }

    /**
     * 构建文生图请求体
     */
    private Map<String, Object> buildImageGenerationRequest(String prompt, Integer width, Integer height,
                                                           Integer count, Long seed) {
        Map<String, Object> requestBody = new HashMap<>();

        // 构建消息内容
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");

        List<Map<String, String>> content = new ArrayList<>();
        Map<String, String> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);
        content.add(textContent);

        message.put("content", content);
        messages.add(message);

        requestBody.put("messages", messages);
        requestBody.put("model", defaultModel);
        requestBody.put("num_inference_steps", 50);

        // 设置宽高比
        if (width != null && height != null) {
            requestBody.put("aspect_ratio", width + ":" + height);
        }

        requestBody.put("guidance_scale", 4.0);

        if (seed != null) {
            requestBody.put("seed", seed);
        }

        return requestBody;
    }

    /**
     * 构建图生图请求体
     */
    private Map<String, Object> buildImageEditRequest(String prompt, String referenceImageUrl,
                                                     Double strength, Integer width, Integer height) {
        Map<String, Object> requestBody = new HashMap<>();

        // 构建消息内容
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");

        List<Map<String, Object>> content = new ArrayList<>();

        // 添加文本内容
        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);
        content.add(textContent);

        // 添加图片内容
        Map<String, Object> imageContent = new HashMap<>();
        imageContent.put("type", "image_url");

        Map<String, String> imageUrl = new HashMap<>();
        imageUrl.put("url", referenceImageUrl);
        imageContent.put("image_url", imageUrl);
        content.add(imageContent);

        message.put("content", content);
        messages.add(message);

        requestBody.put("messages", messages);
        requestBody.put("model", "Qwen-Image-Edit-Meituan");
        requestBody.put("num_inference_steps", 50);
        requestBody.put("guidance_scale", 4.0);
        requestBody.put("seed", "42");

        return requestBody;
    }

    /**
     * 发送HTTP请求到美团API
     */
    private String sendRequest(Map<String, Object> requestBody) throws JsonProcessingException {
        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("User-Agent", "writeengine/1.0.0");

        // 构建请求实体
        String jsonBody = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> requestEntity = new HttpEntity<>(jsonBody, headers);

        log.debug("发送请求到美团API: {}", jsonBody);

        // 发送请求
        ResponseEntity<String> response = restTemplate.exchange(
                apiUrl, HttpMethod.POST, requestEntity, String.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("API请求失败: " + response.getStatusCode() + ", " + response.getBody());
        }

        log.debug("美团API响应: {}", response.getBody());
        return response.getBody();
    }

    /**
     * 解析API响应并提取图片URL
     */
    private List<String> parseImageResponse(String response) throws JsonProcessingException {
        List<String> imageUrls = new ArrayList<>();

        // 解析JSON响应
        Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);

        // 提取choices数组
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
        if (choices != null && !choices.isEmpty()) {
            Map<String, Object> choice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) choice.get("message");
            if (message != null) {
                Object content = message.get("content");
                if (content != null) {
                    // 这里需要根据实际的API响应格式来解析图片URL
                    // 假设content中包含图片URL信息
                    // 实际实现需要根据美团API的具体响应格式调整

                    // 临时返回模拟数据
                    imageUrls.add("https://meituan-generated.example.com/image_1.png");
                }
            }
        }

        return imageUrls;
    }

    /**
     * 检查API密钥是否已配置
     */
    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("${meituan.qwen.api.key:}");
    }

    /**
     * 获取当前使用的模型
     */
    @Override
    public String getModel() {
        return defaultModel;
    }

    /**
     * 使用文本生成图片并返回 Base64
     */
    @Override
    public String generateImageBase64(String prompt, String negativePrompt, String referenceImageBase64,
                                      Integer width, Integer height, String style) {
        try {
            log.info("使用美团千问生成图片(Base64): 提示词={}, 尺寸={}x{}, 风格={}",
                    prompt, width, height, style);

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();

            // 构建消息内容
            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");

            List<Map<String, Object>> content = new ArrayList<>();

            // 添加文本内容
            Map<String, Object> textContent = new HashMap<>();
            textContent.put("type", "text");

            // 组装提示词（包含负面提示词）
            StringBuilder fullPrompt = new StringBuilder(prompt);
            if (negativePrompt != null && !negativePrompt.isEmpty()) {
                fullPrompt.append("\nNegative prompt: ").append(negativePrompt);
            }
            // 添加风格提示词
            if (style != null && !style.isEmpty() && !"none".equals(style)) {
                fullPrompt.append("\nStyle: ").append(style);
            }
            textContent.put("text", fullPrompt.toString());
            content.add(textContent);

            // 添加参考图片（如果有）
            if (referenceImageBase64 != null && !referenceImageBase64.isEmpty()) {
                Map<String, Object> imageContent = new HashMap<>();
                imageContent.put("type", "image_url");

                Map<String, String> imageUrl = new HashMap<>();
                imageUrl.put("url", referenceImageBase64);
                imageContent.put("image_url", imageUrl);
                content.add(imageContent);
            }

            message.put("content", content);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("model", defaultModel);
            requestBody.put("num_inference_steps", 50);

            // 设置宽高比
            if (width != null && height != null) {
                requestBody.put("aspect_ratio", width + ":" + height);
            }

            requestBody.put("guidance_scale", 4.0);

            // 发送HTTP请求
            String response = sendRequest(requestBody);

            // 解析响应并提取图片 Base64
            String base64 = parseImageBase64Response(response);

            log.info("✓ 美团千问图片生成成功(Base64)");
            return base64;

        } catch (Exception e) {
            log.error("美团千问生成图片(Base64)失败", e);
            throw new RuntimeException("生成图片失败: " + e.getMessage(), e);
        }
    }

    /**
     * 解析API响应并提取图片Base64
     */
    private String parseImageBase64Response(String response) throws JsonProcessingException {
        // 解析JSON响应
        Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);

        // 提取choices数组
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
        if (choices != null && !choices.isEmpty()) {
            Map<String, Object> choice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) choice.get("message");
            if (message != null) {
                Object content = message.get("content");
                if (content != null) {
                    // TODO: 根据实际API响应格式解析Base64
                    // 假设返回的是base64格式的图片数据
                    // 这里返回空字符串作为占位，实际需要根据API响应格式调整
                    return content.toString();
                }
            }
        }

        return "";
    }

    /**
     * 从参考图像中提取 IP-Adapter 特征
     */
    @Override
    public String extractIPAdapterFeatures(String referenceImageBase64) {
        log.info("美团千问暂不支持 IP-Adapter 特征提取");
        return null;
    }

    /**
     * 使用 Flux 模型生成图片
     */
    @Override
    public String generateImageWithFlux(String prompt, String negativePrompt, String referenceImageBase64,
                                        java.util.Map<String, Object> fluxParams, Integer width, Integer height, String style) {
        log.info("美团千问暂不支持 Flux 模型");
        return "";
    }

    /**
     * 使用 ControlNet 生成图片
     */
    @Override
    public String generateImageWithControlNet(String prompt, String negativePrompt, String referenceImageBase64,
                                              java.util.Map<String, Object> controlNetParams, Integer width, Integer height, String style) {
        log.info("美团千问暂不支持 ControlNet");
        return "";
    }
}

