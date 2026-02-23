#!/bin/bash
# ============================================
# 环境健康检查脚本 (Health Check)
# Engineering Department - P0紧急修复
# ============================================

set -e

# 配置
LOG_DIR="/root/.openclaw/workspace/memory/logs/mission-control"
REPORT_DIR="$LOG_DIR/health-reports"

# 阈值配置
DISK_WARNING=80      # 磁盘使用率警告阈值(%)
DISK_CRITICAL=90     # 磁盘使用率危险阈值(%)
MEMORY_WARNING=80    # 内存使用率警告阈值(%)
MEMORY_CRITICAL=90   # 内存使用率危险阈值(%)
CPU_WARNING=80       # CPU使用率警告阈值(%)
CPU_CRITICAL=95      # CPU使用率危险阈值(%)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 确保目录存在
mkdir -p "$LOG_DIR"
mkdir -p "$REPORT_DIR"

# 健康状态
HEALTH_STATUS="HEALTHY"
HEALTH_SCORE=100
WARNINGS=0
CRITICALS=0

# 日志函数
log() {
    local level="$1"
    local message="$2"
    local ts=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$ts] [$level] $message"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    HEALTH_STATUS="WARNING"
    WARNINGS=$((WARNINGS + 1))
    HEALTH_SCORE=$((HEALTH_SCORE - 5))
}

log_critical() {
    echo -e "${RED}[CRITICAL]${NC} $1"
    HEALTH_STATUS="CRITICAL"
    CRITICALS=$((CRITICALS + 1))
    HEALTH_SCORE=$((HEALTH_SCORE - 20))
}

log_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 检查磁盘空间
check_disk_space() {
    log_section "💾 磁盘空间检查"
    
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    local disk_available=$(df -h . | tail -1 | awk '{print $4}')
    local disk_total=$(df -h . | tail -1 | awk '{print $2}')
    local disk_used=$(df -h . | tail -1 | awk '{print $3}')
    
    log "磁盘总容量: $disk_total"
    log "已使用: $disk_used"
    log "可用: $disk_available"
    log "使用率: ${disk_usage}%"
    
    if [ "$disk_usage" -ge "$DISK_CRITICAL" ]; then
        log_critical "磁盘使用率过高: ${disk_usage}% (临界值: ${DISK_CRITICAL}%)"
    elif [ "$disk_usage" -ge "$DISK_WARNING" ]; then
        log_warn "磁盘使用率较高: ${disk_usage}% (警告值: ${DISK_WARNING}%)"
    else
        log_info "✓ 磁盘空间正常: ${disk_usage}%"
    fi
    
    # 检查所有挂载点
    echo ""
    echo "所有挂载点状态:"
    df -h | grep -E "^/dev/" | while read -r line; do
        local usage=$(echo "$line" | awk '{print $5}' | sed 's/%//')
        local mount=$(echo "$line" | awk '{print $6}')
        
        if [ "$usage" -ge "$DISK_CRITICAL" ]; then
            echo -e "${RED}  ✗ $mount: ${usage}%${NC}"
        elif [ "$usage" -ge "$DISK_WARNING" ]; then
            echo -e "${YELLOW}  ⚠ $mount: ${usage}%${NC}"
        else
            echo -e "${GREEN}  ✓ $mount: ${usage}%${NC}"
        fi
    done
}

# 检查内存
check_memory() {
    log_section "🧠 内存检查"
    
    if command -v free &> /dev/null; then
        local mem_info=$(free -m | grep "Mem:")
        local mem_total=$(echo "$mem_info" | awk '{print $2}')
        local mem_used=$(echo "$mem_info" | awk '{print $3}')
        local mem_free=$(echo "$mem_info" | awk '{print $4}')
        local mem_available=$(echo "$mem_info" | awk '{print $7}')
        local mem_usage=$((mem_used * 100 / mem_total))
        
        log "内存总量: ${mem_total}MB"
        log "已使用: ${mem_used}MB"
        log "可用: ${mem_available}MB"
        log "使用率: ${mem_usage}%"
        
        if [ "$mem_usage" -ge "$MEMORY_CRITICAL" ]; then
            log_critical "内存使用率过高: ${mem_usage}%"
        elif [ "$mem_usage" -ge "$MEMORY_WARNING" ]; then
            log_warn "内存使用率较高: ${mem_usage}%"
        else
            log_info "✓ 内存使用正常: ${mem_usage}%"
        fi
        
        # 检查Swap
        local swap_info=$(free -m | grep "Swap:")
        local swap_total=$(echo "$swap_info" | awk '{print $2}')
        
        if [ "$swap_total" -gt 0 ]; then
            local swap_used=$(echo "$swap_info" | awk '{print $3}')
            local swap_usage=$((swap_used * 100 / swap_total))
            
            if [ "$swap_usage" -ge 50 ]; then
                log_warn "Swap使用率较高: ${swap_usage}%"
            else
                log_info "✓ Swap使用正常: ${swap_usage}%"
            fi
        fi
    else
        log_warn "无法获取内存信息 (free命令不可用)"
    fi
}

