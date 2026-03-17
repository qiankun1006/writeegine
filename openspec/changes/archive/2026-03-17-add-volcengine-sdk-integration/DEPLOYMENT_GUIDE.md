# 火山引擎SDK集成部署指南

## 概述

本指南详细说明如何将字节跳动火山引擎SDK集成到现有的AI立绘生成系统中，包括环境配置、部署步骤和验证方法。

## 1. 环境要求

### 1.1 系统要求
- Java 8 (JDK 1.8)
- Maven 3.6+
- Spring Boot 2.7.14
- MySQL 8.0+ (可选，用于生产环境)

### 1.2 火山引擎账户配置
1. 注册火山引擎账户
2. 开通ARK服务
3. 获取API密钥
4. 获取访问端点信息

## 2. 部署步骤

### 2.1 环境变量配置

#### 开发环境 (`.env.dev`)
```bash
# 火山引擎配置
VOLCENGINE_API_KEY=your_volcengine_api_key_here
VOLCENGINE_MODEL=doubao-seedream-5-0-260128

# 阿里云配置（保持不变）
ALIYUN_API_KEY=your_aliyun_api_key_here
```

#### 生产环境 (`.env.prod`)
```bash
# 火山引擎配置
VOLCENGINE_API_KEY=${VOLCENGINE_API_KEY}
VOLCENGINE_MODEL=doubao-seedream-5-0-260128

# 阿里云配置
ALIYUN_API_KEY=${ALIYUN_API_KEY}
```

### 2.2 数据库初始化

执行火山引擎模型配置脚本：
```bash
mysql -u username -p database_name < openspec/changes/add-volcengine-sdk-integration/volcengine-models.sql
```

### 2.3 应用配置更新

#### application.properties
确保以下配置已添加：
```properties
# 火山引擎配置
volcengine.ark.api.key=${VOLCENGINE_API_KEY:}
volcengine.model=doubao-seedream-5-0-260128

# 阿里云配置
aliyun.dashscope.api.key=${ALIYUN_API_KEY:}
aliyun.portrait.model=wanx-v1
```

### 2.4 构建应用

```bash
# 清理并编译
mvn clean compile

# 运行测试
mvn test

# 打包应用
mvn package -DskipTests
```

### 2.5 启动应用

#### 开发环境
```bash
# 设置环境变量
export VOLCENGINE_API_KEY="your_api_key"
export ALIYUN_API_KEY="your_aliyun_key"

# 启动应用
java -jar target/writeMyself-0.0.1-SNAPSHOT.jar
```

#### 生产环境
```bash
# 使用Docker启动
docker run -d \
  -e VOLCENGINE_API_KEY="${VOLCENGINE_API_KEY}" \
  -e ALIYUN_API_KEY="${ALIYUN_API_KEY}" \
  -p 8083:8083 \
  writeengine:latest
```

## 3. 验证部署

### 3.1 健康检查

访问健康检查端点：
```bash
curl http://localhost:8083/actuator/health
```

预期响应：
```json
{
  "status": "UP",
  "components": {
    "volcengine": {
      "status": "UP",
      "details": {
        "service": "volcengine",
        "status": "initialized",
        "model": "doubao-seedream-5-0-260128"
      }
    }
  }
}
```

### 3.2 API测试

#### 测试火山引擎模型
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

#### 测试模型切换
```bash
# 测试阿里云模型
curl -X POST http://localhost:8083/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "prompt": "日系二次元少女，长发粉发，猫耳",
    "width": 512,
    "height": 768,
    "provider": "aliyun",
    "modelVersion": "wanx-v1",
    "count": 1
  }'
```

### 3.3 前端验证

1. 访问前端页面
2. 在模型选择面板中选择"火山引擎"
3. 选择"豆包 Seedream 5.0"模型
4. 输入提示词并生成图像
5. 验证生成结果和进度显示

## 4. 监控和日志

### 4.1 日志配置

确保日志级别配置正确：
```properties
# application.properties
logging.level.com.example.writemyself.service.VolcengineService=INFO
logging.level.com.volcengine=INFO
```

### 4.2 关键监控指标

- 火山引擎API调用成功率
- 平均响应时间
- 错误率和重试次数
- 模型使用统计

### 4.3 告警配置

配置以下告警：
- API密钥即将过期
- 火山引擎服务不可用
- 错误率超过阈值（>5%）
- 响应时间过长（>30秒）

## 5. 故障排除

### 5.1 常见问题

#### 问题1: 火山引擎服务初始化失败
**症状**: 健康检查显示火山引擎服务DOWN
**原因**: API密钥未配置或无效
**解决方案**:
1. 检查环境变量是否正确设置
2. 验证API密钥是否有效
3. 检查网络连接

#### 问题2: 生成请求超时
**症状**: 生成任务长时间处于PROCESSING状态
**原因**: 火山引擎API响应慢或网络问题
**解决方案**:
1. 增加超时配置
2. 检查网络连接
3. 启用重试机制

#### 问题3: 模型不可用
**症状**: 前端无法选择火山引擎模型
**原因**: 数据库配置未正确插入
**解决方案**:
1. 重新执行数据库脚本
2. 检查模型配置是否active
3. 重启应用

### 5.2 调试技巧

#### 启用详细日志
```properties
logging.level.com.example.writemyself=DEBUG
logging.level.com.volcengine=DEBUG
```

#### 检查API调用
```bash
# 查看火山引擎API调用日志
grep "火山引擎" application.log

# 查看错误日志
grep "VolcengineException" application.log
```

## 6. 性能优化

### 6.1 连接池配置

```properties
# 火山引擎SDK连接池配置
# 在VolcengineService中已配置
# ConnectionPool(5, 1, TimeUnit.SECONDS)
```

### 6.2 缓存策略

- 缓存模型配置信息
- 缓存API响应（如适用）
- 实现请求限流

### 6.3 异步处理优化

- 调整线程池大小
- 优化重试策略
- 实现请求队列管理

## 7. 安全考虑

### 7.1 API密钥管理

- 使用环境变量或密钥管理服务
- 定期轮换API密钥
- 限制API密钥权限

### 7.2 输入验证

- 验证提示词内容
- 限制请求频率
- 实现内容审核

### 7.3 网络安全

- 使用HTTPS
- 配置防火墙规则
- 监控异常访问

## 8. 回滚计划

### 8.1 快速回滚

如果火山引擎集成出现问题，可以快速回滚：

1. 移除火山引擎配置
2. 恢复默认使用阿里云模型
3. 重启应用

### 8.2 数据库回滚

```sql
-- 禁用火山引擎模型
UPDATE ai_portrait_model_config
SET is_active = false
WHERE provider = 'VOLCENGINE';

-- 设置阿里云为默认
UPDATE ai_portrait_model_config
SET is_default = true
WHERE provider = 'ALIYUN' AND model_name = 'wanx-v1';
```

## 9. 后续维护

### 9.1 定期任务

- 监控API使用情况
- 更新模型版本
- 优化提示词模板
- 收集用户反馈

### 9.2 版本更新

- 跟踪火山引擎SDK更新
- 测试新版本兼容性
- 制定升级计划

---

**部署完成时间**: 2026年3月5日
**负责人**: CatPaw AI Assistant
**版本**: 1.0

