#!/bin/bash

# AI 人物立绘生成器 - 构建脚本
# 此脚本用于构建 Vue 3 应用并准备部署

set -e

echo "🏗️ AI 人物立绘生成器 - 构建开始"
echo "=================================="

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到 npm，请先安装 npm"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"
echo "✓ npm 版本: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装依赖中..."
npm install
echo "✓ 依赖安装完成"
echo ""

# 构建应用
echo "🔨 编译应用中..."
npm run build
echo "✓ 应用编译完成"
echo ""

echo "=================================="
echo "✅ 构建成功！"
echo ""
echo "输出目录: dist/"
echo "下一步："
echo "1. 启动 Spring Boot 应用"
echo "2. 访问 http://localhost:8083/create-game/asset/character-portrait"
echo ""

