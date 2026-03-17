# 骨骼动画核心系统规范

## ADDED Requirements

### Requirement: 骨骼数据模型
系统SHALL提供完整的骨骼数据结构定义。

#### Scenario: 创建骨骼数据
- **WHEN** 开发者创建骨骼数据
- **THEN** 系统应提供 BoneData 类
- **AND** 支持设置骨骼名称、父骨骼、长度和变换信息

```typescript
const boneData = new BoneData("bone1");
boneData.parent = "root";
boneData.length = 50;
boneData.transform.x = 10;
boneData.transform.y = 20;
```

#### Scenario: 创建骨架数据
- **WHEN** 开发者创建骨架数据
- **THEN** 系统应提供 ArmatureData 类
- **AND** 支持添加骨骼、插槽、动画和皮肤数据

```typescript
const armatureData = new ArmatureData("character");
armatureData.addBoneData(boneData);
armatureData.frameRate = 24;
```

### Requirement: 骨骼运行时系统
系统SHALL提供骨骼层级管理和变换计算功能。

#### Scenario: 骨骼层级构建
- **WHEN** 开发者构建骨骼层级
- **THEN** 系统应提供 Bone 类
- **AND** 支持父子骨骼关系管理

```typescript
const bone = new Bone(boneData);
const parentBone = new Bone(parentBoneData);
parentBone.addChild(bone);
```

#### Scenario: 骨骼变换更新
- **WHEN** 骨骼变换被修改
- **THEN** 系统应标记变换为脏状态
- **AND** 在更新时重新计算变换矩阵

```typescript
bone.global.x = 100;
bone.global.y = 50;
bone.global.scaleX = 1.2;
bone._transformDirty = true;
bone.update(); // 触发变换计算
```

### Requirement: 动画状态管理
系统SHALL提供动画播放控制和状态管理。

#### Scenario: 动画播放
- **WHEN** 开发者创建动画状态
- **THEN** 系统应提供 AnimationState 类
- **AND** 支持播放控制、时间缩放和循环设置

```typescript
const animationState = new AnimationState("walk", animationData, armature);
animationState.play();
animationState.timeScale = 1.5; // 1.5倍速播放
```

#### Scenario: 动画控制
- **WHEN** 开发者控制动画播放
- **THEN** 系统应支持停止、淡出和跳转功能
- **AND** 提供平滑的动画过渡

```typescript
animationState.stop();
animationState.fadeOut(0.3); // 0.3秒淡出
animationState.gotoAndStop(30); // 跳转到第30帧并停止
```

### Requirement: 事件系统
系统SHALL提供完整的事件分发和处理机制。

#### Scenario: 动画事件
- **WHEN** 动画状态改变
- **THEN** 系统应触发相应事件
- **AND** 支持事件监听和处理

```typescript
armature.addEventListener(EventObject.START, (event) => {
    console.log("Animation started");
});

armature.addEventListener(EventObject.COMPLETE, (event) => {
    console.log("Animation completed");
});
```

#### Scenario: 自定义事件
- **WHEN** 开发者触发自定义事件
- **THEN** 系统应支持事件对象池
- **AND** 提供高效的事件分发机制

```typescript
const customEvent = BaseObject.borrowObject(EventObject);
customEvent.type = "footstep";
customEvent.data = { sound: "footstep.wav" };
armature.dispatchDBEvent(customEvent.type, customEvent);
customEvent.returnToPool();
```

### Requirement: 对象池管理
系统SHALL提供高效的对象池管理以减少内存分配。

#### Scenario: 对象池使用
- **WHEN** 开发者需要临时对象
- **THEN** 系统应提供对象池机制
- **AND** 支持对象的借用和归还

```typescript
// 从对象池获取对象
const transform = BaseObject.borrowObject(Transform);
transform.x = 100;
transform.y = 200;

// 使用完毕后归还
transform.returnToPool();
```

#### Scenario: 事件对象池
- **WHEN** 系统处理大量事件
- **THEN** 事件对象应自动使用对象池
- **AND** 减少内存分配和GC压力

```typescript
// 事件对象自动使用对象池
const eventObject = BaseObject.borrowObject(EventObject);
// ... 使用事件对象
eventObject.returnToPool(); // 自动重置并归还
```

### Requirement: 内存管理
系统SHALL提供资源管理和自动释放机制。

#### Scenario: 骨架资源释放
- **WHEN** 骨架不再需要
- **THEN** 系统应提供dispose方法
- **AND** 释放所有相关资源

```typescript
const armature = factory.buildArmature("character");
// ... 使用骨架
armature.dispose(); // 释放所有相关资源
```

#### Scenario: 工厂资源管理
- **WHEN** 工厂不再需要
- **THEN** 系统应清理所有缓存数据
- **AND** 释放内存资源

```typescript
factory.parseDragonBonesData(data);
factory.parseTextureAtlasData(atlasData, texture);
// ... 使用工厂创建的对象
factory.dispose(); // 清理所有缓存数据
```

### Requirement: 性能优化
系统SHALL提供脏检查机制以优化性能。

#### Scenario: 骨骼脏检查
- **WHEN** 骨骼变换被修改
- **THEN** 系统应标记为脏状态
- **AND** 只在需要时重新计算

```typescript
// 只有当骨骼变换被修改时才标记为脏
bone.global.x = newValue;
bone._transformDirty = true;

// 更新时只处理脏骨骼
if (bone._transformDirty) {
    bone.updateTransform();
    bone._transformDirty = false;
}
```

#### Scenario: 批量更新优化
- **WHEN** 需要更新多个骨骼
- **THEN** 系统应支持批量操作
- **AND** 减少重复计算

```typescript
// 批量修改多个骨骼
for (const bone of bones) {
    bone.global.x = calculateNewX();
    bone._transformDirty = true;
}

// 统一更新，减少重复计算
for (const bone of bones) {
    bone.update();
}

