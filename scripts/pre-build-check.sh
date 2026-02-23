#!/bin/bash
# ============================================
# 构建前依赖检查脚本 (Pre-Build Check)
# Engineering Department - P0紧急修复
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志配置
LOG_DIR="/root/.openclaw/workspace/memory/logs/mission-control"
LOG_FILE="$LOG_DIR/pre-build-check-$(date +%Y%m%d-%H%M%S).log"

# 确保日志目录存在
mkdir -p "$LOG_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# 检查计数器
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

echo "=========================================="
echo "🚀 构建前依赖检查"
echo "=========================================="
log "开始构建前依赖检查"

# 1. 检查Node版本
check_node_version() {
    log_info "检查Node.js版本..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    
    log "当前Node版本: $NODE_VERSION"
    
    if [ "$NODE_MAJOR" -eq 18 ]; then
        log_info "✓ Node版本符合要求 (18.x)"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        log_warn "⚠ Node版本为$NODE_VERSION，建议使用18.x"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# 2. 检查npm完整性
check_npm_integrity() {
    log_info "检查npm完整性..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
    
    NPM_VERSION=$(npm --version)
    log "当前npm版本: $NPM_VERSION"
    
    # 检查npm缓存
    if npm cache verify &> /dev/null; then
        log_info "✓ npm缓存验证通过"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        log_warn "⚠ npm缓存可能存在问题"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # 检查npm registry可达性
    if npm ping &> /dev/null; then
        log_info "✓ npm registry可访问"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        log_warn "⚠ npm registry访问可能受限"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# 3. 检查关键依赖
check_dependencies() {
    log_info "检查关键依赖..."
    
    if [ ! -f "package.json" ]; then
        log_warn "⚠ 未找到package.json"
        WARNINGS=$((WARNINGS + 1))
        return 0
    fi
    
    # 检查node_modules是否存在
    if [ ! -d "node_modules" ]; then
        log_warn "⚠ node_modules目录不存在，需要运行npm install"
        WARNINGS=$((WARNINGS + 1))
    else
        log_info "✓ node_modules目录存在"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    fi
    
    # 检查关键依赖包
    local critical_packages=("express" "typescript" "jest")
    for pkg in "${critical_packages[@]}"; do
        if npm list "$pkg" &> /dev/null; then
            log_info "✓ $pkg 已安装"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
        else
            log_warn "⚠ $pkg 未安装"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
}

# 4. 检查环境变量
check_env_variables() {
    log_info "检查环境变量..."
    
    local required_vars=("NODE_ENV" "PATH")
    local optional_vars=("DATABASE_URL" "REDIS_URL" "API_KEY")
    
    # 检查必需变量
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "✗ 必需环境变量 $var 未设置"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
        else
            log_info "✓ $var 已设置"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
        fi
    done
    
    # 检查可选变量
    for var in "${optional_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_warn "⚠ 可选环境变量 $var 未设置"
            WARNINGS=$((WARNINGS + 1))
        else
            log_info "✓ $var 已设置"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
        fi
    done
}

# 5. 检查磁盘空间
check_disk_space() {
    log_info "检查磁盘空间..."
    
    # 获取可用空间（GB）
    AVAILABLE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    
    if [ "$AVAILABLE" -lt 1 ]; then
        log_error "✗ 磁盘空间不足: ${AVAILABLE}GB可用（建议至少1GB）"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    elif [ "$AVAILABLE" -lt 5 ]; then
        log_warn "⚠ 磁盘空间较低: ${AVAILABLE}GB可用"
        WARNINGS=$((WARNINGS + 1))
    else
        log_info "✓ 磁盘空间充足: ${AVAILABLE}GB可用"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    fi
}

# 6. 检查内存
check_memory() {
    log_info "检查内存..."
    
    # 获取可用内存（MB）
    if command -v free &> /dev/null; then
        AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
        
        if [ "$AVAILABLE_MEM" -lt 512 ]; then
            log_error "✗ 可用内存不足: ${AVAILABLE_MEM}MB"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
        elif [ "$AVAILABLE_MEM" -lt 1024 ]; then
            log_warn "⚠ 可用内存较低: ${AVAILABLE_MEM}MB"
            WARNINGS=$((WARNINGS + 1))
        else
            log_info "✓ 内存充足: ${AVAILABLE_MEM}MB可用"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
        fi
    else
        log_warn "⚠ 无法检查内存（free命令不可用）"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# 执行所有检查
main() {
    check_node_version
    check_npm_integrity
    check_dependencies
    check_env_variables
    check_disk_space
    check_memory
    
    # 输出总结
    echo ""
    echo "=========================================="
    echo "📊 检查总结"
    echo "=========================================="
    log_info "通过: $CHECKS_PASSED"
    log_warn "警告: $WARNINGS"
    log_error "失败: $CHECKS_FAILED"
    
    log "检查完成 - 通过:$CHECKS_PASSED 警告:$WARNINGS 失败:$CHECKS_FAILED"
    
    if [ $CHECKS_FAILED -gt 0 ]; then
        echo ""
        log_error "❌ 构建前检查失败，请修复上述错误后再试"
        echo "日志文件: $LOG_FILE"
        exit 1
    elif [ $WARNINGS -gt 0 ]; then
        echo ""
        log_warn "⚠️ 检查通过但存在警告"
        echo "日志文件: $LOG_FILE"
        exit 0
    else
        echo ""
        log_info "✅ 所有检查通过，可以开始构建"
        echo "日志文件: $LOG_FILE"
        exit 0
    fi
}

main "$@"
