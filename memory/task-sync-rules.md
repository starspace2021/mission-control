# 任务同步规则

## 规则
当用户增删或修改定时任务时，必须同步更新 Mission Control 网站。

## 更新内容
- 任务看板（进行中/已完成任务）
- 定时任务数量统计
- 今日日程时间线
- 任务标签和优先级

## 工作流程
1. 用户调整任务
2. 更新代码中的 mockTasks / mockEvents / mockStats
3. 构建项目
4. 推送到 GitHub
5. Vercel 自动部署

## 当前任务列表
- 非洲涉华情报收集系统（每日5次）
- Polymarket 监控（每日5次）
- QQ邮箱自动清理（每日1次）
- Mission Control 系统开发

## 网站地址
https://mission-control-sigma-six.vercel.app/
