# Change: 添加 2D 骨骼动画功能

## Why
当前图片编辑器可以创建和编辑静态的 2D 角色立绘，但缺少动画能力。为了让用户能够制作动态的 2D 角色动画，需要集成 2D 骨骼动画系统。这个功能将允许用户为角色骨骼创建关键帧动画，实现角色的各种动作和表情变化，大大丰富游戏内容的表现力。

## What Changes
- 集成现成的 2D 骨骼动画库（如 Pixi.js Spine 或 DragonBones）
- 在图片编辑器页面添加骨骼动画编辑模块
- 实现骨骼系统基础功能：骨骼创建、编辑、层级管理
- 实现正向动力学（FK）系统：骨骼变换和级联运动
- 实现关键帧动画系统：时间轴编辑、关键帧录制、动画播放
- 实现动画预览和实时渲染
- 实现骨骼动画数据导入导出
- 集成到现有的图层和撤销重做系统
- 添加骨骼动画工具栏和参数面板
- 后期支持 IK（反向动力学）作为高级功能

## Impact
- Affected specs: [skeleton-animation-core, skeleton-animation-ui, animation-timeline, skeleton-editor, editor-integration]
- Affected code: [src/main/resources/static/js/image-editor/, src/main/resources/templates/create-game-image.html, src/main/resources/static/css/]

