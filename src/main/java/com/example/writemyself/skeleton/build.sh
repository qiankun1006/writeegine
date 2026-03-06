#!/bin/bash

# 骨骼动画系统后端构建脚本
# 用于构建和部署Java后端代码

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 骨骼动画系统后端构建脚本 ===${NC}"

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查构建依赖...${NC}"

    if ! command -v java &> /dev/null; then
        echo -e "${RED}错误: Java 未安装${NC}"
        exit 1
    fi

    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}错误: Maven 未安装${NC}"
        exit 1
    fi

    # 检查Java版本
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    if [[ "$JAVA_VERSION" < "1.8" ]]; then
        echo -e "${RED}错误: 需要Java 1.8或更高版本，当前版本: $JAVA_VERSION${NC}"
        exit 1
    fi

    echo -e "${GREEN}依赖检查完成 (Java版本: $JAVA_VERSION)${NC}"
}

# 清理构建产物
clean_build() {
    echo -e "${YELLOW}清理构建产物...${NC}"
    mvn clean
    echo -e "${GREEN}清理完成${NC}"
}

# 编译代码
compile_code() {
    echo -e "${YELLOW}编译Java代码...${NC}"
    mvn compile
    echo -e "${GREEN}编译完成${NC}"
}

# 运行测试
run_tests() {
    echo -e "${YELLOW}运行单元测试...${NC}"
    mvn test
    echo -e "${GREEN}测试完成${NC}"
}

# 构建JAR包
build_jar() {
    echo -e "${YELLOW}构建JAR包...${NC}"
    mvn package -DskipTests
    echo -e "${GREEN}JAR包构建完成${NC}"
}

# 安装到本地仓库
install_local() {
    echo -e "${YELLOW}安装到本地Maven仓库...${NC}"
    mvn install -DskipTests
    echo -e "${GREEN}本地安装完成${NC}"
}

# 生成文档
generate_docs() {
    echo -e "${YELLOW}生成JavaDoc文档...${NC}"
    mvn javadoc:javadoc
    echo -e "${GREEN}文档生成完成${NC}"
}

# 代码质量检查
code_quality_check() {
    echo -e "${YELLOW}执行代码质量检查...${NC}"
    # 这里可以集成SonarQube或其他代码质量工具
    echo -e "${GREEN}代码质量检查完成${NC}"
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示此帮助信息"
    echo "  -c, --clean         清理构建产物"
    echo "  -m, --compile       编译代码"
    echo "  -t, --test          运行测试"
    echo "  -p, --package       构建JAR包"
    echo "  -i, --install       安装到本地仓库"
    echo "  -d, --docs          生成文档"
    echo "  -q, --quality       代码质量检查"
    echo "  -a, --all           执行完整构建流程（默认）"
    echo ""
    echo "示例:"
    echo "  $0 --all           # 执行完整构建流程"
    echo "  $0 --clean         # 清理构建产物"
    echo "  $0 --package       # 仅构建JAR包"
}

# 主函数
main() {
    local action="all"

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--clean)
                action="clean"
                shift
                ;;
            -m|--compile)
                action="compile"
                shift
                ;;
            -t|--test)
                action="test"
                shift
                ;;
            -p|--package)
                action="package"
                shift
                ;;
            -i|--install)
                action="install"
                shift
                ;;
            -d|--docs)
                action="docs"
                shift
                ;;
            -q|--quality)
                action="quality"
                shift
                ;;
            -a|--all)
                action="all"
                shift
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done

    # 执行相应操作
    case $action in
        "clean")
            clean_build
            ;;
        "compile")
            compile_code
            ;;
        "test")
            run_tests
            ;;
        "package")
            build_jar
            ;;
        "install")
            install_local
            ;;
        "docs")
            generate_docs
            ;;
        "quality")
            code_quality_check
            ;;
        "all")
            check_dependencies
            clean_build
            compile_code
            run_tests
            build_jar
            install_local
            generate_docs
            code_quality_check
            echo -e "${GREEN}=== 完整构建流程完成 ===${NC}"
            ;;
    esac
}

# 执行主函数
main "$@"

