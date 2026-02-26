"use client";

import { Report } from "../../../types/report";
import { DownloadWordButton } from "../../../components/DownloadWordButton";

interface ReportContentProps {
  report: Report;
  isDaily: boolean;
  briefTime: string;
}

// 内容块类型
interface ContentBlock {
  type: 'title' | 'section' | 'subsection' | 'list' | 'divider' | 'paragraph' | 'empty';
  content: string;
  level?: number;
}

// 解析内容为结构化块
function parseContent(content: string): ContentBlock[] {
  const lines = content.split('\n');
  const blocks: ContentBlock[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      blocks.push({ type: 'empty', content: '' });
      continue;
    }
    
    // 【xxx】标题
    if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
      blocks.push({ type: 'title', content: trimmed });
      continue;
    }
    
    // === xxx === 分隔符
    if (trimmed.startsWith('===') && trimmed.endsWith('===')) {
      blocks.push({ type: 'divider', content: trimmed.replace(/===/g, '').trim() });
      continue;
    }
    
    // 一级标题 一、xxx
    if (/^[一二三四五六七八九十]+、/.test(trimmed)) {
      blocks.push({ type: 'section', content: trimmed });
      continue;
    }
    
    // 列表项 1. xxx 或 - xxx
    if (/^\d+\./.test(trimmed) || trimmed.startsWith('- ')) {
      blocks.push({ type: 'list', content: trimmed });
      continue;
    }
    
    // 普通段落
    blocks.push({ type: 'paragraph', content: trimmed });
  }
  
  return blocks;
}

export function ReportContent({ report, isDaily, briefTime }: ReportContentProps) {
  const blocks = parseContent(report.content);
  
  // 提取日报中的简报时间
  const getBriefTimeFromTitle = (content: string): string | null => {
    const match = content.match(/【(\d{2}:\d{2})\s*简报要点】/);
    return match ? match[1] : null;
  };

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {/* 简报时间标签 */}
      {!isDaily && briefTime && (
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-gray-500 text-sm block">简报时间</span>
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-emerald-500/15 text-emerald-400 rounded-lg border border-emerald-500/20">
              {briefTime}
            </span>
          </div>
        </div>
      )}

      {/* 内容渲染 */}
      <div className="space-y-2">
        {blocks.map((block, index) => {
          switch (block.type) {
            case 'empty':
              return <div key={index} className="h-4" />;
              
            case 'title':
              const briefTimeInTitle = getBriefTimeFromTitle(block.content);
              if (briefTimeInTitle) {
                return (
                  <div key={index} className="flex items-center gap-4 my-6 py-3 px-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <span className="inline-flex items-center justify-center w-16 h-8 text-sm font-semibold bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                      {briefTimeInTitle}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-100 m-0">
                      简报要点
                    </h2>
                  </div>
                );
              }
              return (
                <h2 key={index} className="text-2xl font-bold text-gray-100 mt-10 mb-6 pb-3 border-b border-gray-800/40">
                  {block.content}
                </h2>
              );
              
            case 'divider':
              return (
                <div key={index} className="my-8 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                    <span className="text-sm text-gray-500 font-medium px-4 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/30">
                      {block.content}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                  </div>
                </div>
              );
              
            case 'section':
              return (
                <h3 key={index} className="text-lg font-semibold text-gray-200 mt-8 mb-4 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full" />
                  {block.content}
                </h3>
              );
              
            case 'list':
              const listContent = block.content.startsWith('- ') 
                ? block.content.substring(2) 
                : block.content.replace(/^\d+\.\s*/, '');
              const listNumber = block.content.match(/^\d+/)?.[0];
              return (
                <div key={index} className="flex gap-4 py-2 group/item hover:bg-gray-800/20 rounded-xl px-3 -mx-3 transition-colors">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-mono border border-gray-700/50 group-hover/item:border-gray-600 transition-colors">
                    {listNumber || '•'}
                  </span>
                  <p className="text-gray-400 leading-relaxed m-0 text-base">
                    {listContent}
                  </p>
                </div>
              );
              
            case 'paragraph':
            default:
              return (
                <p key={index} className="text-gray-400 leading-relaxed py-1.5 text-base">
                  {block.content}
                </p>
              );
          }
        })}
      </div>
    </div>
  );
}
