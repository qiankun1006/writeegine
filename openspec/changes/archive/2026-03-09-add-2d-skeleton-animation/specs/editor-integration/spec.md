# editor-integration Specification

## ADDED Requirements

### Requirement: 图层系统扩展
系统 SHALL 扩展 Layer 类以支持骨骼动画数据。

#### Scenario: 用户保存和加载包含骨骼的图层
- **WHEN** 用户处理骨骼图层
- **THEN** Layer 必须新增 `skeletonData` 属性存储 Skeleton 对象
- **AND** Layer 必须新增 `animationData` 属性存储 Animation 对象
- **AND** Layer 必须新增 `isSkeletonLayer` 布尔标志
- **AND** Layer.serialize() 必须包含骨骼和动画数据
- **AND** Layer.deserialize() 必须恢复骨骼和动画数据

#### Scenario: 用户保存和加载包含骨骼的图层
```javascript
// 保存
const layer = editor.getSelectedLayer();
layer.skeletonData = skeleton;
layer.animationData = animation;
layer.isSkeletonLayer = true;
editor.document.save();

// 加载
const loaded = editor.loadProject();
const restoredLayer = loaded.layers[0];
assert(restoredLayer.isSkeletonLayer === true);
assert(restoredLayer.skeletonData !== null);
```

### Requirement: 工具系统集成
系统 SHALL 集成骨骼编辑工具到工具管理器。

#### Scenario: 用户通过快捷键激活骨骼编辑工具
- **WHEN** 用户使用骨骼编辑工具
- **THEN** BoneEditTool 必须注册到 ToolManager
- **AND** BoneEditTool 必须响应鼠标事件（click, drag）
- **AND** BoneEditTool 激活时工具栏按钮必须高亮
- **AND** BoneEditTool 必须支持快捷键激活（如 'B' 键）

#### Scenario: 用户通过快捷键激活骨骼编辑工具
```javascript
// 在 app.js 中注册
editor.toolManager.register(new BoneEditTool());

// 用户按 'B' 键
document.addEventListener('keydown', (e) => {
  if (e.key === 'b' || e.key === 'B') {
    editor.toolManager.setActiveTool('bone-edit');
  }
});
```

### Requirement: 撤销重做系统集成
系统 SHALL 支持骨骼和关键帧操作的撤销重做。

#### Scenario: 用户撤销创建骨骼操作
- **WHEN** 用户执行骨骼操作
- **THEN** 创建/删除骨骼必须生成 UndoableCommand
- **AND** 修改骨骼变换必须生成 UndoableCommand
- **AND** 创建/删除关键帧必须生成 UndoableCommand
- **AND** 所有命令必须注册到 editor.history

#### Scenario: 用户撤销创建骨骼操作
```javascript
// 创建骨骼时
const command = new AddBoneCommand(skeleton, newBone, parentId);
editor.history.execute(command);

// 用户撤销
editor.undo();  // 骨骼被删除

// 用户重做
editor.redo();  // 骨骼恢复
```

### Requirement: 菜单系统集成
系统 SHALL 集成骨骼编辑相关菜单项。

#### Scenario: 用户点击菜单创建骨骼
- **WHEN** 用户使用菜单系统
- **THEN** 菜单必须有"骨骼"菜单分类
- **AND** 必须有"新建骨骼"菜单项
- **AND** 必须有"删除骨骼"菜单项
- **AND** 必须有"骨骼属性"菜单项
- **AND** 必须有"导出骨骼动画"菜单项

#### Scenario: 用户点击菜单创建骨骼
```
菜单: 编辑 > 骨骼 > 新建骨骼
           └> 删除骨骼
           └> 属性编辑
导出 > 骨骼动画...
```

### Requirement: 快捷键支持
系统 SHALL 提供骨骼编辑的快捷键。

