package com.example.writemyself.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * See-Through 图层分解服务
 *
 * 接入 see-through（SIGGRAPH 2026，shitagaki-lab/see-through）模型，
 * 将单张二次元插画自动分解为最多 23 个语义图层：
 * 头发、面部、眼睛、上衣、下装、配件、武器、盾牌等。
 *
 * <h3>为什么需要这一步</h3>
 * 传统 SAM2 以肢体（骨骼关键点）为粒度分割，无法感知"衣服"、"盾牌"等装备图层。
 * see-through 原生理解动漫语义，每层完整填充（inpainted），带图层绘制顺序（z-order），
 * 是实现"游戏可用骨骼素材"的关键前置步骤。
 *
 * <h3>部署方式</h3>
 * 将 see-through 推理脚本（inference/）包装为独立 HTTP 微服务，本 Service 通过 REST 调用。
 * 若微服务不可用，退化到基于 SAM2 的纯肢体分割（降级策略）。
 *
 * @see <a href="https://github.com/shitagaki-lab/see-through">see-through GitHub</a>
 * @version 1.0
 */
@Service
@Slf4j
public class SeeThroughLayerService {

    // ===================================================
    // 配置项（application.yml 中设置）
    // ===================================================

    /** see-through 推理微服务 URL，例如 http://localhost:8001 */
    @Value("${see.through.api.url:http://localhost:8001}")
    private String seeThroughApiUrl;

    /** 接口超时（秒） */
    @Value("${see.through.api.timeout:120}")
    private int apiTimeoutSeconds;

    /** 最大图层数限制（see-through 最多可输出 23 层） */
    @Value("${see.through.max.layers:23}")
    private int maxLayers;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public SeeThroughLayerService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ===================================================
    // 图层分解结果 DTO
    // ===================================================

    /**
     * 单个图层的分解结果
     */
    public static class Layer {

        /** 图层序号（绘制顺序，越小越靠底层） */
        private final int zOrder;

        /** 图层语义标签，例如：hair / face / eye / upper_cloth / lower_cloth / weapon / shield */
        private final String label;

        /** 图层分类：BODY_PART（肢体）/ EQUIPMENT（装备/配件）/ BACKGROUND（背景） */
        private final String category;

        /** 完整填充的图层图片 Base64（透明背景 PNG） */
        private final String imageBase64;

        /** 图层在原图中的边界框 [x, y, w, h]（像素坐标） */
        private final int[] bbox;

        /** 模型置信度 0-1 */
        private final float confidence;

        public Layer(int zOrder, String label, String category,
                     String imageBase64, int[] bbox, float confidence) {
            this.zOrder = zOrder;
            this.label = label;
            this.category = category;
            this.imageBase64 = imageBase64;
            this.bbox = bbox;
            this.confidence = confidence;
        }

        public int getZOrder()           { return zOrder; }
        public String getLabel()         { return label; }
        public String getCategory()      { return category; }
        public String getImageBase64()   { return imageBase64; }
        public int[] getBbox()           { return bbox; }
        public float getConfidence()     { return confidence; }

        /** 是否是可绑骨骼的肢体图层 */
        public boolean isBodyPart() {
            return "BODY_PART".equals(category);
        }

        /** 是否是可单独挂载的装备图层（武器/盾牌/服装等） */
        public boolean isEquipment() {
            return "EQUIPMENT".equals(category);
        }
    }

    /**
     * 图层分解整体结果
     */
    public static class LayerDecompositionResult {

        private final boolean success;
        private final List<Layer> layers;
        private final String errorMessage;

        /** 分解来源："see_through" 或 "sam2_fallback" */
        private final String source;

        private LayerDecompositionResult(boolean success, List<Layer> layers,
                                          String errorMessage, String source) {
            this.success = success;
            this.layers = layers != null ? layers : Collections.emptyList();
            this.errorMessage = errorMessage;
            this.source = source;
        }

        public static LayerDecompositionResult ofSuccess(List<Layer> layers, String source) {
            return new LayerDecompositionResult(true, layers, null, source);
        }

        public static LayerDecompositionResult ofError(String errorMessage) {
            return new LayerDecompositionResult(false, Collections.emptyList(), errorMessage, "none");
        }

        public boolean isSuccess()           { return success; }
        public List<Layer> getLayers()       { return layers; }
        public String getErrorMessage()      { return errorMessage; }
        public String getSource()            { return source; }

        /** 按 z-order 升序排列的图层（底层在前） */
        public List<Layer> getLayersInDrawOrder() {
            List<Layer> sorted = new ArrayList<>(layers);
            sorted.sort(Comparator.comparingInt(Layer::getZOrder));
            return sorted;
        }

        /** 仅取肢体图层（用于骨骼绑定） */
        public List<Layer> getBodyPartLayers() {
            List<Layer> result = new ArrayList<>();
            for (Layer l : layers) {
                if (l.isBodyPart()) result.add(l);
            }
            return result;
        }

        /** 仅取装备图层（武器/盾牌/服装等，挂载到骨骼 attach point） */
        public List<Layer> getEquipmentLayers() {
            List<Layer> result = new ArrayList<>();
            for (Layer l : layers) {
                if (l.isEquipment()) result.add(l);
            }
            return result;
        }

