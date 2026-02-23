---
name: mission-control-ui-designer
description: Optimize Mission Control website UI to modern professional console style. Capabilities: analyze current UI structure, refactor to console style, optimize layout, colors, components, improve information density. Reference designs: Vercel Dashboard, Palantir Foundry, Linear, OpenAI Dashboard. Uses React + TailwindCSS. Outputs new dist files, changelog, and optimization notes on each execution.
---

# Mission Control UI Designer

## Purpose
负责优化 Mission Control 网站 UI，使其达到现代专业控制台级别。

## 能力

### 1. 自动分析当前 UI 结构
- 读取 page.tsx 分析组件结构
- 读取 globals.css 分析样式系统
- 识别可优化点

### 2. 重构为现代控制台风格
- 深色主题优先
- 卡片式布局
- 清晰层级结构
- 专业数据展示

### 3. 优化布局结构
- 网格系统优化
- 响应式适配
- 信息密度提升
- 视觉层级清晰

### 4. 优化配色
- 主色调：深黑 (#0A0A0A)
- 强调色：根据场景选择
  - 金色 (#FFD700) - 高优先级
  - 青色 (#00D4AA) - 成功/在线
  - 红色 (#FF4444) - 警告/错误
  - 蓝色 (#3B82F6) - 信息/链接

### 5. 优化组件结构
- 原子化设计
- 可复用组件
- 类型安全
- 性能优化

### 6. 提高信息密度和可读性
- 紧凑布局
- 清晰字体层级
- 数据可视化
- 状态指示明确

## 设计风格目标

### 参考产品
- **Vercel Dashboard**: 简洁、现代、开发者友好
- **Palantir Foundry**: 数据密集、专业、功能强大
- **Linear**: 流畅、精致、极致体验
- **OpenAI Dashboard**: 科技感、清晰、高效

### 设计原则
1. **信息优先**: 数据一目了然
2. **操作高效**: 减少点击和滚动
3. **视觉清晰**: 减少装饰，突出内容
4. **反馈即时**: 状态变化实时可见

## 技术规范

### 优先使用
- **React 19**: 最新特性，性能优化
- **TailwindCSS**: 原子化样式，快速迭代
- **Framer Motion**: 流畅动画
- **Lucide Icons**: 统一图标风格

### 组件结构
```
components/
├── ui/           # 基础组件
├── layout/       # 布局组件
├── dashboard/    # 仪表盘组件
├── tasks/        # 任务组件
└── charts/       # 图表组件
```

## 执行流程

### 每次执行时：

1. **分析阶段**
   ```bash
   # 读取当前代码
   - page.tsx
   - globals.css
   - components/*
   ```

2. **设计阶段**
   - 确定优化目标
   - 选择参考风格
   - 规划组件结构

3. **实现阶段**
   - 更新样式系统
   - 重构组件
   - 添加动画效果

4. **构建阶段**
   ```bash
   npm run build
   ```

5. **部署阶段**
   ```bash
   git add .
   git commit -m "UI优化: [描述]"
   git push origin master:main
   ```

6. **输出**
   - ✅ 新的 dist 文件
   - ✅ 更新日志 (memory/ui_changelog.md)
   - ✅ 优化说明

## 输出规范

### 更新日志格式
```markdown
## YYYY-MM-DD HH:MM

### 优化内容
- [类型] 具体改动

### 效果
- 改进前: ...
- 改进后: ...

### 参考
- Vercel Dashboard [链接]
```

### 优化说明
- 改动范围
- 技术细节
- 用户体验改进

## 项目信息

- **路径**: `/root/.openclaw/workspace/mission-control/`
- **部署**: https://mission-control-sigma-six.vercel.app/
- **仓库**: https://github.com/starspace2021/mission-control

## 当前状态

- 框架: Next.js 16 + React 19
- 样式: TailwindCSS + 自定义 CSS
- 主题: 黑金配色
- 动画: Framer Motion
