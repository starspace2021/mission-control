#!/bin/bash
# ============================================
# 详细错误日志系统 (Error Logging System)
# Engineering Department - P0紧急修复
# ============================================

set -e

# 日志目录配置
LOG_BASE_DIR="/root/.openclaw/workspace/memory/logs/mission-control"
LOG_LEVEL="INFO"  # DEBUG, INFO, WARN, ERROR

# 确保日志目录存在
mkdir -p "$LOG_BASE_DIR"
mkdir -p "$LOG_BASE_DIR/builds"
mkdir -p "$LOG_BASE_DIR/errors"
mkdir -p "$LOG_BASE_DIR/analysis"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志级别数值
declare -A LOG_LEVELS=(
    ["DEBUG"]=0
    ["INFO"]=1
    ["WARN"]=2
    ["ERROR"]=3
)

# 当前构建日志文件
CURRENT_BUILD_LOG=""
CURRENT_ERROR_LOG=""

# 初始化日志系统
init_logging() {
    local build_id="${1:-$(date +%Y%m%d-%H%M%S)}"
    CURRENT_BUILD_LOG="$LOG_BASE_DIR/builds/build-${build_id}.log"
    CURRENT_ERROR_LOG="$LOG_BASE_DIR/errors/error-${build_id}.log"
    
    touch "$CURRENT_BUILD_LOG"
    touch "$CURRENT_ERROR_LOG"
    
    log_info "日志系统初始化完成"
    log_info "构建日志: $CURRENT_BUILD_LOG"
    log_info "错误日志: $CURRENT_ERROR_LOG"
}

# 获取当前时间戳
timestamp() {
    date '+%Y-%m-%d %H:%M:%S.%3N'
}

# 基础日志函数
_log() {
    local level="$1"
    local message="$2"
    local ts=$(timestamp)
    local log_entry="[$ts] [$level] $message"
    
    # 输出到控制台
    case "$level" in
        "DEBUG") echo -e "${BLUE}[DEBUG]${NC} $message" ;;
        "INFO")  echo -e "${GREEN}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
    esac
    
    # 写入构建日志
    if [ -n "$CURRENT_BUILD_LOG" ]; then
        echo "$log_entry" >> "$CURRENT_BUILD_LOG"
    fi
    
    # 错误单独记录
    if [ "$level" = "ERROR" ] && [ -n "$CURRENT_ERROR_LOG" ]; then
        echo "$log_entry" >> "$CURRENT_ERROR_LOG"
    fi
}

# 分级日志函数
log_debug() {
    if [ "${LOG_LEVELS[$LOG_LEVEL]}" -le "${LOG_LEVELS["DEBUG"]}" ]; then
        _log "DEBUG" "$1"
    fi
}

log_info() {
    if [ "${LOG_LEVELS[$LOG_LEVEL]}" -le "${LOG_LEVELS["INFO"]}" ]; then
        _log "INFO" "$1"
    fi
}

log_warn() {
    if [ "${LOG_LEVELS[$LOG_LEVEL]}" -le "${LOG_LEVELS["WARN"]}" ]; then
        _log "WARN" "$1"
    fi
}

log_error() {
    if [ "${LOG_LEVELS[$LOG_LEVEL]}" -le "${LOG_LEVELS["ERROR"]}" ]; then
        _log "ERROR" "$1"
    fi
}

# 记录命令执行
log_command() {
    local cmd="$1"
    local description="${2:-执行命令}"
    
    log_info "▶ $description: $cmd"
    
    local start_time=$(date +%s)
    
    # 执行命令并捕获输出
    if eval "$cmd" >> "$CURRENT_BUILD_LOG" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_info "✓ 命令成功完成 (耗时: ${duration}s)"
        return 0
    else
        local exit_code=$?
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_error "✗ 命令失败 (退出码: $exit_code, 耗时: ${duration}s)"
        return $exit_code
    fi
}

# 记录构建阶段
log_stage() {
    local stage="$1"
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  📦 $stage${NC}"
    echo -e "${CYAN}========================================${NC}"
    log_info "========== 阶段: $stage =========="
}

