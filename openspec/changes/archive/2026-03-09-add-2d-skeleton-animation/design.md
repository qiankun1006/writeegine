# 2D 骨骼动画系统 - 技术设计文档

## 目录
1. [系统架构](#系统架构)
2. [核心模块设计](#核心模块设计)
3. [数据结构](#数据结构)
4. [算法实现](#算法实现)
5. [UI 交互流程](#ui-交互流程)
6. [集成方案](#集成方案)

---

## 系统架构

### 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    图片编辑器主框架                            │
├─────────────────────────────────────────────────────────────┤
│  左侧工具栏 │     Canvas 画布区     │  右侧属性面板（骨骼扩展）│
├─────────────────────────────────────────────────────────────┤
│                  底部时间轴编辑器（新增）                      │
├─────────────────────────────────────────────────────────────┤

骨骼动画系统模块：
┌─────────────────────────────────────────────────────────────┐
│                 SkeletonAnimationSystem                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Core 核心   │  │   UI 交互    │  │  Tools 工具  │       │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤       │
│  │ Skeleton     │  │ Timeline     │  │ BoneEditTool │       │
│  │ Animation    │  │ KeyframeUI   │  │ AnimPlayTool │       │
│  │ Transformer  │  │ BoneHierarchy│  │ ...          │       │
│  │ Player       │  │ PropertyEdit │  │              │       │
│  │ Interpolator │  │ ...          │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        与现有系统的接口                                 │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ · Layer 系统集成          · History 撤销重做           │   │
│  │ · Canvas 渲染             · Menu 菜单                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 模块划分

#### Core（核心）模块
- **Skeleton.js** - 骨骼系统主类，管理骨骼树和变换
- **SkeletonTransformer.js** - 正向动力学（FK）计算引擎
- **SkeletonSkinning.js** - 皮肤绑定和顶点变换
- **Animation.js** - 动画数据容器和时间轴管理
- **KeyframeManager.js** - 关键帧数据管理
- **AnimationPlayer.js** - 动画播放控制和时间管理
- **AnimationInterpolator.js** - 曲线插值计算

#### UI（交互）模块
- **Timeline.js** - 时间轴编辑器 UI
- **KeyframeUI.js** - 关键帧轨道编辑面板
- **BoneHierarchyPanel.js** - 骨骼层级树面板
- **PropertyPanel.js** - 属性编辑面板
- **SkeletonDebugRenderer.js** - 骨骼可视化调试

#### Tools（工具）模块
- **BoneEditTool.js** - 骨骼编辑工具（选择、移动、旋转）
- **BoneCreateTool.js** - 骨骼创建工具
- **AnimationPlayTool.js** - 动画播放控制工具

---

## 核心模块设计

### 1. Skeleton.js - 骨骼系统

```javascript
class Skeleton {
  constructor(name = 'Skeleton') {
    this.name = name;
    this.bones = new Map();        // ID → Bone 对象
    this.rootBones = [];           // 根骨骼列表
    this.selectedBone = null;      // 当前选中的骨骼
  }

  // 骨骼操作
  addBone(bone, parentBoneId = null) {
    this.bones.set(bone.id, bone);
    if (parentBoneId) {
      const parent = this.bones.get(parentBoneId);
      parent.addChild(bone);
      bone.parent = parent;
    } else {
      this.rootBones.push(bone);
    }
  }

  removeBone(boneId) {
    const bone = this.bones.get(boneId);
    if (bone) {
      if (bone.parent) {
        bone.parent.removeChild(bone);
      } else {
        const idx = this.rootBones.indexOf(bone);
        if (idx > -1) this.rootBones.splice(idx, 1);
      }
      this.bones.delete(boneId);
    }
  }

  // 获取所有骨骼的世界变换
  updateWorldTransforms() {
    this.rootBones.forEach(bone => {
      bone.updateWorldTransform();
    });
  }

  // 序列化
  serialize() {
    return {
      name: this.name,
      bones: Array.from(this.bones.values()).map(b => b.serialize())
    };
  }
}

class Bone {
  constructor(id, name) {
    this.id = id;
    this.name = name;

    // 本地变换
    this.position = { x: 0, y: 0 };
    this.rotation = 0;              // 弧度
    this.scale = { x: 1, y: 1 };

    // 世界变换（计算得出）
    this.worldMatrix = Matrix2D.identity();
    this.worldPosition = { x: 0, y: 0 };
    this.worldRotation = 0;

    // 树结构
    this.parent = null;
    this.children = [];

    // 可视化
    this.length = 50;               // 骨骼显示长度
    this.visible = true;
  }

  addChild(bone) {
    this.children.push(bone);
  }

  removeChild(bone) {
    const idx = this.children.indexOf(bone);
    if (idx > -1) this.children.splice(idx, 1);
  }

  // 更新世界变换（级联）
  updateWorldTransform() {
    if (this.parent) {
      // 本地矩阵
      const localMatrix = Matrix2D.fromTRS(
        this.position,
        this.rotation,
        this.scale
      );
      // 世界矩阵 = 父世界矩阵 × 本地矩阵
      this.worldMatrix = Matrix2D.multiply(
        this.parent.worldMatrix,
        localMatrix
      );
    } else {
      this.worldMatrix = Matrix2D.fromTRS(
        this.position,
        this.rotation,
        this.scale
      );
    }

    // 更新世界位置和旋转
    const [x, y] = this.worldMatrix.transform(0, 0);
    this.worldPosition = { x, y };
    this.worldRotation = this.getWorldRotation();

    // 递归更新子骨骼
    this.children.forEach(child => child.updateWorldTransform());
  }

  getWorldRotation() {
    // 从矩阵提取旋转
    return Math.atan2(
      this.worldMatrix.m01,
      this.worldMatrix.m00
    );
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      rotation: this.rotation,
      scale: this.scale,
      length: this.length,
      children: this.children.map(c => c.serialize())
    };
  }
}
```

### 2. Animation.js - 动画数据结构

```javascript
class Animation {
  constructor(name = 'Animation', fps = 24, frameCount = 60) {
    this.name = name;
    this.fps = fps;                 // 帧速率
    this.frameCount = frameCount;   // 总帧数
    this.duration = frameCount / fps; // 持续时间（秒）

    // 动画轨道：boneId → Track
    this.tracks = new Map();

    this.loop = true;               // 循环播放
    this.autoPlay = true;
  }

  // 为骨骼创建轨道
  getOrCreateTrack(boneId) {
    if (!this.tracks.has(boneId)) {
      this.tracks.set(boneId, new Track(boneId));
    }
    return this.tracks.get(boneId);
  }

  // 在指定帧添加关键帧
  setKeyframe(boneId, frameIndex, bone) {
    const track = this.getOrCreateTrack(boneId);
    track.setKeyframe(frameIndex, bone);
  }

  // 获取指定时间的骨骼变换
  evaluateBone(boneId, time) {
    const track = this.tracks.get(boneId);
    if (!track) return null;
    return track.evaluate(time, this.duration);
  }

  serialize() {
    return {
      name: this.name,
      fps: this.fps,
      frameCount: this.frameCount,
      duration: this.duration,
      tracks: Object.fromEntries(
        Array.from(this.tracks.entries()).map(([boneId, track]) => [
          boneId,
          track.serialize()
        ])
      )
    };
  }
}

class Track {
  constructor(boneId) {
    this.boneId = boneId;
    // 关键帧集合：frame_index → Keyframe
    this.keyframes = new Map();
  }

  setKeyframe(frameIndex, bone) {
    this.keyframes.set(frameIndex, new Keyframe(frameIndex, bone));
  }

  removeKeyframe(frameIndex) {
    this.keyframes.delete(frameIndex);
  }

  // 获取指定时间的插值值
  evaluate(time, duration) {
    if (this.keyframes.size === 0) return null;

    const frameIndex = (time / duration) * this.fps;
    const framesBefore = Array.from(this.keyframes.keys())
      .filter(f => f <= frameIndex)
      .sort((a, b) => b - a)[0];

    const framesAfter = Array.from(this.keyframes.keys())
      .filter(f => f > frameIndex)
      .sort((a, b) => a - b)[0];

    if (framesBefore === undefined) {
      return this.keyframes.get(framesAfter).bone;
    }
    if (framesAfter === undefined) {
      return this.keyframes.get(framesBefore).bone;
    }

    // 线性插值
    const kfBefore = this.keyframes.get(framesBefore);
    const kfAfter = this.keyframes.get(framesAfter);
    const t = (frameIndex - framesBefore) / (framesAfter - framesBefore);

    return this.interpolate(kfBefore.bone, kfAfter.bone, t);
  }

  interpolate(boneA, boneB, t) {
    return {
      position: {
        x: boneA.position.x + (boneB.position.x - boneA.position.x) * t,
        y: boneA.position.y + (boneB.position.y - boneA.position.y) * t
      },
      rotation: boneA.rotation + (boneB.rotation - boneA.rotation) * t,
      scale: {
        x: boneA.scale.x + (boneB.scale.x - boneA.scale.x) * t,
        y: boneA.scale.y + (boneB.scale.y - boneA.scale.y) * t
      }
    };
  }

  serialize() {
    return {
      boneId: this.boneId,
      keyframes: Object.fromEntries(
        Array.from(this.keyframes.entries()).map(([frameIdx, kf]) => [
          frameIdx,
          kf.serialize()
        ])
      )
    };
  }
}

class Keyframe {
  constructor(frameIndex, bone) {
    this.frameIndex = frameIndex;
    this.bone = {
      position: { ...bone.position },
      rotation: bone.rotation,
      scale: { ...bone.scale }
    };
    this.interpolation = 'linear';  // 'linear', 'bezier', 'step'
  }

  serialize() {
    return {
      frameIndex: this.frameIndex,
      bone: this.bone,
      interpolation: this.interpolation
    };
  }
}
```

### 3. AnimationPlayer.js - 播放控制

```javascript
class AnimationPlayer {
  constructor(skeleton, animation) {
    this.skeleton = skeleton;
    this.animation = animation;

    this.isPlaying = false;
    this.currentTime = 0;
    this.playSpeed = 1.0;           // 播放速度
    this.loop = animation.loop;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
  }

  setTime(time) {
    this.currentTime = Math.max(0, Math.min(time, this.animation.duration));
  }

  update(deltaTime) {
    if (!this.isPlaying) return;

    this.currentTime += deltaTime * this.playSpeed;

    if (this.currentTime >= this.animation.duration) {
      if (this.loop) {
        this.currentTime = 0;
      } else {
        this.currentTime = this.animation.duration;
        this.isPlaying = false;
      }
    }

    // 更新骨骼变换
    this.animation.tracks.forEach((track, boneId) => {
      const bone = this.skeleton.bones.get(boneId);
      if (bone) {
        const transform = track.evaluate(
          this.currentTime,
          this.animation.duration
        );
        if (transform) {
          bone.position = transform.position;
          bone.rotation = transform.rotation;
          bone.scale = transform.scale;
        }
      }
    });

    // 更新所有骨骼的世界变换
    this.skeleton.updateWorldTransforms();
  }

  // 获取当前帧
  getCurrentFrame() {
    return Math.round(
      (this.currentTime / this.animation.duration) * this.animation.frameCount
    );
  }
}
```

---

## 数据结构

### 骨骼动画项目结构

```javascript
{
  version: "1.0",
  animations: [
    {
      name: "idle",
      fps: 24,
      frameCount: 60,
      tracks: {
        "bone_0": {
          keyframes: {
            0: { position: {x:0, y:0}, rotation: 0, scale: {x:1, y:1} },
            30: { position: {x:5, y:-2}, rotation: 0.2, scale: {x:1.1, y:1.1} },
            60: { position: {x:0, y:0}, rotation: 0, scale: {x:1, y:1} }
          }
        },
        "bone_1": { ... }
      }
    }
  ],
  skeleton: {
    name: "Character",
    bones: [
      {
        id: "bone_0",
        name: "Root",
        position: {x:0, y:0},
        rotation: 0,
        scale: {x:1, y:1},
        length: 50,
        children: [
          {
            id: "bone_1",
            name: "Arm",
            ...
          }
        ]
      }
    ]
  }
}
```

---

## 算法实现

### 1. 正向动力学（FK）- 矩阵变换

```javascript
class Matrix2D {
  constructor(m00, m01, m02, m10, m11, m12) {
    this.m00 = m00; this.m01 = m01; this.m02 = m02;
    this.m10 = m10; this.m11 = m11; this.m12 = m12;
  }

  static identity() {
    return new Matrix2D(1, 0, 0, 0, 1, 0);
  }

  static fromTRS(position, rotation, scale) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return new Matrix2D(
      cos * scale.x,  -sin * scale.x,  position.x,
      sin * scale.y,   cos * scale.y,  position.y
    );
  }

  // 矩阵乘法
  static multiply(a, b) {
    return new Matrix2D(
      a.m00 * b.m00 + a.m01 * b.m10,
      a.m00 * b.m01 + a.m01 * b.m11,
      a.m00 * b.m02 + a.m01 * b.m12 + a.m02,
      a.m10 * b.m00 + a.m11 * b.m10,
      a.m10 * b.m01 + a.m11 * b.m11,
      a.m10 * b.m02 + a.m11 * b.m12 + a.m12
    );
  }

  // 变换点
  transform(x, y) {
    return [
      this.m00 * x + this.m01 * y + this.m02,
      this.m10 * x + this.m11 * y + this.m12
    ];
  }
}
```

### 2. 线性插值

```javascript
class AnimationInterpolator {
  // 线性插值（LERP）
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // 二次贝塞尔曲线插值
  static bezier(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
  }

  // 插值骨骼变换
  static interpolateBone(boneA, boneB, t, type = 'linear') {
    if (type === 'step') {
      return t < 0.5 ? boneA : boneB;
    }

    if (type === 'linear') {
      return {
        position: {
          x: this.lerp(boneA.position.x, boneB.position.x, t),
          y: this.lerp(boneA.position.y, boneB.position.y, t)
        },
        rotation: this.lerpAngle(boneA.rotation, boneB.rotation, t),
        scale: {
          x: this.lerp(boneA.scale.x, boneB.scale.x, t),
          y: this.lerp(boneA.scale.y, boneB.scale.y, t)
        }
      };
    }

    // bezier interpolation (更复杂，省略)
  }

  static lerpAngle(a, b, t) {
    let delta = b - a;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    return a + delta * t;
  }
}
```

---

## UI 交互流程

### 创建骨骼流程
```
用户点击"新建骨骼"按钮
  ↓
激活 BoneCreateTool
  ↓
用户在画布上点击创建骨骼
  ↓
创建新的 Bone 对象
  ↓
添加到 Skeleton
  ↓
在骨骼面板显示新骨骼
  ↓
添加 Command 到 History（撤销重做）
```

### 编辑动画流程
```
选择需要编辑的骨骼（在层级面板或画布）
  ↓
在时间轴定位到需要编辑的帧
  ↓
在画布上拖拽骨骼或在属性面板输入数值
  ↓
点击"插入关键帧"按钮
  ↓
关键帧被记录到 Animation 对象
  ↓
在关键帧轨道上显示关键帧标记
  ↓
点击播放预览动画
```

---

## 集成方案

### 1. 与 Layer 系统集成

```javascript
// 扩展 Layer 类
class Layer {
  constructor() {
    // 现有属性...
    this.skeletonData = null;       // 新增：骨骼数据
    this.animationData = null;      // 新增：动画数据
    this.isSkeletonLayer = false;   // 新增：标记为骨骼层
  }

  // 序列化包含骨骼数据
  serialize() {
    const base = { ...this.baseSerialize() };
    if (this.isSkeletonLayer && this.skeletonData) {
      base.skeletonData = this.skeletonData.serialize();
      base.animationData = this.animationData.serialize();
    }
    return base;
  }

  // 反序列化恢复骨骼
  static deserialize(data) {
    const layer = new Layer();
    // ... 恢复基础属性
    if (data.skeletonData) {
      layer.skeletonData = Skeleton.deserialize(data.skeletonData);
      layer.animationData = Animation.deserialize(data.animationData);
      layer.isSkeletonLayer = true;
    }
    return layer;
  }
}
```

### 2. 与 Command 系统集成

```javascript
// 骨骼创建命令
class AddBoneCommand extends Command {
  constructor(skeleton, bone, parentId) {
    this.skeleton = skeleton;
    this.bone = bone;
    this.parentId = parentId;
  }

  execute() {
    this.skeleton.addBone(this.bone, this.parentId);
  }

  undo() {
    this.skeleton.removeBone(this.bone.id);
  }
}

// 关键帧设置命令
class SetKeyframeCommand extends Command {
  constructor(animation, boneId, frameIndex, newBone, oldBone) {
    this.animation = animation;
    this.boneId = boneId;
    this.frameIndex = frameIndex;
    this.newBone = newBone;
    this.oldBone = oldBone;
  }

  execute() {
    this.animation.setKeyframe(this.boneId, this.frameIndex, this.newBone);
  }

  undo() {
    if (this.oldBone) {
      this.animation.setKeyframe(this.boneId, this.frameIndex, this.oldBone);
    } else {
      this.animation.removeKeyframe(this.frameIndex);
    }
  }
}
```

### 3. 渲染集成

```javascript
// 在图片编辑器的 render 循环中调用
class ImageEditor {
  render() {
    // 原有渲染...
    this._renderLayers();

    // 新增：如果当前编辑骨骼动画，渲染骨骼
    if (this.currentTool instanceof BoneEditTool) {
      this._renderSkeletonOverlay();
    }

    // 新增：播放动画时渲染
    if (this.animationPlayer && this.animationPlayer.isPlaying) {
      this.animationPlayer.update(deltaTime);
    }
  }

  _renderSkeletonOverlay() {
    const ctx = this.canvas.getContext('2d');
    const layer = this.getSelectedLayer();

    if (layer && layer.skeletonData) {
      const skeleton = layer.skeletonData;
      skeleton.rootBones.forEach(bone => {
        this._renderBone(ctx, bone);
      });
    }
  }

  _renderBone(ctx, bone) {
    // 绘制骨骼连线
    ctx.strokeStyle = bone === this.currentTool.selectedBone ? '#FF0000' : '#0088FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bone.worldPosition.x, bone.worldPosition.y);

    // 计算骨骼末端
    const endX = bone.worldPosition.x +
                 bone.length * Math.cos(bone.worldRotation);
    const endY = bone.worldPosition.y +
                 bone.length * Math.sin(bone.worldRotation);

    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 绘制骨骼节点
    ctx.fillStyle = bone === this.currentTool.selectedBone ? '#FF0000' : '#00CC00';
    ctx.beginPath();
    ctx.arc(bone.worldPosition.x, bone.worldPosition.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // 递归绘制子骨骼
    bone.children.forEach(child => this._renderBone(ctx, child));
  }
}
```

---

## 库选型建议

### 选项 1：集成现成库（推荐快速迭代）

**DragonBones 或 Spine**
- 优点：功能完整、性能优化好、格式标准
- 缺点：学习成本、与现有系统集成需要包装
- 推荐用于：生产环境、大型项目

### 选项 2：从零实现 FK 系统（推荐长期维护）

- 优点：完全可控、集成简单、代码清晰易维护
- 缺点：需要自己实现所有功能、初期投入大
- 推荐用于：教学、中小型项目

### 最终建议

**分阶段方案：**
1. **第一阶段**：集成现成库实现 MVP，快速验证市场
2. **第二阶段**：基于现成库的经验，自己实现 FK 系统
3. **第三阶段**：逐步扩展 IK、粒子等高级功能

---

## 性能考量

### 大骨骼数量优化
- 骨骼数量 < 100：无需优化
- 骨骼数量 100-500：缓存世界矩阵，只在需要时更新
- 骨骼数量 > 500：考虑 GPU 加速或多线程计算

### 关键帧数量优化
- 使用稀疏存储（Map 而不是数组）
- 关键帧查询使用二分搜索
- 实现关键帧曲线预计算

### 内存优化
- 使用 TypedArray 存储矩阵数据
- 实现对象池避免频繁 GC
- 动画播放完毕后释放播放器实例

