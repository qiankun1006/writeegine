## Why

当前 `/create-game/asset/map-grid` 页面（战棋网格地图）提供了基础的tilemap编辑功能，但缺乏AI驱动的游戏地图生成能力。用户需要手动放置每个图块，这对于创建专业的游戏地图来说非常耗时。通过集成类似于角色立绘页面的AI生成功能，用户可以先用图块绘制像素轮廓，然后基于像素艺术轮廓和指定的参数，使用AI生成高质量、工业级的游戏地图。

## What Changes

- **页面标题**: 从"战棋网格地图"改为"游戏地图"
- **增强的UI**: 在现有tilemap编辑器旁边添加AI生成参数输入
- **AI参数**: 包括风格、尺寸、游戏类型、微调模型、参考图片等
- **生成按钮**: 添加"生成"按钮来触发AI地图生成
- **工作流程**: 用户用图块绘制轮廓 → 设置AI参数 → 生成专业级地图
- **保留现有功能**: 保持所有当前的tilemap功能不变

## Impact

Affected specs: [game-map-editor, ai-integration, tilemap-editor, ui-feedback]
Affected code: [HomeController.java, map-grid.html, tilemap-editor.js, 新的AI地图生成组件]

**关键决策:**
1. **混合方法**: 保持现有tilemap编辑器作为基础层，添加AI生成作为增强功能
2. **参数集**: 使用与角色立绘类似的AI参数（风格、尺寸、游戏类型等）
3. **UI布局**: 左右并排布局，左侧tilemap编辑器，右侧AI参数
4. **生成流程**: 图块草图 → AI增强 → 专业输出
5. **向后兼容**: 所有现有tilemap功能保持不变

