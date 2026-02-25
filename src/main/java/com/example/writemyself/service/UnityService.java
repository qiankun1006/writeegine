package com.example.writemyself.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Unity 编辑器服务
 * 处理场景和对象的业务逻辑
 */
@Service
public class UnityService {

    // 内存存储（实际项目中应该使用数据库）
    private final Map<String, Map<String, Object>> sceneStore = new HashMap<>();
    private final Map<String, Map<String, Object>> objectStore = new HashMap<>();

    public UnityService() {
        // 初始化一些示例数据
        initSampleData();
    }

    private void initSampleData() {
        // 创建示例场景
        Map<String, Object> sampleScene = new HashMap<>();
        sampleScene.put("id", "scene_1");
        sampleScene.put("name", "示例场景");
        sampleScene.put("description", "这是一个示例 Unity 场景");
        sampleScene.put("createdAt", System.currentTimeMillis());
        sampleScene.put("updatedAt", System.currentTimeMillis());
        sampleScene.put("objectCount", 3);
        sampleScene.put("thumbnail", "/static/images/unity/thumbnail_1.png");

        // 场景设置
        Map<String, Object> settings = new HashMap<>();
        settings.put("backgroundColor", "#1a1a1a");
        settings.put("gridEnabled", true);
        settings.put("gridSize", 1.0);
        settings.put("physicsEnabled", false);
        sampleScene.put("settings", settings);

        // 摄像机配置
        Map<String, Object> camera = new HashMap<>();
        camera.put("position", Map.of("x", 0.0, "y", 5.0, "z", 10.0));
        camera.put("target", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
        camera.put("fov", 60.0);
        camera.put("type", "perspective");
        sampleScene.put("camera", camera);

        // 光照配置
        List<Map<String, Object>> lights = new ArrayList<>();

        Map<String, Object> ambientLight = new HashMap<>();
        ambientLight.put("type", "ambient");
        ambientLight.put("color", "#ffffff");
        ambientLight.put("intensity", 0.5);
        lights.add(ambientLight);

        Map<String, Object> directionalLight = new HashMap<>();
        directionalLight.put("type", "directional");
        directionalLight.put("color", "#ffffff");
        directionalLight.put("intensity", 0.8);
        directionalLight.put("position", Map.of("x", 10.0, "y", 10.0, "z", 10.0));
        lights.add(directionalLight);

        sampleScene.put("lights", lights);

        sceneStore.put("scene_1", sampleScene);

        // 创建示例对象
        createSampleObjects();
    }

    private void createSampleObjects() {
        // 立方体
        Map<String, Object> cube = new HashMap<>();
        cube.put("id", "obj_1");
        cube.put("name", "立方体");
        cube.put("type", "cube");
        cube.put("sceneId", "scene_1");
        cube.put("position", Map.of("x", -2.0, "y", 1.0, "z", 0.0));
        cube.put("rotation", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
        cube.put("scale", Map.of("x", 1.0, "y", 1.0, "z", 1.0));
        cube.put("material", Map.of(
            "type", "standard",
            "color", "#ff0000",
            "metalness", 0.5,
            "roughness", 0.5
        ));
        cube.put("physics", Map.of(
            "enabled", true,
            "bodyType", "dynamic",
            "mass", 1.0,
            "friction", 0.5,
            "restitution", 0.3
        ));
        objectStore.put("obj_1", cube);

        // 球体
        Map<String, Object> sphere = new HashMap<>();
        sphere.put("id", "obj_2");
        sphere.put("name", "球体");
        sphere.put("type", "sphere");
        sphere.put("sceneId", "scene_1");
        sphere.put("position", Map.of("x", 0.0, "y", 1.0, "z", 0.0));
        sphere.put("rotation", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
        sphere.put("scale", Map.of("x", 1.0, "y", 1.0, "z", 1.0));
        sphere.put("material", Map.of(
            "type", "standard",
            "color", "#00ff00",
            "metalness", 0.3,
            "roughness", 0.7
        ));
        sphere.put("physics", Map.of(
            "enabled", true,
            "bodyType", "dynamic",
            "mass", 0.5,
            "friction", 0.3,
            "restitution", 0.8
        ));
        objectStore.put("obj_2", sphere);

        // 平面（地面）
        Map<String, Object> plane = new HashMap<>();
        plane.put("id", "obj_3");
        plane.put("name", "地面");
        plane.put("type", "plane");
        plane.put("sceneId", "scene_1");
        plane.put("position", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
        plane.put("rotation", Map.of("x", -90.0, "y", 0.0, "z", 0.0));
        plane.put("scale", Map.of("x", 10.0, "y", 10.0, "z", 1.0));
        plane.put("material", Map.of(
            "type", "standard",
            "color", "#888888",
            "metalness", 0.1,
            "roughness", 0.9
        ));
        plane.put("physics", Map.of(
            "enabled", true,
            "bodyType", "static",
            "mass", 0.0,
            "friction", 0.7,
            "restitution", 0.1
        ));
        objectStore.put("obj_3", plane);
    }

    /**
     * 获取场景列表
     */
    public List<Map<String, Object>> getSceneList(int page, int pageSize) {
        List<Map<String, Object>> scenes = new ArrayList<>(sceneStore.values());

        // 简单的分页逻辑
        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, scenes.size());

        if (start >= scenes.size()) {
            return new ArrayList<>();
        }

        return scenes.subList(start, end);
    }

    /**
     * 获取场景总数
     */
    public int getSceneCount() {
        return sceneStore.size();
    }

    /**
     * 根据ID获取场景
     */
    public Map<String, Object> getSceneById(String sceneId) {
        Map<String, Object> scene = sceneStore.get(sceneId);
        if (scene != null) {
            // 获取场景中的所有对象
            List<Map<String, Object>> objects = getObjectsBySceneId(sceneId);
            scene.put("objects", objects);
        }
        return scene;
    }

    /**
     * 创建新场景
     */
    public Map<String, Object> createScene(Map<String, Object> sceneData) {
        String sceneId = "scene_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);

        Map<String, Object> newScene = new HashMap<>(sceneData);
        newScene.put("id", sceneId);
        newScene.put("createdAt", System.currentTimeMillis());
        newScene.put("updatedAt", System.currentTimeMillis());
        newScene.put("objectCount", 0);

        // 设置默认值
        if (!newScene.containsKey("settings")) {
            Map<String, Object> settings = new HashMap<>();
            settings.put("backgroundColor", "#1a1a1a");
            settings.put("gridEnabled", true);
            settings.put("gridSize", 1.0);
            settings.put("physicsEnabled", false);
            newScene.put("settings", settings);
        }

        if (!newScene.containsKey("camera")) {
            Map<String, Object> camera = new HashMap<>();
            camera.put("position", Map.of("x", 0.0, "y", 5.0, "z", 10.0));
            camera.put("target", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
            camera.put("fov", 60.0);
            camera.put("type", "perspective");
            newScene.put("camera", camera);
        }

        if (!newScene.containsKey("lights")) {
            List<Map<String, Object>> lights = new ArrayList<>();

            Map<String, Object> ambientLight = new HashMap<>();
            ambientLight.put("type", "ambient");
            ambientLight.put("color", "#ffffff");
            ambientLight.put("intensity", 0.5);
            lights.add(ambientLight);

            Map<String, Object> directionalLight = new HashMap<>();
            directionalLight.put("type", "directional");
            directionalLight.put("color", "#ffffff");
            directionalLight.put("intensity", 0.8);
            directionalLight.put("position", Map.of("x", 10.0, "y", 10.0, "z", 10.0));
            lights.add(directionalLight);

            newScene.put("lights", lights);
        }

        sceneStore.put(sceneId, newScene);
        return newScene;
    }

    /**
     * 更新场景
     */
    public Map<String, Object> updateScene(String sceneId, Map<String, Object> sceneData) {
        Map<String, Object> existingScene = sceneStore.get(sceneId);
        if (existingScene == null) {
            return null;
        }

        // 更新字段
        existingScene.putAll(sceneData);
        existingScene.put("updatedAt", System.currentTimeMillis());

        // 确保ID不变
        existingScene.put("id", sceneId);

        sceneStore.put(sceneId, existingScene);
        return existingScene;
    }

    /**
     * 删除场景
     */
    public boolean deleteScene(String sceneId) {
        // 删除场景相关的所有对象
        List<Map<String, Object>> objects = getObjectsBySceneId(sceneId);
        for (Map<String, Object> obj : objects) {
            String objId = (String) obj.get("id");
            objectStore.remove(objId);
        }

        // 删除场景
        return sceneStore.remove(sceneId) != null;
    }

    /**
     * 获取场景中的所有对象
     */
    public List<Map<String, Object>> getObjectsBySceneId(String sceneId) {
        List<Map<String, Object>> objects = new ArrayList<>();

        for (Map<String, Object> obj : objectStore.values()) {
            if (sceneId.equals(obj.get("sceneId"))) {
                objects.add(obj);
            }
        }

        return objects;
    }

    /**
     * 根据ID获取对象
     */
    public Map<String, Object> getObjectById(String objectId) {
        return objectStore.get(objectId);
    }

    /**
     * 创建新对象
     */
    public Map<String, Object> createObject(Map<String, Object> objectData) {
        String objectId = "obj_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);

        Map<String, Object> newObject = new HashMap<>(objectData);
        newObject.put("id", objectId);

        // 设置默认值
        if (!newObject.containsKey("position")) {
            newObject.put("position", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
        }

        if (!newObject.containsKey("rotation")) {
            newObject.put("rotation", Map.of("x", 0.0, "y", 0.0, "z", 0.0));
        }

        if (!newObject.containsKey("scale")) {
            newObject.put("scale", Map.of("x", 1.0, "y", 1.0, "z", 1.0));
        }

        if (!newObject.containsKey("material")) {
            newObject.put("material", Map.of(
                "type", "standard",
                "color", "#ffffff",
                "metalness", 0.5,
                "roughness", 0.5
            ));
        }

        if (!newObject.containsKey("physics")) {
            newObject.put("physics", Map.of(
                "enabled", false,
                "bodyType", "static",
                "mass", 1.0,
                "friction", 0.5,
                "restitution", 0.3
            ));
        }

        objectStore.put(objectId, newObject);

        // 更新场景的对象计数
        String sceneId = (String) newObject.get("sceneId");
        if (sceneId != null) {
            Map<String, Object> scene = sceneStore.get(sceneId);
            if (scene != null) {
                int objectCount = (int) scene.getOrDefault("objectCount", 0);
                scene.put("objectCount", objectCount + 1);
                scene.put("updatedAt", System.currentTimeMillis());
            }
        }

        return newObject;
    }

    /**
     * 更新对象
     */
    public Map<String, Object> updateObject(String objectId, Map<String, Object> objectData) {
        Map<String, Object> existingObject = objectStore.get(objectId);
        if (existingObject == null) {
            return null;
        }

        // 更新字段
        existingObject.putAll(objectData);

        // 确保ID不变
        existingObject.put("id", objectId);

        objectStore.put(objectId, existingObject);

        // 更新场景的更新时间
        String sceneId = (String) existingObject.get("sceneId");
        if (sceneId != null) {
            Map<String, Object> scene = sceneStore.get(sceneId);
            if (scene != null) {
                scene.put("updatedAt", System.currentTimeMillis());
            }
        }

        return existingObject;
    }

    /**
     * 删除对象
     */
    public boolean deleteObject(String objectId) {
        Map<String, Object> object = objectStore.get(objectId);
        if (object == null) {
            return false;
        }

        // 更新场景的对象计数
        String sceneId = (String) object.get("sceneId");
        if (sceneId != null) {
            Map<String, Object> scene = sceneStore.get(sceneId);
            if (scene != null) {
                int objectCount = (int) scene.getOrDefault("objectCount", 0);
                scene.put("objectCount", Math.max(0, objectCount - 1));
                scene.put("updatedAt", System.currentTimeMillis());
            }
        }

        return objectStore.remove(objectId) != null;
    }

    /**
     * 批量操作对象
     */
    public List<Map<String, Object>> batchUpdateObjects(List<Map<String, Object>> objectUpdates) {
        List<Map<String, Object>> results = new ArrayList<>();

        for (Map<String, Object> update : objectUpdates) {
            String objectId = (String) update.get("id");
            if (objectId != null) {
                Map<String, Object> updatedObject = updateObject(objectId, update);
                if (updatedObject != null) {
                    results.add(updatedObject);
                }
            }
        }

        return results;
    }

    /**
     * 搜索场景
     */
    public List<Map<String, Object>> searchScenes(String query, Map<String, Object> filters) {
        List<Map<String, Object>> results = new ArrayList<>();

        for (Map<String, Object> scene : sceneStore.values()) {
            boolean match = true;

            // 文本搜索
            if (query != null && !query.isEmpty()) {
                String name = (String) scene.get("name");
                String description = (String) scene.get("description");

                if (name != null && name.toLowerCase().contains(query.toLowerCase())) {
                    // 匹配名称
                } else if (description != null && description.toLowerCase().contains(query.toLowerCase())) {
                    // 匹配描述
                } else {
                    match = false;
                }
            }

            // 过滤器
            if (filters != null && match) {
                for (Map.Entry<String, Object> filter : filters.entrySet()) {
                    String key = filter.getKey();
                    Object value = filter.getValue();

                    if (scene.containsKey(key)) {
                        Object sceneValue = scene.get(key);
                        if (!Objects.equals(sceneValue, value)) {
                            match = false;
                            break;
                        }
                    }
                }
            }

            if (match) {
                results.add(scene);
            }
        }

        return results;
    }

    /**
     * 获取场景统计信息
     */
    public Map<String, Object> getSceneStatistics() {
        Map<String, Object> stats = new HashMap<>();

        int totalScenes = sceneStore.size();
        int totalObjects = objectStore.size();

        // 计算平均对象数
        double avgObjectsPerScene = totalScenes > 0 ? (double) totalObjects / totalScenes : 0;

        // 计算最近更新时间
        long latestUpdate = 0;
        for (Map<String, Object> scene : sceneStore.values()) {
            Long updatedAt = (Long) scene.get("updatedAt");
            if (updatedAt != null && updatedAt > latestUpdate) {
                latestUpdate = updatedAt;
            }
        }

        stats.put("totalScenes", totalScenes);
        stats.put("totalObjects", totalObjects);
        stats.put("avgObjectsPerScene", avgObjectsPerScene);
        stats.put("latestUpdate", latestUpdate);
        stats.put("sampleSceneCount", 1); // 示例场景数量

        return stats;
    }
}

