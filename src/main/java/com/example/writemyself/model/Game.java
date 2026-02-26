package com.example.writemyself.model;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * 游戏数据模型
 * 支持多种游戏类型：2d-strategy、2d-metroidvania、2d-rpg、3d-shooter
 */
public class Game implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 游戏类型枚举
     */
    public enum GameType {
        STRATEGY_2D("2d-strategy", "2D 策略战棋"),
        METROIDVANIA_2D("2d-metroidvania", "2D 恶魔城"),
        RPG_2D("2d-rpg", "2D 角色扮演"),
        SHOOTER_3D("3d-shooter", "3D 射击"),
        LEGACY_3D("3d-legacy", "3D 原始编辑器");

        private final String value;
        private final String description;

        GameType(String value, String description) {
            this.value = value;
            this.description = description;
        }

        public String getValue() {
            return value;
        }

        public String getDescription() {
            return description;
        }

        /**
         * 根据字符串值获取 GameType
         */
        public static GameType fromValue(String value) {
            for (GameType type : GameType.values()) {
                if (type.value.equals(value)) {
                    return type;
                }
            }
            return LEGACY_3D; // 默认返回遗留类型
        }
    }

    /**
     * 游戏唯一标识
     */
    private String id;

    /**
     * 游戏名称
     */
    private String name;

    /**
     * 游戏类型
     */
    private String type;

    /**
     * 游戏描述
     */
    private String description;

    /**
     * 缩略图 URL
     */
    private String thumbnailUrl;

    /**
     * 游戏元数据（JSON）- 存储类型特定配置
     * 例如 2D 策略游戏的网格大小、2D RPG 的 NPC 列表等
     */
    private Map<String, Object> metadata;

    /**
     * 创建时间（毫秒）
     */
    private long createdAt;

    /**
     * 更新时间（毫秒）
     */
    private long updatedAt;

    /**
     * 构造函数
     */
    public Game() {
        this.metadata = new HashMap<>();
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }

    public Game(String id, String name, String type, String description) {
        this();
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
    }

    // ===== Getters and Setters =====

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public Map<String, Object> getMetadata() {
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Game{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

