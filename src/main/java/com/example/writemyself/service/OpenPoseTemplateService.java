package com.example.writemyself.service;

import com.example.writemyself.model.OpenPosePoint;
import com.example.writemyself.model.OpenPoseTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.*;

/**
 * OpenPose骨骼模板生成服务
 *
 * 负责生成标准T-pose骨骼模板，包括关键点坐标和骨骼线图
 */
@Service
@Slf4j
public class OpenPoseTemplateService {

    private static final int DEFAULT_IMAGE_SIZE = 512;
    private static final Color BACKGROUND_COLOR = Color.BLACK;
    private static final Color SKELETON_COLOR = Color.WHITE;
    private static final int LINE_WIDTH = 4;

    /**
     * 生成OpenPose骨骼模板
     *
     * @param templateType 模板类型 (openpose_18, openpose_25)
     * @return 完整的骨骼模板对象
     */
    public OpenPoseTemplate generateTemplate(String templateType) {
        log.info("生成OpenPose骨骼模板: type={}", templateType);

        // 获取关键点定义
        List<OpenPosePoint> points = getTemplatePoints(templateType);

        // 获取骨骼连接关系
        List<OpenPoseTemplate.BoneConnection> connections = getBoneConnections(templateType);

        // 生成骨骼线图
        BufferedImage skeletonImage = drawSkeletonImage(points, connections, DEFAULT_IMAGE_SIZE, DEFAULT_IMAGE_SIZE);
        String skeletonImageBase64 = convertToBase64(skeletonImage);

        // 创建元数据
        Map<String, Object> metadata = createMetadata(templateType);

        OpenPoseTemplate template = OpenPoseTemplate.builder()
            .templateType(templateType)
            .points(points)
            .connections(connections)
            .skeletonImageBase64(skeletonImageBase64)
            .metadata(metadata)
            .build();

        log.info("OpenPose骨骼模板生成完成: type={}, points={}", templateType, points.size());
        return template;
    }

    /**
     * 获取OpenPose 18点模板的关键点
     */
    private List<OpenPosePoint> getOpenPose18Points() {
        return Arrays.asList(
            // 头部和躯干
            new OpenPosePoint(0, "Nose", 0.5f, 0.15f),
            new OpenPosePoint(1, "Neck", 0.5f, 0.25f),

            // 右臂
            new OpenPosePoint(2, "RShoulder", 0.58f, 0.25f),
            new OpenPosePoint(3, "RElbow", 0.68f, 0.40f),
            new OpenPosePoint(4, "RWrist", 0.78f, 0.55f),

            // 左臂
            new OpenPosePoint(5, "LShoulder", 0.42f, 0.25f),
            new OpenPosePoint(6, "LElbow", 0.32f, 0.40f),
            new OpenPosePoint(7, "LWrist", 0.22f, 0.55f),

            // 右腿
            new OpenPosePoint(8, "RHip", 0.54f, 0.50f),
            new OpenPosePoint(9, "RKnee", 0.54f, 0.70f),
            new OpenPosePoint(10, "RAnkle", 0.54f, 0.90f),

            // 左腿
            new OpenPosePoint(11, "LHip", 0.46f, 0.50f),
            new OpenPosePoint(12, "LKnee", 0.46f, 0.70f),
            new OpenPosePoint(13, "LAnkle", 0.46f, 0.90f),

            // 面部特征
            new OpenPosePoint(14, "REye", 0.53f, 0.13f),
            new OpenPosePoint(15, "LEye", 0.47f, 0.13f),
            new OpenPosePoint(16, "REar", 0.57f, 0.15f),
            new OpenPosePoint(17, "LEar", 0.43f, 0.15f)
        );
    }

    /**
     * 获取OpenPose 25点模板的关键点
     */
    private List<OpenPosePoint> getOpenPose25Points() {
        List<OpenPosePoint> points = new ArrayList<>(getOpenPose18Points());

        // 添加额外的足部关键点
        points.addAll(Arrays.asList(
            new OpenPosePoint(18, "LBigToe", 0.44f, 0.95f),
            new OpenPosePoint(19, "LSmallToe", 0.48f, 0.95f),
            new OpenPosePoint(20, "LHeel", 0.46f, 0.95f),
            new OpenPosePoint(21, "RBigToe", 0.52f, 0.95f),
            new OpenPosePoint(22, "RSmallToe", 0.56f, 0.95f),
            new OpenPosePoint(23, "RHeel", 0.54f, 0.95f),
            new OpenPosePoint(24, "Background", 0.0f, 0.0f) // 背景点（不使用）
        ));

        return points;
    }

    /**
     * 获取模板的关键点
     */
    private List<OpenPosePoint> getTemplatePoints(String templateType) {
        switch (templateType.toLowerCase()) {
            case "openpose_18":
                return getOpenPose18Points();
            case "openpose_25":
                return getOpenPose25Points();
            default:
                throw new IllegalArgumentException("不支持的模板类型: " + templateType +
                    "，支持的类型: openpose_18, openpose_25");
        }
    }

