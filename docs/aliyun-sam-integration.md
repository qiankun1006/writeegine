# 阿里云通义千问视觉模型集成文档

## 概述

本项目已集成阿里云通义千问视觉模型（Qwen-VL-Max、Qwen-VL-Plus等）用于图像分割任务，替代原有的SAM服务。该集成提供了更强大的图像理解和分割能力。

## 支持的模型

- **Qwen-VL-Max**: 阿里云通义千问系列最强的视觉理解模型
- **Qwen-VL-Plus**: 高性能视觉理解模型
- **Qwen-VL**: 基础视觉理解模型

## 配置说明

### 环境变量配置

在 `application.properties` 中配置以下参数：

```properties
# 阿里云百炼平台API配置
aliyun.bailian.api.url=https://dashscope.aliyuncs.com/api/v1/services/vision/segmentation/segment
aliyun.bailian.api.key=your-api-key-here
aliyun.bailian.model=qwen-vl-max
```

### 环境变量方式（推荐）

```bash
export ALIYUN_BAILIAN_API_KEY="your-api-key"
export ALIYUN_BAILIAN_MODEL="qwen-vl-max"
```

## 功能特性

### 1. 人体分割
- 自动识别头部、躯干、四肢等部位
- 支持基于关键点的精确分割
- 返回分割掩码和边界框信息

### 2. 透明背景处理
- 自动移除白色背景
- 添加Alpha通道支持
- 边缘抗锯齿处理

### 3. 部件裁剪
- 基于边界框的精确裁剪
- 掩码应用和优化
- 保持图像质量

## API调用流程

1. **初始化请求**: 构建包含图像和提示词的消息
2. **模型调用**: 发送请求到阿里云通义千问服务
3. **结果解析**: 解析JSON或文本格式的分割结果
4. **后处理**: 应用掩码、裁剪和透明背景处理

## 错误处理

### 常见错误码
- `401`: API密钥无效或过期
- `429`: 请求频率超限
- `500`: 服务器内部错误

### 降级策略
当阿里云服务不可用时，系统会自动降级到基础分割模式：
- 使用预设的人体比例进行分割
- 返回完整的图像作为占位符
- 记录错误日志供后续分析

## 性能优化

### 缓存策略
- 分割结果缓存避免重复计算
- 图像预处理优化减少传输数据量

### 并发处理
- 支持异步分割任务
- 批量处理多个部件分割

## 使用示例

### Java代码示例

```java
@Autowired
private SAMService samService;

// 调用分割服务
SAMSegmentationResult result = samService.segmentImage(imageBase64, points);

if (result.isSuccess()) {
    // 处理分割结果
    List<Mask> masks = result.getMasks();
    // ...
}
```

### 配置示例

```yaml
aliyun:
  bailian:
    api:
      url: https://dashscope.aliyuncs.com/api/v1/services/vision/segmentation/segment
      key: ${ALIYUN_API_KEY}
    model: qwen-vl-max
```

## 注意事项

1. **API密钥安全**: 请妥善保管API密钥，不要提交到代码仓库
2. **成本控制**: 视觉模型调用会产生费用，请注意使用量
3. **网络要求**: 需要稳定的网络连接访问阿里云服务
4. **图像格式**: 支持JPEG、PNG等常见图像格式
5. **图像大小**: 建议图像分辨率不超过2048x2048

## 故障排除

### 问题1: 认证失败
**症状**: 返回401错误
**解决方案**:
- 检查API密钥是否正确
- 确认账户余额充足
- 验证网络连接

### 问题2: 分割质量不佳
**症状**: 分割结果不准确
**解决方案**:
- 调整提示词描述
- 提供关键点坐标
- 尝试不同的模型版本

### 问题3: 响应超时
**症状**: 请求处理时间过长
**解决方案**:
- 优化图像分辨率
- 增加超时时间配置
- 检查网络延迟

## 参考文档

- [阿里云百炼平台文档](https://help.aliyun.com/document_detail/2459962.html)
- [通义千问视觉模型API文档](https://help.aliyun.com/document_detail/2459963.html)
- [DashScope API参考](https://help.aliyun.com/document_detail/2459964.html)

