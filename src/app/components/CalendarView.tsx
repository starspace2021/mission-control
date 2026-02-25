"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday as isDateToday } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Calendar as CalendarIcon,
  Repeat,
  Zap,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  MapPin,
  Users,
  Tag,
  X,
  Bell,
  ArrowRight,
  CalendarDays,
  Clock4,
  Flame
} from "lucide-react";

// ========== 类型定义 ==========
interface Event {
  _id: string;
  title: string;
  startTime: number;
  endTime?: number;
  type: string;
  description?: string;
  status?: string;
  location?: string;
  attendees?: string[];
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
}

type ViewMode = "day" | "week" | "month" | "timeline";

// ========== 模拟数据 ==========
const MOCK_EVENTS: Event[] = [
  {
    _id: "1",
    title: "非洲情报简报",
    startTime: new Date().setHours(20, 0, 0, 0),
    endTime: new Date().setHours(20, 30, 0, 0),
    type: "cron",
    description: "自动收集并生成非洲涉华情报简报",
    status: "pending",
    priority: 'high',
    tags: ["情报", "自动化"],
  },
  {
    _id: "2",
    title: "Polymarket 盘中简报",
    startTime: new Date().setHours(20, 0, 0, 0),
    endTime: new Date().setHours(20, 15, 0, 0),
    type: "cron",
    description: "Polymarket 市场数据监控",
    status: "pending",
    priority: 'medium',
    tags: ["市场", "数据"],
  },
  {
    _id: "3",
    title: "美国对华政策晚间简报",
    startTime: new Date().setHours(20, 0, 0, 0),
    endTime: new Date().setHours(20, 45, 0, 0),
    type: "cron",
    description: "晚间对华政策新闻汇总",
    status: "pending",
    priority: 'high',
    tags: ["政策", "新闻"],
  },
  {
    _id: "4",
    title: "美国对华政策夜间简报",
    startTime: new Date(Date.now() + 86400000).setHours(0, 0, 0, 0),
    endTime: new Date(Date.now() + 86400000).setHours(0, 30, 0, 0),
    type: "cron",
    description: "夜间对华政策监控",
    status: "scheduled",
    priority: 'medium',
  },
  {
    _id: "5",
    title: "美国对华政策日报",
    startTime: new Date(Date.now() + 86400000).setHours(7, 0, 0, 0),
    endTime: new Date(Date.now() + 86400000).setHours(7, 30, 0, 0),
    type: "cron",
    description: "早间对华政策日报",
    status: "scheduled",
    priority: 'high',
    tags: ["日报", "政策"],
  },
  {
    _id: "6",
    title: "QQ邮箱清理",
    startTime: new Date(Date.now() + 172800000).setHours(6, 16, 0, 0),
    endTime: new Date(Date.now() + 172800000).setHours(6, 20, 0, 0),
    type: "cron",
    description: "自动清理QQ邮箱",
    status: "scheduled",
    priority: 'low',
  },
  {
    _id: "7",
    title: "UI自动迭代任务",
    startTime: new Date().setHours(7, 24, 0, 0),
    endTime: new Date().setHours(8, 0, 0, 0),
    type: "maintenance",
    description: "Mission Control UI 自动优化迭代",
    status: "running",
    priority: 'high',
    tags: ["UI", "开发"],
  },
  {
    _id: "8",
    title: "系统维护",
    startTime: new Date(Date.now() + 259200000).setHours(2, 0, 0, 0),
    endTime: new Date(Date.now() + 259200000).setHours(4, 0, 0, 0),
    type: "maintenance",
    description: "定期系统维护",
    status: "scheduled",
    priority: 'medium',
    tags: ["维护"],
  },
];

