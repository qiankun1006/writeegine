# 2D 骨骼动画系统 - 快速开始指南

## 5 分钟快速上手

### 1. 加载脚本和样式

在 `create-game-image.html` 中添加以下代码到 `</head>` 之前：

```html
<!-- 样式 -->
<link rel="stylesheet" href="/static/css/skeleton-animation.css">
```

在 `</body>` 之前添加脚本加载（在 `ImageEditor` 初始化之后）：

```html
<!-- 核心系统 -->
<script src="/static/js/image-editor/skeleton/core/Matrix2D.js"></script>
<script src="/static/js/image-editor/skeleton/core/Bone.js"></script>
<script src="/static/js/image-editor/skeleton/core/Skeleton.js"></script>
<script src="/static/js/image-editor/skeleton/core/Keyframe.js"></script>
<script src="/static/js/image-editor/skeleton/core/Track.js"></script>
<script src="/static/js/image-editor/skeleton/core/Animation.js"></script>
<script src="/static/js/image-editor/skeleton/core/AnimationPlayer.js"></script>
<script src="/static/js/image-editor/skeleton/core/SkeletonCommands.js"></script>

<!-- UI 组件 -->
<script src="/static/js/image-editor/skeleton/ui/BoneHierarchyPanel.js"></script>
<script src="/static/js/image-editor/skeleton/ui/Timeline.js"></script>
<script src="/static/js/image-editor/skeleton/ui/BonePropertyPanel.js"></script>
<script src="/static/js/image-editor/skeleton/ui/SkeletonAnimationEditor.js"></script>

<!-- 工具 -->
<script src="/static/js/image-editor/skeleton/tools/BoneEditTool.js"></script>
```

### 2. 初始化编辑器

在 `app.js` 中添加：

```javascript
// 假设 imageEditor 已初始化
const skeletonEditor = new SkeletonAnimationEditor(imageEditor);
skeletonEditor.init();

// 激活骨骼编辑工具
skeletonEditor.activateBoneEditTool();
```

### 3. 创建骨骼

```javascript
// 创建根骨骼
const rootBone = skeletonEditor.createBone('Root');

// 创建子骨骼
const armBone = skeletonEditor.createBone('LeftArm');
skeletonEditor.skeleton.setParent(armBone.id, rootBone.id);

// 设置骨骼属性
skeletonEditor.skeleton.setBonePosition(rootBone.id, 100, 100);
skeletonEditor.skeleton.setBoneRotation(armBone.id, Math.PI / 4);  // 45 度
```

### 4. 创建动画关键帧

```javascript
// 创建关键帧（第 0 帧）
skeletonEditor.createKeyframe(rootBone.id, 0);

// 移动骨骼
skeletonEditor.skeleton.setBonePosition(rootBone.id, 150, 100);

// 创建关键帧（第 12 帧）
skeletonEditor.createKeyframe(rootBone.id, 12);

// 恢复原始位置
skeletonEditor.skeleton.setBonePosition(rootBone.id, 100, 100);
```

### 5. 播放动画

```javascript
// 播放
skeletonEditor.animationPlayer.play();

// 在游戏循环中更新
function gameLoop(deltaTime) {
  skeletonEditor.update(deltaTime);  // deltaTime 以秒为单位
  // 渲染...
}

// 暂停
skeletonEditor.animationPlayer.pause();

// 停止并重置
skeletonEditor.animationPlayer.stop();
```

---

## 常见操作

### 在画布上编辑骨骼

1. **选择骨骼**：点击骨骼上的绿色圆点
2. **移动骨骼**：在关节附近拖拽（距离关节 < 20px）
3. **旋转骨骼**：在骨骼末端附近拖拽（距离关节 > 20px）
4. **查看属性**：右侧面板显示选中骨骼的实时属性

### 在时间轴上编辑关键帧

1. **创建关键帧**：点击时间轴顶部移动时间指针，然后按回车（需实现快捷键）
2. **选择关键帧**：点击时间轴上的绿色方块
3. **删除关键帧**：选中后按 Delete（需实现快捷键）
4. **移动关键帧**：拖拽时间轴上的关键帧

### 层级面板操作

1. **展开/折叠**：点击 ▶/▼ 按钮
2. **选择骨骼**：点击骨骼项
3. **右键菜单**：重命名、删除、显示/隐藏、锁定

