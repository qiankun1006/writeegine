package com.example.writemyself.controller;

import com.example.writemyself.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

/**
 * 游戏素材控制器
 * 处理游戏素材的创建、编辑、导入、导出等操作
 */
@Controller
@RequestMapping("/api/asset")
public class AssetController {

    @Autowired
    private AssetService assetService;

    /**
     * 创建新素材
     * POST /api/asset/create
     * 参数: category (分类), name (名称), data (数据)
     */
    @PostMapping("/create")
    @ResponseBody
    public Map<String, Object> createAsset(
            @RequestParam(required = true) String category,
            @RequestParam(required = true) String name,
            @RequestParam(required = false) String data) {

        Map<String, Object> response = new HashMap<>();
        try {
            String assetId = UUID.randomUUID().toString();
            Map<String, Object> asset = new HashMap<>();
            asset.put("id", assetId);
            asset.put("category", category);
            asset.put("name", name);
            asset.put("data", data != null ? data : "{}");
            asset.put("createdAt", System.currentTimeMillis());
            asset.put("updatedAt", System.currentTimeMillis());

            response.put("success", true);
            response.put("asset", asset);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 获取素材列表
     * GET /api/asset/list
     * 可选参数: category (分类)
     */
    @GetMapping("/list")
    @ResponseBody
    public Map<String, Object> listAssets(
            @RequestParam(required = false) String category) {

        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> assets = new ArrayList<>();
            // TODO: 从数据库加载素材列表
            // 目前返回空列表
            response.put("success", true);
            response.put("assets", assets);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 获取素材详情
     * GET /api/asset/{assetId}
     */
    @GetMapping("/{assetId}")
    @ResponseBody
    public Map<String, Object> getAsset(@PathVariable String assetId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // TODO: 从数据库加载素材详情
            response.put("success", false);
            response.put("error", "素材不存在");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 更新素材
     * PUT /api/asset/{assetId}
     */
    @PutMapping("/{assetId}")
    @ResponseBody
    public Map<String, Object> updateAsset(
            @PathVariable String assetId,
            @RequestBody Map<String, Object> assetData) {

        Map<String, Object> response = new HashMap<>();
        try {
            // TODO: 更新数据库中的素材
            assetData.put("updatedAt", System.currentTimeMillis());
            response.put("success", true);
            response.put("asset", assetData);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 删除素材
     * DELETE /api/asset/{assetId}
     */
    @DeleteMapping("/{assetId}")
    @ResponseBody
    public Map<String, Object> deleteAsset(@PathVariable String assetId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // TODO: 从数据库删除素材
            response.put("success", true);
            response.put("message", "素材已删除");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 上传素材文件
     * POST /api/asset/upload
     */
    @PostMapping("/upload")
    @ResponseBody
    public Map<String, Object> uploadAsset(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category) {

        Map<String, Object> response = new HashMap<>();
        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("error", "文件为空");
                return response;
            }

            String assetId = UUID.randomUUID().toString();
            String fileName = file.getOriginalFilename();
            String uploadDir = "uploads/assets/" + category;

            // 创建目录
            Files.createDirectories(Paths.get(uploadDir));

            // 保存文件
            String filePath = uploadDir + "/" + assetId + "_" + fileName;
            file.transferTo(Paths.get(filePath));

            response.put("success", true);
            response.put("assetId", assetId);
            response.put("fileName", fileName);
            response.put("path", filePath);
        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "上传失败: " + e.getMessage());
        }
        return response;
    }

    /**
     * 导出素材为PNG
     * GET /api/asset/{assetId}/export/png
     */
    @GetMapping("/{assetId}/export/png")
    @ResponseBody
    public Map<String, Object> exportAssetPng(@PathVariable String assetId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // TODO: 从数据库获取素材并转换为PNG
            response.put("success", true);
            response.put("message", "导出成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 导出素材为JSON
     * GET /api/asset/{assetId}/export/json
     */
    @GetMapping("/{assetId}/export/json")
    @ResponseBody
    public Map<String, Object> exportAssetJson(@PathVariable String assetId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // TODO: 从数据库获取素材并转换为JSON
            response.put("success", true);
            response.put("message", "导出成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 获取素材统计信息
     * GET /api/asset/statistics
     */
    @GetMapping("/statistics")
    @ResponseBody
    public Map<String, Object> getStatistics() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Integer> stats = new HashMap<>();
            stats.put("totalAssets", 0);
            stats.put("character", 0);
            stats.put("map", 0);
            stats.put("ui", 0);
            stats.put("effect", 0);

            response.put("success", true);
            response.put("statistics", stats);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * 获取素材分类列表
     * GET /api/asset/categories
     */
    @GetMapping("/categories")
    @ResponseBody
    public Map<String, Object> getCategories() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, List<String>> categories = new HashMap<>();

            // 角色相关
            categories.put("character", Arrays.asList(
                    "portrait",      // 立绘
                    "sd",            // Q版/SD
                    "animation",     // 战斗动画
                    "avatar",        // 头像
                    "job",           // 转职形态
                    "skill-icon",    // 技能图标
                    "status-icon"    // 状态图标
            ));

            // 地图与场景
            categories.put("map", Arrays.asList(
                    "grid",          // 网格地图
                    "terrain",       // 地形块
                    "obstacle",      // 障碍物
                    "decoration",    // 装饰
                    "background",    // 战场背景
                    "loading"        // 关卡载入图
            ));

            // UI界面
            categories.put("ui", Arrays.asList(
                    "main-menu",     // 主菜单
                    "level-select",  // 关卡选择
                    "dialog",        // 对话框
                    "battle-hud",    // 战斗HUD
                    "inventory",     // 物品装备
                    "skill"          // 技能菜单
            ));

            // 特效与动画
            categories.put("effect", Arrays.asList(
                    "movement",      // 移动轨迹
                    "attack",        // 攻击
                    "magic",         // 魔法
                    "heal",          // 治愈
                    "critical",      // 暴击
                    "status",        // 命中/闪避
                    "levelup",       // 升级
                    "trap"           // 陷阱
            ));

            // 文字与图标
            categories.put("font", Arrays.asList(
                    "numbers",       // 数字字体
                    "icon-button",   // 按钮图标
                    "icon-job",      // 职业图标
                    "icon-attribute" // 属性图标
            ));

            // 剧情与过场
            categories.put("story", Arrays.asList(
                    "portrait",      // 剧情立绘
                    "dialog-box",    // 对话框
                    "transition",    // 过场背景
                    "avatar"         // 剧情头像
            ));

            response.put("success", true);
            response.put("categories", categories);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}

