package com.example.writemyself.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

/**
 * 骨骼绑定数据模型
 *
 * 包含骨骼坐标、父子关系、部件-骨骼映射等信息，
 * 可直接或经简单转换后导入Spine、DragonBones等动画工具。
 */
@Data
@Slf4j
public class SkeletonBindingData {

    /** 用于 fromJson 反序列化的共享 ObjectMapper（忽略未知字段，兼容旧版数据） */
    private static final ObjectMapper JSON_MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    /**
     * 从 JSON 字符串反序列化为 SkeletonBindingData 对象
     *
     * 用于 RAG 索引命中时，从文件系统加载历史绑定数据直接复用，
     * 避免重新进行耗时的骨骼绑定计算。
     *
     * @param json JSON 字符串（由 {@link #toJson()} 或 Jackson 序列化产生）
     * @return 反序列化的 SkeletonBindingData，解析失败时返回 null
     */
    public static SkeletonBindingData fromJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return JSON_MAPPER.readValue(json, SkeletonBindingData.class);
        } catch (Exception e) {
            log.warn("SkeletonBindingData JSON 反序列化失败，将降级重新生成: err={}", e.getMessage());
            return null;
        }
    }

    /**
     * 骨骼模板类型
     */
    @JsonProperty("template")
    private String template;

    /**
     * 数据版本
     */
    @JsonProperty("version")
    private String version;

    /**
     * 生成时间
     */
    @JsonProperty("generated_at")
    private String generatedAt;

    /**
     * 骨骼结构定义
     */
    @JsonProperty("bone_structure")
    private BoneStructure boneStructure;

    /**
     * 部件-骨骼映射关系
     */
    @JsonProperty("part_bone_mapping")
    private Map<String, String> partBoneMapping;

    /**
     * 动画参数
     */
    @JsonProperty("animation_params")
    private AnimationParams animationParams;

    /**
     * 导出为JSON字符串
     */
    public String toJson() {
        // 这里应该使用Jackson或其他JSON库进行序列化
        // 暂时返回简单的JSON格式
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"template\":\"").append(template).append("\",");
        json.append("\"version\":\"").append(version).append("\",");
        json.append("\"generated_at\":\"").append(generatedAt).append("\",");
        json.append("\"bone_structure\":").append(boneStructure != null ? boneStructure.toJson() : "{}").append(",");
        json.append("\"part_bone_mapping\":").append(mapToJson(partBoneMapping)).append(",");
        json.append("\"animation_params\":").append(animationParams != null ? animationParams.toJson() : "{}");
        json.append("}");
        return json.toString();
    }

    private String mapToJson(Map<String, String> map) {
        if (map == null || map.isEmpty()) {
            return "{}";
        }
        StringBuilder json = new StringBuilder();
        json.append("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (!first) {
                json.append(",");
            }
            json.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
            first = false;
        }
        json.append("}");
        return json.toString();
    }

    /**
     * 骨骼结构定义
     */
    @Data
    public static class BoneStructure {
        @JsonProperty("bones")
        private List<Bone> bones;

        @JsonProperty("hierarchy")
        private List<BoneHierarchy> hierarchy;

        public String toJson() {
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"bones\":[");
            if (bones != null) {
                for (int i = 0; i < bones.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append(bones.get(i).toJson());
                }
            }
            json.append("],");
            json.append("\"hierarchy\":[");
            if (hierarchy != null) {
                for (int i = 0; i < hierarchy.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append(hierarchy.get(i).toJson());
                }
            }
            json.append("]");
            json.append("}");
            return json.toString();
        }
    }

    /**
     * 骨骼定义
     */
    @Data
    public static class Bone {
        @JsonProperty("name")
        private String name;

        @JsonProperty("index")
        private int index;

        @JsonProperty("x")
        private float x;

        @JsonProperty("y")
        private float y;

        @JsonProperty("length")
        private float length;

        @JsonProperty("rotation")
        private float rotation;

        @JsonProperty("scale_x")
        private float scaleX = 1.0f;

        @JsonProperty("scale_y")
        private float scaleY = 1.0f;

        public String toJson() {
            return String.format(
                "{\"name\":\"%s\",\"index\":%d,\"x\":%.3f,\"y\":%.3f,\"length\":%.3f,\"rotation\":%.3f,\"scale_x\":%.3f,\"scale_y\":%.3f}",
                name, index, x, y, length, rotation, scaleX, scaleY
            );
        }
    }

    /**
     * 骨骼层级关系
     */
    @Data
    public static class BoneHierarchy {
        @JsonProperty("bone")
        private String boneName;

        @JsonProperty("parent")
        private String parentName;

        @JsonProperty("children")
        private List<String> children;

        public String toJson() {
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"bone\":\"").append(boneName).append("\",");
            json.append("\"parent\":");
            json.append(parentName != null ? "\"" + parentName + "\"" : "null");
            json.append(",\"children\":[");
            if (children != null) {
                for (int i = 0; i < children.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append("\"").append(children.get(i)).append("\"");
                }
            }
            json.append("]");
            json.append("}");
            return json.toString();
        }
    }

    /**
     * 动画参数
     */
    @Data
    public static class AnimationParams {
        @JsonProperty("default_pose")
        private DefaultPose defaultPose;

        @JsonProperty("constraints")
        private List<BoneConstraint> constraints;

        @JsonProperty("ik_targets")
        private List<IKTarget> ikTargets;

        public String toJson() {
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"default_pose\":")
                .append(defaultPose != null ? defaultPose.toJson() : "null")
                .append(",");
            json.append("\"constraints\":[");
            if (constraints != null) {
                for (int i = 0; i < constraints.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append(constraints.get(i).toJson());
                }
            }
            json.append("],");
            json.append("\"ik_targets\":[");
            if (ikTargets != null) {
                for (int i = 0; i < ikTargets.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append(ikTargets.get(i).toJson());
                }
            }
            json.append("]");
            json.append("}");
            return json.toString();
        }
    }

    /**
     * 默认姿势
     */
    @Data
    public static class DefaultPose {
        @JsonProperty("name")
        private String name = "t_pose";

        @JsonProperty("duration")
        private int duration = 0;

        @JsonProperty("bones")
        private List<BoneTransform> boneTransforms;

        public String toJson() {
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"name\":\"").append(name).append("\",");
            json.append("\"duration\":").append(duration).append(",");
            json.append("\"bones\":[");
            if (boneTransforms != null) {
                for (int i = 0; i < boneTransforms.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append(boneTransforms.get(i).toJson());
                }
            }
            json.append("]");
            json.append("}");
            return json.toString();
        }
    }

    /**
     * 骨骼变换
     */
    @Data
    public static class BoneTransform {
        @JsonProperty("bone")
        private String boneName;

        @JsonProperty("x")
        private float x;

        @JsonProperty("y")
        private float y;

        @JsonProperty("rotation")
        private float rotation;

        @JsonProperty("scale_x")
        private float scaleX = 1.0f;

        @JsonProperty("scale_y")
        private float scaleY = 1.0f;

        public String toJson() {
            return String.format(
                "{\"bone\":\"%s\",\"x\":%.3f,\"y\":%.3f,\"rotation\":%.3f,\"scale_x\":%.3f,\"scale_y\":%.3f}",
                boneName, x, y, rotation, scaleX, scaleY
            );
        }
    }

    /**
     * 骨骼约束
     */
    @Data
    public static class BoneConstraint {
        @JsonProperty("type")
        private String type; // "rotation", "translation", "scale"

        @JsonProperty("bone")
        private String boneName;

        @JsonProperty("range_min")
        private float rangeMin;

        @JsonProperty("range_max")
        private float rangeMax;

        public String toJson() {
            return String.format(
                "{\"type\":\"%s\",\"bone\":\"%s\",\"range_min\":%.3f,\"range_max\":%.3f}",
                type, boneName, rangeMin, rangeMax
            );
        }
    }

    /**
     * IK目标
     */
    @Data
    public static class IKTarget {
        @JsonProperty("name")
        private String name;

        @JsonProperty("target_bone")
        private String targetBone;

        @JsonProperty("effector_bone")
        private String effectorBone;

        @JsonProperty("iterations")
        private int iterations = 10;

        @JsonProperty("mix")
        private float mix = 1.0f;

        public String toJson() {
            return String.format(
                "{\"name\":\"%s\",\"target_bone\":\"%s\",\"effector_bone\":\"%s\",\"iterations\":%d,\"mix\":%.3f}",
                name, targetBone, effectorBone, iterations, mix
            );
        }
    }
}

