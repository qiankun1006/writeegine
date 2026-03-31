package com.example.writemyself.service;

import com.example.writemyself.model.FluxImageRequest;
import com.example.writemyself.model.FluxImageResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Flux.1-dev 图像生成服务
 * 支持 ControlNet、IP-Adapter 和 LoRA 集成
 */
@Service("fluxImageService")
@Slf4j
public class FluxImageGenerationService implements ImageGenerationService {

    @Value("${flux.api.url:http://localhost:7860}")
    private String fluxApiUrl;

    @Value("${flux.api.key:}")
    private String apiKey;

    @Value("${flux.model:flux.1-dev}")
    private String fluxModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // LoRA 配置映射
    private static final Map<String, String> STYLE_LORA_MAP = new HashMap<>();
    private static final Map<String, String> STRUCTURE_LORA_MAP = new HashMap<>();

    static {
        // 风格 LoRA 映射
        STYLE_LORA_MAP.put("anime", "anime_style_v3");
        STYLE_LORA_MAP.put("realistic", "realistic_human_v2");
        STYLE_LORA_MAP.put("chibi", "chibi_style_v1");
        STYLE_LORA_MAP.put("cartoon", "cartoon_style_v2");
        STYLE_LORA_MAP.put("pixel", "pixel_art_v1");
        STYLE_LORA_MAP.put("cyberpunk", "cyberpunk_style");
        STYLE_LORA_MAP.put("fantasy", "fantasy_art_v1");

        // 结构 LoRA 映射
        STRUCTURE_LORA_MAP.put("human_structure", "human_structure_v2");
        STRUCTURE_LORA_MAP.put("anatomy", "anatomy_reference");
        STRUCTURE_LORA_MAP.put("pose_correct", "pose_correction");
    }

    public FluxImageGenerationService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public List<String> generateImage(String prompt, Integer width, Integer height, Integer count, Long seed) {
        throw new UnsupportedOperationException("请使用 Flux 专用方法");
    }

    @Override
    public List<String> generateFromImage(String prompt, String referenceImageUrl, Double strength, Integer width, Integer height) {
        throw new UnsupportedOperationException("请使用 Flux 专用方法");
    }

    @Override
    public boolean isConfigured() {
        return fluxApiUrl != null && !fluxApiUrl.isEmpty() && !fluxApiUrl.equals("${flux.api.url}");
    }

    @Override
    public String getModel() {
        return fluxModel;
    }

    @Override
    public String generateImageBase64(String prompt, String negativePrompt, String referenceImageBase64,
                                     Integer width, Integer height, String style) {
        log.info("Flux 基础图片生成: 提示词={}, 尺寸={}x{}, 风格={}", prompt, width, height, style);

        // 构建基础 Flux 请求
        FluxImageRequest request = FluxImageRequest.builder()
                .prompt(prompt)
                .negativePrompt(negativePrompt)
                .width(width)
                .height(height)
                .numInferenceSteps(30)
                .guidanceScale(7.5)
                .model(fluxModel)
                .build();

        // 添加风格 LoRA
        addStyleLora(request, style);

        try {
            FluxImageResponse response = callFluxApi(request);
            if (response != null && response.getImages() != null && !response.getImages().isEmpty()) {
                return response.getImages().get(0);
            }
            throw new RuntimeException("Flux API 返回空结果");
        } catch (Exception e) {
            log.error("Flux 基础图片生成失败", e);
            throw new RuntimeException("Flux 图片生成失败: " + e.getMessage());
        }
    }

    @Override
    public String generateImageWithControlNet(String prompt, String negativePrompt, String controlImageBase64,
                                             Map<String, Object> controlNetParams, Integer width, Integer height, String style) {
        log.info("Flux ControlNet 图片生成: 提示词={}, 尺寸={}x{}, 风格={}", prompt, width, height, style);

        // 构建 Flux 请求
        FluxImageRequest request = FluxImageRequest.builder()
                .prompt(prompt)
                .negativePrompt(negativePrompt)
                .width(width)
                .height(height)
                .numInferenceSteps(50)
                .guidanceScale(7.5)
                .model(fluxModel)
                .build();

        // 添加 ControlNet 配置
        Map<String, Object> controlNetConfig = new HashMap<>();
        controlNetConfig.put("enabled", true);
        controlNetConfig.put("control_image", controlImageBase64);
        controlNetConfig.putAll(controlNetParams);
        request.setControlNetConfig(controlNetConfig);

        // 添加风格 LoRA
        addStyleLora(request, style);

        // 添加结构 LoRA
        addStructureLora(request);

        try {
            FluxImageResponse response = callFluxApi(request);
            if (response != null && response.getImages() != null && !response.getImages().isEmpty()) {
                return response.getImages().get(0);
            }
            throw new RuntimeException("Flux ControlNet API 返回空结果");
        } catch (Exception e) {
            log.error("Flux ControlNet 图片生成失败", e);
            throw new RuntimeException("Flux ControlNet 图片生成失败: " + e.getMessage());
        }
    }

