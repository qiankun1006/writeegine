package com.example.writemyself.model;

import java.util.Date;
import java.util.Map;

/**
 * Unity 物理组件数据模型
 * 表示 3D 对象的物理属性
 */
public class UnityPhysicsComponent {

    private String id;
    private String name;
    private String objectId;
    private String sceneId;

    // 基础属性
    private boolean enabled;
    private String bodyType; // static, dynamic, kinematic
    private double mass; // 质量
    private double friction; // 摩擦力
    private double restitution; // 弹性
    private double linearDamping; // 线性阻尼
    private double angularDamping; // 角阻尼

    // 碰撞形状
    private String shape; // box, sphere, cylinder, capsule, mesh
    private Map<String, Object> shapeParams; // 碰撞形状参数

    // 约束
    private Map<String, Object> constraints;

    // 力场
    private Map<String, Object> forceFields;

    // 触发器
    private boolean isTrigger;
    private Map<String, Object> triggerEvents;

    // 元数据
    private Map<String, Object> metadata;

    // 创建时间
    private Date createdAt;

    // 更新时间
    private Date updatedAt;

    public UnityPhysicsComponent() {
        this.id = generateId();
        this.name = "物理组件";
        this.enabled = false;
        this.bodyType = "static";
        this.mass = 1.0;
        this.friction = 0.5;
        this.restitution = 0.3;
        this.linearDamping = 0.0;
        this.angularDamping = 0.0;
        this.shape = "box";
        this.isTrigger = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public UnityPhysicsComponent(String name, String bodyType) {
        this();
        this.name = name;
        this.bodyType = bodyType;
    }

    private String generateId() {
        return "phys_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
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

    public String getObjectId() {
        return objectId;
    }

    public void setObjectId(String objectId) {
        this.objectId = objectId;
        this.updatedAt = new Date();
    }

    public String getSceneId() {
        return sceneId;
    }

    public void setSceneId(String sceneId) {
        this.sceneId = sceneId;
        this.updatedAt = new Date();
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        this.updatedAt = new Date();
    }

    public String getBodyType() {
        return bodyType;
    }

    public void setBodyType(String bodyType) {
        this.bodyType = bodyType;
        this.updatedAt = new Date();
    }

    public double getMass() {
        return mass;
    }

    public void setMass(double mass) {
        this.mass = mass;
        this.updatedAt = new Date();
    }

    public double getFriction() {
        return friction;
    }

    public void setFriction(double friction) {
        this.friction = friction;
        this.updatedAt = new Date();
    }

    public double getRestitution() {
        return restitution;
    }

    public void setRestitution(double restitution) {
        this.restitution = restitution;
        this.updatedAt = new Date();
    }

    public double getLinearDamping() {
        return linearDamping;
    }

    public void setLinearDamping(double linearDamping) {
        this.linearDamping = linearDamping;
        this.updatedAt = new Date();
    }

    public double getAngularDamping() {
        return angularDamping;
    }

    public void setAngularDamping(double angularDamping) {
        this.angularDamping = angularDamping;
        this.updatedAt = new Date();
    }

    public String getShape() {
        return shape;
    }

    public void setShape(String shape) {
        this.shape = shape;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getShapeParams() {
        return shapeParams;
    }

    public void setShapeParams(Map<String, Object> shapeParams) {
        this.shapeParams = shapeParams;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getConstraints() {
        return constraints;
    }

    public void setConstraints(Map<String, Object> constraints) {
        this.constraints = constraints;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getForceFields() {
        return forceFields;
    }

    public void setForceFields(Map<String, Object> forceFields) {
        this.forceFields = forceFields;
        this.updatedAt = new Date();
    }

    public boolean isTrigger() {
        return isTrigger;
    }

    public void setTrigger(boolean isTrigger) {
        this.isTrigger = isTrigger;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getTriggerEvents() {
        return triggerEvents;
    }

    public void setTriggerEvents(Map<String, Object> triggerEvents) {
        this.triggerEvents = triggerEvents;
        this.updatedAt = new Date();
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
        this.updatedAt = new Date();
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

    /**
     * 转换为前端使用的 JSON 格式
     */
    public Map<String, Object> toJson() {
        Map<String, Object> json = new java.util.HashMap<>();
        json.put("id", id);
        json.put("name", name);
        json.put("objectId", objectId);
        json.put("sceneId", sceneId);
        json.put("enabled", enabled);
        json.put("bodyType", bodyType);
        json.put("mass", mass);
        json.put("friction", friction);
        json.put("restitution", restitution);
        json.put("linearDamping", linearDamping);
        json.put("angularDamping", angularDamping);
        json.put("shape", shape);
        json.put("shapeParams", shapeParams);
        json.put("constraints", constraints);
        json.put("forceFields", forceFields);
        json.put("isTrigger", isTrigger);
        json.put("triggerEvents", triggerEvents);
        json.put("metadata", metadata);
        json.put("createdAt", createdAt.getTime());
        json.put("updatedAt", updatedAt.getTime());
        return json;
    }

    /**
     * 从 JSON 创建物理组件
     */
    public static UnityPhysicsComponent fromJson(Map<String, Object> json) {
        UnityPhysicsComponent component = new UnityPhysicsComponent();

        if (json.containsKey("id")) component.setId((String) json.get("id"));
        if (json.containsKey("name")) component.setName((String) json.get("name"));
        if (json.containsKey("objectId")) component.setObjectId((String) json.get("objectId"));
        if (json.containsKey("sceneId")) component.setSceneId((String) json.get("sceneId"));
        if (json.containsKey("enabled")) component.setEnabled((Boolean) json.get("enabled"));
        if (json.containsKey("bodyType")) component.setBodyType((String) json.get("bodyType"));
        if (json.containsKey("mass")) component.setMass(((Number) json.get("mass")).doubleValue());
        if (json.containsKey("friction")) component.setFriction(((Number) json.get("friction")).doubleValue());
        if (json.containsKey("restitution")) component.setRestitution(((Number) json.get("restitution")).doubleValue());
        if (json.containsKey("linearDamping")) component.setLinearDamping(((Number) json.get("linearDamping")).doubleValue());
        if (json.containsKey("angularDamping")) component.setAngularDamping(((Number) json.get("angularDamping")).doubleValue());
        if (json.containsKey("shape")) component.setShape((String) json.get("shape"));
        if (json.containsKey("shapeParams")) component.setShapeParams((Map<String, Object>) json.get("shapeParams"));
        if (json.containsKey("constraints")) component.setConstraints((Map<String, Object>) json.get("constraints"));
        if (json.containsKey("forceFields")) component.setForceFields((Map<String, Object>) json.get("forceFields"));
        if (json.containsKey("isTrigger")) component.setTrigger((Boolean) json.get("isTrigger"));
        if (json.containsKey("triggerEvents")) component.setTriggerEvents((Map<String, Object>) json.get("triggerEvents"));
        if (json.containsKey("metadata")) component.setMetadata((Map<String, Object>) json.get("metadata"));

        return component;
    }

    @Override
    public String toString() {
        return "UnityPhysicsComponent{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", enabled=" + enabled +
                ", bodyType='" + bodyType + '\'' +
                ", mass=" + mass +
                '}';
    }
}

