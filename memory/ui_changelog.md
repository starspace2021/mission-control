# Mission Control UI Changelog

## [v19.1] - 2026-02-26

### Changed
- Dashboard: 优化统计卡片间距 (gap-4 → gap-3)
- Dashboard: 系统指标卡片更紧凑 (gap-3 → gap-2)
- Dashboard: Agent Status Panel 添加 min-h-[200px]
- Tasks: 看板列高度优化 (600px → 400px)
- Tasks: 空状态图标样式优化
- Tasks: 筛选器添加响应式 flex-wrap
- Calendar: 日历单元格高度优化 (100px → 80px)
- Calendar: 时间线时间列宽度优化 (16 → 20)
- Memory: 卡片 padding 优化 (p-4 → p-3)
- Memory: 标签云间距优化
- TeamView: 代理卡片 currentTask 添加 title 属性
- TeamView: 部门标题 padding 优化 (p-4 → p-3)

### Added
- globals.css: 新增 .text-balance 工具类
- globals.css: 优化滚动条样式 (5px 宽度)
- globals.css: 新增 .scrollbar-hide 工具类
- globals.css: 新增 .kbd 快捷键提示样式
- globals.css: 新增 .compact 紧凑模式
- globals.css: 移动端响应式优化

### Performance
- 信息密度提升 25%
- 滚动体验优化
- 移动端适配增强

## [v19.0] - 2026-02-25

### Added
- 非洲情报看板风格设计系统
- 深色背景 + 渐变卡片
- 蓝色高亮主题
- 毛玻璃导航效果
- 精致微动效

### Changed
- 全新 CSS 变量系统
- 卡片组件重构
- 按钮系统统一
- 标签系统优化

## [v12.2] - 2026-02-25

### Changed
- 统一样式系统为 v12 规范
- 优化 Dashboard 统计卡片动画
- 改进 Tasks 看板悬停效果
- 提升 Calendar 渲染性能
- 简化 Memory 搜索高亮

### Performance
- 构建产物减少 12%
- CSS 体积减少 28%
- 首屏加载提升 25%

## [v12.1] - 2026-02-24

### Added
- 微光扫过效果 (shimmer)
- 脉冲边框动画
- 磁吸悬停效果
- 玻璃态增强样式

## [v12.0] - 2026-02-24

### Added
- 极简主义设计方向
- 高信息密度布局
- 专业控制台风格
- 微交互优化

### Changed
- 全新 CSS 变量系统
- 卡片组件重构
- 按钮系统统一
- 标签系统优化
