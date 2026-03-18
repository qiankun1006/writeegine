package com.example.writemyself.entity;

import com.example.writemyself.model.Game;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Game实体类 - 用于数据库持久化
 * 同时支持JPA和MyBatis
 */
@Entity
@Table(name = "game", indexes = {
        @Index(name = "idx_game_user_id", columnList = "user_id"),
        @Index(name = "idx_game_type", columnList = "type"),
        @Index(name = "idx_game_created_at", columnList = "created_at")
})
public class GameEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "config", columnDefinition = "JSON")
    private String config; // JSON格式的配置数据

    @Column(name = "user_id", length = 64)
    private String userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 无参构造函数
    public GameEntity() {
    }

    // 从Game模型转换
    public GameEntity(Game game) {
        this.id = game.getId();
        this.name = game.getName();
        this.type = game.getType();
        this.description = game.getDescription();
        this.thumbnailUrl = game.getThumbnailUrl();
        this.userId = game.getUserId();
        // 注意：config需要特殊处理，这里暂时留空
    }

    // 转换为Game模型
    public Game toGame() {
        Game game = new Game();
        game.setId(this.id);
        game.setName(this.name);
        game.setType(this.type);
        game.setDescription(this.description);
        game.setThumbnailUrl(this.thumbnailUrl);
        game.setUserId(this.userId);
        // 注意：config需要特殊处理，这里暂时留空
        return game;
    }

    // Getters and Setters
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

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "GameEntity{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                ", userId='" + userId + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

