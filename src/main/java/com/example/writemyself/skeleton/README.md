# 骨骼动画系统 (Skeleton Animation System)

## 项目概述

这是一个完整的2D骨骼动画系统，专门用于替代现有的 `character-frame-sequence` 功能。系统基于 DragonBones 的优秀架构设计，提供了骨骼操作、动画控制、约束系统、网格变形等核心功能。

## 系统特点

### 🎯 核心功能
- **骨骼操作系统** - 骨骼层级管理、变换计算、动画插值
- **动画控制系统** - 时间轴、状态机、曲线编辑器
- **约束系统** - IK反向动力学、路径约束、变换约束
- **网格变形系统** - 顶点权重、蒙皮动画、网格编辑
- **遮罩与效果系统** - Alpha遮罩、Stencil遮罩、混合模式
- **数据导入导出系统** - 多格式支持、数据解析、版本兼容

### 🏗️ 架构设计
- **模块化设计** - 清晰的层次分离和职责划分
- **跨平台适配** - 支持多种渲染引擎和平台
- **性能优化** - 对象池、脏检查、缓存机制
- **扩展性设计** - 插件架构、面向接口编程

### 🔒 隔离性保证
- **完全独立** - 与现有功能完全隔离，不影响现有系统
- **独立目录** - 所有代码和资源文件独立存放
- **独立URL** - 使用独立的URL路径和控制器
- **向后兼容** - 现有功能保持不变

## 目录结构

```
src/main/java/com/example/writemyself/skeleton/
├── core/                           # 核心引擎
│   ├── data/                      # 数据模型
│   ├── object/                    # 基础对象
│   ├── bone/                      # 骨骼系统
│   ├── animation/                 # 动画系统
│   ├── constraint/                # 约束系统
│   └── mesh/                      # 网格系统
├── editor/                        # Web编辑器后端
│   ├── controller/                # 控制器
│   ├── service/                   # 服务层
│   └── repository/                # 数据访问
├── formats/                       # 数据格式
│   ├── parser/                    # 数据解析器
│   └── exporter/                  # 数据导出器
└── examples/                      # 示例代码

src/main/resources/static/js/skeleton/
├── core/                          # 核心引擎 (TypeScript)
├── editor/                        # Web编辑器 (TypeScript)
├── formats/                       # 数据格式 (TypeScript)
└── examples/                      # 示例代码 (TypeScript)

src/main/resources/skeleton/
├── config/                        # 配置文件
└── templates/                     # 模板文件
```

## 快速开始

### 环境要求

#### 后端环境
- Java 1.8 或更高版本
- Maven 3.6 或更高版本

#### 前端环境
- Node.js 14 或更高版本
- npm 6 或更高版本

### 构建步骤

#### 1. 后端构建
```bash
cd src/main/java/com/example/writemyself/skeleton/
chmod +x build.sh
./build.sh --all
```

#### 2. 前端构建
```bash
cd src/main/resources/static/js/skeleton/
chmod +x build.sh
./build.sh --all
```

### 开发模式

#### 后端开发
```bash
# 编译代码
./build.sh --compile

# 运行测试
./build.sh --test

# 构建JAR包
./build.sh --package
```

#### 前端开发
```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 运行测试
npm run test

# 构建生产版本
npm run build
```

## 配置说明

### 后端配置
配置文件位于 `src/main/resources/skeleton/config/` 目录：
- `application.properties` - 应用配置
- `skeleton.properties` - 骨骼动画系统配置

### 前端配置
配置文件位于项目根目录：
- `package.json` - 依赖和脚本配置
- `tsconfig.json` - TypeScript配置
- `webpack.config.js` - 构建配置
- `jest.config.js` - 测试配置

## API 文档

### Java API
- 核心引擎API：`com.example.writemyself.skeleton.core.*`
- 编辑器API：`com.example.writemyself.skeleton.editor.*`
- 数据格式API：`com.example.writemyself.skeleton.formats.*`

### JavaScript API
- 核心引擎：`SkeletonAnimation.Core.*`
- 编辑器：`SkeletonAnimation.Editor.*`
- 数据格式：`SkeletonAnimation.Formats.*`

## 测试说明

### 单元测试

#### Java 测试
```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=ClassNameTest

# 运行特定测试方法
mvn test -Dtest=ClassNameTest#methodName
```

#### TypeScript 测试
```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test -- --testPathPattern=filename.test.ts

# 查看测试覆盖率
npm run test -- --coverage
```

### 集成测试
集成测试位于 `src/test/java/` 目录，测试系统各模块的集成情况。

## 性能优化

### 内存管理
- 使用对象池减少GC压力
- 自动资源释放机制
- 内存使用监控

### 渲染优化
- 脏检查机制避免不必要的计算
- 动画缓存优化
- 批量渲染处理

### 计算优化
- 矩阵运算优化
- 插值计算缓存
- 约束求解器优化

## 扩展开发

### 添加新的数据格式
1. 实现 `DataParser` 接口
2. 实现 `DataExporter` 接口
3. 在工厂中注册新的格式支持

### 添加新的约束类型
1. 继承 `Constraint` 基类
2. 实现约束求解逻辑
3. 在约束管理器中注册

### 添加新的效果
1. 继承 `Effect` 基类
2. 实现效果渲染逻辑
3. 在效果系统中注册

## 故障排除

### 常见问题

#### 1. 构建失败
- 检查Java和Node.js版本
- 清理构建缓存：`./build.sh --clean`
- 重新安装依赖：`npm install`

#### 2. 运行时错误
- 检查配置文件是否正确
- 查看日志文件获取详细信息
- 确认资源文件路径正确

#### 3. 性能问题
- 启用性能监控查看瓶颈
- 检查对象池配置
- 优化动画数据复杂度

## 版本历史

### v1.0.0 (当前版本)
- 初始版本，完整的基础功能
- 支持骨骼动画编辑和播放
- 提供Web编辑器界面

## 相关文档

- [架构设计文档](docs/architecture.md)
- [API参考文档](docs/api-reference.md)
- [开发者指南](docs/developer-guide.md)
- [用户手册](docs/user-manual.md)
- [隔离性验证报告](ISOLATION_REPORT.md)

## 许可证

MIT License

## 联系我们

如有问题或建议，请联系开发团队。

