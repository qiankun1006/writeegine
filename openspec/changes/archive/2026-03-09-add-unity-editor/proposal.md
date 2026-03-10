# Change: 添加在线 Unity 编辑器功能

## Why
当前系统已经提供了图片编辑器和地图编辑器，但缺少 3D 游戏场景编辑能力。为了提供完整的游戏开发工具链，需要添加与现有编辑器同级的在线 Unity 编辑器功能，使用户能够在浏览器中创建和编辑 3D 游戏场景。

## What Changes
- 添加新的 Unity 编辑器页面，与图片编辑器和地图编辑器同级
- 实现基于 Three.js 的 3D 场景渲染和编辑功能
- 提供基础几何体库和材质系统
- 实现对象选择、移动、旋转、缩放操作
- 添加场景层级管理和属性编辑面板
- 集成 Ammo.js 物理引擎支持基础物理模拟
- 实现场景导出功能，支持 JSON 和 glTF 格式
- 提供与现有编辑器一致的用户体验和界面风格

## Impact
- Affected specs: [unity-editor-core, unity-editor-ui, editor-integration]
- Affected code: [src/main/resources/templates/create-game-unity.html, src/main/resources/static/js/unity-editor/, src/main/java/com/example/writemyself/controller/HomeController.java]

