## Why

现有的骨骼素材生成功能已经有了基础的前后端框架，但实现不够完整。根据AI骨骼.md文档，需要实现从参考图到可绑定骨骼游戏角色的完整自动化流程，包括：

1. OpenPose骨骼模板自动生成T-pose骨骼线图
2. ControlNet姿势约束 + IP-Adapter特征提取
3. Flux.1-dev高清人体生成
4. 背景去除（RMBG-2.0/BiRefNet）
5. SAM 2自动分割肢体部件
6. 骨骼绑定数据生成

当前实现缺少这些核心AI处理步骤，需要完善整个流水线。

## What Changes

- 实现完整的8步AI骨骼生成流水线
- 增强后端服务支持OpenPose、ControlNet、IP-Adapter等AI模型
- 完善SAM分割算法，支持精确的肢体部件分离
- 添加骨骼绑定数据生成功能
- 优化前端界面，提供更清晰的进度展示
- 支持生成结果的结构化导出（完整图+部件图+骨骼数据）

## Impact

Affected specs: [skeleton-core, ai-portrait-generation, ai-portrait-image-generation]
Affected code: [SkeletonAssetService.java, SkeletonAssetController.java, portraitStore.ts, SkeletonAssetPanel.vue, SkeletonResultPanel.vue]

