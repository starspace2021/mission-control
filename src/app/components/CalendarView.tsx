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
  X
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
const TYPE_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  cron: { 
    color: "#22C55E", 
    bg: "rgba(34, 197, 94, 0.1)",
    label: "定时任务", 
    icon: Repeat,
  },
  onetime: { 
    color: "#4A7BFF", 
    bg: "rgba(74, 123, 255, 0.1)",
    label: "单次任务", 
    icon: Zap,
  },
  recurring: { 
    color: "#8B5CF6", 
    bg: "rgba(139, 92, 246, 0.1)",
    label: "循环任务", 
    icon: Clock,
  },
  maintenance: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    label: "系统维护",
    icon: CheckCircle2,
  },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", label: "高优先级" },
  medium: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", label: "中优先级" },
  low: { color: "#4A7BFF", bg: "rgba(74, 123, 255, 0.1)", label: "低优先级" },
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
      className="event-card"
      style={{ '--event-color': config.color } as React.CSSProperties}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
        <span className="font-medium truncate text-xs" style={{ color: config.color }}>
          {event.title}
        </span>
      </div>
      
      <div className="text-white/40 mt-0.5 font-mono text-[10px] flex items-center gap-1">
        <Clock className="w-2.5 h-2.5" />
        {format(new Date(event.startTime), "HH:mm")}
      </div>

      {priority && (
        <div 
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: priority.color }}
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
        <div className="p-6 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: config.bg }}
              >
                <Icon className="w-7 h-7" style={{ color: config.color }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{event.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span 
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: config.bg, color: config.color }}
                  >
                    {config.label}
                  </span>
                  {priority && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{ backgroundColor: priority.bg, color: priority.color }}
                    >
                      {priority.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#71717A]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-[#71717A]" />
            </div>
            <div>
              <div className="text-sm text-[#71717A]">时间</div>
              <div className="text-white font-medium">
                {format(new Date(event.startTime), "yyyy年MM月dd日 HH:mm")}
                {event.endTime && ` - ${format(new Date(event.endTime), "HH:mm")}`}
              </div>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#71717A]" />
              </div>
              <div>
                <div className="text-sm text-[#71717A]">地点</div>
                <div className="text-white font-medium">{event.location}</div>
              </div>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#71717A]" />
              </div>
              <div>
                <div className="text-sm text-[#71717A]">参与者</div>
                <div className="flex items-center gap-2">
                  {event.attendees.map((attendee, i) => (
                    <span key={i} className="text-white font-medium">{attendee}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
                <Tag className="w-5 h-5 text-[#71717A]" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#71717A]">标签</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {event.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-[#A1A1AA]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {event.description && (
            <div className="pt-4 border-t border-white/5">
              <div className="text-sm text-[#71717A] mb-2">描述</div>
              <p className="text-white/80 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex gap-3">
          <button className="btn btn-primary flex-1">编辑</button>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            关闭
          </button>
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
      <div className={`grid ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"} border-b border-white/5`}>
        {(viewMode === "day" ? [WEEK_DAYS[new Date().getDay()]] : WEEK_DAYS).map((day) => (
          <div 
            key={day} 
            className="text-center py-2.5 text-xs font-medium text-[#71717A] border-r border-white/5 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className={`grid ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"} auto-rows-fr`}>
        {viewDates.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isDateToday(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          
          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.005 }}
              className={`min-h-[100px] p-2 border-r border-b border-white/5 last:border-r-0 
                         ${!isCurrentMonth && viewMode === "month" ? "bg-white/[0.02]" : ""}
                         ${isToday ? "calendar-cell today" : "calendar-cell"}`}
            >
              <div className={`flex items-center gap-1.5 mb-2 ${isToday ? "text-[#4A7BFF]" : "text-white/70"}`}>
                <span className={`text-base font-bold ${isToday ? 'text-[#4A7BFF]' : ''}`}>
                  {format(date, "d")}
                </span>
                {isToday && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4A7BFF] text-white font-medium">
                    今天
                  </span>
                )}
                {dayEvents.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4A7BFF]/15 text-[#4A7BFF] font-medium">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    onClick={() => onSelectEvent(event)}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[#71717A] text-center py-0.5 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors">
                    +{dayEvents.length - 3}
                  </div>
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card overflow-hidden"
    >
      <div className="flex">
        <div className="w-16 border-r border-white/5 flex-shrink-0">
          <div className="h-12 border-b border-white/5"></div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b border-white/5 flex items-start justify-center pt-1">
              <span className="text-xs text-[#52525B]">{`${hour.toString().padStart(2, '0')}:00`}</span>
            </div>
          ))}
        </div>

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
                  <div className={`h-12 border-b border-r border-white/5 flex flex-col items-center justify-center ${
                    isToday ? 'bg-[#4A7BFF]/10' : ''
                  }`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-[#4A7BFF]' : 'text-white'}`}>
                      {WEEK_DAYS[dayIndex]}
                    </span>
                    <span className="text-xs text-[#71717A]">{format(date, "MM/dd")}</span>
                  </div>

                  <div className="relative">
                    {hours.map(hour => (
                      <div key={hour} className="h-16 border-b border-r border-white/5"></div>
                    ))}

                    {isToday && (
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-[#EF4444] z-20"
                        style={{ 
                          top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / 60 * 64}px` 
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-[#EF4444]" />
                      </motion.div>
                    )}

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
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => onSelectEvent(event)}
                          className="absolute left-1 right-1 p-2 rounded-lg cursor-pointer overflow-hidden hover:opacity-90 transition-all"
                          style={{
                            top,
                            height,
                            backgroundColor: config.bg,
                            borderLeft: `3px solid ${config.color}`,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
                            <span className="font-medium truncate text-xs" style={{ color: config.color }}>
                              {event.title}
                            </span>
                          </div>
                          <div className="text-white/60 mt-0.5 text-[10px]">
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
          { label: "今日事件", value: stats.today, icon: CalendarIcon, color: "#4A7BFF" },
          { label: "待执行", value: stats.pending, icon: Clock3, color: "#F59E0B" },
          { label: "已计划", value: stats.scheduled, icon: CheckCircle2, color: "#22C55E" },
          { label: "总计", value: stats.total, icon: CalendarIcon, color: "#8B5CF6" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card card-interactive p-4 flex items-center gap-3"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-[#71717A]">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 头部控制栏 */}
      <div className="filter-container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-1 bg-[#1A1A24] rounded-xl p-1">
              {(["day", "week", "month", "timeline"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode 
                      ? "bg-[#4A7BFF] text-white" 
                      : "text-[#71717A] hover:text-white"
                  }`}
                >
                  {mode === "day" ? "日" : mode === "week" ? "周" : mode === "month" ? "月" : "时间线"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate("prev")}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#71717A]" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-[#4A7BFF] hover:bg-[#4A7BFF]/10 rounded-lg transition-colors"
              >
                今天
              </button>
              <button
                onClick={() => navigateDate("next")}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>
            
            <div className="text-xl font-semibold text-white hidden sm:block">
              {format(currentDate, "yyyy年MM月", { locale: zhCN })}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input w-auto"
            >
              <option value="all">全部类型</option>
              <option value="cron">定时任务</option>
              <option value="onetime">单次任务</option>
              <option value="recurring">循环任务</option>
              <option value="maintenance">系统维护</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="搜索事件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 w-48"
              />
            </div>
            
            <button className="btn btn-primary">
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>
        </div>
      </div>

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

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#4A7BFF]/10 flex items-center justify-center">
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
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white truncate">
                            {event.title}
                          </h4>
                          {priority && (
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: priority.color }}
                            />
                          )}
                        </div>
                        <p className="text-xs text-[#71717A] mt-0.5 line-clamp-1">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded font-medium"
                            style={{ backgroundColor: config.bg, color: config.color }}
                          >
                            {config.label}
                          </span>
                          
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
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">快捷操作</h3>
            <div className="space-y-2">
              {[
                { label: "新建定时任务", icon: Repeat, color: "#22C55E" },
                { label: "新建单次任务", icon: Zap, color: "#4A7BFF" },
                { label: "查看所有任务", icon: Filter, color: "#8B5CF6" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all text-left group"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm text-[#A1A1AA] group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
