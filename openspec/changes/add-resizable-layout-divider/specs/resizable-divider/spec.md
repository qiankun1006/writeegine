# Spec: Resizable Layout Divider

## ADDED Requirements

#### Requirement: 可拖动分隔符元素

在 Tilemap 编辑器的图块选择面板和编辑区域之间应该有一个可视的、可拖动的分隔符，允许用户调整两个面板的宽度。

##### Scenario: 分隔符显示

- 给定：用户打开 Tilemap 编辑器
- 当：页面加载完成
- 那么：分隔符应该显示在左侧图块选择面板和右侧编辑区域之间
- 并且：分隔符宽度为 8px
- 并且：分隔符具有灰色背景（#e0e0e0）
- 并且：鼠标悬停时分隔符高亮为蓝色（#4a90e2）
- 并且：分隔符显示列调整游标（col-resize）

##### Scenario: 拖动分隔符调整宽度

- 给定：用户在分隔符上按下鼠标
- 当：用户拖动鼠标向左或向右
- 那么：左侧图块选择面板应该缩小或扩大
- 并且：右侧编辑区域应该相应扩大或缩小
- 并且：拖动过程中宽度变化应该流畅无卡顿
- 并且：拖动时分隔符保持高亮状态

##### Scenario: 最小宽度限制

- 给定：用户尝试拖动分隔符使得某个面板过小
- 当：左侧面板宽度达到 120px 最小值
- 那么：分隔符不应该继续向右拖动
- 当：右侧面板宽度达到 300px 最小值
- 那么：分隔符不应该继续向左拖动

##### Scenario: 停止拖动

- 给定：用户正在拖动分隔符
- 当：用户释放鼠标
- 那么：拖动应该停止
- 并且：分隔符高亮应该消除（回到悬停或正常状态）
- 并且：新的宽度应该保持

##### Scenario: 鼠标移出窗口继续拖动

- 给定：用户在拖动分隔符时移动鼠标到窗口外
- 当：用户仍然按住鼠标
- 那么：拖动应该继续有效
- 并且：面板宽度应该继续调整

## Styling Requirements

#### 分隔符样式
- `width: 8px`
- `background: #e0e0e0`
- `cursor: col-resize`
- `user-select: none`
- `flex-shrink: 0`

#### 悬停状态
- `background: #4a90e2`
- `box-shadow: 0 0 4px rgba(74, 144, 226, 0.3)`

#### 拖动中状态 (.active)
- `background: #4a90e2`
- `box-shadow: 0 0 8px rgba(74, 144, 226, 0.5)`

## JavaScript Behavior

### ResizableLayoutManager 类

- 监听分隔符上的 mousedown 事件
- 监听 document 上的 mousemove 事件
- 监听 document 上的 mouseup 事件
- 实现宽度限制检查：
  - 左侧最小宽度：120px
  - 右侧最小宽度：300px

## Layout Changes

两个面板现在应该使用以下宽度计算：
- 左侧宽度 + 分隔符宽度 (8px) + 右侧宽度 = 总容器宽度
- 初始状态：左侧 150px + 分隔符 8px + 右侧 flex(1)

## Files Affected

- `src/main/resources/templates/tilemap-editor.html` - 添加分隔符 DOM
- `src/main/resources/static/css/tilemap-editor.css` - 分隔符样式
- `src/main/resources/static/js/tilemap-editor.js` - 交互逻辑

