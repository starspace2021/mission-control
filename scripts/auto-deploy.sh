#!/bin/bash
# Mission Control 自动部署脚本

cd /root/.openclaw/workspace/mission-control

echo "=== Mission Control 自动部署 ==="
echo "时间: $(date)"

# 1. 构建
echo "[1/3] 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 2. 推送 GitHub
echo "[2/3] 推送到 GitHub..."
git add .
git commit -m "UI更新: $(date +%Y%m%d-%H%M)"
git push origin master:main

if [ $? -ne 0 ]; then
    echo "⚠️ Git推送失败，尝试强制推送..."
    git push origin master:main --force
fi

echo "✅ GitHub 同步完成"

# 3. 部署到 Vercel（需要配置 Token）
echo "[3/3] 部署到 Vercel..."
if [ -n "$VERCEL_TOKEN" ]; then
    vercel --prod --token=$VERCEL_TOKEN --yes
    echo "✅ Vercel 部署完成"
else
    echo "⚠️ VERCEL_TOKEN 未设置，跳过 Vercel 部署"
    echo "提示: 设置环境变量 VERCEL_TOKEN 以启用自动部署"
fi

echo ""
echo "=== 部署完成 ==="
echo "GitHub: https://github.com/starspace2021/mission-control"
