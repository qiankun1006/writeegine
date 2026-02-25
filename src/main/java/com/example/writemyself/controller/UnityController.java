package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Unity 编辑器控制器
 * 提供 Unity 编辑器页面的路由和 API 接口
 */
@Controller
public class UnityController {

    /**
     * Unity 编辑器页面
     * 与图片编辑器和地图编辑器同级的功能入口
     */
    @GetMapping("/create-game/unity")
    public String createGameUnity(Model model) {
        model.addAttribute("title", "Unity 编辑器 - 创作游戏");
        model.addAttribute("editorType", "unity");
        model.addAttribute("version", "1.0.0");

        // 添加编辑器配置信息
        Map<String, Object> editorConfig = new HashMap<>();
        editorConfig.put("name", "Unity 编辑器");
        editorConfig.put("description", "基于 Three.js 的在线 3D 游戏场景编辑器");
        editorConfig.put("supportedFormats", new String[]{"json", "gltf", "obj"});
        editorConfig.put("maxFileSize", 50 * 1024 * 1024); // 50MB
        editorConfig.put("defaultScene", getDefaultSceneConfig());

        model.addAttribute("editorConfig", editorConfig);
        return "create-game-unity";
    }

    /**
     * 获取默认场景配置
     */
    private Map<String, Object> getDefaultSceneConfig() {
        Map<String, Object> scene = new HashMap<>();
        scene.put("name", "默认场景");
        scene.put("backgroundColor", "#1a1a1a");
        scene.put("gridSize", 1.0);
        scene.put("gridEnabled", true);
        scene.put("axesEnabled", true);

        // 默认摄像机配置
        Map<String, Object> camera = new HashMap<>();
        camera.put("position", Map.of("x", 0.0, "y", 5.0, "z", 10.0));
        camera.put("target", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
        camera.put("fov", 60.0);
        camera.put("type", "perspective");
        scene.put("camera", camera);

        // 默认光照配置
        Map<String, Object> lights = new HashMap<>();
        lights.put("ambient", Map.of("color", "#ffffff", "intensity", 0.5));
        lights.put("directional", Map.of(
            "color", "#ffffff",
            "intensity", 0.8,
            "position", Map.of("x", 10.0, "y", 10.0, "z", 10.0)
        ));
        scene.put("lights", lights);

        return scene;
    }

    /**
     * 保存场景数据 API
     */
    @PostMapping("/api/unity/scene/save")
    @ResponseBody
    public Map<String, Object> saveScene(@RequestBody Map<String, Object> sceneData) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 这里应该将场景数据保存到数据库或文件系统
            // 目前先返回成功响应

            String sceneId = "scene_" + System.currentTimeMillis();
            response.put("success", true);
            response.put("sceneId", sceneId);
            response.put("message", "场景保存成功");
            response.put("timestamp", System.currentTimeMillis());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "保存失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 加载场景数据 API
     */
    @GetMapping("/api/unity/scene/load")
    @ResponseBody
    public Map<String, Object> loadScene(@RequestParam String sceneId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 这里应该从数据库或文件系统加载场景数据
            // 目前先返回示例数据

            Map<String, Object> scene = getDefaultSceneConfig();
            scene.put("id", sceneId);
            scene.put("name", "示例场景");
            scene.put("lastModified", System.currentTimeMillis());

            response.put("success", true);
            response.put("scene", scene);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "加载失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 导入 3D 模型文件 API
     */
    @PostMapping("/api/unity/model/import")
    @ResponseBody
    public Map<String, Object> importModel(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "format", defaultValue = "auto") String format) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 检查文件大小
            if (file.getSize() > 50 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "文件大小超过 50MB 限制");
                return response;
            }

            // 检查文件格式
            String fileName = file.getOriginalFilename();
            String fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

            if (!isSupportedFormat(fileExtension)) {
                response.put("success", false);
                response.put("message", "不支持的文件格式: " + fileExtension);
                response.put("supportedFormats", new String[]{"gltf", "glb", "obj", "fbx", "json"});
                return response;
            }

            // 这里应该处理文件上传和解析
            // 目前先返回成功响应

            String modelId = "model_" + System.currentTimeMillis();
            response.put("success", true);
            response.put("modelId", modelId);
            response.put("fileName", fileName);
            response.put("fileSize", file.getSize());
            response.put("format", fileExtension);
            response.put("message", "模型导入成功");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "导入失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 导出场景数据 API
     */
    @PostMapping("/api/unity/scene/export")
    @ResponseBody
    public Map<String, Object> exportScene(
            @RequestBody Map<String, Object> exportRequest,
            @RequestParam(value = "format", defaultValue = "json") String format) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 这里应该根据格式生成导出文件
            // 目前先返回成功响应

            String exportId = "export_" + System.currentTimeMillis();
            response.put("success", true);
            response.put("exportId", exportId);
            response.put("format", format);
            response.put("downloadUrl", "/api/unity/scene/download/" + exportId);
            response.put("message", "导出成功");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "导出失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 获取场景列表 API
     */
    @GetMapping("/api/unity/scene/list")
    @ResponseBody
    public Map<String, Object> getSceneList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 这里应该从数据库获取场景列表
            // 目前先返回示例数据

            Map<String, Object>[] scenes = new Map[3];
            for (int i = 0; i < 3; i++) {
                Map<String, Object> scene = new HashMap<>();
                scene.put("id", "scene_" + (i + 1));
                scene.put("name", "示例场景 " + (i + 1));
                scene.put("thumbnail", "/static/images/unity/thumbnail_" + (i + 1) + ".png");
                scene.put("objectCount", (i + 1) * 5);
                scene.put("lastModified", System.currentTimeMillis() - i * 86400000L);
                scene.put("size", (i + 1) * 1024 * 1024L);
                scenes[i] = scene;
            }

            response.put("success", true);
            response.put("scenes", scenes);
            response.put("total", 3);
            response.put("page", page);
            response.put("pageSize", pageSize);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取列表失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 检查支持的格式
     */
    private boolean isSupportedFormat(String format) {
        String[] supportedFormats = {"gltf", "glb", "obj", "fbx", "json", "3ds", "dae"};
        for (String supported : supportedFormats) {
            if (supported.equalsIgnoreCase(format)) {
                return true;
            }
        }
        return false;
    }
}

