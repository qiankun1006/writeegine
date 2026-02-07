# Change: Add Tilemap Editor to web application

## Why
当前项目已有Web界面基础，但缺少交互式的地图编辑功能。用户希望创建一个Tilemap（图块地图）编辑器，用于游戏开发、地图设计等场景。已有的像素块图片资源需要被有效利用，用户需要在前端页面上实现在线编辑，并能将编辑结果保存为本地图片。

## What Changes
- 添加Tilemap编辑器前端页面，包含编辑网格和图块选择器
- 创建TilemapEditor控制器，提供编辑器页面和图片资源访问
- 将现有的像素块图片资源移动到静态资源目录或通过API提供访问
- 实现前端JavaScript逻辑：网格绘制、图块放置、编辑操作、图片导出
- 添加Canvas绘图功能，支持将Tilemap导出为PNG图片
- 创建编辑器UI界面，包含工具栏、图块调色板、编辑区域

## Impact
- Affected specs: tilemap-editor
- Affected code: src/main/java/com/example/writemyself/controller/, src/main/resources/templates/, src/main/resources/static/, src/main/java/com/example/writemyself/pic/

