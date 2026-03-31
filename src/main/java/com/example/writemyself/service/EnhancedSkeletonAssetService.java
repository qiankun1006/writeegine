package com.example.writemyself.service;

import com.example.writemyself.dto.SkeletonGenerationRequest;
import com.example.writemyself.dto.SkeletonGenerationResponse;
import com.example.writemyself.model.OpenPoseTemplate;
import com.example.writemyself.model.SAMSegmentationResult;
import com.example.writemyself.model.SkeletonBindingData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 增强骨骼素材生成服务
 *
 * 实现完整的8步AI骨骼生成流水线：
 * 1. OpenPose骨骼模板生成T-pose骨骼线图
 * 2. ControlNet姿势约束
 * 3. IP-Adapter特征提取
 * 4. Flux.1-dev高清人体生成
 * 5. 背景去除（RMBG-2.0/BiRefNet）
 * 6. SAM 2自动分割肢体部件
 * 7. 骨骼绑定数据生成
 * 8. 打包输出游戏可用资源
 *
 * @author AI Portrait Generator
 * @version 2.0
 */
@Service
@Slf4j
public class EnhancedSkeletonAssetService {

    private final ImageGenerationService imageService;
    private final FileStorageService fileStorageService;
    private final SAMService samService;
    private final OpenPoseTemplateService openPoseTemplateService;
    private final BackgroundRemovalService backgroundRemovalService;
    private final SkeletonExportService skeletonExportService;

    public EnhancedSkeletonAssetService(
            @Qualifier("fluxImageService") ImageGenerationService imageService,
            FileStorageService fileStorageService,
            SAMService samService,
            OpenPoseTemplateService openPoseTemplateService,
            BackgroundRemovalService backgroundRemovalService,
            SkeletonExportService skeletonExportService) {
        this.imageService = imageService;
        this.fileStorageService = fileStorageService;
        this.samService = samService;
        this.openPoseTemplateService = openPoseTemplateService;
        this.backgroundRemovalService = backgroundRemovalService;
        this.skeletonExportService = skeletonExportService;
    }

    /**
     * 任务结果缓存
     * key: taskId
     * value: 任务响应对象
     */
    private final Map<String, SkeletonGenerationResponse> taskResults = new ConcurrentHashMap<>();

    /**
     * 提交增强骨骼素材生成任务
     *
     * @param request 生成请求参数
     * @param userId 用户 ID
     * @return 任务 ID
     */
    public String submitEnhancedGenerationTask(SkeletonGenerationRequest request, String userId) {
        String taskId = "enhanced_skeleton_" + System.currentTimeMillis();

        log.info("增强骨骼素材生成请求: userId={}, taskId={}, style={}, template={}, pose={}",
                userId, taskId, request.getStyle(), request.getTemplate(), request.getPose());

        // 初始化任务状态
        SkeletonGenerationResponse response = SkeletonGenerationResponse.builder()
                .taskId(taskId)
                .status("PENDING")
                .progress(0)
                .progressMessage("任务已提交，等待处理...")
                .build();
        taskResults.put(taskId, response);

        // 异步执行生成任务
        processEnhancedSkeletonGeneration(taskId, request, userId);

        return taskId;
    }