---

## API 速查表

### 骨骼操作

```javascript
// 创建骨骼
const bone = skeletonEditor.createBone('BoneName');

// 删除骨骼
skeletonEditor.deleteBone(boneId);

// 设置骨骼属性
skeletonEditor.skeleton.setBonePosition(boneId, x, y);
skeletonEditor.skeleton.setBoneRotation(boneId, radians);
skeletonEditor.skeleton.setBoneScale(boneId, scaleX, scaleY);

// 设置父子关系
skeletonEditor.skeleton.setParent(childBoneId, parentBoneId);

// 选择骨骼
skeletonEditor.skeleton.selectBone(boneId);

// 获取骨骼
const bone = skeletonEditor.skeleton.getBone(boneId);
```

### 动画操作

```javascript
// 创建关键帧
skeletonEditor.createKeyframe(boneId, frameIndex);

// 删除关键帧
skeletonEditor.deleteKeyframe(boneId, frameIndex);

// 获取当前帧
const frame = skeletonEditor.animationPlayer.getCurrentFrame();

// 设置当前帧
skeletonEditor.animationPlayer.setFrame(frameIndex);

// 设置当前时间（秒）
skeletonEditor.animationPlayer.setTime(seconds);

// 设置播放速度
skeletonEditor.animationPlayer.setPlaySpeed(1.5);  // 1.5x 速度

// 设置循环播放
skeletonEditor.animationPlayer.setLoop(true);
```

### 数据持久化

```javascript
// 序列化
const data = skeletonEditor.serialize();
localStorage.setItem('animation', JSON.stringify(data));

// 反序列化
const data = JSON.parse(localStorage.getItem('animation'));
const newEditor = SkeletonAnimationEditor.deserialize(data);
```

---

## 文件结构说明

### 核心模块（core/）

| 文件 | 用途 |
|------|------|
| `Matrix2D.js` | 2D 矩阵变换（FK 计算基础） |
| `Bone.js` | 单个骨骼类 |
| `Skeleton.js` | 骨骼系统管理器 |
| `Keyframe.js` | 关键帧数据 |
| `Track.js` | 骨骼的关键帧轨道 |
| `Animation.js` | 动画主类 |
| `AnimationPlayer.js` | 动画播放控制 |
| `SkeletonCommands.js` | 撤销重做命令 |

### UI 模块（ui/）

| 文件 | 用途 |
|------|------|
| `BoneHierarchyPanel.js` | 骨骼层级树状面板 |
| `Timeline.js` | 时间轴编辑器 |
| `BonePropertyPanel.js` | 骨骼属性编辑面板 |
| `SkeletonAnimationEditor.js` | 主编辑器集成类 |

### 工具模块（tools/）

| 文件 | 用途 |
|------|------|
| `BoneEditTool.js` | 画布上的骨骼编辑工具 |

---

## 常见问题

### Q: 如何调整骨骼长度？
A: 在右侧属性面板中找到"长度"输入框，修改值即可。或者通过 API：
```javascript
bone.length = 80;
```

### Q: 如何制作来回往复的动画？
A:
1. 创建关键帧：第 0 帧（起始位置）、第 12 帧（结束位置）
2. 勾选"循环播放"（播放器会自动反向）

### Q: 骨骼旋转不生效？
A: 确保旋转值是**弧度制**（不是度数）：
```javascript
Math.PI / 4       // 45 度
Math.PI / 2       // 90 度
Math.PI           // 180 度
Math.PI * 2       // 360 度
```

### Q: 如何导出动画？
A: 使用序列化功能：
```javascript
const data = skeletonEditor.serialize();
const json = JSON.stringify(data, null, 2);
// 保存 json 到文件或服务器
```

### Q: 性能太差怎么办？
A: 减少骨骼数量或关键帧数量。第五阶段会进行性能优化。

---

## 下一步

1. **美化 UI**：修改 `skeleton-animation.css` 中的颜色和布局
2. **添加快捷键**：在主编辑器中集成快捷键处理
3. **集成菜单**：在菜单栏中添加"骨骼动画"选项
4. **导入动画**：实现从 JSON 或其他格式导入
5. **IK 系统**：下一阶段实现反向动力学

---

**需要帮助？** 参考 `design.md` 了解技术细节或 `IMPLEMENTATION_SUMMARY.md` 了解系统架构。

