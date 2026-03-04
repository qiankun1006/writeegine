#!/bin/bash

# ===========================================
# AI 立绘生成器后端开发环境初始化脚本
# Java 8 + Spring Boot 2.7 + MySQL 5.7 + 阿里云通义
# ===========================================

set -e  # 遇到错误立即退出

echo "========================================="
echo "开始初始化开发环境..."
echo "========================================="

# 1. 检查 Java 版本
echo ""
echo "【Step 1】检查 Java 版本..."
JAVA_VERSION=$(java -version 2>&1 | head -1)
echo "当前 Java 版本: $JAVA_VERSION"

if ! java -version 2>&1 | grep -q "1.8"; then
    echo "❌ 检测到 Java 版本不是 1.8"
    echo "请安装 JDK 1.8 并设置 JAVA_HOME 环境变量"
    echo "下载地址: https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html"
    exit 1
else
    echo "✅ Java 1.8 检查通过"
fi

# 2. 检查 Maven
echo ""
echo "【Step 2】检查 Maven..."
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven 未安装"
    echo "请安装 Maven: brew install maven (macOS) 或其他系统的包管理器"
    exit 1
else
    MVN_VERSION=$(mvn -v)
    echo "✅ Maven 已安装"
    echo "$MVN_VERSION"
fi

# 3. 检查 MySQL
echo ""
echo "【Step 3】检查 MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL 命令行工具未安装"
    echo "建议安装: brew install mysql (macOS)"
    echo "但如果 MySQL 服务已通过其他方式启动，可以继续"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MySQL 已安装"
fi

# 4. 获取项目根目录
echo ""
echo "【Step 4】初始化项目路径..."
PROJECT_ROOT="/Users/qiankun96/Desktop/meituan/writeengine"
BACKEND_DIR="$PROJECT_ROOT/src/main/java/com/example/writemyself"
RESOURCES_DIR="$PROJECT_ROOT/src/main/resources"

echo "项目根目录: $PROJECT_ROOT"
echo "后端代码目录: $BACKEND_DIR"
echo "资源目录: $RESOURCES_DIR"

# 5. 创建必要的目录结构
echo ""
echo "【Step 5】创建后端代码目录结构..."
mkdir -p "$BACKEND_DIR/service/ai"
mkdir -p "$BACKEND_DIR/entity"
mkdir -p "$BACKEND_DIR/repository"
mkdir -p "$BACKEND_DIR/dto"
mkdir -p "$BACKEND_DIR/controller"
mkdir -p "$BACKEND_DIR/config"
echo "✅ 目录结构已创建"

# 6. 提示环境变量设置
echo ""
echo "【Step 6】需要设置以下环境变量..."
echo ""
echo "请在 ~/.zshrc 或 ~/.bash_profile 中添加:"
echo ""
cat << 'EOF'
# AI 立绘生成器配置
export ALIYUN_API_KEY="sk-xxxxxxxx"          # 阿里云通义 API Key
export ALIYUN_AK_ID="xxxxxxxx"               # 阿里云 AccessKey ID
export ALIYUN_AK_SECRET="xxxxxxxx"           # 阿里云 Secret Key

# 可选：百度文心配置
export BAIDU_API_KEY="xxxxxxxx"
export BAIDU_API_SECRET="xxxxxxxx"
EOF

echo ""
echo "然后运行:"
echo "  source ~/.zshrc"
echo ""

# 7. 检查数据库连接
echo ""
echo "【Step 7】检查 MySQL 连接..."
echo "尝试连接到 MySQL (localhost:3306)..."

if mysql -h localhost -u root -proot -e "SELECT 1" &> /dev/null; then
    echo "✅ MySQL 连接成功 (用户:root, 密码:root)"
else
    echo "⚠️  无法以 root:root 连接到 MySQL"
    echo "请检查 MySQL 是否启动，用户名和密码是否正确"
    echo "MySQL 连接字符串: mysql://root:root@localhost:3306"
fi

# 8. 创建数据库
echo ""
echo "【Step 8】创建数据库..."
if mysql -h localhost -u root -proot -e "CREATE DATABASE IF NOT EXISTS writeengine DEFAULT CHARACTER SET utf8mb4;" 2> /dev/null; then
    echo "✅ 数据库 writeengine 已创建/存在"
else
    echo "⚠️  无法创建数据库，请手动执行:"
    echo "  mysql -u root -p"
    echo "  CREATE DATABASE IF NOT EXISTS writeengine DEFAULT CHARACTER SET utf8mb4;"
fi

# 9. 构建项目
echo ""
echo "【Step 9】进行 Maven 构建..."
cd "$PROJECT_ROOT"

if [ -f "pom.xml" ]; then
    echo "发现 pom.xml，开始构建..."
    mvn clean install -DskipTests 2>&1 | tail -20
    echo "✅ 构建完成"
else
    echo "⚠️  未发现 pom.xml，跳过 Maven 构建"
    echo "请确保你在正确的项目目录中"
fi

# 10. 生成检查清单
echo ""
echo "========================================="
echo "初始化完成！"
echo "========================================="
echo ""
echo "📋 后续操作清单:"
echo ""
echo "1️⃣  设置环境变量:"
echo "   export ALIYUN_API_KEY='your-api-key'"
echo ""
echo "2️⃣  更新 application.properties:"
echo "   位置: $RESOURCES_DIR/application.properties"
cat << 'EOF'
   必需配置:
   - spring.datasource.url=jdbc:mysql://localhost:3306/writeengine
   - spring.datasource.username=root
   - spring.datasource.password=root
   - aliyun.dashscope.api.key=${ALIYUN_API_KEY}
EOF
echo ""
echo "3️⃣  创建后端代码:"
echo "   - Entity 类 (5个)"
echo "   - Repository 接口 (3个)"
echo "   - Service 类 (4个) - 包括 AliyunTongYiService"
echo "   - Controller 类 (1个)"
echo ""
echo "4️⃣  初始化数据库表:"
echo "   执行: mysql < openspec/changes/add-ai-portrait-backend/init.sql"
echo ""
echo "5️⃣  启动应用:"
echo "   cd $PROJECT_ROOT"
echo "   mvn spring-boot:run"
echo ""
echo "6️⃣  测试 API:"
echo "   curl http://localhost:8083/api/ai/portrait/models"
echo ""
echo "📚 参考文档:"
echo "   - JAVA8_DOMESTIC_ADAPTATION.md (Java 8 适配)"
echo "   - QUICK_START_JAVA8.md (快速开始)"
echo "   - DOMESTIC_AI_MODELS_COMPARISON.md (模型对比)"
echo "   - design.md (完整设计)"
echo "   - tasks.md (详细任务列表)"
echo ""
echo "✅ 环境初始化完成！"
echo "========================================="

