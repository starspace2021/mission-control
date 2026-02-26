# 情报看板 | Intelligence Dashboard

一个简单的文字版情报看板网页，聚焦非洲情报和中国对非政策。

## 页面结构

```
/
├── 首页 - 简报流列表（全部）
├── /africa - 非洲情报列表
├── /china-policy - 中国政策监控列表
└── /report/[id] - 简报详情页
```

## 内容分类

1. **非洲情报** (Africa Intel)
   - 每日多次简报（07:00, 10:00, 14:00, 17:00, 20:00）
   - 聚焦中非合作、非洲政治经济动态

2. **中国政策** (China Policy)
   - 中国对非政策、经贸合作政策动态

## 技术栈

- Next.js 14 (静态导出)
- TypeScript
- Tailwind CSS

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 构建

```bash
npm run build
```

静态文件将输出到 `dist/` 目录。

## 部署到 Vercel

### 方法一：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方法二：使用 Git 集成

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 控制台导入项目
3. 配置构建设置：
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 Deploy

## 数据格式

简报数据存储在 `data/reports.json`，格式如下：

```json
{
  "reports": [
    {
      "id": "africa-20260225-2000",
      "type": "africa",
      "title": "非洲情报 20:00 简报",
      "time": "2026-02-25 20:00",
      "summary": "概要内容（约100字）...",
      "content": "完整内容..."
    }
  ]
}
```

## 样式

- 深色主题 (Mission Control 风格)
- 非洲情报标签：绿色
- 中国政策标签：蓝色
- 响应式设计
