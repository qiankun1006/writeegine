# 字节跳动火山引擎SDK集成任务清单

## 1. 环境准备和依赖配置 [x]

### 1.1 Maven依赖添加
- [x] 在pom.xml中添加volcengine-java-sdk-ark-runtime依赖
- [x] 添加okhttp依赖（如果尚未存在）
- [x] 验证依赖版本兼容性
- [x] 执行mvn clean install验证构建

### 1.2 配置文件更新
- [x] 在application.properties中添加火山引擎配置项
- [x] 在application-dev.properties中配置开发环境密钥
- [x] 在application-prod.properties中配置生产环境密钥
- [x] 验证配置项正确加载

## 2. 核心服务实现 [x]

### 2.1 VolcengineService服务类
- [x] 创建VolcengineService.java
- [x] 实现服务初始化和API密钥验证
- [x] 实现generateImage方法
- [x] 实现尺寸映射和参数转换
- [x] 添加@PreDestroy关闭方法
- [x] 编写JavaDoc注释

### 2.2 接口和工厂类
- [x] 创建ImageGenerationService接口
- [x] 更新AliyunTongYiService实现接口
- [x] 创建AIModelServiceFactory工厂类
- [x] 实现模型选择逻辑
- [x] 添加依赖注入注解

### 2.3 AIPortraitService集成
- [x] 更新AIPortraitService注入AIModelServiceFactory
- [x] 修改generatePortrait方法使用工厂
- [x] 更新buildPrompt方法支持火山引擎
- [x] 验证现有功能不受影响

## 3. 数据库和配置更新 [x]

### 3.1 数据库脚本
- [x] 创建火山引擎模型配置SQL脚本
- [x] 添加doubao-seedream-5-0-260128模型
- [x] 添加doubao-seedream-4-0-260128模型
- [x] 验证模型配置正确插入

### 3.2 模型实体更新
- [x] 验证AIPortraitModelConfig实体支持新模型
- [x] 更新模型验证逻辑
- [x] 添加火山引擎模型常量定义

## 4. 异常处理和健壮性 [x]

### 4.1 异常类定义
- [x] 创建VolcengineException自定义异常
- [x] 添加错误码和请求ID支持
- [x] 更新服务中的异常处理

### 4.2 重试机制
- [x] 实现generateImageWithRetry方法
- [x] 添加指数退避策略
- [x] 配置重试次数和超时时间

### 4.3 健康检查
- [x] 创建VolcengineHealthIndicator
- [x] 实现健康状态检测
- [x] 集成到Spring Boot Actuator

## 5. 测试实现 [x]

### 5.1 单元测试
- [x] 创建VolcengineServiceTest测试类
- [x] 测试服务初始化
- [x] 测试API密钥验证
- [x] 测试尺寸映射逻辑
- [x] 测试异常处理
- [x] 达到80%以上代码覆盖率

### 5.2 集成测试
- [x] 创建AIPortraitControllerIntegrationTest
- [x] 测试火山引擎模型生成端点
- [x] 测试模型切换功能
- [x] 验证响应格式正确

### 5.3 Mock测试
- [x] 使用MockWebServer模拟火山引擎API
- [x] 测试网络错误场景
- [x] 测试超时和重试逻辑

## 6. 前端集成 [x]

### 6.1 模型选择UI
- [x] 更新AI立绘生成器前端
- [x] 添加火山引擎模型选项
- [x] 更新模型下拉菜单
- [x] 验证模型切换功能

### 6.2 API适配
- [x] 验证前端API调用兼容新模型
- [x] 更新模型参数验证
- [x] 测试前端与后端集成

## 7. 文档和部署 [x]

### 7.1 文档更新
- [x] 更新README.md添加火山引擎配置说明
- [x] 创建火山引擎部署指南
- [x] 更新API文档
- [x] 添加配置示例

### 7.2 部署脚本
- [x] 更新Dockerfile（如需要）
- [x] 更新部署脚本添加环境变量
- [x] 验证生产环境配置

### 7.3 监控和日志
- [x] 添加火山引擎相关日志
- [x] 配置监控指标
- [x] 验证日志格式正确

## 8. 验证和上线 [x]

### 8.1 功能验证
- [x] 验证火山引擎模型生成功能
- [x] 验证模型切换功能
- [x] 验证错误处理
- [x] 验证重试机制

### 8.2 性能测试
- [x] 测试火山引擎API响应时间
- [x] 验证连接池配置
- [x] 测试并发生成性能

### 8.3 上线检查
- [x] 验证生产环境配置
- [x] 测试API密钥安全性
- [x] 验证健康检查端点
- [x] 准备回滚方案

## 依赖关系说明

### 前置依赖
- 任务1必须在任务2之前完成
- 任务2.1和2.2可以并行进行
- 任务3可以在任务2完成后开始

### 并行任务
- 任务4（异常处理）和任务5（测试）可以并行进行
- 任务6（前端集成）依赖任务2完成
- 任务7（文档）可以与其他任务并行

### 关键路径
- 环境配置 → 核心服务实现 → 数据库更新 → 前端集成 → 验证上线

## 验收标准

### 功能验收
- [x] 火山引擎SDK成功集成
- [x] 支持doubao-seedream系列模型
- [x] 模型切换功能正常
- [x] 错误处理和重试机制有效

### 代码质量
- [x] 遵循Java 8兼容性要求
- [x] 代码覆盖率≥80%
- [x] 通过所有单元测试和集成测试
- [x] 代码审查通过

### 运维验收
- [x] 健康检查正常
- [x] 日志记录完整
- [x] 监控指标可用
- [x] 文档完整准确

