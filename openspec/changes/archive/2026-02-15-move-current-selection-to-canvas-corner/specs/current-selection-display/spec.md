# Spec: Current Selection Display Positioning

## MODIFIED Requirements

#### Requirement: 当前选中模块布局位置

当前选中模块（包含图块预览和名称显示）应该以浮动面板的形式显示在画布的右上角，而不是作为编辑器布局的一列。

##### Scenario: 浮动面板显示

- 给定：用户打开 Tilemap 编辑器
- 当：页面加载完成
- 那么：当前选中面板应该显示在 canvas 的右上角
- 并且：面板距顶部 10px，距右侧 10px
- 并且：面板宽度为 150px
- 并且：面板具有白色背景和阴影效果
- 并且：面板在 canvas 上方（z-index: 10）

##### Scenario: 功能保持不变

- 给定：用户选中一个图块
- 当：点击左侧图块面板中的某个图块
- 那么：当前选中面板应该立即更新显示选中的图块预览
- 并且：显示图块的名称

##### Scenario: 画布交互不受影响

- 给定：当前选中面板显示在 canvas 右上角
- 当：用户在 canvas 上绘制或交互
- 那么：画布的交互不应该被浮动面板遮挡或干扰
- 并且：用户能够正常在画布上点击和拖动

## REMOVED Requirements

#### Requirement: 当前选中作为布局列

当前选中模块不再作为编辑器布局的一个独立列。布局从三列改为二列（图块选择 + 编辑区域）。

## Layout Changes

**Before:**
```
┌─────────────────────────────────────┐
│ 图块选择 │ 当前选中 │  编辑区域     │
│  150px  │  150px  │  flex(1)      │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│ 图块选择 │      编辑区域           │
│  150px  │  flex(1)                 │
│         │  ┌─当前选中─(浮动)─┐   │
│         │  │ Canvas           │   │
│         │  │                  │   │
│         │  └──────────────────┘   │
└─────────────────────────────────────┘
```

## CSS Properties

### .canvas-container
- `position: relative` - 为绝对定位的子元素提供定位上下文

### .current-tile-display (浮动面板样式)
- `position: absolute`
- `top: 10px`
- `right: 10px`
- `width: 150px`
- `background: white`
- `border-radius: 8px`
- `padding: 12px`
- `box-shadow: 0 2px 8px rgba(0,0,0,0.15)`
- `z-index: 10`
- `border: 2px solid #e0e0e0`

### .tilemap-editor-wrapper
- 从三列 flex 布局改为二列 flex 布局
- 移除 `current-tile-display` 的独立列

## Files Affected

- `src/main/resources/templates/tilemap-editor.html`
- `src/main/resources/static/css/tilemap-editor.css`

