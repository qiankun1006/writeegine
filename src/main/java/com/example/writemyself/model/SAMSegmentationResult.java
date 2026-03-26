package com.example.writemyself.model;

import lombok.Data;

import java.util.List;

/**
 * SAM 分割结果数据模型
 */
@Data
public class SAMSegmentationResult {

    /**
     * 分割掩码列表
     */    private List<Mask> masks;

    /**
     * 分割质量分数
     */    private List<Float> scores;

    /**
     * 最佳掩码索引
     */    private int bestMaskIndex;

    /**
     * 分割状态
     */    private String status;

    /**
     * 错误信息（如果有）
     */    private String errorMessage;

    /**
     * 掩码数据
     */
    @Data
    public static class Mask {
        /**
         * 掩码数据（Base64 编码的 PNG）
         */        private String maskData;

        /**
         * 边界框 [x, y, width, height]
         */        private int[] bbox;

        /**
         * 分割质量分数
         */        private float score;

        /**
         * 掩码面积
         */        private int area;
    }

    /**
     * 获取最佳掩码
     */
    public Mask getBestMask() {
        if (masks != null && !masks.isEmpty() && bestMaskIndex < masks.size()) {
            return masks.get(bestMaskIndex);
        }
        return null;
    }

    /**
     * 检查分割是否成功
     */
    public boolean isSuccess() {
        return "success".equals(status) && masks != null && !masks.isEmpty();
    }
}

