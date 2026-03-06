# Web编辑器规范

## ADDED Requirements

### Requirement: 编辑器基础框架
系统SHALL提供Web编辑器的基础架构和组件系统。

#### Scenario: 编辑器初始化
- **WHEN** 开发者初始化编辑器
- **THEN** 系统应提供 SkeletonEditor 类
- **AND** 支持容器、尺寸和主题配置

```typescript
const editor = new SkeletonEditor({
    container: document.getElementById('editor-container'),
    width: 1200,
    height: 800,
    theme: 'dark'
});

editor.initialize();
editor.show();
```

#### Scenario: 编辑器布局
- **WHEN** 配置编辑器界面
- **THEN** 系统应支持灵活的面板布局
- **AND** 提供工具栏、画布、属性面板等组件

```typescript
const layout = editor.createLayout();
layout.addPanel('toolbar', { position: 'top', height: 60 });
layout.addPanel('canvas', { position: 'center', flex: 1 });
layout.addPanel('hierarchy', { position: 'left', width: 250 });
layout.addPanel('properties', { position: 'right', width: 300 });
layout.addPanel('timeline', { position: 'bottom', height: 200 });
```

### Requirement: 画布系统
系统SHALL提供2D画布渲染和交互功能。

#### Scenario: 画布创建
- **WHEN** 创建编辑画布
- **THEN** 系统应提供 EditorCanvas 类
- **AND** 支持缩放、平移和网格显示

```typescript
const canvas = new EditorCanvas({
    width: 800,
    height: 600,
    backgroundColor: '#2a2a2a',
    gridSize: 20,
    showGrid: true
});

canvas.setZoom(1.0);
canvas.setPan(0, 0);
```

#### Scenario: 画布交互
- **WHEN** 用户与画布交互
- **THEN** 系统应处理鼠标和键盘事件
- **AND** 支持对象选择和变换操作

```typescript
// 鼠标交互
canvas.on('click', (event) => {
    const worldPos = canvas.screenToWorld(event.position);
    console.log(`Clicked at: ${worldPos.x}, ${worldPos.y}`);
});

canvas.on('drag', (event) => {
    if (event.target instanceof Bone) {
        event.target.x = event.worldPosition.x;
        event.target.y = event.worldPosition.y;
    }
});

// 键盘快捷键
canvas.on('keydown', (event) => {
    if (event.key === 'Delete') {
        editor.deleteSelected();
    } else if (event.ctrlKey && event.key === 'z') {
        editor.undo();
    }
});
```

### Requirement: 工具栏系统
系统SHALL提供功能完整的工具栏和工具系统。

#### Scenario: 工具栏创建
- **WHEN** 创建工具栏
- **THEN** 系统应提供 Toolbar 类
- **AND** 支持按钮添加和事件处理

```typescript
const toolbar = new Toolbar('main-toolbar');

// 添加工具按钮
toolbar.addButton('select', {
    icon: 'cursor-icon',
    tooltip: '选择工具',
    onClick: () => editor.setTool('select')
});

toolbar.addButton('bone', {
    icon: 'bone-icon',
    tooltip: '骨骼工具',
    onClick: () => editor.setTool('bone')
});

toolbar.addButton('move', {
    icon: 'move-icon',
    tooltip: '移动工具',
    onClick: () => editor.setTool('move')
});
```

#### Scenario: 工具状态管理
- **WHEN** 切换编辑工具
- **THEN** 系统应管理当前工具状态
- **AND** 支持工具的激活和停用

```typescript
class ToolManager {
    private currentTool: EditorTool | null = null;
    private tools: Map<string, EditorTool> = new Map();

    public registerTool(name: string, tool: EditorTool): void {
        this.tools.set(name, tool);
    }

    public setTool(name: string): void {
        if (this.currentTool) {
            this.currentTool.deactivate();
        }

        this.currentTool = this.tools.get(name) || null;
        if (this.currentTool) {
            this.currentTool.activate();
        }
    }
}
```

### Requirement: 骨骼编辑器
系统SHALL提供骨骼创建、编辑和管理功能。

