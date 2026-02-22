"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

interface Event {
  _id: string;
  title: string;
  startTime: number;
  type: string;
}

interface CalendarViewProps {
  events: Event[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-card p-6"
    >
      {/* 头部控制 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                viewMode === mode 
                  ? "bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/50" 
                  : "text-white/50 hover:text-white"
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="text-2xl font-bold neon-text">
          {format(currentDate, "yyyy.MM")}
        </div>
      </div>

      {/* 周视图 */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center py-3 text-sm font-mono text-white/40 border-b border-white/10"
          >
            {day}
          </div>
        ))}
        
        {Array.from({ length: 7 }).map((_, index) => {
          const date = addDays(startOfWeek(currentDate), index);
          const dayEvents = events?.filter((e) =>
            isSameDay(new Date(e.startTime), date)
          );
          const isToday = isSameDay(date, new Date());

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`min-h-[150px] glass-card p-3 relative overflow-hidden ${
                isToday ? "border-[#00f5ff]/50" : ""
              }`}
            >
              {/* 日期 */}
              <div className={`text-lg font-bold mb-2 ${
                isToday ? "text-[#00f5ff]" : "text-white/70"
              }`}>
                {format(date, "d")}
                {isToday && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[#00f5ff]/20 text-[#00f5ff]">
                    TODAY
                  </span>
                )}
              </div>

              {/* 事件 */}
              <div className="space-y-2">
                {dayEvents?.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function EventCard({ event }: { event: Event }) {
  const typeConfig: Record<string, { color: string; label: string }> = {
    cron: { color: "#00ff88", label: "CRON" },
    onetime: { color: "#00f5ff", label: "ONCE" },
    recurring: { color: "#b829dd", label: "LOOP" },
  };

  const config = typeConfig[event.type] || typeConfig.onetime;

  return (
    <div 
      className="p-2 rounded text-xs cursor-pointer hover:brightness-110 transition-all"
      style={{ 
        backgroundColor: `${config.color}15`,
        borderLeft: `2px solid ${config.color}`
      }}
    >
      <div className="font-medium" style={{ color: config.color }}>
        {event.title}
      </div>
      <div className="text-white/40 mt-1 font-mono">
        {format(new Date(event.startTime), "HH:mm")}
      </div>
    </div>
  );
}
