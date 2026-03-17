# volcengine-integration Specification

## Purpose
TBD - created by archiving change add-volcengine-sdk-integration. Update Purpose after archive.
## Requirements
### Requirement: 火山引擎SDK集成

系统 SHALL 集成字节跳动火山引擎SDK，支持doubao-seedream系列模型进行AI图像生成。

#### Scenario: 火山引擎服务初始化
- **WHEN** 系统启动时
- **THEN** 读取火山引擎API密钥配置
- **AND** 初始化ArkService连接池和调度器
- **AND** 验证API密钥有效性
- **AND** 如果配置缺失，记录警告但不阻止系统启动

#### Scenario: 火山引擎API调用
- **WHEN** 调用火山引擎生成图片
- **THEN** 构建GenerateImagesRequest请求
- **AND** 设置模型为doubao-seedream-5-0-260128
- **AND** 转换尺寸参数为火山引擎格式（如"1024*1024"、"2K"）
- **AND** 设置响应格式为URL
- **AND** 启用水印功能
- **AND** 调用arkService.generateImages()方法

#### Scenario: 火山引擎响应处理
- **WHEN** 收到火山引擎API响应
- **THEN** 解析ImagesResponse数据结构
- **AND** 提取生成的图片URL列表
- **AND** 验证URL有效性
- **AND** 返回图片URL列表给调用方

---

### Requirement: 多模型服务工厂

系统 SHALL 实现模型服务工厂，支持动态选择不同的AI模型服务。

#### Scenario: 获取阿里云通义服务
- **WHEN** 请求模型名称为"wanx-v1"或"tongyi-"开头
- **THEN** 工厂返回AliyunTongYiService实例
- **AND** 服务实现ImageGenerationService接口

#### Scenario: 获取火山引擎服务
- **WHEN** 请求模型名称为"doubao-"开头
- **THEN** 工厂返回VolcengineService实例
- **AND** 服务实现ImageGenerationService接口

#### Scenario: 默认服务回退
- **WHEN** 请求的模型名称无法识别
- **THEN** 工厂默认返回AliyunTongYiService实例
- **AND** 记录警告信息

---

### Requirement: 火山引擎异常处理

系统 SHALL 提供专门的火山引擎异常处理机制。

#### Scenario: API调用异常
- **WHEN** 火山引擎API调用失败
- **THEN** 捕获底层异常
- **AND** 包装为VolcengineException
- **AND** 保留原始错误码和请求ID
- **AND** 记录详细的错误日志

#### Scenario: 配置缺失异常
- **WHEN** 调用火山引擎服务但API密钥未配置
- **THEN** 抛出IllegalStateException
- **AND** 提示用户检查配置文件
- **AND** 建议设置VOLCENGINE_API_KEY环境变量

#### Scenario: 重试机制
- **WHEN** 火山引擎API调用失败
- **THEN** 系统自动重试最多3次
- **AND** 使用指数退避策略（1s, 2s, 4s）
- **AND** 如果所有重试都失败，抛出最终异常

---

### Requirement: 火山引擎模型配置

系统 SHALL 在数据库中配置火山引擎相关模型信息。

#### Scenario: 模型配置初始化
- **WHEN** 系统首次部署
- **THEN** 在ai_portrait_model_config表中插入火山引擎模型
- **AND** 配置doubao-seedream-5-0-260128模型
- **AND** 配置doubao-seedream-4-0-260128模型
- **AND** 设置provider字段为"volcengine"
- **AND** 设置模型状态为激活

#### Scenario: 模型选择验证
- **WHEN** 用户选择火山引擎模型
- **THEN** 验证模型存在于数据库配置中
- **AND** 验证模型状态为激活
- **AND** 如果模型不存在或未激活，返回错误信息

---

### Requirement: 火山引擎健康检查

系统 SHALL 提供火山引擎服务健康状态检查。

