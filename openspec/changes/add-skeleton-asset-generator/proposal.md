# Proposal: add-skeleton-asset-generator

## Why

当前 AI 人物立绘生成器只能生成普通立绘，无法满足骨骼动画制作的需求。

骨骼动画制作需要分离的肢体部件（头、躯干、左臂、右臂、左腿、右腿），且必须：
- 风格统一
- 肢体比例一致
- 可直接导入 Spine、DragonBones、Cocos 等骨骼动画工具

现有生成方式（分别生成各部位）会导致风格不统一、比例错乱，无法用于实际生产。

## What Changes

在 AI 人物立绘生成器的「素材类型选择」中新增「骨骼素材生成」选项。

### 核心功能

1. **一键生成全身骨骼部件**
   - 一次性生成完整人体图
   - 后台自动分割为独立部件（头、躯干、左臂、右臂、左腿、右腿）
   - 输出透明底 PNG 序列

2. **风格控制**
   - 支持多种风格：日系二次元、写实、Q版、美式卡通、像素风
   - 风格通过 LoRA 切换实现

3. **一致性保证**
   - 支持上传参考图（保持人物一致性）
   - 使用 OpenPose 控制骨骼结构
   - 使用 IP-Adapter 保持角色特征

4. **骨骼模板选择**
   - 人体标准骨骼模板
   - 动画骨骼模板

### 技术方案

- 前端：扩展现有 AssetTypeSelector.vue，新增骨骼素材类型选项
- 后端：新增骨骼素材生成服务
- 模型：Flux.1-dev + LoRA + ControlNet (OpenPose) + SAM 分割

## Impact

- Affected specs: ai-portrait-generator
- Affected code:
  - `src/main/resources/static/ai-portrait-generator/src/components/AssetTypeSelector.vue`
  - `src/main/resources/static/ai-portrait-generator/src/stores/portraitStore.ts`
  - 新增骨骼素材生成前端组件
  - 新增骨骼素材生成后端服务

