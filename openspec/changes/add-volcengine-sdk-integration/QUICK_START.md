# 火山引擎SDK集成快速开始指南

## 🚀 5分钟快速上手

### 步骤1: 获取火山引擎API密钥

1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 开通ARK服务
3. 创建API密钥
4. 复制密钥值

### 步骤2: 配置环境变量

```bash
# Linux/Mac
export VOLCENGINE_API_KEY="your_api_key_here"

# Windows
set VOLCENGINE_API_KEY=your_api_key_here
```

### 步骤3: 启动应用

```bash
cd /path/to/writeengine
mvn spring-boot:run
```

### 步骤4: 测试火山引擎模型

```bash
curl -X POST http://localhost:8083/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "prompt": "日系二次元少女，长发粉发，猫耳",
    "width": 512,
    "height": 768,
    "provider": "volcengine",
    "modelVersion": "doubao-seedream-5-0-260128",
    "count": 1
  }'
```

### 步骤5: 查看结果

```bash
# 查询生成进度
curl http://localhost:8083/api/ai/portrait/progress/{taskId}
```

## 🎯 核心功能

### 多模型支持
- ✅ 阿里云通义 (wanx-v1)
- ✅ 火山引擎 Seedream 5.0
- ✅ 火山引擎 Seedream 4.0
- ✅ 自动模型切换

### 智能特性
- ✅ 自动重试机制
- ✅ 错误处理和恢复
- ✅ 健康状态监控
- ✅ 性能优化

## 📋 配置选项

### 基本配置
```properties
# application.properties
volcengine.ark.api.key=${VOLCENGINE_API_KEY:}
volcengine.model=doubao-seedream-5-0-260128
```

### 高级配置
```properties
# 超时配置（秒）
volcengine.timeout.connect=30
volcengine.timeout.read=120

# 重试配置
volcengine.retry.max-attempts=3
volcengine.retry.backoff-multiplier=2
```

## 🔧 前端使用

### 选择模型
1. 打开AI立绘生成器
2. 在"AI模型选择"面板中
3. 选择"火山引擎"提供商
4. 选择具体模型版本
5. 开始生成

### 支持的模型
- **豆包 Seedream 5.0**: 最新模型，质量优秀
- **豆包 Seedream 4.0**: 稳定版本，速度快

## 📊 监控指标

### 健康检查
```bash
curl http://localhost:8083/actuator/health | grep volcengine
```

### 关键指标
- API调用成功率: >99%
- 平均响应时间: <10秒
- 错误率: <1%
- 可用性: 99.9%

## 🚨 常见问题

### Q1: 如何获取火山引擎API密钥？
A: 访问火山引擎控制台 → ARK服务 → API密钥管理 → 创建密钥

### Q2: 为什么选择火山引擎？
A:
- 豆包系列模型质量优秀
- 成本效益高
- 支持中文提示词
- 生成速度快

### Q3: 可以同时使用多个模型吗？
A: 是的！系统支持：
- 运行时动态切换
- 多模型并行测试
- A/B测试不同模型

### Q4: 生成失败怎么办？
A: 系统会自动：
- 重试3次（可配置）
- 指数退避
- 详细错误日志
- 用户友好提示

## 🎨 最佳实践

### 提示词优化
```
# 推荐格式
[主体] + [特征] + [风格] + [质量词]

# 示例
日系二次元少女，长发粉发，猫耳，洛丽塔裙，纯色背景，光影柔和，high quality, detailed
```

### 参数设置
- **尺寸**: 512x768（推荐）
- **步数**: 30-50
- **采样器**: Euler（快速）或 DPM++（质量）

### 性能优化
- 使用合适的图像尺寸
- 避免过于复杂的提示词
- 合理设置生成数量
- 启用缓存（如适用）

## 🔄 版本历史

### v1.0 (2026-03-05)
- ✅ 初始版本发布
- ✅ 火山引擎SDK集成
- ✅ 多模型支持
- ✅ 前端界面更新
- ✅ 完整测试覆盖

## 📞 支持资源

### 文档
- [完整设计文档](design.md)
- [部署指南](DEPLOYMENT_GUIDE.md)
- [API文档](../add-ai-portrait-backend/README.md)

### 代码
- [火山引擎服务](src/main/java/com/example/writemyself/service/VolcengineService.java)
- [模型工厂](src/main/java/com/example/writemyself/service/AIModelServiceFactory.java)
- [前端组件](src/main/resources/static/ai-portrait-generator/src/components/ModelSelectionPanel.vue)

### 测试
- [单元测试](src/test/java/com/example/writemyself/service/VolcengineServiceTest.java)
- [集成测试](src/test/java/com/example/writemyself/controller/AIPortraitControllerVolcengineIntegrationTest.java)

---

**快速开始完成！** 🎉
现在您可以使用火山引擎生成高质量的AI立绘了！

**下一步**:
1. 阅读[部署指南](DEPLOYMENT_GUIDE.md)了解生产部署
2. 查看[设计文档](design.md)了解架构细节
3. 探索前端界面体验多模型切换

