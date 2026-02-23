"use client";

import { useState } from "react";
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
  MoreHorizontal,
  CheckCircle2,
  CalendarDays,
  Clock3,
  AlertCircle,
  LayoutGrid,
  List,
  MapPin,
  Users,
  Tag,
  Sparkles,
  ArrowRight,
  Bell,
  Info
} from "lucide-react";

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

// 模拟事件数据
const mockEvents: Event[] = [
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

const typeConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ElementType; gradient: string }> = {
  cron: { 
    color: "#10B981", 
    bgColor: "rgba(16, 185, 129, 0.1)",
    label: "定时任务", 
    icon: Repeat,
    gradient: "from-[#10B981] to-[#34D399]"
  },
  onetime: { 
    color: "#3B82F6", 
    bgColor: "rgba(59, 130, 246, 0.1)",
    label: "单次任务", 
    icon: Zap,
    gradient: "from-[#3B82F6] to-[#60A5FA]"
  },
  recurring: { 
    color: "#8B5CF6", 
    bgColor: "rgba(139, 92, 246, 0.1)",
    label: "循环任务", 
    icon: Clock,
    gradient: "from-[#8B5CF6] to-[#A78BFA]"
  },
  maintenance: {
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
    label: "系统维护",
    icon: CheckCircle2,
    gradient: "from-[#F59E0B] to-[#FBBF24]"
  },
};

const priorityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  high: { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)", label: "高优先级" },
  medium: { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)", label: "中优先级" },
  low: { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)", label: "低优先级" },
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "timeline">("week");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  const navigateDate = (direction: "prev" | "next") => {
    const multiplier = direction === "prev" ? -1 : 1;
    if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7 * multiplier));
    } else if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 1 * multiplier));
    } else if (viewMode === "timeline") {
      setCurrentDate(addDays(currentDate, 7 * multiplier));
    } else {
      setCurrentDate(addDays(currentDate, 30 * multiplier));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // 获取当前视图的所有日期
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

  // 获取某日期的事件
  const getEventsForDate = (date: Date) => {
    return mockEvents.filter((e) => 
      isSameDay(new Date(e.startTime), date) &&
      (searchQuery === "" || e.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedType === "all" || e.type === selectedType)
    );
  };

  // 获取即将到来的事件
  const upcomingEvents = mockEvents
    .filter(e => new Date(e.startTime) >= new Date())
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 5);

  // 统计
  const stats = {
    total: mockEvents.length,
    today: mockEvents.filter(e => isDateToday(new Date(e.startTime))).length,
    pending: mockEvents.filter(e => e.status === 'pending').length,
    scheduled: mockEvents.filter(e => e.status === 'scheduled').length,
  };

  // 计算事件密度（用于热力图效果）
  const getEventDensity = (date: Date) => {
    const count = getEventsForDate(date).length;
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    return 3;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 统计卡片 - 优化版 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "今日事件", value: stats.today, icon: CalendarDays, color: "#3B82F6", trend: "+2" },
          { label: "待执行", value: stats.pending, icon: Clock3, color: "#F59E0B", trend: "pending" },
          { label: "已计划", value: stats.scheduled, icon: CheckCircle2, color: "#10B981", trend: "stable" },
          { label: "总计", value: stats.total, icon: CalendarIcon, color: "#8B5CF6", trend: "+5" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="console-card p-4 flex items-center gap-3 cursor-pointer group"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && stat.trend !== 'stable' && stat.trend !== 'pending' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-xs text-[#71717A]">{stat.label}</div>
            </div>
            {/* 迷你趋势图 */}
            <div className="w-12 h-8">
              <MiniTrendChart color={stat.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 头部控制栏 */}
      <div className="console-card p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4"
          >
            {/* 视图切换 */}
            <div className="flex gap-1 bg-[#1A1A24] rounded-xl p-1"
            >
              {(["day", "week", "month", "timeline"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode 
                      ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-blue-500/25" 
                      : "text-[#71717A] hover:text-white"
                  }`}
                >
                  {mode === "day" ? "日" : mode === "week" ? "周" : mode === "month" ? "月" : "时间线"}
                </button>
              ))}
            </div>

            {/* 日期导航 */}
            <div className="flex items-center gap-2"
            >
              <button
                onClick={() => navigateDate("prev")}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#71717A]" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-colors"
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
            
            <div className="text-xl font-semibold text-white hidden sm:block"
            >
              {format(currentDate, "yyyy年MM月", { locale: zhCN })}
            </div>
          </div>

          <div className="flex items-center gap-3"
          >
            {/* 类型筛选 */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-[#1A1A24] border border-white/10 rounded-lg text-sm text-white focus:border-[#3B82F6]/50 focus:outline-none"
            >
              <option value="all">全部类型</option>
              <option value="cron">定时任务</option>
              <option value="onetime">单次任务</option>
              <option value="recurring">循环任务</option>
              <option value="maintenance">系统维护</option>
            </select>

            {/* 搜索 */}
            <div className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="搜索事件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#1A1A24] border border-white/10 rounded-lg text-sm text-white placeholder:text-[#52525B] focus:border-[#3B82F6]/50 focus:outline-none w-48 transition-all"
              />
            </div>
            
            <button className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* 主内容区 - 根据视图模式切换 */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {viewMode === "timeline" ? (
              <TimelineView 
                key="timeline"
                events={mockEvents}
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
                getEventDensity={getEventDensity}
                onSelectEvent={setSelectedEvent}
                weekDays={weekDays}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            )}
          </AnimatePresence>
        </div>

        {/* 侧边栏 - 即将到来的事件 */}
        <div className="space-y-4"
        >
          <div className="console-card p-5"
          >
            <div className="flex items-center gap-3 mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 flex items-center justify-center"
              >
                <Clock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">即将到来</h3>
                <p className="text-xs text-[#71717A]">未来5个事件</p>
              </div>
            </div>
            
            <div className="space-y-3"
            >
              {upcomingEvents.map((event, index) => {
                const config = typeConfig[event.type] || typeConfig.onetime;
                const Icon = config.icon;
                const isToday = isDateToday(new Date(event.startTime));
                const priority = event.priority ? priorityConfig[event.priority] : null;
                
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-start gap-3"
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      
                      <div className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white truncate group-hover:text-[#3B82F6] transition-colors"
                          >
                            {event.title}
                          </h4>
                          {priority && (
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: priority.color }}
                            />
                          )}
                        </div>
                        <p className="text-xs text-[#71717A] mt-0.5 line-clamp-1"
                        >
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2"
                        >
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded font-medium"
                            style={{ backgroundColor: config.bgColor, color: config.color }}
                          >
                            {config.label}
                          </span>
                          
                          <span className={`text-xs ${isToday ? 'text-[#3B82F6] font-medium' : 'text-[#71717A]'}`}
                          >
                            {isToday ? '今天' : format(new Date(event.startTime), "MM/dd HH:mm")}
                          </span>
                        </div>

                        {/* 标签 */}
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

          {/* 快捷操作 */}
          <div className="console-card p-5"
          >
            <h3 className="font-semibold text-white mb-4">快捷操作</h3>
            <div className="space-y-2"
            >
              {[
                { label: "新建定时任务", icon: Repeat, color: "#10B981" },
                { label: "新建单次任务", icon: Zap, color: "#3B82F6" },
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
                  <span className="text-sm text-[#A1A1AA] group-hover:text-white transition-colors"
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 事件详情弹窗 */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 日历网格视图
function CalendarGridView({
  viewDates,
  viewMode,
  currentDate,
  getEventsForDate,
  getEventDensity,
  onSelectEvent,
  weekDays,
  hoveredDate,
  setHoveredDate
}: {
  viewDates: Date[];
  viewMode: string;
  currentDate: Date;
  getEventsForDate: (date: Date) => Event[];
  getEventDensity: (date: Date) => number;
  onSelectEvent: (event: Event) => void;
  weekDays: string[];
  hoveredDate: Date | null;
  setHoveredDate: (date: Date | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="console-card overflow-hidden"
    >
      {/* 星期标题 */}
      <div className={`grid ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"} border-b border-white/5`}
      >
        {(viewMode === "day" ? [weekDays[currentDate.getDay()]] : weekDays).map((day) => (
          <div 
            key={day} 
            className="text-center py-3 text-sm font-medium text-[#71717A] border-r border-white/5 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期单元格 */}
      <div className={`grid ${viewMode === "day" ? "grid-cols-1" : viewMode === "week" ? "grid-cols-7" : "grid-cols-7"} auto-rows-fr`}
      >
        {viewDates.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isDateToday(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const density = getEventDensity(date);
          const isHovered = hoveredDate && isSameDay(date, hoveredDate);
          
          // 根据事件密度设置背景色
          const densityBg = density === 0 ? '' :
            density === 1 ? 'bg-[#3B82F6]/5' :
            density === 2 ? 'bg-[#3B82F6]/10' :
            'bg-[#3B82F6]/15';

          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`min-h-[140px] p-3 border-r border-b border-white/5 last:border-r-0 
                         ${!isCurrentMonth && viewMode === "month" ? "bg-white/[0.02]" : ""}
                         ${isToday ? "bg-gradient-to-br from-[#3B82F6]/15 to-transparent ring-1 ring-[#3B82F6]/30" : densityBg} 
                         transition-all duration-200 cursor-pointer relative group`}
            >
              {/* 悬停效果背景 */}
              <motion.div 
                className="absolute inset-0 bg-white/5 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* 日期数字 - 增强 */}
              <div className={`flex items-center gap-2 mb-3 relative z-10 ${
                isToday ? "text-[#3B82F6]" : "text-white/70"
              }`}
              >
                <span className={`text-lg font-bold ${isToday ? 'text-[#3B82F6]' : ''}`}
                >
                  {format(date, "d")}
                </span>
                {isToday && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3B82F6] text-white font-medium">
                    今天
                  </span>
                )}
                {density > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] font-medium">
                    {dayEvents.length} 事件
                  </span>
                )}
              </div>

              {/* 事件列表 - 增强 */}
              <div className="space-y-1.5 relative z-10"
              >
                {dayEvents.slice(0, 4).map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    onClick={() => onSelectEvent(event)}
                  />
                ))}
                {dayEvents.length > 4 && (
                  <motion.div 
                    className="text-[10px] text-[#71717A] text-center py-1 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    +{dayEvents.length - 4} 更多
                  </motion.div>
                )}
              </div>

              {/* 快速添加按钮 - 悬停显示 */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#3B82F6]/20 hover:bg-[#3B82F6]/40 flex items-center justify-center transition-colors z-20"
              >
                <Plus className="w-3 h-3 text-[#3B82F6]" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// 时间线视图
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
  const weekEvents = events
    .filter(e => {
      const eventDate = new Date(e.startTime);
      const diffDays = Math.floor((eventDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    })
    .sort((a, b) => a.startTime - b.startTime);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="console-card overflow-hidden"
    >
      <div className="flex">
        {/* 时间轴 */}
        <div className="w-16 border-r border-white/5 flex-shrink-0">
          <div className="h-12 border-b border-white/5"></div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b border-white/5 flex items-start justify-center pt-1">
              <span className="text-xs text-[#52525B]">{`${hour.toString().padStart(2, '0')}:00`}</span>
            </div>
          ))}
        </div>

        {/* 日期列 */}
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
                    isToday ? 'bg-[#3B82F6]/10' : ''
                  }`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-[#3B82F6]' : 'text-white'}`}>
                      {weekDays[dayIndex]}
                    </span>
                    <span className="text-xs text-[#71717A]">{format(date, "MM/dd")}</span>
                  </div>

                  {/* 时间格 */}
                  <div className="relative">
                    {hours.map(hour => (
                      <div key={hour} className="h-16 border-b border-r border-white/5"></div>
                    ))}

                    {/* 当前时间线指示器 */}
                    {isToday && (
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-[#EF4444] z-20"
                        style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / 60 * 64}px` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-[#EF4444]" />
                      </motion.div>
                    )}

                    {/* 事件 */}
                    {dayEvents.map((event) => {
                      const config = typeConfig[event.type] || typeConfig.onetime;
                      const Icon = config.icon;
                      const eventDate = new Date(event.startTime);
                      const hour = eventDate.getHours();
                      const minute = eventDate.getMinutes();
                      const top = hour * 64 + (minute / 60) * 64;
                      const duration = event.endTime 
                        ? (event.endTime - event.startTime) / (1000 * 60) 
                        : 60;
                      const height = Math.max((duration / 60) * 64 - 4, 40);

                      return (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => onSelectEvent(event)}
                          className="absolute left-1 right-1 p-2 rounded-lg cursor-pointer overflow-hidden hover:opacity-90 transition-all group"
                          style={{
                            top,
                            height,
                            backgroundColor: config.bgColor,
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
                          
                          {/* 悬停详情 */}
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white">点击查看详情</span>
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

const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 事件卡片
function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const config = typeConfig[event.type] || typeConfig.onetime;
  const Icon = config.icon;
  const priority = event.priority ? priorityConfig[event.priority] : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 2 }}
      onClick={onClick}
      className="p-2 rounded-lg text-xs cursor-pointer transition-all group relative overflow-hidden"
      style={{ 
        backgroundColor: config.bgColor,
        borderLeft: `2px solid ${config.color}`
      }}
    >
      <div className="flex items-center gap-1"
      >
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
        <span className="font-medium truncate group-hover:text-white transition-colors" style={{ color: config.color }}
        >
          {event.title}
        </span>
      </div>
      <div className="text-white/40 mt-0.5 font-mono text-[10px] flex items-center gap-1"
      >
        <Clock className="w-2.5 h-2.5" />
        {format(new Date(event.startTime), "HH:mm")}
      </div>

      {/* 优先级指示器 */}
      {priority && (
        <div 
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: priority.color }}
        />
      )}
    </motion.div>
  );
}

// 迷你趋势图
function MiniTrendChart({ color }: { color: string }) {
  const points = [10, 25, 20, 35, 30, 45, 40];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  return (
    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`trendGradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,40 ${points.map((p, i) => `${(i / (points.length - 1)) * 100},${40 - ((p - min) / range) * 30 - 5}`).join(' ')} 100,40`}
        fill={`url(#trendGradient-${color.replace('#', '')})`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.map((p, i) => `${(i / (points.length - 1)) * 100},${40 - ((p - min) / range) * 30 - 5}`).join(' ')}
      />
    </svg>
  );
}

// 事件详情弹窗
function EventDetailModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const config = typeConfig[event.type] || typeConfig.onetime;
  const Icon = config.icon;
  const priority = event.priority ? priorityConfig[event.priority] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="console-card w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="p-6 border-b border-white/5"
          style={{ borderColor: `${config.color}30` }}
        >
          <div className="flex items-start justify-between"
          >
            <div className="flex items-center gap-4"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: config.bgColor }}
              >
                <Icon className="w-7 h-7" style={{ color: config.color }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{event.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span 
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-[#71717A]"
                  >
                    {event.status === 'pending' ? '待执行' : event.status === 'running' ? '进行中' : '已计划'}
                  </span>
                  {priority && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{ backgroundColor: priority.bgColor, color: priority.color }}
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
              <MoreHorizontal className="w-5 h-5 text-[#71717A]" />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-5"
        >
          <div className="flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center"
            >
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
            <div className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 text-[#71717A]" />
              </div>
              <div>
                <div className="text-sm text-[#71717A]">地点</div>
                <div className="text-white font-medium">{event.location}</div>
              </div>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center"
              >
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
            <div className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center"
              >
                <Tag className="w-5 h-5 text-[#71717A]" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#71717A]">标签</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {event.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-[#A1A1AA] hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {event.description && (
            <div className="pt-4 border-t border-white/5"
            >
              <div className="text-sm text-[#71717A] mb-2">描述</div>
              <p className="text-white/80 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-white/5 flex gap-3"
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20"
          >
            编辑
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
