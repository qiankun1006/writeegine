# Change: 增强骨骼动画功能 - 动画帧序列编辑器

## Why
当前正在开发的2D骨骼动画系统提供了基础的骨骼编辑和动画功能，但用户需要在游戏素材创作页面的【一、角色相关】下直接访问一个完整的动画帧序列编辑器。这个功能将允许用户：
1. 在游戏素材创作流程中直接创建和编辑骨骼动画
2. 使用更丰富的动画编辑功能，包括多段插值、骨骼镜像、动画片段管理
3. 导入PNG作为骨骼纹理，导出多种格式（JSON、PNG序列、GIF）
4. 支持本地存储和项目管理
5. 提供更精准的编辑工具（数值微调、吸附功能、撤销重做）

这个增强功能将骨骼动画系统与游戏素材创作页面深度集成，为用户提供一站式动画制作体验。

## What Changes
- 在 `http://localhost:8083/create-game/asset` 页面的【一、角色相关】下添加【动画帧序列】菜单项
- 创建完整的动画帧序列编辑器界面，包含：
  - 骨骼层级创建/编辑/删除
  - 骨骼拖拽调整位置/角度
  - 帧管理+关键帧插值
  - 动画预览（FPS/播放/暂停）
  - 画布缩放/辅助线
- 实现进阶功能：
  - 骨骼动画增强：多段插值、骨骼镜像、动画片段管理
  - 资源管理：PNG导入、JSON/PNG序列/GIF导出
  - 本地存储：自动保存、项目管理
  - 精准编辑：数值微调、吸附功能、撤销重做
- 遵循代码规范：
  - 模块化设计，低耦合高内聚
  - 完善的错误处理
  - 性能优化（离屏Canvas、插值预计算）
  - 详细的代码注释和扩展说明

## Impact
- Affected specs: [skeleton-animation-core, skeleton-animation-ui, animation-timeline, editor-integration, game-asset-creator]
- Affected code: [src/main/resources/templates/create-game-asset.html, src/main/resources/static/js/game-asset-creator/, src/main/resources/static/js/image-editor/skeleton/, src/main/resources/static/css/game-asset-creator.css]

