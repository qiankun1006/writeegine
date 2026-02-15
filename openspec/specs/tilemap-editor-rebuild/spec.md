# tilemap-editor-rebuild Specification

## Purpose
TBD - created by archiving change rebuild-tilemap-editor-from-scratch. Update Purpose after archive.
## Requirements
### Requirement: 完整的Tilemap编辑器功能
系统SHALL提供功能完整、可靠稳定的Tilemap编辑器，支持从头设计地图，使用图块进行绘制。

#### Scenario: 用户打开编辑器看到完整界面
- **WHEN** 用户访问 /tilemap-editor 页面
- **THEN** 页面加载后显示：
  - 左侧图块选择面板（显示所有可用图块）
  - 中间当前选中显示区域（初始显示第一个图块）
  - 右侧编辑面板（包含Canvas、工具栏、网格信息）

### Requirement: 图块选择功能
系统SHALL允许用户从左侧面板选择任意图块作为当前使用的图块.

#### Scenario: 选中不同的图块
- **WHEN** 用户点击左侧图块选择器中的任何图块
- **THEN**
  - 该图块项被高亮显示（蓝色边框和背景）
  - 中间显示区域更新为该图块的大型预览
  - 图块名称更新显示
  - 当前选中状态保持直到选择其他图块

#### Scenario: 初始加载选中第一个图块
- **WHEN** 编辑器初始化完成
- **THEN** 默认选中第一个图块并显示在中间区域

### Requirement: Canvas绘制和图块放置
系统SHALL支持用户通过点击或拖动在Canvas上放置选中的图块.

#### Scenario: 单次点击放置一个图块
- **WHEN** 用户在Canvas上点击任意位置
- **THEN**
  - 该位置放置当前选中的图块
  - Canvas立即更新显示
  - 已放置图块数量增加1
  - 撤销/重做堆栈更新

#### Scenario: 鼠标滑行放置多个连续图块
- **WHEN** 用户在Canvas上按住鼠标按钮并拖动
- **THEN**
  - 从起始点到当前点的路径上放置连续的图块
  - 避免在同一格子重复放置
  - Canvas连续更新显示拖动过程
  - 释放鼠标后保存为一次撤销单位

#### Scenario: Canvas显示网格线和已放置图块
- **WHEN** Canvas被渲染时
- **THEN**
  - 显示灰色网格线区分各个格子
  - 已放置的图块正确显示在对应格子
  - 其他空格子保持空白

### Requirement: 编辑操作
系统SHALL支持用户进行撤销、重做、清空等编辑操作。

#### Scenario: 撤销操作恢复上一步
- **WHEN** 用户点击撤销按钮
- **THEN**
  - 恢复到上一个状态
  - Canvas显示更新
  - 已放置数量更新
  - 按钮状态自动启用/禁用

#### Scenario: 重做操作恢复下一步
- **WHEN** 用户在撤销后点击重做按钮
- **THEN**
  - 恢复到下一个状态
  - Canvas显示更新
  - 按钮状态自动启用/禁用

#### Scenario: 清空操作清除所有内容
- **WHEN** 用户点击清空画布按钮
- **THEN**
  - 系统显示确认对话框
  - 用户确认后，所有已放置的图块被移除
  - Canvas显示完全空白
  - 已放置数量重置为0
  - 撤销/重做堆栈清空

### Requirement: 网格尺寸调整
系统SHALL允许用户改变编辑画布的网格尺寸。

#### Scenario: 在不同的网格尺寸间切换
- **WHEN** 用户在下拉框中选择不同的网格尺寸(8x8, 16x16, 24x24, 32x32)
- **THEN**
  - 新的网格尺寸应用到Canvas
  - Canvas清空（重置为新尺寸的空白网格）
  - 网格信息更新显示新的尺寸
  - 系统可能询问用户是否保存当前内容

### Requirement: PNG导出功能
系统SHALL支持用户将设计的地图导出为PNG图片文件。

#### Scenario: 导出为PNG图片
- **WHEN** 用户点击导出按钮
- **THEN**
  - 系统生成包含所有已放置图块的PNG图片
  - 图片大小适当（如每个格子16像素）
  - 文件自动下载，文件名包含时间戳
  - 图片中只显示图块，不显示网格线

### Requirement: 信息显示
系统SHALL显示当前编辑状态的相关信息。

#### Scenario: 显示网格信息和图块计数
- **WHEN** 用户在编辑过程中操作
- **THEN**
  - 网格尺寸信息实时显示(如"16x16")
  - 已放置图块数量实时更新
  - 信息清晰易读

### Requirement: 用户交互反馈
系统SHALL提供清晰的用户交互反馈和帮助信息。

#### Scenario: 按钮视觉反馈
- **WHEN** 用户与按钮交互
- **THEN**
  - 按钮有hover状态显示
  - 按钮有pressed状态显示
  - 禁用状态的按钮显示为灰色且不可点击

#### Scenario: 提示信息帮助用户
- **WHEN** 用户查看编辑器
- **THEN**
  - 显示清晰的操作提示(如"点击或拖动放置图块")
  - 提示信息易于理解

