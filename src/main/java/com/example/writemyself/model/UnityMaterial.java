package com.example.writemyself.model;

import java.util.Date;
import java.util.Map;

/**
 * Unity 材质数据模型
 * 表示 3D 对象的材质属性
 */
public class UnityMaterial {

    private String id;
    private String name;
    private String type; // basic, standard, phong, etc.
    private String sceneId;

    // 基础属性
    private String color; // hex color
    private double opacity; // 0-1
    private boolean transparent;

    // 纹理属性
    private String texturePath;
    private String normalMapPath;
    private String roughnessMapPath;
    private String metalnessMapPath;
    private String emissiveMapPath;

    // 材质属性
    private Map<String, Object> properties;

    // 元数据
    private Map<String, Object> metadata;

    // 文件大小（字节）
    private long fileSize;

    // 创建时间
    private Date createdAt;

    // 更新时间
    private Date updatedAt;

    // 标签
    private String[] tags;

    // 是否公开
    private boolean isPublic;

    public UnityMaterial() {
        this.id = generateId();
        this.name = "未命名材质";
        this.type = "standard";
        this.color = "#ffffff";
        this.opacity = 1.0;
        this.transparent = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isPublic = false;
    }

    public UnityMaterial(String name, String type) {
        this();
        this.name = name;
        this.type = type;
    }

    private String generateId() {
        return "mat_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
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
        this.updatedAt = new Date();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
        this.updatedAt = new Date();
    }

    public String getSceneId() {
        return sceneId;
    }

    public void setSceneId(String sceneId) {
        this.sceneId = sceneId;
        this.updatedAt = new Date();
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
        this.updatedAt = new Date();
    }

    public double getOpacity() {
        return opacity;
    }

    public void setOpacity(double opacity) {
        this.opacity = opacity;
        this.updatedAt = new Date();
    }

    public boolean isTransparent() {
        return transparent;
    }

    public void setTransparent(boolean transparent) {
        this.transparent = transparent;
        this.updatedAt = new Date();
    }

    public String getTexturePath() {
        return texturePath;
    }

    public void setTexturePath(String texturePath) {
        this.texturePath = texturePath;
        this.updatedAt = new Date();
    }

    public String getNormalMapPath() {
        return normalMapPath;
    }

    public void setNormalMapPath(String normalMapPath) {
        this.normalMapPath = normalMapPath;
        this.updatedAt = new Date();
    }

    public String getRoughnessMapPath() {
        return roughnessMapPath;
    }

    public void setRoughnessMapPath(String roughnessMapPath) {
        this.roughnessMapPath = roughnessMapPath;
        this.updatedAt = new Date();
    }

    public String getMetalnessMapPath() {
        return metalnessMapPath;
    }

    public void setMetalnessMapPath(String metalnessMapPath) {
        this.metalnessMapPath = metalnessMapPath;
        this.updatedAt = new Date();
    }

    public String getEmissiveMapPath() {
        return emissiveMapPath;
    }

    public void setEmissiveMapPath(String emissiveMapPath) {
        this.emissiveMapPath = emissiveMapPath;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, Object> properties) {
        this.properties = properties;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
        this.updatedAt = new Date();
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
        this.updatedAt = new Date();
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
        this.updatedAt = new Date();
    }

    /**
     * 转换为前端使用的 JSON 格式
     */
    public Map<String, Object> toJson() {
        Map<String, Object> json = new java.util.HashMap<>();
        json.put("id", id);
        json.put("name", name);
        json.put("type", type);
        json.put("sceneId", sceneId);
        json.put("color", color);
        json.put("opacity", opacity);
        json.put("transparent", transparent);
        json.put("texturePath", texturePath);
        json.put("normalMapPath", normalMapPath);
        json.put("roughnessMapPath", roughnessMapPath);
        json.put("metalnessMapPath", metalnessMapPath);
        json.put("emissiveMapPath", emissiveMapPath);
        json.put("properties", properties);
        json.put("metadata", metadata);
        json.put("fileSize", fileSize);
        json.put("createdAt", createdAt.getTime());
        json.put("updatedAt", updatedAt.getTime());
        json.put("tags", tags);
        json.put("isPublic", isPublic);
        return json;
    }

    /**
     * 从 JSON 创建材质
     */
    public static UnityMaterial fromJson(Map<String, Object> json) {
        UnityMaterial material = new UnityMaterial();

        if (json.containsKey("id")) material.setId((String) json.get("id"));
        if (json.containsKey("name")) material.setName((String) json.get("name"));
        if (json.containsKey("type")) material.setType((String) json.get("type"));
        if (json.containsKey("sceneId")) material.setSceneId((String) json.get("sceneId"));
        if (json.containsKey("color")) material.setColor((String) json.get("color"));
        if (json.containsKey("opacity")) material.setOpacity(((Number) json.get("opacity")).doubleValue());
        if (json.containsKey("transparent")) material.setTransparent((Boolean) json.get("transparent"));
        if (json.containsKey("texturePath")) material.setTexturePath((String) json.get("texturePath"));
        if (json.containsKey("normalMapPath")) material.setNormalMapPath((String) json.get("normalMapPath"));
        if (json.containsKey("roughnessMapPath")) material.setRoughnessMapPath((String) json.get("roughnessMapPath"));
        if (json.containsKey("metalnessMapPath")) material.setMetalnessMapPath((String) json.get("metalnessMapPath"));
        if (json.containsKey("emissiveMapPath")) material.setEmissiveMapPath((String) json.get("emissiveMapPath"));
        if (json.containsKey("properties")) material.setProperties((Map<String, Object>) json.get("properties"));
        if (json.containsKey("metadata")) material.setMetadata((Map<String, Object>) json.get("metadata"));
        if (json.containsKey("fileSize")) material.setFileSize(((Number) json.get("fileSize")).longValue());
        if (json.containsKey("tags")) material.setTags((String[]) json.get("tags"));
        if (json.containsKey("isPublic")) material.setPublic((Boolean) json.get("isPublic"));

        return material;
    }

    @Override
    public String toString() {
        return "UnityMaterial{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", color='" + color + '\'' +
                '}';
    }
}

