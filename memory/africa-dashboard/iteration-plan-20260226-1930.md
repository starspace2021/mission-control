# 非洲情报看板 UI/UX 迭代计划

**生成时间**: 2026-02-26 19:30 (Asia/Shanghai)  
**计划版本**: v1.0  
**执行状态**: 待部署 (由 africa-dashboard-nightly-deploy 任务在凌晨3点执行)

---

## 一、当前页面分析

### 1.1 页面结构

| 页面 | 文件路径 | 功能描述 |
|------|----------|----------|
| 首页 | `app/page.tsx` | 情报卡片列表、筛选器、分页、统计 |
| 详情页 | `app/report/[id]/page.tsx` | 单篇报告详情展示 |
| 内容组件 | `app/report/[id]/ReportContent.tsx` | 报告内容解析与渲染 |
| 头部组件 | `components/Header.tsx` | 固定导航头部 |
| Word下载 | `components/DownloadWordButton.tsx` | 日报Word导出功能 |

### 1.2 技术栈
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **UI主题**: 深色模式 (#0a0a0f 背景)
- **静态导出**: 已配置 `output: 'export'`
- **部署**: Vercel

---

## 二、可优化项目清单

### 2.1 高优先级优化

#### 1. 首页加载性能优化
**问题**: 
- 所有报告数据一次性加载到内存
- `reports.json` 会随着时间增长变得庞大
- 没有虚拟滚动，大量卡片影响渲染性能

**优化方案**:
```typescript
// 建议实现:
1. 数据分页加载（服务端分页）
2. 虚拟滚动列表（react-window 或 @tanstack/react-virtual）
3. 骨架屏加载状态
4. 图片/内容懒加载
```

**预期收益**: 首屏加载时间减少 50%+

---

#### 2. 筛选器交互优化
**问题**:
- 筛选器固定在顶部，滚动后不可见
- 关键词标签过多时换行影响布局
- 没有筛选状态持久化（刷新后丢失）

**优化方案**:
```typescript
// 建议实现:
1. 粘性筛选栏（sticky filter bar）
2. 筛选器折叠/展开功能
3. URL 参数同步筛选状态
4. 已选筛选标签展示 + 一键清除
5. 关键词标签横向滚动（移动端）
```

**UI参考**: Notion 的筛选器设计、GitHub Issues 筛选栏

---

#### 3. 卡片布局与信息密度
**问题**:
- 卡片高度不统一导致网格错位
- 关键词标签颜色在深色模式下对比度不足
- 缺少情报重要性/紧急度标识

**优化方案**:
```typescript
// 建议实现:
1. 统一卡片高度（CSS Grid 自动对齐）
2. 优化标签颜色对比度（通过 WCAG 4.5:1 标准）
3. 添加情报优先级标识（高/中/低）
4. 卡片悬停预览（Quick View）
5. 列表/网格视图切换
```

---

#### 4. 详情页阅读体验
**问题**:
- 内容块之间间距过大
- 长文章缺少目录导航
- 代码/表格样式未优化
- 没有阅读进度指示

**优化方案**:
```typescript
// 建议实现:
1. 文章目录（TOC）侧边栏
2. 阅读进度条
3. 优化排版（行高、段落间距）
4. 表格样式优化
5. 返回顶部按钮
6. 上一篇/下一篇导航
```

---

### 2.2 中优先级优化

#### 5. 响应式设计完善
**问题**:
- 移动端卡片网格为单列，空间利用率低
- 筛选器在移动端占据过多空间
- 分页器在小屏幕上显示不完整

**优化方案**:
```css
/* 建议实现: */
1. 移动端双列卡片网格（@media (min-width: 480px)）
2. 筛选器底部抽屉（Bottom Sheet）
3. 分页器简化（仅显示上一页/下一页 + 页码输入）
4. 触摸友好的按钮尺寸（最小 44px）
```

---

#### 6. 搜索功能增强
**问题**:
- 目前仅支持分类筛选，无全文搜索
- 无法按时间范围筛选
- 无法按国家/地区筛选

**优化方案**:
```typescript
// 建议实现:
1. 全文搜索（支持标题、摘要、内容）
2. 日期范围选择器
3. 国家/地区多选筛选
4. 搜索历史记录
5. 搜索结果高亮
```

---

#### 7. 数据可视化增强
**问题**:
- 统计区域仅显示数字，缺乏趋势
- 没有情报类型分布图表
- 缺少时间线视图

**优化方案**:
```typescript
// 建议实现:
1. 情报趋势折线图（近7天/30天）
2. 情报类型饼图/环形图
3. 关键词词云
4. 时间线视图（Timeline View）
5. 国家分布地图（可选）
```

**推荐库**: Recharts、D3.js、@visx/visx

---

#### 8. 动画与过渡优化
**问题**:
- 卡片入场动画有延迟但不够流畅
- 页面切换无过渡效果
- 筛选切换时内容跳动

**优化方案**:
```typescript
// 建议实现:
1. Framer Motion 页面过渡
2. 卡片列表布局动画（Layout Animation）
3. 筛选切换平滑过渡
4. 骨架屏到内容的淡入过渡
5. 减少动画偏好支持（prefers-reduced-motion）
```

---

### 2.3 低优先级优化

#### 9. 无障碍（Accessibility）改进
**优化项**:
- 键盘导航支持
- 屏幕阅读器优化（ARIA 标签）
- 焦点指示器样式
- 颜色对比度检查

#### 10. PWA 支持
**优化项**:
- Service Worker 离线缓存
- Web App Manifest
- 推送通知（新情报提醒）

#### 11. 主题定制
**优化项**:
- 亮色模式支持
- 字体大小调节
- 紧凑/舒适布局切换

---

## 三、迭代实施计划

### 阶段一：性能与核心体验（预计 2-3 天）

| 任务 | 优先级 | 预估工时 | 文件变更 |
|------|--------|----------|----------|
| 实现虚拟滚动 | P0 | 4h | `page.tsx` |
| 骨架屏加载状态 | P0 | 2h | 新增 `SkeletonCard.tsx` |
| 筛选器粘性 + URL同步 | P0 | 3h | `page.tsx` |
| 卡片布局统一 | P0 | 2h | `page.tsx` |

### 阶段二：阅读体验优化（预计 2 天）

| 任务 | 优先级 | 预估工时 | 文件变更 |
|------|--------|----------|----------|
| 文章目录（TOC） | P1 | 3h | `ReportContent.tsx` |
| 阅读进度条 | P1 | 1h | `page.tsx` |
| 排版优化 | P1 | 2h | `globals.css` |
| 上一篇/下一篇 | P2 | 1h | `page.tsx` |

### 阶段三：响应式与搜索（预计 2-3 天）

| 任务 | 优先级 | 预估工时 | 文件变更 |
|------|--------|----------|----------|
| 移动端筛选器抽屉 | P1 | 3h | 新增 `MobileFilter.tsx` |
| 全文搜索 | P1 | 4h | 新增 `SearchBar.tsx` |
| 响应式网格优化 | P2 | 2h | `page.tsx` |

### 阶段四：数据可视化（预计 2 天）

| 任务 | 优先级 | 预估工时 | 文件变更 |
|------|--------|----------|----------|
| 统计图表组件 | P2 | 4h | 新增 `StatsCharts.tsx` |
| 时间线视图 | P2 | 3h | 新增 `TimelineView.tsx` |

---

## 四、设计参考与灵感

### UI 参考
1. **Notion** - 筛选器设计、侧边栏导航
2. **GitHub** - Issues 列表、标签系统
3. **Linear** - 动画效果、深色模式
4. **Vercel Dashboard** - 卡片设计、统计展示
5. **Stripe Docs** - 文档阅读体验、代码块样式

### 技术参考
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件基座
- [Tailwind UI](https://tailwindui.com/) - 官方组件模板
- [shadcn/ui](https://ui.shadcn.com/) - 可复制粘贴的组件

---

## 五、代码质量建议

### 5.1 组件拆分
当前 `page.tsx` 过于庞大（500+ 行），建议拆分为：

```
components/
├── ReportCard.tsx          # 情报卡片
├── FilterBar.tsx           # 筛选栏
├── Pagination.tsx          # 分页器
├── StatsFooter.tsx         # 统计底部
├── EmptyState.tsx          # 空状态
├── SearchBar.tsx           # 搜索框（新增）
├── MobileFilter.tsx        # 移动端筛选（新增）
├── SkeletonCard.tsx        # 骨架屏（新增）
└── ViewToggle.tsx          # 视图切换（新增）
```

### 5.2 性能优化代码示例

```typescript
// 使用 React.memo 优化卡片渲染
const ReportCard = React.memo(function ReportCard({ report, index }: Props) {
  // ...
});

// 使用 useMemo 缓存筛选结果
const filteredReports = useMemo(() => {
  return reports.filter(...).sort(...);
}, [reports, typeFilter, keywordFilter, searchQuery]);

// 使用 useCallback 缓存事件处理
const handlePageChange = useCallback((page: number) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);
```

### 5.3 类型安全增强

```typescript
// 建议添加更严格的类型
type ContentType = 'daily' | 'brief';
type Category = 'intel' | 'risk';
type Priority = 'high' | 'medium' | 'low';

interface Report {
  id: string;
  type: string;
  contentType: ContentType;
  category: Category;
  priority: Priority;  // 新增
  // ...
}
```

---

## 六、检查清单

部署前请确认：

- [ ] 所有 TypeScript 类型检查通过
- [ ] ESLint 无错误
- [ ] 构建成功 (`next build`)
- [ ] 移动端测试通过（Chrome DevTools）
- [ ] 深色模式显示正常
- [ ] 筛选器功能正常
- [ ] 分页器功能正常
- [ ] Word 下载功能正常
- [ ] 性能评分 > 90 (Lighthouse)

---

## 七、附录

### 当前依赖版本
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "tailwindcss": "^3.x",
  "docx": "^8.x",
  "file-saver": "^2.x"
}
```

### 建议新增依赖
```json
{
  "framer-motion": "^11.x",      // 动画
  "@tanstack/react-virtual": "^3.x",  // 虚拟滚动
  "recharts": "^2.x",            // 图表
  "fuse.js": "^7.x",             // 模糊搜索
  "date-fns": "^3.x"             // 日期处理
}
```

---

*本计划由 africa-intel-dashboard-auto-iteration 任务自动生成*  
*下次迭代检查时间: 2026-02-27 19:30*
