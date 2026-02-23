#!/bin/bash
# ============================================
# 自动回滚机制 (Auto Rollback System)
# Engineering Department - P0紧急修复
# ============================================

set -e

# 配置
BACKUP_DIR="/root/.openclaw/workspace/memory/backups/mission-control"
DEPLOY_DIR="/root/.openclaw/workspace/mission-control"
LOG_DIR="/root/.openclaw/workspace/memory/logs/mission-control"
MAX_BACKUPS=10

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# 确保目录存在
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# 日志函数
log() {
    local level="$1"
    local message="$2"
    local ts=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$ts] [$level] $message"
    echo "[$ts] [$level] $message" >> "$LOG_DIR/rollback.log"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log "INFO" "$1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    log "WARN" "$1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR" "$1"
}

log_stage() {
    echo -e "${CYAN}▶ $1${NC}"
    log "INFO" "=== $1 ==="
}

# 创建备份
create_backup() {
    local backup_id="${1:-$(date +%Y%m%d-%H%M%S)}"
    local backup_path="$BACKUP_DIR/backup-${backup_id}.tar.gz"
    
    log_stage "创建备份: $backup_id"
    
    if [ ! -d "$DEPLOY_DIR" ]; then
        log_error "部署目录不存在: $DEPLOY_DIR"
        return 1
    fi
    
    # 创建备份
    tar -czf "$backup_path" -C "$(dirname "$DEPLOY_DIR")" "$(basename "$DEPLOY_DIR")" 2>/dev/null || {
        log_error "备份创建失败"
        return 1
    }
    
    # 记录备份信息
    echo "{\"id\": \"$backup_id\", \"path\": \"$backup_path\", \"time\": \"$(date -Iseconds)\"}" > "$BACKUP_DIR/backup-${backup_id}.json"
    
    log_info "✓ 备份创建成功: $backup_path"
    
    # 清理旧备份
    cleanup_old_backups
    
    echo "$backup_id"
}

# 清理旧备份
cleanup_old_backups() {
    local backup_count=$(ls -1 "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        log_info "清理旧备份 (保留最近 $MAX_BACKUPS 个)..."
        ls -1t "$BACKUP_DIR"/backup-*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
        ls -1t "$BACKUP_DIR"/backup-*.json | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
    fi
}

# 列出可用备份
list_backups() {
    log_stage "可用备份列表"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR"/*.tar.gz 2>/dev/null)" ]; then
        log_warn "没有可用的备份"
        return 1
    fi
    
    echo ""
    printf "%-20s %-30s %-15s\n" "备份ID" "时间" "大小"
    echo "--------------------------------------------------------------------------------"
    
    for backup in $(ls -1t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null); do
        local filename=$(basename "$backup")
        local backup_id=$(echo "$filename" | sed 's/backup-//' | sed 's/.tar.gz//')
        local backup_time=$(stat -c %y "$backup" 2>/dev/null | cut -d'.' -f1)
        local backup_size=$(du -h "$backup" 2>/dev/null | cut -f1)
        
        printf "%-20s %-30s %-15s\n" "$backup_id" "$backup_time" "$backup_size"
    done
    echo ""
}

