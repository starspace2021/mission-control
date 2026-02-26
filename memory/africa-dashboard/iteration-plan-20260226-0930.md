# 非洲情报看板 UI/UX 迭代计划

**生成时间**: 2026-02-26 09:30 (Asia/Shanghai)  
**计划版本**: v1.0  
**执行策略**: 计划生成版（等待凌晨3点统一部署）

---

## 1. 当前架构分析

### 1.1 技术栈
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS + 自定义 CSS 变量
- **语言**: TypeScript
- **部署**: Vercel (静态导出)

### 1.2 文件结构
```
intelligence-dashboard/
├── app/
│   ├── page.tsx              # 首页 - 报告列表
│   ├── layout.tsx            # 根布局
│   ├── globals.css           # 全局样式 + 动画
│   └── report/[id]/
│       ├── page.tsx          # 报告详情页
│       └── ReportContent.tsx # 内容渲染组件
├── components/
│   ├── DownloadWordButton.tsx # Word下载按钮
│   └── Header.tsx            # 导航头部
├── types/report.ts           # 类型定义
└── data/reports.json         # 数据文件
```

---

## 2. 检测到的优化项

### 2.1 🔴 高优先级

#### 2.1.1 加载性能优化
**问题**: 
- 页面首屏加载时，所有报告数据一次性加载（reports.json 约 50KB+）
- 没有骨架屏/加载状态，数据量大时会有白屏时间
- 图片资源（如有）没有懒加载优化

**优化方案**:
```typescript
// 1. 实现虚拟滚动或分页数据加载
// 2. 添加骨架屏组件 SkeletonCard
// 3. 使用 next/dynamic 延迟加载非关键组件

// 建议新增组件: components/SkeletonCard.tsx
interface SkeletonCardProps {
  count?: number;
}
```

**预计收益**: 首屏加载时间减少 30-40%

---

#### 2.1.2 搜索与筛选功能
**问题**:
- 当前仅支持分页浏览，无法按关键词搜索
- 无法按日期、类型筛选
- 报告数量增多后，查找困难

**优化方案**:
```typescript
// 新增搜索栏组件 components/SearchBar.tsx
// 支持: 关键词搜索、日期范围、内容类型筛选

interface SearchFilters {
  keyword: string;
  dateFrom?: string;
  dateTo?: string;
  contentType?: 'daily' | 'brief' | 'all';
}
```

**UI位置**: 首页 InfoBanner 下方

---

#### 2.1.3 响应式布局增强
**问题**:
- 当前卡片布局在移动端显示为单列，但间距过大
- 平板设备（768px-1024px）两列布局时卡片过窄
- 字体大小在小屏幕上没有适配

**优化方案**:
```css
/* 改进响应式断点 */
/* 当前: grid-cols-1 md:grid-cols-2 */
/* 建议: */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* 或保持两列但优化间距 */
gap-3 sm:gap-4 lg:gap-6
```

---

### 2.2 🟡 中优先级

#### 2.2.1 简报卡片信息密度
**问题**:
- 简报卡片缺少关键信息预览（如标签、国家/地区）
- 摘要文字两行限制，信息量不足
- 没有视觉区分不同简报时段（10:00/14:00/17:00）

**优化方案**:
```typescript
// ReportCard 组件增强
interface ReportCardProps {
  report: Report;
  index: number;
  showTags?: boolean;      // 新增: 显示标签
  showRegion?: boolean;    // 新增: 显示地区
  expandedSummary?: boolean; // 新增: 展开摘要
}

// 简报时段颜色编码
const briefTimeColors = {
  '10:00': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  '14:00': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  '17:00': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};
```

---

#### 2.2.2 详情页阅读体验
**问题**:
- 长文阅读时没有目录/锚点导航
- 返回顶部按钮缺失
- 代码块/引用样式未定义

**优化方案**:
```typescript
// 新增组件: components/TableOfContents.tsx
// 新增组件: components/BackToTop.tsx
// 增强 ReportContent 的渲染样式

// 目录自动生成（基于内容解析）
interface TOCItem {
  id: string;
  text: string;
  level: number;
}
```

