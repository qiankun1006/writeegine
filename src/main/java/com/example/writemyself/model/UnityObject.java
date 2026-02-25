package com.example.writemyself.model;

import java.util.Date;
import java.util.Map;

/**
 * Unity 3D 对象数据模型
 * 表示场景中的一个 3D 对象，包含几何体、材质、变换、物理等属性
 */
public class UnityObject {

    private String id;
    private String name;
    private String type;
    private String parentId;
    private String sceneId;

    // 变换属性
    private Transform transform;

    // 几何体属性
    private Geometry geometry;

    // 材质属性
    private Material material;

    // 物理属性
    private PhysicsComponent physics;

    // 元数据
    private Map<String, Object> metadata;

    // 可见性
    private boolean visible;

    // 是否锁定（不可编辑）
    private boolean locked;

    // 文件大小（字节）
    private long fileSize;

    // 创建时间
    private Date createdAt;

    // 更新时间
    private Date updatedAt;

    // 标签
    private String[] tags;

    // 自定义属性
    private Map<String, Object> customProperties;

    public UnityObject() {
        this.id = generateId();
        this.name = "未命名对象";
        this.type = "mesh";
        this.visible = true;
        this.locked = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.transform = new Transform();
        this.geometry = new Geometry();
        this.material = new Material();
        this.physics = new PhysicsComponent();
    }

    public UnityObject(String name, String type) {
        this();
        this.name = name;
        this.type = type;
    }