#### Scenario: 健康状态检测
- **WHEN** 查询系统健康状态
- **THEN** 检查火山引擎服务是否已初始化
- **AND** 验证API密钥是否配置
- **AND** 返回服务状态（up/down）
- **AND** 包含详细的错误信息（如果服务不可用）

#### Scenario: 服务不可用处理
- **WHEN** 火山引擎服务健康检查失败
- **THEN** 不影响整体系统健康状态
- **AND** 仅标记火山引擎组件为down
- **AND** 其他AI模型服务继续正常工作

---

### Requirement: Java 8兼容性

系统 SHALL 确保火山引擎SDK集成完全兼容Java 8。

#### Scenario: 代码兼容性检查
- **WHEN** 编译火山引擎相关代码
- **THEN** 不使用var关键字
- **AND** 不使用List.of()工厂方法
- **AND** 不使用String.strip()方法
- **AND** 使用传统的Stream收集方式
- **AND** 成功通过Java 8编译

#### Scenario: 依赖兼容性
- **WHEN** 引入火山引擎SDK依赖
- **THEN** 验证SDK兼容Java 8
- **AND** 验证okhttp版本兼容Java 8
- **AND** 解决任何版本冲突

---

### Requirement: 火山引擎性能优化

系统 SHALL 优化火山引擎服务性能。

#### Scenario: 连接池配置
- **WHEN** 初始化火山引擎服务
- **THEN** 配置连接池最大空闲连接数为20
- **AND** 设置连接保持活跃时间为5分钟
- **AND** 配置调度器最大并发请求数为64
- **AND** 设置每个主机最大请求数为16

#### Scenario: 缓存策略
- **WHEN** 生成相同参数的图片
- **THEN** 检查缓存中是否存在结果
- **AND** 如果存在且未过期，返回缓存结果
- **AND** 如果不存在，调用API并缓存结果
- **AND** 设置缓存过期时间为1小时

---

### Requirement: 火山引擎日志记录

系统 SHALL 提供详细的火山引擎操作日志。

#### Scenario: 生成请求日志
- **WHEN** 调用火山引擎生成图片
- **THEN** 记录INFO级别日志，包含提示词、尺寸、数量
- **AND** 记录DEBUG级别日志，包含完整的请求参数
- **AND** 不记录API密钥等敏感信息

#### Scenario: 生成结果日志
- **WHEN** 火山引擎生成完成
- **THEN** 记录INFO级别日志，包含生成数量和总耗时
- **AND** 记录DEBUG级别日志，包含生成的图片URL
- **AND** 如果生成失败，记录ERROR级别日志

#### Scenario: 异常日志
- **WHEN** 火山引擎API调用异常
- **THEN** 记录ERROR级别日志，包含异常详情
- **AND** 记录请求ID用于问题追踪
- **AND** 记录错误码用于分类处理

---

### Requirement: 火山引擎配置管理

系统 SHALL 提供灵活的火山引擎配置管理。

#### Scenario: 环境变量配置
- **WHEN** 部署到不同环境
- **THEN** 支持通过环境变量配置API密钥
- **AND** 支持通过环境变量配置默认模型
- **AND** 支持通过环境变量配置超时时间
- **AND** 环境变量优先级高于配置文件

#### Scenario: 配置文件回退
- **WHEN** 环境变量未设置
- **THEN** 使用application.properties中的配置
- **AND** 如果配置文件也未设置，使用默认值
- **AND** 记录配置来源信息

---

### Requirement: 火山引擎前端集成

系统 SHALL 支持前端选择火山引擎模型。

#### Scenario: 模型选择界面
- **WHEN** 用户在AI立绘生成器中选择模型
- **THEN** 显示火山引擎模型选项
- **AND** 显示模型描述和特性
- **AND** 支持模型切换
- **AND** 保存用户选择到本地存储

#### Scenario: API参数传递
- **WHEN** 前端发送生成请求
- **THEN** 包含用户选择的模型名称
- **AND** 如果未选择，使用默认模型
- **AND** 验证模型名称有效性

---