#### Scenario: 骨骼创建工具
- **WHEN** 用户使用骨骼工具
- **THEN** 系统应支持交互式骨骼创建
- **AND** 提供骨骼层级关系编辑

```typescript
class BoneTool extends EditorTool {
    private startBone: Bone | null = null;

    public onMouseDown(event: MouseEvent): void {
        const position = this.canvas.screenToWorld(event.position);

        if (!this.startBone) {
            // 创建新骨骼
            this.startBone = new Bone();
            this.startBone.x = position.x;
            this.startBone.y = position.y;
            this.startBone.length = 50;
        } else {
            // 完成骨骼创建
            this.startBone.endX = position.x;
            this.startBone.endY = position.y;
            this.armature.addBone(this.startBone);
            this.startBone = null;
        }
    }
}
```

#### Scenario: 骨骼层级编辑
- **WHEN** 编辑骨骼层级
- **THEN** 系统应提供层级面板
- **AND** 支持拖拽建立父子关系

```typescript
const hierarchyPanel = new HierarchyPanel();

// 显示骨骼树
hierarchyPanel.setRootItem(armature);
hierarchyPanel.on('select', (bone) => {
    editor.selectBone(bone);
});

hierarchyPanel.on('parent', (child, parent) => {
    parent.addChild(child);
    editor.updateBoneHierarchy();
});
```

### Requirement: 动画编辑器
系统SHALL提供时间轴和关键帧编辑功能。

#### Scenario: 时间轴创建
- **WHEN** 创建动画时间轴
- **THEN** 系统应提供 TimelineEditor 类
- **AND** 支持多轨道和关键帧管理

```typescript
const timeline = new TimelineEditor({
    frameRate: 24,
    duration: 120, // 5秒动画
    snapToFrames: true
});

// 添加轨道
timeline.addTrack('bone1_translate', 'Bone1 Position');
timeline.addTrack('bone1_rotate', 'Bone1 Rotation');
timeline.addTrack('bone1_scale', 'Bone1 Scale');
```

#### Scenario: 关键帧编辑
- **WHEN** 编辑关键帧
- **THEN** 系统应支持关键帧的增删改
- **AND** 提供实时预览功能

```typescript
// 添加关键帧
timeline.addKeyFrame('bone1_translate', 0, { x: 0, y: 0 });
timeline.addKeyFrame('bone1_translate', 30, { x: 100, y: 50 });
timeline.addKeyFrame('bone1_translate', 60, { x: 200, y: 0 });

// 编辑关键帧
timeline.on('keyFrameMove', (track, frame, newFrame) => {
    console.log(`Moved keyframe from ${frame} to ${newFrame}`);
});

timeline.on('keyFrameValueChange', (track, frame, value) => {
    console.log(`Changed keyframe value at ${frame}:`, value);
});
```

### Requirement: 属性面板
系统SHALL提供对象属性编辑功能。

#### Scenario: 属性面板创建
- **WHEN** 创建属性编辑器
- **THEN** 系统应提供 PropertyPanel 类
- **AND** 支持多种属性类型

```typescript
const propertyPanel = new PropertyPanel();

// 为骨骼创建属性编辑器
propertyPanel.addSection('Transform', [
    new Vector2Property('position', bone.global),
    new NumberProperty('rotation', bone.global, 'skewX'),
    new Vector2Property('scale', bone.global)
]);

propertyPanel.addSection('Bone', [
    new StringProperty('name', bone),
    new NumberProperty('length', bone),
    new ColorProperty('color', bone)
]);
```

#### Scenario: 实时属性更新
- **WHEN** 修改属性值
- **THEN** 系统应实时更新对象
- **AND** 刷新画布显示

```typescript
// 属性变化时实时更新
propertyPanel.on('change', (property, value) => {
    if (property.name === 'position') {
        bone.global.x = value.x;
        bone.global.y = value.y;
        bone._transformDirty = true;
    }

    // 更新画布
    canvas.redraw();
});
```

### Requirement: 撤销重做系统
系统SHALL提供完整的撤销重做功能。

