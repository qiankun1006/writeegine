package com.example.writemyself.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 游戏素材业务层
 * 处理素材的业务逻辑
 */
@Service
public class AssetService {

    // 用内存缓存存储素材（演示用，实际应使用数据库）
    private final Map<String, Map<String, Object>> assetStore = new ConcurrentHashMap<>();

    /**
     * 创建素材
     */
    public Map<String, Object> createAsset(String category, String name, String data) {
        String assetId = UUID.randomUUID().toString();
        Map<String, Object> asset = new HashMap<>();

        asset.put("id", assetId);
        asset.put("category", category);
        asset.put("name", name);
        asset.put("data", data != null ? data : "{}");
        asset.put("createdAt", System.currentTimeMillis());
        asset.put("updatedAt", System.currentTimeMillis());

        assetStore.put(assetId, asset);
        return asset;
    }

    /**
     * 获取素材
     */
    public Map<String, Object> getAsset(String assetId) {
        return assetStore.get(assetId);
    }

    /**
     * 更新素材
     */
    public Map<String, Object> updateAsset(String assetId, Map<String, Object> assetData) {
        Map<String, Object> asset = assetStore.get(assetId);
        if (asset != null) {
            assetData.put("updatedAt", System.currentTimeMillis());
            assetStore.put(assetId, assetData);
            return assetData;
        }
        return null;
    }

    /**
     * 删除素材
     */
    public boolean deleteAsset(String assetId) {
        return assetStore.remove(assetId) != null;
    }

    /**
     * 获取分类下的所有素材
     */
    public List<Map<String, Object>> getAssetsByCategory(String category) {
        List<Map<String, Object>> result = new ArrayList<>();
        assetStore.values().forEach(asset -> {
            if (category.equals(asset.get("category"))) {
                result.add(asset);
            }
        });
        return result;
    }

    /**
     * 获取所有素材
     */
    public List<Map<String, Object>> getAllAssets() {
        return new ArrayList<>(assetStore.values());
    }

    /**
     * 获取素材总数
     */
    public int getAssetCount() {
        return assetStore.size();
    }

    /**
     * 获取分类下的素材总数
     */
    public int getAssetCountByCategory(String category) {
        return (int) assetStore.values().stream()
                .filter(asset -> category.equals(asset.get("category")))
                .count();
    }

    /**
     * 批量获取素材
     */
    public List<Map<String, Object>> getAssets(List<String> assetIds) {
        List<Map<String, Object>> result = new ArrayList<>();
        assetIds.forEach(id -> {
            Map<String, Object> asset = assetStore.get(id);
            if (asset != null) {
                result.add(asset);
            }
        });
        return result;
    }

    /**
     * 搜索素材（按名称）
     */
    public List<Map<String, Object>> searchAssets(String keyword) {
        List<Map<String, Object>> result = new ArrayList<>();
        assetStore.values().forEach(asset -> {
            String name = (String) asset.get("name");
            if (name != null && name.toLowerCase().contains(keyword.toLowerCase())) {
                result.add(asset);
            }
        });
        return result;
    }

    /**
     * 获取统计信息
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAssets", assetStore.size());

        Map<String, Integer> categoryStats = new HashMap<>();
        assetStore.values().forEach(asset -> {
            String category = (String) asset.get("category");
            categoryStats.put(category, categoryStats.getOrDefault(category, 0) + 1);
        });

        stats.put("byCategory", categoryStats);
        return stats;
    }

    /**
     * 清空所有素材
     */
    public void clearAll() {
        assetStore.clear();
    }

    /**
     * 导出素材为JSON格式
     */
    public String exportAssetToJson(String assetId) {
        Map<String, Object> asset = assetStore.get(assetId);
        if (asset != null) {
            return convertToJson(asset);
        }
        return null;
    }

    /**
     * 批量导出素材为JSON格式
     */
    public String exportAssetsToJson(List<String> assetIds) {
        List<Map<String, Object>> assets = getAssets(assetIds);
        return convertToJson(assets);
    }

    /**
     * 将对象转换为JSON字符串（简单实现）
     */
    private String convertToJson(Object obj) {
        // TODO: 使用 Jackson 或 Gson 库进行实际的 JSON 序列化
        return obj.toString();
    }

    /**
     * 验证素材类别
     */
    public boolean isValidCategory(String category) {
        List<String> validCategories = Arrays.asList(
                "character-portrait",
                "character-sd",
                "character-animation",
                "character-avatar",
                "character-job",
                "character-skill-icon",
                "character-status-icon",
                "map-grid",
                "map-terrain",
                "map-obstacle",
                "map-decoration",
                "map-background",
                "map-loading",
                "ui-main-menu",
                "ui-level-select",
                "ui-dialog",
                "ui-battle-range",
                "ui-battle-hud",
                "ui-character-panel",
                "ui-inventory",
                "ui-skill",
                "ui-battle-result",
                "effect-movement",
                "effect-attack",
                "effect-magic",
                "effect-heal",
                "effect-critical",
                "effect-status",
                "effect-levelup",
                "effect-trap",
                "font-numbers",
                "icon-button",
                "icon-job",
                "icon-attribute",
                "icon-quest",
                "story-portrait",
                "story-dialog-box",
                "story-transition",
                "story-avatar"
        );
        return validCategories.contains(category);
    }
}

