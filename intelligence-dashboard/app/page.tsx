"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ReportsData, Report } from "../types/report";
import reportsData from "../data/reports.json";
import { DownloadWordButton } from "../components/DownloadWordButton";
import { Header } from "../components/Header";

const typedReportsData: ReportsData = reportsData;
const ITEMS_PER_PAGE = 12;

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

function getContentTypeIcon(contentType: string): string {
  switch (contentType) {
    case "daily":
      return "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z";
    case "brief":
      return "M13 10V3L4 14h7v7l9-11h-7z";
    default:
      return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
  }
}

function ReportCard({ report, index }: { report: Report; index: number }) {
  const isDaily = report.contentType === "daily";
  
  // 提取简报时间
  const getBriefTime = () => {
    const match = report.title.match(/(\d{2}:\d{2})/);
    return match ? match[1] : null;
  };
  
  const briefTime = getBriefTime();
  const staggerDelay = (index % 6) * 0.05;
  
  return (
    <article 
      className="group relative border border-gray-800/60 rounded-2xl p-5 bg-gradient-to-br from-[#111827]/95 via-[#0d1117]/80 to-[#0a0a0f]/60 hover:border-gray-600/70 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      style={{ 
        animationDelay: `${staggerDelay}s`,
        animationFillMode: 'both'
      }}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-transparent to-emerald-500/0 group-hover:from-blue-500/8 group-hover:to-emerald-500/5 transition-all duration-500 pointer-events-none" />
      
      {/* Top accent line */}
      <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${isDaily ? 'via-amber-500/50' : 'via-emerald-500/50'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <Link href={`/report/${report.id}`} className="block relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium backdrop-blur-sm ${getContentTypeColor(report.contentType)}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getContentTypeIcon(report.contentType)} />
            </svg>
            {getContentTypeLabel(report.contentType)}
          </span>
          {briefTime && !isDaily && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-400 font-mono border border-gray-700/50">
              {briefTime}
            </span>
          )}
          <time className="text-sm text-gray-500 font-mono ml-auto flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {report.time.split(' ')[0]}
          </time>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-100 mb-3 group-hover:text-blue-400 transition-colors duration-300 line-clamp-1">{report.title}</h2>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-2 min-h-[2.5rem]">{report.summary}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-800/40">
          <span className="text-blue-400 group-hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300">
            查看详情 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          {isDaily && (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              支持Word下载
            </span>
          )}
        </div>
      </Link>
      
      {isDaily && (
        <div className="mt-4 pt-4 border-t border-gray-800/60 relative z-10">
          <DownloadWordButton report={report} />
        </div>
      )}
    </article>
  );
}

function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-gray-800/60 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-100 tracking-tight">
                非洲情报看板
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Africa Intelligence</p>
            </div>
          </div>
          <a 
            href="https://africa-intel-dashboard.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800/50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            访问站点
          </a>
        </div>
      </div>
    </header>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2.5 text-sm rounded-xl border border-gray-700/60 bg-gray-800/30 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        上一页
      </button>

      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`min-w-[40px] h-10 text-sm rounded-xl border transition-all duration-200 ${
              page === currentPage
                ? "border-blue-500/50 bg-blue-500/15 text-blue-400 font-medium shadow-lg shadow-blue-500/10"
                : page === "..."
                ? "border-transparent text-gray-500 cursor-default"
                : "border-gray-700/60 bg-gray-800/30 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:border-gray-600"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2.5 text-sm rounded-xl border border-gray-700/60 bg-gray-800/30 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
      >
        下一页
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function Stats({ reports }: { reports: Report[] }) {
  const today = new Date().toISOString().split("T")[0];
  const todayReports = reports.filter((r) => r.time.startsWith(today));
  const briefCount = todayReports.filter((r) => r.contentType === "brief").length;
  const dailyCount = todayReports.filter((r) => r.contentType === "daily").length;
  const totalCount = reports.length;

  const stats = useMemo(() => [
    { label: "今日简报", value: briefCount, color: "emerald", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { label: "今日日报", value: dailyCount, color: "amber", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
    { label: "总计情报", value: totalCount, color: "blue", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ], [briefCount, dailyCount, totalCount]);

  return (
    <footer className="border-t border-gray-800/60 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 bg-gray-800/40 px-4 py-2.5 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <svg className={`w-4 h-4 text-${stat.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">{stat.label}</span>
                  <span className={`font-mono font-semibold text-${stat.color}-400 text-lg leading-none`}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800/30 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>最后更新: {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InfoBanner() {
  return (
    <div className="mb-8 p-5 bg-gradient-to-r from-blue-500/5 via-gray-800/30 to-emerald-500/5 border border-gray-700/50 rounded-2xl animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-800/80 flex items-center justify-center border border-gray-700/50">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-300 font-medium text-sm">聚焦中非合作、非洲政治经济动态</p>
            <p className="text-gray-500 text-xs mt-0.5">实时追踪涉非情报与战略分析</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 text-xs font-medium">简报</span>
            <span className="text-gray-500 text-xs">10:00 / 14:00 / 17:00</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-amber-400 text-xs font-medium">日报</span>
            <span className="text-gray-500 text-xs">20:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 border border-dashed border-gray-700/50 rounded-2xl bg-gradient-to-b from-gray-800/20 to-transparent animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-800/50 flex items-center justify-center border border-gray-700/50">
        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p className="text-gray-400 font-medium mb-2">暂无情报数据</p>
      <p className="text-gray-600 text-sm">请稍后再来查看</p>
    </div>
  );
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);

  // 只显示非洲情报，按时间倒序排列
  const africaReports = useMemo(() => {
    return typedReportsData.reports
      .filter((r) => r.type === "africa")
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, []);

  const totalPages = Math.ceil(africaReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = africaReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <HomeHeader />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-8 w-full">
        <InfoBanner />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedReports.length > 0 ? (
            paginatedReports.map((report, index) => (
              <ReportCard key={report.id} report={report} index={index} />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState />
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      <Stats reports={africaReports} />
    </div>
  );
}
