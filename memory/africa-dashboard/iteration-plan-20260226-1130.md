# 非洲情报看板 UI/UX 迭代计划

**生成时间**: 2026-02-26 11:30  
**任务ID**: africa-intel-dashboard-auto-iteration  
**计划版本**: v1.0  
**预计执行时间**: 2026-02-27 03:00 (凌晨3点统一部署)

---

## 1. 当前页面分析

### 1.1 文件结构
```
intelligence-dashboard/
├── app/
│   ├── page.tsx              # 首页 - 情报列表
│   ├── layout.tsx            # 根布局
│   ├── globals.css           # 全局样式
│   └── report/[id]/
│       ├── page.tsx          # 报告详情页
│       └── ReportContent.tsx # 报告内容渲染
├── components/
│   ├── Header.tsx            # 导航头部
│   └── DownloadWordButton.tsx # Word下载按钮
├── data/
│   └── reports.json          # 情报数据
└── types/
    └── report.ts             # TypeScript类型定义
```

### 1.2 当前功能概览
- ✅ 情报列表展示（日报/简报卡片）
- ✅ 分页功能
- ✅ 报告详情页
- ✅ Word下载功能
- ✅ 响应式布局（基础）
- ✅ 深色主题
- ✅ 统计面板

---

## 2. 检测到的优化项

### 2.1 高优先级 (P0) - 核心体验

#### 2.1.1 搜索与筛选功能缺失
**问题**: 随着情报数据增长，用户无法快速定位特定内容。
**建议**:
- 添加全局搜索框（支持标题、内容关键词）
- 按日期范围筛选
- 按内容类型筛选（日报/简报）
- 搜索结果高亮

**实现参考**:
```typescript
// 新增组件: components/SearchFilter.tsx
interface SearchFilterProps {
  onSearch: (query: string) => void;
  onDateRangeChange: (start: Date, end: Date) => void;
  onTypeChange: (type: 'all' | 'daily' | 'brief') => void;
}
```

#### 2.1.2 列表页加载性能优化
**问题**: 当前所有数据一次性加载，数据量大时影响首屏速度。
**建议**:
- 实现虚拟滚动（Virtual Scrolling）
- 或增加"加载更多"按钮替代分页
- 骨架屏加载状态

**实现参考**:
- 使用 `react-window` 或 `@tanstack/react-virtual`
- 当前每页12条，可保持但增加无限滚动选项

#### 2.1.3 详情页返回体验
**问题**: 从详情页返回列表时，丢失滚动位置和筛选状态。
**建议**:
- 使用 `sessionStorage` 保存列表状态
- 或改用 Modal/Drawer 形式展示详情（可选）
- 返回按钮保留历史状态

### 2.2 中优先级 (P1) - 交互增强

#### 2.2.1 卡片交互优化
**问题**: 卡片悬停效果单一，信息密度可提升。
**建议**:
- 添加卡片展开预览（悬停显示更多摘要）
- 关键标签可视化（如国家标签、主题标签）
- 收藏/标记功能

**视觉参考**:
- 使用 Framer Motion 添加流畅动画
- 卡片右上角添加"快速预览"按钮

#### 2.2.2 时间线视图
**问题**: 当前仅支持网格列表，缺乏时间维度展示。
**建议**:
- 添加时间线视图切换（列表 ↔ 时间线）
- 按日期分组展示
- 支持日历热力图（显示情报密度）

**实现参考**:
```typescript
// 新增视图组件: components/TimelineView.tsx
interface TimelineViewProps {
  reports: Report[];
  onItemClick: (report: Report) => void;
}
```

#### 2.2.3 移动端适配优化
**问题**: 移动端体验需要进一步打磨。
**建议**:
- 底部导航栏（移动端）
- 卡片宽度自适应优化
- 触摸友好的按钮尺寸（最小44px）
- 横屏适配

### 2.3 低优先级 (P2) - 锦上添花

#### 2.3.1 主题定制
**问题**: 仅支持深色主题。
**建议**:
- 添加浅色主题切换
- 系统主题自动检测
- 主题色自定义（蓝/绿/紫等）

#### 2.3.2 数据可视化
**问题**: 统计信息仅展示数字。
**建议**:
- 添加趋势图表（简报/日报数量趋势）
- 词云展示热点话题
- 国家分布饼图

**实现参考**:
- 使用 `recharts` 或 `chart.js`

#### 2.3.3 键盘快捷键
**问题**: 无键盘操作支持。
**建议**:
- `/` 聚焦搜索框
- `j/k` 上下导航
- `Enter` 打开详情
- `Esc` 返回列表

#### 2.3.4 PWA 支持
**问题**: 无法离线访问。
**建议**:
- 添加 Service Worker
- 离线缓存最近情报
- 添加到主屏幕支持

---