# 检查CPU
check_cpu() {
    log_section "⚡ CPU检查"
    
    if command -v top &> /dev/null; then
        # 获取CPU使用率 (采样3秒)
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        cpu_usage=${cpu_usage%.*}  # 取整数部分
        
        log "当前CPU使用率: ${cpu_usage}%"
        
        if [ "$cpu_usage" -ge "$CPU_CRITICAL" ]; then
            log_critical "CPU使用率过高: ${cpu_usage}%"
        elif [ "$cpu_usage" -ge "$CPU_WARNING" ]; then
            log_warn "CPU使用率较高: ${cpu_usage}%"
        else
            log_info "✓ CPU使用正常: ${cpu_usage}%"
        fi
    else
        log_warn "无法获取CPU信息"
    fi
    
    # 检查负载
    if [ -f /proc/loadavg ]; then
        local load1=$(cat /proc/loadavg | awk '{print $1}')
        local load5=$(cat /proc/loadavg | awk '{print $2}')
        local load15=$(cat /proc/loadavg | awk '{print $3}')
        
        log "系统负载: 1min=$load1, 5min=$load5, 15min=$load15"
        
        # 获取CPU核心数
        local cpu_cores=$(nproc 2>/dev/null || echo "1")
        local load_threshold=$(echo "$cpu_cores * 0.8" | bc -l 2>/dev/null || echo "$cpu_cores")
        
        if (( $(echo "$load1 > $cpu_cores" | bc -l 2>/dev/null || echo "0") )); then
            log_warn "系统负载较高: $load1 (核心数: $cpu_cores)"
        fi
    fi
}

# 检查进程
check_processes() {
    log_section "🔧 进程检查"
    
    local process_count=$(ps aux | wc -l)
    log "当前进程数: $process_count"
    
    # 检查僵尸进程
    local zombie_count=$(ps aux | awk '{if ($8 == "Z") print}' | wc -l)
    if [ "$zombie_count" -gt 0 ]; then
        log_warn "发现 $zombie_count 个僵尸进程"
    else
        log_info "✓ 无僵尸进程"
    fi
    
    # 检查Node进程
    local node_count=$(pgrep -c node 2>/dev/null || echo "0")
    log "Node进程数: $node_count"
}

# 检查网络
check_network() {
    log_section "🌐 网络检查"
    
    # 检查网络连接
    if ping -c 1 -W 3 8.8.8.8 &> /dev/null; then
        log_info "✓ 外网连接正常"
    else
        log_warn "外网连接可能存在问题"
    fi
    
    # 检查DNS
    if nslookup google.com &> /dev/null; then
        log_info "✓ DNS解析正常"
    else
        log_warn "DNS解析可能存在问题"
    fi
    
    # 检查端口监听
    local listening_ports=$(netstat -tlnp 2>/dev/null | grep LISTEN | wc -l || ss -tlnp 2>/dev/null | grep LISTEN | wc -l || echo "0")
    log "监听端口数: $listening_ports"
}

# 检查服务状态
check_services() {
    log_section "🔌 服务检查"
    
    # 检查关键服务
    local services=("ssh" "cron")
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log_info "✓ $service 服务运行中"
        else
            log_warn "⚠ $service 服务未运行"
        fi
    done
}

