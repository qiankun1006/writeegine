package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 图片编辑器控制器
 * 处理图片编辑器的API请求
 */
@Controller
public class ImageEditorController {

    // 上传文件存储目录
    private static final String UPLOAD_DIR = "uploads/images/";

    // 文档存储目录
    private static final String DOCUMENTS_DIR = "uploads/documents/";

    /**
     * 图片编辑页面
     */
    @GetMapping("/create-game/image")
    public String createGameImage(Model model) {
        model.addAttribute("title", "图片编辑 - 创作游戏");
        return "create-game-image";
    }

    /**
     * 上传图片文件
     */
    @PostMapping("/api/image-editor/upload")
    @ResponseBody
    public Map<String, Object> uploadImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 创建上传目录
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // 保存文件
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.write(filePath, file.getBytes());

            // 返回文件信息
            response.put("success", true);
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());
            response.put("url", "/uploads/images/" + uniqueFilename);

        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "文件上传失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 保存文档
     */
    @PostMapping("/api/image-editor/documents")
    @ResponseBody
    public Map<String, Object> saveDocument(
            @RequestParam("name") String name,
            @RequestParam("data") String documentData,
            @RequestParam(value = "thumbnail", required = false) String thumbnailData) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 创建文档存储目录
            File documentsDir = new File(DOCUMENTS_DIR);
            if (!documentsDir.exists()) {
                documentsDir.mkdirs();
            }

            // 生成文档ID
            String documentId = UUID.randomUUID().toString();

            // 保存文档数据
            Path documentPath = Paths.get(DOCUMENTS_DIR + documentId + ".json");
            Files.write(documentPath, documentData.getBytes());

            // 如果有缩略图，保存缩略图
            if (thumbnailData != null && !thumbnailData.isEmpty()) {
                // 移除base64前缀
                String base64Data = thumbnailData;
                if (thumbnailData.contains(",")) {
                    base64Data = thumbnailData.split(",")[1];
                }

                // 解码base64并保存
                byte[] thumbnailBytes = java.util.Base64.getDecoder().decode(base64Data);
                Path thumbnailPath = Paths.get(DOCUMENTS_DIR + documentId + "_thumb.png");
                Files.write(thumbnailPath, thumbnailBytes);
            }

            // 返回文档信息
            response.put("success", true);
            response.put("documentId", documentId);
            response.put("name", name);
            response.put("createdAt", System.currentTimeMillis());

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "文档保存失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 加载文档
     */
    @GetMapping("/api/image-editor/documents/{documentId}")
    @ResponseBody
    public Map<String, Object> loadDocument(@RequestParam("documentId") String documentId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 读取文档数据
            Path documentPath = Paths.get(DOCUMENTS_DIR + documentId + ".json");
            if (!Files.exists(documentPath)) {
                response.put("success", false);
                response.put("error", "文档不存在");
                return response;
            }

            String documentData = new String(Files.readAllBytes(documentPath));

            // 检查是否有缩略图
            Path thumbnailPath = Paths.get(DOCUMENTS_DIR + documentId + "_thumb.png");
            String thumbnailBase64 = null;
            if (Files.exists(thumbnailPath)) {
                byte[] thumbnailBytes = Files.readAllBytes(thumbnailPath);
                thumbnailBase64 = "data:image/png;base64," +
                    java.util.Base64.getEncoder().encodeToString(thumbnailBytes);
            }

            // 返回文档数据
            response.put("success", true);
            response.put("documentId", documentId);
            response.put("data", documentData);
            response.put("thumbnail", thumbnailBase64);
            response.put("loadedAt", System.currentTimeMillis());

        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "文档加载失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 导出图片
     */
    @PostMapping("/api/image-editor/export")
    @ResponseBody
    public Map<String, Object> exportImage(
            @RequestParam("imageData") String imageData,
            @RequestParam(value = "format", defaultValue = "png") String format,
            @RequestParam(value = "quality", defaultValue = "90") int quality) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 生成导出文件名
            String exportId = UUID.randomUUID().toString();
            String filename = "export_" + exportId + "." + format.toLowerCase();

            // 创建导出目录
            File exportDir = new File("uploads/exports/");
            if (!exportDir.exists()) {
                exportDir.mkdirs();
            }

            // 解码base64图像数据
            String base64Data = imageData;
            if (imageData.contains(",")) {
                base64Data = imageData.split(",")[1];
            }

            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);

            // 保存导出文件
            Path exportPath = Paths.get("uploads/exports/" + filename);
            Files.write(exportPath, imageBytes);

            // 返回导出信息
            response.put("success", true);
            response.put("exportId", exportId);
            response.put("filename", filename);
            response.put("format", format);
            response.put("quality", quality);
            response.put("fileSize", imageBytes.length);
            response.put("url", "/uploads/exports/" + filename);
            response.put("createdAt", System.currentTimeMillis());

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "图片导出失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 获取文档列表
     */
    @GetMapping("/api/image-editor/documents")
    @ResponseBody
    public Map<String, Object> getDocuments() {
        Map<String, Object> response = new HashMap<>();

        try {
            File documentsDir = new File(DOCUMENTS_DIR);
            if (!documentsDir.exists()) {
                response.put("success", true);
                response.put("documents", new java.util.ArrayList<>());
                return response;
            }

            // 扫描文档文件
            File[] documentFiles = documentsDir.listFiles((dir, name) -> name.endsWith(".json"));
            java.util.List<Map<String, Object>> documents = new java.util.ArrayList<>();

            if (documentFiles != null) {
                for (File docFile : documentFiles) {
                    String documentId = docFile.getName().replace(".json", "");

                    // 读取文档元数据（第一行）
                    String firstLine = Files.readAllLines(docFile.toPath()).get(0);

                    Map<String, Object> docInfo = new HashMap<>();
                    docInfo.put("id", documentId);
                    docInfo.put("filename", docFile.getName());
                    docInfo.put("size", docFile.length());
                    docInfo.put("modified", docFile.lastModified());

                    // 尝试解析JSON获取名称
                    try {
                        String content = new String(Files.readAllBytes(docFile.toPath()));
                        if (content.length() > 100) {
                            content = content.substring(0, 100) + "...";
                        }
                        docInfo.put("preview", content);
                    } catch (Exception e) {
                        docInfo.put("preview", "无法预览");
                    }

                    documents.add(docInfo);
                }
            }

            response.put("success", true);
            response.put("documents", documents);
            response.put("count", documents.size());

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "获取文档列表失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 删除文档
     */
    @PostMapping("/api/image-editor/documents/{documentId}/delete")
    @ResponseBody
    public Map<String, Object> deleteDocument(@RequestParam("documentId") String documentId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 删除文档文件
            Path documentPath = Paths.get(DOCUMENTS_DIR + documentId + ".json");
            if (Files.exists(documentPath)) {
                Files.delete(documentPath);
            }

            // 删除缩略图文件
            Path thumbnailPath = Paths.get(DOCUMENTS_DIR + documentId + "_thumb.png");
            if (Files.exists(thumbnailPath)) {
                Files.delete(thumbnailPath);
            }

            response.put("success", true);
            response.put("message", "文档删除成功");
            response.put("documentId", documentId);

        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "文档删除失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * AI对象检测接口（占位符）
     */
    @PostMapping("/api/image-editor/ai/detect")
    @ResponseBody
    public Map<String, Object> detectObjects(
            @RequestParam("imageData") String imageData,
            @RequestParam(value = "model", defaultValue = "coco") String model) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 这里应该是实际的AI模型调用
            // 目前返回模拟数据

            // 模拟检测结果
            java.util.List<Map<String, Object>> detections = new java.util.ArrayList<>();

            // 模拟几个检测对象
            Map<String, Object> obj1 = new HashMap<>();
            obj1.put("label", "person");
            obj1.put("confidence", 0.95);
            obj1.put("bbox", new int[]{100, 100, 200, 300}); // x, y, width, height
            detections.add(obj1);

            Map<String, Object> obj2 = new HashMap<>();
            obj2.put("label", "car");
            obj2.put("confidence", 0.87);
            obj2.put("bbox", new int[]{300, 150, 180, 120});
            detections.add(obj2);

            Map<String, Object> obj3 = new HashMap<>();
            obj3.put("label", "dog");
            obj3.put("confidence", 0.78);
            obj3.put("bbox", new int[]{50, 250, 120, 150});
            detections.add(obj3);

            response.put("success", true);
            response.put("detections", detections);
            response.put("model", model);
            response.put("processingTime", 1250); // 毫秒
            response.put("timestamp", System.currentTimeMillis());

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "对象检测失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * AI内容补全接口（占位符）
     */
    @PostMapping("/api/image-editor/ai/inpaint")
    @ResponseBody
    public Map<String, Object> inpaintImage(
            @RequestParam("imageData") String imageData,
            @RequestParam("maskData") String maskData,
            @RequestParam(value = "method", defaultValue = "telea") String method) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 这里应该是实际的图像修复算法
            // 目前返回模拟结果

            response.put("success", true);
            response.put("method", method);
            response.put("result", "图像修复完成（模拟）");
            response.put("processingTime", 2300); // 毫秒
            response.put("timestamp", System.currentTimeMillis());

            // 返回原图作为模拟结果
            response.put("resultImage", imageData);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "图像修复失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * AI风格转换接口（占位符）
     */
    @PostMapping("/api/image-editor/ai/style-transfer")
    @ResponseBody
    public Map<String, Object> styleTransfer(
            @RequestParam("contentImage") String contentImage,
            @RequestParam("styleImage") String styleImage,
            @RequestParam(value = "styleStrength", defaultValue = "0.5") float styleStrength) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 这里应该是实际的风格迁移算法
            // 目前返回模拟结果

            response.put("success", true);
            response.put("styleStrength", styleStrength);
            response.put("result", "风格转换完成（模拟）");
            response.put("processingTime", 3500); // 毫秒
            response.put("timestamp", System.currentTimeMillis());

            // 返回内容图作为模拟结果
            response.put("resultImage", contentImage);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "风格转换失败: " + e.getMessage());
        }

        return response;
    }
}

