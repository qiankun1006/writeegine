package com.example.writemyself.controller;

import com.example.writemyself.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

/**
 * 文件上传 Controller
 *
 * 提供图片上传接口，将文件存储到本地 uploads 目录并返回 HTTP 可访问的 URL，
 * 模拟对象存储桶（OSS/S3/COS）的行为。
 *
 * 接口列表：
 * - POST /api/upload/image  上传图片文件，返回 URL
 *
 * 迁移说明：
 * 待申请到正式对象存储桶后，只需修改 FileStorageService.saveImageAndGetUrl()
 * 改为上传到桶并返回桶 URL，本 Controller 的接口签名和返回结构无需变动。
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class UploadController {

    private final FileStorageService fileStorageService;

    /** 允许上传的图片 MIME 类型 */
    private static final Set<String> ALLOWED_TYPES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("image/png", "image/jpeg", "image/jpg", "image/webp"))
    );

    /** 最大文件大小：10 MB */
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    /**
     * 上传图片文件
     *
     * POST /api/upload/image
     * Content-Type: multipart/form-data
     *
     * 请求参数：
     * - file (MultipartFile, 必填): 图片文件，支持 PNG / JPG / WEBP，最大 10MB
     *
     * 响应示例（200 OK）：
     * {
     *   "url": "/uploads/2026/04/15/a3f1c2d4_reference.png",
     *   "filename": "a3f1c2d4_reference.png",
     *   "size": 204800,
     *   "contentType": "image/png"
     * }
     *
     * @param file 上传的图片文件
     * @return 包含可访问 URL 的响应
     */
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestPart("file") MultipartFile file) {

        // 1. 基本校验
        if (file == null || file.isEmpty()) {
            return badRequest("文件不能为空");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return badRequest("不支持的文件类型: " + contentType + "，仅支持 PNG / JPG / WEBP");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return badRequest("文件大小超过限制（最大 10MB），当前大小: " + file.getSize() / 1024 + " KB");
        }

        try {
            // 2. 读取文件字节，转为 Base64（复用 FileStorageService 现有接口）
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);

            // 3. 生成唯一文件名（uuid 前缀 + 原始扩展名）
            String originalFilename = file.getOriginalFilename();
            String extension = resolveExtension(contentType, originalFilename);
            String filename = UUID.randomUUID().toString().replace("-", "").substring(0, 12)
                    + "_reference." + extension;

            // 4. 保存并返回 HTTP URL
            String url = fileStorageService.saveImageAndGetUrl(base64, filename);

            log.info("图片上传成功: originalName={}, filename={}, size={} bytes, url={}",
                    originalFilename, filename, bytes.length, url);

            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", filename);
            result.put("size", bytes.length);
            result.put("contentType", contentType);

            return ResponseEntity.ok(result);

        } catch (IOException e) {
            log.error("读取上传文件失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("读取文件失败: " + e.getMessage()));
        } catch (Exception e) {
            log.error("保存上传文件失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("保存文件失败: " + e.getMessage()));
        }
    }

    // -------------------------------------------------------
    // 工具方法
    // -------------------------------------------------------

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(message));
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return body;
    }

    /** 从 contentType 或原始文件名解析扩展名 */
    private String resolveExtension(String contentType, String originalFilename) {
        if (contentType != null) {
            if (contentType.contains("png"))  return "png";
            if (contentType.contains("webp")) return "webp";
            if (contentType.contains("jpeg") || contentType.contains("jpg")) return "jpg";
        }
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        }
        return "png";
    }
}

