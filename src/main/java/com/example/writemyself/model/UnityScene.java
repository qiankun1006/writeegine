package com.example.writemyself.model;

import java.util.*;

/**
 * Unity 场景数据模型
 * 表示一个完整的 3D 场景，包含所有对象、光照、摄像机等配置
 */
public class UnityScene {

    private String id;
    private String name;
    private String description;
    private String userId;
    private Date createdAt;
    private Date updatedAt;

    // 场景配置
    private Map<String, Object> settings;

    // 摄像机配置
    private Map<String, Object> camera;

    // 光照配置
    private List<Map<String, Object>> lights;

    // 环境配置
    private Map<String, Object> environment;

    // 场景对象列表
    private List<UnityObject> objects;

    // 物理配置
    private Map<String, Object> physics;

    // 元数据
    private Map<String, Object> metadata;

    // 缩略图路径
    private String thumbnailPath;

    // 文件大小（字节）
    private long fileSize;

    // 版本号
    private String version;

    // 标签
    private List<String> tags;

    // 是否公开
    private boolean isPublic;

    // 协作用户列表
    private List<String> collaborators;

    public UnityScene() {
        this.objects = new ArrayList<>();
        this.lights = new ArrayList<>();
        this.tags = new ArrayList<>();
        this.collaborators = new ArrayList<>();
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.version = "1.0.0";
        this.isPublic = false;
    }

    public UnityScene(String name, String userId) {
        this();
        this.name = name;
        this.userId = userId;
        this.id = generateId();
    }

    private String generateId() {
        return "scene_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = new Date();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public Map<String, Object> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, Object> settings) {
        this.settings = settings;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getCamera() {
        return camera;
    }

    public void setCamera(Map<String, Object> camera) {
        this.camera = camera;
        this.updatedAt = new Date();
    }

    public List<Map<String, Object>> getLights() {
        return lights;
    }

    public void setLights(List<Map<String, Object>> lights) {
        this.lights = lights;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getEnvironment() {
        return environment;
    }

    public void setEnvironment(Map<String, Object> environment) {
        this.environment = environment;
        this.updatedAt = new Date();
    }

    public List<UnityObject> getObjects() {
        return objects;
    }

    public void setObjects(List<UnityObject> objects) {
        this.objects = objects;
        this.updatedAt = new Date();
    }

    public void addObject(UnityObject object) {
        if (this.objects == null) {
            this.objects = new ArrayList<>();
        }
        this.objects.add(object);
        this.updatedAt = new Date();
    }

    public void removeObject(String objectId) {
        if (this.objects != null) {
            this.objects.removeIf(obj -> obj.getId().equals(objectId));
            this.updatedAt = new Date();
        }
    }

    public Map<String, Object> getPhysics() {
        return physics;
    }

    public void setPhysics(Map<String, Object> physics) {
        this.physics = physics;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
        this.updatedAt = new Date();
    }

    public String getThumbnailPath() {
        return thumbnailPath;
    }

    public void setThumbnailPath(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
        this.updatedAt = new Date();
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
        this.updatedAt = new Date();
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
        this.updatedAt = new Date();
    }

    public void addTag(String tag) {
        if (this.tags == null) {
            this.tags = new ArrayList<>();
        }
        this.tags.add(tag);
        this.updatedAt = new Date();
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
        this.updatedAt = new Date();
    }

    public List<String> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(List<String> collaborators) {
        this.collaborators = collaborators;
        this.updatedAt = new Date();
    }

    public void addCollaborator(String userId) {
        if (this.collaborators == null) {
            this.collaborators = new ArrayList<>();
        }
        if (!this.collaborators.contains(userId)) {
            this.collaborators.add(userId);
            this.updatedAt = new Date();
        }
    }

    public void removeCollaborator(String userId) {
        if (this.collaborators != null) {
            this.collaborators.remove(userId);
            this.updatedAt = new Date();
        }
    }

    /**
     * 获取场景中的对象数量
     */
    public int getObjectCount() {
        return objects != null ? objects.size() : 0;
    }

    /**
     * 获取场景总文件大小（包括所有对象和资源）
     */
    public long getTotalSize() {
        long totalSize = fileSize;
        if (objects != null) {
            for (UnityObject obj : objects) {
                totalSize += obj.getFileSize();
            }
        }
        return totalSize;
    }

    /**
     * 转换为前端使用的 JSON 格式
     */
    public Map<String, Object> toJson() {
        Map<String, Object> json = new HashMap<>();
        json.put("id", id);
        json.put("name", name);
        json.put("description", description);
        json.put("createdAt", createdAt.getTime());
        json.put("updatedAt", updatedAt.getTime());
        json.put("settings", settings);
        json.put("camera", camera);
        json.put("lights", lights);
        json.put("environment", environment);
        json.put("physics", physics);
        json.put("metadata", metadata);
        json.put("thumbnailPath", thumbnailPath);
        json.put("fileSize", fileSize);
        json.put("version", version);
        json.put("tags", tags);
        json.put("isPublic", isPublic);
        json.put("collaborators", collaborators);
        json.put("objectCount", getObjectCount());
        json.put("totalSize", getTotalSize());

        // 转换对象列表
        List<Map<String, Object>> objectList = new ArrayList<>();
        if (objects != null) {
            for (UnityObject obj : objects) {
                objectList.add(obj.toJson());
            }
        }
        json.put("objects", objectList);

        return json;
    }

    /**
     * 从 JSON 创建场景
     */
    public static UnityScene fromJson(Map<String, Object> json) {
        UnityScene scene = new UnityScene();

        if (json.containsKey("id")) scene.setId((String) json.get("id"));
        if (json.containsKey("name")) scene.setName((String) json.get("name"));
        if (json.containsKey("description")) scene.setDescription((String) json.get("description"));
        if (json.containsKey("userId")) scene.setUserId((String) json.get("userId"));
        if (json.containsKey("settings")) scene.setSettings((Map<String, Object>) json.get("settings"));
        if (json.containsKey("camera")) scene.setCamera((Map<String, Object>) json.get("camera"));
        if (json.containsKey("lights")) scene.setLights((List<Map<String, Object>>) json.get("lights"));
        if (json.containsKey("environment")) scene.setEnvironment((Map<String, Object>) json.get("environment"));
        if (json.containsKey("physics")) scene.setPhysics((Map<String, Object>) json.get("physics"));
        if (json.containsKey("metadata")) scene.setMetadata((Map<String, Object>) json.get("metadata"));
        if (json.containsKey("thumbnailPath")) scene.setThumbnailPath((String) json.get("thumbnailPath"));
        if (json.containsKey("fileSize")) scene.setFileSize(((Number) json.get("fileSize")).longValue());
        if (json.containsKey("version")) scene.setVersion((String) json.get("version"));
        if (json.containsKey("tags")) scene.setTags((List<String>) json.get("tags"));
        if (json.containsKey("isPublic")) scene.setPublic((Boolean) json.get("isPublic"));
        if (json.containsKey("collaborators")) scene.setCollaborators((List<String>) json.get("collaborators"));

        // 设置对象列表
        if (json.containsKey("objects")) {
            List<Map<String, Object>> objectList = (List<Map<String, Object>>) json.get("objects");
            List<UnityObject> objects = new ArrayList<>();
            for (Map<String, Object> objJson : objectList) {
                objects.add(UnityObject.fromJson(objJson));
            }
            scene.setObjects(objects);
        }

        return scene;
    }

    @Override
    public String toString() {
        return "UnityScene{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", objectCount=" + getObjectCount() +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

