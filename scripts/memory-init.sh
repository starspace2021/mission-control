#!/bin/bash
# memory-init.sh - 启动时自动加载所有记忆文档
# 此脚本应在每次会话启动时执行

set -e

echo "=== 初始化记忆系统 ==="

# 1. 扫描所有文档目录
echo "📚 扫描文档目录..."

# 核心文档
echo "  - 核心身份文档"
cat /root/.openclaw/workspace/IDENTITY.md 2>/dev/null | head -20 || echo "    无 IDENTITY.md"

echo "  - 用户配置"
cat /root/.openclaw/workspace/USER.md 2>/dev/null | head -20 || echo "    无 USER.md"

echo "  - 灵魂定义"
cat /root/.openclaw/workspace/SOUL.md 2>/dev/null | head -20 || echo "    无 SOUL.md"

# 运维文档
echo ""
echo "📖 运维文档索引:"
ls -1 /root/.openclaw/workspace/docs/*.md 2>/dev/null | while read f; do
    echo "  - $(basename $f)"
done

# 技能文档
echo ""
echo "🛠️ 技能文档索引:"
ls -1 /root/.openclaw/workspace/skills/*/SKILL.md 2>/dev/null | while read f; do
    echo "  - $(basename $(dirname $f))"
done

# 记忆文档
echo ""
echo "📝 近期记忆:"
ls -1t /root/.openclaw/workspace/memory/2026-*.md 2>/dev/null | head -5 | while read f; do
    echo "  - $(basename $f)"
done

echo ""
echo "✅ 记忆系统初始化完成"
