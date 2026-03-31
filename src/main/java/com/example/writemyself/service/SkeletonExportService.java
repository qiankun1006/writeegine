package com.example.writemyself.service;

import com.example.writemyself.model.SkeletonBindingData;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 骨骼动画导出服务
 *
 * 提供将骨骼绑定数据导出为不同动画工具格式的功能：
 * - Spine JSON 格式
 * - DragonBones JSON 格式
 * - 通用 JSON 格式
 */
@Slf4j
@Service
public class SkeletonExportService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 导出为 Spine JSON 格式
     * Spine 是一个流行的 2D 骨骼动画工具
     * 参考: http://esotericsoftware.com/spine-json-format
     */
    public String exportToSpineFormat(SkeletonBindingData bindingData) {
        try {
            ObjectNode spineJson = objectMapper.createObjectNode();

            // Spine 文件基本信息
            spineJson.put("skeleton", createSpineSkeletonInfo(bindingData));
            spineJson.put("spine", "4.1.0"); // Spine 版本
            spineJson.put("hash", ""); // 可以添加图片哈希

            // 骨骼定义
            ArrayNode bonesArray = objectMapper.createArrayNode();
            if (bindingData.getBoneStructure() != null && bindingData.getBoneStructure().getBones() != null) {
                for (SkeletonBindingData.Bone bone : bindingData.getBoneStructure().getBones()) {
                    ObjectNode spineBone = objectMapper.createObjectNode();
                    spineBone.put("name", bone.getName());
                    spineBone.put("x", bone.getX());
                    spineBone.put("y", bone.getY());
                    spineBone.put("rotation", bone.getRotation());
                    spineBone.put("length", bone.getLength());
                    spineBone.put("scaleX", bone.getScaleX());
                    spineBone.put("scaleY", bone.getScaleY());

                    // 设置父骨骼
                    if (bindingData.getBoneStructure().getHierarchy() != null) {
                        for (SkeletonBindingData.BoneHierarchy hierarchy : bindingData.getBoneStructure().getHierarchy()) {
                            if (hierarchy.getBoneName().equals(bone.getName()) && hierarchy.getParentName() != null) {
                                spineBone.put("parent", hierarchy.getParentName());
                                break;
                            }
                        }
                    }

                    bonesArray.add(spineBone);
                }
            }
            spineJson.set("bones", bonesArray);

            // 插槽定义（对应部件）
            ArrayNode slotsArray = objectMapper.createArrayNode();
            if (bindingData.getPartBoneMapping() != null) {
                int slotIndex = 0;
                for (Map.Entry<String, String> entry : bindingData.getPartBoneMapping().entrySet()) {
                    ObjectNode slot = objectMapper.createObjectNode();
                    slot.put("name", entry.getKey());
                    slot.put("bone", entry.getValue());
                    slot.put("attachment", entry.getKey()); // 附件名称与插槽名称相同
                    slot.put("index", slotIndex++);
                    slotsArray.add(slot);
                }
            }
            spineJson.set("slots", slotsArray);

            // 皮肤定义
            ObjectNode skins = objectMapper.createObjectNode();
            ObjectNode defaultSkin = objectMapper.createObjectNode();

            if (bindingData.getPartBoneMapping() != null) {
                for (String partName : bindingData.getPartBoneMapping().keySet()) {
                    ObjectNode attachment = objectMapper.createObjectNode();
                    attachment.put("x", 0); // 可以在 SAM2 分割时计算
                    attachment.put("y", 0);
                    attachment.put("rotation", 0);
                    attachment.put("scaleX", 1);
                    attachment.put("scaleY", 1);
                    attachment.put("width", 100); // 需要从分割结果中获取
                    attachment.put("height", 100);
                    attachment.put("type", "region"); // 区域附件

                    defaultSkin.set(partName, attachment);
                }
            }

            skins.set("default", defaultSkin);
            spineJson.set("skins", skins);

            // 动画定义
            ObjectNode animations = objectMapper.createObjectNode();
            if (bindingData.getAnimationParams() != null && bindingData.getAnimationParams().getDefaultPose() != null) {
                ObjectNode animation = createSpineAnimation(bindingData.getAnimationParams().getDefaultPose());
                animations.set("t_pose", animation);
            }
            spineJson.set("animations", animations);

            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(spineJson);

        } catch (Exception e) {
            log.error("导出 Spine 格式失败", e);
            throw new RuntimeException("导出 Spine 格式失败: " + e.getMessage());
        }
    }

    /**
     * 导出为 DragonBones JSON 格式
     * DragonBones 是另一个流行的 2D 骨骼动画工具
     * 参考: https://github.com/DragonBones/DragonBonesJS
     */
    public String exportToDragonBonesFormat(SkeletonBindingData bindingData) {
        try {
            ObjectNode dragonBonesJson = objectMapper.createObjectNode();

            // DragonBones 文件基本信息
            dragonBonesJson.put("name", "skeleton_" + bindingData.getTemplate());
            dragonBonesJson.put("version", "4.5");
            dragonBonesJson.put("frameRate", 24);
            dragonBonesJson.put("isGlobal", 0);

            // 骨架信息
            ObjectNode armature = objectMapper.createObjectNode();
            armature.put("name", "armature"); // 骨架名称
            armature.put("type", "Armature");
            armature.put("frameRate", 24);

            // 骨骼列表
            ArrayNode boneList = objectMapper.createArrayNode();
            if (bindingData.getBoneStructure() != null && bindingData.getBoneStructure().getBones() != null) {
                for (SkeletonBindingData.Bone bone : bindingData.getBoneStructure().getBones()) {
                    ObjectNode dbBone = objectMapper.createObjectNode();
                    dbBone.put("name", bone.getName());
                    dbBone.put("parent", findParentBone(bone.getName(), bindingData.getBoneStructure().getHierarchy()));
                    dbBone.put("length", bone.getLength());
                    dbBone.put("transform", createDragonBonesTransform(bone));
                    boneList.add(dbBone);
                }
            }
            armature.set("boneList", boneList);

            // 插槽列表
            ArrayNode slotList = objectMapper.createArrayNode();
            if (bindingData.getPartBoneMapping() != null) {
                for (Map.Entry<String, String> entry : bindingData.getPartBoneMapping().entrySet()) {
                    ObjectNode slot = objectMapper.createObjectNode();
                    slot.put("name", entry.getKey());
                    slot.put("parent", entry.getValue());
                    slot.put("displayIndex", 0);
                    slot.put("z", 0);
                    slotList.add(slot);
                }
            }
            armature.set("slotList", slotList);

            // 皮肤列表
            ArrayNode skinList = objectMapper.createArrayNode();
            ObjectNode skin = objectMapper.createObjectNode();
            skin.put("name", "default");

            ArrayNode displayList = objectMapper.createArrayNode();
            if (bindingData.getPartBoneMapping() != null) {
                for (String partName : bindingData.getPartBoneMapping().keySet()) {
                    ObjectNode display = objectMapper.createObjectNode();
                    display.put("name", partName);
                    display.put("type", "image");
                    display.put("path", partName + ".png"); // 假设图片路径
                    display.put("transform", createDragonBonesTransform());
                    displayList.add(display);
                }
            }
            skin.set("displayList", displayList);
            skinList.add(skin);
            armature.set("skinList", skinList);

            // 动画列表
            ArrayNode animationList = objectMapper.createArrayNode();
            if (bindingData.getAnimationParams() != null && bindingData.getAnimationParams().getDefaultPose() != null) {
                ObjectNode animation = createDragonBonesAnimation(bindingData.getAnimationParams().getDefaultPose());
                animationList.add(animation);
            }
            armature.set("animationList", animationList);

            dragonBonesJson.set("armature", armature);

            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(dragonBonesJson);

        } catch (Exception e) {
            log.error("导出 DragonBones 格式失败", e);
            throw new RuntimeException("导出 DragonBones 格式失败: " + e.getMessage());
        }
    }

    /**
     * 导出为通用 JSON 格式（原始格式）
     */
    public String exportToGenericFormat(SkeletonBindingData bindingData) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(bindingData);
        } catch (Exception e) {
            log.error("导出通用格式失败", e);
            throw new RuntimeException("导出通用格式失败: " + e.getMessage());
        }
    }

    // ==================== 私有辅助方法 ====================

    private ObjectNode createSpineSkeletonInfo(SkeletonBindingData bindingData) {
        ObjectNode skeleton = objectMapper.createObjectNode();
        skeleton.put("app", "WriteEngine");
        skeleton.put("version", bindingData.getVersion());
        skeleton.put("hash", ""); // 可以计算图片哈希
        skeleton.put("width", 512); // 默认宽度
        skeleton.put("height", 512); // 默认高度
        skeleton.put("images", "./"); // 图片路径
        return skeleton;
    }

    private ObjectNode createSpineAnimation(SkeletonBindingData.DefaultPose defaultPose) {
        ObjectNode animation = objectMapper.createObjectNode();
        ObjectNode bones = objectMapper.createObjectNode();

        if (defaultPose.getBoneTransforms() != null) {
            for (SkeletonBindingData.BoneTransform transform : defaultPose.getBoneTransforms()) {
                ObjectNode boneAnim = objectMapper.createObjectNode();
                ArrayNode translateTimeline = objectMapper.createArrayNode();

                ObjectNode keyframe = objectMapper.createObjectNode();
                keyframe.put("time", 0);
                keyframe.put("x", transform.getX());
                keyframe.put("y", transform.getY());
                translateTimeline.add(keyframe);

                boneAnim.set("translate", translateTimeline);

                // 添加旋转关键帧
                ArrayNode rotateTimeline = objectMapper.createArrayNode();
                ObjectNode rotateKeyframe = objectMapper.createObjectNode();
                rotateKeyframe.put("time", 0);
                rotateKeyframe.put("angle", transform.getRotation());
                rotateTimeline.add(rotateKeyframe);
                boneAnim.set("rotate", rotateTimeline);

                bones.set(transform.getBoneName(), boneAnim);
            }
        }

        animation.set("bones", bones);
        return animation;
    }

    private String findParentBone(String boneName, List<SkeletonBindingData.BoneHierarchy> hierarchy) {
        if (hierarchy != null) {
            for (SkeletonBindingData.BoneHierarchy h : hierarchy) {
                if (h.getBoneName().equals(boneName)) {
                    return h.getParentName();
                }
            }
        }
        return null;
    }

    private ObjectNode createDragonBonesTransform(SkeletonBindingData.Bone bone) {
        ObjectNode transform = objectMapper.createObjectNode();
        transform.put("x", bone.getX());
        transform.put("y", bone.getY());
        transform.put("skX", bone.getRotation() * Math.PI / 180); // 转换为弧度
        transform.put("skY", bone.getRotation() * Math.PI / 180);
        transform.put("scX", bone.getScaleX());
        transform.put("scY", bone.getScaleY());
        return transform;
    }

    private ObjectNode createDragonBonesTransform() {
        ObjectNode transform = objectMapper.createObjectNode();
        transform.put("x", 0);
        transform.put("y", 0);
        transform.put("skX", 0);
        transform.put("skY", 0);
        transform.put("scX", 1);
        transform.put("scY", 1);
        return transform;
    }

    private ObjectNode createDragonBonesAnimation(SkeletonBindingData.DefaultPose defaultPose) {
        ObjectNode animation = objectMapper.createObjectNode();
        animation.put("name", defaultPose.getName());
        animation.put("duration", defaultPose.getDuration());
        animation.put("playTimes", 0); // 0 表示循环播放
        animation.put("fadeInTime", 0.3f);

        // 时间轴
        ArrayNode timelineList = objectMapper.createArrayNode();
        if (defaultPose.getBoneTransforms() != null) {
            for (SkeletonBindingData.BoneTransform transform : defaultPose.getBoneTransforms()) {
                ObjectNode timeline = objectMapper.createObjectNode();
                timeline.put("name", transform.getBoneName());
                timeline.put("scale", 1);
                timeline.put("offset", 0);

                ArrayNode frameList = objectMapper.createArrayNode();
                ObjectNode frame = objectMapper.createObjectNode();
                frame.put("duration", defaultPose.getDuration());
                frame.put("transform", createDragonBonesTransform());
                frameList.add(frame);

                timeline.set("frameList", frameList);
                timelineList.add(timeline);
            }
        }

        animation.set("timelineList", timelineList);
        return animation;
    }
}