// ========== 配置 ==========
const TYPE_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ElementType; gradient: string }> = {
  cron: { 
    color: "#22C55E", 
    bg: "rgba(34, 197, 94, 0.1)",
    label: "定时任务", 
    icon: Repeat,
    gradient: "from-[#22C55E] to-[#16a34a]"
  },
  onetime: { 
    color: "#4A7BFF", 
    bg: "rgba(74, 123, 255, 0.1)",
    label: "单次任务", 
    icon: Zap,
    gradient: "from-[#4A7BFF] to-[#60a5fa]"
  },
  recurring: { 
    color: "#8B5CF6", 
    bg: "rgba(139, 92, 246, 0.1)",
    label: "循环任务", 
    icon: Clock,
    gradient: "from-[#8B5CF6] to-[#a78bfa]"
  },
  maintenance: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    label: "系统维护",
    icon: CheckCircle2,
    gradient: "from-[#F59E0B] to-[#fbbf24]"
  },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  high: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", label: "高优先级", icon: AlertCircle },
  medium: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", label: "中优先级", icon: Clock3 },
  low: { color: "#4A7BFF", bg: "rgba(74, 123, 255, 0.1)", label: "低优先级", icon: CheckCircle2 },
};

const WEEK_DAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// ========== 子组件 ==========

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.onetime;
  const Icon = config.icon;
  const priority = event.priority ? PRIORITY_CONFIG[event.priority] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="event-card group"
      style={{ '--event-color': config.color } as React.CSSProperties}
      whileHover={{ 
        scale: 1.02, 
        x: 4,
        boxShadow: `0 4px 20px ${config.color}30`,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* 左侧颜色条 */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(to bottom, ${config.color}, ${config.color}60)` }}
      />
      
      <div className="flex items-center gap-1.5 pl-2">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
        >
          <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
        </motion.div>
        <span className="font-medium truncate text-xs" style={{ color: config.color }}>
          {event.title}
        </span>
      </div>
      
      <div className="text-white/40 mt-0.5 font-mono text-[10px] flex items-center gap-1 pl-2">
        <Clock className="w-2.5 h-2.5" />
        {format(new Date(event.startTime), "HH:mm")}
      </div>

      {priority && (
        <motion.div 
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: priority.color }}
          animate={{ 
            boxShadow: [`0 0 0px ${priority.color}`, `0 0 8px ${priority.color}`, `0 0 0px ${priority.color}`]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

function EventModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.onetime;
  const Icon = config.icon;
  const priority = event.priority ? PRIORITY_CONFIG[event.priority] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-6 border-b border-white/5 relative overflow-hidden">
          <div 
            className="absolute top-0 right-0 w-48 h-48 opacity-10"
            style={{ background: `radial-gradient(circle at top right, ${config.color}, transparent)` }}
          />
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: config.bg }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Icon className="w-7 h-7" style={{ color: config.color }} />
              </motion.div>
              <div>
                <h2 className="text-xl font-semibold text-white">{event.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <motion.span 
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: config.bg, color: config.color }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {config.label}
                  </motion.span>
                  {priority && (
                    <motion.span 
                      className="text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1"
                      style={{ backgroundColor: priority.bg, color: priority.color }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <priority.icon className="w-3 h-3" />
                      {priority.label}
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-[#71717A]" />
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <motion.div 
            className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5 hover:border-white/10 transition-colors"
            whileHover={{ scale: 1.01 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-sm text-[#71717A]">时间</div>
              <div className="text-white font-medium">
                {format(new Date(event.startTime), "yyyy年MM月dd日 HH:mm")}
                {event.endTime && ` - ${format(new Date(event.endTime), "HH:mm")}`}
              </div>
            </div>
          </motion.div>

          {event.location && (
            <motion.div 
              className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5 hover:border-white/10 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/5 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <div className="text-sm text-[#71717A]">地点</div>
                <div className="text-white font-medium">{event.location}</div>
              </div>
            </motion.div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <motion.div 
              className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5 hover:border-white/10 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#10b981]" />
              </div>
              <div>
                <div className="text-sm text-[#71717A]">参与者</div>
                <div className="flex items-center gap-2">
                  {event.attendees.map((attendee, i) => (
                    <span key={i} className="text-white font-medium">{attendee}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {event.tags && event.tags.length > 0 && (
            <motion.div 
              className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5"
              whileHover={{ scale: 1.01 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 flex items-center justify-center">
                <Tag className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#71717A]">标签</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {event.tags.map((tag) => (
                    <motion.span 
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-[#A1A1AA] hover:bg-white/10 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {event.description && (
            <div className="pt-4 border-t border-white/5">
              <div className="text-sm text-[#71717A] mb-2">描述</div>
              <p className="text-white/80 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex gap-3">
          <motion.button 
            className="btn btn-primary flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            编辑
          </motion.button>
          <motion.button 
            className="btn btn-secondary"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            关闭
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CalendarGridView({
  viewDates,
  viewMode,
  currentDate,
  getEventsForDate,
  onSelectEvent,
}: {
  viewDates: Date[];
  viewMode: ViewMode;
  currentDate: Date;
  getEventsForDate: (date: Date) => Event[];
  onSelectEvent: (event: Event) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card overflow-hidden"
    >
      {/* 星期标题 */}
      <div className={`grid ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"} border-b border-white/5`}>
        {(viewMode === "day" ? [WEEK_DAYS[new Date().getDay()]] : WEEK_DAYS).map((day, index) => (
          <motion.div 
            key={day} 
            className="text-center py-3 text-xs font-medium text-[#71717A] border-r border-white/5 last:border-r-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {day}
          </motion.div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className={`grid ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"} auto-rows-fr`}>
        {viewDates.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isDateToday(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          
          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`min-h-[80px] p-2 border-r border-b border-white/5 last:border-r-0 
                         ${!isCurrentMonth && viewMode === "month" ? "bg-white/[0.02]" : ""}
                         ${isToday ? "calendar-cell today" : "calendar-cell"}
                         hover:bg-white/[0.03] transition-colors cursor-pointer group`}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              {/* 日期头部 */}
              <div className={`flex items-center gap-1.5 mb-2 ${isToday ? "text-[#4A7BFF]" : "text-white/70"}`}>
                <motion.span 
                  className={`text-base font-bold ${isToday ? 'text-[#4A7BFF]' : ''}`}
                  whileHover={{ scale: 1.1 }}
                >
                  {format(date, "d")}
                </motion.span>
                {isToday && (
                  <motion.span 
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4A7BFF] text-white font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    今天
                  </motion.span>
                )}
                {dayEvents.length > 0 && (
                  <motion.span 
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4A7BFF]/15 text-[#4A7BFF] font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                  >
                    {dayEvents.length}
                  </motion.span>
                )}
              </div>

              {/* 事件列表 */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    onClick={() => onSelectEvent(event)}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <motion.div 
                    className="text-[10px] text-[#71717A] text-center py-0.5 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    +{dayEvents.length - 3}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function TimelineView({
  events,
  currentDate,
  onSelectEvent
}: {
  events: Event[];
  currentDate: Date;
  onSelectEvent: (event: Event) => void;
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEvents = useMemo(() => 
    events
      .filter(e => {
        const eventDate = new Date(e.startTime);
        const diffDays = Math.floor((eventDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 7;
      })
      .sort((a, b) => a.startTime - b.startTime),
    [events, weekStart]
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card overflow-hidden"
    >
      <div className="flex">
        {/* 时间列 */}
        <div className="w-20 border-r border-white/5 flex-shrink-0 bg-white/[0.02]">
          <div className="h-12 border-b border-white/5"></div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b border-white/5 flex items-start justify-center pt-1 relative">
              <span className={`text-xs ${hour === currentHour ? 'text-[#4A7BFF] font-medium' : 'text-[#52525B]'}`}>
                {`${hour.toString().padStart(2, '0')}:00`}
              </span>
            </div>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const date = addDays(weekStart, dayIndex);
              const isToday = isDateToday(date);
              const dayEvents = weekEvents.filter(e => 
                isSameDay(new Date(e.startTime), date)
              );

              return (
                <div key={dayIndex} className="w-40 flex-shrink-0">
                  {/* 日期头部 */}
                  <div className={`h-12 border-b border-r border-white/5 flex flex-col items-center justify-center ${
                    isToday ? 'bg-[#4A7BFF]/10' : ''
                  }`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-[#4A7BFF]' : 'text-white'}`}>
                      {WEEK_DAYS[dayIndex]}
                    </span>
                    <span className="text-xs text-[#71717A]">{format(date, "MM/dd")}</span>
                  </div>

                  {/* 时间格子 */}
                  <div className="relative">
                    {hours.map(hour => (
                      <div key={hour} className="h-16 border-b border-r border-white/5 relative">
                        {isToday && hour === currentHour && (
                          <motion.div
                            className="absolute inset-0 bg-[#4A7BFF]/5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                      </div>
                    ))}

                    {/* 当前时间指示器 */}
                    {isToday && (
                      <motion.div
                        className="absolute left-0 right-0 z-20 flex items-center"
                        style={{ 
                          top: `${(currentHour * 60 + currentMinute) / 60 * 64}px` 
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div 
                          className="absolute -left-1.5 w-3 h-3 rounded-full bg-[#EF4444] border-2 border-[#0a0a0f]"
                          animate={{ 
                            boxShadow: [
                              '0 0 0px #EF4444',
                              '0 0 10px #EF4444',
                              '0 0 0px #EF4444'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-[#EF4444] via-[#EF4444]/50 to-transparent" />
                        <div className="absolute right-2 text-[10px] text-[#EF4444] font-medium bg-[#0a0a0f] px-1">
                          {format(new Date(), "HH:mm")}
                        </div>
                      </motion.div>
                    )}

                    {/* 事件 */}
                    {dayEvents.map((event) => {
                      const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.onetime;
                      const Icon = config.icon;
                      const eventDate = new Date(event.startTime);
                      const hour = eventDate.getHours();
                      const minute = eventDate.getMinutes();
                      const top = hour * 64 + (minute / 60) * 64;
                      const duration = event.endTime 
                        ? (event.endTime - event.startTime) / (1000 * 60) 
                        : 60;
                      const height = Math.max((duration / 60) * 64 - 4, 36);

                      return (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          onClick={() => onSelectEvent(event)}
                          className="absolute left-1 right-1 p-2 rounded-lg cursor-pointer overflow-hidden hover:opacity-90 transition-all group"
                          style={{
                            top,
                            height,
                            backgroundColor: config.bg,
                            borderLeft: `3px solid ${config.color}`,
                          }}
                          whileHover={{ 
                            scale: 1.02, 
                            x: 2,
                            boxShadow: `0 4px 20px ${config.color}30`
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
                            <span className="font-medium truncate text-xs" style={{ color: config.color }}>
                              {event.title}
                            </span>
                          </div>
                          <div className="text-white/60 mt-0.5 text-xs">
                            {format(eventDate, "HH:mm")}
                            {event.endTime && ` - ${format(new Date(event.endTime), "HH:mm")}`}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ========== 主组件 ==========
export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const navigateDate = (direction: "prev" | "next") => {
    const multiplier = direction === "prev" ? -1 : 1;
    if (viewMode === "week" || viewMode === "timeline") {
      setCurrentDate(addDays(currentDate, 7 * multiplier));
    } else if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 1 * multiplier));
    } else {
      setCurrentDate(addDays(currentDate, 30 * multiplier));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getViewDates = () => {
    if (viewMode === "week" || viewMode === "timeline") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    } else if (viewMode === "day") {
      return [currentDate];
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
  };

  const viewDates = getViewDates();

  const getEventsForDate = (date: Date) => {
    return MOCK_EVENTS.filter((e) => 
      isSameDay(new Date(e.startTime), date) &&
      (searchQuery === "" || e.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedType === "all" || e.type === selectedType)
    );
  };

  const upcomingEvents = useMemo(() => 
    MOCK_EVENTS
      .filter(e => new Date(e.startTime) >= new Date())
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 5),
    []
  );

  const stats = useMemo(() => ({
    total: MOCK_EVENTS.length,
    today: MOCK_EVENTS.filter(e => isDateToday(new Date(e.startTime))).length,
    pending: MOCK_EVENTS.filter(e => e.status === 'pending').length,
    scheduled: MOCK_EVENTS.filter(e => e.status === 'scheduled').length,
  }), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "今日事件", value: stats.today, icon: CalendarIcon, color: "#4A7BFF", bg: "from-[#4A7BFF]/20 to-[#4A7BFF]/5" },
          { label: "待执行", value: stats.pending, icon: Clock3, color: "#F59E0B", bg: "from-[#F59E0B]/20 to-[#F59E0B]/5" },
          { label: "已计划", value: stats.scheduled, icon: CheckCircle2, color: "#22C55E", bg: "from-[#22C55E]/20 to-[#22C55E]/5" },
          { label: "总计", value: stats.total, icon: CalendarDays, color: "#8B5CF6", bg: "from-[#8B5CF6]/20 to-[#8B5CF6]/5" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="card card-interactive p-4 flex items-center gap-3"
          >
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.bg}`}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div className="flex-1">
              <motion.div 
                className="text-2xl font-bold"
                style={{ color: stat.color }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: i * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-[#71717A]">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 头部控制栏 */}
      <div className="filter-container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* 视图切换 */}
            <div className="flex gap-1 bg-[#1A1A24] rounded-xl p-1 border border-white/10">
              {(["day", "week", "month", "timeline"] as ViewMode[]).map((mode) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode 
                      ? "bg-[#4A7BFF] text-white shadow-lg shadow-[#4A7BFF]/30" 
                      : "text-[#71717A] hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {mode === "day" ? "日" : mode === "week" ? "周" : mode === "month" ? "月" : "时间线"}
                </motion.button>
              ))}
            </div>

            {/* 导航按钮 */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigateDate("prev")}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5 text-[#71717A]" />
              </motion.button>
              <motion.button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-[#4A7BFF] hover:bg-[#4A7BFF]/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                今天
              </motion.button>
              <motion.button
                onClick={() => navigateDate("next")}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5 text-[#71717A]" />
              </motion.button>
            </div>
            
            <div className="text-xl font-semibold text-white hidden sm:block">
              {format(currentDate, "yyyy年MM月", { locale: zhCN })}
            </div>
          </div>

          {/* 筛选和搜索 */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] group-focus-within:text-[#4A7BFF] transition-colors" />
              <input
                type="text"
                placeholder="搜索事件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 w-48 focus:ring-2 focus:ring-[#4A7BFF]/20"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input w-auto cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="all">全部类型</option>
              <option value="cron">定时任务</option>
              <option value="onetime">单次任务</option>
              <option value="recurring">循环任务</option>
              <option value="maintenance">系统维护</option>
            </select>
            
            <motion.button 
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              新建
            </motion.button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {viewMode === "timeline" ? (
              <TimelineView 
                key="timeline"
                events={MOCK_EVENTS}
                currentDate={currentDate}
                onSelectEvent={setSelectedEvent}
              />
            ) : (
              <CalendarGridView
                key="calendar"
                viewDates={viewDates}
                viewMode={viewMode}
                currentDate={currentDate}
                getEventsForDate={getEventsForDate}
                onSelectEvent={setSelectedEvent}
              />
            )}
          </AnimatePresence>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* 即将到来 */}
          <motion.div 
            className="card p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A7BFF]/20 to-[#4A7BFF]/5 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#4A7BFF]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">即将到来</h3>
                <p className="text-xs text-[#71717A]">未来5个事件</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {upcomingEvents.map((event, index) => {
                const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.onetime;
                const Icon = config.icon;
                const isToday = isDateToday(new Date(event.startTime));
                const priority = event.priority ? PRIORITY_CONFIG[event.priority] : null;
                
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all border border-transparent hover:border-white/5 group"
                    whileHover={{ x: 4, scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.bg }}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white truncate group-hover:text-[#4A7BFF] transition-colors">
                            {event.title}
                          </h4>
                          {priority && (
                            <motion.div 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: priority.color }}
                              animate={{ 
                                boxShadow: [
                                  `0 0 0px ${priority.color}`,
                                  `0 0 8px ${priority.color}`,
                                  `0 0 0px ${priority.color}`
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <p className="text-xs text-[#71717A] mt-0.5 line-clamp-1">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <motion.span 
                            className="text-[10px] px-2 py-0.5 rounded font-medium"
                            style={{ backgroundColor: config.bg, color: config.color }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {config.label}
                          </motion.span>
                          
                          <span className={`text-xs ${isToday ? 'text-[#4A7BFF] font-medium' : 'text-[#71717A]'}`}>
                            {isToday ? '今天' : format(new Date(event.startTime), "MM/dd HH:mm")}
                          </span>
                        </div>

                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.tags.map(tag => (
                              <span 
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#71717A]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 快捷操作 */}
          <motion.div 
            className="card p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-semibold text-white mb-4">快捷操作</h3>
            <div className="space-y-2">
              {[
                { label: "新建定时任务", icon: Repeat, color: "#22C55E" },
                { label: "新建单次任务", icon: Zap, color: "#4A7BFF" },
                { label: "查看所有任务", icon: Filter, color: "#8B5CF6" },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all text-left group"
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <motion.div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}20` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  </motion.div>
                  <span className="text-sm text-[#A1A1AA] group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#52525B] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
