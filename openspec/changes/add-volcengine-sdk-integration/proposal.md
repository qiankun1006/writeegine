## Why

当前AI立绘生成器仅集成了阿里云通义模型，需要扩展支持字节跳动火山引擎SDK，为用户提供更多AI模型选择。火山引擎提供doubao-seedream系列模型，具有优秀的图像生成能力，能够丰富系统的AI模型生态。

## What Changes

- 集成字节跳动火山引擎SDK (volcengine-java-sdk-ark-runtime)
- 新增VolcengineService服务类，实现火山引擎API调用
- 扩展AI模型配置，支持火山引擎模型选择
- 更新数据库模型配置，添加火山引擎相关模型
- 保持与现有架构兼容，支持多模型切换

## Impact

Affected specs: [ai-portrait-image-generation], Affected code: [AIPortraitService, AIPortraitModelConfig, AliyunTongYiService, model configuration]

