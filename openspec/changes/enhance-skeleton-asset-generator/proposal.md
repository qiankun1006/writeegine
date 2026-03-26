# Proposal: enhance-skeleton-asset-generator

## Why

当前骨骼素材生成功能已完成基础架构，但缺少关键功能：
1. **SAM 自动分割**：当前返回完整图，无法真正分离肢体部件
2. **透明底导出**：生成的部件需要透明背景才能用于动画
3. **前端结果展示**：用户无法查看和下载生成的部件
4. **进度轮询 UI**：用户无法实时查看生成进度

这些功能是实现骨骼素材生成价值的关键，直接影响用户体验和功能的可用性。

## What Changes

### 核心增强功能
- 集成 SAM (Segment Anything Model) 进行自动肢体分割
- 实现透明底 PNG 导出功能
- 添加前端结果展示面板
- 实现进度轮询和状态展示

### 技术架构升级
- 后端：接入 SAM 模型服务，实现图像分割算法
- 前端：添加结果展示组件和进度轮询机制
- 存储：优化文件存储结构，支持部件分离存储

## Impact

Affected specs: [skeleton-asset-generator, ai-portrait-generator, file-storage]
Affected code: [
  src/main/java/com/example/writemyself/service/SkeletonAssetService.java,
  src/main/resources/static/ai-portrait-generator/src/components/SkeletonAssetPanel.vue,
  src/main/resources/static/ai-portrait-generator/src/stores/portraitStore.ts,
  src/main/java/com/example/writemyself/controller/SkeletonAssetController.java
]