#### Scenario: 用户使用快捷键工作流
- **WHEN** 用户使用快捷键
- **THEN** 'B' - 激活骨骼编辑工具
- **AND** 'Shift+B' - 打开快速关键帧设置
- **AND** 'Delete' - 删除选中的骨骼或关键帧
- **AND** 'Ctrl+D' - 复制骨骼（含子骨骼）
- **AND** 'Space' - 在时间轴上播放/暂停动画

#### Scenario: 用户使用快捷键工作流
```
1. 按 'B' 激活骨骼编辑
2. 在画布点击选择骨骼
3. 拖拽调整骨骼
4. 按 'Shift+B' 在当前帧设置关键帧
5. 按 'Space' 预览动画
```

### Requirement: 右侧面板扩展
系统 SHALL 扩展右侧属性面板以支持骨骼相关面板。

#### Scenario: 用户在右侧面板中编辑骨骼属性
- **WHEN** 用户使用右侧面板
- **THEN** 必须添加"骨骼层级"标签页显示骨骼树
- **AND** 必须添加"骨骼属性"标签页编辑选中骨骼
- **AND** 必须添加"关键帧属性"标签页编辑选中关键帧
- **AND** 面板必须根据当前编辑模式动态显示

#### Scenario: 用户在右侧面板中编辑骨骼属性
```
┌────────────────────────┐
│ 图层 | 骨骼层级 | 骨骼属性 |
├────────────────────────┤
│ 选中骨骼: Arm          │
│ 位置:                  │
│   X: [100]             │
│   Y: [50]              │
│ 旋转: [45.5]°          │
│ 缩放:                  │
│   X: [1.0]             │
│   Y: [1.0]             │
└────────────────────────┘
```

### Requirement: 渲染管道扩展
系统 SHALL 扩展 Canvas 渲染循环以支持骨骼显示。

#### Scenario: 用户在画布上看到骨骼线框
- **WHEN** 用户查看骨骼渲染
- **THEN** editor.render() 必须调用骨骼渲染函数（如果当前层是骨骼层）
- **AND** 骨骼必须显示在图片上方（UI 层）
- **AND** 选中的骨骼必须高亮显示
- **AND** 骨骼名称必须显示（可选）

#### Scenario: 用户在画布上看到骨骼线框
```
Canvas 显示：
[图片] [骨骼线框] [选中高亮]
                 ↑
          Root (红色高亮)
         /  \
         Arm  Leg (蓝色线框)
```

### Requirement: 导入导出功能
系统 SHALL 支持骨骼动画数据的导入导出。

#### Scenario: 用户导出骨骼动画项目
- **WHEN** 用户导入导出骨骼动画数据
- **THEN** 必须支持导出为 JSON 格式
- **AND** 必须支持从 JSON 导入
- **AND** 导出文件必须包含完整的骨骼和动画数据
- **AND** 导入时必须验证数据格式和版本兼容性

#### Scenario: 用户导出骨骼动画项目
```javascript
// 导出
const data = skeleton.serialize();
const animData = animation.serialize();
const json = JSON.stringify({ skeleton: data, animation: animData });
// 下载为 character-idle.json

// 导入
const loaded = JSON.parse(fileContent);
const skeleton = Skeleton.deserialize(loaded.skeleton);
const animation = Animation.deserialize(loaded.animation);
```

### Requirement: 模式切换
系统 SHALL 支持编辑模式和播放模式的切换。

#### Scenario: 用户在编辑模式和播放模式间切换
- **WHEN** 用户切换编辑模式
- **THEN** 编辑模式下用户可以编辑骨骼和关键帧
- **AND** 播放模式下显示动画播放（不可编辑）
- **AND** 必须有明确的模式切换按钮或快捷键
- **AND** 两种模式的 UI 布局必须清晰区分

#### Scenario: 用户在编辑模式和播放模式间切换
```
编辑模式: [编辑▼] 显示时间轴、骨骼树、属性面板
播放模式: [播放▼] 隐藏编辑 UI，显示简化的控制条

