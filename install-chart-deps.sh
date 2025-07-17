#!/bin/bash

echo "🚀 安装训练图表功能依赖..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在encryption目录下运行此脚本"
    exit 1
fi

# 安装Chart.js依赖
echo "📦 安装Chart.js..."
npm install chart.js@^4.4.0

# 检查安装结果
if [ $? -eq 0 ]; then
    echo "✅ Chart.js安装成功！"
    echo ""
    echo "🎉 训练图表功能已准备就绪！"
    echo ""
    echo "📋 使用步骤："
    echo "1. 启动后端训练程序: cd ../../../MNIST_CNN/cmd/ctCNN && go run main.go"
    echo "2. 启动前端服务: npm run serve"
    echo "3. 访问训练图表: http://localhost:8080/training-chart"
    echo ""
    echo "📖 详细说明请查看 TRAINING_CHART_README.md"
else
    echo "❌ Chart.js安装失败，请检查网络连接或手动安装"
    exit 1
fi 