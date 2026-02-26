export interface Report {
  id: string;
  type: string;
  contentType: string;
  title: string;
  time: string;
  summary: string;
  content: string;
  // 日报特有字段 - 包含各时段简报
  briefTimes?: {
    time: string;
    content: string;
  }[];
}

export interface ReportsData {
  reports: Report[];
}