    /**
     * 获取骨骼连接关系
     */
    private List<OpenPoseTemplate.BoneConnection> getBoneConnections(String templateType) {
        List<OpenPoseTemplate.BoneConnection> connections = new ArrayList<>();

        // 基础连接关系（18点和25点通用）
        connections.addAll(Arrays.asList(
            // 头部连接
            new OpenPoseTemplate.BoneConnection("Nose", "REye", "NoseToREye"),
            new OpenPoseTemplate.BoneConnection("Nose", "LEye", "NoseToLEye"),
            new OpenPoseTemplate.BoneConnection("REye", "REar", "REyeToREar"),
            new OpenPoseTemplate.BoneConnection("LEye", "LEar", "LEyeToLEar"),
            new OpenPoseTemplate.BoneConnection("Neck", "Nose", "NeckToNose"),

            // 躯干连接
            new OpenPoseTemplate.BoneConnection("Neck", "RShoulder", "NeckToRShoulder"),
            new OpenPoseTemplate.BoneConnection("Neck", "LShoulder", "NeckToLShoulder"),
            new OpenPoseTemplate.BoneConnection("RShoulder", "RHip", "RShoulderToRHip"),
            new OpenPoseTemplate.BoneConnection("LShoulder", "LHip", "LShoulderToLHip"),
            new OpenPoseTemplate.BoneConnection("RHip", "LHip", "RHipToLHip"),

            // 右臂
            new OpenPoseTemplate.BoneConnection("RShoulder", "RElbow", "RUpperArm"),
            new OpenPoseTemplate.BoneConnection("RElbow", "RWrist", "RForearm"),

            // 左臂
            new OpenPoseTemplate.BoneConnection("LShoulder", "LElbow", "LUpperArm"),
            new OpenPoseTemplate.BoneConnection("LElbow", "LWrist", "LForearm"),

            // 右腿
            new OpenPoseTemplate.BoneConnection("RHip", "RKnee", "RThigh"),
            new OpenPoseTemplate.BoneConnection("RKnee", "RAnkle", "RCalf"),

            // 左腿
            new OpenPoseTemplate.BoneConnection("LHip", "LKnee", "LThigh"),
            new OpenPoseTemplate.BoneConnection("LKnee", "LAnkle", "LCalf")
        ));

        // 25点模板的额外足部连接
        if ("openpose_25".equals(templateType)) {
            connections.addAll(Arrays.asList(
                new OpenPoseTemplate.BoneConnection("LAnkle", "LHeel", "LAnkleToLHeel"),
                new OpenPoseTemplate.BoneConnection("LAnkle", "LBigToe", "LAnkleToLBigToe"),
                new OpenPoseTemplate.BoneConnection("LAnkle", "LSmallToe", "LAnkleToLSmallToe"),
                new OpenPoseTemplate.BoneConnection("LBigToe", "LSmallToe", "LBigToeToLSmallToe"),
                new OpenPoseTemplate.BoneConnection("RAnkle", "RHeel", "RAnkleToRHeel"),
                new OpenPoseTemplate.BoneConnection("RAnkle", "RBigToe", "RAnkleToRBigToe"),
                new OpenPoseTemplate.BoneConnection("RAnkle", "RSmallToe", "RAnkleToRSmallToe"),
                new OpenPoseTemplate.BoneConnection("RBigToe", "RSmallToe", "RBigToeToRSmallToe")
            ));
        }

        return connections;
    }

    /**
     * 绘制骨骼线图
     */
    private BufferedImage drawSkeletonImage(List<OpenPosePoint> points,
            List<OpenPoseTemplate.BoneConnection> connections, int width, int height) {

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();

        // 设置渲染质量
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);

        // 绘制背景
        g2d.setColor(BACKGROUND_COLOR);
        g2d.fillRect(0, 0, width, height);

        // 设置画笔
        g2d.setColor(SKELETON_COLOR);
        g2d.setStroke(new BasicStroke(LINE_WIDTH, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        // 创建关键点映射以便快速查找
        Map<String, OpenPosePoint> pointMap = points.stream()
            .collect(java.util.stream.Collectors.toMap(OpenPosePoint::getName, point -> point));

        // 绘制骨骼连接线
        for (OpenPoseTemplate.BoneConnection connection : connections) {
            OpenPosePoint fromPoint = pointMap.get(connection.getFromPoint());
            OpenPosePoint toPoint = pointMap.get(connection.getToPoint());

            if (fromPoint != null && toPoint != null) {
                int[] fromCoords = fromPoint.toAbsoluteCoordinates(width, height);
                int[] toCoords = toPoint.toAbsoluteCoordinates(width, height);

                g2d.drawLine(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
            }
        }

        // 绘制关键点（圆形）
        int pointRadius = 6;
        g2d.setStroke(new BasicStroke(2));
        for (OpenPosePoint point : points) {
            if (point.getConfidence() > 0) { // 只绘制有效的关键点
                int[] coords = point.toAbsoluteCoordinates(width, height);
                g2d.drawOval(coords[0] - pointRadius, coords[1] - pointRadius,
                           pointRadius * 2, pointRadius * 2);
            }
        }

        g2d.dispose();
        return image;
    }

    /**
     * 将BufferedImage转换为Base64字符串
     */
    private String convertToBase64(BufferedImage image) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            log.error("图像转换为Base64失败", e);
            throw new RuntimeException("图像转换失败", e);
        }
    }