    private String generateId() {
        return "obj_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }

    // 变换内部类
    public static class Transform {
        private double[] position; // [x, y, z]
        private double[] rotation; // [x, y, z] in degrees
        private double[] scale;    // [x, y, z]

        public Transform() {
            this.position = new double[]{0, 0, 0};
            this.rotation = new double[]{0, 0, 0};
            this.scale = new double[]{1, 1, 1};
        }

        public Transform(double[] position, double[] rotation, double[] scale) {
            this.position = position != null ? position : new double[]{0, 0, 0};
            this.rotation = rotation != null ? rotation : new double[]{0, 0, 0};
            this.scale = scale != null ? scale : new double[]{1, 1, 1};
        }

        public double[] getPosition() {
            return position;
        }

        public void setPosition(double[] position) {
            this.position = position;
        }

        public double[] getRotation() {
            return rotation;
        }

        public void setRotation(double[] rotation) {
            this.rotation = rotation;
        }

        public double[] getScale() {
            return scale;
        }

        public void setScale(double[] scale) {
            this.scale = scale;
        }

        public Map<String, Object> toJson() {
            Map<String, Object> json = new java.util.HashMap<>();
            json.put("position", position);
            json.put("rotation", rotation);
            json.put("scale", scale);
            return json;
        }
    }

    // 几何体内部类
    public static class Geometry {
        private String type; // box, sphere, cylinder, plane, mesh, etc.
        private Map<String, Object> parameters; // 几何体参数
        private String meshPath; // 网格文件路径（如果是导入的网格）
        private double[] boundingBox; // [minX, minY, minZ, maxX, maxY, maxZ]

        public Geometry() {
            this.type = "box";
            this.parameters = new java.util.HashMap<>();
            this.parameters.put("width", 1.0);
            this.parameters.put("height", 1.0);
            this.parameters.put("depth", 1.0);
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Map<String, Object> getParameters() {
            return parameters;
        }

        public void setParameters(Map<String, Object> parameters) {
            this.parameters = parameters;
        }

        public String getMeshPath() {
            return meshPath;
        }

        public void setMeshPath(String meshPath) {
            this.meshPath = meshPath;
        }

        public double[] getBoundingBox() {
            return boundingBox;
        }

        public void setBoundingBox(double[] boundingBox) {
            this.boundingBox = boundingBox;
        }

        public Map<String, Object> toJson() {
            Map<String, Object> json = new java.util.HashMap<>();
            json.put("type", type);
            json.put("parameters", parameters);
            json.put("meshPath", meshPath);
            json.put("boundingBox", boundingBox);
            return json;
        }
    }

    // 材质内部类
    public static class Material {
        private String type; // basic, standard, phong, etc.
        private String color; // hex color
        private double opacity; // 0-1
        private boolean transparent;
        private String texturePath; // 纹理文件路径
        private Map<String, Object> properties; // 材质属性

        public Material() {
            this.type = "standard";
            this.color = "#ffffff";
            this.opacity = 1.0;
            this.transparent = false;
            this.properties = new java.util.HashMap<>();
            this.properties.put("metalness", 0.5);
            this.properties.put("roughness", 0.5);
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public double getOpacity() {
            return opacity;
        }

        public void setOpacity(double opacity) {
            this.opacity = opacity;
        }

        public boolean isTransparent() {
            return transparent;
        }

        public void setTransparent(boolean transparent) {
            this.transparent = transparent;
        }

        public String getTexturePath() {
            return texturePath;
        }

        public void setTexturePath(String texturePath) {
            this.texturePath = texturePath;
        }

        public Map<String, Object> getProperties() {
            return properties;
        }

        public void setProperties(Map<String, Object> properties) {
            this.properties = properties;
        }

        public Map<String, Object> toJson() {
            Map<String, Object> json = new java.util.HashMap<>();
            json.put("type", type);
            json.put("color", color);
            json.put("opacity", opacity);
            json.put("transparent", transparent);
            json.put("texturePath", texturePath);
            json.put("properties", properties);
            return json;
        }
    }

    // 物理组件内部类
    public static class PhysicsComponent {
        private boolean enabled;
        private String bodyType; // static, dynamic, kinematic
        private double mass; // 质量
        private double friction; // 摩擦力
        private double restitution; // 弹性
        private String shape; // box, sphere, cylinder, mesh
        private Map<String, Object> shapeParams; // 碰撞形状参数

        public PhysicsComponent() {
            this.enabled = false;
            this.bodyType = "static";
            this.mass = 1.0;
            this.friction = 0.5;
            this.restitution = 0.3;
            this.shape = "box";
            this.shapeParams = new java.util.HashMap<>();
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getBodyType() {
            return bodyType;
        }

        public void setBodyType(String bodyType) {
            this.bodyType = bodyType;
        }

        public double getMass() {
            return mass;
        }

        public void setMass(double mass) {
            this.mass = mass;
        }

        public double getFriction() {
            return friction;
        }

        public void setFriction(double friction) {
            this.friction = friction;
        }

        public double getRestitution() {
            return restitution;
        }

        public void setRestitution(double restitution) {
            this.restitution = restitution;
        }

        public String getShape() {
            return shape;
        }

        public void setShape(String shape) {
            this.shape = shape;
        }

        public Map<String, Object> getShapeParams() {
            return shapeParams;
        }

        public void setShapeParams(Map<String, Object> shapeParams) {
            this.shapeParams = shapeParams;
        }

        public Map<String, Object> toJson() {
            Map<String, Object> json = new java.util.HashMap<>();
            json.put("enabled", enabled);
            json.put("bodyType", bodyType);
            json.put("mass", mass);
            json.put("friction", friction);
            json.put("restitution", restitution);
            json.put("shape", shape);
            json.put("shapeParams", shapeParams);
            return json;
        }
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

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
        this.updatedAt = new Date();
    }

    public String getSceneId() {
        return sceneId;
    }

    public void setSceneId(String sceneId) {
        this.sceneId = sceneId;
        this.updatedAt = new Date();
    }

    public Transform getTransform() {
        return transform;
    }

    public void setTransform(Transform transform) {
        this.transform = transform;
        this.updatedAt = new Date();
    }

    public Geometry getGeometry() {
        return geometry;
    }

    public void setGeometry(Geometry geometry) {
        this.geometry = geometry;
        this.updatedAt = new Date();
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
        this.updatedAt = new Date();
    }

    public PhysicsComponent getPhysics() {
        return physics;
    }

    public void setPhysics(PhysicsComponent physics) {
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

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
        this.updatedAt = new Date();
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
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

    public Map<String, Object> getCustomProperties() {
        return customProperties;
    }

    public void setCustomProperties(Map<String, Object> customProperties) {
        this.customProperties = customProperties;
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
        json.put("parentId", parentId);
        json.put("sceneId", sceneId);
        json.put("transform", transform != null ? transform.toJson() : null);
        json.put("geometry", geometry != null ? geometry.toJson() : null);
        json.put("material", material != null ? material.toJson() : null);
        json.put("physics", physics != null ? physics.toJson() : null);
        json.put("metadata", metadata);
        json.put("visible", visible);
        json.put("locked", locked);
        json.put("fileSize", fileSize);
        json.put("createdAt", createdAt.getTime());
        json.put("updatedAt", updatedAt.getTime());
        json.put("tags", tags);
        json.put("customProperties", customProperties);
        return json;
    }

    /**
     * 从 JSON 创建对象
     */
    public static UnityObject fromJson(Map<String, Object> json) {
        UnityObject obj = new UnityObject();

        if (json.containsKey("id")) obj.setId((String) json.get("id"));
        if (json.containsKey("name")) obj.setName((String) json.get("name"));
        if (json.containsKey("type")) obj.setType((String) json.get("type"));
        if (json.containsKey("parentId")) obj.setParentId((String) json.get("parentId"));
        if (json.containsKey("sceneId")) obj.setSceneId((String) json.get("sceneId"));
        if (json.containsKey("visible")) obj.setVisible((Boolean) json.get("visible"));
        if (json.containsKey("locked")) obj.setLocked((Boolean) json.get("locked"));
        if (json.containsKey("fileSize")) obj.setFileSize(((Number) json.get("fileSize")).longValue());
        if (json.containsKey("tags")) obj.setTags((String[]) json.get("tags"));
        if (json.containsKey("customProperties")) obj.setCustomProperties((Map<String, Object>) json.get("customProperties"));

        // 设置变换
        if (json.containsKey("transform")) {
            Map<String, Object> transformJson = (Map<String, Object>) json.get("transform");
            Transform transform = new Transform();
            if (transformJson.containsKey("position")) {
                Object pos = transformJson.get("position");
                if (pos instanceof java.util.List) {
                    java.util.List<Number> posList = (java.util.List<Number>) pos;
                    transform.setPosition(new double[]{
                        posList.get(0).doubleValue(),
                        posList.get(1).doubleValue(),
                        posList.get(2).doubleValue()
                    });
                }
            }
            if (transformJson.containsKey("rotation")) {
                Object rot = transformJson.get("rotation");
                if (rot instanceof java.util.List) {
                    java.util.List<Number> rotList = (java.util.List<Number>) rot;
                    transform.setRotation(new double[]{
                        rotList.get(0).doubleValue(),
                        rotList.get(1).doubleValue(),
                        rotList.get(2).doubleValue()
                    });
                }
            }
            if (transformJson.containsKey("scale")) {
                Object scale = transformJson.get("scale");
                if (scale instanceof java.util.List) {
                    java.util.List<Number> scaleList = (java.util.List<Number>) scale;
                    transform.setScale(new double[]{
                        scaleList.get(0).doubleValue(),
                        scaleList.get(1).doubleValue(),
                        scaleList.get(2).doubleValue()
                    });
                }
            }
            obj.setTransform(transform);
        }

        // 设置几何体
        if (json.containsKey("geometry")) {
            Map<String, Object> geometryJson = (Map<String, Object>) json.get("geometry");
            Geometry geometry = new Geometry();
            if (geometryJson.containsKey("type")) geometry.setType((String) geometryJson.get("type"));
            if (geometryJson.containsKey("parameters")) geometry.setParameters((Map<String, Object>) geometryJson.get("parameters"));
            if (geometryJson.containsKey("meshPath")) geometry.setMeshPath((String) geometryJson.get("meshPath"));
            if (geometryJson.containsKey("boundingBox")) {
                Object bbox = geometryJson.get("boundingBox");
                if (bbox instanceof java.util.List) {
                    java.util.List<Number> bboxList = (java.util.List<Number>) bbox;
                    geometry.setBoundingBox(new double[]{
                        bboxList.get(0).doubleValue(),
                        bboxList.get(1).doubleValue(),
                        bboxList.get(2).doubleValue(),
                        bboxList.get(3).doubleValue(),
                        bboxList.get(4).doubleValue(),
                        bboxList.get(5).doubleValue()
                    });
                }
            }
            obj.setGeometry(geometry);
        }

        // 设置材质
        if (json.containsKey("material")) {
            Map<String, Object> materialJson = (Map<String, Object>) json.get("material");
            Material material = new Material();
            if (materialJson.containsKey("type")) material.setType((String) materialJson.get("type"));
            if (materialJson.containsKey("color")) material.setColor((String) materialJson.get("color"));
            if (materialJson.containsKey("opacity")) material.setOpacity(((Number) materialJson.get("opacity")).doubleValue());
            if (materialJson.containsKey("transparent")) material.setTransparent((Boolean) materialJson.get("transparent"));
            if (materialJson.containsKey("texturePath")) material.setTexturePath((String) materialJson.get("texturePath"));
            if (materialJson.containsKey("properties")) material.setProperties((Map<String, Object>) materialJson.get("properties"));
            obj.setMaterial(material);
        }

        // 设置物理组件
        if (json.containsKey("physics")) {
            Map<String, Object> physicsJson = (Map<String, Object>) json.get("physics");
            PhysicsComponent physics = new PhysicsComponent();
            if (physicsJson.containsKey("enabled")) physics.setEnabled((Boolean) physicsJson.get("enabled"));
            if (physicsJson.containsKey("bodyType")) physics.setBodyType((String) physicsJson.get("bodyType"));
            if (physicsJson.containsKey("mass")) physics.setMass(((Number) physicsJson.get("mass")).doubleValue());
            if (physicsJson.containsKey("friction")) physics.setFriction(((Number) physicsJson.get("friction")).doubleValue());
            if (physicsJson.containsKey("restitution")) physics.setRestitution(((Number) physicsJson.get("restitution")).doubleValue());
            if (physicsJson.containsKey("shape")) physics.setShape((String) physicsJson.get("shape"));
            if (physicsJson.containsKey("shapeParams")) physics.setShapeParams((Map<String, Object>) physicsJson.get("shapeParams"));
            obj.setPhysics(physics);
        }

        return obj;
    }

    @Override
    public String toString() {
        return "UnityObject{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", visible=" + visible +
                '}';
    }
}

