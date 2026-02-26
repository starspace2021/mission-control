"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Brain,
  Users,
  Terminal,
  Cpu,
  Activity,
  Clock,
  ChevronRight,
  Bell,
  Search,
  Settings,
  Menu,
  X,
  Sparkles,
  RefreshCw
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import CalendarView from "./components/CalendarView";
import MemoryArchive from "./components/Memory";
import TeamView from "./components/TeamView";

// ========== 导航配置 ==========
const NAV_ITEMS = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard },
  { id: "tasks", label: "任务", icon: ClipboardList },
  { id: "calendar", label: "日历", icon: Calendar },
  { id: "memory", label: "记忆", icon: Brain },
  { id: "team", label: "团队", icon: Users },
];

// ========== 子组件 ==========

function LiveClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-right">
      <div className="text-xl font-semibold tabular-nums text-white">
        {time.toLocaleTimeString('zh-CN', { hour12: false })}
      </div>
      <div className="text-xs text-[#71717A]">
        {time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
      </div>
    </div>
  );
}

function StatusChart({ value, color = "blue" }: { value: number; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22C55E",
    yellow: "#F59E0B",
    red: "#EF4444",
  };
  
  const mainColor = colorMap[color] || colorMap.blue;
  
  return (
    <div className="w-full bg-[#0a0a0f] rounded-full h-1.5 overflow-hidden">
      <motion.div 
        className="h-full rounded-full"
        style={{ backgroundColor: mainColor }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl glass-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <Search className="w-5 h-5 text-[#71717A]" />
          <input
            type="text"
            placeholder="搜索任务、记忆、事件..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-[#52525B] outline-none text-lg"
            autoFocus
          />
          <span className="text-xs text-[#52525B] px-2 py-1 bg-white/5 rounded">ESC</span>
        </div>
        
        <div className="p-8 text-center">
          <div className="text-[#71717A] mb-2">输入关键词开始搜索</div>
          <div className="text-xs text-[#52525B]">支持任务、记忆、事件等多种类型</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== 主组件 ==========
export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#fafafa]">
      <div className="flex h-screen">
        {/* 侧边栏 */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0a0a0f] border-r border-white/5 flex flex-col transition-all duration-300`}>
          {/* Logo */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg shadow-[#3b82f6]/20">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="font-semibold text-white">Mission Control</div>
                  <div className="text-xs text-[#71717A]">任务控制中心</div>
                </div>
              )}
            </div>
          </div>

          {/* 导航 */}
          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
                    isActive
                      ? "text-[#3b82f6]"
                      : "text-[#A1A1AA] hover:text-white"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {/* 激活背景 */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/20 to-transparent border border-[#3b82f6]/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[#3b82f6]' : ''}`} />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left relative z-10">{item.label}</span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* 系统状态 */}
          <div className="p-3 border-t border-white/5 space-y-3">
            {!sidebarCollapsed && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#71717A]">系统状态</span>
                  <span className="flex items-center gap-1.5 text-xs text-[#22C55E]">
                    <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
                    在线
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#71717A]">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />CPU
                    </span>
                    <span>42%</span>
                  </div>
                  <StatusChart value={42} color="blue" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#71717A]">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />内存
                    </span>
                    <span>68%</span>
                  </div>
                  <StatusChart value={68} color="green" />
                </div>
              </>
            )}
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto">
          {/* 顶部栏 - 毛玻璃效果 */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h1>
              <div className="flex items-center gap-2 text-sm text-[#71717A]">
                <span>Mission Control</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#111118] border border-white/10 rounded-lg text-sm text-[#71717A] hover:text-white hover:border-[#3b82f6]/30 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-4 h-4 group-hover:text-[#3b82f6] transition-colors" />
                <span className="hidden sm:inline">搜索...</span>
                <kbd className="hidden md:inline-flex ml-2 px-1.5 py-0.5 text-[10px] bg-white/5 rounded text-[#52525B]">⌘K</kbd>
              </motion.button>
              
              <motion.button 
                className="relative p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <motion.span 
                    className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] flex items-center justify-center text-white font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>
              
              <motion.button 
                className="p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              
              <LiveClock />
            </div>
          </header>

          {/* 页面内容 */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dashboard" && <Dashboard />}
                {activeTab === "tasks" && <Tasks />}
                {activeTab === "calendar" && <CalendarView />}
                {activeTab === "memory" && <MemoryArchive />}
                {activeTab === "team" && <TeamView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* 全局搜索弹窗 */}
      <AnimatePresence>
        {isSearchOpen && (
          <GlobalSearch onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