    /**
     * 创建模板元数据
     */
    private Map<String, Object> createMetadata(String templateType) {
        Map<String, Object> metadata = new HashMap<>();

        metadata.put("imageWidth", DEFAULT_IMAGE_SIZE);
        metadata.put("imageHeight", DEFAULT_IMAGE_SIZE);
        metadata.put("createdAt", new Date());

        if ("openpose_18".equals(templateType)) {
            metadata.put("description", "OpenPose 18点标准人体骨骼模板");
            metadata.put("useCases", Arrays.asList("基础动画", "姿态估计", "游戏角色"));
            metadata.put("pointCount", 18);
            metadata.put("suitableFor", "基础骨骼绑定和简单动画");
        } else if ("openpose_25".equals(templateType)) {
            metadata.put("description", "OpenPose 25点高级人体骨骼模板（包含足部细节）");
            metadata.put("useCases", Arrays.asList("高级动画", "精确姿态估计", "专业游戏开发"));
            metadata.put("pointCount", 25);
            metadata.put("suitableFor", "高级骨骼绑定和复杂动画");
        }

        return metadata;
    }

    /**
     * 获取可用的模板类型列表
     */
    public List<String> getAvailableTemplateTypes() {
        return Arrays.asList("openpose_18", "openpose_25");
    }

    /**
     * 验证模板类型是否支持
     */
    public boolean isTemplateTypeSupported(String templateType) {
        return getAvailableTemplateTypes().contains(templateType.toLowerCase());
    }

    /**
     * 获取模板信息（不包含图像数据，用于列表展示）
     */
    public Map<String, Object> getTemplateInfo(String templateType) {
        if (!isTemplateTypeSupported(templateType)) {
            throw new IllegalArgumentException("不支持的模板类型: " + templateType);
        }

        Map<String, Object> info = new HashMap<>();
        info.put("templateType", templateType);
        info.put("pointCount", "openpose_18".equals(templateType) ? 18 : 25);
        info.put("description", createMetadata(templateType).get("description"));
        info.put("useCases", createMetadata(templateType).get("useCases"));

        return info;
    }

    /**
     * 获取模板对象
     */
    public OpenPoseTemplate getTemplate(String templateType) {
        return generateTemplate(templateType);
    }

    /**
     * 生成骨骼图像
     */
    public BufferedImage generateSkeletonImage(OpenPoseTemplate template, int width, int height) {
        return drawSkeletonImage(template.getPoints(), template.getConnections(), width, height);
    }

    /**
     * 获取关键点列表作为 Point 对象
     */
    public List<Point> getKeyPointsAsPoints(OpenPoseTemplate template) {
        List<Point> points = new ArrayList<>();
        for (OpenPosePoint openPosePoint : template.getPoints()) {
            if (openPosePoint.getConfidence() > 0) {
                points.add(new Point(openPosePoint.getId(), openPosePoint.getX(), openPosePoint.getY()));
            }
        }
        return points;
    }

    /**
     * 生成骨骼结构数据
     */
    public Map<String, Object> generateBoneStructure(OpenPoseTemplate template) {
        Map<String, Object> boneStructure = new HashMap<>();
        List<Map<String, Object>> bones = new ArrayList<>();

        for (OpenPoseTemplate.BoneConnection conn : template.getConnections()) {
            Map<String, Object> bone = new HashMap<>();
            bone.put("from", conn.getFromPoint());
            bone.put("to", conn.getToPoint());
            bone.put("name", conn.getBoneName());
            bones.add(bone);
        }

        boneStructure.put("bones", bones);
        boneStructure.put("pointCount", template.getPoints().size());
        boneStructure.put("boneCount", bones.size());

        return boneStructure;
    }

    /**
     * 获取默认动画参数
     */
    public Map<String, Object> getDefaultAnimationParams(String templateType) {
        Map<String, Object> params = new HashMap<>();
        params.put("idleAnimation", true);
        params.put("loopAnimation", true);
        params.put("frameRate", 30);
        params.put("duration", 1000); // ms

        if ("openpose_18".equals(templateType)) {
            params.put("smoothing", 0.8);
            params.put("interpolation", "linear");
        } else {
            params.put("smoothing", 0.9);
            params.put("interpolation", "cubic");
        }

        return params;
    }

    /**
     * Point内部类用于表示坐标点
     */
    public static class Point {
        private final int id;
        private final float x;
        private final float y;

        public Point(int id, float x, float y) {
            this.id = id;
            this.x = x;
            this.y = y;
        }

        public int getId() { return id; }
        public float getX() { return x; }
        public float getY() { return y; }
    }
}

