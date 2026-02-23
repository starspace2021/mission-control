# Mission Control UI 更新日志 (Changelog)

## [1.1.0] - 2026-02-23

### ✨ 新增功能
- **Dashboard 组件增强**
  - 添加环形进度条组件 `CircularProgress`
  - 添加趋势指示器组件 `TrendIndicator`
  - 指标卡片支持副标题显示

- **动画效果**
  - 脉冲光环动画 (`pulse-ring`)
  - 悬浮抬升效果 (`hover-lift`)
  - 渐变文字动画 (`animate-gradient-text`)
  - 扫描线效果 (`scanline`)

### 🎨 视觉优化
- **TaskBoard 空状态**
  - 改进空状态动画效果
  - 添加渐变背景和提示文字
  
- **数据更新**
  - CalendarView 添加 UI 自动迭代任务
  - MemoryScreen 添加 UI 自动迭代日志

### 🔧 技术改进
- 所有动画使用 GPU 加速属性（transform、opacity）
- 统一趋势显示组件
- 优化组件类型定义

### 📦 构建
- 构建成功，无错误
- 静态导出完成

---

## [1.0.0] - 2026-02-22

### ✨ 初始版本
- Dashboard 仪表盘视图
- TaskBoard 任务看板（看板/列表双视图）
- CalendarView 日历视图（日/周/月三视图）
- MemoryScreen 记忆系统（网格/列表双视图）
- 全局搜索功能
- 键盘快捷键支持
- 响应式布局
- 深色控制台主题

---

*格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)*