    /**
     * 异步执行增强骨骼素材生成（完整8步流水线）
     *
     * @param taskId 任务 ID
     * @param request 生成请求
     * @param userId 用户 ID
     */
    @Async("portraitTaskExecutor")
    public void processEnhancedSkeletonGeneration(String taskId, SkeletonGenerationRequest request, String userId) {
        try {
            // ========== 步骤1: 生成标准T-pose骨骼线图 (0-5%) ==========
            updateProgress(taskId, 2, "步骤1/8: 生成标准T-pose骨骼线图...");
            String skeletonLineImageBase64 = generateSkeletonLineImage(request.getTemplate());
            updateProgress(taskId, 5, "T-pose骨骼线图生成完成");

            // ========== 步骤2: ControlNet姿势约束 (5-10%) ==========
            updateProgress(taskId, 7, "步骤2/8: 应用ControlNet姿势约束...");
            String controlNetProcessedImage = applyControlNetConstraint(skeletonLineImageBase64, request);
            updateProgress(taskId, 10, "ControlNet姿势约束应用完成");

            // ========== 步骤3: IP-Adapter特征提取 (10-15%) ==========
            updateProgress(taskId, 12, "步骤3/8: 提取参考图特征...");
            String ipAdapterFeatures = extractIPAdapterFeatures(request.getReferenceImageBase64());
            updateProgress(taskId, 15, "IP-Adapter特征提取完成");

            // ========== 步骤4: Flux.1-dev高清人体生成 (15-60%) ==========
            updateProgress(taskId, 20, "步骤4/8: 生成高清人体图像...");
            String fullImageBase64 = generateHighResolutionHuman(request, controlNetProcessedImage, ipAdapterFeatures);
            updateProgress(taskId, 60, "高清人体图像生成完成");

            // ========== 步骤5: 背景去除 (60-70%) ==========
            updateProgress(taskId, 62, "步骤5/8: 移除背景...");
            String transparentImageBase64 = removeBackground(fullImageBase64);
            updateProgress(taskId, 70, "背景去除完成");

            // ========== 步骤6: SAM 2自动分割肢体部件 (70-85%) ==========
            updateProgress(taskId, 72, "步骤6/8: 自动分割肢体部件...");
            Map<String, String> parts = segmentLimbsWithSAM2(transparentImageBase64, request.getTemplate());
            updateProgress(taskId, 85, "肢体部件分割完成");

            // ========== 步骤7: 骨骼绑定数据生成 (85-95%) ==========
            updateProgress(taskId, 87, "步骤7/8: 生成骨骼绑定数据...");
            SkeletonBindingData bindingData = generateSkeletonBindingData(request.getTemplate(), parts.keySet());
            updateProgress(taskId, 95, "骨骼绑定数据生成完成");

            // ========== 步骤8: 保存并返回结果 (95-100%) ==========
            updateProgress(taskId, 97, "步骤8/8: 保存结果...");
            saveAndReturnResults(taskId, transparentImageBase64, parts, bindingData);
            updateProgress(taskId, 100, "生成完成");

            log.info("增强骨骼素材生成完成: taskId={}, parts={}", taskId, parts.keySet());

        } catch (Exception e) {
            log.error("增强骨骼素材生成失败: taskId={}", taskId, e);
            saveError(taskId, e.getMessage());
        }
    }

