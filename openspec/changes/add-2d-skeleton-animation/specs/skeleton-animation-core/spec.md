# Spec: 2D 骨骼动画核心系统

## ADDED Requirements

### 骨骼系统基础
#### Requirement: 创建和管理骨骼树结构
- 系统必须支持创建、删除、重命名骨骼
- 系统必须支持设置骨骼的父子关系
- 系统必须维护骨骼的树形层级结构

#### Scenario: 用户创建一个有 3 个骨骼的骨架
```javascript
const skeleton = new Skeleton("Character");
const rootBone = new Bone("bone_0", "Root");
const armBone = new Bone("bone_1", "Arm");
const handBone = new Bone("bone_2", "Hand");

skeleton.addBone(rootBone);
skeleton.addBone(armBone, "bone_0");  // Root 的子骨骼
skeleton.addBone(handBone, "bone_1"); // Arm 的子骨骼

assert(skeleton.bones.size === 3);
assert(armBone.parent === rootBone);
```

### 骨骼变换
#### Requirement: 骨骼支持位置、旋转、缩放变换
- 每个骨骼必须有本地位置（x, y）、旋转（弧度）、缩放（x, y）
- 这些属性必须可以在任何时间修改
- 变换必须立即反映到骨骼的世界坐标中

#### Scenario: 用户调整骨骼的旋转
```javascript
const bone = new Bone("bone_0", "Arm");
bone.rotation = Math.PI / 4;  // 45 度
bone.updateWorldTransform();
assert(Math.abs(bone.rotation - Math.PI / 4) < 0.001);
```

### 正向动力学（FK）
#### Requirement: 级联变换计算
- 子骨骼的世界变换必须基于父骨骼的世界变换计算
- 更改父骨骼必须自动更新所有子骨骼
- 世界变换必须使用矩阵计算（TRS 分解）

#### Scenario: 父骨骼旋转时，子骨骼跟随旋转
```javascript
const parent = new Bone("root", "Root");
const child = new Bone("arm", "Arm");
parent.addChild(child);

parent.rotation = Math.PI / 2;  // 旋转 90 度
parent.updateWorldTransform();

// 子骨骼应该也旋转 90 度
assert(Math.abs(child.worldRotation - Math.PI / 2) < 0.001);
```

### 动画数据结构
#### Requirement: 支持多个动画和关键帧
- 一个骨架可以有多个动画
- 每个动画可以有多个轨道（每个骨骼一个）
- 每个轨道可以有多个关键帧

#### Scenario: 创建一个 "idle" 动画，有 60 帧，骨骼在 0 帧和 60 帧有关键帧
```javascript
const animation = new Animation("idle", 24, 60);  // 24 fps, 60 frames
const bone = new Bone("bone_0", "Root");

animation.setKeyframe("bone_0", 0, bone);
animation.setKeyframe("bone_0", 60, bone);

const track = animation.tracks.get("bone_0");
assert(track.keyframes.has(0));
assert(track.keyframes.has(60));
```

### 关键帧插值
#### Requirement: 在关键帧之间进行插值
- 系统必须支持线性插值
- 系统必须支持步进插值（无过渡）
- 系统必须正确处理旋转的角度插值

#### Scenario: 插值两个骨骼位置的中点
```javascript
const boneA = new Bone("bone", "Arm");
boneA.position = { x: 0, y: 0 };

const boneB = new Bone("bone", "Arm");
boneB.position = { x: 10, y: 0 };

const interpolated = track.interpolate(boneA, boneB, 0.5);
assert(interpolated.position.x === 5);
assert(interpolated.position.y === 0);
```

### 动画播放
#### Requirement: 播放、暂停、停止动画
- 系统必须支持播放动画
- 系统必须支持暂停动画
- 系统必须支持停止并重置时间为 0
- 系统必须支持调整播放速度

#### Scenario: 用户播放动画，调整速度，然后停止
```javascript
const player = new AnimationPlayer(skeleton, animation);
player.play();
assert(player.isPlaying === true);

player.playSpeed = 2.0;  // 2x 速度
player.update(0.016);    // 16ms 更新

player.stop();
assert(player.isPlaying === false);
assert(player.currentTime === 0);
```

---

## MODIFIED Requirements

### 与图层系统集成
#### Requirement: Layer 支持存储骨骼和动画数据
- Layer 必须能够序列化和反序列化骨骼数据
- Layer 必须能够序列化和反序列化动画数据
- Layer 的 isSkeletonLayer 标志必须标识其为骨骼层

#### Scenario: 用户保存包含骨骼的图层，然后加载
```javascript
const layer = new Layer();
layer.skeletonData = skeleton;
layer.animationData = animation;
layer.isSkeletonLayer = true;

const serialized = layer.serialize();
const loaded = Layer.deserialize(serialized);

assert(loaded.isSkeletonLayer === true);
assert(loaded.skeletonData !== null);

