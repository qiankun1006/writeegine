package com.example.writemyself.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Flux 图像生成响应模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FluxImageResponse {

    @JsonProperty("images")
    private List<String> images;

    @JsonProperty("parameters")
    private Map<String, Object> parameters;

    @JsonProperty("info")
    private String info;

    // 性能信息
    @JsonProperty("performance")
    private PerformanceInfo performance;

    // 错误信息
    @JsonProperty("error")
    private String error;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceInfo {
        @JsonProperty("generation_time")
        private Double generationTime;

        @JsonProperty("peak_memory_mb")
        private Long peakMemoryMb;

        @JsonProperty("steps_per_second")
        private Double stepsPerSecond;

        @JsonProperty("model_load_time")
        private Double modelLoadTime;
    }

    // 解析响应信息
    public InfoDetails getInfoDetails() {
        if (info == null) return null;
        try {
            // 这里需要根据实际的响应格式进行解析
            // 暂时返回一个简单的对象
            return InfoDetails.builder()
                    .generationTime(performance != null ? performance.getGenerationTime() : 0.0)
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfoDetails {
        private Double generationTime;
        private String seed;
        private String modelHash;
        private String samplerName;
        private Integer steps;
        private Double cfgScale;
    }

    // 获取第一个图像的 Base64 数据（不带 data:image/png;base64, 前缀）
    public String getFirstImageBase64() {
        if (images == null || images.isEmpty()) {
            return null;
        }
        String base64Data = images.get(0);
        // 移除 Base64 前缀（如果存在）
        if (base64Data.startsWith("data:image/")) {
            int commaIndex = base64Data.indexOf(',');
            if (commaIndex > 0) {
                return base64Data.substring(commaIndex + 1);
            }
        }
        return base64Data;
    }

    // 获取完整的第一张图片数据（带 data:image/png;base64, 前缀）
    public String getFirstImageDataUrl() {
        if (images == null || images.isEmpty()) {
            return null;
        }
        String imageData = images.get(0);
        if (!imageData.startsWith("data:image/")) {
            return "data:image/png;base64," + imageData;
        }
        return imageData;
    }
}