---

#### 2.2.3 深色模式切换
**问题**:
- 当前只有深色主题，不支持浅色模式
- 部分用户可能偏好浅色阅读

**优化方案**:
```typescript
// 使用 next-themes 实现主题切换
// 新增 ThemeToggle 组件
// 更新 tailwind.config.ts 支持 darkMode: 'class'
```

---

### 2.3 🟢 低优先级

#### 2.3.1 交互动画优化
**问题**:
- 卡片入场动画没有使用 Intersection Observer
- 所有卡片同时动画，性能开销大
- 缺少微交互（如点赞、收藏）

**优化方案**:
```typescript
// 使用 Intersection Observer 实现滚动触发
// 新增 hooks/useIntersectionObserver.ts
// 添加收藏功能（本地存储）
```

---

#### 2.3.2 PWA 支持
**问题**:
- 没有 Service Worker
- 无法离线阅读已加载内容
- 缺少 manifest.json

**优化方案**:
```json
// public/manifest.json
{
  "name": "非洲情报看板",
  "short_name": "非洲情报",
  "theme_color": "#0a0a0f",
  "background_color": "#0a0a0f",
  "display": "standalone"
}
```

---

## 3. 迭代计划 Roadmap

### Phase 1: 核心体验（建议立即执行）
- [ ] 添加骨架屏组件
- [ ] 实现搜索功能
- [ ] 优化响应式布局

### Phase 2: 功能增强（建议本周执行）
- [ ] 详情页目录导航
- [ ] 简报时段视觉区分
- [ ] 返回顶部按钮

### Phase 3: 体验优化（建议下周执行）
- [ ] 深色/浅色主题切换
- [ ] PWA 支持
- [ ] 交互动画优化

---

## 4. 代码实现参考

### 4.1 骨架屏组件
```tsx
// components/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="border border-gray-800/60 rounded-2xl p-5 bg-[#111827]/50 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-6 rounded-full bg-gray-700/50" />
        <div className="w-20 h-4 rounded bg-gray-700/50 ml-auto" />
      </div>
      <div className="h-6 bg-gray-700/50 rounded mb-3 w-3/4" />
      <div className="h-4 bg-gray-700/50 rounded mb-2 w-full" />
      <div className="h-4 bg-gray-700/50 rounded w-2/3" />
    </div>
  );
}
```

### 4.2 搜索组件
```tsx
// components/SearchBar.tsx
export function SearchBar({ onSearch }: { onSearch: (filters: SearchFilters) => void }) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="搜索关键词..."
        className="flex-1 min-w-[200px] px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
      />
      <select className="px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200">
        <option value="all">全部类型</option>
        <option value="daily">日报</option>
        <option value="brief">简报</option>
      </select>
    </div>
  );
}
```

---

## 5. 性能基准

### 当前状态（估算）
| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| 首屏加载 | ~2.5s | <1.5s |
| 交互响应 | ~200ms | <100ms |
| Lighthouse 性能分 | ~75 | >90 |
| 可访问性 | ~85 | >95 |

### 优化后预期
- 骨架屏减少感知加载时间 40%
- 搜索功能提升用户效率 60%
- 响应式优化提升移动端体验

---

## 6. 部署注意事项

1. **数据文件**: reports.json 更新时需同步更新
2. **静态导出**: 确保 `next.config.js` 配置正确
3. **缓存策略**: 建议对静态资源设置长期缓存
4. **回滚方案**: 保留上一版本 dist 目录

---

## 7. 相关文件

- 源码目录: `/root/.openclaw/workspace/intelligence-dashboard/`
- 部署历史: `/root/.openclaw/workspace/mission-control-dist-v*/`
- 任务看板: `/root/.openclaw/workspace/MISSION_CONTROL.md`

---

**备注**: 本计划仅作为迭代参考，实际执行需根据用户反馈调整优先级。

**下次迭代检查**: 2026-02-27 09:00
