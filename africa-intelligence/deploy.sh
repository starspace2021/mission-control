#!/bin/bash
# 非洲情报看板部署脚本
# 统一入口，禁止手动操作

set -e

echo "🚀 开始部署非洲情报看板..."

# 1. 验证数据
echo "📋 验证数据完整性..."
python3 /root/.openclaw/workspace/africa-intelligence/api.py validate

# 2. 复制数据到看板目录
echo "📁 同步数据..."
cp /root/.openclaw/workspace/africa-intelligence/data/reports.json \
   /root/.openclaw/workspace/intelligence-dashboard/data/reports.json

# 3. 构建
echo "🔨 构建..."
cd /root/.openclaw/workspace/intelligence-dashboard
npm run build

# 4. 部署
echo "🌐 部署到 Vercel..."
vercel --prod --yes \
  --token=vcp_7WTVAa599VHmJcCJx75amx63mBMtCay9jX9MUTaD60CJgbLNZ30xKErd

echo "✅ 部署完成!"
echo "🔗 https://intelligence-dashboard-mu.vercel.app"