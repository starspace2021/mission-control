import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportsData, Report } from "../../../types/report";
import reportsData from "../../../data/reports.json";
import { ReportContent } from "./ReportContent";
import { DownloadWordButton } from "../../../components/DownloadWordButton";
import { Header } from "../../../components/Header";

const typedReportsData: ReportsData = reportsData;

export function generateStaticParams() {
  return typedReportsData.reports.map((report) => ({
    id: report.id,
  }));
}

function getContentTypeLabel(contentType: string): string {
  switch (contentType) {
    case "daily":
      return "日报";
    case "brief":
      return "简报";
    default:
      return "其他";
  }
}

function getContentTypeColor(contentType: string): string {
  switch (contentType) {
    case "daily":
      return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    case "brief":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    default:
      return "text-gray-400 border-gray-400/30 bg-gray-400/10";
  }
}

// 获取简报的时间标签（从内容或标题中提取）
function getBriefTime(report: Report): string {
  // 从标题中提取时间，如 "非洲情报 17:00 简报"
  const timeMatch = report.title.match(/(\d{2}:\d{2})/);
  if (timeMatch) {
    return timeMatch[1];
  }
  // 从time字段提取
  const timePart = report.time.split(" ")[1];
  return timePart || "";
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const report = typedReportsData.reports.find((r) => r.id === params.id);

  if (!report) {
    notFound();
  }

  const isDaily = report.contentType === "daily";
  const briefTime = getBriefTime(report);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 px-4 py-2 rounded-xl border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/30 transition-all duration-200 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回列表
        </Link>

        <article className="border border-gray-700/50 rounded-2xl p-8 bg-gradient-to-br from-[#111827]/95 via-[#0d1117]/80 to-[#0a0a0f]/60 shadow-2xl shadow-black/30 animate-fade-in">
          {/* Header Section */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-6 border-b border-gray-800/60">
            <div className="flex items-center gap-4">
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium backdrop-blur-sm ${getContentTypeColor(report.contentType || "brief")}`}>
                {getContentTypeLabel(report.contentType || "brief")}
              </span>
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time className="text-sm font-mono">{report.time}</time>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDaily && <DownloadWordButton report={report} />}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-100 mb-10 leading-tight">{report.title}</h1>

          {/* Content */}
          <ReportContent 
            report={report} 
            isDaily={isDaily} 
            briefTime={briefTime} 
          />
        </article>
      </main>
    </div>
  );
}