# 检查日志
check_logs() {
    log_section "📝 日志检查"
    
    # 检查日志目录大小
    if [ -d "$LOG_DIR" ]; then
        local log_size=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)
        log "日志目录大小: $log_size"
        
        local log_size_mb=$(du -sm "$LOG_DIR" 2>/dev/null | cut -f1)
        if [ "$log_size_mb" -gt 1024 ]; then
            log_warn "日志目录较大: ${log_size_mb}MB，建议清理"
        fi
    fi
    
    # 检查最近的错误
    if [ -f "$LOG_DIR/errors.log" ]; then
        local recent_errors=$(tail -100 "$LOG_DIR/errors.log" 2>/dev/null | grep "$(date +%Y-%m-%d)" | wc -l)
        if [ "$recent_errors" -gt 0 ]; then
            log_warn "今日有 $recent_errors 条错误日志"
        else
            log_info "✓ 今日无错误日志"
        fi
    fi
}

# 生成健康报告
generate_report() {
    local report_id=$(date +%Y%m%d-%H%M%S)
    local report_file="$REPORT_DIR/health-report-${report_id}.md"
    
    log_section "📊 生成健康报告"
    
    # 确保分数不低于0
    if [ "$HEALTH_SCORE" -lt 0 ]; then
        HEALTH_SCORE=0
    fi
    
    cat > "$report_file" << EOF
# 环境健康检查报告

**检查时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**报告ID**: $report_id  
**健康状态**: $HEALTH_STATUS  
**健康分数**: $HEALTH_SCORE/100

## 检查摘要

| 项目 | 状态 | 数量 |
|------|------|------|
| 严重问题 | 🔴 | $CRITICALS |
| 警告 | 🟡 | $WARNINGS |

## 系统信息

- **主机名**: $(hostname)
- **操作系统**: $(uname -o)
- **内核版本**: $(uname -r)
- **架构**: $(uname -m)
- **运行时间**: $(uptime -p 2>/dev/null || uptime | awk -F',' '{print $1}')

## 资源使用

### 磁盘空间
\`\`\`
$(df -h)
\`\`\`

### 内存使用
\`\`\`
$(free -h 2>/dev/null || echo "无法获取内存信息")
\`\`\`

### 系统负载
\`\`\`
$(uptime)
\`\`\`

## 建议操作

EOF

    if [ "$CRITICALS" -gt 0 ]; then
        echo "- ⚠️ 存在严重问题，需要立即处理" >> "$report_file"
    fi
    
    if [ "$WARNINGS" -gt 0 ]; then
        echo "- 存在警告项，建议检查并优化" >> "$report_file"
    fi
    
    if [ "$CRITICALS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
        echo "- ✅ 系统健康状况良好" >> "$report_file"
    fi
    
    log_info "健康报告已生成: $report_file"
    echo "$report_file"
}

# 显示帮助
show_help() {
    cat << EOF
用法: $(basename "$0") [选项]

选项:
    -a, --all        执行所有检查 (默认)
    -d, --disk       仅检查磁盘
    -m, --memory     仅检查内存
    -c, --cpu        仅检查CPU
    -p, --process    仅检查进程
    -n, --network    仅检查网络
    -s, --service    仅检查服务
    -r, --report     生成报告
    -h, --help       显示帮助

阈值配置:
    磁盘警告: ${DISK_WARNING}%
    磁盘危险: ${DISK_CRITICAL}%
    内存警告: ${MEMORY_WARNING}%
    内存危险: ${MEMORY_CRITICAL}%
EOF
}

# 主函数
main() {
    case "${1:---all}" in
        -a|--all)
            check_disk_space
            check_memory
            check_cpu
            check_processes
            check_network
            check_services
            check_logs
            generate_report
            
            echo ""
            echo "========================================"
            echo -e "健康状态: ${HEALTH_STATUS}"
            echo -e "健康分数: ${HEALTH_SCORE}/100"
            echo "========================================"
            ;;
        -d|--disk)
            check_disk_space
            ;;
        -m|--memory)
            check_memory
            ;;
        -c|--cpu)
            check_cpu
            ;;
        -p|--process)
            check_processes
            ;;
        -n|--network)
            check_network
            ;;
        -s|--service)
            check_services
            ;;
        -r|--report)
            generate_report
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

main "$@"