# 执行回滚
perform_rollback() {
    local backup_id="$1"
    
    if [ -z "$backup_id" ]; then
        log_error "请指定备份ID"
        list_backups
        return 1
    fi
    
    local backup_path="$BACKUP_DIR/backup-${backup_id}.tar.gz"
    
    if [ ! -f "$backup_path" ]; then
        log_error "备份不存在: $backup_path"
        return 1
    fi
    
    log_stage "执行回滚: $backup_id"
    
    # 创建当前状态的紧急备份
    local emergency_backup_id="pre-rollback-$(date +%Y%m%d-%H%M%S)"
    log_info "创建紧急备份: $emergency_backup_id"
    tar -czf "$BACKUP_DIR/backup-${emergency_backup_id}.tar.gz" -C "$(dirname "$DEPLOY_DIR")" "$(basename "$DEPLOY_DIR")" 2>/dev/null || true
    
    # 停止服务（如果有）
    log_info "停止相关服务..."
    if [ -f "$DEPLOY_DIR/package.json" ]; then
        (cd "$DEPLOY_DIR" && npm stop 2>/dev/null) || true
    fi
    
    # 执行回滚
    log_info "恢复备份..."
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
    
    if tar -xzf "$backup_path" -C "$(dirname "$DEPLOY_DIR")"; then
        log_info "✓ 回滚成功"
        
        # 重启服务
        log_info "尝试重启服务..."
        if [ -f "$DEPLOY_DIR/package.json" ]; then
            (cd "$DEPLOY_DIR" && npm start 2>/dev/null &) || true
        fi
        
        # 发送通知
        send_notification "ROLLBACK_SUCCESS" "系统已回滚到备份: $backup_id"
        
        # 记录回滚事件
        echo "{\"type\": \"rollback\", \"backup_id\": \"$backup_id\", \"time\": \"$(date -Iseconds)\", \"status\": \"success\"}" >> "$LOG_DIR/rollback-events.jsonl"
        
        return 0
    else
        log_error "✗ 回滚失败"
        
        # 尝试恢复紧急备份
        log_warn "尝试恢复紧急备份..."
        if [ -f "$BACKUP_DIR/backup-${emergency_backup_id}.tar.gz" ]; then
            tar -xzf "$BACKUP_DIR/backup-${emergency_backup_id}.tar.gz" -C "$(dirname "$DEPLOY_DIR")"
            log_info "已恢复到回滚前的状态"
        fi
        
        send_notification "ROLLBACK_FAILED" "回滚到备份 $backup_id 失败"
        return 1
    fi
}

# 构建失败自动回滚
auto_rollback_on_failure() {
    local build_exit_code="$1"
    local backup_id="$2"
    
    if [ "$build_exit_code" -ne 0 ]; then
        log_error "构建失败 (退出码: $build_exit_code)，启动自动回滚..."
        
        if [ -n "$backup_id" ]; then
            perform_rollback "$backup_id"
            return $?
        else
            # 使用最近的备份
            local latest_backup=$(ls -1t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | head -1)
            if [ -n "$latest_backup" ]; then
                local latest_id=$(basename "$latest_backup" | sed 's/backup-//' | sed 's/.tar.gz//')
                perform_rollback "$latest_id"
                return $?
            else
                log_error "没有可用的备份进行回滚"
                return 1
            fi
        fi
    else
        log_info "构建成功，无需回滚"
        return 0
    fi
}

# 发送通知
send_notification() {
    local event="$1"
    local message="$2"
    
    log_info "发送通知: [$event] $message"
    
    # 记录到通知日志
    echo "{\"event\": \"$event\", \"message\": \"$message\", \"time\": \"$(date -Iseconds)\"}" >> "$LOG_DIR/notifications.jsonl"
    
    # 这里可以集成其他通知渠道
    # 例如: 飞书、钉钉、邮件等
    
    # 控制台告警
    echo -e "${RED}🚨 ALERT [$event]: $message${NC}"
}

# 监控构建并自动回滚
monitor_build() {
    local backup_id="$1"
    shift
    
    log_stage "监控构建过程"
    log_info "构建前备份ID: $backup_id"
    log_info "执行命令: $*"
    
    # 执行构建命令
    if "$@"; then
        log_info "✓ 构建成功"
        return 0
    else
        local exit_code=$?
        log_error "✗ 构建失败 (退出码: $exit_code)"
        auto_rollback_on_failure "$exit_code" "$backup_id"
        return $?
    fi
}

# 显示帮助
show_help() {
    cat << EOF
用法: $(basename "$0") [命令] [选项]

命令:
    backup [id]              创建备份
    list                     列出可用备份
    rollback <id>            回滚到指定备份
    monitor <cmd...>         监控构建并自动回滚
    auto <exit_code> [id]    根据退出码自动回滚
    notify <event> <msg>     发送通知

示例:
    $(basename "$0") backup                    # 创建备份
    $(basename "$0") rollback 20240223-120000  # 回滚到指定备份
    $(basename "$0") monitor npm run build     # 监控构建
EOF
}

# 主函数
main() {
    case "${1:-}" in
        backup)
            create_backup "${2:-}"
            ;;
        list)
            list_backups
            ;;
        rollback)
            perform_rollback "$2"
            ;;
        auto)
            auto_rollback_on_failure "$2" "$3"
            ;;
        monitor)
            shift
            local backup_id=$(create_backup "pre-build-$(date +%Y%m%d-%H%M%S)")
            monitor_build "$backup_id" "$@"
            ;;
        notify)
            send_notification "$2" "$3"
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

main "$@"