        /** 转为 partName -> base64 Map（与原有 SAM2 分割接口兼容） */
        public Map<String, String> toPartsMap() {
            Map<String, String> map = new LinkedHashMap<>();
            for (Layer l : layers) {
                map.put(l.getLabel(), l.getImageBase64());
            }
            return map;
        }
    }

    // ===================================================
    // 主接口：图层分解
    // ===================================================

    /**
     * 对单张角色图片执行 see-through 图层分解
     *
     * <p>调用链：
     * <pre>
     * 输入图 Base64
     *   → see-through 推理微服务（/decompose）
     *   → 最多 23 个语义图层（BODY_PART + EQUIPMENT）
     *   → 若微服务不可用，自动降级到 sam2Fallback
     * </pre>
     *
     * @param imageBase64 输入图片 Base64（原始设计稿，不需要提前去背）
     * @param style       角色风格（anime / realistic 等），用于引导模型参数
     * @param prompt      可选的语义描述（用于提升装备/配件识别准确率），可为 null
     * @return 图层分解结果
     */
    public LayerDecompositionResult decomposeIntoLayers(String imageBase64,
                                                         String style,
                                                         String prompt) {
        try {
            log.info("see-through 图层分解开始: style={}, hasPrompt={}", style, prompt != null);

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("image", imageBase64);
            requestBody.put("style", style != null ? style : "anime");
            requestBody.put("max_layers", maxLayers);

            if (prompt != null && !prompt.trim().isEmpty()) {
                requestBody.put("prompt", prompt);
            }

            // 调用 see-through 微服务
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String endpoint = seeThroughApiUrl + "/decompose";
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Layer> layers = parseDecomposeResponse(response.getBody());
                log.info("see-through 图层分解完成: 共 {} 层", layers.size());
                return LayerDecompositionResult.ofSuccess(layers, "see_through");
            } else {
                log.error("see-through API 返回异常状态: {}", response.getStatusCode());
                return LayerDecompositionResult.ofError(
                        "see-through API 返回异常: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("see-through 图层分解调用失败，将降级到 SAM2: {}", e.getMessage());
            // 降级：返回错误由调用方决定是否使用 SAM2 兜底
            return LayerDecompositionResult.ofError("see-through 不可用: " + e.getMessage());
        }
    }

    /**
     * 检查 see-through 微服务是否可用
     *
     * @return true 表示可用
     */
    public boolean isAvailable() {
        try {
            ResponseEntity<String> response =
                    restTemplate.getForEntity(seeThroughApiUrl + "/health", String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.debug("see-through 服务健康检查失败: {}", e.getMessage());
            return false;
        }
    }

    // ===================================================
    // 响应解析
    // ===================================================

    /**
     * 解析 see-through /decompose 接口响应
     *
     * 预期响应格式（与 see-through 推理脚本适配）：
     * <pre>
     * {
     *   "layers": [
     *     {
     *       "z_order": 0,
     *       "label": "hair",
     *       "category": "BODY_PART",
     *       "image": "<base64>",
     *       "bbox": [x, y, w, h],
     *       "confidence": 0.97
     *     },
     *     ...
     *   ]
     * }
     * </pre>
     */
    private List<Layer> parseDecomposeResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        List<Layer> layers = new ArrayList<>();

        if (!root.has("layers") || !root.get("layers").isArray()) {
            throw new RuntimeException("响应格式错误：缺少 layers 字段");
        }

        for (JsonNode node : root.get("layers")) {
            int zOrder      = node.has("z_order")    ? node.get("z_order").asInt()        : layers.size();
            String label    = node.has("label")       ? node.get("label").asText()         : "unknown_" + zOrder;
            String category = node.has("category")    ? node.get("category").asText()      : classifyLabel(label);
            String image    = node.has("image")       ? node.get("image").asText()         : null;
            float conf      = node.has("confidence")  ? (float) node.get("confidence").asDouble() : 1.0f;

            int[] bbox = new int[]{0, 0, 0, 0};
            if (node.has("bbox") && node.get("bbox").isArray() && node.get("bbox").size() == 4) {
                JsonNode bboxNode = node.get("bbox");
                bbox = new int[]{
                        bboxNode.get(0).asInt(), bboxNode.get(1).asInt(),
                        bboxNode.get(2).asInt(), bboxNode.get(3).asInt()
                };
            }

            if (image != null && !image.isEmpty()) {
                layers.add(new Layer(zOrder, label, category, image, bbox, conf));
            }
        }

        // 按 z-order 排序
        layers.sort(Comparator.comparingInt(Layer::getZOrder));
        return layers;
    }

    /**
     * 根据 label 推断 category（当模型未返回 category 字段时）
     */
    private String classifyLabel(String label) {
        if (label == null) return "BODY_PART";
        switch (label.toLowerCase()) {
            // 肢体部件
            case "hair": case "face": case "eye": case "mouth": case "nose":
            case "neck": case "torso": case "body":
            case "left_arm": case "right_arm": case "left_leg": case "right_leg":
            case "left_hand": case "right_hand": case "left_foot": case "right_foot":
                return "BODY_PART";
            // 装备/配件
            case "upper_cloth": case "lower_cloth": case "skirt": case "dress":
            case "hat": case "helmet": case "glasses": case "gloves": case "boots":
            case "weapon": case "sword": case "shield": case "staff": case "bow":
            case "accessory": case "necklace": case "earring": case "bag":
            case "wing": case "tail": case "mask":
                return "EQUIPMENT";
            default:
                return "BODY_PART";
        }
    }
}

