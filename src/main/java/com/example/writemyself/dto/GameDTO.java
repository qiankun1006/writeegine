package com.example.writemyself.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * 游戏数据传输对象
 * 用于与前端交互
 */
public class GameDTO {
    private String id;
    private String name;
    private String type;
    private String description;
    private String thumbnailUrl;
    private Map<String, Object> metadata;
    private long createdAt;
    private long updatedAt;

    /**
     * 构造函数
     */
    public GameDTO() {
        this.metadata = new HashMap<>();
    }

    public GameDTO(String id, String name, String type, String description) {
        this();
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
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
}

