#!/bin/bash

# 骨骼动画系统前端构建脚本
# 用于构建和部署前端资源

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 骨骼动画系统前端构建脚本 ===${NC}"

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查构建依赖...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: Node.js 未安装${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: npm 未安装${NC}"
        exit 1
    fi

    if ! command -v npx &> /dev/null; then
        echo -e "${RED}错误: npx 未安装${NC}"
        exit 1
    fi

    echo -e "${GREEN}依赖检查完成${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}安装项目依赖...${NC}"
    npm install
    echo -e "${GREEN}依赖安装完成${NC}"
}

# 代码检查
lint_code() {
    echo -e "${YELLOW}执行代码检查...${NC}"
    npm run lint
    echo -e "${GREEN}代码检查完成${NC}"
}

# 类型检查
type_check() {
    echo -e "${YELLOW}执行类型检查...${NC}
    npm run type-check
    echo -e "${GREEN}类型检查完成${NC}"
}

# 运行测试
run_tests() {
    echo -e "${YELLOW}运行单元测试...${NC}"
    npm run test
    echo -e "${GREEN}测试完成${NC}"
}

# 构建生产版本
build_production() {
    echo -e "${YELLOW}构建生产版本...${NC}"
    npm run build
    echo -e "${GREEN}生产版本构建完成${NC}"
}

# 清理构建产物
clean_build() {
    echo -e "${YELLOW}清理构建产物...${NC}"
    rm -rf dist/
    rm -rf coverage/
    echo -e "${GREEN}清理完成${NC}"
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示此帮助信息"
    echo "  -c, --clean         清理构建产物"
    echo "  -i, --install       安装依赖"
    echo "  -l, --lint          执行代码检查"
    echo "  -t, --type-check    执行类型检查"
    echo "  -u, --test          运行测试"
    echo "  -b, --build         构建生产版本"
    echo "  -a, --all           执行完整构建流程（默认）"
    echo ""
    echo "示例:"
    echo "  $0 --all           # 执行完整构建流程"
    echo "  $0 --clean         # 清理构建产物"
    echo "  $0 --build         # 仅构建生产版本"
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
            -i|--install)
                action="install"
                shift
                ;;
            -l|--lint)
                action="lint"
                shift
                ;;
            -t|--type-check)
                action="type-check"
                shift
                ;;
            -u|--test)
                action="test"
                shift
                ;;
            -b|--build)
                action="build"
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
        "install")
            check_dependencies
            install_dependencies
            ;;
        "lint")
            lint_code
            ;;
        "type-check")
            type_check
            ;;
        "test")
            run_tests
            ;;
        "build")
            build_production
            ;;
        "all")
            check_dependencies
            clean_build
            install_dependencies
            lint_code
            type_check
            run_tests
            build_production
            echo -e "${GREEN}=== 完整构建流程完成 ===${NC}"
            ;;
    esac
}

# 执行主函数
main "$@"