#### Scenario: 命令模式实现
- **WHEN** 执行编辑操作
- **THEN** 系统应使用命令模式
- **AND** 支持操作的历史管理

```typescript
class CommandManager {
    private undoStack: Array<Command> = [];
    private redoStack: Array<Command> = [];
    private maxStackSize: number = 100;

    public executeCommand(command: Command): void {
        command.execute();
        this.undoStack.push(command);

        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }

        // 清空重做栈
        this.redoStack.length = 0;
    }

    public undo(): void {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop()!;
            command.undo();
            this.redoStack.push(command);
        }
    }

    public redo(): void {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop()!;
            command.execute();
            this.undoStack.push(command);
        }
    }
}
```

#### Scenario: 具体命令实现
- **WHEN** 实现具体编辑命令
- **THEN** 系统应提供命令基类
- **AND** 支持命令的执行和撤销

```typescript
class MoveBoneCommand extends Command {
    private bone: Bone;
    private oldPosition: Point;
    private newPosition: Point;

    constructor(bone: Bone, newPosition: Point) {
        super();
        this.bone = bone;
        this.oldPosition = new Point(bone.global.x, bone.global.y);
        this.newPosition = newPosition;
    }

    public execute(): void {
        this.bone.global.x = this.newPosition.x;
        this.bone.global.y = this.newPosition.y;
        this.bone._transformDirty = true;
    }

    public undo(): void {
        this.bone.global.x = this.oldPosition.x;
        this.bone.global.y = this.oldPosition.y;
        this.bone._transformDirty = true;
    }
}
```

### Requirement: 文件操作
系统SHALL提供项目保存和加载功能。

#### Scenario: 项目保存
- **WHEN** 保存编辑项目
- **THEN** 系统应提供 ProjectManager 类
- **AND** 支持自动保存功能

```typescript
const projectManager = new ProjectManager();

// 保存项目
projectManager.saveProject({
    armature: armature,
    animations: animations,
    settings: editorSettings
}).then((filePath) => {
    console.log(`Project saved to: ${filePath}`);
});

// 自动保存
setInterval(() => {
    projectManager.autoSave();
}, 30000); // 每30秒自动保存
```

#### Scenario: 文件导入导出
- **WHEN** 导入导出文件
- **THEN** 系统应支持多种格式
- **AND** 提供格式转换功能

```typescript
// 导入DragonBones数据
const importer = new DragonBonesImporter();
importer.importFromFile('character.json').then((data) => {
    const armature = factory.buildArmatureFromData(data);
    editor.loadArmature(armature);
});

// 导出为多种格式
const exporter = new SkeletonExporter();
exporter.exportToFormat(armature, 'dragonbones', 'character.json');
exporter.exportToFormat(armature, 'spine', 'character.spine');
exporter.exportToFormat(armature, 'json', 'character.json');
```

### Requirement: 预览和播放
系统SHALL提供动画预览和播放控制功能。

#### Scenario: 播放控制
- **WHEN** 控制动画播放
- **THEN** 系统应提供 PlaybackController 类
- **AND** 支持播放、暂停、跳转等操作

```typescript
const playbackController = new PlaybackController();

// 播放控制
playbackController.play();
playbackController.pause();
playbackController.stop();
playbackController.setSpeed(1.5); // 1.5倍速

// 时间控制
playbackController.setCurrentTime(2.5); // 跳转到2.5秒
playbackController.setLoop(true);
```

#### Scenario: 实时预览
- **WHEN** 预览动画效果
- **THEN** 系统应在编辑器中实时渲染
- **AND** 支持多动画混合预览

```typescript
// 在编辑器中实时预览动画
const previewRenderer = new PreviewRenderer(canvas);

playbackController.on('timeUpdate', (currentTime) => {
    // 更新骨架姿势
    armature.animation.advanceTime(0);

    // 重新渲染
    previewRenderer.render(armature);
});

// 支持多动画同时预览
previewRenderer.addAnimation('walk', walkAnimation, 0.7);
previewRenderer.addAnimation('shoot', shootAnimation, 0.3);

