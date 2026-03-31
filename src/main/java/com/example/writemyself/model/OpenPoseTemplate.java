package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * OpenPose骨骼模板数据模型
 *
 * 包含完整的骨骼模板信息，包括关键点、连接关系和骨骼线图
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenPoseTemplate {

    /**
     * 模板类型
     * - openpose_18: 18个关键点的标准模板
     * - openpose_25: 25个关键点的高级模板
     */
    private String templateType;

    /**
     * 关键点列表
     * 包含所有关键点的坐标和名称信息
     */
    private List<OpenPosePoint> points;

    /**
     * 骨骼连接线定义
     * 定义哪些关键点之间需要连线形成骨骼
     */
    private List<BoneConnection> connections;

    /**
     * 骨骼线图（Base64编码的PNG图像）
     * 黑色背景，白色骨骼线的标准T-pose图像
     */
    private String skeletonImageBase64;

    /**
     * 模板元数据
     * 包含模板的描述信息、适用场景等
     */
    private Map<String, Object> metadata;

    /**
     * 获取关键点映射（名称 -> 点对象）
     */
    public Map<String, OpenPosePoint> getPointMap() {
        return points.stream()
            .collect(java.util.stream.Collectors.toMap(
                OpenPosePoint::getName,
                point -> point
            ));
    }

    /**
     * 获取指定名称的关键点
     */
    public OpenPosePoint getPointByName(String name) {
        return points.stream()
            .filter(point -> point.getName().equals(name))
            .findFirst()
            .orElse(null);
    }

    /**
     * 获取模板的描述信息
     */
    public String getDescription() {
        return (String) metadata.getOrDefault("description", "OpenPose骨骼模板");
    }

    /**
     * 获取模板的适用场景
     */
    @SuppressWarnings("unchecked")
    public List<String> getUseCases() {
        return (List<String>) metadata.getOrDefault("useCases",
            java.util.Collections.emptyList());
    }

    /**
     * 获取图像尺寸信息
     */
    public int getImageWidth() {
        return (int) metadata.getOrDefault("imageWidth", 512);
    }

    public int getImageHeight() {
        return (int) metadata.getOrDefault("imageHeight", 512);
    }

    /**
     * 骨骼连接关系内部类
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BoneConnection {
        /**
         * 起始关键点名称
         */
        private String fromPoint;

        /**
         * 结束关键点名称
         */
        private String toPoint;

        /**
         * 骨骼名称
         */
        private String boneName;

        /**
         * 骨骼类型
         * - limb: 肢体（手臂、腿）
         * - torso: 躯干
         * - head: 头部
         */
        private String boneType;

        /**
         * 线条粗细（像素）
         */
        private int lineWidth;

        /**
         * 线条颜色（RGB值）
         */
        private int lineColor;

        public BoneConnection(String fromPoint, String toPoint, String boneName) {
            this.fromPoint = fromPoint;
            this.toPoint = toPoint;
            this.boneName = boneName;
            this.boneType = "limb";
            this.lineWidth = 3;
            this.lineColor = 0xFFFFFF; // 白色
        }
    }
}