## 3. 具体实现计划

### 3.1 第一阶段：核心功能 (v1.1)

| 任务 | 文件变更 | 预计工时 |
|------|----------|----------|
| 搜索功能 | `components/SearchBar.tsx`, `app/page.tsx` | 2h |
| 状态持久化 | `hooks/useListState.ts`, `app/page.tsx` | 1.5h |
| 骨架屏 | `components/SkeletonCard.tsx`, `app/page.tsx` | 1h |
| **小计** | | **4.5h** |

### 3.2 第二阶段：交互增强 (v1.2)

| 任务 | 文件变更 | 预计工时 |
|------|----------|----------|
| 时间线视图 | `components/TimelineView.tsx`, `app/page.tsx` | 3h |
| 卡片动画优化 | `components/ReportCard.tsx` | 1.5h |
| 移动端优化 | `components/MobileNav.tsx`, `app/layout.tsx` | 2h |
| **小计** | | **6.5h** |

### 3.3 第三阶段：高级功能 (v1.3)

| 任务 | 文件变更 | 预计工时 |
|------|----------|----------|
| 主题切换 | `components/ThemeToggle.tsx`, `app/globals.css` | 2h |
| 数据可视化 | `components/StatsChart.tsx` | 2.5h |
| 键盘快捷键 | `hooks/useKeyboardShortcuts.ts` | 1.5h |
| **小计** | | **6h** |

---

## 4. 技术债务与优化

### 4.1 代码结构优化
- [ ] 将 `page.tsx` 拆分为更小组件
- [ ] 提取通用 hooks（useReports, usePagination）
- [ ] 添加错误边界（Error Boundary）

### 4.2 性能优化
- [ ] 图片懒加载（如有图片资源）
- [ ] 代码分割（动态导入）
- [ ] JSON 数据压缩或分页加载

### 4.3 可访问性 (a11y)
- [ ] 添加 ARIA 标签
- [ ] 确保足够的颜色对比度
- [ ] 支持屏幕阅读器

---

## 5. 设计规范建议

### 5.1 颜色系统
当前已使用：
- 背景: `#0a0a0f`
- 卡片: `#111827`
- 强调色: `#3b82f6` (蓝), `#10b981` (绿)
- 文字: `#e5e5e5` (主), `#9ca3af` (次)

建议补充：
- 警告色: `#f59e0b` (琥珀)
- 错误色: `#ef4444` (红)
- 成功色: `#22c55e` (绿)

### 5.2 间距系统
当前使用 Tailwind 默认间距，建议统一为：
- 卡片间距: `gap-4` (16px)
- 内边距: `p-5` (20px)
- 圆角: `rounded-2xl` (16px)

### 5.3 动画规范
- 过渡时长: `duration-300`
- 缓动函数: `cubic-bezier(0.4, 0, 0.2, 1)`
- 悬停位移: `translate-y: -4px`

---

## 6. 依赖建议

### 6.1 新增依赖
```json
{
  "framer-motion": "^11.x",        // 动画库
  "react-window": "^1.8.x",        // 虚拟滚动
  "recharts": "^2.x",              // 图表
  "fuse.js": "^7.x",               // 模糊搜索
  "date-fns": "^3.x"               // 日期处理
}
```

### 6.2 开发依赖
```json
{
  "@types/react-window": "^1.8.x"
}
```

---

## 7. 测试清单

- [ ] 搜索功能正常（中英文、特殊字符）
- [ ] 分页/无限滚动正常
- [ ] 返回列表保持状态
- [ ] 移动端各尺寸适配
- [ ] Word下载功能正常
- [ ] 深色/浅色主题切换
- [ ] 键盘快捷键有效
- [ ] 性能：首屏 < 3s

---

## 8. 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 搜索性能差（大数据量） | 中 | 高 | 使用 Fuse.js + 虚拟滚动 |
| 状态管理复杂 | 低 | 中 | 使用 URL query params |
| 移动端兼容问题 | 中 | 中 | 充分测试 iOS/Android |
| 构建体积增大 | 中 | 低 | 代码分割，按需加载 |

---

## 9. 附录

### 9.1 参考资源
- [Framer Motion 文档](https://www.framer.com/motion/)
- [React Window 示例](https://react-window.vercel.app/#/examples/list/fixed-size)
- [Tailwind CSS 最佳实践](https://tailwindcss.com/docs/best-practices)

### 9.2 相关文件路径
- 项目根目录: `/root/.openclaw/workspace/intelligence-dashboard/`
- 计划文档: `/root/.openclaw/workspace/memory/africa-dashboard/iteration-plan-20260226-1130.md`

---

*本计划由 africa-intel-dashboard-auto-iteration 任务自动生成*  
*等待凌晨3点 africa-dashboard-nightly-deploy 任务执行部署*