    @Override
    public String generateImageWithFlux(String prompt, String negativePrompt, String referenceImageBase64,
                                       Map<String, Object> fluxParams, Integer width, Integer height, String style) {
        log.info("Flux.1-dev 高清图片生成: 提示词={}, 尺寸={}x{}, 风格={}", prompt, width, height, style);

        // 构建 Flux.1-dev 请求
        FluxImageRequest request = FluxImageRequest.builder()
                .prompt(prompt)
                .negativePrompt(negativePrompt)
                .width(width)
                .height(height)
                .numInferenceSteps(fluxParams.containsKey("num_inference_steps") ?
                        (Integer) fluxParams.get("num_inference_steps") : 50)
                .guidanceScale(fluxParams.containsKey("guidance_scale") ?
                        (Double) fluxParams.get("guidance_scale") : 7.5)
                .model(fluxModel)
                .build();

        // 添加 IP-Adapter 特征
        if (fluxParams.containsKey("ip_adapter_features")) {
            request.setIpAdapterFeatures((String) fluxParams.get("ip_adapter_features"));
        }

        // 添加 LoRA 列表
        if (fluxParams.containsKey("lora_list")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> loraList = (List<Map<String, Object>>) fluxParams.get("lora_list");
            request.setLoraList(loraList);
        }

        // 添加高级配置
        request.setMaxSequenceLength(fluxParams.containsKey("max_sequence_length") ?
                (Integer) fluxParams.get("max_sequence_length") : 512);
        request.setClipSkip(fluxParams.containsKey("clip_skip") ?
                (Integer) fluxParams.get("clip_skip") : 2);

        // 添加风格 LoRA
        addStyleLora(request, style);

        // 添加结构 LoRA
        addStructureLora(request);

        // 如果有参考图，添加参考图配置
        if (referenceImageBase64 != null && !referenceImageBase64.isEmpty()) {
            Map<String, Object> referenceConfig = new HashMap<>();
            referenceConfig.put("reference_image", referenceImageBase64);
            referenceConfig.put("strength", fluxParams.getOrDefault("reference_strength", 0.3));
            request.setReferenceConfig(referenceConfig);
        }

        try {
            FluxImageResponse response = callFluxApi(request);
            if (response != null && response.getImages() != null && !response.getImages().isEmpty()) {
                return response.getImages().get(0);
            }
            throw new RuntimeException("Flux.1-dev API 返回空结果");
        } catch (Exception e) {
            log.error("Flux.1-dev 高清图片生成失败", e);
            throw new RuntimeException("Flux.1-dev 高清图片生成失败: " + e.getMessage());
        }
    }

    @Override
    public String extractIPAdapterFeatures(String referenceImageBase64) {
        log.info("提取 IP-Adapter 特征");

        try {
            // 调用 IP-Adapter 特征提取接口
            Map<String, Object> ipAdapterRequest = new HashMap<>();
            ipAdapterRequest.put("image", referenceImageBase64);
            ipAdapterRequest.put("model", "ip-adapter-plus-face");

            // 这里应该调用实际的 IP-Adapter 特征提取服务
            // 暂时返回特征标识符
            String featuresJson = "{\"features\": \"" + referenceImageBase64.substring(0, Math.min(100, referenceImageBase64.length())) + "\", \"model\": \"ip-adapter-plus-face\"}";
            return Base64.getEncoder().encodeToString(featuresJson.getBytes());

        } catch (Exception e) {
            log.error("提取 IP-Adapter 特征失败", e);
            throw new RuntimeException("IP-Adapter 特征提取失败: " + e.getMessage());
        }
    }

    /**
     * 调用 Flux API
     */
    private FluxImageResponse callFluxApi(FluxImageRequest request) {
        try {
            log.debug("调用 Flux API: model={}, steps={}, guidance={}",
                    request.getModel(), request.getNumInferenceSteps(), request.getGuidanceScale());

            // 设置请求头
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + apiKey);
            }

            // 构建 HTTP 请求
            org.springframework.http.HttpEntity<FluxImageRequest> httpEntity =
                    new org.springframework.http.HttpEntity<>(request, headers);

            // 发送请求
            String apiEndpoint = fluxApiUrl + "/sdapi/v1/txt2img";
            log.debug("调用 Flux API 端点: {}", apiEndpoint);

            org.springframework.http.ResponseEntity<String> responseEntity =
                    restTemplate.postForEntity(apiEndpoint, httpEntity, String.class);

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                String responseBody = responseEntity.getBody();
                log.debug("Flux API 响应成功");
                return objectMapper.readValue(responseBody, FluxImageResponse.class);
            } else {
                log.error("Flux API 调用失败: 状态码={}, 响应={}",
                        responseEntity.getStatusCode(), responseEntity.getBody());
                throw new RuntimeException("Flux API 调用失败: " + responseEntity.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Flux API 调用异常", e);
            throw new RuntimeException("Flux API 调用失败: " + e.getMessage());
        }
    }

    /**
     * 添加风格 LoRA 到请求
     */
    private void addStyleLora(FluxImageRequest request, String style) {
        if (style != null && !style.isEmpty() && !"none".equals(style)) {
            String loraName = STYLE_LORA_MAP.getOrDefault(style, "anime_style_v3");

            List<Map<String, Object>> loraList = request.getLoraList();
            if (loraList == null) {
                loraList = new ArrayList<>();
                request.setLoraList(loraList);
            }

            Map<String, Object> styleLora = new HashMap<>();
            styleLora.put("name", loraName);
            styleLora.put("weight", 0.8);
            styleLora.put("type", "style");
            loraList.add(styleLora);
        }
    }

    /**
     * 添加结构 LoRA 到请求
     */
    private void addStructureLora(FluxImageRequest request) {
        List<Map<String, Object>> loraList = request.getLoraList();
        if (loraList == null) {
            loraList = new ArrayList<>();
            request.setLoraList(loraList);
        }

        Map<String, Object> structureLora = new HashMap<>();
        structureLora.put("name", STRUCTURE_LORA_MAP.get("human_structure"));
        structureLora.put("weight", 0.6);
        structureLora.put("type", "structure");
        loraList.add(structureLora);
    }
}

