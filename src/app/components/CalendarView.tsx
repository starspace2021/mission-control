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
  AlertCircle
} from "lucide-react";

interface Event {
  _id: string;
  title: string;
  startTime: number;
  type: string;
  description?: string;
  status?: string;
}

// 模拟事件数据
const mockEvents: Event[] = [
  {
    _id: "1",
    title: "非洲情报简报",
    startTime: new Date().setHours(20, 0, 0, 0),
    type: "cron",
    description: "自动收集并生成非洲涉华情报简报",
    status: "pending",
  },
  {
    _id: "2",
    title: "Polymarket 盘中简报",
    startTime: new Date().setHours(20, 0, 0, 0),
    type: "cron",
    description: "Polymarket 市场数据监控",
    status: "pending",
  },
  {
    _id: "3",
    title: "美国对华政策晚间简报",
    startTime: new Date().setHours(20, 0, 0, 0),
    type: "cron",
    description: "晚间对华政策新闻汇总",
    status: "pending",
  },
  {
    _id: "4",
    title: "美国对华政策夜间简报",
    startTime: new Date(Date.now() + 86400000).setHours(0, 0, 0, 0),
    type: "cron",
    description: "夜间对华政策监控",
    status: "scheduled",
  },
  {
    _id: "5",
    title: "美国对华政策日报",
    startTime: new Date(Date.now() + 86400000).setHours(7, 0, 0, 0),
    type: "cron",
    description: "早间对华政策日报",
    status: "scheduled",
  },
  {
    _id: "6",
    title: "QQ邮箱清理",
    startTime: new Date(Date.now() + 172800000).setHours(6, 16, 0, 0),
    type: "cron",
    description: "自动清理QQ邮箱",
    status: "scheduled",
  },
  {
    _id: "7",
    title: "UI自动迭代任务",
    startTime: new Date().setHours(7, 24, 0, 0),
    type: "maintenance",
    description: "Mission Control UI 自动优化迭代",
    status: "running",
  },
  {
    _id: "8",
    title: "系统维护",
    startTime: new Date(Date.now() + 259200000).setHours(2, 0, 0, 0),
    type: "maintenance",
    description: "定期系统维护",
    status: "scheduled",
  },
];

const typeConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ElementType }> = {
  cron: { 
    color: "#10B981", 
    bgColor: "rgba(16, 185, 129, 0.1)",
    label: "定时任务", 
    icon: Repeat 
  },
  onetime: { 
    color: "#3B82F6", 
    bgColor: "rgba(59, 130, 246, 0.1)",
    label: "单次任务", 
    icon: Zap 
  },
  recurring: { 
    color: "#8B5CF6", 
    bgColor: "rgba(139, 92, 246, 0.1)",
    label: "循环任务", 
    icon: Clock 
  },
  maintenance: {
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
    label: "系统维护",
    icon: CheckCircle2
  },
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  const navigateDate = (direction: "prev" | "next") => {
    const multiplier = direction === "prev" ? -1 : 1;
    if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7 * multiplier));
    } else if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 1 * multiplier));
    } else {
      setCurrentDate(addDays(currentDate, 30 * multiplier));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // 获取当前视图的所有日期
  const getViewDates = () => {
    if (viewMode === "week") {
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
      (searchQuery === "" || e.title.toLowerCase().includes(searchQuery.toLowerCase()))
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "今日事件", value: stats.today, icon: CalendarDays, color: "#3B82F6" },
          { label: "待执行", value: stats.pending, icon: Clock3, color: "#F59E0B" },
          { label: "已计划", value: stats.scheduled, icon: CheckCircle2, color: "#10B981" },
          { label: "总计", value: stats.total, icon: CalendarIcon, color: "#8B5CF6" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="console-card p-4 flex items-center gap-3"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-[#71717A]">{stat.label}</div>
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
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode 
                      ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-blue-500/25" 
                      : "text-[#71717A] hover:text-white"
                  }`}
                >
                  {mode === "day" ? "日" : mode === "week" ? "周" : "月"}
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
        {/* 日历网格 */}
        <div className="lg:col-span-3 console-card overflow-hidden"
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

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`min-h-[120px] p-3 border-r border-b border-white/5 last:border-r-0 
                             ${!isCurrentMonth && viewMode === "month" ? "bg-white/[0.02]" : ""}
                             ${isToday ? "bg-gradient-to-br from-[#3B82F6]/10 to-transparent" : "hover:bg-white/[0.02]"} 
                             transition-colors`}
                >
                  {/* 日期数字 */}
                  <div className={`text-lg font-semibold mb-2 ${
                    isToday ? "text-[#3B82F6]" : "text-white/70"
                  }`}
                  >
                    {format(date, "d")}
                    {isToday && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6]">
                        今天
                      </span>
                    )}
                  </div>

                  {/* 事件列表 */}
                  <div className="space-y-1"
                  >
                    {dayEvents.map((event) => (
                      <EventCard 
                        key={event._id} 
                        event={event} 
                        onClick={() => setSelectedEvent(event)}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
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
                        <h4 className="text-sm font-medium text-white truncate group-hover:text-[#3B82F6] transition-colors"
                        >
                          {event.title}
                        </h4>
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

// 事件卡片
function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const config = typeConfig[event.type] || typeConfig.onetime;
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-2 rounded-lg text-xs cursor-pointer transition-all"
      style={{ 
        backgroundColor: config.bgColor,
        borderLeft: `2px solid ${config.color}`
      }}
    >
      <div className="flex items-center gap-1"
      >
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
        <span className="font-medium truncate" style={{ color: config.color }}
        >
          {event.title}
        </span>
      </div>
      <div className="text-white/40 mt-0.5 font-mono text-[10px]"
      >
        {format(new Date(event.startTime), "HH:mm")}
      </div>
    </motion.div>
  );
}

// 事件详情弹窗
function EventDetailModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const config = typeConfig[event.type] || typeConfig.onetime;
  const Icon = config.icon;

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
        className="console-card w-full max-w-md overflow-hidden"
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
                    {event.status === 'pending' ? '待执行' : '已计划'}
                  </span>
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
              </div>
            </div>
          </div>

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