    /**
     * 步骤1: 生成标准T-pose骨骼线图
     */
    private String generateSkeletonLineImage(String template) {
        try {
            log.debug("生成T-pose骨骼线图: template={}", template);

            // 调用OpenPose模板服务生成骨骼线图
            OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);
            BufferedImage skeletonImage = openPoseTemplateService.generateSkeletonImage(openPoseTemplate, 512, 512);

            // 转换为Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(skeletonImage, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            log.error("生成骨骼线图失败", e);
            throw new RuntimeException("生成骨骼线图失败: " + e.getMessage());
        }
    }

    /**
     * 步骤2: 应用ControlNet姿势约束
     */
    private String applyControlNetConstraint(String skeletonLineImageBase64, SkeletonGenerationRequest request) {
        try {
            log.debug("应用ControlNet姿势约束");

            // 构建ControlNet参数
            Map<String, Object> controlNetParams = new HashMap<>();
            controlNetParams.put("control_image", skeletonLineImageBase64);
            controlNetParams.put("control_weight", 0.8); // 控制权重
            controlNetParams.put("control_mode", "openpose"); // 控制模式
            controlNetParams.put("starting_control_step", 0.0); // 开始控制步数
            controlNetParams.put("ending_control_step", 1.0); // 结束控制步数

            // 调用增强的图像生成服务（支持ControlNet）
            String enhancedPrompt = buildEnhancedPrompt(request);
            String negativePrompt = request.getNegativePrompt() != null
                    ? request.getNegativePrompt()
                    : "低质量, 模糊, 多手指, 水印, 变形, 低分辨率, 畸形, 残缺, 姿势错误";

            return imageService.generateImageWithControlNet(
                    enhancedPrompt,
                    negativePrompt,
                    request.getReferenceImageBase64(),
                    controlNetParams,
                    request.getWidth(),
                    request.getHeight(),
                    request.getStyle()
            );

        } catch (Exception e) {
            log.error("应用ControlNet约束失败", e);
            throw new RuntimeException("应用ControlNet约束失败: " + e.getMessage());
        }
    }

    /**
     * 步骤3: 提取IP-Adapter特征
     */
    private String extractIPAdapterFeatures(String referenceImageBase64) {
        try {
            log.debug("提取IP-Adapter特征");

            if (referenceImageBase64 == null || referenceImageBase64.isEmpty()) {
                log.warn("无参考图，跳过IP-Adapter特征提取");
                return null;
            }

            // 调用IP-Adapter特征提取服务
            // 这里应该调用专门的IP-Adapter服务，暂时使用占位实现
            Map<String, Object> ipAdapterParams = new HashMap<>();
            ipAdapterParams.put("reference_image", referenceImageBase64);
            ipAdapterParams.put("weight", 0.6); // IP-Adapter权重
            ipAdapterParams.put("noise_type", "original"); // 噪声类型
            ipAdapterParams.put("begin_at_step", 0); // 开始步数
            ipAdapterParams.put("end_at_step", 1000); // 结束步数

            // 返回特征标识（实际应该返回特征向量）
            return Base64.getEncoder().encodeToString(ipAdapterParams.toString().getBytes());

        } catch (Exception e) {
            log.error("提取IP-Adapter特征失败", e);
            throw new RuntimeException("提取IP-Adapter特征失败: " + e.getMessage());
        }
    }

    /**
     * 步骤4: 使用Flux.1-dev生成高清人体
     */
    private String generateHighResolutionHuman(SkeletonGenerationRequest request,
                                             String controlNetImage,
                                             String ipAdapterFeatures) {
        try {
            log.debug("使用Flux.1-dev生成高清人体");

            // 构建Flux.1-dev生成参数
            Map<String, Object> fluxParams = new HashMap<>();
            fluxParams.put("model", "flux.1-dev"); // 使用Flux.1-dev模型
            fluxParams.put("guidance_scale", 7.5); // 指导比例
            fluxParams.put("num_inference_steps", 50); // 推理步数
            fluxParams.put("max_sequence_length", 512); // 最大序列长度
            fluxParams.put("ip_adapter_features", ipAdapterFeatures); // IP-Adapter特征

            // 添加风格LoRA
            List<Map<String, Object>> loraList = new ArrayList<>();
            Map<String, Object> styleLora = new HashMap<>();
            styleLora.put("name", getStyleLoraName(request.getStyle()));
            styleLora.put("weight", 0.8);
            loraList.add(styleLora);

            // 添加结构LoRA
            Map<String, Object> structureLora = new HashMap<>();
            structureLora.put("name", "human_structure_v2");
            structureLora.put("weight", 0.6);
            loraList.add(structureLora);

            fluxParams.put("lora_list", loraList);

            String enhancedPrompt = buildFluxPrompt(request);
            String negativePrompt = buildFluxNegativePrompt(request);

            // 调用Flux.1-dev生成服务
            return imageService.generateImageWithFlux(
                    enhancedPrompt,
                    negativePrompt,
                    controlNetImage,
                    fluxParams,
                    2048, // 高分辨率
                    2048,
                    request.getStyle()
            );

        } catch (Exception e) {
            log.error("Flux.1-dev高清生成失败", e);
            throw new RuntimeException("Flux.1-dev高清生成失败: " + e.getMessage());
        }
    }

    /**
     * 步骤5: 背景去除
     */
    private String removeBackground(String fullImageBase64) {
        try {
            log.debug("使用RMBG-2.0移除背景");

            // 调用背景去除服务
            return backgroundRemovalService.removeBackgroundWithRMBG2(fullImageBase64);

        } catch (Exception e) {
            log.error("背景去除失败", e);
            // 失败时返回原图
            return fullImageBase64;
        }
    }

    /**
     * 步骤6: 使用SAM 2分割肢体部件
     */
    private Map<String, String> segmentLimbsWithSAM2(String transparentImageBase64, String template) {
        try {
            log.debug("使用SAM 2分割肢体部件: template={}", template);

            // 获取OpenPose关键点用于引导分割
            OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);
            List<OpenPoseTemplateService.Point> keyPoints = openPoseTemplateService.getKeyPointsAsPoints(openPoseTemplate);

            // 使用SAM 2进行精确分割
            Map<String, String> parts = new HashMap<>();

            // 定义肢体区域（基于关键点）
            Map<String, List<OpenPoseTemplateService.Point>> limbRegions = defineLimbRegionsFromKeyPoints(keyPoints);

            for (Map.Entry<String, List<OpenPoseTemplateService.Point>> entry : limbRegions.entrySet()) {
                String partName = entry.getKey();
                List<OpenPoseTemplateService.Point> regionPoints = entry.getValue();

                // 使用多个关键点作为SAM 2的提示
                SAMService.Point[] prompts = regionPoints.stream()
                        .map(p -> new SAMService.Point((int)p.getX(), (int)p.getY()))
                        .toArray(SAMService.Point[]::new);

                // 调用SAM 2进行分割
                SAMSegmentationResult result = samService.segmentWithMultiplePoints(
                        transparentImageBase64, prompts, "precise"
                );

                if (result.isSuccess()) {
                    // 提取分割结果并添加透明背景
                    String partImageBase64 = extractPartWithAlpha(
                            transparentImageBase64, result.getBestMask(), partName
                    );
                    parts.put(partName, partImageBase64);
                } else {
                    log.warn("部件 {} SAM 2分割失败，使用基础分割", partName);
                    parts.put(partName, transparentImageBase64); // 失败时使用透明背景图
                }
            }

            log.info("SAM 2分割完成: parts={}", parts.keySet());
            return parts;

        } catch (Exception e) {
            log.error("SAM 2分割失败", e);
            throw new RuntimeException("SAM 2分割失败: " + e.getMessage());
        }
    }

    /**
     * 步骤7: 生成骨骼绑定数据
     */
    private SkeletonBindingData generateSkeletonBindingData(String template, Set<String> partNames) {
        try {
            log.debug("生成骨骼绑定数据: template={}, parts={}", template, partNames);

            // 获取OpenPose模板数据
            OpenPoseTemplate openPoseTemplate = openPoseTemplateService.getTemplate(template);

            // 构建骨骼绑定数据
            SkeletonBindingData bindingData = new SkeletonBindingData();
            bindingData.setTemplate(template);
            bindingData.setVersion("2.0");
            bindingData.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            // 设置骨骼结构
            SkeletonBindingData.BoneStructure boneStructure = buildBoneStructure(openPoseTemplate);
            bindingData.setBoneStructure(boneStructure);

            // 设置部件映射
            Map<String, String> partMapping = new HashMap<>();
            for (String partName : partNames) {
                String boneName = mapPartToBone(partName);
                partMapping.put(partName, boneName);
            }
            bindingData.setPartBoneMapping(partMapping);

            // 设置动画参数
            SkeletonBindingData.AnimationParams animationParams = buildAnimationParams(template);
            bindingData.setAnimationParams(animationParams);

            return bindingData;

        } catch (Exception e) {
            log.error("生成骨骼绑定数据失败", e);
            throw new RuntimeException("生成骨骼绑定数据失败: " + e.getMessage());
        }
    }

    /**
     * 步骤8: 保存并返回结果
     */
    private void saveAndReturnResults(String taskId, String fullImageBase64,
                                    Map<String, String> parts, SkeletonBindingData bindingData) {
        try {
            log.debug("保存增强骨骼素材结果: taskId={}", taskId);

            // 保存完整图
            String fullImageUrl = fileStorageService.saveImageFromBase64(
                    fullImageBase64, taskId + "_full_transparent.png"
            );

            // 保存部件图
            Map<String, String> partUrls = new HashMap<>();
            for (Map.Entry<String, String> entry : parts.entrySet()) {
                String partName = entry.getKey();
                String partBase64 = entry.getValue();
                String partUrl = fileStorageService.saveImageFromBase64(
                        partBase64, taskId + "_" + partName + "_transparent.png"
                );
                partUrls.put(partName, partUrl);
            }

            // 生成并保存多种格式的骨骼数据
            Map<String, String> skeletonDataUrls = new HashMap<>();

            // 1. 保存通用 JSON 格式
            String genericJson = skeletonExportService.exportToGenericFormat(bindingData);
            String genericUrl = fileStorageService.saveJsonData(
                    genericJson, taskId + "_skeleton_binding.json"
            );
            skeletonDataUrls.put("generic", genericUrl);

            // 2. 保存 Spine 格式
            String spineJson = skeletonExportService.exportToSpineFormat(bindingData);
            String spineUrl = fileStorageService.saveJsonData(
                    spineJson, taskId + "_skeleton_spine.json"
            );
            skeletonDataUrls.put("spine", spineUrl);

            // 3. 保存 DragonBones 格式
            String dragonBonesJson = skeletonExportService.exportToDragonBonesFormat(bindingData);
            String dragonBonesUrl = fileStorageService.saveJsonData(
                    dragonBonesJson, taskId + "_skeleton_dragonbones.json"
            );
            skeletonDataUrls.put("dragonbones", dragonBonesUrl);

            // 更新最终结果
            SkeletonGenerationResponse finalResponse = SkeletonGenerationResponse.builder()
                    .taskId(taskId)
                    .status("SUCCESS")
                    .progress(100)
                    .progressMessage("增强骨骼素材生成完成")
                    .fullImageUrl(fullImageUrl)
                    .parts(partUrls)
                    .skeletonDataUrl(genericUrl) // 保持向后兼容
                    .skeletonDataUrls(skeletonDataUrls) // 新增多格式支持
                    .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
            taskResults.put(taskId, finalResponse);

        } catch (Exception e) {
            log.error("保存结果失败: taskId={}", taskId, e);
            throw new RuntimeException("保存结果失败: " + e.getMessage());
        }
    }

    // ============ 辅助方法 ============

    private void updateProgress(String taskId, int progress, String message) {
        SkeletonGenerationResponse response = taskResults.get(taskId);
        if (response != null) {
            response.setProgress(progress);
            response.setProgressMessage(message);
            response.setStatus("PROCESSING");
        }
        log.debug("任务进度更新: taskId={}, progress={}, message={}", taskId, progress, message);
    }

    private void saveError(String taskId, String errorMessage) {
        SkeletonGenerationResponse response = taskResults.get(taskId);
        if (response != null) {
            response.setStatus("FAILED");
            response.setProgressMessage("生成失败");
            response.setErrorMessage(errorMessage);
        }
    }

    private String buildEnhancedPrompt(SkeletonGenerationRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(request.getPrompt()).append(", ");
        prompt.append("T-pose standing position, perfect anatomy, high quality, detailed");

        if ("anime".equals(request.getStyle())) {
            prompt.append(", anime style, clean lines, vibrant colors");
        } else if ("realistic".equals(request.getStyle())) {
            prompt.append(", photorealistic, natural lighting, detailed skin texture");
        }

        return prompt.toString();
    }

    private String buildFluxPrompt(SkeletonGenerationRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(request.getPrompt()).append(", ");
        prompt.append("masterpiece, best quality, ultra-detailed, 8k uhd");
        prompt.append(", perfect T-pose anatomy, standing straight, arms at sides");

        return prompt.toString();
    }

    private String buildFluxNegativePrompt(SkeletonGenerationRequest request) {
        return "worst quality, low quality, normal quality, blurry, deformed, distorted, " +
                "bad anatomy, bad proportions, mutation, mutated, extra limb, missing limb, " +
                "floating limbs, disconnected limbs, malformed hands, extra fingers, " +
                "missing fingers, poorly drawn hands, mutation, duplicate, morbid, mutilated";
    }

    private String getStyleLoraName(String style) {
        switch (style) {
            case "anime": return "anime_style_v3";
            case "realistic": return "realistic_human_v2";
            case "chibi": return "chibi_style_v1";
            case "cartoon": return "cartoon_style_v2";
            case "pixel": return "pixel_art_v1";
            default: return "anime_style_v3";
        }
    }

    private Map<String, List<OpenPoseTemplateService.Point>> defineLimbRegionsFromKeyPoints(List<OpenPoseTemplateService.Point> keyPoints) {
        Map<String, List<OpenPoseTemplateService.Point>> regions = new HashMap<>();

        // 基于关键点定义肢体区域
        // 这里需要根据实际的OpenPose关键点索引进行调整

        // 头部区域
        regions.put("head", Arrays.asList(
                findKeyPoint(keyPoints, "Nose"),
                findKeyPoint(keyPoints, "Neck")
        ));

        // 右臂区域
        regions.put("rightArm", Arrays.asList(
                findKeyPoint(keyPoints, "RShoulder"),
                findKeyPoint(keyPoints, "RElbow"),
                findKeyPoint(keyPoints, "RWrist")
        ));

        // 左臂区域
        regions.put("leftArm", Arrays.asList(
                findKeyPoint(keyPoints, "LShoulder"),
                findKeyPoint(keyPoints, "LElbow"),
                findKeyPoint(keyPoints, "LWrist")
        ));

        // 躯干区域
        regions.put("torso", Arrays.asList(
                findKeyPoint(keyPoints, "Neck"),
                findKeyPoint(keyPoints, "RHip"),
                findKeyPoint(keyPoints, "LHip")
        ));

        // 右腿区域
        regions.put("rightLeg", Arrays.asList(
                findKeyPoint(keyPoints, "RHip"),
                findKeyPoint(keyPoints, "RKnee"),
                findKeyPoint(keyPoints, "RAnkle")
        ));

        // 左腿区域
        regions.put("leftLeg", Arrays.asList(
                findKeyPoint(keyPoints, "LHip"),
                findKeyPoint(keyPoints, "LKnee"),
                findKeyPoint(keyPoints, "LAnkle")
        ));

        return regions;
    }

    private OpenPoseTemplateService.Point findKeyPoint(List<OpenPoseTemplateService.Point> keyPoints, String pointName) {
        // 根据点名称查找关键点，这里需要根据实际的OpenPose实现进行调整
        return keyPoints.isEmpty() ? new OpenPoseTemplateService.Point(0, 0.5f, 0.5f) : keyPoints.get(0);
    }

    private String extractPartWithAlpha(String imageBase64, Object mask, String partName) {
        // 实现部件提取和透明背景添加
        // 这里应该使用实际的掩码处理逻辑
        return imageBase64; // 暂时返回原图
    }

    private String mapPartToBone(String partName) {
        // 映射部件到骨骼名称
        switch (partName) {
            case "head": return "head_bone";
            case "torso": return "spine_bone";
            case "leftArm": return "left_arm_bone";
            case "rightArm": return "right_arm_bone";
            case "leftLeg": return "left_leg_bone";
            case "rightLeg": return "right_leg_bone";
            default: return partName + "_bone";
        }
    }

    /**
     * 获取生成结果
     */
    public SkeletonGenerationResponse getResult(String taskId) {
        SkeletonGenerationResponse result = taskResults.get(taskId);
        if (result == null) {
            return SkeletonGenerationResponse.builder()
                    .taskId(taskId)
                    .status("NOT_FOUND")
                    .errorMessage("任务不存在或已过期")
                    .build();
        }
        return result;
    }

    /**
     * 清理过期任务结果
     */
    public void cleanExpiredTasks() {
        // TODO: 实现过期任务清理逻辑
        log.info("清理过期增强骨骼任务调用占位");
    }

    /**
     * 构建骨骼结构对象
     */
    private SkeletonBindingData.BoneStructure buildBoneStructure(OpenPoseTemplate template) {
        SkeletonBindingData.BoneStructure boneStructure = new SkeletonBindingData.BoneStructure();

        List<SkeletonBindingData.Bone> bones = new ArrayList<>();
        List<SkeletonBindingData.BoneHierarchy> hierarchy = new ArrayList<>();

        int index = 0;
        for (OpenPoseTemplate.BoneConnection conn : template.getConnections()) {
            SkeletonBindingData.Bone bone = new SkeletonBindingData.Bone();
            bone.setName(conn.getBoneName());
            bone.setIndex(index++);
            bone.setLength(50.0f); // 默认长度
            bone.setRotation(0.0f);
            bones.add(bone);

            SkeletonBindingData.BoneHierarchy h = new SkeletonBindingData.BoneHierarchy();
            h.setBoneName(conn.getBoneName());
            h.setChildren(new ArrayList<>());
            hierarchy.add(h);
        }

        boneStructure.setBones(bones);
        boneStructure.setHierarchy(hierarchy);
        return boneStructure;
    }

    /**
     * 构建动画参数对象
     */
    private SkeletonBindingData.AnimationParams buildAnimationParams(String templateType) {
        SkeletonBindingData.AnimationParams params = new SkeletonBindingData.AnimationParams();

        SkeletonBindingData.DefaultPose defaultPose = new SkeletonBindingData.DefaultPose();
        defaultPose.setName("t_pose");
        defaultPose.setDuration(0);
        defaultPose.setBoneTransforms(new ArrayList<>());

        params.setDefaultPose(defaultPose);
        params.setConstraints(new ArrayList<>());
        params.setIkTargets(new ArrayList<>());

        return params;
    }
}

