package com.example.writemyself.controller;

import com.example.writemyself.service.UnityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Unity 编辑器控制器
 * 提供 Unity 编辑器页面的路由和 API 接口
 */
@Controller
public class UnityController {

    @Autowired
    private UnityService unityService;

    /**
     * 游戏类型选择门户
     * 用户在这里选择要开发的游戏类型
     */
    @GetMapping("/create-game/unity")
    public String createGameUnity(Model model) {
        model.addAttribute("title", "游戏创建 - 选择游戏类型");
        model.addAttribute("editorType", "portal");
        model.addAttribute("version", "1.0.0");

        // 添加门户配置信息
        Map<String, Object> portalConfig = new HashMap<>();
        portalConfig.put("name", "游戏类型选择门户");
        portalConfig.put("description", "选择您要开发的游戏类型，进入对应的轻量化编辑器");
        model.addAttribute("portalConfig", portalConfig);
        return "create-game-unity-portal";
    }

    /**
     * 2D 策略战棋编辑器页面
     */
    @GetMapping("/create-game/unity/2d-strategy")
    public String createGame2DStrategy(Model model, @RequestParam(required = false) String gameId) {
        model.addAttribute("title", "2D 策略战棋编辑器");
        model.addAttribute("editorType", "2d-strategy");
        model.addAttribute("gameId", gameId != null ? gameId : "");
        model.addAttribute("version", "1.0.0");
        return "create-game-2d-strategy";
    }

    /**
     * 2D 恶魔城编辑器页面
     */
    @GetMapping("/create-game/unity/2d-metroidvania")
    public String createGame2DMetroidvania(Model model, @RequestParam(required = false) String gameId) {
        model.addAttribute("title", "2D 恶魔城编辑器");
        model.addAttribute("editorType", "2d-metroidvania");
        model.addAttribute("gameId", gameId != null ? gameId : "");
        model.addAttribute("version", "1.0.0");
        return "create-game-2d-metroidvania";
    }

    /**
     * 2D RPG 编辑器页面
     */
    @GetMapping("/create-game/unity/2d-rpg")
    public String createGame2DRPG(Model model, @RequestParam(required = false) String gameId) {
        model.addAttribute("title", "2D RPG 编辑器");
        model.addAttribute("editorType", "2d-rpg");
        model.addAttribute("gameId", gameId != null ? gameId : "");
        model.addAttribute("version", "1.0.0");
        return "create-game-2d-rpg";
    }

    /**
     * 3D 射击编辑器页面
     */
    @GetMapping("/create-game/unity/3d-shooter")
    public String createGame3DShooter(Model model, @RequestParam(required = false) String gameId) {
        model.addAttribute("title", "3D 射击编辑器");
        model.addAttribute("editorType", "3d-shooter");
        model.addAttribute("gameId", gameId != null ? gameId : "");
        model.addAttribute("version", "1.0.0");

        // 添加编辑器配置信息
        Map<String, Object> editorConfig = new HashMap<>();
        editorConfig.put("name", "Unity 编辑器");
        editorConfig.put("description", "基于 Three.js 的在线 3D 游戏场景编辑器");
        editorConfig.put("supportedFormats", new String[]{"json", "gltf", "obj"});
        editorConfig.put("maxFileSize", 50 * 1024 * 1024); // 50MB
        editorConfig.put("defaultScene", getDefaultSceneConfig());

        model.addAttribute("editorConfig", editorConfig);
        return "create-game-3d-shooter";
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
            // 使用 UnityService 保存场景
            Map<String, Object> savedScene = unityService.createScene(sceneData);

            response.put("success", true);
            response.put("sceneId", savedScene.get("id"));
            response.put("scene", savedScene);
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
            // 使用 UnityService 加载场景
            Map<String, Object> scene = unityService.getSceneById(sceneId);

            if (scene == null) {
                response.put("success", false);
                response.put("message", "场景不存在: " + sceneId);
                return response;
            }

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
            // 使用 UnityService 获取场景列表
            List<Map<String, Object>> scenes = unityService.getSceneList(page, pageSize);
            int total = unityService.getSceneCount();

            response.put("success", true);
            response.put("scenes", scenes);
            response.put("total", total);
            response.put("page", page);
            response.put("pageSize", pageSize);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取列表失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 更新场景 API
     */
    @PutMapping("/api/unity/scene/update/{sceneId}")
    @ResponseBody
    public Map<String, Object> updateScene(
            @PathVariable String sceneId,
            @RequestBody Map<String, Object> sceneData) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 使用 UnityService 更新场景
            Map<String, Object> updatedScene = unityService.updateScene(sceneId, sceneData);

            if (updatedScene == null) {
                response.put("success", false);
                response.put("message", "场景不存在: " + sceneId);
                return response;
            }

            response.put("success", true);
            response.put("scene", updatedScene);
            response.put("message", "场景更新成功");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 删除场景 API
     */
    @DeleteMapping("/api/unity/scene/delete/{sceneId}")
    @ResponseBody
    public Map<String, Object> deleteScene(@PathVariable String sceneId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 使用 UnityService 删除场景
            boolean deleted = unityService.deleteScene(sceneId);

            if (!deleted) {
                response.put("success", false);
                response.put("message", "场景不存在: " + sceneId);
                return response;
            }

            response.put("success", true);
            response.put("message", "场景删除成功");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 创建对象 API
     */
    @PostMapping("/api/unity/object/create")
    @ResponseBody
    public Map<String, Object> createObject(@RequestBody Map<String, Object> objectData) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 使用 UnityService 创建对象
            Map<String, Object> createdObject = unityService.createObject(objectData);

            response.put("success", true);
            response.put("object", createdObject);
            response.put("message", "对象创建成功");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "创建失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 更新对象 API
     */
    @PutMapping("/api/unity/object/update/{objectId}")
    @ResponseBody
    public Map<String, Object> updateObject(
            @PathVariable String objectId,
            @RequestBody Map<String, Object> objectData) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 使用 UnityService 更新对象
            Map<String, Object> updatedObject = unityService.updateObject(objectId, objectData);

            if (updatedObject == null) {
                response.put("success", false);
                response.put("message", "对象不存在: " + objectId);
                return response;
            }

            response.put("success", true);
            response.put("object", updatedObject);
            response.put("message", "对象更新成功");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 删除对象 API
     */
    @DeleteMapping("/api/unity/object/delete/{objectId}")
    @ResponseBody
    public Map<String, Object> deleteObject(@PathVariable String objectId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 使用 UnityService 删除对象
            boolean deleted = unityService.deleteObject(objectId);

            if (!deleted) {
                response.put("success", false);
                response.put("message", "对象不存在: " + objectId);
                return response;
            }

            response.put("success", true);
            response.put("message", "对象删除成功");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
        }

        return response;
    }

    /**
     * 获取场景统计信息 API
     */
    @GetMapping("/api/unity/statistics")
    @ResponseBody
    public Map<String, Object> getStatistics() {
        Map<String, Object> response = new HashMap<>();

        try {
            // 使用 UnityService 获取统计信息
            Map<String, Object> statistics = unityService.getSceneStatistics();

            response.put("success", true);
            response.put("statistics", statistics);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取统计信息失败: " + e.getMessage());
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

