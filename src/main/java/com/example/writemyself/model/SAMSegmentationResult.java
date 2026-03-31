package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SAM 分割结果模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SAMSegmentationResult {

    /**
     * 分割状态
     */
    private String status;

    /**
     * 分割质量分数列表
     */
    private java.util.List<Float> scores;

    /**
     * 最佳掩码索引
     */
    private int bestMaskIndex;

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 最佳分割掩码 (Base64 编码)
     */
    private String bestMask;

    /**
     * 所有掩码列表
     */
    private java.util.List<Mask> masks;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 分割置信度
     */
    private double confidence;

    /**
     * 创建成功结果
     */
    public static SAMSegmentationResult success(String bestMask, java.util.List<Mask> masks, double confidence) {
        return SAMSegmentationResult.builder()
                .success(true)
                .status("success")
                .bestMask(bestMask)
                .masks(masks)
                .confidence(confidence)
                .build();
    }

    /**
     * 创建失败结果
     */
    public static SAMSegmentationResult failure(String errorMessage) {
        return SAMSegmentationResult.builder()
                .success(false)
                .status("error")
                .errorMessage(errorMessage)
                .build();
    }

    public boolean isSuccess() {
        return success || "success".equals(status);
    }

    /**
     * 设置分割状态
     */
    public void setStatus(String status) {
        this.status = status;
        if ("success".equals(status)) {
            this.success = true;
        }
    }

    /**
     * 获取最佳掩码对象
     */
    public Mask getBestMask() {
        if (masks != null && !masks.isEmpty() && bestMaskIndex < masks.size()) {
            return masks.get(bestMaskIndex);
        }
        return masks != null && !masks.isEmpty() ? masks.get(0) : null;
    }

    /**
     * 分割掩码内部类
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Mask {
        /**
         * 掩码数据 (Base64 编码)
         */
        private String maskData;

        /**
         * 边界框 [x, y, width, height] - 兼容旧代码
         */
        private int[] bbox;

        /**
         * 边界框 (新版本)
         */
        private BoundingBox boundingBox;

        /**
         * 置信度
         */
        private double score;

        /**
         * 面积
         */
        private int area;

        /**
         * 设置边界框 (兼容旧代码)
         */
        public void setBbox(int[] bbox) {
            this.bbox = bbox;
            // 同时设置 BoundingBox 对象
            if (bbox != null && bbox.length >= 4) {
                this.boundingBox = new BoundingBox(bbox[0], bbox[1], bbox[0] + bbox[2], bbox[1] + bbox[3]);
            }
        }
    }

    /**
     * 边界框内部类
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoundingBox {
        /**
         * 左上角 x 坐标 (归一化 0-1)
         */
        private double x1;

        /**
         * 左上角 y 坐标 (归一化 0-1)
         */
        private double y1;

        /**
         * 右下角 x 坐标 (归一化 0-1)
         */
        private double x2;

        /**
         * 右下角 y 坐标 (归一化 0-1)
         */
        private double y2;
    }
}

