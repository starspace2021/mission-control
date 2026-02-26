export interface Report {
  id: string;
  type: string;
  title: string;
  time: string;
  summary: string;
  content: string;
}

export interface ReportsData {
  reports: Report[];
}