# 错误分析
analyze_errors() {
    local build_id="${1:-$(date +%Y%m%d-%H%M%S)}"
    local analysis_file="$LOG_BASE_DIR/analysis/analysis-${build_id}.md"
    
    log_info "开始错误分析..."
    
    cat > "$analysis_file" << EOF
# 构建错误分析报告

**分析时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**构建ID**: $build_id

## 错误摘要

EOF

    if [ -f "$CURRENT_ERROR_LOG" ] && [ -s "$CURRENT_ERROR_LOG" ]; then
        local error_count=$(wc -l < "$CURRENT_ERROR_LOG")
        echo "- 错误总数: $error_count" >> "$analysis_file"
        
        echo "" >> "$analysis_file"
        echo "## 详细错误" >> "$analysis_file"
        echo "" >> "$analysis_file"
        echo '```' >> "$analysis_file"
        cat "$CURRENT_ERROR_LOG" >> "$analysis_file"
        echo '```' >> "$analysis_file"
        
        # 错误模式分析
        echo "" >> "$analysis_file"
        echo "## 错误模式分析" >> "$analysis_file"
        echo "" >> "$analysis_file"
        
        if grep -q "EACCES\|permission denied" "$CURRENT_ERROR_LOG"; then
            echo "- 🔴 权限错误: 检测到文件权限问题" >> "$analysis_file"
        fi
        
        if grep -q "ENOENT\|No such file" "$CURRENT_ERROR_LOG"; then
            echo "- 🔴 文件缺失: 检测到文件或目录不存在" >> "$analysis_file"
        fi
        
        if grep -q "ECONNREFUSED\|ETIMEDOUT" "$CURRENT_ERROR_LOG"; then
            echo "- 🔴 网络错误: 检测到连接问题" >> "$analysis_file"
        fi
        
        if grep -q "SyntaxError\|ReferenceError\|TypeError" "$CURRENT_ERROR_LOG"; then
            echo "- 🔴 代码错误: 检测到JavaScript/TypeScript语法或运行时错误" >> "$analysis_file"
        fi
        
        log_warn "发现 $error_count 个错误，详见: $analysis_file"
    else
        echo "✅ 本次构建无错误记录" >> "$analysis_file"
        log_info "未发现错误"
    fi
    
    echo "" >> "$analysis_file"
    echo "## 完整构建日志" >> "$analysis_file"
    echo "" >> "$analysis_file"
    echo "- 构建日志: $CURRENT_BUILD_LOG" >> "$analysis_file"
    echo "- 错误日志: $CURRENT_ERROR_LOG" >> "$analysis_file"
    
    log_info "错误分析报告已生成: $analysis_file"
}

# 生成构建报告
generate_build_report() {
    local build_id="${1:-$(date +%Y%m%d-%H%M%S)}"
    local status="${2:-UNKNOWN}"
    local report_file="$LOG_BASE_DIR/build-report-${build_id}.md"
    
    cat > "$report_file" << EOF
# 构建报告

**构建ID**: $build_id  
**构建时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**构建状态**: $status

## 日志文件

- 构建日志: \`$CURRENT_BUILD_LOG\`
- 错误日志: \`$CURRENT_ERROR_LOG\`

## 系统信息

- Node版本: $(node --version 2>/dev/null || echo "N/A")
- npm版本: $(npm --version 2>/dev/null || echo "N/A")
- 操作系统: $(uname -a)
- 工作目录: $(pwd)

EOF

    log_info "构建报告已生成: $report_file"
}

# 清理旧日志
cleanup_old_logs() {
    local days="${1:-7}"
    log_info "清理${days}天前的旧日志..."
    
    find "$LOG_BASE_DIR" -name "*.log" -mtime +$days -delete 2>/dev/null || true
    find "$LOG_BASE_DIR" -name "*.md" -mtime +$days -delete 2>/dev/null || true
    
    log_info "旧日志清理完成"
}

# 显示帮助
show_help() {
    cat << EOF
用法: $(basename "$0") [选项]

选项:
    -i, --init <build_id>    初始化日志系统
    -s, --stage <name>       记录构建阶段
    -c, --command <cmd>      记录并执行命令
    -a, --analyze <build_id> 分析错误
    -r, --report <build_id>  生成构建报告
    -l, --cleanup [days]     清理旧日志 (默认7天)
    -h, --help               显示帮助

日志级别: DEBUG, INFO, WARN, ERROR
EOF
}

# 主函数
main() {
    case "${1:-}" in
        -i|--init)
            init_logging "${2:-}"
            ;;
        -s|--stage)
            log_stage "$2"
            ;;
        -c|--command)
            log_command "$2" "$3"
            ;;
        -a|--analyze)
            analyze_errors "${2:-}"
            ;;
        -r|--report)
            generate_build_report "${2:-}" "${3:-UNKNOWN}"
            ;;
        -l|--cleanup)
            cleanup_old_logs "${2:-7}"
            ;;
        -h|--help)
            show_help
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

# 如果直接运行此脚本
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
