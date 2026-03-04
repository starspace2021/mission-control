#!/bin/bash
# install-cron.sh - 情报看板定时任务安装脚本

set -e

echo "=== 安装情报看板定时任务 ==="

# 创建配置文件目录
mkdir -p /root/.openclaw/workspace/config

# 写入定时任务配置
cat > /root/.openclaw/workspace/config/crontab.conf << 'EOF'
# ============================================
# 情报看板定时任务配置
# 创建时间: 2026-03-04
# 维护者: 侧影
# ============================================

# 非洲情报 - 孙悟空 (政经简报)
0 0,10,14,17,20 * * * cd /root/.openclaw/workspace && python3 -c "from africa_intelligence.api import generate_briefing; generate_briefing('intel')" >> /var/log/africa_intel.log 2>&1

# 非洲风险 - 比克 (风险简报)
0 0,10,14,17,20 * * * cd /root/.openclaw/workspace && python3 -c "from africa_intelligence.api import generate_briefing; generate_briefing('risk')" >> /var/log/africa_risk.log 2>&1

# 非洲 QA - 天津饭 (质量检查)
5 0,10,14,17,20 * * * cd /root/.openclaw/workspace && python3 -c "from africa_intelligence.qa import check_quality; check_quality()" >> /var/log/africa_qa.log 2>&1

# 日本情报 (每6小时)
0 0,6,12,18 * * * cd /root/.openclaw/workspace && python3 japan-intelligence/api.py >> /var/log/japan_intel.log 2>&1

# 日本 QA
5 0,6,12,18 * * * cd /root/.openclaw/workspace && echo "Japan QA check at $(date)" >> /var/log/japan_qa.log 2>&1

# 伊朗情报 (每小时)
0 * * * * cd /root/.openclaw/workspace && python3 iran-intelligence/api.py >> /var/log/iran_intel.log 2>&1

# 伊朗 QA
5 * * * * cd /root/.openclaw/workspace && echo "Iran QA check at $(date)" >> /var/log/iran_qa.log 2>&1
EOF

# 安装定时任务
crontab /root/.openclaw/workspace/config/crontab.conf

echo ""
echo "=== 定时任务安装完成 ==="
echo ""
crontab -l | grep -E "africa|japan|iran" | head -10
echo ""
echo "=== 日志文件位置 ==="
echo "  /var/log/africa_intel.log"
echo "  /var/log/africa_risk.log"
echo "  /var/log/africa_qa.log"
echo "  /var/log/japan_intel.log"
echo "  /var/log/iran_intel.log"
